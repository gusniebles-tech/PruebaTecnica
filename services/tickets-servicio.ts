// Servicio de tickets
// Funciones de tickets que corren en el navegador

import { crearClienteNavegador } from '@/lib/supabase-cliente'
import type {
  Ticket,
  CrearTicketDatos,
  ActualizarEstadoDatos,
  RespuestaServicio
} from '@/types'

export async function crearTicket(
  datos: CrearTicketDatos,
  solicitanteId: string
): Promise<RespuestaServicio<Ticket>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${url}/rest/v1/tickets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key!,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({
      titulo: datos.titulo,
      descripcion: datos.descripcion,
      categoria: datos.categoria,
      prioridad: datos.prioridad,
      solicitante_id: solicitanteId,
      estado: 'abierto',
    }),
  })

  const data = await res.json()

  if (!res.ok) {
    return { datos: null, error: data.message || 'No se pudo crear el ticket.' }
  }

  return { datos: data[0], error: null }
}

export async function actualizarEstadoTicket(
  ticketId: string,
  estadoActual: string,
  actualizacion: ActualizarEstadoDatos,
  agenteId: string
): Promise<RespuestaServicio<Ticket>> {
  const supabase = crearClienteNavegador()

  const { data, error } = await supabase
    .from('tickets')
    .update({ estado: actualizacion.estado })
    .eq('id', ticketId)
    .select()
    .single()

  console.log('SUPABASE INSERT:', { data, error })

  if (error) {
    return { datos: null, error: 'No se pudo actualizar el ticket.' }
  }

  await supabase.from('ticket_historial').insert({
    ticket_id: ticketId,
    estado_anterior: estadoActual,
    estado_nuevo: actualizacion.estado,
    cambiado_por: agenteId,
    nota: actualizacion.nota || null,
  })

  return { datos: data, error: null }
}

export async function eliminarTicket(ticketId: string): Promise<RespuestaServicio<null>> {
  const supabase = crearClienteNavegador()

  const { data: ticket } = await supabase
    .from('tickets')
    .select('estado')
    .eq('id', ticketId)
    .single()

  if (ticket?.estado !== 'cerrado') {
    return { datos: null, error: 'Solo se pueden eliminar tickets con estado "Cerrado".' }
  }

  const { error } = await supabase
    .from('tickets')
    .delete()
    .eq('id', ticketId)

  if (error) {
    return { datos: null, error: 'No se pudo eliminar el ticket.' }
  }

  return { datos: null, error: null }
}

export async function asignarTicket(
  ticketId: string,
  agenteId: string
): Promise<RespuestaServicio<Ticket>> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  const res = await fetch(`${url}/rest/v1/tickets?id=eq.${ticketId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'apikey': key!,
      'Authorization': `Bearer ${key}`,
      'Prefer': 'return=representation',
    },
    body: JSON.stringify({ asignado_a: agenteId }),
  })

  const data = await res.json()
  if (!res.ok) {
    return { datos: null, error: 'No se pudo asignar el ticket.' }
  }
  return { datos: data[0], error: null }
}