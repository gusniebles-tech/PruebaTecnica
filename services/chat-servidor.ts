// Servicio de chat

import { crearClienteServidor } from '@/lib/supabase-servidor'
import type { Conversacion, Mensaje } from '@/types'

// Obtener todas las conversaciones
export async function obtenerConversaciones(): Promise<Conversacion[]> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('conversaciones')
    .select(`
      *,
      ticket:tickets(id, titulo, prioridad, estado)
    `)
    .order('creado_en', { ascending: false })

  if (error) {
    console.error('Error al obtener conversaciones:', error)
    return []
  }

  return data || []
}

// Obtener mensajes de una conversación
export async function obtenerMensajes(conversacionId: string): Promise<Mensaje[]> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('mensajes')
    .select(`
      *,
      autor:profiles!autor_id(id, nombre, rol)
    `)
    .eq('conversacion_id', conversacionId)
    .order('creado_en', { ascending: true })

  if (error) {
    console.error('Error al obtener mensajes:', error)
    return []
  }

  return data || []
}

// Obtener una conversación por ID
export async function obtenerConversacionPorId(id: string): Promise<Conversacion | null> {
  const supabase = await crearClienteServidor()

  const { data, error } = await supabase
    .from('conversaciones')
    .select(`
      *,
      ticket:tickets(id, titulo, prioridad, estado, descripcion)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error al obtener conversación:', error)
    return null
  }

  return data
}