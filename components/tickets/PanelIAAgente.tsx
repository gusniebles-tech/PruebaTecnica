'use client'

// Panel de IA para agentes en el detalle del ticket

import { useState } from 'react'
import type { Ticket, SentimientoTicket } from '@/types'
import { etiquetaCategoria, etiquetaPrioridad } from '@/utils/formato'

interface PropsPanelIA {
  ticket: Ticket
}

const colorSentimiento: Record<SentimientoTicket, string> = {
  frustrado: 'bg-orange-50 border-orange-200 text-orange-700',
  urgente: 'bg-red-50 border-red-200 text-red-700',
  neutral: 'bg-slate-50 border-slate-200 text-slate-600',
}

const textoSentimiento: Record<SentimientoTicket, string> = {
  frustrado: 'Usuario frustrado',
  urgente: 'Solicitud urgente',
  neutral: 'Tono neutral',
}

// Preguntas rápidas
const preguntasRapidas = [
  '¿Qué podría responder al usuario?',
  '¿Cuál podría ser la causa del problema?',
  '¿Qué pasos seguir para resolverlo?',
  '¿La prioridad asignada es correcta?',
]

export function PanelIAAgente({ ticket }: PropsPanelIA) {
  const [sentimiento, setSentimiento] = useState<SentimientoTicket | null>(null)
  const [respuestaSugerida, setRespuestaSugerida] = useState('')
  const [pregunta, setPregunta] = useState('')
  const [respuestaPregunta, setRespuestaPregunta] = useState('')

  const [cargandoAnalisis, setCargandoAnalisis] = useState(false)
  const [cargandoRespuesta, setCargandoRespuesta] = useState(false)
  const [cargandoPregunta, setCargandoPregunta] = useState(false)
  const [error, setError] = useState('')

  // Construción contexto del ticket para enviar a la IA
  const contextoTicket = `
Título: ${ticket.titulo}
Descripción: ${ticket.descripcion}
Categoría: ${etiquetaCategoria(ticket.categoria)}
Prioridad: ${etiquetaPrioridad(ticket.prioridad)}
Estado: ${ticket.estado}
Solicitante: ${ticket.solicitante?.nombre || 'Usuario'}
  `.trim()

  const analizarSentimiento = async () => {
    setCargandoAnalisis(true)
    setError('')

    try {
      const res = await fetch('/api/ia/analizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSentimiento(data.sentimiento)
      } else {
        setError(data.error || 'Error al analizar.')
      }
    } catch {
      setError('No se pudo conectar con el servicio de IA.')
    } finally {
      setCargandoAnalisis(false)
    }
  }

  // Generar respuesta sugerida para el agente
  const generarRespuesta = async () => {
    setCargandoRespuesta(true)
    setError('')
    setRespuestaSugerida('')

    try {
      const res = await fetch('/api/ia/respuesta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titulo: ticket.titulo,
          descripcion: ticket.descripcion,
          categoria: ticket.categoria,
          prioridad: ticket.prioridad,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setRespuestaSugerida(data.respuesta)
      } else {
        setError(data.error || 'Error al generar respuesta.')
      }
    } catch {
      setError('No se pudo conectar con el servicio de IA.')
    } finally {
      setCargandoRespuesta(false)
    }
  }

  // Enviar pregunta libre
  const enviarPregunta = async (textoPregunta: string) => {
    if (!textoPregunta.trim()) return

    setCargandoPregunta(true)
    setError('')
    setRespuestaPregunta('')
    setPregunta(textoPregunta)

    try {
      const res = await fetch('/api/ia/preguntar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pregunta: textoPregunta,
          contexto: contextoTicket,
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setRespuestaPregunta(data.respuesta)
      } else {
        setError(data.error || 'Error al procesar la pregunta.')
      }
    } catch {
      setError('No se pudo conectar con el servicio de IA.')
    } finally {
      setCargandoPregunta(false)
    }
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">

      {/* Cabecera */}
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200">
        <p className="text-sm font-semibold text-slate-900">Asistente IA</p>
        <p className="text-xs text-slate-400 mt-0.5">Herramientas de apoyo para el agente</p>
      </div>

      <div className="p-4 space-y-5">

        {/* Error global */}
        {error && (
          <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </p>
        )}

        {/* Sentimiento */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-700">Sentimiento del usuario</p>
            <button
              onClick={analizarSentimiento}
              disabled={cargandoAnalisis}
              className="text-xs text-slate-500 underline hover:text-slate-900 disabled:opacity-50"
            >
              {cargandoAnalisis ? 'Analizando...' : 'Analizar'}
            </button>
          </div>

          {sentimiento ? (
            <div className={`text-xs px-3 py-2 rounded border font-medium ${colorSentimiento[sentimiento]}`}>
              {textoSentimiento[sentimiento]}
            </div>
          ) : (
            <p className="text-xs text-slate-400">Presiona "Analizar" para detectar el sentimiento.</p>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Respuesta sugerida */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-700">Respuesta sugerida</p>
            <button
              onClick={generarRespuesta}
              disabled={cargandoRespuesta}
              className="text-xs text-slate-500 underline hover:text-slate-900 disabled:opacity-50"
            >
              {cargandoRespuesta ? 'Generando...' : 'Generar'}
            </button>
          </div>

          {respuestaSugerida ? (
            <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
              <p className="text-xs text-slate-700 leading-relaxed">{respuestaSugerida}</p>
              <button
                onClick={() => navigator.clipboard.writeText(respuestaSugerida)}
                className="mt-2 text-xs text-slate-400 underline hover:text-slate-700"
              >
                Copiar al portapapeles
              </button>
            </div>
          ) : (
            <p className="text-xs text-slate-400">Presiona "Generar" para obtener una respuesta sugerida.</p>
          )}
        </div>

        <hr className="border-slate-100" />

        {/* Preguntas rápidas */}
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Preguntas rápidas</p>
          <div className="space-y-1.5">
            {preguntasRapidas.map((p) => (
              <button
                key={p}
                onClick={() => enviarPregunta(p)}
                disabled={cargandoPregunta}
                className="w-full text-left text-xs text-slate-600 border border-slate-200 rounded-md px-3 py-2 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Pregunta libre */}
        <div>
          <p className="text-xs font-medium text-slate-700 mb-2">Pregunta libre</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={pregunta}
              onChange={(e) => setPregunta(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && enviarPregunta(pregunta)}
              placeholder="Escribe una pregunta..."
              className="flex-1 text-xs border border-slate-200 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-slate-400"
            />
            <button
              onClick={() => enviarPregunta(pregunta)}
              disabled={cargandoPregunta || !pregunta.trim()}
              className="px-3 py-2 bg-slate-900 text-white text-xs rounded-md hover:bg-slate-700 disabled:opacity-50 transition-colors"
            >
              {cargandoPregunta ? '...' : 'Preguntar'}
            </button>
          </div>
        </div>

        {/* Respuesta a la pregunta */}
        {respuestaPregunta && (
          <div className="bg-slate-50 border border-slate-200 rounded-md p-3">
            <p className="text-xs text-slate-500 mb-1 font-medium">Respuesta de la IA:</p>
            <p className="text-xs text-slate-700 leading-relaxed">{respuestaPregunta}</p>
          </div>
        )}

      </div>
    </div>
  )
}
