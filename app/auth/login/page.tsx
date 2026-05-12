'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { iniciarSesion } from '@/services/auth-servicio'
import Image from 'next/image'

export default function PaginaLogin() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setCargando(true)

    const { error: errorLogin } = await iniciarSesion(email, contrasena)

    setCargando(false)

    if (errorLogin) {
      setError(errorLogin)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <div className="w-auto h-auto  rounded-lg flex items-center justify-center mx-auto">
            <Image
              src="/LogoEduLabs.png"
              alt="Imagen externa"
              width={500}
              height={300}
              priority
            />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">Prueba Técnica ADSO</h1>
        </div>

        {/* Tarjeta del formulario */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Mensaje de error */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@correo.com"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
              />
            </div>

            {/* Botón de ingreso */}
            <button
              type="submit"
              disabled={cargando}
              className="w-full bg-slate-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors disabled:opacity-50 mt-2"
            >
              {cargando ? 'Ingresando...' : 'Ingresar'}
            </button>

          </form>
        </div>

        {/* Credenciales de prueba */}
        <div className="mt-5 p-4 bg-slate-100 rounded-lg border border-slate-200">
          <p className="text-xs font-medium text-slate-600 mb-2">Usuarios de prueba:</p>
          <div className="space-y-1 text-xs text-slate-500">
            <p><span className="font-medium">Usuario:</span> usuario@helpdesk.com / 123456</p>
            <p><span className="font-medium">Agente:</span> agente@helpdesk.com / 123456</p>
          </div>
        </div>

      </div>
    </div>
  )
}
