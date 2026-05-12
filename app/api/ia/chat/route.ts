import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { mensaje, historial } = await request.json()

    if (!mensaje) {
      return NextResponse.json({ error: 'Mensaje requerido.' }, { status: 400 })
    }

    const hayApiKey = !!process.env.GEMINI_API_KEY

    if (hayApiKey) {
      const respuesta = await responderConGemini(mensaje, historial || [])
      return NextResponse.json({ respuesta })
    }

    return NextResponse.json({ respuesta: respuestaFallbackChat(mensaje) })
  } catch {
    return NextResponse.json({ error: 'No se pudo procesar el mensaje.' }, { status: 500 })
  }
}

async function responderConGemini(
  mensaje: string,
  historial: { rol: string; contenido: string }[]
): Promise<string> {
  const historialTexto = historial
    .slice(-6)
    .map(m => `${m.rol}: ${m.contenido}`)
    .join('\n')

  const prompt = `Eres un asistente de soporte técnico amable y profesional. Responde de forma concisa (máximo 2 oraciones) y en español.

Historial de la conversación:
${historialTexto}

Nuevo mensaje del usuario: ${mensaje}`

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 200 },
      }),
    }
  )

  const data = await res.json()
  return data.candidates[0].content.parts[0].text
}

function respuestaFallbackChat(mensaje: string): string {
  const texto = mensaje.toLowerCase()

  if (/hola|buenos|buenas/.test(texto)) {
    return 'Hola, bienvenido al soporte técnico. ¿En qué puedo ayudarte hoy?'
  }
  if (/contraseña|password|acceso|login/.test(texto)) {
    return 'Para problemas de acceso, necesito verificar tu identidad. ¿Puedes indicarme tu nombre de usuario?'
  }
  if (/internet|red|wifi|conexion/.test(texto)) {
    return 'Entiendo que tienes problemas de conectividad. ¿El problema es con wifi, cable, o ambos?'
  }
  if (/lento|tarda|demora/.test(texto)) {
    return 'Los problemas de rendimiento pueden tener varias causas. ¿Cuándo comenzó este problema?'
  }
  if (/gracias|listo|resuelto/.test(texto)) {
    return 'Con gusto. Si necesitas más ayuda no dudes en escribirnos.'
  }

  return 'Gracias por contactarnos. Un agente revisará tu caso pronto. ¿Puedes describir el problema con más detalle?'
}