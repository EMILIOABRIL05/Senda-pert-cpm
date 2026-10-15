/**
 * Explicación didáctica del CPM: para cada actividad, qué valores se
 * comparan y cuál gana. Reutiliza los resultados de calcularCPM, así la
 * explicación nunca puede contradecir a la tabla.
 */
import { mapaSucesores, ordenTopologico } from './grafo'
import type { ActividadNormalizada, FilaCPM, ResultadoCPM } from './tipos'

export interface Termino {
  nombre: string
  valor: number
}

export interface PasoAdelante {
  nombre: string
  /** TC de cada predecesor (se toma el máximo). */
  terminos: Termino[]
  ic: number
  origen: string | null
  duracion: number
  tc: number
}

export interface PasoAtras {
  nombre: string
  /** IL de cada sucesor (se toma el mínimo). */
  terminos: Termino[]
  tl: number
  destino: string | null
  duracion: number
  il: number
}

function filasPorNombre(cpm: ResultadoCPM): Map<string, FilaCPM> {
  return new Map(cpm.filas.map((f) => [f.nombre, f]))
}

export function explicarPasoAdelante(actividades: ActividadNormalizada[], cpm: ResultadoCPM): PasoAdelante[] {
  const fila = filasPorNombre(cpm)
  const porNombre = new Map(actividades.map((a) => [a.nombre, a]))
  return ordenTopologico(actividades).map((nombre) => {
    const f = fila.get(nombre) as FilaCPM
    const predecesores = porNombre.get(nombre)?.predecesores ?? []
    return {
      nombre,
      terminos: predecesores.map((p) => ({ nombre: p, valor: (fila.get(p) as FilaCPM).tc })),
      ic: f.ic,
      origen: f.origenIC,
      duracion: f.duracion,
      tc: f.tc,
    }
  })
}

export function explicarPasoAtras(actividades: ActividadNormalizada[], cpm: ResultadoCPM): PasoAtras[] {
  const fila = filasPorNombre(cpm)
  const sucesores = mapaSucesores(actividades)
  return ordenTopologico(actividades)
    .reverse()
    .map((nombre) => {
      const f = fila.get(nombre) as FilaCPM
      return {
        nombre,
        terminos: (sucesores.get(nombre) ?? []).map((s) => ({ nombre: s, valor: (fila.get(s) as FilaCPM).il })),
        tl: f.tl,
        destino: f.destinoTL,
        duracion: f.duracion,
        il: f.il,
      }
    })
}
