// Página para crear un nuevo ticket

import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { FormularioNuevoTicket } from '@/components/tickets/FormularioNuevoTicket'
import { obtenerUsuarioActual } from '@/services/auth-servidor'

export default async function PaginaNuevoTicket() {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')

  if (usuario.rol === 'agent') redirect('/admin/tickets')

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8">

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Nuevo Ticket</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Describe el problema y nuestro equipo lo atenderá lo antes posible
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <FormularioNuevoTicket />
        </div>

      </main>
    </div>
  )
}
