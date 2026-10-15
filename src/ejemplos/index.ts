/**
 * Ejercicios precargados. Los tres primeros son los casos de clase que
 * también usan las pruebas; los otros muestran proyectos más realistas.
 */
import type { Actividad, Modo, Proyecto } from '../core/tipos'
import { nuevoId } from '../estado/proyecto'

export interface Ejemplo {
  titulo: string
  descripcion: string
  crear: () => Proyecto
}

type FilaCPM = [nombre: string, descripcion: string, predecesores: string, duracion: number]
type FilaPERT = [nombre: string, descripcion: string, predecesores: string, a: number, m: number, b: number]

function proyecto(nombre: string, modo: Modo, actividades: Omit<Actividad, 'id'>[]): Proyecto {
  return {
    nombre,
    modo,
    unidad: 'días',
    fechaInicio: null,
    actividades: actividades.map((a) => ({ ...a, id: nuevoId() })),
  }
}

function cpm(nombre: string, filas: FilaCPM[]): Proyecto {
  return proyecto(
    nombre,
    'CPM',
    filas.map(([n, descripcion, predecesores, duracion]) => ({
      nombre: n,
      descripcion,
      predecesores,
      duracion: String(duracion),
      a: '',
      m: '',
      b: '',
    })),
  )
}

function pert(nombre: string, filas: FilaPERT[]): Proyecto {
  return proyecto(
    nombre,
    'PERT',
    filas.map(([n, descripcion, predecesores, a, m, b]) => ({
      nombre: n,
      descripcion,
      predecesores,
      duracion: '',
      a: String(a),
      m: String(m),
      b: String(b),
    })),
  )
}

export const EJEMPLOS: Ejemplo[] = [
  {
    titulo: 'Ejercicio de clase',
    descripcion: 'CPM con una actividad ficticia · 4 actividades',
    crear: () =>
      cpm('Ejercicio de clase', [
        ['A', 'Planificación', '', 3],
        ['B', 'Desarrollo del módulo principal', 'A', 4],
        ['C', 'Compra de materiales', 'A', 2],
        ['D', 'Integración y entrega', 'B, C', 5],
      ]),
  },
  {
    titulo: 'Dos rutas críticas',
    descripcion: 'Todas las holguras son cero · 5 actividades',
    crear: () =>
      cpm('Dos rutas críticas', [
        ['A', 'Estudio de mercado', '', 3],
        ['B', 'Estudio técnico', '', 3],
        ['C', 'Plan comercial', 'A', 2],
        ['D', 'Plan de producción', 'B', 2],
        ['E', 'Plan de negocios final', 'C, D', 4],
      ]),
  },
  {
    titulo: 'Traslape de predecesores',
    descripcion: 'C depende de A; D depende de A y B',
    crear: () =>
      cpm('Traslape de predecesores', [
        ['A', 'Preparar terreno', '', 2],
        ['B', 'Contratar personal', '', 3],
        ['C', 'Instalar estructura', 'A', 4],
        ['D', 'Capacitar en sitio', 'A, B', 2],
      ]),
  },
  {
    titulo: 'Construcción de una vivienda',
    descripcion: 'CPM realista · 10 actividades',
    crear: () =>
      cpm('Construcción de una vivienda', [
        ['A', 'Diseño de planos', '', 5],
        ['B', 'Permisos municipales', 'A', 10],
        ['C', 'Excavación y cimientos', 'B', 8],
        ['D', 'Estructura', 'C', 12],
        ['E', 'Instalaciones eléctricas', 'D', 6],
        ['F', 'Plomería', 'D', 5],
        ['G', 'Techo', 'D', 7],
        ['H', 'Paredes y enlucido', 'E, F', 9],
        ['I', 'Pintura', 'G, H', 4],
        ['J', 'Acabados y entrega', 'I', 3],
      ]),
  },
  {
    titulo: 'Lanzamiento de una app',
    descripcion: 'PERT con tres tiempos · 9 actividades',
    crear: () =>
      pert('Lanzamiento de una app', [
        ['A', 'Levantamiento de requisitos', '', 2, 4, 6],
        ['B', 'Diseño de arquitectura', 'A', 3, 5, 9],
        ['C', 'Diseño de interfaz', 'A', 2, 3, 6],
        ['D', 'Desarrollo del backend', 'B', 8, 12, 20],
        ['E', 'Desarrollo del frontend', 'B, C', 6, 10, 14],
        ['F', 'Integración', 'D, E', 3, 4, 7],
        ['G', 'Pruebas', 'F', 2, 4, 8],
        ['H', 'Manual de usuario', 'E', 1, 2, 3],
        ['I', 'Publicación', 'G, H', 1, 1, 2],
      ]),
  },
]

export function proyectoEnBlanco(): Proyecto {
  return cpm('Proyecto sin título', [['A', '', '', 1]])
}
