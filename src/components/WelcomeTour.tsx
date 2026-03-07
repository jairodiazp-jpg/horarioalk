import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TourStep {
  selector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const TOUR_STEPS: TourStep[] = [
  {
    selector: '[data-tour="departments"]',
    title: '📂 Departamentos',
    description: 'Aquí puedes navegar entre los departamentos de tu tienda. Cada uno tiene su propia contraseña de acceso y lista de empleados.',
    position: 'right',
  },
  {
    selector: '[data-tour="month-nav"]',
    title: '📅 Navegación de Meses',
    description: 'Usa las flechas para moverte entre meses y ver o editar los horarios de cada periodo.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="regenerate"]',
    title: '🔄 Regenerar Horarios',
    description: 'Genera automáticamente turnos rotativos para todos los empleados del mes actual.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="export-excel"]',
    title: '📊 Exportar a Excel',
    description: 'Descarga el horario completo del departamento en un archivo Excel listo para compartir.',
    position: 'bottom',
  },
  {
    selector: '[data-tour="schedule-area"]',
    title: '📋 Tabla de Horarios',
    description: 'Haz clic en cualquier celda para cambiar el turno de un empleado. Los colores representan distintos tipos de turno.',
    position: 'top',
  },
  {
    selector: '[data-tour="ai-chat"]',
    title: '🤖 Asistente IA',
    description: 'Pídele a la IA que modifique horarios, agregue empleados o suba datos desde una imagen. ¡Tu asistente inteligente!',
    position: 'left',
  },
  {
    selector: '[data-tour="sidebar-stats"]',
    title: '📈 Resumen del Mes',
    description: 'Consulta rápidamente cuántos días LIBRE, COMP y el total de empleados asignados este mes.',
    position: 'right',
  },
];

const TOUR_KEY = 'alkosto_tour_completed';

export default function WelcomeTour() {
  const [active, setActive] = useState(false);
  const [step, setStep] = useState(0);
  const [highlight, setHighlight] = useState<DOMRect | null>(null);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) {
      const timer = setTimeout(() => setActive(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const updateHighlight = useCallback(() => {
    if (!active) return;
    const el = document.querySelector(TOUR_STEPS[step]?.selector);
    if (el) {
      setHighlight(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } else {
      setHighlight(null);
    }
  }, [active, step]);

  useEffect(() => {
    updateHighlight();
    window.addEventListener('resize', updateHighlight);
    return () => window.removeEventListener('resize', updateHighlight);
  }, [updateHighlight]);

  const finish = () => {
    setActive(false);
    localStorage.setItem(TOUR_KEY, 'true');
  };

  const next = () => {
    if (step < TOUR_STEPS.length - 1) setStep(s => s + 1);
    else finish();
  };

  const prev = () => {
    if (step > 0) setStep(s => s - 1);
  };

  if (!active) return null;

  const current = TOUR_STEPS[step];
  const isLast = step === TOUR_STEPS.length - 1;

  // Calculate tooltip position
  const getTooltipStyle = (): React.CSSProperties => {
    if (!highlight) return { top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };

    const gap = 16;
    const pos = current.position;

    if (pos === 'bottom') {
      return { top: highlight.bottom + gap, left: highlight.left + highlight.width / 2, transform: 'translateX(-50%)' };
    }
    if (pos === 'top') {
      return { bottom: window.innerHeight - highlight.top + gap, left: highlight.left + highlight.width / 2, transform: 'translateX(-50%)' };
    }
    if (pos === 'right') {
      return { top: highlight.top + highlight.height / 2, left: highlight.right + gap, transform: 'translateY(-50%)' };
    }
    // left
    return { top: highlight.top + highlight.height / 2, right: window.innerWidth - highlight.left + gap, transform: 'translateY(-50%)' };
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 z-[9998]" style={{ background: 'hsla(214, 65%, 8%, 0.7)' }} onClick={finish} />

      {/* Highlight cutout */}
      {highlight && (
        <div
          className="fixed z-[9999] rounded-lg pointer-events-none"
          style={{
            top: highlight.top - 6,
            left: highlight.left - 6,
            width: highlight.width + 12,
            height: highlight.height + 12,
            boxShadow: '0 0 0 9999px hsla(214, 65%, 8%, 0.7), 0 0 20px 4px hsl(var(--sidebar-primary) / 0.4)',
            border: '2px solid hsl(var(--sidebar-primary))',
          }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="fixed z-[10000] w-80 rounded-xl p-5 shadow-2xl"
        style={{
          background: 'hsl(var(--card))',
          border: '1px solid hsl(var(--border))',
          ...getTooltipStyle(),
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base font-bold" style={{ color: 'hsl(var(--foreground))' }}>
            {current.title}
          </h3>
          <button onClick={finish} className="p-1 rounded-md hover:bg-muted transition-colors">
            <X className="w-4 h-4" style={{ color: 'hsl(var(--muted-foreground))' }} />
          </button>
        </div>

        <p className="text-sm mb-4 leading-relaxed" style={{ color: 'hsl(var(--muted-foreground))' }}>
          {current.description}
        </p>

        {/* Progress */}
        <div className="flex gap-1.5 mb-4">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 flex-1 rounded-full transition-all duration-300"
              style={{
                background: i <= step ? 'hsl(var(--sidebar-primary))' : 'hsl(var(--muted))',
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium" style={{ color: 'hsl(var(--muted-foreground))' }}>
            {step + 1} / {TOUR_STEPS.length}
          </span>
          <div className="flex gap-2">
            {step > 0 && (
              <Button onClick={prev} variant="outline" size="sm" className="gap-1 text-xs">
                <ChevronLeft className="w-3.5 h-3.5" /> Anterior
              </Button>
            )}
            <Button onClick={next} size="sm" className="gap-1 text-xs">
              {isLast ? (
                <><Sparkles className="w-3.5 h-3.5" /> ¡Comenzar!</>
              ) : (
                <>Siguiente <ChevronRight className="w-3.5 h-3.5" /></>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
