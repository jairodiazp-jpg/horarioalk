import React, { useState, useRef } from 'react';
import ScheduleSummary from '@/components/ScheduleSummary';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, Department } from '@/data/stores';
import ScheduleTable from '@/components/ScheduleTable';
import EmployeeManager from '@/components/EmployeeManager';
import { exportToExcel, printSchedule } from '@/utils/exportUtils';
import AIChatPanel from '@/components/AIChatPanel';
import { useSchedulePersistence } from '@/hooks/useSchedulePersistence';
import { Button } from '@/components/ui/button';
import {
  LogOut, Download, Printer, Calendar,
  Users, RefreshCw, ChevronLeft, ChevronRight, UserCog, Loader2, Wand2, BarChart3
} from 'lucide-react';
import logo from '@/assets/logo.png';

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function Dashboard() {
  const { currentStore, logout } = useAuth();
  const [activeDept, setActiveDept] = useState<Department>('Electro');
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [showManager, setShowManager] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  const {
    employeesByDept, schedules, loading, initialized,
    changeShift, addEmployee, removeEmployee, regenerate, clearScheduleData,
  } = useSchedulePersistence(currentStore?.id, year, month);

  const handleScheduleChange = (employeeId: string, day: number, value: string) => {
    changeShift(activeDept, employeeId, day, value);
  };

  const handleExportExcel = async () => {
    exportToExcel(currentStore!.name, activeDept, employees, schedule, year, month);
    await clearScheduleData();
  };

  const handlePrint = async () => {
    printSchedule(currentStore!.name, activeDept, month, year);
    await clearScheduleData();
  };

  if (!currentStore) return null;
  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'hsl(var(--background))' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
          <p className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>Cargando horarios...</p>
        </div>
      </div>
    );
  }

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
           <img src={logo} alt="Logo" className="h-8 object-contain" />
           <div>
             <div className="text-white/50 text-[10px] uppercase tracking-wider">{currentStore.name}</div>
           </div>
         </div>

        <div className="flex items-center gap-2">
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

          <Button onClick={handleExportExcel} variant="ghost" size="sm"
            className="text-white/70 hover:text-white hover:bg-white/10 gap-1.5 text-xs">
            <Download className="w-3.5 h-3.5" />
            Excel
          </Button>

          <Button onClick={handlePrint} variant="ghost" size="sm"
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
                onClick={regenerate}
                size="sm"
                variant="outline"
                className="gap-2 text-xs font-semibold"
                style={{ borderColor: 'hsl(var(--primary))', color: 'hsl(var(--primary))' }}>
                <Wand2 className="w-4 h-4" />
                Auto-Generar Horario
              </Button>
              <Button
                onClick={() => setShowSummary(!showSummary)}
                size="sm"
                variant={showSummary ? "default" : "outline"}
                className="gap-2 text-xs font-semibold">
                <BarChart3 className="w-4 h-4" />
                {showSummary ? 'Ver Horario' : 'Ver Resumen'}
              </Button>
              <Button
                onClick={handleExportExcel}
                size="sm"
                className="gap-2 text-xs font-semibold"
                style={{ background: 'hsl(141 71% 38%)', color: 'white' }}>
                <Download className="w-4 h-4" />
                Exportar Excel
              </Button>
              <Button
                onClick={handlePrint}
                size="sm"
                variant="outline"
                className="gap-2 text-xs font-semibold">
                <Printer className="w-4 h-4" />
                Optimizar para Cartelera
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            {showSummary ? (
              <ScheduleSummary
                employees={employees}
                schedule={schedule}
                year={year}
                month={month}
              />
            ) : (
              <ScheduleTable
                employees={employees}
                schedule={schedule}
                onScheduleChange={handleScheduleChange}
                year={year}
                month={month}
                tableRef={tableRef}
              />
            )}
          </div>
        </main>
      </div>

      {showManager && (
        <EmployeeManager
          employees={employees}
          activeDept={activeDept}
          storeId={currentStore.id}
          onAdd={addEmployee}
          onRemove={(empId) => removeEmployee(activeDept, empId)}
          onClose={() => setShowManager(false)}
        />
      )}

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
