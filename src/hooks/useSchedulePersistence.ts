import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Department, DEPARTMENTS, Employee, buildStoreData, generateDefaultSchedule } from '@/data/stores';

// Fetch all employees with pagination
async function fetchAllEmployees(filters: Record<string, string | number>) {
  const PAGE = 1000;
  let allData: any[] = [];
  let from = 0;
  while (true) {
    let q: any = supabase.from('employees').select('*').range(from, from + PAGE - 1);
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
    const { data, error } = await q;
    if (error) { console.error('Fetch employees error:', error); break; }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allData;
}

// Fetch all schedule entries with pagination
async function fetchAllScheduleEntries(filters: Record<string, string | number>) {
  const PAGE = 1000;
  let allData: any[] = [];
  let from = 0;
  while (true) {
    let q: any = supabase.from('schedule_entries').select('*').range(from, from + PAGE - 1);
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
    const { data, error } = await q;
    if (error) { console.error('Fetch schedule_entries error:', error); break; }
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < PAGE) break;
    from += PAGE;
  }
  return allData;
}

// Delete all schedule entries matching filters (loops to bypass 1000-row limit)
async function deleteAllScheduleEntries(filters: Record<string, string | number>) {
  let retries = 0;
  while (retries < 20) {
    let q: any = supabase.from('schedule_entries').delete();
    for (const [k, v] of Object.entries(filters)) q = q.eq(k, v);
    const { error } = await q;
    if (error) { console.error('Delete schedule_entries error:', error); break; }
    // Check if rows remain
    let checkQ: any = supabase.from('schedule_entries').select('id', { count: 'exact', head: true });
    for (const [k, v] of Object.entries(filters)) checkQ = checkQ.eq(k, v);
    const { count } = await checkQ;
    if (!count || count === 0) break;
    retries++;
  }
}

// Batch upsert schedule entries
async function batchUpsertSchedule(rows: any[], batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await (supabase.from('schedule_entries') as any).upsert(batch, { onConflict: 'store_id,employee_id,day,month,year' });
    if (error) console.error(`Upsert schedule batch ${i} error:`, error);
  }
}

// Batch insert employees
async function batchInsertEmployees(rows: any[], batchSize = 500) {
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const { error } = await supabase.from('employees').insert(batch as any);
    if (error) console.error(`Insert employees batch ${i} error:`, error);
  }
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
        await batchInsertEmployees(rows, 500);
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
          if (!sched[dept]) sched[dept] = {};
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
        await batchUpsertSchedule(allEntries, 500);
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
    supabase.from('schedule_entries').upsert({
      store_id: storeId,
      departamento: dept,
      employee_id: employeeId,
      day,
      month,
      year,
      shift_code: value,
    }, { onConflict: 'store_id,employee_id,day,month,year' }).then(({ error }) => {
      if (error) console.error('Upsert shift error:', error);
    });
  }, [storeId, month, year]);

  // Add employee
  const addEmployee = useCallback((emp: Employee) => {
    if (!storeId) return;
    const dept = emp.departamento;
    setEmployeesByDept(prev => ({
      ...prev,
      [dept]: [...(prev[dept] || []), emp],
    }));
    supabase.from('employees').upsert({
      id: emp.id,
      store_id: storeId,
      departamento: emp.departamento,
      codigo: emp.codigo,
      nombre: emp.nombre,
      actividad: emp.actividad,
    }).then(({ error }) => {
      if (error) console.error('Insert employee error:', error);
    });
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
    batchUpsertSchedule(entries, 500);
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
    supabase.from('employees').delete().eq('id', empId).eq('store_id', storeId).then();
    supabase.from('schedule_entries').delete().eq('employee_id', empId).eq('store_id', storeId).then();
  }, [storeId]);

  // Regenerate schedules
  const regenerate = useCallback(async () => {
    if (!storeId) return;
    // Delete ALL existing schedule entries for this month (handles >1000 rows)
    await deleteAllScheduleEntries({ store_id: storeId, year, month });

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
    await batchUpsertSchedule(allEntries, 500);
    setSchedules(next as any);
  }, [employeesByDept, year, month, storeId]);

  // Clear all schedule data for this store/month
  const clearScheduleData = useCallback(async () => {
    if (!storeId) return;
    await deleteAllScheduleEntries({ store_id: storeId, year, month });
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
