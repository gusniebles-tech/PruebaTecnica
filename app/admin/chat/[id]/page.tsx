import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { VentanaChat } from '@/components/chat/VentanaChat'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerConversacionPorId, obtenerMensajes } from '@/services/chat-servidor'

interface PropsParams {
  params: Promise<{ id: string }>
}

export default async function PaginaAdminChatDetalle({ params }: PropsParams) {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')
  if (usuario.rol !== 'agent') redirect('/tickets')

  const { id } = await params
  const conversacion = await obtenerConversacionPorId(id)
  if (!conversacion) notFound()

  const mensajesIniciales = await obtenerMensajes(id)
  const ticket = (conversacion as any).ticket

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col">

        {/* Cabecera */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500 mb-1">
                <Link href="/admin/chat" className="hover:text-slate-900">
                  Conversaciones
                </Link>
                {' / '}Chat
              </p>
              <h1 className="text-sm font-semibold text-slate-900">
                {ticket?.titulo || 'Conversación'}
              </h1>
            </div>
            {ticket && (
              <Link
                href={`/admin/tickets/${ticket.id}`}
                className="text-xs text-slate-500 underline hover:text-slate-900"
              >
                Ver ticket
              </Link>
            )}
          </div>
        </div>

        {/* Ventana de chat */}
        <div className="flex-1 bg-white border border-slate-200 rounded-xl overflow-hidden" style={{ minHeight: '500px' }}>
          <VentanaChat
            conversacionId={id}
            mensajesIniciales={mensajesIniciales}
            usuarioActual={usuario}
            esAgente={true}
          />
        </div>

      </main>
    </div>
  )
}