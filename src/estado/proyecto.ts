/**
 * Estado del proyecto como reductor puro: cada cambio de la interfaz es una
 * acción con nombre, fácil de seguir y de probar.
 */
import { tiempoEsperado } from '../core/pert'
import { aNumero, formatear } from '../core/numeros'
import type { Actividad, Modo, Proyecto } from '../core/tipos'

export type CampoEditable = 'nombre' | 'descripcion' | 'predecesores' | 'duracion' | 'a' | 'm' | 'b'

export type Accion =
  | { tipo: 'agregar'; despuesDe?: string }
  | { tipo: 'eliminar'; id: string }
  | { tipo: 'mover'; id: string; direccion: -1 | 1 }
  | { tipo: 'editar'; id: string; campo: CampoEditable; valor: string }
  | { tipo: 'cambiarModo'; modo: Modo }
  | { tipo: 'renombrar'; nombre: string }
  | { tipo: 'cambiarUnidad'; unidad: string }
  | { tipo: 'cambiarFecha'; fecha: string | null }
  | { tipo: 'cargar'; proyecto: Proyecto }

export function reductorProyecto(proyecto: Proyecto, accion: Accion): Proyecto {
  switch (accion.tipo) {
    case 'agregar':
      return { ...proyecto, actividades: agregarActividad(proyecto.actividades, accion.despuesDe) }
    case 'eliminar':
      return { ...proyecto, actividades: proyecto.actividades.filter((a) => a.id !== accion.id) }
    case 'mover': {
      const actividades = moverActividad(proyecto.actividades, accion.id, accion.direccion)
      // Sin cambios se devuelve el mismo objeto, para no re-renderizar ni guardar de más.
      return actividades === proyecto.actividades ? proyecto : { ...proyecto, actividades }
    }
    case 'editar':
      return {
        ...proyecto,
        actividades: proyecto.actividades.map((a) => (a.id === accion.id ? { ...a, [accion.campo]: accion.valor } : a)),
      }
    case 'cambiarModo':
      return cambiarModo(proyecto, accion.modo)
    case 'renombrar':
      return { ...proyecto, nombre: accion.nombre }
    case 'cambiarUnidad':
      return { ...proyecto, unidad: accion.unidad }
    case 'cambiarFecha':
      return { ...proyecto, fechaInicio: accion.fecha }
    case 'cargar':
      return accion.proyecto
  }
}

export function nuevoId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

export function actividadVacia(nombre: string): Actividad {
  return { id: nuevoId(), nombre, descripcion: '', predecesores: '', duracion: '', a: '', m: '', b: '' }
}

/** Siguiente nombre libre en la secuencia A, B, …, Z, AA, AB, … */
export function siguienteNombre(actividades: Actividad[]): string {
  const usados = new Set(actividades.map((a) => a.nombre.trim()))
  for (let i = 0; ; i++) {
    const candidato = nombreDeIndice(i)
    if (!usados.has(candidato)) return candidato
  }
}

function nombreDeIndice(indice: number): string {
  let resto = indice
  let nombre = ''
  do {
    nombre = String.fromCharCode(65 + (resto % 26)) + nombre
    resto = Math.floor(resto / 26) - 1
  } while (resto >= 0)
  return nombre
}

function agregarActividad(actividades: Actividad[], despuesDe?: string): Actividad[] {
  const nueva = actividadVacia(siguienteNombre(actividades))
  const indice = despuesDe ? actividades.findIndex((a) => a.id === despuesDe) : -1
  if (indice < 0) return [...actividades, nueva]
  return [...actividades.slice(0, indice + 1), nueva, ...actividades.slice(indice + 1)]
}

function moverActividad(actividades: Actividad[], id: string, direccion: -1 | 1): Actividad[] {
  const desde = actividades.findIndex((a) => a.id === id)
  const hasta = desde + direccion
  if (desde < 0 || hasta < 0 || hasta >= actividades.length) return actividades
  const copia = [...actividades]
  const [movida] = copia.splice(desde, 1)
  if (movida) copia.splice(hasta, 0, movida)
  return copia
}

/**
 * Al cambiar de modo no se pierden datos: CPM → PERT usa la duración como
 * a = m = b; PERT → CPM usa el tiempo esperado te como duración.
 */
function cambiarModo(proyecto: Proyecto, modo: Modo): Proyecto {
  if (modo === proyecto.modo) return proyecto
  const actividades = proyecto.actividades.map((a) => {
    if (modo === 'PERT' && a.a === '' && a.m === '' && a.b === '') {
      return { ...a, a: a.duracion, m: a.duracion, b: a.duracion }
    }
    if (modo === 'CPM' && a.duracion === '') {
      const [optimista, probable, pesimista] = [a.a, a.m, a.b].map(aNumero)
      if (optimista != null && probable != null && pesimista != null) {
        return { ...a, duracion: formatear(tiempoEsperado(optimista, probable, pesimista), 4) }
      }
    }
    return a
  })
  return { ...proyecto, modo, actividades }
}
