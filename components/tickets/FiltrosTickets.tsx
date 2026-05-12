'use client'

// Componente de filtros para la lista de tickets

import { useRouter, useSearchParams } from 'next/navigation'
import type { EstadoTicket, CategoriaTicket } from '@/types'

// Opciones de estado para el filtro
const opcionesEstado: { valor: EstadoTicket | 'todos'; texto: string }[] = [
  { valor: 'todos', texto: 'Todos los estados' },
  { valor: 'abierto', texto: 'Abierto' },
  { valor: 'en_progreso', texto: 'En Progreso' },
  { valor: 'resuelto', texto: 'Resuelto' },
  { valor: 'cerrado', texto: 'Cerrado' },
]

// Opciones de categoría para el filtro
const opcionesCategoria: { valor: CategoriaTicket | 'todos'; texto: string }[] = [
  { valor: 'todos', texto: 'Todas las categorías' },
  { valor: 'hardware', texto: 'Hardware' },
  { valor: 'software', texto: 'Software' },
  { valor: 'red', texto: 'Red' },
  { valor: 'acceso', texto: 'Acceso' },
  { valor: 'otro', texto: 'Otro' },
]

export function FiltrosTickets() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const estadoActual = searchParams.get('estado') || 'todos'
  const categoriaActual = searchParams.get('categoria') || 'todos'

  // Actualizar los parámetros de la URL cuando se cambia un filtro
  const cambiarFiltro = (tipo: 'estado' | 'categoria', valor: string) => {
    const params = new URLSearchParams(searchParams.toString())

    if (valor === 'todos') {
      params.delete(tipo)
    } else {
      params.set(tipo, valor)
    }

    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3">
      {/* Filtro por estado */}
      <select
        value={estadoActual}
        onChange={(e) => cambiarFiltro('estado', e.target.value)}
        className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        {opcionesEstado.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.texto}
          </option>
        ))}
      </select>

      {/* Filtro por categoría */}
      <select
        value={categoriaActual}
        onChange={(e) => cambiarFiltro('categoria', e.target.value)}
        className="text-sm border border-slate-200 rounded-md px-3 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400"
      >
        {opcionesCategoria.map((op) => (
          <option key={op.valor} value={op.valor}>
            {op.texto}
          </option>
        ))}
      </select>
    </div>
  )
}
