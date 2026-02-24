import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department, DEPARTMENTS, Employee, buildStoreData, generateDefaultSchedule } from '@/data/stores';

// Fetch all rows paginating past the 1000-row default limit
async function fetchAllEmployees(filters: Record<string, string | number>) {
  const PAGE = 1000;
  let allData: any[] = [];
  let from = 0;
  while (true) {
    let q: any = supabase.from('employees').select('*').range(from, from + PAGE - 1);
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
    const { data } = await q;
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allData;
}

async function fetchAllScheduleEntries(filters: Record<string, string | number>) {
  const PAGE = 1000;
  let allData: any[] = [];
  let from = 0;
  while (true) {
    let q: any = supabase.from('schedule_entries').select('*').range(from, from + PAGE - 1);
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
    const { data } = await q;
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allData;
}

export function useSchedulePersistence(storeId: string | undefined, year: number, month: number) {
  const [employeesByDept, setEmployeesByDept] = useState<Record<Department, Employee[]>>({} as any);
  const [schedules, setSchedules] = useState<Record<Department, Record<string, Record<number, string>>>>({} as any);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Load from DB or generate defaults
  useEffect(() => {
    if (!storeId) return;
    let cancelled = false;

    async function load() {
      setLoading(true);

      // Check if employees exist in DB for this store
      const dbEmployees = await fetchAllEmployees({ store_id: storeId });

      if (cancelled) return;

      let empByDept: Record<Department, Employee[]>;

      if (dbEmployees && dbEmployees.length > 0) {
        // Load from DB
        empByDept = { Mercado: [], Hogar: [], Electro: [], Caja: [] };
        dbEmployees.forEach((row: any) => {
          const dept = row.departamento as Department;
          if (empByDept[dept]) {
            empByDept[dept].push({
              id: row.id,
              codigo: row.codigo,
              nombre: row.nombre,
              actividad: row.actividad,
              departamento: dept,
            });
          }
        });
      } else {
        // Generate defaults and save to DB
        const storeData = buildStoreData(storeId);
        empByDept = { ...storeData };

        // Batch insert employees
        const rows = DEPARTMENTS.flatMap(dept =>
          storeData[dept].map(emp => ({
            id: emp.id,
            store_id: storeId,
            departamento: emp.departamento,
            codigo: emp.codigo,
            nombre: emp.nombre,
            actividad: emp.actividad,
          }))
        );
        await supabase.from('employees').insert(rows);
      }

      setEmployeesByDept(empByDept);

      // Load schedules from DB
      const dbSchedule = await fetchAllScheduleEntries({ store_id: storeId, year, month });

      if (cancelled) return;

      let sched: Record<Department, Record<string, Record<number, string>>>;

      if (dbSchedule && dbSchedule.length > 0) {
        sched = { Mercado: {}, Hogar: {}, Electro: {}, Caja: {} };
        dbSchedule.forEach((row: any) => {
          const dept = row.departamento as Department;
          if (!sched[dept][row.employee_id]) sched[dept][row.employee_id] = {};
          sched[dept][row.employee_id][row.day] = row.shift_code;
        });
      } else {
        // Generate defaults and save
        sched = {} as any;
        const allEntries: any[] = [];
        DEPARTMENTS.forEach(dept => {
          sched[dept] = generateDefaultSchedule(empByDept[dept] || [], year, month);
          Object.entries(sched[dept]).forEach(([empId, days]) => {
            Object.entries(days).forEach(([day, shift]) => {
              allEntries.push({
                store_id: storeId,
                departamento: dept,
                employee_id: empId,
                day: Number(day),
                month,
                year,
                shift_code: shift as string,
              });
            });
          });
        });
        // Insert in batches of 500
        for (let i = 0; i < allEntries.length; i += 500) {
          await supabase.from('schedule_entries').insert(allEntries.slice(i, i + 500));
        }
      }

      setSchedules(sched as any);
      setLoading(false);
      setInitialized(true);
    }

    load();
    return () => { cancelled = true; };
  }, [storeId, year, month]);

  // Change a single shift
  const changeShift = useCallback((dept: Department, employeeId: string, day: number, value: string) => {
    if (!storeId) return;
    setSchedules(prev => ({
      ...prev,
      [dept]: {
        ...prev[dept],
        [employeeId]: {
          ...prev[dept]?.[employeeId],
          [day]: value,
        },
      },
    }));
    // Upsert to DB
    supabase.from('schedule_entries').upsert({
      store_id: storeId,
      departamento: dept,
      employee_id: employeeId,
      day,
      month,
      year,
      shift_code: value,
    }, { onConflict: 'store_id,employee_id,day,month,year' }).then();
  }, [storeId, month, year]);

  // Add employee
  const addEmployee = useCallback((emp: Employee) => {
    if (!storeId) return;
    const dept = emp.departamento;
    setEmployeesByDept(prev => ({
      ...prev,
      [dept]: [...(prev[dept] || []), emp],
    }));
    // Save to DB
    supabase.from('employees').insert({
      id: emp.id,
      store_id: storeId,
      departamento: emp.departamento,
      codigo: emp.codigo,
      nombre: emp.nombre,
      actividad: emp.actividad,
    }).then();
    // Initialize schedule
    const daysInMonth = new Date(year, month, 0).getDate();
    const empSchedule: Record<number, string> = {};
    const entries: any[] = [];
    for (let d = 1; d <= daysInMonth; d++) {
      empSchedule[d] = 'A1';
      entries.push({
        store_id: storeId,
        departamento: dept,
        employee_id: emp.id,
        day: d,
        month,
        year,
        shift_code: 'A1',
      });
    }
    setSchedules(prev => ({
      ...prev,
      [dept]: { ...(prev[dept] || {}), [emp.id]: empSchedule },
    }));
    supabase.from('schedule_entries').insert(entries).then();
  }, [storeId, year, month]);

  // Remove employee
  const removeEmployee = useCallback((dept: Department, empId: string) => {
    if (!storeId) return;
    setEmployeesByDept(prev => ({
      ...prev,
      [dept]: prev[dept].filter(e => e.id !== empId),
    }));
    setSchedules(prev => {
      const deptSched = { ...(prev[dept] || {}) };
      delete deptSched[empId];
      return { ...prev, [dept]: deptSched };
    });
    // Remove from DB
    supabase.from('employees').delete().eq('id', empId).eq('store_id', storeId).then();
    supabase.from('schedule_entries').delete().eq('employee_id', empId).eq('store_id', storeId).then();
  }, [storeId]);

  // Regenerate schedules
  const regenerate = useCallback(async () => {
    if (!storeId) return;
    // Delete existing schedule entries for this month
    await supabase.from('schedule_entries').delete()
      .eq('store_id', storeId).eq('year', year).eq('month', month);

    const next: Record<string, any> = {};
    const allEntries: any[] = [];
    DEPARTMENTS.forEach(dept => {
      next[dept] = generateDefaultSchedule(employeesByDept[dept] || [], year, month);
      Object.entries(next[dept]).forEach(([empId, days]: [string, any]) => {
        Object.entries(days).forEach(([day, shift]) => {
          allEntries.push({
            store_id: storeId,
            departamento: dept,
            employee_id: empId,
            day: Number(day),
            month,
            year,
            shift_code: shift as string,
          });
        });
      });
    });
    for (let i = 0; i < allEntries.length; i += 500) {
      await supabase.from('schedule_entries').insert(allEntries.slice(i, i + 500));
    }
    setSchedules(next as any);
  }, [employeesByDept, year, month, storeId]);

  // Clear all schedule data for this store/month (after export/print)
  const clearScheduleData = useCallback(async () => {
    if (!storeId) return;
    await supabase.from('schedule_entries').delete()
      .eq('store_id', storeId).eq('year', year).eq('month', month);
    // Reset local state to empty
    const empty: Record<string, any> = {};
    DEPARTMENTS.forEach(dept => { empty[dept] = {}; });
    setSchedules(empty as any);
  }, [storeId, year, month]);

  return {
    employeesByDept,
    schedules,
    loading,
    initialized,
    changeShift,
    addEmployee,
    removeEmployee,
    regenerate,
    clearScheduleData,
  };
}
