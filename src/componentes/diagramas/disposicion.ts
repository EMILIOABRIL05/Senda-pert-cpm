/**
 * Posición de cada elemento de las redes AOA y AON. La usan tanto la vista
 * interactiva (React Flow) como la exportación a imagen, para que ambas
 * muestren exactamente el mismo diagrama.
 */
import { iguales } from '../../core/numeros'
import type { ActividadNormalizada, FilaCPM, FlechaAOA, NodoAOA, RedAOA, ResultadoCPM } from '../../core/tipos'
import { acomodar } from './acomodo'

export const DIAMETRO_EVENTO = 76
export const ANCHO_CAJA = 156
export const ALTO_CAJA = 96
export const DIAMETRO_EXTREMO = 52
/** Ids internos de los nodos Inicio y Fin; con "__" no chocan con nombres de actividades. */
export const ID_INICIO = '__inicio'
export const ID_FIN = '__fin'

interface Punto {
  x: number
  y: number
}

export interface EventoUbicado extends Punto {
  evento: NodoAOA
  critico: boolean
}

export interface DisposicionAOA {
  eventos: EventoUbicado[]
  flechas: FlechaAOA[]
  firma: string
}

export function disponerAOA(red: RedAOA): DisposicionAOA {
  const criticos = new Set(red.flechas.filter((f) => f.critica).flatMap((f) => [f.desde, f.hasta]))
  const posiciones = acomodar(
    red.nodos.map((n) => ({ id: String(n.id), ancho: DIAMETRO_EVENTO, alto: DIAMETRO_EVENTO })),
    red.flechas.map((f) => ({ desde: String(f.desde), hasta: String(f.hasta) })),
    { entreNodos: 60, entreNiveles: 120, entreFlechas: 70 },
  )
  return {
    eventos: red.nodos.map((evento) => ({
      evento,
      critico: criticos.has(evento.id),
      ...(posiciones.get(String(evento.id)) ?? { x: 0, y: 0 }),
    })),
    flechas: red.flechas,
    firma: red.flechas.map((f) => `${f.desde}-${f.hasta}-${f.actividad}`).join('|'),
  }
}

export type CajaUbicada = Punto &
  ({ tipo: 'actividad'; id: string; fila: FilaCPM; descripcion: string } | { tipo: 'extremo'; id: string; etiqueta: string })

export interface EnlaceAON {
  desde: string
  hasta: string
  critica: boolean
}

export interface DisposicionAON {
  cajas: CajaUbicada[]
  enlaces: EnlaceAON[]
  firma: string
}

export function disponerAON(cpm: ResultadoCPM, actividades: ActividadNormalizada[]): DisposicionAON {
  const fila = new Map(cpm.filas.map((f) => [f.nombre, f]))
  const conSucesor = new Set(actividades.flatMap((a) => a.predecesores))
  const enlaces: EnlaceAON[] = []

  for (const a of actividades) {
    const actual = fila.get(a.nombre) as FilaCPM
    if (a.predecesores.length === 0) enlaces.push({ desde: ID_INICIO, hasta: a.nombre, critica: actual.critica && actual.ic === 0 })
    for (const p of a.predecesores) {
      const previa = fila.get(p) as FilaCPM
      // La flecha es crítica solo si une dos críticas sin tiempo muerto entre ellas.
      enlaces.push({ desde: p, hasta: a.nombre, critica: previa.critica && actual.critica && iguales(previa.tc, actual.ic) })
    }
    if (!conSucesor.has(a.nombre)) {
      enlaces.push({ desde: a.nombre, hasta: ID_FIN, critica: actual.critica && iguales(actual.tc, cpm.duracion) })
    }
  }

  const posiciones = acomodar(
    [
      { id: ID_INICIO, ancho: DIAMETRO_EXTREMO, alto: DIAMETRO_EXTREMO },
      ...actividades.map((a) => ({ id: a.nombre, ancho: ANCHO_CAJA, alto: ALTO_CAJA })),
      { id: ID_FIN, ancho: DIAMETRO_EXTREMO, alto: DIAMETRO_EXTREMO },
    ],
    enlaces,
    { entreNodos: 30, entreNiveles: 70, entreFlechas: 20 },
  )
  const en = (id: string) => posiciones.get(id) ?? { x: 0, y: 0 }

  const cajas: CajaUbicada[] = [
    { tipo: 'extremo', id: ID_INICIO, etiqueta: 'Inicio', ...en(ID_INICIO) },
    ...actividades.map(
      (a): CajaUbicada => ({ tipo: 'actividad', id: a.nombre, fila: fila.get(a.nombre) as FilaCPM, descripcion: a.descripcion, ...en(a.nombre) }),
    ),
    { tipo: 'extremo', id: ID_FIN, etiqueta: 'Fin', ...en(ID_FIN) },
  ]

  return { cajas, enlaces, firma: enlaces.map((e) => `${e.desde}>${e.hasta}`).join('|') }
}
