// Funciones de tickets que corren en el servidor

import { crearClienteServidor } from '@/lib/supabase-servidor'
import type { Ticket, HistorialTicket, FiltrosTicket } from '@/types'

export async function obtenerTickets(filtros?: FiltrosTicket): Promise<Ticket[]> {
  const supabase = await crearClienteServidor()

  let consulta = supabase
    .from('tickets')
    .select(`
      *,
      solicitante:profiles!solicitante_id(id, nombre, rol),
      agente:profiles!asignado_a(id, nombre, rol)
    `)
    .order('creado_en', { ascending: false })

  if (filtros?.estado && filtros.estado !== 'todos') {
    consulta = consulta.eq('estado', filtros.estado)
  }

  if (filtros?.categoria && filtros.categoria !== 'todos') {
    consulta = consulta.eq('categoria', filtros.categoria)
  }

  const { data, error } = await consulta

  if (error) {
    console.error('Error al obtener tickets:', error)
    return []
  }

  return data || []
}

export async function obtenerTicketPorId(id: string): Promise<Ticket | null> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('tickets')
    .select(`
      *,
      solicitante:profiles!solicitante_id(id, nombre, rol),
      agente:profiles!asignado_a(id, nombre, rol)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al obtener ticket:', error)
    return null
  }

  return data
}

export async function obtenerHistorialTicket(ticketId: string): Promise<HistorialTicket[]> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('ticket_historial')
    .select(`
      *,
      agente:profiles!cambiado_por(id, nombre, rol)
    `)
    .eq('ticket_id', ticketId)
    .order('creado_en', { ascending: false })

  if (error) {
    console.error('Error al obtener historial:', error)
    return []
  }

  return data || []
}

export async function obtenerAgentes(): Promise<{ id: string; nombre: string }[]> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('profiles')
    .select('id, nombre')
    .eq('rol', 'agent')
    .order('nombre')

  if (error) {
    console.error('Error al obtener agentes:', error)
    return []
  }
  return data || []
}