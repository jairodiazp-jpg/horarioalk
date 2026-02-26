import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function getSupabase() {
  return createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, employees, currentDate, daysInMonth, conversationHistory, storeId, department, imageBase64 } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const employeeList = (employees || []).map((e: any) => `- ID: ${e.id}, Código: ${e.codigo}, Nombre: ${e.nombre}, Actividad: ${e.actividad || 'N/A'}`).join('\n');

    const systemPrompt = `Eres un asistente inteligente para gestión de horarios de tiendas. Puedes:

1. RESPONDER PREGUNTAS GENERALES sobre horarios, turnos, gestión de personal, etc.
2. REALIZAR CAMBIOS DE TURNOS cuando el usuario lo solicite.
3. GESTIONAR EMPLEADOS: agregar, eliminar o modificar datos de empleados.
4. PROCESAR IMÁGENES: cuando el usuario sube una imagen con datos (horarios, listas de empleados, etc.), analízala y extrae la información para aplicar cambios.

Tienda actual: ${storeId || 'no especificada'}
Departamento actual: ${department || 'no especificado'}
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

REGLAS para cambios de turno:
- Si dice "todo el equipo", "todos", genera una acción por CADA empleado.
- Si dice "del lunes al viernes", "toda la semana", genera para CADA día indicado.
- Si dice "del día 1 al 15", genera para cada día del 1 al 15.
- Si dice "mañana" sin código, usa A1. "tarde" = C1. "noche" = N10.
- Busca empleados por nombre parcial (ej: "Carlos" = primer empleado con CARLOS).

REGLAS para gestión de empleados:
- Para agregar empleados necesitas: código (número), nombre completo, y actividad.
- Para eliminar, busca por nombre parcial o código.
- Para modificar, indica qué campo cambiar.

REGLAS para imágenes:
- Si el usuario sube una imagen con un horario, extrae los nombres y turnos y usa apply_shift_changes.
- Si sube una lista de empleados, usa manage_employees para agregarlos.
- Describe lo que ves en la imagen y confirma los cambios antes de aplicarlos si hay ambigüedad.

Sé conversacional, amable y útil. Puedes responder preguntas, dar consejos de gestión, explicar turnos, etc.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "apply_shift_changes",
          description: "Aplica cambios de turno a uno o más empleados.",
          parameters: {
            type: "object",
            properties: {
              actions: {
                type: "array",
                description: "Lista de cambios de turno",
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
              explanation: { type: "string", description: "Explicación breve de los cambios" },
            },
            required: ["actions", "explanation"],
            additionalProperties: false,
          },
        },
      },
      {
        type: "function",
        function: {
          name: "manage_employees",
          description: "Agrega, elimina o modifica empleados en el departamento actual.",
          parameters: {
            type: "object",
            properties: {
              operations: {
                type: "array",
                description: "Lista de operaciones sobre empleados",
                items: {
                  type: "object",
                  properties: {
                    action: { type: "string", enum: ["add", "remove", "update"], description: "Tipo de operación" },
                    employeeId: { type: "string", description: "ID del empleado (para remove/update)" },
                    codigo: { type: "string", description: "Código del empleado" },
                    nombre: { type: "string", description: "Nombre completo" },
                    actividad: { type: "string", description: "Actividad/cargo del empleado" },
                    updateField: { type: "string", description: "Campo a actualizar (nombre, codigo, actividad)" },
                    updateValue: { type: "string", description: "Nuevo valor del campo" },
                  },
                  required: ["action"],
                  additionalProperties: false,
                },
              },
              explanation: { type: "string", description: "Explicación de los cambios" },
            },
            required: ["operations", "explanation"],
            additionalProperties: false,
          },
        },
      },
    ];

    // Build messages array
    const aiMessages: any[] = [
      { role: "system", content: systemPrompt },
    ];

    if (conversationHistory && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        aiMessages.push({ role: msg.role, content: msg.content });
      }
    }

    // Build user message - support image
    if (imageBase64) {
      aiMessages.push({
        role: "user",
        content: [
          { type: "text", text: message || "Analiza esta imagen y extrae los datos que contiene." },
          { type: "image_url", image_url: { url: imageBase64 } },
        ],
      });
    } else {
      aiMessages.push({ role: "user", content: message });
    }

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

    // Handle tool calls
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
        }
      }

      if (toolCall.function.name === "manage_employees") {
        try {
          const args = JSON.parse(toolCall.function.arguments);
          const supabase = getSupabase();
          const results: any[] = [];

          for (const op of (args.operations || [])) {
            if (op.action === "add" && storeId && department) {
              const newId = `${storeId}-${department}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
              const { error } = await supabase.from("employees").insert({
                id: newId,
                store_id: storeId,
                departamento: department,
                codigo: op.codigo || "000000",
                nombre: op.nombre || "SIN NOMBRE",
                actividad: op.actividad || "AUXILIAR",
              });
              results.push({ action: "add", nombre: op.nombre, success: !error, error: error?.message });
            } else if (op.action === "remove" && op.employeeId) {
              const { error } = await supabase.from("employees").delete().eq("id", op.employeeId);
              if (!error) {
                await supabase.from("schedule_entries").delete().eq("employee_id", op.employeeId);
              }
              results.push({ action: "remove", employeeId: op.employeeId, success: !error, error: error?.message });
            } else if (op.action === "update" && op.employeeId && op.updateField && op.updateValue) {
              const allowedFields = ["nombre", "codigo", "actividad"];
              if (allowedFields.includes(op.updateField)) {
                const { error } = await supabase.from("employees").update({ [op.updateField]: op.updateValue }).eq("id", op.employeeId);
                results.push({ action: "update", employeeId: op.employeeId, field: op.updateField, success: !error, error: error?.message });
              }
            }
          }

          return new Response(JSON.stringify({
            type: "employee_change",
            operations: results,
            explanation: args.explanation || "Cambios de empleados aplicados.",
          }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        } catch (parseErr) {
          console.error("Employee tool parse error:", parseErr);
        }
      }

      return new Response(JSON.stringify({
        type: "chat",
        content: "Hubo un error procesando los cambios. Intenta de nuevo.",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
