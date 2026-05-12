'use client'

// Componente para que los agentes cambien el estado de un ticket

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boton } from '@/components/ui/Boton'
import { actualizarEstadoTicket } from '@/services/tickets-servicio'
import { useAuth } from '@/hooks/useAuth'
import { etiquetaEstado } from '@/utils/formato'
import type { EstadoTicket } from '@/types'

interface PropsCambiarEstado {
  ticketId: string
  estadoActual: EstadoTicket
}

// Todos los estados posibles
const todosLosEstados: EstadoTicket[] = ['abierto', 'en_progreso', 'resuelto', 'cerrado']

export function CambiarEstado({ ticketId, estadoActual }: PropsCambiarEstado) {
  const router = useRouter()
  const { perfil } = useAuth()

  const [nuevoEstado, setNuevoEstado] = useState<EstadoTicket>(estadoActual)
  const [nota, setNota] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleGuardar = async () => {
    if (nuevoEstado === estadoActual) {
      setError('Selecciona un estado diferente al actual.')
      return
    }

    if (!perfil) return

    setError('')
    setGuardando(true)

    const { error: errorServicio } = await actualizarEstadoTicket(
      ticketId,
      estadoActual,
      { estado: nuevoEstado, nota: nota.trim() || undefined },
      perfil.id
    )

    setGuardando(false)

    if (errorServicio) {
      setError(errorServicio)
      return
    }

    setExito(true)
    setNota('')

    setTimeout(() => {
      router.refresh()
      setExito(false)
    }, 1000)
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Actualizar Estado</h3>

      <div className="space-y-3">
        {/* Selector de estado */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nuevo estado
          </label>
          <select
            value={nuevoEstado}
            onChange={(e) => setNuevoEstado(e.target.value as EstadoTicket)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-slate-400"
          >
            {todosLosEstados.map((estado) => (
              <option key={estado} value={estado}>
                {etiquetaEstado(estado)}
              </option>
            ))}
          </select>
        </div>

        {/* Nota opcional */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Nota (opcional)
          </label>
          <textarea
            value={nota}
            onChange={(e) => setNota(e.target.value)}
            placeholder="Agrega una nota sobre este cambio..."
            rows={2}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-slate-400"
          />
        </div>

        {/* Mensajes de error o éxito */}
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        {exito && (
          <p className="text-xs text-green-600">Estado actualizado correctamente.</p>
        )}

        {/* Botón de guardar */}
        <Boton
          onClick={handleGuardar}
          cargando={guardando}
          className="w-full"
        >
          Guardar Cambio
        </Boton>
      </div>
    </div>
  )
}
