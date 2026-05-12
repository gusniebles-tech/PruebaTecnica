// Servicio de chat

import type { Conversacion, Mensaje, EnviarMensajeDatos, RespuestaServicio } from '@/types'

const url = () => process.env.NEXT_PUBLIC_SUPABASE_URL!
const key = () => process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

function headers() {
  return {
    'Content-Type': 'application/json',
    'apikey': key(),
    'Authorization': `Bearer ${key()}`,
    'Prefer': 'return=representation',
  }
}

export async function obtenerOCrearConversacion(
  ticketId: string
): Promise<RespuestaServicio<Conversacion>> {
  const resBuscar = await fetch(
    `${url()}/rest/v1/conversaciones?ticket_id=eq.${ticketId}&abierta=eq.true&limit=1`,
    { headers: { apikey: key(), Authorization: `Bearer ${key()}` } }
  )

  const existentes = await resBuscar.json()

  if (existentes.length > 0) {
    return { datos: existentes[0], error: null }
  }

  const resCrear = await fetch(`${url()}/rest/v1/conversaciones`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ ticket_id: ticketId, abierta: true }),
  })

  const data = await resCrear.json()

  if (!resCrear.ok) {
    return { datos: null, error: 'No se pudo crear la conversación.' }
  }

  return { datos: data[0], error: null }
}

// Enviar un mensaje
export async function enviarMensaje(
  datos: EnviarMensajeDatos
): Promise<RespuestaServicio<Mensaje>> {
  const res = await fetch(`${url()}/rest/v1/mensajes`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({
      conversacion_id: datos.conversacion_id,
      autor_id: datos.autor_id,
      contenido: datos.contenido,
      es_ia: datos.es_ia ?? false,
      leido: false,
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { datos: null, error: 'No se pudo enviar el mensaje.' }
  }

  return { datos: data[0], error: null }
}

// Cerrar una conversación
export async function cerrarConversacion(
  conversacionId: string
): Promise<RespuestaServicio<null>> {
  const res = await fetch(
    `${url()}/rest/v1/conversaciones?id=eq.${conversacionId}`,
    {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify({ abierta: false }),
    }
  )

  if (!res.ok) {
    return { datos: null, error: 'No se pudo cerrar la conversación.' }
  }

  return { datos: null, error: null }
}