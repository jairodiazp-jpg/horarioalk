import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, employees, currentDate, daysInMonth, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const employeeList = (employees || []).map((e: any) => `- ID: ${e.id}, Código: ${e.codigo}, Nombre: ${e.nombre}`).join('\n');

    const systemPrompt = `Eres un asistente inteligente para gestión de horarios de tiendas. Puedes:

1. RESPONDER PREGUNTAS GENERALES sobre horarios, turnos, gestión de personal, etc.
2. REALIZAR CAMBIOS DE TURNOS cuando el usuario lo solicite.

Fecha actual del calendario: ${currentDate || 'no especificada'}
Días en el mes actual: ${daysInMonth || 30}

Empleados disponibles en el departamento actual:
${employeeList}

Turnos disponibles:
- Mañana: A (05:30-13:30), A6 (05:30-12:30), A1 (06:00-14:00), A7 (06:00-13:00), A4 (07:00-16:00), A3 (07:00-15:00), A2 (08:00-14:00), A10 (07:30-17:30)
- Intermedio: I9 (07:00-14:00), I (08:00-17:00), I10 (08:00-16:00), I16 (08:30-17:30), I1 (09:00-18:00), I15 (09:00-17:00), I2 (10:00-19:00), I11 (10:00-18:00), I3 (11:00-20:00), I26 (11:00-19:00), I5 (11:30-20:30), I25 (11:30-19:30), I19 (12:00-20:00), I4 (12:00-21:00)
- Tarde: C (13:00-21:00), C6 (13:00-20:00), C1 (13:30-21:30), C7 (13:30-20:30), C2 (14:00-22:00), C8 (14:00-21:00), C5 (14:00-20:00), C3 (14:30-22:30), C9 (14:30-21:30), C4 (15:00-23:00), C10 (15:00-22:00)
- Noche: N (19:00-04:00), N14 (20:00-04:00), N11 (20:00-05:00), N1 (21:00-06:00), N10 (21:30-06:00), N12 (22:00-05:30), N3 (22:00-07:00)
- Especiales: LIBRE (día libre), COMP (compensatorio), LIC (licencia), VC (vacaciones), DF (día de la familia), ALT (alternado)

REGLAS OBLIGATORIAS DE DISTRIBUCIÓN DE TURNOS:
1. DESCANSO SEMANAL: Cada empleado tiene exactamente 1 día de descanso (LIBRE) por semana, que DEBE ser de lunes a viernes. Los días de descanso deben distribuirse equitativamente para que no todos descansen el mismo día.
2. ROTACIÓN SEMANAL: Los empleados se dividen en dos grupos. Una semana trabajan en turno de mañana (A) y la siguiente semana en turno de tarde (C/I), alternando semanalmente para equidad.
3. TURNO NOCTURNO: Siempre hay exactamente 2 empleados asignados al turno de noche (N). Estos empleados NO rotan a mañana/tarde.
4. DISTRIBUCIÓN EQUITATIVA: Los turnos deben estar bien distribuidos para que cada franja horaria tenga suficiente personal.

REGLAS para cambios de turno:
- Si dice "todo el equipo", "todos", genera una acción por CADA empleado.
- Si dice "del lunes al viernes", "toda la semana", genera para CADA día indicado.
- Si dice "del día 1 al 15", genera para cada día del 1 al 15.
- Si dice "mañana" sin código, usa A1. "tarde" = C1. "noche" = N10.
- Busca empleados por nombre parcial (ej: "Carlos" = primer empleado con CARLOS).
- IMPORTANTE: Al hacer cambios masivos, RESPETA las reglas de distribución arriba descritas.

Sé conversacional, amable y útil. Puedes responder preguntas, dar consejos de gestión, explicar turnos, etc.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "apply_shift_changes",
          description: "Aplica cambios de turno a uno o más empleados. Usa esta función SOLO cuando el usuario solicite cambios concretos de turno.",
          parameters: {
            type: "object",
            properties: {
              actions: {
                type: "array",
                description: "Lista de cambios de turno a aplicar",
                items: {
                  type: "object",
                  properties: {
                    employeeId: { type: "string", description: "ID del empleado" },
                    employeeName: { type: "string", description: "Nombre del empleado" },
                    day: { type: "number", description: "Día del mes (1-31)" },
                    newShift: { type: "string", description: "Código del nuevo turno" },
                  },
                  required: ["employeeId", "employeeName", "day", "newShift"],
                  additionalProperties: false,
                },
              },
              explanation: { type: "string", description: "Explicación breve de los cambios realizados" },
            },
            required: ["actions", "explanation"],
            additionalProperties: false,
          },
        },
      },
    ];

    // Build messages array with conversation history
    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    aiMessages.push({ role: "user", content: message });

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: aiMessages,
        tools,
        tool_choice: "auto",
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos agotados. Recarga tu saldo en Lovable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const choice = data.choices?.[0];

    // Check if the model used tool calling
    if (choice?.message?.tool_calls?.length > 0) {
      const toolCall = choice.message.tool_calls[0];
      if (toolCall.function.name === "apply_shift_changes") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          return new Response(JSON.stringify({
            type: "schedule_change",
            actions: args.actions || [],
            explanation: args.explanation || "Cambios aplicados.",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (parseErr) {
          console.error("Tool call parse error:", parseErr);
          return new Response(JSON.stringify({
            type: "chat",
            content: "Hubo un error procesando los cambios. Intenta de nuevo.",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      }
    }

    // Regular chat response
    const content = choice?.message?.content || "No pude generar una respuesta.";
    return new Response(JSON.stringify({
      type: "chat",
      content,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (e) {
    console.error("shift-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
