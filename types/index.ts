// Tipos principales del sistema
export type Rol = 'user' | 'agent'
export type EstadoTicket = 'abierto' | 'en_progreso' | 'resuelto' | 'cerrado'
export type CategoriaTicket = 'hardware' | 'software' | 'red' | 'acceso' | 'otro'
export type PrioridadTicket = 'baja' | 'media' | 'alta' | 'urgente'
export type SentimientoTicket = 'frustrado' | 'neutral' | 'urgente'

// Perfil de usuario
export interface Perfil {
  id: string
  nombre: string
  rol: Rol
  creado_en: string
}

// Ticket
export interface Ticket {
  id: string
  titulo: string
  descripcion: string
  categoria: CategoriaTicket
  prioridad: PrioridadTicket
  estado: EstadoTicket
  solicitante_id: string
  asignado_a: string | null
  creado_en: string
  actualizado_en: string
  solicitante?: Perfil
  agente?: Perfil
}

export interface CrearTicketDatos {
  titulo: string
  descripcion: string
  categoria: CategoriaTicket
  prioridad: PrioridadTicket
}

export interface ActualizarEstadoDatos {
  estado: EstadoTicket
  nota?: string
}

// Historial de Ticket
export interface HistorialTicket {
  id: string
  ticket_id: string
  estado_anterior: EstadoTicket
  estado_nuevo: EstadoTicket
  cambiado_por: string
  nota: string | null
  creado_en: string
  agente?: Perfil
}

// Filtros
export interface FiltrosTicket {
  estado?: EstadoTicket | 'todos'
  categoria?: CategoriaTicket | 'todos'
}

// Módulo de IA
export interface SugerenciaIA {
  categoria: CategoriaTicket
  prioridad: PrioridadTicket
  sentimiento: SentimientoTicket
  tituloMejorado: string | null
  descripcionMejorada: string | null
}

export interface RespuestaServicio<T> {
  datos: T | null
  error: string | null
}

// Módulo de Chat
export interface Conversacion {
  id: string
  ticket_id: string
  abierta: boolean
  creado_en: string
  ticket?: Ticket
  ultimo_mensaje?: Mensaje
}

export interface Mensaje {
  id: string
  conversacion_id: string
  autor_id: string
  contenido: string
  leido: boolean
  es_ia: boolean
  creado_en: string
  autor?: Perfil
}

export interface EnviarMensajeDatos {
  conversacion_id: string
  autor_id: string
  contenido: string
  es_ia?: boolean
}