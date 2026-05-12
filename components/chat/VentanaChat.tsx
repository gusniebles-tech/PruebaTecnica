'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@/hooks/useChat'
import { enviarMensaje } from '@/services/chat-servicio'
import type { Mensaje, Perfil } from '@/types'

interface PropsVentanaChat {
  conversacionId: string
  mensajesIniciales: Mensaje[]
  usuarioActual: Perfil
  esAgente?: boolean
}

export function VentanaChat({
  conversacionId,
  mensajesIniciales,
  usuarioActual,
  esAgente = false,
}: PropsVentanaChat) {
  const { mensajes } = useChat(conversacionId, mensajesIniciales)
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [sugerenciaIA, setSugerenciaIA] = useState('')
  const [cargandoIA, setCargandoIA] = useState(false)
  const finalLista = useRef<HTMLDivElement>(null)

  useEffect(() => {
    finalLista.current?.scrollIntoView({ behavior: 'smooth' })
  }, [mensajes])

  const handleEnviar = async () => {
    if (!texto.trim() || enviando) return

    const contenido = texto.trim()
    setTexto('')
    setEnviando(true)
    setSugerenciaIA('')

    await enviarMensaje({
      conversacion_id: conversacionId,
      autor_id: usuarioActual.id,
      contenido,
      es_ia: false,
    })

    setEnviando(false)

    if (!esAgente) {
      await pedirRespuestaIA(contenido)
    }
  }

  const pedirRespuestaIA = async (mensajeUsuario: string) => {
    const historial = mensajes.slice(-6).map(m => ({
      rol: m.es_ia ? 'asistente' : m.autor?.rol === 'agent' ? 'agente' : 'usuario',
      contenido: m.contenido,
    }))

    try {
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mensaje: mensajeUsuario, historial }),
      })

      const data = await res.json()

      if (res.ok && data.respuesta) {
        await enviarMensaje({
          conversacion_id: conversacionId,
          autor_id: usuarioActual.id,
          contenido: data.respuesta,
          es_ia: true,
        })
      }
    } catch {
      
    }
  }

  // Sugerir respuesta al agente sin enviarla
  const sugerirRespuestaAgente = async () => {
    if (mensajes.length === 0) return

    setCargandoIA(true)
    setSugerenciaIA('')

    const ultimoMensaje = mensajes[mensajes.length - 1]
    const historial = mensajes.slice(-6).map(m => ({
      rol: m.es_ia ? 'asistente' : m.autor?.rol === 'agent' ? 'agente' : 'usuario',
      contenido: m.contenido,
    }))

    try {
      const res = await fetch('/api/ia/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mensaje: ultimoMensaje.contenido,
          historial: historial.slice(0, -1),
        }),
      })

      const data = await res.json()
      if (res.ok) {
        setSugerenciaIA(data.respuesta)
      }
    } catch {
      // Silencioso
    } finally {
      setCargandoIA(false)
    }
  }

  return (
    <div className="flex flex-col h-full">

      {/* Lista de mensajes */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
        {mensajes.length === 0 && (
          <div className="text-center py-8">
            <p className="text-sm text-slate-400">
              {esAgente
                ? 'No hay mensajes aún.'
                : 'Escribe un mensaje para iniciar la conversación.'
              }
            </p>
          </div>
        )}

        {mensajes.map((mensaje) => (
          <BurbujaMensaje
            key={mensaje.id}
            mensaje={mensaje}
            esMio={mensaje.autor_id === usuarioActual.id && !mensaje.es_ia}
          />
        ))}

        <div ref={finalLista} />
      </div>

      {/* Sugerencia de la IA para agentes */}
      {esAgente && sugerenciaIA && (
        <div className="mx-4 mb-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <p className="text-xs text-slate-500 mb-1 font-medium">Sugerencia IA:</p>
          <p className="text-xs text-slate-700">{sugerenciaIA}</p>
          <button
            onClick={() => {
              setTexto(sugerenciaIA)
              setSugerenciaIA('')
            }}
            className="mt-2 text-xs text-slate-500 underline hover:text-slate-900"
          >
            Usar esta respuesta
          </button>
        </div>
      )}

      {/* Input de mensaje */}
      <div className="border-t border-slate-200 p-4">
        {esAgente && (
          <div className="flex justify-end mb-2">
            <button
              onClick={sugerirRespuestaAgente}
              disabled={cargandoIA || mensajes.length === 0}
              className="text-xs text-slate-500 underline hover:text-slate-900 disabled:opacity-50"
            >
              {cargandoIA ? 'Generando sugerencia...' : 'Sugerir respuesta con IA'}
            </button>
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleEnviar()}
            placeholder="Escribe un mensaje..."
            disabled={enviando}
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-400 disabled:opacity-50"
          />
          <button
            onClick={handleEnviar}
            disabled={enviando || !texto.trim()}
            className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-colors"
          >
            {enviando ? '...' : 'Enviar'}
          </button>
        </div>
      </div>

    </div>
  )
}

function BurbujaMensaje({
  mensaje,
  esMio,
}: {
  mensaje: Mensaje
  esMio: boolean
}) {
  if (mensaje.es_ia) {
    return (
      <div className="flex justify-start">
        <div className="max-w-xs lg:max-w-md">
          <p className="text-xs text-slate-400 mb-1">Asistente IA</p>
          <div className="bg-slate-100 border border-slate-200 rounded-xl rounded-tl-sm px-4 py-2">
            <p className="text-sm text-slate-700">{mensaje.contenido}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${esMio ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-xs lg:max-w-md">
        {/* Nombre del autor */}
        {!esMio && (
          <p className="text-xs text-slate-400 mb-1">
            {mensaje.autor?.nombre || 'Usuario'}
            {mensaje.autor?.rol === 'agent' && (
              <span className="ml-1 text-slate-500">(Agente)</span>
            )}
          </p>
        )}

        <div className={`px-4 py-2 rounded-xl ${
          esMio
            ? 'bg-slate-900 text-white rounded-tr-sm'
            : 'bg-white border border-slate-200 text-slate-900 rounded-tl-sm'
        }`}>
          <p className="text-sm">{mensaje.contenido}</p>
        </div>

        <p className="text-xs text-slate-400 mt-1">
          {new Date(mensaje.creado_en).toLocaleTimeString('es-CO', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  )
}