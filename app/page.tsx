import { redirect } from 'next/navigation'
import { obtenerUsuarioActual } from '@/services/auth-servidor'

export default async function PaginaRaiz() {
  const usuario = await obtenerUsuarioActual()

  if (usuario) {
    redirect('/dashboard')
  } else {
    redirect('/auth/login')
  }
}
