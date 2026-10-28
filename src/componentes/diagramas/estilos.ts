import type { CSSProperties } from 'react'

/**
 * Estilo común de las flechas en ambas redes. La ruta crítica se distingue
 * por color Y por grosor; las ficticias, por trazo punteado.
 */
export function estiloFlecha(critica: boolean, ficticia = false) {
  const color = critica ? 'var(--critico)' : ficticia ? 'var(--texto-3)' : 'var(--texto-2)'
  const style: CSSProperties = {
    stroke: color,
    strokeWidth: critica ? 3 : 1.5,
    strokeDasharray: ficticia ? '6 5' : undefined,
  }
  const labelStyle: CSSProperties = {
    fill: critica ? 'var(--critico)' : ficticia ? 'var(--texto-3)' : 'var(--texto)',
    fontWeight: critica ? 700 : 500,
    fontSize: 12,
    fontStyle: ficticia ? 'italic' : undefined,
  }
  return {
    color,
    style,
    labelStyle,
    labelBgStyle: { fill: 'var(--superficie)', fillOpacity: 0.92 } satisfies CSSProperties,
    labelBgPadding: [6, 3] as [number, number],
    labelBgBorderRadius: 6,
  }
}

/**
 * Calcula la posición (x, y) de la etiqueta desplazada hacia un lado (arriba/afuera)
 * de la curva Bézier para que el texto nunca se sobreponga encima de la línea.
 */
export function posicionEtiquetaFlecha(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  lx: number,
  ly: number,
  etiqueta: string,
): { x: number; y: number } {
  const dx = x2 - x1
  const dy = y2 - y1
  // En una curva Bézier con tangentes horizontales en los extremos, la derivada
  // en t = 0.5 es proporcional a (0.5 * dx, 1.5 * dy).
  const tx = 0.5 * dx
  const ty = 1.5 * dy
  const longitud = Math.hypot(tx, ty) || 1
  // Vector normal unitario hacia el lado superior/exterior de la curva.
  const nx = ty / longitud
  const ny = -tx / longitud

  const mitadAncho = (etiqueta.length * 7 + 10) / 2
  const mitadAlto = 8
  const separacion = Math.abs(nx) * mitadAncho + Math.abs(ny) * mitadAlto + 6

  return {
    x: lx + nx * separacion,
    y: ly + ny * separacion,
  }
}
