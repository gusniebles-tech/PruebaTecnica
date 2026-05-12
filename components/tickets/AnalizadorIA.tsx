'use client'

// Componente de análisis con IA para el formulario de nuevo ticket

import { useState } from 'react'
import type { SugerenciaIA, CategoriaTicket, PrioridadTicket } from '@/types'
import { etiquetaCategoria, etiquetaPrioridad } from '@/utils/formato'

interface PropsAnalizadorIA {
  titulo: string
  descripcion: string
  // Callbacks para actualizar el formulario padre con las sugerencias
  onAplicarCategoria: (categoria: CategoriaTicket) => void
  onAplicarPrioridad: (prioridad: PrioridadTicket) => void
  onAplicarTitulo: (titulo: string) => void
  onAplicarDescripcion: (descripcion: string) => void
}

const colorSentimiento = {
  frustrado: 'text-orange-600 bg-orange-50 border-orange-200',
  urgente: 'text-red-600 bg-red-50 border-red-200',
  neutral: 'text-slate-600 bg-slate-50 border-slate-200',
}

const textoSentimiento = {
  frustrado: 'El usuario parece frustrado',
  urgente: 'El ticket parece urgente',
  neutral: 'Tono neutral detectado',
}

export function AnalizadorIA({
  titulo,
  descripcion,
  onAplicarCategoria,
  onAplicarPrioridad,
  onAplicarTitulo,
  onAplicarDescripcion,
}: PropsAnalizadorIA) {
  const [sugerencia, setSugerencia] = useState<SugerenciaIA | null>(null)
  const [analizando, setAnalizando] = useState(false)
  const [error, setError] = useState('')

  const analizar = async () => {
    if (descripcion.trim().length < 5) {
      setError('Escribe una descripción antes de analizar.')
      return
    }

    setError('')
    setAnalizando(true)
    setSugerencia(null)

    try {
      const res = await fetch('/api/ia/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ titulo, descripcion }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Error al analizar.')
        return
      }

      setSugerencia(data)
    } catch {
      setError('No se pudo conectar con el servicio de IA.')
    } finally {
      setAnalizando(false)
    }
  }

  return (
    <div className="border border-slate-200 rounded-lg overflow-hidden">

      {/* Cabecera del panel */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-200">
        <div>
          <p className="text-sm font-medium text-slate-700">Asistente IA</p>
          <p className="text-xs text-slate-400">Sugiere categoría, prioridad y mejoras</p>
        </div>
        <button
          type="button"
          onClick={analizar}
          disabled={analizando}
          className="px-3 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
        >
          {analizando ? 'Analizando...' : 'Analizar con IA'}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-3">
          <p className="text-xs text-red-600">{error}</p>
        </div>
      )}

      {/* Resultados */}
      {sugerencia && (
        <div className="p-4 space-y-4">

          {/* Sentimiento detectado */}
          <div className={`text-xs px-3 py-2 rounded border ${colorSentimiento[sugerencia.sentimiento]}`}>
            {textoSentimiento[sugerencia.sentimiento]}
          </div>

          {/* Sugerencias de categoría y prioridad */}
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-slate-200 rounded-md p-3">
              <p className="text-xs text-slate-500 mb-1">Categoría sugerida</p>
              <p className="text-sm font-medium text-slate-900 mb-2">
                {etiquetaCategoria(sugerencia.categoria)}
              </p>
              <button
                type="button"
                onClick={() => onAplicarCategoria(sugerencia.categoria)}
                className="text-xs text-slate-600 underline hover:text-slate-900"
              >
                Aplicar
              </button>
            </div>

            <div className="border border-slate-200 rounded-md p-3">
              <p className="text-xs text-slate-500 mb-1">Prioridad sugerida</p>
              <p className="text-sm font-medium text-slate-900 mb-2">
                {etiquetaPrioridad(sugerencia.prioridad)}
              </p>
              <button
                type="button"
                onClick={() => onAplicarPrioridad(sugerencia.prioridad)}
                className="text-xs text-slate-600 underline hover:text-slate-900"
              >
                Aplicar
              </button>
            </div>
          </div>

          {/* Sugerencia de título mejorado */}
          {sugerencia.tituloMejorado && (
            <div className="border border-blue-200 rounded-md p-3 bg-blue-50">
              <p className="text-xs text-blue-600 font-medium mb-1">Título sugerido</p>
              <p className="text-sm text-slate-700 mb-2">{sugerencia.tituloMejorado}</p>
              <button
                type="button"
                onClick={() => onAplicarTitulo(sugerencia.tituloMejorado!)}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                Usar este título
              </button>
            </div>
          )}

          {/* Sugerencia de descripción mejorada */}
          {sugerencia.descripcionMejorada && (
            <div className="border border-blue-200 rounded-md p-3 bg-blue-50">
              <p className="text-xs text-blue-600 font-medium mb-1">Sugerencia para la descripción</p>
              <p className="text-sm text-slate-700 mb-2">{sugerencia.descripcionMejorada}</p>
              <button
                type="button"
                onClick={() => onAplicarDescripcion(sugerencia.descripcionMejorada!)}
                className="text-xs text-blue-600 underline hover:text-blue-800"
              >
                Usar esta descripción
              </button>
            </div>
          )}

          {/* Si no hay sugerencias de mejora */}
          {!sugerencia.tituloMejorado && !sugerencia.descripcionMejorada && (
            <p className="text-xs text-slate-500">
              El título y descripción están bien redactados.
            </p>
          )}

        </div>
      )}

    </div>
  )
}
