import type { ReactNode } from 'react'

interface Props {
  activo: boolean
  onCambio: (activo: boolean) => void
  children: ReactNode
}

/** Interruptor encendido/apagado con rol "switch" para lectores de pantalla. */
export function Interruptor({ activo, onCambio, children }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={activo}
      onClick={() => onCambio(!activo)}
      className="inline-flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3 text-sm font-medium text-texto-2 transition-colors hover:text-texto"
    >
      <span
        className={`relative h-6 w-10 shrink-0 rounded-full transition-colors duration-200 ${activo ? 'bg-acento' : 'bg-borde-fuerte'}`}
        aria-hidden="true"
      >
        <span
          className={`absolute top-0.5 left-0 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ${
            activo ? 'translate-x-[18px]' : 'translate-x-0.5'
          }`}
        />
      </span>
      {children}
    </button>
  )
}
