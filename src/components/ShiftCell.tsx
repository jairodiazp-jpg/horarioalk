import React, { useState, useRef, useEffect } from 'react';
import { getShiftClass, ALL_SHIFT_CODES, MORNING_SHIFTS, AFTERNOON_SHIFTS, NIGHT_SHIFTS, INTERMEDIATE_SHIFTS } from '@/data/shifts';
import { X, Check } from 'lucide-react';

interface ShiftCellProps {
  value: string;
  onChange: (val: string) => void;
  employeeId: string;
  day: number;
}

const QUICK_CODES = [
  { group: 'Mañana', codes: MORNING_SHIFTS },
  { group: 'Intermedio', codes: INTERMEDIATE_SHIFTS.slice(0, 8) },
  { group: 'Tarde', codes: AFTERNOON_SHIFTS },
  { group: 'Noche', codes: NIGHT_SHIFTS },
  { group: 'Especial', codes: ['LIBRE', 'COMP', 'LIC', 'VC', 'DF'] },
];

export default function ShiftCell({ value, onChange, employeeId, day }: ShiftCellProps) {
  const [editing, setEditing] = useState(false);
  const [inputVal, setInputVal] = useState(value);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const cellRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputVal(value);
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (cellRef.current && !cellRef.current.contains(e.target as Node)) {
        handleSave();
      }
    }
    if (editing) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editing, inputVal]);

  const handleSave = () => {
    const trimmed = inputVal.trim().toUpperCase();
    if (trimmed) onChange(trimmed);
    setEditing(false);
    setDropdownOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSave();
    if (e.key === 'Escape') {
      setInputVal(value);
      setEditing(false);
      setDropdownOpen(false);
    }
    if (e.key === 'Tab') handleSave();
  };

  const handleSelect = (code: string) => {
    onChange(code);
    setInputVal(code);
    setEditing(false);
    setDropdownOpen(false);
  };

  if (editing) {
    return (
      <div ref={cellRef} className="relative z-50">
        <div className="flex items-center gap-1 min-w-[80px]">
          <input
            ref={inputRef}
            value={inputVal}
            onChange={e => { setInputVal(e.target.value); setDropdownOpen(true); }}
            onKeyDown={handleKeyDown}
            onClick={() => setDropdownOpen(true)}
            className="w-full text-center text-xs font-bold px-1 py-0.5 rounded border-2 uppercase"
            style={{
              borderColor: 'hsl(var(--primary))',
              background: 'hsl(var(--card))',
              color: 'hsl(var(--foreground))',
              minWidth: '60px',
              maxWidth: '80px',
            }}
            placeholder={value}
          />
          <button onClick={handleSave} className="text-green-600 hover:text-green-700">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => { setInputVal(value); setEditing(false); setDropdownOpen(false); }} className="text-red-500 hover:text-red-600">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        {dropdownOpen && (
          <div
            className="absolute top-full left-0 mt-1 rounded-lg shadow-xl border z-[100] overflow-hidden"
            style={{
              background: 'hsl(var(--card))',
              borderColor: 'hsl(var(--border))',
              minWidth: '220px',
              maxHeight: '320px',
              overflowY: 'auto',
            }}
          >
            {QUICK_CODES.map(({ group, codes }) => {
              const filtered = codes.filter(c =>
                !inputVal || c.toUpperCase().startsWith(inputVal.toUpperCase())
              );
              if (!filtered.length) return null;
              return (
                <div key={group}>
                  <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: 'hsl(var(--muted))', color: 'hsl(var(--muted-foreground))' }}>
                    {group}
                  </div>
                  <div className="flex flex-wrap gap-1 p-2">
                    {filtered.map(code => (
                      <button
                        key={code}
                        onMouseDown={e => { e.preventDefault(); handleSelect(code); }}
                        className={`text-xs font-bold px-2 py-1 rounded cursor-pointer transition-opacity hover:opacity-80 ${getShiftClass(code)}`}
                      >
                        {code}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      onClick={() => setEditing(true)}
      title="Clic para editar"
      className={`text-xs font-bold px-1 py-1 rounded cursor-pointer select-none text-center transition-all hover:opacity-80 hover:ring-2 hover:ring-primary min-w-[44px] ${getShiftClass(value)}`}
    >
      {value || '—'}
    </div>
  );
}
