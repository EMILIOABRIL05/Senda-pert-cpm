import { useRef, type KeyboardEvent, type ReactNode } from 'react'

interface Opcion<T extends string> {
  valor: T
  etiqueta: ReactNode
  descripcion?: string
}

interface Props<T extends string> {
  opciones: Opcion<T>[]
  valor: T
  onCambio: (valor: T) => void
  etiqueta: string
  tamano?: 'sm' | 'md'
}

/**
 * Control segmentado (estilo iOS) accesible como grupo de radios:
 * las flechas izquierda/derecha cambian la opción.
 */
export function ControlSegmentado<T extends string>({ opciones, valor, onCambio, etiqueta, tamano = 'md' }: Props<T>) {
  const botones = useRef<(HTMLButtonElement | null)[]>([])

  const alPresionarTecla = (evento: KeyboardEvent, indice: number) => {
    const paso = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0
    if (paso === 0) return
    evento.preventDefault()
    const siguiente = (indice + paso + opciones.length) % opciones.length
    const opcion = opciones[siguiente]
    if (!opcion) return
    onCambio(opcion.valor)
    botones.current[siguiente]?.focus()
  }

  const alto = tamano === 'sm' ? 'h-8 text-[13px]' : 'h-9 text-sm'

  return (
    <div role="radiogroup" aria-label={etiqueta} className="inline-flex rounded-full bg-superficie-3 p-0.5">
      {opciones.map((opcion, i) => {
        const activo = opcion.valor === valor
        return (
          <button
            key={opcion.valor}
            ref={(el) => {
              botones.current[i] = el
            }}
            type="button"
            role="radio"
            aria-checked={activo}
            tabIndex={activo ? 0 : -1}
            title={opcion.descripcion}
            onClick={() => onCambio(opcion.valor)}
            onKeyDown={(e) => alPresionarTecla(e, i)}
            className={`${alto} inline-flex items-center gap-1.5 rounded-full px-3.5 font-medium transition-all duration-200 ${
              activo ? 'bg-superficie text-texto shadow-[0_1px_3px_rgb(0_0_0/0.12)]' : 'text-texto-3 hover:text-texto'
            }`}
          >
            {opcion.etiqueta}
          </button>
        )
      })}
    </div>
  )
}
