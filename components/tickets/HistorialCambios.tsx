// Componente que muestra el historial de cambios de estado de un ticket

import { Badge } from '@/components/ui/Badge'
import { colorEstado, etiquetaEstado, formatearFecha } from '@/utils/formato'
import type { HistorialTicket } from '@/types'

interface PropsHistorial {
  historial: HistorialTicket[]
}

export function HistorialCambios({ historial }: PropsHistorial) {
  if (historial.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Historial de Cambios</h3>
        <p className="text-sm text-slate-400">Sin cambios registrados aún.</p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Historial de Cambios</h3>

      <div className="space-y-3">
        {historial.map((registro) => (
          <div key={registro.id} className="border-l-2 border-slate-200 pl-3 py-1">

            {/* Cambio de estado */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                texto={etiquetaEstado(registro.estado_anterior)}
                claseColor={colorEstado(registro.estado_anterior)}
              />
              <span className="text-slate-400 text-xs">→</span>
              <Badge
                texto={etiquetaEstado(registro.estado_nuevo)}
                claseColor={colorEstado(registro.estado_nuevo)}
              />
            </div>

            {/* Nota */}
            {registro.nota && (
              <p className="text-xs text-slate-600 mt-1 italic">
                &ldquo;{registro.nota}&rdquo;
              </p>
            )}

            {/* Quién hizo el cambio y cuándo */}
            <p className="text-xs text-slate-400 mt-1">
              {registro.agente?.nombre || 'Sistema'} · {formatearFecha(registro.creado_en)}
            </p>

          </div>
        ))}
      </div>
    </div>
  )
}
