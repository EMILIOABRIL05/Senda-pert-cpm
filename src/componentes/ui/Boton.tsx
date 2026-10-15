import type { ButtonHTMLAttributes, ReactNode } from 'react'

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro'
type Tamano = 'sm' | 'md'

interface PropsBoton extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante
  tamano?: Tamano
  icono?: ReactNode
  /** Solo icono: exige `aria-label` para lectores de pantalla. */
  soloIcono?: boolean
}

const VARIANTES: Record<Variante, string> = {
  primario: 'bg-acento text-sobre-acento hover:bg-acento-fuerte shadow-sm',
  secundario: 'bg-superficie text-texto border border-borde-fuerte hover:bg-superficie-3',
  fantasma: 'text-texto-2 hover:bg-superficie-3 hover:text-texto',
  peligro: 'text-texto-3 hover:bg-critico-suave hover:text-critico',
}

const TAMANOS: Record<Tamano, string> = {
  sm: 'h-8 px-3 text-[13px] gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
}

export function Boton({
  variante = 'secundario',
  tamano = 'md',
  icono,
  soloIcono = false,
  className = '',
  children,
  type = 'button',
  ...props
}: PropsBoton) {
  const forma = soloIcono ? (tamano === 'sm' ? 'h-8 w-8 justify-center' : 'h-10 w-10 justify-center') : TAMANOS[tamano]
  return (
    <button
      type={type}
      className={`inline-flex shrink-0 select-none items-center rounded-full font-medium transition-all duration-150 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${VARIANTES[variante]} ${forma} ${className}`}
      {...props}
    >
      {icono}
      {!soloIcono && children}
    </button>
  )
}
