'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { crearClienteNavegador } from '@/lib/supabase-cliente'
import Image from 'next/image'

export function Navbar() {
  const { perfil, esAgente } = useAuth()
  const [cerrando, setCerrando] = useState(false)

  const handleLogout = () => {
    document.cookie.split(';').forEach((cookie) => {
      const nombre = cookie.split('=')[0].trim()
      document.cookie = `${nombre}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/`
    })
    window.location.href = '/auth/login'
  }

  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">

          <Link href="/dashboard" className="flex items-center">
            <div className="w-[130px] h-7 rounded flex items-center justify-center">
              <Image
                src="/LogoEduLabs.png"
                alt="Imagen externa"
                width={500}
                height={300}
              />
            </div>
            <span className="font-semibold text-slate-900 text-sm">Prueba Técnica ADSO</span>
          </Link>

          <div className="flex items-center gap-1">
            <Link
              href="/dashboard"
              className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
            >
              Dashboard
            </Link>

            {esAgente ? (
              <>
                <Link href="/admin/tickets" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Tickets
                </Link>
                <Link href="/admin/chat" className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors">
                  Chat
                </Link>
              </>
            ) : (
              <Link
                href="/tickets"
                className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-md transition-colors"
              >
                Mis Tickets
              </Link>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-slate-900">{perfil?.nombre}</p>
              <p className="text-xs text-slate-500">
                {perfil?.rol === 'agent' ? 'Agente' : 'Usuario'}
              </p>
            </div>
            <button
              onClick={handleLogout}
              disabled={cerrando}
              className="px-3 py-1.5 text-sm text-slate-600 border border-slate-200 rounded-md hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {cerrando ? 'Saliendo...' : 'Cerrar sesión'}
            </button>
          </div>

        </div>
      </div>
    </nav>
  )
}