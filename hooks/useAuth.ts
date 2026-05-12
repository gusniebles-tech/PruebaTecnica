'use client'

// Hook para manejar el estado de autenticación en Client Components

import { useEffect, useMemo, useState } from 'react'
import { crearClienteNavegador } from '@/lib/supabase-cliente'
import type { Perfil } from '@/types'

export function useAuth() {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [cargando, setCargando] = useState(true)

  const supabase = useMemo(() => crearClienteNavegador(), [])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (evento, sesion) => {
        console.log('[useAuth] evento:', evento, '| user:', sesion?.user?.id ?? 'none')

        if (sesion?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sesion.user.id)
            .single()

          if (error) {
            console.error('[useAuth] Error al obtener perfil:', error.message)
          }
          setPerfil(data ?? null)
        } else {
          setPerfil(null)
        }

        setCargando(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const esAgente = perfil?.rol === 'agent'
  const esUsuario = perfil?.rol === 'user'

  return { perfil, cargando, esAgente, esUsuario }
}