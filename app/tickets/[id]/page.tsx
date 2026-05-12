import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/Badge'
import { HistorialCambios } from '@/components/tickets/HistorialCambios'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTickets } from '@/services/tickets-servidor'
import { obtenerTicketPorId, obtenerHistorialTicket } from '@/services/tickets-servidor'
import {
  colorEstado, colorPrioridad,
  etiquetaEstado, etiquetaPrioridad, etiquetaCategoria,
  formatearFecha
} from '@/utils/formato'

interface PropsParams {
  params: Promise<{ id: string }>
}

export default async function PaginaDetalleTicket({ params }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')

  const { id } = await params
  const ticket = await obtenerTicketPorId(id)

  if (!ticket) notFound()

  if (usuario.rol === 'user' && ticket.solicitante_id !== usuario.id) {
    redirect('/tickets')
  }

  if (usuario.rol === 'agent') {
    redirect(`/admin/tickets/${id}`)
  }

  const historial = await obtenerHistorialTicket(id)

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/tickets" className="hover:text-slate-900">Mis Tickets</Link>
          <span>/</span>
          <span className="text-slate-900">Detalle</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Columna principal: info del ticket */}
          <div className="lg:col-span-2 space-y-5">

            {/* Cabecera */}
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-lg font-semibold text-slate-900">{ticket.titulo}</h1>
                <div className="flex gap-2 shrink-0">
                  <Badge
                    texto={etiquetaPrioridad(ticket.prioridad)}
                    claseColor={colorPrioridad(ticket.prioridad)}
                  />
                  <Badge
                    texto={etiquetaEstado(ticket.estado)}
                    claseColor={colorEstado(ticket.estado)}
                  />
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ticket.descripcion}
              </p>
            </div>

            {/* Historial de cambios */}
            <HistorialCambios historial={historial} />
          </div>

          {/* Columna lateral: info adicional */}
          <div className="space-y-4">
            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Información</h3>

              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-500">Categoría</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{etiquetaCategoria(ticket.categoria)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Estado</dt>
                  <dd className="mt-0.5">
                    <Badge texto={etiquetaEstado(ticket.estado)} claseColor={colorEstado(ticket.estado)} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Asignado a</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">
                    {ticket.agente?.nombre || 'Sin asignar'}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Creado</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{formatearFecha(ticket.creado_en)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Última actualización</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{formatearFecha(ticket.actualizado_en)}</dd>
                </div>
                <Link
                  href={`/chat/${ticket.id}`}
                  className="block w-full text-center px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Abrir chat de soporte
                </Link>
              </dl>
            </div>
          </div>

        </div>
      </main>
    </div>
  )
}
