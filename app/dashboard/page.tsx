import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Navbar } from '@/components/layout/Navbar'
import { obtenerUsuarioActual } from '@/services/auth-servidor'
import { obtenerTickets } from '@/services/tickets-servidor'

export default async function PaginaDashboard() {
  const usuario = await obtenerUsuarioActual()
  console.log('USUARIO EN DASHBOARD:', usuario)
  if (!usuario) redirect('/auth/login')

  const tickets = await obtenerTickets()

  const conteo = {
    abierto: tickets.filter(t => t.estado === 'abierto').length,
    en_progreso: tickets.filter(t => t.estado === 'en_progreso').length,
    resuelto: tickets.filter(t => t.estado === 'resuelto').length,
    cerrado: tickets.filter(t => t.estado === 'cerrado').length,
    total: tickets.length,
  }

  const esAgente = usuario.rol === 'agent'

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Saludo */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-slate-900">
            Hola, {usuario.nombre}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {esAgente
              ? 'Panel de agente'
              : 'Panel de usuario'
            }
          </p>
        </div>

        {/* Tarjetas de resumen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <TarjetaResumen titulo="Total" cantidad={conteo.total} color="slate" />
          <TarjetaResumen titulo="Abiertos" cantidad={conteo.abierto} color="blue" />
          <TarjetaResumen titulo="En Progreso" cantidad={conteo.en_progreso} color="yellow" />
          <TarjetaResumen titulo="Resueltos" cantidad={conteo.resuelto} color="green" />
        </div>

        {/* Acciones rápidas */}
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
          <div className="flex flex-wrap gap-3">

            {!esAgente && (
              <Link
                href="/tickets/nuevo"
                className="px-4 py-2 bg-slate-900 text-white text-sm rounded-lg hover:bg-slate-700 transition-colors"
              >
                Crear nuevo ticket
              </Link>
            )}

            <Link
              href={esAgente ? '/admin/tickets' : '/tickets'}
              className="px-4 py-2 border border-slate-200 text-slate-700 text-sm rounded-lg hover:bg-slate-50 transition-colors"
            >
              Ver todos los tickets
            </Link>

          </div>
        </div>

      </main>
    </div>
  )
}

function TarjetaResumen({
  titulo,
  cantidad,
  color,
}: {
  titulo: string
  cantidad: number
  color: 'slate' | 'blue' | 'yellow' | 'green'
}) {
  const colores = {
    slate: 'bg-slate-900 text-white',
    blue: 'bg-blue-50 text-blue-900',
    yellow: 'bg-yellow-50 text-yellow-900',
    green: 'bg-green-50 text-green-900',
  }

  return (
    <div className={`rounded-xl p-5 ${colores[color]}`}>
      <p className="text-3xl font-bold">{cantidad}</p>
      <p className="text-sm mt-1 opacity-80">{titulo}</p>
    </div>
  )
}
