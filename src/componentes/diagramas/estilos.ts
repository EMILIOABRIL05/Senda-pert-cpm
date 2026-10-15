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
