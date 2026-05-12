// Componente Boton reutilizable con variantes de estilo

import { ButtonHTMLAttributes } from 'react'

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: 'primario' | 'secundario' | 'peligro' | 'fantasma'
  tamano?: 'sm' | 'md' | 'lg'
  cargando?: boolean
}

// Estilos base 
const estilosBase = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

// Estilos según la variante
const estilosVariante = {
  primario: 'bg-slate-900 text-white hover:bg-slate-700 focus:ring-slate-500',
  secundario: 'bg-white text-slate-900 border border-slate-300 hover:bg-slate-50 focus:ring-slate-500',
  peligro: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  fantasma: 'text-slate-600 hover:bg-slate-100 focus:ring-slate-500',
}

// Estilos según el tamaño
const estilosTamano = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

export function Boton({
  variante = 'primario',
  tamano = 'md',
  cargando = false,
  children,
  className = '',
  disabled,
  ...props
}: PropsBoton) {
  return (
    <button
      className={`${estilosBase} ${estilosVariante[variante]} ${estilosTamano[tamano]} ${className}`}
      disabled={disabled || cargando}
      {...props}
    >
      {cargando ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Cargando...
        </>
      ) : children}
    </button>
  )
}
