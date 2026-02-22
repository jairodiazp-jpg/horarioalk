import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Employee } from '@/data/stores';
import ReactMarkdown from 'react-markdown';

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
      
      // Send conversation history for context
      const conversationHistory = messages.map(m => ({
        role: m.role,
        content: m.content,
      }));

      const { data, error } = await supabase.functions.invoke('shift-ai', {
        body: {
          message: text,
          employees: employees.map(e => ({ id: e.id, codigo: e.codigo, nombre: e.nombre })),
          currentDate: `${MONTHS_ES[month]} ${year}`,
          daysInMonth,
          conversationHistory,
        },
      });

      if (error) throw error;

      if (data.error) {
        setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${data.error}` }]);
      } else if (data.type === 'schedule_change') {
        const actions: ShiftAction[] = data.actions || [];
        const explanation: string = data.explanation || 'Cambios aplicados.';
        setMessages(prev => [...prev, { role: 'assistant', content: explanation, actions }]);
        if (actions.length > 0) {
          onApplyActions(actions);
        }
      } else {
        // General chat response
        setMessages(prev => [...prev, { role: 'assistant', content: data.content || 'Sin respuesta.' }]);
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
          <span className="font-bold text-sm">Asistente IA</span>
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
            <p className="text-xs font-medium">¡Hola! Soy tu asistente de horarios.</p>
            <p className="text-[10px] mt-2 opacity-80">Puedo responder preguntas y modificar turnos:</p>
            <div className="mt-2 space-y-1 text-[10px] opacity-70">
              <p>💬 "¿Qué turnos hay disponibles?"</p>
              <p>📝 "Ponle turno C1 a Carlos el día 15"</p>
              <p>📋 "Pon a todos en A1 del día 1 al 5"</p>
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] rounded-lg px-3 py-2"
              style={{
                background: msg.role === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--muted))',
                color: msg.role === 'user' ? 'hsl(var(--primary-foreground))' : 'hsl(var(--foreground))',
              }}>
              <div className="text-xs whitespace-pre-wrap prose prose-sm max-w-none [&>*]:m-0 [&>p]:my-1">
                {msg.role === 'assistant' ? (
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                ) : (
                  <p>{msg.content}</p>
                )}
              </div>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 border-t pt-2 space-y-1" style={{ borderColor: 'hsl(var(--border))' }}>
                  <p className="text-[10px] font-bold opacity-70">✅ {msg.actions.length} cambio(s) aplicado(s)</p>
                  {msg.actions.slice(0, 10).map((a, j) => (
                    <div key={j} className="text-[10px] flex items-center gap-1">
                      <span>{a.employeeName} → día {a.day}: <strong>{a.newShift}</strong></span>
                    </div>
                  ))}
                  {msg.actions.length > 10 && (
                    <p className="text-[10px] opacity-60">...y {msg.actions.length - 10} más</p>
                  )}
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
            placeholder="Pregunta o pide un cambio de turno..."
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
