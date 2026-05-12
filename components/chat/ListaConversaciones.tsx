// Lista de conversaciones activas para agentes

import Link from 'next/link'
import type { Conversacion } from '@/types'
import { colorPrioridad, etiquetaPrioridad } from '@/utils/formato'

interface PropsLista {
  conversaciones: Conversacion[]
}

export function ListaConversaciones({ conversaciones }: PropsLista) {
  if (conversaciones.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-slate-400">No hay conversaciones activas.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {conversaciones.map((conv) => (
        <Link key={conv.id} href={`/admin/chat/${conv.id}`}>
          <div className="bg-white border border-slate-200 rounded-lg p-4 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {(conv as any).ticket?.titulo || 'Conversación'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">
                  {new Date(conv.creado_en).toLocaleDateString('es-CO')}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {(conv as any).ticket?.prioridad && (
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorPrioridad((conv as any).ticket.prioridad)}`}>
                    {etiquetaPrioridad((conv as any).ticket.prioridad)}
                  </span>
                )}
                <span className={`w-2 h-2 rounded-full ${conv.abierta ? 'bg-green-400' : 'bg-slate-300'}`} />
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}