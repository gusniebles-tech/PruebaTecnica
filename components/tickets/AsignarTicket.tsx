'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { asignarTicket } from '@/services/tickets-servicio'
import { useAuth } from '@/hooks/useAuth'

interface PropsAsignar {
  ticketId: string
  agenteAsignadoId: string | null
  agentes: { id: string; nombre: string }[]
}

export function AsignarTicket({ ticketId, agenteAsignadoId, agentes }: PropsAsignar) {
  const router = useRouter()
  const { perfil } = useAuth()
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')
  const [exito, setExito] = useState(false)

  const handleAsignar = async () => {
    if (!perfil) return
    setError('')
    setGuardando(true)

    const { error: errorServicio } = await asignarTicket(ticketId, perfil.id)

    setGuardando(false)

    if (errorServicio) {
      setError(errorServicio)
      return
    }

    setExito(true)
    setTimeout(() => {
      router.refresh()
      setExito(false)
    }, 800)
  }

  const yaAsignado = agenteAsignadoId === perfil?.id

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-900 mb-3">Asignación</h3>

      {agenteAsignadoId ? (
        <div className="space-y-2">
          <p className="text-xs text-slate-500">Asignado a:</p>
          <p className="text-sm font-medium text-slate-900">
            {agentes.find(a => a.id === agenteAsignadoId)?.nombre || 'Agente'}
          </p>
          {!yaAsignado && (
            <button
              onClick={handleAsignar}
              disabled={guardando}
              className="mt-2 w-full text-xs border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50 disabled:opacity-50 transition-colors"
            >
              {guardando ? 'Reasignando...' : 'Reasignarme este ticket'}
            </button>
          )}
          {yaAsignado && (
            <p className="text-xs text-green-600 bg-green-50 border border-green-200 rounded px-2 py-1">
              Este ticket está asignado a ti
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Sin asignar</p>
          <button
            onClick={handleAsignar}
            disabled={guardando}
            className="w-full px-3 py-2 bg-slate-900 text-white text-xs rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {guardando ? 'Asignando...' : 'Asignarme este ticket'}
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
      {exito && <p className="text-xs text-green-600 mt-2">Ticket asignado correctamente.</p>}
    </div>
  )
}