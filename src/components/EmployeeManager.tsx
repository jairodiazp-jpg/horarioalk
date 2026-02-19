import React, { useState } from 'react';
import { Employee, Department, DEPARTMENTS } from '@/data/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Trash2, X, Search, AlertTriangle } from 'lucide-react';

interface EmployeeManagerProps {
  employees: Employee[];
  activeDept: Department;
  storeId: string;
  onAdd: (emp: Employee) => void;
  onRemove: (empId: string) => void;
  onClose: () => void;
}

export default function EmployeeManager({
  employees, activeDept, storeId, onAdd, onRemove, onClose
}: EmployeeManagerProps) {
  const [tab, setTab] = useState<'list' | 'add'>('list');
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [form, setForm] = useState({
    codigo: '',
    nombre: '',
    actividad: '',
    departamento: activeDept as Department,
  });
  const [formError, setFormError] = useState('');

  const filtered = employees.filter(e =>
    !search ||
    e.codigo.toLowerCase().includes(search.toLowerCase()) ||
    e.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = () => {
    if (!form.codigo.trim() || !form.nombre.trim() || !form.actividad.trim()) {
      setFormError('Todos los campos son obligatorios.');
      return;
    }
    if (employees.some(e => e.codigo === form.codigo.trim())) {
      setFormError('Ya existe un empleado con ese código.');
      return;
    }
    const newEmp: Employee = {
      id: `${storeId}-${form.departamento}-custom-${Date.now()}`,
      codigo: form.codigo.trim().toUpperCase(),
      nombre: form.nombre.trim().toUpperCase(),
      actividad: form.actividad.trim().toUpperCase(),
      departamento: form.departamento,
    };
    onAdd(newEmp);
    setForm({ codigo: '', nombre: '', actividad: '', departamento: activeDept });
    setFormError('');
    setTab('list');
  };

  const handleRemoveConfirm = (empId: string) => {
    onRemove(empId);
    setConfirmDelete(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ borderColor: 'hsl(var(--border))', background: 'hsl(214 65% 12%)', borderRadius: '1rem 1rem 0 0' }}>
          <div>
            <h2 className="text-white font-bold text-lg">Gestión de Empleados</h2>
            <p className="text-white/50 text-xs mt-0.5">Departamento · {activeDept} · {employees.length} empleados</p>
          </div>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b" style={{ borderColor: 'hsl(var(--border))' }}>
          {(['list', 'add'] as const).map(t => (
            <button
              key={t}
              onClick={() => { setTab(t); setFormError(''); }}
              className="flex-1 py-3 text-sm font-semibold transition-colors"
              style={{
                color: tab === t ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                borderBottom: tab === t ? '2px solid hsl(var(--primary))' : '2px solid transparent',
                background: 'transparent',
              }}>
              {t === 'list' ? `📋 Lista (${employees.length})` : '➕ Agregar Empleado'}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-5">
          {tab === 'list' && (
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
                  style={{ color: 'hsl(var(--muted-foreground))' }} />
                <Input
                  placeholder="Buscar por código o nombre..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="pl-10 h-9 text-sm"
                />
              </div>

              <div className="space-y-1.5">
                {filtered.map(emp => (
                  <div key={emp.id}
                    className="flex items-center justify-between px-4 py-3 rounded-lg transition-colors"
                    style={{ background: 'hsl(var(--muted))', border: '1px solid hsl(var(--border))' }}>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold"
                        style={{ color: 'hsl(var(--primary))' }}>
                        {emp.codigo}
                      </span>
                      <div>
                        <div className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                          {emp.nombre}
                        </div>
                        <div className="text-[11px]" style={{ color: 'hsl(var(--muted-foreground))' }}>
                          {emp.actividad}
                        </div>
                      </div>
                    </div>

                    {confirmDelete === emp.id ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium" style={{ color: 'hsl(var(--destructive))' }}>
                          ¿Eliminar?
                        </span>
                        <Button size="sm" variant="destructive" className="h-7 text-xs"
                          onClick={() => handleRemoveConfirm(emp.id)}>
                          Sí
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => setConfirmDelete(null)}>
                          No
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(emp.id)}
                        className="p-2 rounded-lg transition-colors hover:bg-red-50"
                        style={{ color: 'hsl(var(--muted-foreground))' }}
                        title="Eliminar empleado">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
                {filtered.length === 0 && (
                  <p className="text-center py-8 text-sm" style={{ color: 'hsl(var(--muted-foreground))' }}>
                    No se encontraron empleados.
                  </p>
                )}
              </div>
            </div>
          )}

          {tab === 'add' && (
            <div className="space-y-4 max-w-md mx-auto">
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Código del Empleado</Label>
                <Input
                  placeholder="Ej: 38000123"
                  value={form.codigo}
                  onChange={e => setForm(f => ({ ...f, codigo: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Nombre Completo</Label>
                <Input
                  placeholder="Ej: JUAN PÉREZ GARCÍA"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Actividad / Cargo</Label>
                <Input
                  placeholder="Ej: AUXILIAR LÍNEA DE MERCADO/FRUTAS"
                  value={form.actividad}
                  onChange={e => setForm(f => ({ ...f, actividad: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-semibold">Departamento</Label>
                <select
                  value={form.departamento}
                  onChange={e => setForm(f => ({ ...f, departamento: e.target.value as Department }))}
                  className="w-full px-3 py-2 rounded-lg border text-sm"
                  style={{
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                  }}>
                  {DEPARTMENTS.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              {formError && (
                <div className="flex items-center gap-2 p-3 rounded-lg text-sm"
                  style={{ background: 'hsl(var(--destructive) / 0.1)', color: 'hsl(var(--destructive))' }}>
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {formError}
                </div>
              )}

              <Button
                onClick={handleAdd}
                className="w-full gap-2 font-semibold"
                style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
                <UserPlus className="w-4 h-4" />
                Agregar Empleado
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
