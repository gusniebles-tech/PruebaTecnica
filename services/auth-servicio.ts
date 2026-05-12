// Servicio de autenticación

import { createBrowserClient } from '@supabase/ssr'

export async function iniciarSesion(email: string, contrasena: string) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password: contrasena,
  })

  if (error) {
    return { datos: null, error: 'Credenciales incorrectas. Verifica tu email y contraseña.' }
  }

  return { datos: data, error: null }
}

export async function cerrarSesion() {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  await supabase.auth.signOut()
}