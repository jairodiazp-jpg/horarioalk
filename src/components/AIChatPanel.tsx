import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/data/stores';

interface ShiftAction {
  employeeId: string;
  employeeName: string;
  day: number;
  newShift: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  actions?: ShiftAction[];
}

interface AIChatPanelProps {
  employees: Employee[];
  year: number;
  month: number;
  onApplyActions: (actions: ShiftAction[]) => void;
}

const MONTHS_ES = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

export default function AIChatPanel({ employees, year, month, onApplyActions }: AIChatPanelProps) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const daysInMonth = new Date(year, month, 0).getDate();
      const { data, error } = await supabase.functions.invoke('shift-ai', {
        body: {
          message: text,
          employees: employees.map(e => ({ id: e.id, codigo: e.codigo, nombre: e.nombre })),
          currentDate: `${MONTHS_ES[month]} ${year}`,
          daysInMonth,
        },
      });

      if (error) throw error;

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      } else {
        const actions: ShiftAction[] = data.actions || [];
        const explanation: string = data.explanation || 'Listo.';
        setMessages(prev => [...prev, { role: 'assistant', content: explanation, actions }]);

        if (actions.length > 0) {
          onApplyActions(actions);
        }
      }
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `❌ Error: ${err.message || 'No se pudo conectar'}` }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110 no-print"
        style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}
      >
        <Sparkles className="w-6 h-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-96 rounded-xl shadow-2xl border flex flex-col no-print"
      style={{
        background: 'hsl(var(--card))',
        borderColor: 'hsl(var(--border))',
        height: '500px',
        maxHeight: 'calc(100vh - 100px)',
      }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 rounded-t-xl"
        style={{ background: 'hsl(var(--primary))', color: 'hsl(var(--primary-foreground))' }}>
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <span className="font-bold text-sm">Asistente de Turnos</span>
        </div>
        <button onClick={() => setOpen(false)} className="opacity-70 hover:opacity-100">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3" style={{ fontSize: '13px' }}>
        {messages.length === 0 && (
          <div className="text-center py-8 opacity-50">
            <Bot className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-xs">Escribe qué turno quieres cambiar.</p>
            <p className="text-[10px] mt-1 opacity-70">Ej: "Ponle turno de tarde a Carlos el día 15"</p>
            <p className="text-[10px] opacity-70">Ej masivo: "Pon a todos en A1 del día 1 al 5"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] rounded-lg px-3 py-2"
              style={{
                background: msg.role === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: msg.role === 'user' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}>
              <p className="text-xs whitespace-pre-wrap">{msg.content}</p>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 border-t pt-2 space-y-1" style={{ borderColor: 'hsl(var(--border))' }}>
                  <p className="text-[10px] font-bold opacity-70">Cambios aplicados:</p>
                  {msg.actions.map((a, j) => (
                    <div key={j} className="text-[10px] flex items-center gap-1">
                      <span>✅</span>
                      <span>{a.employeeName} → día {a.day}: <strong>{a.newShift}</strong></span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-lg px-3 py-2" style={{ background: 'hsl(var(--muted))' }}>
              <Loader2 className="w-4 h-4 animate-spin" style={{ color: 'hsl(var(--muted-foreground))' }} />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-3 border-t" style={{ borderColor: 'hsl(var(--border))' }}>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
            placeholder="Ej: Cambia a Carlos al turno C1 el día 10"
            className="flex-1 text-xs rounded-lg border px-3 py-2 outline-none"
            style={{
              background: 'hsl(var(--input))',
              borderColor: 'hsl(var(--border))',
              color: 'hsl(var(--foreground))',
            }}
          />
          <Button onClick={sendMessage} size="sm" disabled={loading || !input.trim()}
            className="px-3">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
