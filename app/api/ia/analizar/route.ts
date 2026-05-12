import { NextResponse } from 'next/server'
import { analizarTicket } from '@/services/ia-servicio'

export async function POST(request: Request) {
  try {
    const { titulo, descripcion } = await request.json()

    if (!descripcion || descripcion.trim().length < 5) {
      return NextResponse.json(
        { error: 'La descripción es muy corta para analizar.' },
        { status: 400 }
      )
    }

    const sugerencia = await analizarTicket(titulo || '', descripcion)
    return NextResponse.json(sugerencia)
  } catch {
    return NextResponse.json(
      { error: 'No se pudo analizar el ticket.' },
      { status: 500 }
    )
  }
}
