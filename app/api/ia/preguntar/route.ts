import { NextResponse } from 'next/server'
import { preguntarSobreTicket } from '@/services/ia-servicio'

export async function POST(request: Request) {
  try {
    const { pregunta, contexto } = await request.json()

    if (!pregunta || pregunta.trim().length < 3) {
      return NextResponse.json(
        { error: 'La pregunta es muy corta.' },
        { status: 400 }
      )
    }

    const respuesta = await preguntarSobreTicket(pregunta, contexto || '')
    return NextResponse.json({ respuesta })
  } catch {
    return NextResponse.json(
      { error: 'No se pudo procesar la pregunta.' },
      { status: 500 }
    )
  }
}
