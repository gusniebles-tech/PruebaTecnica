import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { Badge } from '@/components/ui/Badge'
import { CambiarEstado } from '@/components/tickets/CambiarEstado'
import { HistorialCambios } from '@/components/tickets/HistorialCambios'
import { PanelIAAgente } from '@/components/tickets/PanelIAAgente'
import { AsignarTicket } from '@/components/tickets/AsignarTicket'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTicketPorId, obtenerHistorialTicket, obtenerAgentes } from '@/services/tickets-servidor'
import {
  colorEstado, colorPrioridad,
  etiquetaEstado, etiquetaPrioridad, etiquetaCategoria,
  formatearFecha
} from '@/utils/formato'

interface PropsParams {
  params: Promise<{ id: string }>
}

export default async function PaginaAdminDetalleTicket({ params }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')
  if (usuario.rol !== 'agent') redirect('/tickets')

  const { id } = await params
  const [ticket, historial, agentes] = await Promise.all([
    obtenerTicketPorId(id),
    obtenerHistorialTicket(id),
    obtenerAgentes(),
  ])

  if (!ticket) notFound()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
          <Link href="/admin/tickets" className="hover:text-slate-900">Tickets</Link>
          <span>/</span>
          <span className="text-slate-900 truncate max-w-xs">{ticket.titulo}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white border border-slate-200 rounded-xl p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <h1 className="text-lg font-semibold text-slate-900">{ticket.titulo}</h1>
                <div className="flex gap-2 shrink-0">
                  <Badge texto={etiquetaPrioridad(ticket.prioridad)} claseColor={colorPrioridad(ticket.prioridad)} />
                  <Badge texto={etiquetaEstado(ticket.estado)} claseColor={colorEstado(ticket.estado)} />
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                {ticket.descripcion}
              </p>
            </div>

            <HistorialCambios historial={historial} />
          </div>

          <div className="space-y-4">

            {/* Asignación — nuevo */}
            <AsignarTicket
              ticketId={ticket.id}
              agenteAsignadoId={ticket.asignado_a}
              agentes={agentes}
            />

            <CambiarEstado ticketId={ticket.id} estadoActual={ticket.estado} />

            <PanelIAAgente ticket={ticket} />

            <div className="bg-white border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 mb-4">Información</h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-xs text-slate-500">Solicitante</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{ticket.solicitante?.nombre || '—'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Categoría</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{etiquetaCategoria(ticket.categoria)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Asignado a</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{ticket.agente?.nombre || 'Sin asignar'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Creado</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{formatearFecha(ticket.creado_en)}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-500">Última actualización</dt>
                  <dd className="text-sm text-slate-900 mt-0.5">{formatearFecha(ticket.actualizado_en)}</dd>
                </div>
              </dl>
            </div>

          </div>
        </div>
      </main>
    </div>
  )
}