import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { STORES } from '@/data/stores';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Lock, User, ChevronDown, Sparkles, Shield, Clock, BarChart3 } from 'lucide-react';
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

  const features = [
    { icon: Clock, label: 'Turnos Automatizados', desc: 'Gestión inteligente de horarios' },
    { icon: BarChart3, label: 'Reportes en Tiempo Real', desc: 'Análisis y exportaciones' },
    { icon: Shield, label: 'Control por Departamento', desc: 'Acceso seguro y granular' },
    { icon: Sparkles, label: 'Asistente IA', desc: 'Soporte inteligente integrado' },
  ];

  return (
    <div className="min-h-screen flex overflow-hidden">
      {/* Left panel - Premium branding */}
      <div className="hidden lg:flex flex-col w-[45%] relative overflow-hidden">
        {/* Animated gradient background */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, hsl(214 65% 10%) 0%, hsl(214 65% 18%) 50%, hsl(214 55% 25%) 100%)',
          }}
        />
        
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(214 60% 50%) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, hsl(214 60% 50%) 0%, transparent 70%)' }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `linear-gradient(hsl(0 0% 100% / 0.1) 1px, transparent 1px),
                              linear-gradient(90deg, hsl(0 0% 100% / 0.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }} />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3 animate-[fade-in_0.6s_ease-out]">
            <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <img src={logo} alt="Logo" className="h-8 object-contain" />
            </div>
            <span className="text-white/80 font-medium tracking-wide">SchedPro</span>
          </div>

          {/* Hero content */}
          <div className="space-y-8">
            <div className="animate-[fade-in_0.8s_ease-out_0.2s_both]">
              <h1 className="text-5xl font-bold text-white leading-tight mb-4 tracking-tight">
                Gestión de
                <span className="block bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                  Horarios Inteligente
                </span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed max-w-md">
                La plataforma empresarial para administrar turnos, equipos y departamentos con eficiencia y elegancia.
              </p>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div 
                  key={feature.label}
                  className="group p-4 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm
                             hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                  style={{
                    animation: `fade-in 0.5s ease-out ${0.4 + index * 0.1}s both`
                  }}
                >
                  <feature.icon className="w-5 h-5 text-blue-300 mb-3" />
                  <div className="text-white font-semibold text-sm">{feature.label}</div>
                  <div className="text-white/50 text-xs mt-1">{feature.desc}</div>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-4 animate-[fade-in_0.6s_ease-out_0.9s_both]">
              <div>
                <div className="text-3xl font-bold text-white">40+</div>
                <div className="text-white/50 text-sm">Tiendas activas</div>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">4</div>
                <div className="text-white/50 text-sm">Departamentos</div>
              </div>
              <div className="w-px bg-white/20" />
              <div>
                <div className="text-3xl font-bold text-white">160+</div>
                <div className="text-white/50 text-sm">Empleados/tienda</div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between animate-[fade-in_0.5s_ease-out_1s_both]">
            <div className="text-white/30 text-sm">© 2025 SchedPro · v1.0</div>
            <div className="text-white/30 text-xs">Creado por Leonidas Díaz</div>
          </div>
        </div>
      </div>

      {/* Right panel - Login form */}
      <div 
        className="flex-1 flex items-center justify-center p-6 md:p-12 relative"
        style={{ background: 'hsl(var(--background))' }}
      >
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `radial-gradient(hsl(var(--primary)) 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }} />

        <div className="w-full max-w-md relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-12">
            <div className="p-3 rounded-2xl" style={{ background: 'hsl(var(--primary))' }}>
              <img src={logo} alt="Logo" className="h-8 object-contain brightness-0 invert" />
            </div>
          </div>

          {/* Welcome text */}
          <div className="text-center lg:text-left mb-10">
            <h2 
              className="text-3xl md:text-4xl font-bold mb-3 tracking-tight"
              style={{ color: 'hsl(var(--foreground))' }}
            >
              Bienvenido
            </h2>
            <p style={{ color: 'hsl(var(--muted-foreground))' }}>
              Ingrese sus credenciales para acceder al panel de gestión
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="store" className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                Tienda
              </Label>
              <div className="relative group">
                <User 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <select 
                  id="store" 
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  className="w-full pl-12 pr-12 py-4 rounded-xl border-2 text-sm appearance-none cursor-pointer
                             transition-all duration-200 focus:ring-4 focus:ring-primary/10"
                  style={{
                    background: 'hsl(var(--card))',
                    borderColor: storeName ? 'hsl(var(--primary))' : 'hsl(var(--border))',
                    color: 'hsl(var(--foreground))',
                    outline: 'none'
                  }}
                  required
                >
                  <option value="">Seleccione una tienda...</option>
                  {STORES.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
                <ChevronDown 
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 pointer-events-none"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium" style={{ color: 'hsl(var(--foreground))' }}>
                Contraseña
              </Label>
              <div className="relative group">
                <Lock 
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 transition-colors"
                  style={{ color: 'hsl(var(--muted-foreground))' }}
                />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-12 py-4 h-auto rounded-xl border-2 text-sm transition-all duration-200
                             focus:ring-4 focus:ring-primary/10"
                  style={{
                    borderColor: password ? 'hsl(var(--primary))' : undefined
                  }}
                  required
                />
              </div>
              <p className="text-xs pl-1" style={{ color: 'hsl(var(--muted-foreground))' }}>
                Contraseña inicial: nombre de la tienda
              </p>
            </div>

            {error && (
              <div 
                className="p-4 rounded-xl text-sm flex items-center gap-3 animate-in slide-in-from-top-2"
                style={{ 
                  background: 'hsl(var(--shift-libre-bg))', 
                  color: 'hsl(var(--shift-libre-fg))',
                  border: '1px solid hsl(var(--shift-libre) / 0.3)'
                }}
              >
                <div className="w-2 h-2 rounded-full bg-current flex-shrink-0" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full py-6 text-sm font-semibold rounded-xl shadow-lg 
                         hover:shadow-xl transition-all duration-300 hover:scale-[1.02]
                         disabled:opacity-70 disabled:hover:scale-100"
              style={{ 
                background: 'hsl(var(--primary))', 
                color: 'hsl(var(--primary-foreground))' 
              }}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </span>
              ) : (
                'Ingresar al Panel'
              )}
            </Button>
          </form>

          {/* Quick access - Demo */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'hsl(var(--border))' }} />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3" style={{ background: 'hsl(var(--background))', color: 'hsl(var(--muted-foreground))' }}>
                  Acceso rápido
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => { setStoreName('DEMO'); setPassword('DEMO'); }}
              className="mt-4 w-full p-4 rounded-xl border-2 border-dashed text-sm font-medium
                         transition-all duration-200 hover:border-solid group"
              style={{ 
                borderColor: 'hsl(var(--primary) / 0.3)',
                color: 'hsl(var(--primary))',
                background: 'hsl(var(--primary) / 0.03)'
              }}
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-4 h-4 group-hover:animate-pulse" />
                Probar con cuenta DEMO
              </div>
            </button>
          </div>

          {/* Footer on mobile */}
          <div className="lg:hidden mt-8 text-center">
            <p className="text-xs" style={{ color: 'hsl(var(--muted-foreground))' }}>
              © 2025 SchedPro · Creado por Leonidas Díaz
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
