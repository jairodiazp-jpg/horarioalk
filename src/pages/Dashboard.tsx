import React, { useState, useRef } from 'react';
import ScheduleSummary from '@/components/ScheduleSummary';
import { useAuth } from '@/contexts/AuthContext';
import { DEPARTMENTS, Department } from '@/data/stores';
import ScheduleTable from '@/components/ScheduleTable';
import EmployeeManager from '@/components/EmployeeManager';
import { exportToExcel, printSchedule } from '@/utils/exportUtils';
import AIChatPanel from '@/components/AIChatPanel';
import { useSchedulePersistence } from '@/hooks/useSchedulePersistence';
import { useDepartmentAuth } from '@/hooks/useDepartmentAuth';
import DepartmentLockDialog from '@/components/DepartmentLockDialog';
import ChangePasswordDialog from '@/components/ChangePasswordDialog';
import { Button } from '@/components/ui/button';
import {
  LogOut, Download, Printer, Calendar,
  Users, RefreshCw, ChevronLeft, ChevronRight, UserCog, Loader2, Wand2, BarChart3, KeyRound, Lock, Sparkles } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import WelcomeTour from '@/components/WelcomeTour';

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
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [pendingDept, setPendingDept] = useState<Department | null>(null);
  const [lockError, setLockError] = useState('');
  const tableRef = useRef<HTMLDivElement>(null);

  const { isDeptUnlocked, verifyPassword, changePassword, lockDept, loading: authLoading } = useDepartmentAuth(currentStore?.id);

  const {
    employeesByDept, schedules, loading, initialized,
    changeShift, addEmployee, removeEmployee, regenerate, clearScheduleData
  } = useSchedulePersistence(currentStore?.id, year, month);

  const handleScheduleChange = (employeeId: string, day: number, value: string) => {
    changeShift(activeDept, employeeId, day, value);
  };

  const handleExportExcel = () => {
    exportToExcel(currentStore!.name, activeDept, employees, schedule, year, month);
  };

  const handlePrint = () => {
    printSchedule(currentStore!.name, activeDept, month, year);
  };

  if (!currentStore) return null;
  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4 animate-[fade-in_0.5s_ease-out]">
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
              <Sparkles className="w-3 h-3 text-primary-foreground" />
            </div>
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-foreground">Cargando horarios...</p>
            <p className="text-xs text-muted-foreground mt-1">Preparando tu espacio de trabajo</p>
          </div>
        </div>
      </div>
    );
  }

  const employees = employeesByDept[activeDept] || [];
  const schedule = schedules[activeDept] || {};

  const deptStats = DEPARTMENTS.map((dept) => ({
    dept,
    count: (employeesByDept[dept] || []).length,
    shifts: Object.values(schedules[dept] || {}).reduce((acc, empDays) => {
      Object.values(empDays).forEach((shift) => {
        acc[shift] = (acc[shift] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>)
  }));

  const currentStats = deptStats.find((d) => d.dept === activeDept);
  const libreCount = currentStats?.shifts['LIBRE'] || 0;
  const compCount = currentStats?.shifts['COMP'] || 0;

  const isDemo = currentStore.id.toLowerCase() === 'demo';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Demo Banner */}
      {isDemo && (
        <div className="bg-gradient-to-r from-primary to-accent text-primary-foreground text-center py-2 text-xs font-medium animate-[fade-in_0.4s_ease-out]">
          <Sparkles className="w-3 h-3 inline mr-2" />
          Modo de demostración — Los cambios son temporales y se reiniciarán periódicamente
        </div>
      )}

      {/* Top Navbar */}
      <header 
        className="flex items-center justify-between px-6 py-3 no-print animate-[fade-in_0.5s_ease-out]"
        style={{ 
          background: 'linear-gradient(135deg, hsl(214 65% 14%) 0%, hsl(214 55% 18%) 100%)',
          boxShadow: '0 4px 20px hsl(214 50% 10% / 0.3)'
        }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <img 
                alt="Logo" 
                className="h-6 object-contain" 
                src="https://www.alkosto.com/medias/alkosto-logo-header.svg?context=bWFzdGVyfEljb25vcy1NZWdhbWVudS1BS3w4NTcxfGltYWdlL3N2Zyt4bWx8YURnMkwyZ3hZeTh4TkRreU1UWTFPRFE1T1RFd01pOWhiR3R2YzNSdkxXeHZaMjh0YUdWaFpHVnlMbk4yWnd8NzM0YjM2ZDc0Y2FhMzdkMGVjZGRmMDE0NmJjNzI5NTI3OWE2ODM0MzU1MzZiZWJkZjAzNzY3ZDg1Mjk3MTZiNw" 
              />
            </div>
            <div>
              <div className="text-white font-semibold text-sm tracking-wide">{currentStore.name}</div>
              <div className="text-white/50 text-[10px] uppercase tracking-wider">SchedPro v1.0</div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                data-tour="month-nav" 
                className="flex items-center gap-1 px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <button
                  onClick={() => {if (month === 1) {setMonth(12);setYear((y) => y - 1);} else setMonth((m) => m - 1);}}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <Calendar className="w-4 h-4 text-blue-300 mx-2" />
                <span className="text-white text-sm font-medium px-2 min-w-[120px] text-center">
                  {MONTHS_ES[month]} {year}
                </span>
                <button
                  onClick={() => {if (month === 12) {setMonth(1);setYear((y) => y + 1);} else setMonth((m) => m + 1);}}
                  className="text-white/60 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </TooltipTrigger>
            <TooltipContent>Navega entre meses para ver o editar horarios</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                data-tour="regenerate" 
                onClick={regenerate} 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2 text-xs rounded-xl"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden md:inline">Regenerar</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Regenera automáticamente los turnos del mes actual</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                data-tour="export-excel" 
                onClick={handleExportExcel} 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2 text-xs rounded-xl"
              >
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Excel</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Descarga el horario actual en formato Excel</TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={handlePrint} 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-white hover:bg-white/10 gap-2 text-xs rounded-xl"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden md:inline">Cartelera</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Imprime el horario optimizado para cartelera</TooltipContent>
          </Tooltip>

          <div className="w-px h-6 bg-white/10 mx-2" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={logout} 
                variant="ghost" 
                size="sm"
                className="text-white/70 hover:text-red-300 hover:bg-red-500/10 gap-2 text-xs rounded-xl"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden md:inline">Salir</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Cerrar sesión y volver al login</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside 
          className="w-64 flex-shrink-0 flex flex-col py-5 px-4 no-print animate-[fade-in_0.5s_ease-out_0.1s_both]"
          style={{ 
            background: 'linear-gradient(180deg, hsl(214 65% 12%) 0%, hsl(214 60% 9%) 100%)',
            borderRight: '1px solid hsl(214 50% 18%)'
          }}
        >
          <div className="mb-5 px-1" data-tour="departments">
            <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40 mb-4 flex items-center gap-2">
              <div className="w-6 h-px bg-white/20" />
              Departamentos
              <div className="flex-1 h-px bg-white/10" />
            </div>
          </div>

          <div className="space-y-2">
            {deptStats.map(({ dept, count }, index) => {
              const isActive = dept === activeDept;
              const isLocked = !isDeptUnlocked(dept);
              return (
                <Tooltip key={dept}>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => {
                        if (isDeptUnlocked(dept)) {
                          setActiveDept(dept);
                        } else {
                          setPendingDept(dept);
                          setLockError('');
                        }
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl w-full transition-all duration-200 group"
                      style={{
                        animation: `fade-in 0.4s ease-out ${0.15 + index * 0.05}s both`,
                        background: isActive 
                          ? 'linear-gradient(135deg, hsl(214 50% 25%) 0%, hsl(214 45% 20%) 100%)' 
                          : 'transparent',
                        boxShadow: isActive ? '0 4px 12px hsl(214 50% 10% / 0.4)' : 'none',
                        border: isActive ? '1px solid hsl(214 40% 35%)' : '1px solid transparent'
                      }}
                    >
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200"
                        style={{ 
                          background: isActive 
                            ? 'linear-gradient(135deg, hsl(214 60% 50%) 0%, hsl(214 55% 40%) 100%)' 
                            : 'hsl(214 40% 18%)',
                          boxShadow: isActive ? '0 2px 8px hsl(214 60% 50% / 0.3)' : 'none'
                        }}
                      >
                        {isLocked ? (
                          <Lock className="w-4 h-4 text-white/60" />
                        ) : (
                          <Users className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex-1 text-left">
                        <div 
                          className="text-sm font-semibold transition-colors"
                          style={{ color: isActive ? 'white' : 'hsl(214 20% 70%)' }}
                        >
                          {dept}
                        </div>
                        <div 
                          className="text-[10px] transition-colors"
                          style={{ color: isActive ? 'hsl(214 40% 70%)' : 'hsl(214 20% 50%)' }}
                        >
                          {count} empleados {isLocked && '· 🔒'}
                        </div>
                      </div>
                      {isActive && (
                        <div className="w-1.5 h-8 rounded-full bg-blue-400" />
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {isDeptUnlocked(dept) ? `Ver horarios de ${dept}` : `🔒 Requiere contraseña para acceder a ${dept}`}
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {/* Stats Card */}
          <div 
            className="mt-auto pt-6 animate-[fade-in_0.5s_ease-out_0.4s_both]" 
            data-tour="sidebar-stats"
          >
            <div 
              className="rounded-2xl p-4 border"
              style={{ 
                background: 'linear-gradient(135deg, hsl(214 50% 16%) 0%, hsl(214 45% 12%) 100%)',
                borderColor: 'hsl(214 40% 22%)'
              }}
            >
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-white/40 mb-4 flex items-center gap-2">
                <BarChart3 className="w-3 h-3" />
                Resumen · {MONTHS_ES[month]}
              </div>
              
              <div className="space-y-3">
                {[
                  { label: 'LIBRE asignados', val: libreCount, color: 'hsl(var(--shift-libre))' },
                  { label: 'COMP asignados', val: compCount, color: 'hsl(var(--shift-comp))' },
                  { label: 'Total empleados', val: employees.length, color: 'hsl(214 60% 60%)' }
                ].map((stat) => (
                  <div 
                    key={stat.label} 
                    className="flex justify-between items-center py-2 border-b last:border-0"
                    style={{ borderColor: 'hsl(214 40% 20%)' }}
                  >
                    <span className="text-[11px] text-white/50">{stat.label}</span>
                    <span 
                      className="font-bold text-sm tabular-nums"
                      style={{ color: stat.color }}
                    >
                      {stat.val}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col overflow-hidden p-6 animate-[fade-in_0.5s_ease-out_0.2s_both]">
          {!isDeptUnlocked(activeDept) ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-6">
              <div 
                className="w-20 h-20 rounded-2xl flex items-center justify-center"
                style={{ 
                  background: 'linear-gradient(135deg, hsl(var(--muted)) 0%, hsl(var(--background)) 100%)',
                  border: '2px dashed hsl(var(--border))'
                }}
              >
                <Lock className="w-8 h-8 text-muted-foreground" />
              </div>
              <div className="text-center">
                <h2 className="text-xl font-bold text-foreground">Departamento · {activeDept}</h2>
                <p className="text-sm text-muted-foreground mt-2">Ingrese la contraseña para acceder a los horarios</p>
              </div>
              <Button 
                onClick={() => { setPendingDept(activeDept); setLockError(''); }} 
                className="gap-2 rounded-xl px-6 py-5"
              >
                <Lock className="w-4 h-4" /> Desbloquear Departamento
              </Button>
            </div>
          ) : (
            <>
              {/* Header Section */}
              <div key={activeDept} className="flex items-start justify-between mb-6 no-print animate-[fade-in_0.25s_ease-out]">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: 'hsl(var(--primary) / 0.1)' }}
                    >
                      <Users className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-foreground">
                        {activeDept}
                      </h1>
                      <p className="text-sm text-muted-foreground">
                        {employees.length} empleados · {MONTHS_ES[month]} {year}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setShowManager(true)} 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 text-xs font-semibold rounded-xl"
                      >
                        <UserCog className="w-4 h-4" /> Empleados
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Agregar, editar o eliminar empleados del departamento</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={regenerate} 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 text-xs font-semibold rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                      >
                        <Wand2 className="w-4 h-4" /> Auto-Generar
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Genera automáticamente turnos rotativos para todos los empleados</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setShowSummary(!showSummary)} 
                        size="sm" 
                        variant={showSummary ? "default" : "outline"} 
                        className="gap-2 text-xs font-semibold rounded-xl"
                      >
                        <BarChart3 className="w-4 h-4" /> {showSummary ? 'Horario' : 'Resumen'}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{showSummary ? 'Volver a la vista de horarios por día' : 'Ver estadísticas y resumen de turnos asignados'}</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handleExportExcel} 
                        size="sm" 
                        className="gap-2 text-xs font-semibold rounded-xl"
                        style={{ background: 'hsl(141 71% 38%)', color: 'white' }}
                      >
                        <Download className="w-4 h-4" /> Excel
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Descarga el horario completo en archivo Excel (.xlsx)</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={handlePrint} 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 text-xs font-semibold rounded-xl"
                      >
                        <Printer className="w-4 h-4" /> Cartelera
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Formatea e imprime el horario para colocar en cartelera</TooltipContent>
                  </Tooltip>
                  
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        onClick={() => setShowChangePassword(true)} 
                        size="sm" 
                        variant="outline" 
                        className="gap-2 text-xs font-semibold rounded-xl"
                      >
                        <KeyRound className="w-4 h-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Cambiar la contraseña de acceso de este departamento</TooltipContent>
                  </Tooltip>
                </div>
              </div>

              {/* Hint text */}
              <div className="flex items-center gap-2 mb-4 text-xs text-muted-foreground no-print">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                Haz clic en cualquier celda para editar el turno
              </div>

              {/* Content Area */}
              <div 
                key={`${activeDept}-${showSummary}`}
                className="flex-1 overflow-auto rounded-xl border bg-card animate-[fade-in_0.3s_ease-out]"
                style={{ boxShadow: 'var(--card-shadow)' }}
                data-tour="schedule-area"
              >
                {showSummary ?
                  <ScheduleSummary employees={employees} schedule={schedule} year={year} month={month} /> :
                  <ScheduleTable employees={employees} schedule={schedule} onScheduleChange={handleScheduleChange} year={year} month={month} tableRef={tableRef} />
                }
              </div>
            </>
          )}
        </main>
      </div>

      {showManager &&
        <EmployeeManager
          employees={employees}
          activeDept={activeDept}
          storeId={currentStore.id}
          onAdd={addEmployee}
          onRemove={(empId) => removeEmployee(activeDept, empId)}
          onClose={() => setShowManager(false)} 
        />
      }

      <AIChatPanel
        employees={employees}
        year={year}
        month={month}
        storeId={currentStore.id}
        department={activeDept}
        onApplyActions={(actions) => {
          actions.forEach((a) => {
            handleScheduleChange(a.employeeId, a.day, a.newShift);
          });
        }}
        onEmployeeChange={() => {
          window.location.reload();
        }} 
      />

      {pendingDept && (
        <DepartmentLockDialog
          open={!!pendingDept}
          dept={pendingDept}
          loading={authLoading}
          error={lockError}
          onVerify={async (pw) => {
            const ok = await verifyPassword(pendingDept, pw);
            if (ok) {
              setActiveDept(pendingDept);
              setPendingDept(null);
              setLockError('');
            } else {
              setLockError('Contraseña incorrecta');
            }
          }}
          onCancel={() => { setPendingDept(null); setLockError(''); }}
        />
      )}

      <ChangePasswordDialog
        open={showChangePassword}
        dept={activeDept}
        onChangePassword={(cur, newP) => changePassword(activeDept, cur, newP)}
        onClose={() => setShowChangePassword(false)}
      />

      <WelcomeTour />
    </div>
  );
}
