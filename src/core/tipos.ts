/**
 * Tipos del dominio PERT-CPM.
 *
 * Se separan los datos "tal como los escribe el usuario" (Actividad, con
 * textos) de los datos "listos para calcular" (ActividadNormalizada, con
 * números). Así la tabla de entrada puede contener errores temporales sin
 * romper los cálculos.
 */

export type Modo = 'CPM' | 'PERT'

/** Fila de la tabla de entrada, exactamente como la escribe el usuario. */
export interface Actividad {
  id: string
  nombre: string
  descripcion: string
  /** Nombres separados por coma, punto y coma o espacio. Ej.: "A, B". */
  predecesores: string
  /** Duración determinística (modo CPM). */
  duracion: string
  /** Tiempo optimista (modo PERT). */
  a: string
  /** Tiempo más probable (modo PERT). */
  m: string
  /** Tiempo pesimista (modo PERT). */
  b: string
}

export interface Proyecto {
  nombre: string
  modo: Modo
  /** Unidad de tiempo, en plural: "días", "semanas"... */
  unidad: string
  /** Fecha ISO (AAAA-MM-DD) del inicio real, o null para mostrar solo números. */
  fechaInicio: string | null
  actividades: Actividad[]
}

/** Actividad validada y convertida a números. */
export interface ActividadNormalizada {
  nombre: string
  descripcion: string
  predecesores: string[]
  /** En PERT es el tiempo esperado te. */
  duracion: number
  /** Solo en PERT. */
  tiempos?: TiemposPERT
}

export interface TiemposPERT {
  a: number
  m: number
  b: number
  varianza: number
}

export type CampoConError = 'nombre' | 'predecesores' | 'duracion' | 'tiempos' | 'general'

export interface ErrorValidacion {
  /** Índice (desde 0) de la fila con el error, o null si es un error global. */
  fila: number | null
  campo: CampoConError
  mensaje: string
}

export interface ResultadoValidacion {
  errores: ErrorValidacion[]
  actividades: ActividadNormalizada[]
}

/** Una fila de la tabla de tiempos del CPM. */
export interface FilaCPM {
  nombre: string
  duracion: number
  /** Inicio más cercano (temprano). */
  ic: number
  /** Terminación más cercana (temprana). */
  tc: number
  /** Inicio más lejano (tardío). */
  il: number
  /** Terminación más lejana (tardía). */
  tl: number
  holguraTotal: number
  holguraLibre: number
  critica: boolean
  /** Predecesor que dio el máximo en el paso hacia adelante (paso a paso). */
  origenIC: string | null
  /** Sucesor que dio el mínimo en el paso hacia atrás (paso a paso). */
  destinoTL: string | null
}

export interface ResultadoCPM {
  /** En el mismo orden en que se ingresaron las actividades. */
  filas: FilaCPM[]
  duracion: number
  /** Cada ruta es la lista ordenada de nombres, ej. ['A', 'B', 'D']. */
  rutas: string[][]
}

export interface ResultadoPERT {
  /** Duración esperada del proyecto (Te). */
  media: number
  varianza: number
  desviacion: number
  /** Ruta crítica cuya varianza se usó. */
  rutaVarianza: string[]
  /** true si hubo varias rutas críticas y se eligió la de mayor varianza. */
  variasRutas: boolean
}

/** Evento (nodo) de la red de flechas. */
export interface NodoAOA {
  /** Número del evento: 1 es el inicio; el origen de una flecha siempre es menor que su destino. */
  id: number
  /** Tiempo más próximo del evento. */
  te: number
  /** Tiempo más lejano del evento. */
  tl: number
}

/** Flecha de la red AOA: una actividad real o una ficticia. */
export interface FlechaAOA {
  desde: number
  hasta: number
  /** Nombre de la actividad, o null si es ficticia. */
  actividad: string | null
  duracion: number
  critica: boolean
  ficticia: boolean
}

export interface RedAOA {
  nodos: NodoAOA[]
  flechas: FlechaAOA[]
  ficticias: number
}

/** Todo lo que la interfaz necesita mostrar tras analizar un proyecto. */
export type Analisis =
  | { ok: false; errores: ErrorValidacion[] }
  | {
      ok: true
      actividades: ActividadNormalizada[]
      cpm: ResultadoCPM
      pert: ResultadoPERT | null
      aoa: RedAOA
    }
