import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, Department, buildStoreData, Employee, generateDefaultSchedule } from '@/data/stores';
import ScheduleTable from '@/components/ScheduleTable';
import EmployeeManager from '@/components/EmployeeManager';
import { exportToExcel, printSchedule } from '@/utils/exportUtils';
import AIChatPanel from '@/components/AIChatPanel';
import { Button } from '@/components/ui/button';
import {
  Building2, LogOut, Download, Printer, Calendar,
  Users, RefreshCw, ChevronLeft, ChevronRight, UserCog
} from 'lucide-react';

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function Dashboard() {
  const { currentStore, logout } = useAuth();
  const [activeDept, setActiveDept] = useState<Department>('Electro');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [showManager, setShowManager] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Build initial store data
  const storeData = currentStore ? buildStoreData(currentStore.id) : null;

  // Editable employees state per department
  const [employeesByDept, setEmployeesByDept] = useState<Record<Department, Employee[]>>(() => {
    if (!storeData) return {} as any;
    return { ...storeData };
  });

  // Schedule state per department
  const [schedules, setSchedules] = useState<Record<Department, Record<string, Record<number, string>>>>(() => {
    if (!storeData) return {} as any;
    const init: Record<string, any> = {};
    DEPARTMENTS.forEach(dept => {
      init[dept] = generateDefaultSchedule(storeData![dept], year, month);
    });
    return init as Record<Department, Record<string, Record<number, string>>>;
  });

  // Regenerate schedule for all departments
  const regenerate = useCallback(() => {
    const next: Record<string, any> = {};
    DEPARTMENTS.forEach(dept => {
      next[dept] = generateDefaultSchedule(employeesByDept[dept] || [], year, month);
    });
    setSchedules(next as any);
  }, [employeesByDept, year, month]);

  const handleScheduleChange = (employeeId: string, day: number, value: string) => {
    setSchedules(prev => ({
      ...prev,
      [activeDept]: {
        ...prev[activeDept],
        [employeeId]: {
          ...prev[activeDept][employeeId],
          [day]: value,
        },
      },
    }));
  };

  // Add employee
  const handleAddEmployee = (emp: Employee) => {
    const dept = emp.departamento;
    setEmployeesByDept(prev => ({
      ...prev,
      [dept]: [...(prev[dept] || []), emp],
    }));
    // Initialize schedule for new employee
    const daysInMonth = new Date(year, month, 0).getDate();
    const empSchedule: Record<number, string> = {};
    for (let d = 1; d <= daysInMonth; d++) empSchedule[d] = 'A1';
    setSchedules(prev => ({
      ...prev,
      [dept]: { ...(prev[dept] || {}), [emp.id]: empSchedule },
    }));
  };

  // Remove employee
  const handleRemoveEmployee = (empId: string) => {
    setEmployeesByDept(prev => ({
      ...prev,
      [activeDept]: prev[activeDept].filter(e => e.id !== empId),
    }));
    setSchedules(prev => {
      const deptSched = { ...(prev[activeDept] || {}) };
      delete deptSched[empId];
      return { ...prev, [activeDept]: deptSched };
    });
  };

  if (!currentStore || !storeData) return null;

  const employees = employeesByDept[activeDept] || [];
  const schedule = schedules[activeDept] || {};

  const deptStats = DEPARTMENTS.map(dept => ({
    dept,
    count: (employeesByDept[dept] || []).length,
    shifts: Object.values(schedules[dept] || {}).reduce((acc, empDays) => {
      Object.values(empDays).forEach(shift => {
        acc[shift] = (acc[shift] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>),
  }));

  const currentStats = deptStats.find(d => d.dept === activeDept);
  const libreCount = currentStats?.shifts['LIBRE'] || 0;
  const compCount = currentStats?.shifts['COMP'] || 0;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'hsl(var(--background))' }}>
      {/* Top Navbar */}
      <header className="flex items-center justify-between px-6 py-3 shadow-md no-print"
        style={{ background: 'hsl(214 65% 14%)', borderBottom: '1px solid hsl(214 50% 22%)' }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm tracking-wide">SchedPro</div>
            <div className="text-white/50 text-[10px] uppercase tracking-wider">{currentStore.name}</div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Month navigation */}
          <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg"
            style={{ background: 'hsl(214 50% 22%)' }}>
            <button
              onClick={() => { if (month === 1) { setMonth(12); setYear(y => y - 1); } else setMonth(m => m - 1); }}
              className="text-white/70 hover:text-white p-0.5">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <Calendar className="w-4 h-4 text-white/70 mx-1" />
            <span className="text-white text-sm font-medium px-1">
              {MONTHS_ES[month]} {year}
            </span>
            <button
              onClick={() => { if (month === 12) { setMonth(1); setYear(y => y + 1); } else setMonth(m => m + 1); }}
              className="text-white/70 hover:text-white p-0.5">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <Button onClick={regenerate} variant="ghost" size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
            <RefreshCw className="w-3.5 h-3.5" />
            Regenerar
          </Button>

          <Button
            onClick={() => exportToExcel(currentStore.name, activeDept, employees, schedule, year, month)}
            variant="ghost" size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Excel
          </Button>

          <Button
            onClick={() => printSchedule(currentStore.name, activeDept, month, year)}
            variant="ghost" size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
            <Printer className="w-3.5 h-3.5" />
            Cartelera
          </Button>

          <div className="w-px h-5 mx-1 opacity-30" style={{ background: 'white' }} />

          <Button onClick={logout} variant="ghost" size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
            <LogOut className="w-3.5 h-3.5" />
            Salir
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-60 flex-shrink-0 flex flex-col py-4 px-3 no-print"
          style={{ background: 'hsl(214 60% 11%)', borderRight: '1px solid hsl(214 50% 18%)' }}>
          <div className="mb-4 px-2">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'hsl(214 30% 55%)' }}>
              Departamentos
            </div>
          </div>

          {deptStats.map(({ dept, count }) => {
            const isActive = dept === activeDept;
            return (
              <button
                key={dept}
                onClick={() => setActiveDept(dept)}
                className="flex items-center gap-3 px-3 py-3 rounded-lg mb-1.5 transition-all text-left w-full"
                style={{
                  background: isActive ? 'hsl(214 50% 22%)' : 'transparent',
                  borderLeft: isActive ? '3px solid hsl(var(--sidebar-primary))' : '3px solid transparent',
                  color: isActive ? 'white' : 'hsl(214 20% 60%)',
                }}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: isActive ? 'hsl(214 55% 32%)' : 'hsl(214 40% 18%)' }}>
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold">{dept}</div>
                  <div className="text-[10px] opacity-60">{count} empleados</div>
                </div>
              </button>
            );
          })}

          {/* Stats */}
          <div className="mt-6 px-2">
            <div className="text-[10px] font-bold uppercase tracking-widest mb-3"
              style={{ color: 'hsl(214 30% 55%)' }}>
              Resumen · {MONTHS_ES[month]}
            </div>
            {[
              { label: 'LIBRE asignados', val: libreCount, color: 'hsl(var(--shift-libre))' },
              { label: 'COMP asignados', val: compCount, color: 'hsl(var(--shift-comp))' },
              { label: 'Total empleados', val: employees.length, color: 'hsl(var(--sidebar-primary))' },
            ].map(stat => (
              <div key={stat.label} className="flex justify-between items-center py-2 border-b"
                style={{ borderColor: 'hsl(214 40% 18%)' }}>
                <span className="text-[11px]" style={{ color: 'hsl(214 20% 60%)' }}>{stat.label}</span>
                <span className="font-bold text-sm" style={{ color: stat.color }}>{stat.val}</span>
              </div>
            ))}
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden p-5">
          {/* Department header */}
          <div className="flex items-center justify-between mb-4 no-print">
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--foreground))' }}>
                Departamento · {activeDept}
              </h1>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--muted-foreground))' }}>
                {employees.length} empleados · {MONTHS_ES[month]} {year} · Clic en celda para editar turno
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowManager(true)}
                size="sm"
                variant="outline"
                className="gap-2 text-xs font-semibold">
                <UserCog className="w-4 h-4" />
                Gestionar Empleados
              </Button>
              <Button
                onClick={() => exportToExcel(currentStore.name, activeDept, employees, schedule, year, month)}
                size="sm"
                className="gap-2 text-xs font-semibold"
                style={{ background: 'hsl(141 71% 38%)', color: 'white' }}>
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button
                onClick={() => printSchedule(currentStore.name, activeDept, month, year)}
                size="sm"
                variant="outline"
                className="gap-2 text-xs font-semibold">
                <Printer className="w-4 h-4" />
                Optimizar para Cartelera
              </Button>
            </div>
          </div>

          {/* Schedule table */}
          <div className="flex-1 overflow-hidden">
            <ScheduleTable
              employees={employees}
              schedule={schedule}
              onScheduleChange={handleScheduleChange}
              year={year}
              month={month}
              tableRef={tableRef}
            />
          </div>
        </main>
      </div>

      {/* Employee Manager Modal */}
      {showManager && (
        <EmployeeManager
          employees={employees}
          activeDept={activeDept}
          storeId={currentStore.id}
          onAdd={handleAddEmployee}
          onRemove={handleRemoveEmployee}
          onClose={() => setShowManager(false)}
        />
      )}

      {/* AI Chat Panel */}
      <AIChatPanel
        employees={employees}
        year={year}
        month={month}
        onApplyActions={(actions) => {
          actions.forEach(a => {
            handleScheduleChange(a.employeeId, a.day, a.newShift);
          });
        }}
      />
    </div>
  );
}
