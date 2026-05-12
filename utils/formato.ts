// Funciones de utilidad

import type { EstadoTicket, PrioridadTicket, CategoriaTicket } from '@/types'

// Formate de fechas

// Convierte una fecha ISO a formato legible en español
export function formatearFecha(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Versión corta de la fecha
export function formatearFechaCorta(fecha: string): string {
  return new Date(fecha).toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

// Etiquetas para mostrar en la UI

// Convierte el estado del ticket a texto legible
export function etiquetaEstado(estado: EstadoTicket): string {
  const etiquetas: Record<EstadoTicket, string> = {
    abierto: 'Abierto',
    en_progreso: 'En Progreso',
    resuelto: 'Resuelto',
    cerrado: 'Cerrado',
  }
  return etiquetas[estado] || estado
}

// Convierte la prioridad a texto legible
export function etiquetaPrioridad(prioridad: PrioridadTicket): string {
  const etiquetas: Record<PrioridadTicket, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    urgente: 'Urgente',
  }
  return etiquetas[prioridad] || prioridad
}

// Convierte la categoría a texto legible
export function etiquetaCategoria(categoria: CategoriaTicket): string {
  const etiquetas: Record<CategoriaTicket, string> = {
    hardware: 'Hardware',
    software: 'Software',
    red: 'Red',
    acceso: 'Acceso',
    otro: 'Otro',
  }
  return etiquetas[categoria] || categoria
}

// Clases de Tailwind para Badge

// Retorna clases de Tailwind según el estado del ticket
export function colorEstado(estado: EstadoTicket): string {
  const colores: Record<EstadoTicket, string> = {
    abierto: 'bg-blue-100 text-blue-800',
    en_progreso: 'bg-yellow-100 text-yellow-800',
    resuelto: 'bg-green-100 text-green-800',
    cerrado: 'bg-gray-100 text-gray-600',
  }
  return colores[estado] || 'bg-gray-100 text-gray-600'
}

// Retorna clases de Tailwind según la prioridad del ticket
export function colorPrioridad(prioridad: PrioridadTicket): string {
  const colores: Record<PrioridadTicket, string> = {
    baja: 'bg-slate-100 text-slate-600',
    media: 'bg-blue-100 text-blue-700',
    alta: 'bg-orange-100 text-orange-700',
    urgente: 'bg-red-100 text-red-700',
  }
  return colores[prioridad] || 'bg-gray-100 text-gray-600'
}
