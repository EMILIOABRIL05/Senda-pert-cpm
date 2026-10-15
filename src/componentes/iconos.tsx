/**
 * Iconos propios en SVG (trazo de 1.75, estilo lineal). Se evita una
 * librería de iconos para no sumar dependencias al proyecto.
 */
import type { SVGProps } from 'react'

type PropsIcono = SVGProps<SVGSVGElement> & { tamano?: number }

function Icono({ tamano = 18, children, ...props }: PropsIcono) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  )
}

export const IconoMas = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 5v14M5 12h14" />
  </Icono>
)

export const IconoPapelera = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  </Icono>
)

export const IconoFlechaArriba = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </Icono>
)

export const IconoFlechaAbajo = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 5v14M6 13l6 6 6-6" />
  </Icono>
)

export const IconoChevron = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icono>
)

export const IconoSol = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </Icono>
)

export const IconoLuna = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Icono>
)

export const IconoPantalla = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" />
  </Icono>
)

export const IconoLibro = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z" />
    <path d="M4 19a2 2 0 0 1 2-2h13" />
  </Icono>
)

export const IconoDescargar = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Icono>
)

export const IconoSubir = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 20V9M7 14l5-5 5 5M5 4h14" />
  </Icono>
)

export const IconoAlerta = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M12 3 2 20h20L12 3Z" />
    <path d="M12 10v4M12 17h.01" />
  </Icono>
)

export const IconoCheck = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="m5 12 5 5 9-10" />
  </Icono>
)

export const IconoInfo = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 11v5M12 8h.01" />
  </Icono>
)

export const IconoAjustes = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Icono>
)

export const IconoAcercar = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8 11h6M11 8v6" />
  </Icono>
)

export const IconoAlejar = (p: PropsIcono) => (
  <Icono {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5M8 11h6" />
  </Icono>
)

export const IconoEncuadrar = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 9V5a1 1 0 0 1 1-1h4M15 4h4a1 1 0 0 1 1 1v4M20 15v4a1 1 0 0 1-1 1h-4M9 20H5a1 1 0 0 1-1-1v-4" />
  </Icono>
)

export const IconoImagen = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <circle cx="9" cy="10" r="1.5" />
    <path d="m4 18 5-5 4 4 3-3 4 4" />
  </Icono>
)

export const IconoDocumento = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M7 3h7l5 5v12a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
    <path d="M14 3v5h5M9 13h6M9 17h6" />
  </Icono>
)

export const IconoTabla = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="3" y="4" width="18" height="16" rx="2" />
    <path d="M3 10h18M3 15h18M9 4v16" />
  </Icono>
)

export const IconoPasos = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 18h5v-5h5V8h6" />
    <circle cx="4" cy="18" r="1" />
  </Icono>
)

export const IconoReiniciar = (p: PropsIcono) => (
  <Icono {...p}>
    <path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.5" />
    <path d="M4 4v4.5h4.5" />
  </Icono>
)

export const IconoTeclado = (p: PropsIcono) => (
  <Icono {...p}>
    <rect x="2.5" y="6" width="19" height="12" rx="2" />
    <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M8 14h8" />
  </Icono>
)
