
import { redirect, notFound } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { VentanaChat } from '@/components/chat/VentanaChat'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTicketPorId } from '@/services/tickets-servidor'
import { obtenerConversacionPorId, obtenerMensajes } from '@/services/chat-servidor'
import { obtenerOCrearConversacion } from '@/services/chat-servicio'

interface PropsParams {
  params: Promise<{ ticketId: string }>
}

export default async function PaginaChatUsuario({ params }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')

  const { ticketId } = await params
  const ticket = await obtenerTicketPorId(ticketId)
  if (!ticket) notFound()

  if (ticket.solicitante_id !== usuario.id) redirect('/tickets')

  const supabase_url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabase_key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const resBuscar = await fetch(
    `${supabase_url}/rest/v1/conversaciones?ticket_id=eq.${ticketId}&abierta=eq.true&limit=1`,
    { headers: { apikey: supabase_key, Authorization: `Bearer ${supabase_key}` } }
  )

  let conversacionId: string

  const existentes = await resBuscar.json()

  if (existentes.length > 0) {
    conversacionId = existentes[0].id
  } else {
    const resCrear = await fetch(`${supabase_url}/rest/v1/conversaciones`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabase_key,
        'Authorization': `Bearer ${supabase_key}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify({ ticket_id: ticketId, abierta: true }),
    })
    const nuevas = await resCrear.json()
    conversacionId = nuevas[0].id
  }

  const mensajesIniciales = await obtenerMensajes(conversacionId)

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">

        {/* Cabecera */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <p className="text-xs text-slate-500 mb-1">Chat de soporte</p>
          <h1 className="text-sm font-semibold text-slate-900">{ticket.titulo}</h1>
        </div>

        {/* Ventana de chat */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
          <VentanaChat
            conversacionId={conversacionId}
            mensajesIniciales={mensajesIniciales}
            usuarioActual={usuario}
            esAgente={false}
          />
        </div>

      </main>
    </div>
  )
}