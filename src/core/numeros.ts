/**
 * Utilidades numéricas compartidas.
 *
 * En PERT los tiempos esperados tienen decimales periódicos (ej. 3.333…),
 * así que comparar con === puede fallar por errores de redondeo de punto
 * flotante. Por eso toda comparación pasa por una tolerancia.
 */

export const EPSILON = 1e-9

export function iguales(x: number, y: number): boolean {
  return Math.abs(x - y) < EPSILON
}

/** Redondea a una cantidad fija de decimales (sin el sesgo de toFixed con 1.005). */
export function redondear(valor: number, decimales: number): number {
  const factor = 10 ** decimales
  return Math.round((valor + Number.EPSILON) * factor) / factor
}

/** Muestra un número sin decimales innecesarios: 3 → "3", 3.3333 → "3.33". */
export function formatear(valor: number, decimales = 2): string {
  const limpio = iguales(valor, Math.round(valor)) ? Math.round(valor) : redondear(valor, decimales)
  // Evita mostrar "-0" cuando una holgura es un cero negativo por redondeo.
  return Object.is(limpio, -0) ? '0' : String(limpio)
}

/** Convierte un texto a número aceptando coma decimal ("2,5"). Devuelve null si no es válido. */
export function aNumero(texto: string): number | null {
  const limpio = texto.trim().replace(',', '.')
  if (limpio === '') return null
  const valor = Number(limpio)
  return Number.isFinite(valor) ? valor : null
}
