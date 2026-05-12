// Muestra etiquetas coloreadas para estados, prioridades, etc.

interface PropsBadge {
  texto: string
  claseColor: string
}

export function Badge({ texto, claseColor }: PropsBadge) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${claseColor}`}>
      {texto}
    </span>
  )
}
