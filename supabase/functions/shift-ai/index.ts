import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractJson(raw: string): any {
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
  const start = cleaned.search(/[\{\[]/);
  if (start === -1) return { actions: [], explanation: raw };
  cleaned = cleaned.substring(start);

  // Try direct parse
  try { return JSON.parse(cleaned); } catch { /* continue */ }

  // Fix trailing commas and control chars
  cleaned = cleaned
    .replace(/,\s*}/g, '}')
    .replace(/,\s*]/g, ']')
    .replace(/[\x00-\x1F\x7F]/g, '');

  try { return JSON.parse(cleaned); } catch { /* continue */ }

  // Handle truncated JSON: try to close open structures
  let braces = 0, brackets = 0;
  for (const ch of cleaned) {
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }

  // Remove trailing incomplete object (after last comma)
  let repaired = cleaned.replace(/,\s*\{[^}]*$/, '');
  
  // Close remaining open brackets/braces
  braces = 0; brackets = 0;
  for (const ch of repaired) {
    if (ch === '{') braces++;
    if (ch === '}') braces--;
    if (ch === '[') brackets++;
    if (ch === ']') brackets--;
  }
  while (brackets > 0) { repaired += ']'; brackets--; }
  while (braces > 0) { repaired += '}'; braces--; }

  try { return JSON.parse(repaired); } catch {
    return { actions: [], explanation: raw.substring(0, 200) };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, employees, currentDate, daysInMonth } = await req.json();
    const GROQ_API_KEY = Deno.env.get("GROQ_API_KEY");
    if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured");

    const employeeList = (employees || []).map((e: any) => `- ID: ${e.id}, Código: ${e.codigo}, Nombre: ${e.nombre}`).join('\n');

    const systemPrompt = `Eres un asistente de gestión de horarios de una tienda. Tu trabajo es interpretar solicitudes de cambio de turno y devolver instrucciones estructuradas en JSON.

Fecha actual del calendario: ${currentDate || 'no especificada'}
Días en el mes actual: ${daysInMonth || 30}

Empleados disponibles en el departamento actual:
${employeeList}

Turnos disponibles:
- Mañana: A, A1, A2, A3, A4, A6, A7, A10
- Intermedio: I, I1, I2, I3, I4, I5, I9, I10, I11, I15, I16, I19, I25, I26
- Tarde: C, C1, C2, C3, C4, C5, C6, C7, C8, C9, C10
- Noche: N, N1, N3, N10, N11, N12, N14
- Especiales: LIBRE, COMP, LIC, VC, DF

CAMBIOS MASIVOS — Instrucciones importantes:
- Si el usuario dice "todo el equipo", "todos", "a todos los empleados", genera una acción por CADA empleado de la lista.
- Si dice "del lunes al viernes" o "toda la semana", genera acciones para CADA día indicado.
- Si dice "del día 1 al 15", genera acciones para cada día del 1 al 15.
- Puedes generar MUCHAS acciones en un solo JSON. No hay límite.

Responde SIEMPRE con un JSON válido con esta estructura:
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
- Responde SOLO con el JSON, sin texto adicional ni markdown.`;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message },
        ],
        temperature: 0.1,
        max_tokens: 16000,
      }),
    });

    if (!response.ok) {
      const status = response.status;
      const t = await response.text();
      console.error("Groq API error:", status, t);
      if (status === 429) {
        return new Response(JSON.stringify({ error: "Demasiadas solicitudes. Intenta de nuevo en unos segundos." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: "Error del servicio de IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '{"actions":[],"explanation":"Sin respuesta"}';
    const finishReason = data.choices?.[0]?.finish_reason;

    console.log("Groq finish_reason:", finishReason, "content length:", content.length);

    const parsed = extractJson(content);

    // Warn if truncated
    if (finishReason === 'length' && parsed.actions?.length > 0) {
      parsed.explanation = (parsed.explanation || '') + ` ⚠️ Respuesta truncada, se aplicaron ${parsed.actions.length} cambios parciales.`;
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