// Componente de tarjeta para mostrar un ticket en la lista

import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'
import { colorEstado, colorPrioridad, etiquetaEstado, etiquetaPrioridad, etiquetaCategoria, formatearFechaCorta } from '@/utils/formato'
import type { Ticket } from '@/types'

interface PropsTarjetaTicket {
  ticket: Ticket
  esVistAdmin?: boolean
}

export function TarjetaTicket({ ticket, esVistAdmin = false }: PropsTarjetaTicket) {
  const rutaDetalle = esVistAdmin
    ? `/admin/tickets/${ticket.id}`
    : `/tickets/${ticket.id}`

  return (
    <Link href={rutaDetalle}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">

        {/* título y badges */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-medium text-slate-900 text-sm leading-snug line-clamp-2 flex-1">
            {ticket.titulo}
          </h3>
          <div className="flex items-center gap-1.5 shrink-0">
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

        {/* Descripción corta */}
        <p className="text-xs text-slate-500 line-clamp-2 mb-3">
          {ticket.descripcion}
        </p>

        {/* categoría, solicitante y fecha */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            <span className="capitalize">{etiquetaCategoria(ticket.categoria)}</span>
            {ticket.solicitante && (
              <span>{ticket.solicitante.nombre}</span>
            )}
          </div>
          <span>{formatearFechaCorta(ticket.creado_en)}</span>
        </div>

      </div>
    </Link>
  )
}
