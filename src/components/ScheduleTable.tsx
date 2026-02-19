import React, { useState, useMemo } from 'react';
import { Employee, Department } from '@/data/stores';
import ShiftCell from './ShiftCell';
import { Search, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ScheduleTableProps {
  employees: Employee[];
  schedule: Record<string, Record<number, string>>;
  onScheduleChange: (employeeId: string, day: number, value: string) => void;
  year: number;
  month: number;
  tableRef?: React.RefObject<HTMLDivElement>;
}

const DAYS_ES = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];
const MONTHS_ES = ['', 'ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO',
  'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE', 'DICIEMBRE'];

export default function ScheduleTable({
  employees, schedule, onScheduleChange, year, month, tableRef
}: ScheduleTableProps) {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<'codigo' | 'nombre' | 'actividad'>('codigo');
  const [sortAsc, setSortAsc] = useState(true);

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return employees
      .filter(e =>
        !q ||
        e.codigo.toLowerCase().includes(q) ||
        e.nombre.toLowerCase().includes(q) ||
        e.actividad.toLowerCase().includes(q)
      )
      .sort((a, b) => {
        const va = a[sortField].toLowerCase();
        const vb = b[sortField].toLowerCase();
        return sortAsc ? va.localeCompare(vb) : vb.localeCompare(va);
      });
  }, [employees, search, sortField, sortAsc]);

  const handleSort = (field: 'codigo' | 'nombre' | 'actividad') => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const SortIcon = ({ field }: { field: string }) => (
    <span className="inline-flex flex-col ml-1 opacity-50">
      {sortField === field && sortAsc ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
    </span>
  );

  // Compute day-of-week for each day
  const dayMeta = days.map(d => {
    const date = new Date(year, month - 1, d);
    const dow = date.getDay();
    const isWeekend = dow === 0 || dow === 6;
    return { day: d, dow, isWeekend, dowLabel: DAYS_ES[dow] };
  });

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Search bar */}
      <div className="flex items-center gap-3 no-print">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          <Input
            placeholder="Buscar empleado..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10 text-sm h-9"
          />
        </div>
        <span className="text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {filtered.length} de {employees.length} empleados
        </span>
      </div>

      {/* Table */}
      <div ref={tableRef} className="overflow-auto rounded-xl border schedule-table"
        style={{ borderColor: 'hsl(var(--border))', boxShadow: 'var(--card-shadow)' }}>
        <table className="border-collapse text-xs" style={{ minWidth: `${160 + daysInMonth * 52}px` }}>
          <thead>
            {/* Month header */}
            <tr>
              <th colSpan={3}
                className="px-3 py-2 text-center font-bold text-sm"
                style={{ background: 'hsl(214 65% 12%)', color: 'white', borderBottom: '1px solid hsl(var(--border))' }}>
                {MONTHS_ES[month]} {year}
              </th>
              {dayMeta.map(({ day, isWeekend }) => (
                <th key={day}
                  className="px-1 py-2 text-center font-bold text-xs w-[50px]"
                  style={{
                    background: isWeekend ? 'hsl(214 40% 22%)' : 'hsl(214 55% 18%)',
                    color: 'white',
                    borderBottom: '1px solid hsl(var(--border))',
                    borderLeft: '1px solid hsl(214 50% 25%)',
                  }}>
                  {day}
                </th>
              ))}
            </tr>
            {/* Day of week header */}
            <tr>
              <th className="px-3 py-1 text-left text-[10px] font-bold uppercase cursor-pointer select-none"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                onClick={() => handleSort('codigo')}>
                CÓDIGO <SortIcon field="codigo" />
              </th>
              <th className="px-3 py-1 text-left text-[10px] font-bold uppercase cursor-pointer select-none min-w-[180px]"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                onClick={() => handleSort('nombre')}>
                NOMBRE <SortIcon field="nombre" />
              </th>
              <th className="px-3 py-1 text-left text-[10px] font-bold uppercase cursor-pointer select-none min-w-[200px]"
                style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}
                onClick={() => handleSort('actividad')}>
                ACTIVIDAD <SortIcon field="actividad" />
              </th>
              {dayMeta.map(({ day, dowLabel, isWeekend }) => (
                <th key={day}
                  className="px-1 py-1 text-center text-[10px] font-bold"
                  style={{
                    background: isWeekend ? 'hsl(215 14% 88%)' : 'hsl(var(--muted))',
                    color: isWeekend ? 'hsl(215 16% 40%)' : 'hsl(var(--muted-foreground))',
                    borderLeft: '1px solid hsl(var(--border))',
                  }}>
                  {dowLabel}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((emp, rowIdx) => (
              <tr
                key={emp.id}
                style={{ background: rowIdx % 2 === 0 ? 'hsl(var(--card))' : 'hsl(var(--background))' }}
                className="hover:bg-opacity-80 transition-colors"
              >
                <td className="px-3 py-1 font-mono text-[11px] font-semibold whitespace-nowrap border-r"
                  style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  {emp.codigo}
                </td>
                <td className="px-3 py-1 whitespace-nowrap font-medium border-r"
                  style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}>
                  {emp.nombre}
                </td>
                <td className="px-3 py-1 whitespace-nowrap border-r"
                  style={{ borderColor: 'hsl(var(--border))', color: 'hsl(var(--muted-foreground))' }}>
                  {emp.actividad}
                </td>
                {dayMeta.map(({ day, isWeekend }) => (
                  <td key={day}
                    className="px-1 py-1 text-center border-l"
                    style={{
                      borderColor: 'hsl(var(--border))',
                      background: isWeekend ? 'hsl(215 14% 95%)' : 'transparent',
                    }}>
                    <ShiftCell
                      value={schedule[emp.id]?.[day] || ''}
                      onChange={val => onScheduleChange(emp.id, day, val)}
                      employeeId={emp.id}
                      day={day}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 no-print">
        {[
          { label: 'Mañana (A)', cls: 'shift-A' },
          { label: 'Intermedio (I)', cls: 'shift-I' },
          { label: 'Tarde (C)', cls: 'shift-C' },
          { label: 'Noche (N)', cls: 'shift-N' },
          { label: 'LIBRE', cls: 'shift-LIBRE' },
          { label: 'COMP', cls: 'shift-COMP' },
          { label: 'LIC', cls: 'shift-LIC' },
          { label: 'VC', cls: 'shift-VC' },
        ].map(({ label, cls }) => (
          <div key={label} className={`text-[10px] font-bold px-2 py-0.5 rounded ${cls}`}>{label}</div>
        ))}
      </div>
    </div>
  );
}
