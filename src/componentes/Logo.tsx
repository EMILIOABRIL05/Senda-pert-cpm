/**
 * Isotipo de Senda: un camino de tres eventos donde el tramo final
 * (la ruta crítica) está resaltado.
 */
export function Logo({ tamano = 28 }: { tamano?: number }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="8" fill="var(--texto)" />
      <path d="M8 21 L16 11" stroke="var(--fondo)" strokeOpacity="0.55" strokeWidth="2.4" strokeLinecap="round" />
      <path d="M16 11 L24 21" stroke="var(--critico)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="8" cy="21" r="3" fill="var(--fondo)" />
      <circle cx="16" cy="11" r="3" fill="var(--fondo)" />
      <circle cx="24" cy="21" r="3" fill="var(--critico)" />
    </svg>
  )
}
