/**
 * Guardado automático en localStorage e interpretación de archivos .json.
 *
 * Todo acceso al almacenamiento va en try/catch: en modo incógnito, con el
 * almacenamiento lleno o bloqueado, la app debe seguir funcionando igual.
 */
import type { Actividad, Modo, Proyecto } from '../core/tipos'
import { nuevoId } from './proyecto'

const CLAVE = 'senda:proyecto'
const VERSION_ARCHIVO = 1

type Almacen = Pick<Storage, 'getItem' | 'setItem'>

function almacenPorDefecto(): Almacen | null {
  try {
    return globalThis.localStorage ?? null
  } catch {
    return null
  }
}

export function leerProyectoGuardado(almacen: Almacen | null = almacenPorDefecto()): Proyecto | null {
  try {
    const texto = almacen?.getItem(CLAVE)
    return texto ? convertirAProyecto(JSON.parse(texto)) : null
  } catch {
    return null
  }
}

/** Devuelve false si no se pudo guardar (la app sigue funcionando en memoria). */
export function guardarProyecto(proyecto: Proyecto, almacen: Almacen | null = almacenPorDefecto()): boolean {
  try {
    if (!almacen) return false
    almacen.setItem(CLAVE, JSON.stringify(proyecto))
    return true
  } catch {
    return false
  }
}

/** Contenido del archivo .json exportado. */
export function paraArchivo(proyecto: Proyecto) {
  return { aplicacion: 'Senda', version: VERSION_ARCHIVO, exportado: new Date().toISOString(), proyecto }
}

/**
 * Convierte datos desconocidos (un .json importado o lo guardado) en un
 * Proyecto válido, o null. Es tolerante: acepta números donde se esperan
 * textos y predecesores como lista, para importar archivos hechos a mano.
 */
export function convertirAProyecto(dato: unknown): Proyecto | null {
  if (!esObjeto(dato)) return null
  const fuente = esObjeto(dato.proyecto) ? dato.proyecto : dato
  if (!Array.isArray(fuente.actividades)) return null

  const actividades: Actividad[] = []
  for (const cruda of fuente.actividades) {
    const actividad = convertirActividad(cruda)
    if (!actividad) return null
    actividades.push(actividad)
  }

  return {
    nombre: typeof fuente.nombre === 'string' ? fuente.nombre : 'Proyecto importado',
    modo: (fuente.modo === 'PERT' ? 'PERT' : 'CPM') satisfies Modo,
    unidad: typeof fuente.unidad === 'string' && fuente.unidad.trim() ? fuente.unidad : 'días',
    fechaInicio: typeof fuente.fechaInicio === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fuente.fechaInicio) ? fuente.fechaInicio : null,
    actividades,
  }
}

function convertirActividad(dato: unknown): Actividad | null {
  if (!esObjeto(dato) || typeof dato.nombre !== 'string') return null
  const predecesores = Array.isArray(dato.predecesores) ? dato.predecesores.map(String).join(', ') : comoTexto(dato.predecesores)
  return {
    id: typeof dato.id === 'string' && dato.id ? dato.id : nuevoId(),
    nombre: dato.nombre,
    descripcion: comoTexto(dato.descripcion),
    predecesores,
    duracion: comoTexto(dato.duracion),
    a: comoTexto(dato.a),
    m: comoTexto(dato.m),
    b: comoTexto(dato.b),
  }
}

function comoTexto(valor: unknown): string {
  return typeof valor === 'string' ? valor : typeof valor === 'number' && Number.isFinite(valor) ? String(valor) : ''
}

function esObjeto(valor: unknown): valor is Record<string, unknown> {
  return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
}
