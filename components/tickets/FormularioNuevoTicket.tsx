'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Boton } from '@/components/ui/Boton'
import { AnalizadorIA } from '@/components/tickets/AnalizadorIA'
import { crearTicket } from '@/services/tickets-servicio'
import { useAuth } from '@/hooks/useAuth'
import type { CategoriaTicket, PrioridadTicket } from '@/types'

export function FormularioNuevoTicket() {
  const router = useRouter()
  const { perfil } = useAuth()

  const [titulo, setTitulo] = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [categoria, setCategoria] = useState<CategoriaTicket>('software')
  const [prioridad, setPrioridad] = useState<PrioridadTicket>('media')
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('SUBMIT EJECUTADO - perfil:', perfil)
    setError('')

    if (!titulo.trim() || !descripcion.trim()) {
      setError('El título y la descripción son obligatorios.')
      return
    }

    if (!perfil) {
      setError('No hay sesión activa.')
      return
    }

    setEnviando(true)

    console.log('ANTES DE CREAR - enviando:', enviando, 'titulo:', titulo, 'descripcion:', descripcion)
    setEnviando(true)

    console.log('llamando crearTicket...')

    const { datos, error: errorServicio } = await crearTicket(
      { titulo, descripcion, categoria, prioridad },
      perfil.id
    )

    console.log('RESULTADO CREAR TICKET:', { datos, errorServicio, perfilId: perfil.id })

    setEnviando(false)

    if (errorServicio) {
      setError(errorServicio)
      return
    }

    router.push(`/tickets/${datos?.id}`)
    router.refresh()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Título del problema
        </label>
        <input
          type="text"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder="Describe brevemente el problema"
          maxLength={120}
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400"
        />
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Descripción detallada
        </label>
        <textarea
          value={descripcion}
          onChange={(e) => setDescripcion(e.target.value)}
          placeholder="Explica con detalle qué está pasando, cuándo ocurrió y qué pasos intentaste..."
          rows={5}
          className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 resize-none"
        />
      </div>

      {/* Panel de IA */}
      <AnalizadorIA
        titulo={titulo}
        descripcion={descripcion}
        onAplicarCategoria={setCategoria}
        onAplicarPrioridad={setPrioridad}
        onAplicarTitulo={setTitulo}
        onAplicarDescripcion={setDescripcion}
      />

      {/* Categoría y Prioridad */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Categoría
          </label>
          <select
            value={categoria}
            onChange={(e) => setCategoria(e.target.value as CategoriaTicket)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="hardware">Hardware</option>
            <option value="software">Software</option>
            <option value="red">Red</option>
            <option value="acceso">Acceso</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Prioridad
          </label>
          <select
            value={prioridad}
            onChange={(e) => setPrioridad(e.target.value as PrioridadTicket)}
            className="w-full border border-slate-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white"
          >
            <option value="baja">Baja</option>
            <option value="media">Media</option>
            <option value="alta">Alta</option>
            <option value="urgente">Urgente</option>
          </select>
        </div>
      </div>

      {/* Botones */}
      <div className="flex gap-3 pt-2">
        <Boton type="submit" cargando={enviando}>
          Crear Ticket
        </Boton>
        <Boton
          type="button"
          variante="secundario"
          onClick={() => router.back()}
        >
          Cancelar
        </Boton>
      </div>

    </form>
  )
}
