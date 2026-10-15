import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

export interface ElementoMenu {
  etiqueta: string
  descripcion?: string
  icono?: ReactNode
  alElegir: () => void
}

interface Props {
  /** Contenido del botón que abre el menú. */
  disparador: ReactNode
  etiqueta: string
  elementos?: ElementoMenu[]
  /** Contenido libre en lugar de una lista (ej. panel de apariencia). */
  children?: ReactNode
  alineacion?: 'izquierda' | 'derecha'
  claseDisparador?: string
}

/**
 * Menú desplegable accesible: se abre con clic o teclado, se navega con
 * flechas, se cierra con Escape o al hacer clic fuera.
 */
export function Menu({ disparador, etiqueta, elementos, children, alineacion = 'derecha', claseDisparador = '' }: Props) {
  const [abierto, setAbierto] = useState(false)
  const contenedor = useRef<HTMLDivElement>(null)
  const boton = useRef<HTMLButtonElement>(null)
  const idPanel = useId()

  useEffect(() => {
    if (!abierto) return
    const alClicFuera = (evento: PointerEvent) => {
      if (!contenedor.current?.contains(evento.target as Node)) setAbierto(false)
    }
    document.addEventListener('pointerdown', alClicFuera)
    return () => document.removeEventListener('pointerdown', alClicFuera)
  }, [abierto])

  useEffect(() => {
    if (abierto && elementos) {
      contenedor.current?.querySelector<HTMLElement>('[role="menuitem"]')?.focus()
    }
  }, [abierto, elementos])

  const cerrar = () => {
    setAbierto(false)
    boton.current?.focus()
  }

  const alPresionarTecla = (evento: KeyboardEvent) => {
    if (evento.key === 'Escape') {
      evento.preventDefault()
      cerrar()
      return
    }
    if (!elementos || (evento.key !== 'ArrowDown' && evento.key !== 'ArrowUp')) return
    evento.preventDefault()
    const items = [...(contenedor.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])]
    const actual = items.indexOf(document.activeElement as HTMLElement)
    const paso = evento.key === 'ArrowDown' ? 1 : -1
    items[(actual + paso + items.length) % items.length]?.focus()
  }

  return (
    <div ref={contenedor} className="relative" onKeyDown={alPresionarTecla}>
      <button
        ref={boton}
        type="button"
        aria-haspopup={elementos ? 'menu' : 'dialog'}
        aria-expanded={abierto}
        aria-controls={idPanel}
        aria-label={etiqueta}
        onClick={() => setAbierto((v) => !v)}
        className={`inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13px] font-medium text-texto-2 transition-colors hover:bg-superficie-3 hover:text-texto aria-expanded:bg-superficie-3 aria-expanded:text-texto ${claseDisparador}`}
      >
        {disparador}
      </button>
      {abierto && (
        <div
          id={idPanel}
          role={elementos ? 'menu' : 'dialog'}
          aria-label={etiqueta}
          className={`animar-aparicion absolute top-full z-50 mt-2 min-w-64 origin-top rounded-2xl border border-borde bg-superficie/95 p-1.5 shadow-elevada backdrop-blur-xl ${
            alineacion === 'derecha' ? 'right-0' : 'left-0'
          }`}
        >
          {elementos?.map((el) => (
            <button
              key={el.etiqueta}
              type="button"
              role="menuitem"
              onClick={() => {
                el.alElegir()
                cerrar()
              }}
              className="flex w-full items-start gap-3 rounded-xl px-3 py-2 text-left outline-none transition-colors hover:bg-superficie-3 focus-visible:bg-acento-suave"
            >
              {el.icono && <span className="mt-0.5 text-texto-3">{el.icono}</span>}
              <span className="min-w-0">
                <span className="block text-sm font-medium text-texto">{el.etiqueta}</span>
                {el.descripcion && <span className="block text-xs text-texto-3">{el.descripcion}</span>}
              </span>
            </button>
          ))}
          {children}
        </div>
      )}
    </div>
  )
}
