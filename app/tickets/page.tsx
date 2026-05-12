// Página de lista de tickets para el usuario normal
// Solo ve sus propios tickets, puede crear nuevos

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { TarjetaTicket } from '@/components/tickets/TarjetaTicket'
import { FiltrosTickets } from '@/components/tickets/FiltrosTickets'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTickets } from '@/services/tickets-servidor'
import type { EstadoTicket, CategoriaTicket } from '@/types'

interface PropsParams {
  searchParams: Promise<{ estado?: EstadoTicket; categoria?: CategoriaTicket }>
}

export default async function PaginaMisTickets({ searchParams }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')

  // Solo usuarios normales acceden aquí
  if (usuario.rol === 'agent') redirect('/admin/tickets')

  const params = await searchParams
  const tickets = await obtenerTickets({
    estado: params.estado || 'todos',
    categoria: params.categoria || 'todos',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Encabezado con botón de crear */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Mis Tickets</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} encontrado{tickets.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link
            href="/tickets/nuevo"
            className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
          >
            Nuevo Ticket
          </Link>
        </div>

        {/* Filtros */}
        <div className="mb-5">
          <Suspense fallback={null}>
            <FiltrosTickets />
          </Suspense>
        </div>

        {/* Lista de tickets */}
        {tickets.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-slate-400 text-sm">No tienes tickets con esos filtros.</p>
            <Link
              href="/tickets/nuevo"
              className="inline-block mt-3 text-sm text-slate-600 underline"
            >
              Crear tu primer ticket
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TarjetaTicket key={ticket.id} ticket={ticket} esVistAdmin={false} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
