import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Lock, Loader2 } from 'lucide-react';
import { Department } from '@/data/stores';

interface Props {
  open: boolean;
  dept: Department;
  loading: boolean;
  onVerify: (password: string) => void;
  onCancel: () => void;
  error?: string;
}

export default function DepartmentLockDialog({ open, dept, loading, onVerify, onCancel, error }: Props) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onVerify(password);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Acceso a {dept}
          </DialogTitle>
          <DialogDescription>Ingrese la contraseña para acceder al departamento.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            <Button type="submit" disabled={loading || !password}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
              Desbloquear
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
