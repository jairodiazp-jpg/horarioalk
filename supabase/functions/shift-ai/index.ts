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
- Mañana: A, A1, A2, A3, A4, A6, A7, A10
- Intermedio: I, I1, I2, I3, I4, I5, I9, I10, I11, I15, I16, I19, I25, I26
- Tarde: C, C1, C2, C3, C4, C5, C6, C7, C8, C9, C10
- Noche: N, N1, N3, N10, N11, N12, N14
- Especiales: LIBRE (día libre), COMP (compensatorio), LIC (licencia), VC (vacaciones), DF (día festivo)

REGLAS para cambios de turno:
- Si dice "todo el equipo", "todos", genera una acción por CADA empleado.
- Si dice "del lunes al viernes", "toda la semana", genera para CADA día indicado.
- Si dice "del día 1 al 15", genera para cada día del 1 al 15.
- Si dice "mañana" sin código, usa A1. "tarde" = C1. "noche" = N10.
- Busca empleados por nombre parcial (ej: "Carlos" = primer empleado con CARLOS).

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
