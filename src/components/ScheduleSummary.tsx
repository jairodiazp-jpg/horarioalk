import React, { useMemo } from 'react';
import { Employee } from '@/data/stores';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Users, Sun, Sunset, Moon, Coffee, TrendingUp } from 'lucide-react';

interface ScheduleSummaryProps {
  employees: Employee[];
  schedule: Record<string, Record<number, string>>;
  year: number;
  month: number;
}

const SHIFT_CATEGORIES = [
  { key: 'morning', label: 'Mañana', prefix: 'A', color: 'hsl(141, 71%, 38%)', icon: Sun },
  { key: 'intermediate', label: 'Intermedio', prefix: 'I', color: 'hsl(48, 95%, 48%)', icon: TrendingUp },
  { key: 'afternoon', label: 'Tarde', prefix: 'C', color: 'hsl(33, 95%, 48%)', icon: Sunset },
  { key: 'night', label: 'Noche', prefix: 'N', color: 'hsl(215, 14%, 52%)', icon: Moon },
  { key: 'libre', label: 'Libre', prefix: 'LIBRE', color: 'hsl(0, 72%, 51%)', icon: Coffee },
];

function classifyShift(code: string): string {
  if (!code) return 'other';
  const upper = code.toUpperCase();
  if (upper === 'LIBRE' || upper === 'COMP' || upper === 'LIC' || upper === 'VC' || upper === 'DF' || upper === 'ALT') return 'libre';
  if (upper.startsWith('A')) return 'morning';
  if (upper.startsWith('I')) return 'intermediate';
  if (upper.startsWith('C')) return 'afternoon';
  if (upper.startsWith('N')) return 'night';
  return 'other';
}

const DAYS_ES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export default function ScheduleSummary({ employees, schedule, year, month }: ScheduleSummaryProps) {
  const daysInMonth = new Date(year, month, 0).getDate();

  // Per-day distribution
  const dailyData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month - 1, day);
      const dow = date.getDay();
      const counts: Record<string, number> = { morning: 0, intermediate: 0, afternoon: 0, night: 0, libre: 0 };

      employees.forEach(emp => {
        const shift = schedule[emp.id]?.[day] || '';
        const cat = classifyShift(shift);
        if (counts[cat] !== undefined) counts[cat]++;
      });

      return {
        day: `${day}`,
        dayLabel: `${DAYS_ES_SHORT[dow]} ${day}`,
        ...counts,
      };
    });
  }, [employees, schedule, year, month, daysInMonth]);

  // Totals for pie chart
  const totals = useMemo(() => {
    const t: Record<string, number> = { morning: 0, intermediate: 0, afternoon: 0, night: 0, libre: 0 };
    dailyData.forEach(d => {
      Object.keys(t).forEach(k => { t[k] += (d as any)[k]; });
    });
    return SHIFT_CATEGORIES.map(cat => ({
      name: cat.label,
      value: t[cat.key],
      color: cat.color,
    }));
  }, [dailyData]);

  // Weekly averages
  const weeklyAvg = useMemo(() => {
    const weeks: Record<string, number[]>[] = [];
    let currentWeek: Record<string, number[]> = {};
    
    dailyData.forEach((d, i) => {
      const date = new Date(year, month - 1, i + 1);
      const dow = date.getDay();
      
      if (dow === 1 && i > 0) {
        weeks.push(currentWeek);
        currentWeek = {};
      }
      
      SHIFT_CATEGORIES.forEach(cat => {
        if (!currentWeek[cat.key]) currentWeek[cat.key] = [];
        currentWeek[cat.key].push((d as any)[cat.key]);
      });
    });
    weeks.push(currentWeek);

    return weeks.map((week, idx) => {
      const entry: any = { week: `S${idx + 1}` };
      SHIFT_CATEGORIES.forEach(cat => {
        const vals = week[cat.key] || [];
        entry[cat.key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
      });
      return entry;
    });
  }, [dailyData, year, month]);

  // Summary cards data
  const cardData = useMemo(() => {
    return SHIFT_CATEGORIES.slice(0, 4).map(cat => {
      const values = dailyData.map(d => (d as any)[cat.key] as number);
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const min = Math.min(...values);
      const max = Math.max(...values);
      return { ...cat, avg: avg.toFixed(1), min, max };
    });
  }, [dailyData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="rounded-lg border px-3 py-2 text-xs shadow-lg"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }}>
        <p className="font-bold mb-1" style={{ color: 'hsl(var(--foreground))' }}>Día {label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span style={{ color: 'hsl(var(--muted-foreground))' }}>{p.name}: <strong style={{ color: 'hsl(var(--foreground))' }}>{p.value}</strong></span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cardData.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.key} className="rounded-xl border p-4"
              style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', boxShadow: 'var(--card-shadow)' }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: `${card.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <span className="text-xs font-bold" style={{ color: 'hsl(var(--foreground))' }}>{card.label}</span>
                </div>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold" style={{ color: card.color }}>{card.avg}</p>
                  <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>promedio/día</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    Min <strong style={{ color: 'hsl(var(--foreground))' }}>{card.min}</strong> · Max <strong style={{ color: 'hsl(var(--foreground))' }}>{card.max}</strong>
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Daily stacked bar chart */}
        <div className="lg:col-span-2 rounded-xl border p-4"
          style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-2 mb-3">
            <Users className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
            <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>Distribución diaria por turno</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData} barSize={12}>
                <XAxis dataKey="day" tick={{ fontSize: 9, fill: 'hsl(215, 16%, 47%)' }} interval={1} />
                <YAxis tick={{ fontSize: 9, fill: 'hsl(215, 16%, 47%)' }} width={28} />
                <Tooltip content={<CustomTooltip />} />
                {SHIFT_CATEGORIES.slice(0, 4).map(cat => (
                  <Bar key={cat.key} dataKey={cat.key} stackId="a" fill={cat.color} name={cat.label} radius={cat.key === 'night' ? [2, 2, 0, 0] : undefined} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Pie chart */}
        <div className="rounded-xl border p-4"
          style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', boxShadow: 'var(--card-shadow)' }}>
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
            <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>Proporción total</h3>
          </div>
          <div style={{ height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={totals} cx="50%" cy="45%" outerRadius={65} innerRadius={35} paddingAngle={3} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                  style={{ fontSize: 9 }}>
                  {totals.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value} turnos`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly average bar chart */}
      <div className="rounded-xl border p-4"
        style={{ background: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', boxShadow: 'var(--card-shadow)' }}>
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="w-4 h-4" style={{ color: 'hsl(var(--primary))' }} />
          <h3 className="text-sm font-bold" style={{ color: 'hsl(var(--foreground))' }}>Promedio semanal por turno</h3>
        </div>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyAvg} barGap={4}>
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'hsl(215, 16%, 47%)' }} />
              <YAxis tick={{ fontSize: 9, fill: 'hsl(215, 16%, 47%)' }} width={28} />
              <Tooltip content={<CustomTooltip />} />
              {SHIFT_CATEGORIES.slice(0, 4).map(cat => (
                <Bar key={cat.key} dataKey={cat.key} fill={cat.color} name={cat.label} radius={[3, 3, 0, 0]} barSize={16} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
