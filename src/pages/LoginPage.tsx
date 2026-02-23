import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STORES } from '@/data/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User } from 'lucide-react';
import logo from '@/assets/logo.png';

export default function LoginPage() {
  const { login } = useAuth();
  const [storeName, setStoreName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setTimeout(() => {
      const ok = login(storeName, password);
      if (!ok) setError('Credenciales incorrectas. Verifique el nombre de la tienda y contraseña.');
      setLoading(false);
    }, 600);
  };

  return (
    <div className="min-h-screen flex" style={{ background: 'hsl(var(--primary))' }}>
      {/* Left panel - branding */}
      <div className="hidden lg:flex flex-col justify-between w-2/5 p-12" style={{ background: 'hsl(214 65% 12%)' }}>
         <div className="flex items-center gap-3">
           <img src={logo} alt="Logo" className="h-10 object-contain" />
         </div>
        <div>
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Gestión de Horarios<br />para Grandes Cadenas
          </h1>
          <p className="text-white/60 text-lg">
            Administre turnos, descansos y exportaciones de toda su cadena de tiendas desde un solo lugar.
          </p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[
            { label: 'Departamentos', val: '4' },
            { label: 'Empleados/Depto.', val: '40' },
            { label: 'Tipos de turno', val: '40+' },
            { label: 'Exportación', val: 'Excel+PDF' }].
            map((stat) =>
            <div key={stat.label} className="bg-white/5 rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-white">{stat.val}</div>
                <div className="text-white/50 text-sm mt-1">{stat.label}</div>
              </div>
            )}
          </div>
        </div>
        <div className="text-white/30 text-sm">© 2025 SchedPro · Versión 1.0</div>
      </div>

      {/* Right panel - login form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ background: 'hsl(var(--background))' }}>
        <div className="w-full max-w-md border border-muted-foreground rounded-xl shadow-2xl border-none">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
             <img alt="Logo" className="h-10 object-contain" src="https://www.alkosto.com/medias/alkosto-logo-header.svg?context=bWFzdGVyfEljb25vcy1NZWdhbWVudS1BS3w4NTcxfGltYWdlL3N2Zyt4bWx8YURnMkwyZ3hZeTh4TkRreU1UWTFPRFE1T1RFd01pOWhiR3R2YzNSdkxXeHZaMjh0YUdWaFpHVnlMbk4yWnd8NzM0YjM2ZDc0Y2FhMzdkMGVjZGRmMDE0NmJjNzI5NTI3OWE2ODM0MzU1MzZiZWJkZjAzNzY3ZDg1Mjk3MTZiNw" />
           </div>

          <h2 className="text-3xl font-bold mb-2" style={{ color: 'hsl(var(--foreground))' }}>
            Acceso a Panel
          </h2>
          <p className="mb-8" style={{ color: 'hsl(var(--muted-foreground))' }}>
            Ingrese con las credenciales de su tienda
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="store" className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Nombre de la Tienda
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <select
                  id="store"
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-lg border text-sm appearance-none cursor-pointer"
                  style={{
                    background: 'hsl(var(--card))',
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    outline: 'none'
                  }}
                  required>

                  <option value="">Seleccione una tienda...</option>
                  {STORES.map((s) =>
                  <option key={s.id} value={s.name}>{s.name}</option>
                  )}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-semibold" style={{ color: 'hsl(var(--foreground))' }}>
                Contraseña
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
                <Input
                  id="password"
                  type="password"
                  placeholder="Contraseña de acceso"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 py-3"
                  required />

              </div>
              <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Contraseña inicial: nombre de la tienda
              </p>
            </div>

            {error &&
            <div className="p-3 rounded-lg text-sm" style={{ background: 'hsl(var(--shift-libre-bg))', color: 'hsl(var(--shift-libre-fg))' }}>
                {error}
              </div>
            }

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-sm font-semibold"
              style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>

              {loading ? 'Verificando...' : 'Ingresar al Panel'}
            </Button>
          </form>

          <div className="mt-6 p-4 rounded-lg" style={{ background: 'hsl(var(--muted))', borderColor: 'hsl(var(--border))' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(var(--muted-foreground))' }}>
              TIENDAS DISPONIBLES (DEMO)
            </p>
            {STORES.map((s) =>
            <button
              key={s.id}
              type="button"
              onClick={() => {setStoreName(s.name);setPassword(s.password);}}
              className="block w-full text-left text-xs py-1 px-2 rounded hover:bg-white/50 transition-colors"
              style={{ color: 'hsl(var(--foreground))' }}>

                → {s.name}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>);

}