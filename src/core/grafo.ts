/**
 * Operaciones de grafo sobre las precedencias (red de actividades en nodos).
 * Suponen datos ya validados: sin ciclos y con predecesores existentes.
 */
import type { ActividadNormalizada } from './tipos'

export type Precedencias = Map<string, Set<string>>

export function mapaSucesores(actividades: ActividadNormalizada[]): Map<string, string[]> {
  const sucesores = new Map<string, string[]>(actividades.map((a) => [a.nombre, []]))
  for (const actividad of actividades) {
    for (const p of actividad.predecesores) sucesores.get(p)?.push(actividad.nombre)
  }
  return sucesores
}

/**
 * Orden topológico (algoritmo de Kahn). Ante empates respeta el orden de
 * ingreso, para que los resultados se vean en el orden que espera el usuario.
 */
export function ordenTopologico(actividades: ActividadNormalizada[]): string[] {
  const pendientes = new Map(actividades.map((a) => [a.nombre, a.predecesores.length]))
  const sucesores = mapaSucesores(actividades)
  const orden: string[] = []
  const listas = actividades.filter((a) => a.predecesores.length === 0).map((a) => a.nombre)

  while (listas.length > 0) {
    const actual = listas.shift() as string
    orden.push(actual)
    for (const s of sucesores.get(actual) ?? []) {
      const restantes = (pendientes.get(s) ?? 0) - 1
      pendientes.set(s, restantes)
      if (restantes === 0) listas.push(s)
    }
  }
  return orden
}

/** Para cada actividad, el conjunto de TODAS las actividades que deben terminar antes (directas o indirectas). */
export function cierreTransitivo(actividades: ActividadNormalizada[]): Precedencias {
  const porNombre = new Map(actividades.map((a) => [a.nombre, a]))
  const cierre: Precedencias = new Map()
  for (const nombre of ordenTopologico(actividades)) {
    const todos = new Set<string>()
    for (const p of porNombre.get(nombre)?.predecesores ?? []) {
      todos.add(p)
      for (const indirecto of cierre.get(p) ?? []) todos.add(indirecto)
    }
    cierre.set(nombre, todos)
  }
  return cierre
}

/**
 * Quita los predecesores redundantes: si D depende de A y de B, y B ya
 * depende de A, la dependencia D←A está implícita y no necesita flecha.
 */
export function reduccionTransitiva(actividades: ActividadNormalizada[]): Map<string, string[]> {
  const cierre = cierreTransitivo(actividades)
  return new Map(
    actividades.map((actividad) => {
      const directos = actividad.predecesores.filter(
        (p) => !actividad.predecesores.some((otro) => otro !== p && cierre.get(otro)?.has(p)),
      )
      return [actividad.nombre, directos]
    }),
  )
}
