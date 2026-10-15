/**
 * Validación de los datos de entrada.
 *
 * Regla del proyecto: no se calcula nada mientras haya errores. Cada error
 * indica la fila (índice desde 0) para poder resaltarla en la tabla.
 */
import { aNumero } from './numeros'
import { tiempoEsperado, varianza } from './pert'
import type { Actividad, ActividadNormalizada, ErrorValidacion, Proyecto, ResultadoValidacion } from './tipos'

/** "A, B;C D" → ['A', 'B', 'C', 'D']. Un guion solo significa "sin predecesores". */
export function parsearPredecesores(texto: string): string[] {
  const partes = texto
    .split(/[\s,;]+/)
    .map((p) => p.trim())
    .filter((p) => p !== '' && p !== '-' && p !== '—')
  return [...new Set(partes)]
}

export function validarProyecto(proyecto: Proyecto): ResultadoValidacion {
  const { actividades } = proyecto
  if (actividades.length === 0) {
    return { errores: [{ fila: null, campo: 'general', mensaje: 'Agrega al menos una actividad.' }], actividades: [] }
  }

  const errores = [...validarNombres(actividades), ...validarPredecesores(actividades)]
  const normalizadas: ActividadNormalizada[] = []

  actividades.forEach((actividad, fila) => {
    const tiempos = proyecto.modo === 'CPM' ? validarDuracion(actividad, fila) : validarTiemposPERT(actividad, fila)
    if ('error' in tiempos) {
      errores.push(tiempos.error)
      return
    }
    normalizadas.push({
      nombre: actividad.nombre.trim(),
      descripcion: actividad.descripcion.trim(),
      predecesores: parsearPredecesores(actividad.predecesores),
      ...tiempos.valor,
    })
  })

  // El ciclo solo tiene sentido si nombres y predecesores ya son coherentes.
  if (errores.length === 0) {
    const ciclo = buscarCiclo(normalizadas)
    if (ciclo) errores.push(errorDeCiclo(ciclo, actividades))
  }

  errores.sort((x, y) => (x.fila ?? -1) - (y.fila ?? -1))
  return errores.length > 0 ? { errores, actividades: [] } : { errores, actividades: normalizadas }
}

function validarNombres(actividades: Actividad[]): ErrorValidacion[] {
  const errores: ErrorValidacion[] = []
  const vistos = new Map<string, number>()

  actividades.forEach((actividad, fila) => {
    const nombre = actividad.nombre.trim()
    if (nombre === '') {
      errores.push({ fila, campo: 'nombre', mensaje: `Fila ${fila + 1}: la actividad no tiene nombre.` })
      return
    }
    const anterior = vistos.get(nombre)
    if (anterior !== undefined) {
      errores.push({
        fila,
        campo: 'nombre',
        mensaje: `Fila ${fila + 1}: el nombre "${nombre}" está repetido (ya se usa en la fila ${anterior + 1}).`,
      })
      return
    }
    vistos.set(nombre, fila)
  })
  return errores
}

function validarPredecesores(actividades: Actividad[]): ErrorValidacion[] {
  const nombres = new Set(actividades.map((a) => a.nombre.trim()))
  const errores: ErrorValidacion[] = []

  actividades.forEach((actividad, fila) => {
    const propio = actividad.nombre.trim()
    for (const predecesor of parsearPredecesores(actividad.predecesores)) {
      if (predecesor === propio) {
        errores.push({
          fila,
          campo: 'predecesores',
          mensaje: `Fila ${fila + 1}: "${propio}" no puede ser su propio predecesor.`,
        })
      } else if (!nombres.has(predecesor)) {
        errores.push({
          fila,
          campo: 'predecesores',
          mensaje: `Fila ${fila + 1}: el predecesor "${predecesor}" no existe.`,
        })
      }
    }
  })
  return errores
}

type Tiempos = Pick<ActividadNormalizada, 'duracion' | 'tiempos'>
type ResultadoTiempos = { valor: Tiempos } | { error: ErrorValidacion }

function validarDuracion(actividad: Actividad, fila: number): ResultadoTiempos {
  const duracion = aNumero(actividad.duracion)
  const etiqueta = `Fila ${fila + 1}`
  if (duracion === null) {
    return { error: { fila, campo: 'duracion', mensaje: `${etiqueta}: la duración está vacía o no es un número.` } }
  }
  if (duracion < 0) {
    return { error: { fila, campo: 'duracion', mensaje: `${etiqueta}: la duración no puede ser negativa.` } }
  }
  return { valor: { duracion } }
}

function validarTiemposPERT(actividad: Actividad, fila: number): ResultadoTiempos {
  const etiqueta = `Fila ${fila + 1}`
  const [a, m, b] = [actividad.a, actividad.m, actividad.b].map(aNumero)
  if (a === null || a === undefined || m === null || m === undefined || b === null || b === undefined) {
    return { error: { fila, campo: 'tiempos', mensaje: `${etiqueta}: completa los tres tiempos a, m y b con números.` } }
  }
  if (a < 0) {
    return { error: { fila, campo: 'tiempos', mensaje: `${etiqueta}: los tiempos no pueden ser negativos.` } }
  }
  if (!(a <= m && m <= b)) {
    return {
      error: { fila, campo: 'tiempos', mensaje: `${etiqueta}: debe cumplirse a ≤ m ≤ b (optimista ≤ probable ≤ pesimista).` },
    }
  }
  return { valor: { duracion: tiempoEsperado(a, m, b), tiempos: { a, m, b, varianza: varianza(a, b) } } }
}

/**
 * Busca un ciclo con búsqueda en profundidad. Devuelve la secuencia de
 * nombres en el sentido de la precedencia (ej. ['A', 'B', 'A']) o null.
 */
function buscarCiclo(actividades: ActividadNormalizada[]): string[] | null {
  const sucesores = new Map<string, string[]>(actividades.map((a) => [a.nombre, []]))
  for (const actividad of actividades) {
    for (const p of actividad.predecesores) sucesores.get(p)?.push(actividad.nombre)
  }

  // 0 = sin visitar, 1 = en la pila actual, 2 = terminado.
  const estado = new Map<string, 0 | 1 | 2>()
  const pila: string[] = []

  const visitar = (nombre: string): string[] | null => {
    estado.set(nombre, 1)
    pila.push(nombre)
    for (const siguiente of sucesores.get(nombre) ?? []) {
      const marca = estado.get(siguiente) ?? 0
      if (marca === 1) return [...pila.slice(pila.indexOf(siguiente)), siguiente]
      if (marca === 0) {
        const ciclo = visitar(siguiente)
        if (ciclo) return ciclo
      }
    }
    pila.pop()
    estado.set(nombre, 2)
    return null
  }

  for (const { nombre } of actividades) {
    if ((estado.get(nombre) ?? 0) === 0) {
      const ciclo = visitar(nombre)
      if (ciclo) return ciclo
    }
  }
  return null
}

function errorDeCiclo(ciclo: string[], actividades: Actividad[]): ErrorValidacion {
  const primera = actividades.findIndex((a) => a.nombre.trim() === ciclo[0])
  return {
    fila: primera >= 0 ? primera : null,
    campo: 'predecesores',
    mensaje: `Hay un ciclo en las precedencias: ${ciclo.join(' → ')}. Ninguna de esas actividades podría empezar nunca.`,
  }
}
