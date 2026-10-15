/**
 * Método de la Ruta Crítica (CPM).
 *
 * Paso hacia adelante: IC = máx(TC de predecesores), TC = IC + duración.
 * Paso hacia atrás:    TL = mín(IL de sucesores),   IL = TL − duración.
 * Holgura total = IL − IC. Una actividad es crítica si su holgura total es 0.
 */
import { mapaSucesores, ordenTopologico } from './grafo'
import { EPSILON, iguales } from './numeros'
import type { ActividadNormalizada, FilaCPM, ResultadoCPM } from './tipos'

interface Tiempos {
  ic: number
  tc: number
  origenIC: string | null
}

export function calcularCPM(actividades: ActividadNormalizada[]): ResultadoCPM {
  const porNombre = new Map(actividades.map((a) => [a.nombre, a]))
  const sucesores = mapaSucesores(actividades)
  const orden = ordenTopologico(actividades)

  const tempranos = pasoAdelante(orden, porNombre)
  const duracion = Math.max(0, ...[...tempranos.values()].map((t) => t.tc))
  const tardios = pasoAtras(orden, porNombre, sucesores, duracion)

  const filas = actividades.map((actividad): FilaCPM => {
    const { ic, tc, origenIC } = tempranos.get(actividad.nombre) as Tiempos
    const { il, tl, destinoTL } = tardios.get(actividad.nombre) as { il: number; tl: number; destinoTL: string | null }
    const siguientes = sucesores.get(actividad.nombre) ?? []
    const inicioSiguiente = siguientes.length
      ? Math.min(...siguientes.map((s) => (tempranos.get(s) as Tiempos).ic))
      : duracion
    const holguraTotal = limpiarCero(il - ic)
    return {
      nombre: actividad.nombre,
      duracion: actividad.duracion,
      ic,
      tc,
      il,
      tl,
      holguraTotal,
      holguraLibre: limpiarCero(inicioSiguiente - tc),
      critica: holguraTotal === 0,
      origenIC,
      destinoTL,
    }
  })

  return { filas, duracion, rutas: rutasCriticas(filas, actividades, sucesores, duracion) }
}

function pasoAdelante(orden: string[], porNombre: Map<string, ActividadNormalizada>): Map<string, Tiempos> {
  const tiempos = new Map<string, Tiempos>()
  for (const nombre of orden) {
    const actividad = porNombre.get(nombre) as ActividadNormalizada
    let ic = 0
    let origenIC: string | null = null
    for (const p of actividad.predecesores) {
      const tcPredecesor = (tiempos.get(p) as Tiempos).tc
      // Ante empate se queda el primero, para que el paso a paso sea estable.
      if (origenIC === null || tcPredecesor > ic + EPSILON) {
        ic = tcPredecesor
        origenIC = p
      }
    }
    tiempos.set(nombre, { ic, tc: ic + actividad.duracion, origenIC })
  }
  return tiempos
}

function pasoAtras(
  orden: string[],
  porNombre: Map<string, ActividadNormalizada>,
  sucesores: Map<string, string[]>,
  duracion: number,
) {
  const tiempos = new Map<string, { il: number; tl: number; destinoTL: string | null }>()
  for (const nombre of [...orden].reverse()) {
    const actividad = porNombre.get(nombre) as ActividadNormalizada
    let tl = duracion
    let destinoTL: string | null = null
    for (const s of sucesores.get(nombre) ?? []) {
      const ilSucesor = (tiempos.get(s) as { il: number }).il
      if (destinoTL === null || ilSucesor < tl - EPSILON) {
        tl = ilSucesor
        destinoTL = s
      }
    }
    tiempos.set(nombre, { il: tl - actividad.duracion, tl, destinoTL })
  }
  return tiempos
}

/** Convierte residuos de punto flotante (ej. 4e-17) en un cero exacto. */
function limpiarCero(valor: number): number {
  return iguales(valor, 0) ? 0 : valor
}

/**
 * Enumera todas las rutas críticas completas: cadenas de actividades críticas
 * que empiezan en 0, terminan en la duración del proyecto y donde cada
 * actividad empieza exactamente cuando termina la anterior.
 */
export function rutasCriticas(
  filas: FilaCPM[],
  actividades: ActividadNormalizada[],
  sucesores: Map<string, string[]>,
  duracion: number,
): string[][] {
  const fila = new Map(filas.map((f) => [f.nombre, f]))
  const rutas: string[][] = []

  const extender = (ruta: string[]) => {
    const ultima = fila.get(ruta[ruta.length - 1] as string) as FilaCPM
    const siguientes = (sucesores.get(ultima.nombre) ?? []).filter((s) => {
      const f = fila.get(s) as FilaCPM
      return f.critica && iguales(f.ic, ultima.tc)
    })
    if (siguientes.length === 0) {
      if (iguales(ultima.tc, duracion)) rutas.push(ruta)
      return
    }
    for (const s of siguientes) extender([...ruta, s])
  }

  for (const actividad of actividades) {
    const f = fila.get(actividad.nombre) as FilaCPM
    if (f.critica && iguales(f.ic, 0) && actividad.predecesores.length === 0) extender([f.nombre])
  }
  return rutas
}
