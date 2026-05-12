// Servicio de autenticación

import { crearClienteServidor } from '@/lib/supabase-servidor'
import type { Perfil } from '@/types'

// Obtener el usuario actual con su perfil completo
export async function obtenerUsuarioActual(): Promise<Perfil | null> {
  const supabase = await crearClienteServidor()

  const { data: { user }, error } = await supabase.auth.getUser()

  if (!user) return null

  const { data: perfil, error: errorPerfil } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return perfil
}

// Verificar si el usuario tiene rol de agente
export async function esAgente(): Promise<boolean> {
  const usuario = await obtenerUsuarioActual()
  return usuario?.rol === 'agent'
}
