import { redirect } from 'next/navigation'
import { Navbar } from '@/components/layout/Navbar'
import { ListaConversaciones } from '@/components/chat/ListaConversaciones'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerConversaciones } from '@/services/chat-servidor'

export default async function PaginaAdminChat() {
  const usuario = await obtenerUsuarioActual()
  if (!usuario) redirect('/auth/login')
  if (usuario.rol !== 'agent') redirect('/tickets')

  const conversaciones = await obtenerConversaciones()

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-slate-900">Conversaciones</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {conversaciones.length} conversación{conversaciones.length !== 1 ? 'es' : ''} activa{conversaciones.length !== 1 ? 's' : ''}
          </p>
        </div>

        <ListaConversaciones conversaciones={conversaciones} />
      </main>
    </div>
  )
}