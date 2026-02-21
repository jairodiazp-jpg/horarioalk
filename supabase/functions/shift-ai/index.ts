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
    const { message, employees, currentDate } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const employeeList = (employees || []).map((e: any) => `- ID: ${e.id}, Código: ${e.codigo}, Nombre: ${e.nombre}`).join('\n');

    const systemPrompt = `Eres un asistente de gestión de horarios de una tienda. Tu trabajo es interpretar solicitudes de cambio de turno y devolver instrucciones estructuradas en JSON.

Fecha actual del calendario: ${currentDate || 'no especificada'}

Empleados disponibles en el departamento actual:
${employeeList}

Turnos disponibles:
- Mañana: A, A1, A2, A3, A4, A6, A7, A10
- Intermedio: I, I1, I2, I3, I4, I5, I9, I10, I11, I15, I16, I19, I25, I26
- Tarde: C, C1, C2, C3, C4, C5, C6, C7, C8, C9, C10
- Noche: N, N1, N3, N10, N11, N12, N14
- Especiales: LIBRE, COMP, LIC, VC, DF

Cuando el usuario pida un cambio de turno, responde SIEMPRE con un JSON válido con esta estructura:
{
  "actions": [
    { "employeeId": "id_del_empleado", "employeeName": "nombre", "day": numero_dia, "newShift": "CODIGO_TURNO" }
  ],
  "explanation": "Explicación breve de lo que se hizo"
}

Si no puedes identificar al empleado o la fecha, responde con:
{ "actions": [], "explanation": "No pude identificar... (razón)" }

Reglas:
- Si el usuario dice "mañana" sin especificar código, usa A1.
- Si dice "tarde", usa C1.
- Si dice "noche", usa N10.
- Busca al empleado por nombre parcial (ej. "Carlos" = primer empleado que contenga CARLOS).
- Si dice un día como "lunes 3", el día es 3.
- Si dice "esta semana" calcula los días basándote en la fecha actual.
- Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
      }),
    });

    if (!response.ok) {
      const status = response.status;
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA agotados." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", status, t);
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"actions":[],"explanation":"Sin respuesta"}';

    // Try to parse the AI response as JSON
    let parsed;
    try {
      // Strip markdown code fences if present
      const cleaned = content.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = { actions: [], explanation: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("shift-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Error desconocido" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
