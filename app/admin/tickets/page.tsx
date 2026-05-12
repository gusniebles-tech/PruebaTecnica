
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { TarjetaTicket } from '@/components/tickets/TarjetaTicket'
import { FiltrosTickets } from '@/components/tickets/FiltrosTickets'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTickets } from '@/services/tickets-servidor'
import { obtenerTicketPorId, obtenerHistorialTicket } from '@/services/tickets-servidor'
import type { EstadoTicket, CategoriaTicket } from '@/types'

interface PropsParams {
  searchParams: Promise<{ estado?: EstadoTicket; categoria?: CategoriaTicket }>
}

export default async function PaginaAdminTickets({ searchParams }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')

  if (usuario.rol !== 'agent') redirect('/tickets')

  const params = await searchParams
  const tickets = await obtenerTickets({
    estado: params.estado || 'todos',
    categoria: params.categoria || 'todos',
  })

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        {/* Encabezado */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-slate-900">Panel de Agente</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''} en el sistema
            </p>
          </div>
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
            <p className="text-slate-400 text-sm">No hay tickets con esos filtros.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tickets.map((ticket) => (
              <TarjetaTicket key={ticket.id} ticket={ticket} esVistAdmin={true} />
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
