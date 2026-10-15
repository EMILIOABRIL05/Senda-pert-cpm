import type { ReactNode } from 'react'

interface Props {
  id: string
  titulo: string
  descripcion?: ReactNode
  acciones?: ReactNode
  children: ReactNode
}

/** Bloque de la página con título grande y contenido en una tarjeta. */
export function Seccion({ id, titulo, descripcion, acciones, children }: Props) {
  return (
    <section id={id} aria-labelledby={`${id}-titulo`} className="scroll-mt-20">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3 px-1">
        <div className="min-w-0">
          <h2 id={`${id}-titulo`} className="font-display text-[22px] font-semibold tracking-tight text-texto">
            {titulo}
          </h2>
          {descripcion && <p className="mt-0.5 text-sm text-texto-3">{descripcion}</p>}
        </div>
        {acciones && <div className="flex flex-wrap items-center gap-2">{acciones}</div>}
      </div>
      {children}
    </section>
  )
}

/** Superficie blanca (o gris oscuro) con borde sutil. */
export function Tarjeta({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-borde bg-superficie shadow-suave ${className}`}>
      {children}
    </div>
  )
}
