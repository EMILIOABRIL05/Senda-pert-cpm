/** Muestra una ruta como A → B → D, con estilo de "camino". */
export function RutaCritica({ ruta, tamano = 'md' }: { ruta: string[]; tamano?: 'sm' | 'md' }) {
  const ficha = tamano === 'sm' ? 'h-6 min-w-6 px-1.5 text-xs' : 'h-8 min-w-8 px-2.5 text-sm'
  return (
    <span className="inline-flex flex-wrap items-center gap-1" aria-label={`Ruta ${ruta.join(', ')}`}>
      {ruta.map((nombre, i) => (
        <span key={`${nombre}-${i}`} className="inline-flex items-center gap-1">
          {i > 0 && (
            <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden="true" className="text-critico">
              <path d="M0 5h11M8 1.5 11.5 5 8 8.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          <span className={`inline-flex items-center justify-center rounded-full bg-critico-suave font-semibold text-critico ring-1 ring-critico/30 ring-inset ${ficha}`}>
            {nombre}
          </span>
        </span>
      ))}
    </span>
  )
}
