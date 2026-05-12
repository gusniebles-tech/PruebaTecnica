import { NextResponse } from 'next/server'
import { generarRespuestaAgente } from '@/services/ia-servicio'

export async function POST(request: Request) {
  try {
    const { titulo, descripcion, categoria, prioridad } = await request.json()

    if (!titulo || !descripcion) {
      return NextResponse.json(
        { error: 'Faltan datos del ticket.' },
        { status: 400 }
      )
    }

    const respuesta = await generarRespuestaAgente(titulo, descripcion, categoria, prioridad)
    return NextResponse.json({ respuesta })
  } catch {
    return NextResponse.json(
      { error: 'No se pudo generar la respuesta.' },
      { status: 500 }
    )
  }
}
