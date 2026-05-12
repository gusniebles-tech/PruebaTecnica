// Protege rutas que requieren autenticación

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(solicitud: NextRequest) {
  const respuesta = NextResponse.next({
    request: {
      headers: solicitud.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return solicitud.cookies.getAll()
        },
        setAll(cookiesPorSetear: {
          name: string
          value: string
          options: any
        }[]
        ) {
          cookiesPorSetear.forEach(({ name, value, options }) => {
            solicitud.cookies.set(name, value)
            respuesta.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = solicitud.nextUrl

  if (!user && !pathname.startsWith('/auth')) {
    return NextResponse.redirect(new URL('/auth/login', solicitud.url))
  }

  if (user && pathname.startsWith('/auth/login')) {
    return NextResponse.redirect(new URL('/dashboard', solicitud.url))
  }

  return respuesta
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}