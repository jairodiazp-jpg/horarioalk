import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { KeyRound, Loader2 } from 'lucide-react';
import { Department } from '@/data/stores';

interface Props {
  open: boolean;
  dept: Department;
  onChangePassword: (current: string, newPass: string) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function ChangePasswordDialog({ open, dept, onChangePassword, onClose }: Props) {
  const [current, setCurrent] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPass !== confirm) { setError('Las contraseñas no coinciden'); return; }
    if (newPass.length < 4) { setError('Mínimo 4 caracteres'); return; }
    setLoading(true);
    const result = await onChangePassword(current, newPass);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => { setSuccess(false); onClose(); setCurrent(''); setNewPass(''); setConfirm(''); }, 1500);
    } else {
      setError(result.error || 'Error desconocido');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-primary" />
            Cambiar Contraseña · {dept}
          </DialogTitle>
          <DialogDescription>Ingrese la contraseña actual y la nueva contraseña.</DialogDescription>
        </DialogHeader>
        {success ? (
          <p className="text-center text-sm text-green-600 font-semibold py-4">✅ Contraseña actualizada</p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 mt-2">
            <Input type="password" placeholder="Contraseña actual" value={current} onChange={(e) => setCurrent(e.target.value)} />
            <Input type="password" placeholder="Nueva contraseña" value={newPass} onChange={(e) => setNewPass(e.target.value)} />
            <Input type="password" placeholder="Confirmar nueva contraseña" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={loading || !current || !newPass || !confirm}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : null}
                Cambiar
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
