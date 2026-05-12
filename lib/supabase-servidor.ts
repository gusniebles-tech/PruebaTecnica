// Cliente de Supabase para usar en el servidor
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function crearClienteServidor() {
  const tiendaCookies = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return tiendaCookies.getAll()
        },
        setAll(cookiesPorSetear: {
          name: string
          value: string
          options: any
        }[]) {
          try {
            cookiesPorSetear.forEach(({ name, value, options }) => {
              tiendaCookies.set(name, value, options)
            })
          } catch {

          }
        },
      },
    }
  )
}
