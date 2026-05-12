'use client'

// Hook que escucha mensajes nuevos en tiempo real usando Supabase Realtime

import { useEffect, useState, useMemo } from 'react'
import { crearClienteNavegador } from '@/lib/supabase-cliente'
import type { Mensaje, Perfil  } from '@/types'

export function useChat(conversacionId: string, mensajesIniciales: Mensaje[]) {
  const [mensajes, setMensajes] = useState<Mensaje[]>(mensajesIniciales)

  const supabase = useMemo(() => crearClienteNavegador(), [])

  useEffect(() => {
    setMensajes(mensajesIniciales)
  }, [mensajesIniciales])

  useEffect(() => {
    if (!conversacionId) return

    const canal = supabase
      .channel(`chat:${conversacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes',
          filter: `conversacion_id=eq.${conversacionId}`,
        },
        async (payload) => {
          const { data } = await supabase
            .from('profiles')
            .select('id, nombre, rol, creado_en')
            .eq('id', payload.new.autor_id)
            .single()

          const autor: Perfil | undefined = data || undefined

          const mensajeNuevo: Mensaje = {
            ...(payload.new as Mensaje),
            autor,
          }

          setMensajes(prev => {
            const yaExiste = prev.some(m => m.id === mensajeNuevo.id)
            if (yaExiste) return prev
            return [...prev, mensajeNuevo]
          })
        }
      )
      .subscribe()

    // Limpiar suscripción al salir
    return () => {
      supabase.removeChannel(canal)
    }
  }, [conversacionId, supabase])

  return { mensajes }
}