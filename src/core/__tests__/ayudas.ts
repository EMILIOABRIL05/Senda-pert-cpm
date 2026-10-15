import type { Actividad, Proyecto } from '../tipos'

/** Crea una actividad con valores vacíos para no repetir campos en cada prueba. */
function actividad(parcial: Partial<Actividad> & { nombre: string }): Actividad {
  return {
    id: parcial.nombre,
    descripcion: '',
    predecesores: '',
    duracion: '',
    a: '',
    m: '',
    b: '',
    ...parcial,
  }
}

/** Proyecto CPM a partir de filas [nombre, predecesores, duración]. */
export function proyectoCPM(filas: [string, string, number | string][]): Proyecto {
  return {
    nombre: 'Prueba',
    modo: 'CPM',
    unidad: 'días',
    fechaInicio: null,
    actividades: filas.map(([nombre, predecesores, duracion]) =>
      actividad({ nombre, predecesores, duracion: String(duracion) }),
    ),
  }
}

/** Proyecto PERT a partir de filas [nombre, predecesores, a, m, b]. */
export function proyectoPERT(filas: [string, string, number, number, number][]): Proyecto {
  return {
    nombre: 'Prueba',
    modo: 'PERT',
    unidad: 'días',
    fechaInicio: null,
    actividades: filas.map(([nombre, predecesores, a, m, b]) =>
      actividad({ nombre, predecesores, a: String(a), m: String(m), b: String(b) }),
    ),
  }
}

/** Ejercicio de clase: una ficticia en la red AOA. */
export const CASO_1 = proyectoCPM([
  ['A', '', 3],
  ['B', 'A', 4],
  ['C', 'A', 2],
  ['D', 'B, C', 5],
])

/** Dos rutas críticas. */
export const CASO_2 = proyectoCPM([
  ['A', '', 3],
  ['B', '', 3],
  ['C', 'A', 2],
  ['D', 'B', 2],
  ['E', 'C, D', 4],
])

/** Traslape parcial de predecesores. */
export const CASO_3 = proyectoCPM([
  ['A', '', 2],
  ['B', '', 3],
  ['C', 'A', 4],
  ['D', 'A, B', 2],
])
