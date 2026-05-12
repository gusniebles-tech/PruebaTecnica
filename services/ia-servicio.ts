// Servicio de IA

import type { CategoriaTicket, PrioridadTicket, SugerenciaIA, SentimientoTicket } from '@/types'

const hayApiKey = !!process.env.GEMINI_API_KEY

console.log('[IA] GEMINI_API_KEY disponible:', hayApiKey)

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`

async function llamarGemini(prompt: string): Promise<string> {
  const res = await fetch(`${GEMINI_URL}?key=${process.env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.3, maxOutputTokens: 400 },
    }),
  })
  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}


// Analizar Ticket
export async function analizarTicket(
  titulo: string,
  descripcion: string
): Promise<SugerenciaIA> {
  if (hayApiKey) {
    return analizarConGemini(titulo, descripcion)
  }
  return analizarConReglasSimples(titulo, descripcion)
}


// Generar respuesta
export async function generarRespuestaAgente(
  titulo: string,
  descripcion: string,
  categoria: string,
  prioridad: string
): Promise<string> {
  if (hayApiKey) {
    return generarRespuestaConGemini(titulo, descripcion, categoria, prioridad)
  }
  return generarRespuestaFallback(categoria)
}

// Pregunta Libre
export async function preguntarSobreTicket(
  pregunta: string,
  contexto: string
): Promise<string> {
  if (hayApiKey) {
    return preguntarConGemini(pregunta, contexto)
  }
  return respuestaFallbackPregunta(pregunta)
}

// Implementación con Gemini
async function analizarConGemini(titulo: string, descripcion: string): Promise<SugerenciaIA> {
  const prompt = `Analiza este ticket de soporte técnico. Responde ÚNICAMENTE con un objeto JSON válido, sin texto adicional, sin markdown, sin bloques de código.

Título: ${titulo}
Descripción: ${descripcion}

Responde exactamente con este formato JSON:
{
  "categoria": "hardware|software|red|acceso|otro",
  "prioridad": "baja|media|alta|urgente",
  "sentimiento": "frustrado|neutral|urgente",
  "tituloMejorado": "título mejorado aquí, o null si está bien",
  "descripcionMejorada": "sugerencia de mejora aquí, o null si está bien"
}`

  try {
    const texto = await llamarGemini(prompt)
    const limpio = texto.replace(/```json|```/g, '').trim()
    return JSON.parse(limpio)
  } catch {
    return analizarConReglasSimples(titulo, descripcion)
  }
}

async function generarRespuestaConGemini(
  titulo: string,
  descripcion: string,
  categoria: string,
  prioridad: string
): Promise<string> {
  const prompt = `Eres un agente de soporte técnico. Escribe una respuesta inicial breve (máximo 3 oraciones) para este ticket. Sé profesional y empático. Responde solo con el texto de la respuesta, sin explicaciones adicionales.

Ticket: ${titulo}
Descripción: ${descripcion}
Categoría: ${categoria}
Prioridad: ${prioridad}`

  try {
    return await llamarGemini(prompt)
  } catch {
    return generarRespuestaFallback(categoria)
  }
}

async function preguntarConGemini(pregunta: string, contexto: string): Promise<string> {
  const prompt = `Eres un asistente para agentes de soporte técnico. Responde de forma concisa y útil en español.

Contexto del ticket:
${contexto}

Pregunta del agente: ${pregunta}`

  try {
    return await llamarGemini(prompt)
  } catch {
    return respuestaFallbackPregunta(pregunta)
  }
}

// FallBack
function analizarConReglasSimples(titulo: string, descripcion: string): SugerenciaIA {
  const texto = `${titulo} ${descripcion}`.toLowerCase()

  const categoria = detectarCategoria(texto)
  const prioridad = detectarPrioridad(texto)
  const sentimiento = detectarSentimiento(texto)

  const tituloMejorado = titulo.trim().length < 10
    ? `Problema de ${categoria}: ${descripcion.slice(0, 60).trim()}`
    : null

  const descripcionMejorada = descripcion.trim().length < 30
    ? 'Por favor agrega más detalles: ¿cuándo ocurrió?, ¿qué pasos seguiste?, ¿qué mensaje de error apareció?'
    : null

  return { categoria, prioridad, sentimiento, tituloMejorado, descripcionMejorada }
}

function detectarCategoria(texto: string): CategoriaTicket {
  if (/impresora|monitor|teclado|mouse|computador|pc|disco|pantalla|hardware|equipo/.test(texto)) return 'hardware'
  if (/contraseña|password|acceso|login|usuario|cuenta|permisos|bloqueado/.test(texto)) return 'acceso'
  if (/internet|red|wifi|conexion|cable|router|sin red|lento|ping/.test(texto)) return 'red'
  if (/programa|software|aplicacion|sistema|error|instalar|actualizar|windows|office/.test(texto)) return 'software'
  return 'otro'
}

function detectarPrioridad(texto: string): PrioridadTicket {
  if (/urgente|critico|nadie puede|sin acceso|caido|emergencia|todos los usuarios/.test(texto)) return 'urgente'
  if (/no puedo trabajar|bloqueado|importante|varios usuarios|afecta/.test(texto)) return 'alta'
  if (/lento|a veces|ocasional|intermitente/.test(texto)) return 'baja'
  return 'media'
}

function detectarSentimiento(texto: string): SentimientoTicket {
  if (/urgente|critico|inmediatamente|inaceptable|grave/.test(texto)) return 'urgente'
  if (/frustr|molest|enojad|harto|desesper|cansado/.test(texto)) return 'frustrado'
  return 'neutral'
}

function generarRespuestaFallback(categoria: string): string {
  const respuestas: Record<string, string> = {
    hardware: 'Hemos recibido tu reporte. Un técnico revisará el equipo a la brevedad y te contactará. Por favor no realices cambios en el dispositivo hasta ser atendido.',
    software: 'Recibimos tu reporte. Revisaremos el problema y te contactaremos con una solución. Si puedes, adjunta capturas de pantalla del error.',
    red: 'Registramos tu problema de conectividad. Verificaremos el estado de la red. Mientras tanto, intenta reiniciar el router o conectarte por cable.',
    acceso: 'Recibimos tu solicitud. Por seguridad verificaremos tu identidad antes de proceder. Te contactaremos en breve.',
    otro: 'Hemos recibido tu solicitud y la revisaremos pronto. Te contactaremos con una respuesta.',
  }
  return respuestas[categoria] ?? respuestas['otro']
}

function respuestaFallbackPregunta(pregunta: string): string {
  const p = pregunta.toLowerCase()
  if (/responder|decir|contestar/.test(p)) {
    return 'Confirma al usuario que recibiste el ticket, indica que está siendo atendido y proporciona un tiempo estimado de resolución.'
  }
  if (/solución|resolver|arreglar/.test(p)) {
    return 'Reproduce el problema en un entorno de prueba, identifica la causa raíz, aplica la solución y verifica con el usuario que quedó resuelto.'
  }
  if (/prioridad/.test(p)) {
    return '¿Cuántos usuarios están afectados? ¿Impide trabajar completamente? Si la respuesta es sí, considera prioridad alta o urgente.'
  }
  return 'Revisa el historial del ticket, contacta al usuario para obtener más detalles y documenta cada paso que tomes para resolverlo.'
}