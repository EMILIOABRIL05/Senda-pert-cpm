/**
 * PERT: tiempos con incertidumbre (estimación de tres tiempos).
 *
 * te = (a + 4m + b) / 6      σ² = ((b − a) / 6)²
 * La duración del proyecto se trata como una normal con media Te (duración
 * del CPM con te) y varianza igual a la suma de varianzas de la ruta crítica.
 */
import { EPSILON } from './numeros'
import { phi, phiInversa } from './normal'
import type { ActividadNormalizada, ResultadoCPM, ResultadoPERT } from './tipos'

export function tiempoEsperado(a: number, m: number, b: number): number {
  return (a + 4 * m + b) / 6
}

export function varianza(a: number, b: number): number {
  return ((b - a) / 6) ** 2
}

/** Si hay varias rutas críticas se usa la de mayor varianza (escenario más conservador). */
export function calcularPERT(actividades: ActividadNormalizada[], cpm: ResultadoCPM): ResultadoPERT {
  const varianzaDe = new Map(actividades.map((a) => [a.nombre, a.tiempos?.varianza ?? 0]))
  const sumar = (ruta: string[]) => ruta.reduce((total, nombre) => total + (varianzaDe.get(nombre) ?? 0), 0)

  let rutaVarianza: string[] = cpm.rutas[0] ?? []
  let mayor = sumar(rutaVarianza)
  for (const ruta of cpm.rutas.slice(1)) {
    const v = sumar(ruta)
    if (v > mayor + EPSILON) {
      mayor = v
      rutaVarianza = ruta
    }
  }

  return {
    media: cpm.duracion,
    varianza: mayor,
    desviacion: Math.sqrt(mayor),
    rutaVarianza,
    variasRutas: cpm.rutas.length > 1,
  }
}

/** P(T ≤ plazo) con Z = (plazo − Te) / σ. */
export function probabilidadPlazo(plazo: number, pert: ResultadoPERT): { z: number; p: number } {
  if (pert.desviacion < EPSILON) {
    // Sin incertidumbre: o se llega seguro o no se llega.
    const alcanza = plazo >= pert.media - EPSILON
    return { z: alcanza ? Infinity : -Infinity, p: alcanza ? 1 : 0 }
  }
  const z = (plazo - pert.media) / pert.desviacion
  return { z, p: phi(z) }
}

/** Cálculo inverso: plazo necesario para terminar con cierta confianza (0 < confianza < 1). */
export function plazoParaConfianza(confianza: number, pert: ResultadoPERT): { z: number; t: number } {
  const z = phiInversa(confianza)
  return { z, t: pert.media + z * pert.desviacion }
}
