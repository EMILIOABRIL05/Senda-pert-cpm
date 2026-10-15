/**
 * Red AOA (actividades en las flechas) con actividades ficticias.
 *
 * Estrategia: la corrección manda sobre el mínimo de ficticias.
 *  1. Se arma una red "generosa" que es correcta por construcción: cada
 *     actividad termina en su propio evento, y cada conjunto distinto de
 *     predecesores tiene un evento donde todos ellos confluyen mediante
 *     ficticias.
 *  2. Se simplifica con dos reglas que NUNCA cambian la precedencia:
 *     - borrar una ficticia redundante (ya existe otro camino entre sus extremos);
 *     - fusionar los dos eventos de una ficticia u→v cuando v solo se alcanza
 *       por esa ficticia, o cuando u solo sale por ella. En ambos casos
 *       "llegar a u" equivale a "llegar a v", así que nada cambia.
 *     Una fusión se descarta si dejaría dos actividades con el mismo par de
 *     eventos (inicio, fin): justamente ahí la ficticia es obligatoria.
 *  3. Se numeran los eventos en orden topológico y se calculan TE y TL.
 */
import { reduccionTransitiva } from './grafo'
import { iguales } from './numeros'
import type { ActividadNormalizada, FlechaAOA, NodoAOA, RedAOA, ResultadoCPM } from './tipos'

interface Arista {
  desde: number
  hasta: number
  /** null = ficticia. */
  actividad: string | null
  duracion: number
}

export function construirRedAOA(actividades: ActividadNormalizada[], cpm: ResultadoCPM): RedAOA {
  const { aristas, inicio } = armarRedInicial(actividades)
  simplificar(aristas)
  return numerarYCalcularTiempos(aristas, inicio, cpm)
}

/** Paso 1: red correcta por construcción, con muchas ficticias. */
function armarRedInicial(actividades: ActividadNormalizada[]) {
  let siguienteId = 0
  const nuevoEvento = () => siguienteId++
  const inicio = nuevoEvento()
  const fin = nuevoEvento()

  const directos = reduccionTransitiva(actividades)
  const eventoFinal = new Map(actividades.map((a) => [a.nombre, nuevoEvento()]))
  const tieneSucesor = new Set([...directos.values()].flat())
  const eventoPorConjunto = new Map<string, number>()
  const aristas: Arista[] = []

  for (const actividad of actividades) {
    const predecesores = [...(directos.get(actividad.nombre) ?? [])].sort()
    const clave = predecesores.join('|')
    let origen = clave === '' ? inicio : eventoPorConjunto.get(clave)
    if (origen === undefined) {
      origen = nuevoEvento()
      eventoPorConjunto.set(clave, origen)
      for (const p of predecesores) aristas.push(ficticia(eventoFinal.get(p) as number, origen))
    }
    aristas.push({
      desde: origen,
      hasta: eventoFinal.get(actividad.nombre) as number,
      actividad: actividad.nombre,
      duracion: actividad.duracion,
    })
  }

  for (const actividad of actividades) {
    if (!tieneSucesor.has(actividad.nombre)) aristas.push(ficticia(eventoFinal.get(actividad.nombre) as number, fin))
  }
  return { aristas, inicio }
}

function ficticia(desde: number, hasta: number): Arista {
  return { desde, hasta, actividad: null, duracion: 0 }
}

/** Paso 2: aplica las reglas seguras hasta que ya no haya cambios. */
function simplificar(aristas: Arista[]): void {
  let huboCambio = true
  while (huboCambio) {
    quitarFicticiasDuplicadas(aristas)
    huboCambio = quitarUnaFicticiaRedundante(aristas) || fusionarUnaFicticia(aristas)
  }
}

function quitarFicticiasDuplicadas(aristas: Arista[]): void {
  const vistas = new Set<string>()
  for (let i = aristas.length - 1; i >= 0; i--) {
    const a = aristas[i] as Arista
    if (a.actividad !== null) continue
    const clave = `${a.desde}-${a.hasta}`
    if (vistas.has(clave)) aristas.splice(i, 1)
    else vistas.add(clave)
  }
}

function quitarUnaFicticiaRedundante(aristas: Arista[]): boolean {
  for (const arista of aristas) {
    if (arista.actividad !== null) continue
    const resto = aristas.filter((a) => a !== arista)
    if (alcanzables(resto, arista.desde).has(arista.hasta)) {
      aristas.splice(aristas.indexOf(arista), 1)
      return true
    }
  }
  return false
}

function fusionarUnaFicticia(aristas: Arista[]): boolean {
  for (const arista of aristas) {
    if (arista.actividad !== null) continue
    const { desde: u, hasta: v } = arista
    const unicaEntradaDeV = aristas.filter((a) => a.hasta === v).length === 1
    const unicaSalidaDeU = aristas.filter((a) => a.desde === u).length === 1
    if (!unicaEntradaDeV && !unicaSalidaDeU) continue

    const fusionadas = aristas.filter((a) => a !== arista).map((a) => renombrar(a, v, u))
    if (hayActividadesParalelas(fusionadas)) continue

    aristas.splice(0, aristas.length, ...fusionadas)
    return true
  }
  return false
}

function renombrar(arista: Arista, de: number, a: number): Arista {
  return {
    ...arista,
    desde: arista.desde === de ? a : arista.desde,
    hasta: arista.hasta === de ? a : arista.hasta,
  }
}

function hayActividadesParalelas(aristas: Arista[]): boolean {
  const pares = new Set<string>()
  for (const a of aristas) {
    if (a.actividad === null) continue
    const clave = `${a.desde}-${a.hasta}`
    if (pares.has(clave)) return true
    pares.add(clave)
  }
  return false
}

/** Eventos alcanzables desde `origen` (sin incluirlo, salvo que haya un ciclo). */
function alcanzables(aristas: Arista[], origen: number): Set<number> {
  const visitados = new Set<number>()
  const pendientes = [origen]
  while (pendientes.length > 0) {
    const actual = pendientes.pop() as number
    for (const a of aristas) {
      if (a.desde === actual && !visitados.has(a.hasta)) {
        visitados.add(a.hasta)
        pendientes.push(a.hasta)
      }
    }
  }
  return visitados
}

/**
 * Paso 3: numera los eventos (1 = inicio) en orden topológico, de modo que
 * toda flecha vaya de un número menor a uno mayor. Ante empates se numera
 * primero el evento que ocurre antes (menor TE), como se hace a mano.
 */
function numerarYCalcularTiempos(aristas: Arista[], inicio: number, cpm: ResultadoCPM): RedAOA {
  const te = tiemposProximos(aristas, inicio)
  const orden = ordenarEventos(aristas, inicio, te)
  const numero = new Map(orden.map((evento, i) => [evento, i + 1]))
  const tl = tiemposLejanos(aristas, orden, cpm.duracion)
  const criticas = new Set(cpm.filas.filter((f) => f.critica).map((f) => f.nombre))

  const nodos: NodoAOA[] = orden.map((evento) => ({
    id: numero.get(evento) as number,
    te: te.get(evento) as number,
    tl: tl.get(evento) as number,
  }))

  const flechas: FlechaAOA[] = aristas
    .map((a) => {
      const esFicticia = a.actividad === null
      return {
        desde: numero.get(a.desde) as number,
        hasta: numero.get(a.hasta) as number,
        actividad: a.actividad,
        duracion: a.duracion,
        critica: esFicticia ? ficticiaCritica(a, te, tl) : criticas.has(a.actividad as string),
        ficticia: esFicticia,
      }
    })
    .sort((x, y) => x.desde - y.desde || x.hasta - y.hasta)

  return { nodos, flechas, ficticias: flechas.filter((f) => f.ficticia).length }
}

/** Una ficticia es crítica si une dos eventos sin holgura y no tiene holgura propia. */
function ficticiaCritica(a: Arista, te: Map<number, number>, tl: Map<number, number>): boolean {
  const teDesde = te.get(a.desde) as number
  const tlDesde = tl.get(a.desde) as number
  const teHasta = te.get(a.hasta) as number
  const tlHasta = tl.get(a.hasta) as number
  return iguales(teDesde, tlDesde) && iguales(teHasta, tlHasta) && iguales(teDesde, tlHasta)
}

function ordenarEventos(aristas: Arista[], inicio: number, te: Map<number, number>): number[] {
  const entradas = new Map<number, number>()
  for (const a of aristas) entradas.set(a.hasta, (entradas.get(a.hasta) ?? 0) + 1)

  const orden: number[] = []
  const listos = [inicio]
  while (listos.length > 0) {
    listos.sort((x, y) => (te.get(x) as number) - (te.get(y) as number) || x - y)
    const actual = listos.shift() as number
    orden.push(actual)
    for (const a of aristas) {
      if (a.desde !== actual) continue
      const restantes = (entradas.get(a.hasta) ?? 0) - 1
      entradas.set(a.hasta, restantes)
      if (restantes === 0) listos.push(a.hasta)
    }
  }
  return orden
}

/** TE de cada evento: el mayor tiempo con el que llega alguna flecha. */
function tiemposProximos(aristas: Arista[], inicio: number): Map<number, number> {
  const te = new Map<number, number>([[inicio, 0]])
  const entradas = new Map<number, number>()
  for (const a of aristas) entradas.set(a.hasta, (entradas.get(a.hasta) ?? 0) + 1)

  const listos = [inicio]
  while (listos.length > 0) {
    const actual = listos.pop() as number
    for (const a of aristas) {
      if (a.desde !== actual) continue
      te.set(a.hasta, Math.max(te.get(a.hasta) ?? 0, (te.get(actual) as number) + a.duracion))
      const restantes = (entradas.get(a.hasta) ?? 0) - 1
      entradas.set(a.hasta, restantes)
      if (restantes === 0) listos.push(a.hasta)
    }
  }
  return te
}

/** TL de cada evento: el menor tiempo en que debe salir alguna flecha. */
function tiemposLejanos(aristas: Arista[], orden: number[], duracion: number): Map<number, number> {
  const tl = new Map<number, number>()
  for (const evento of [...orden].reverse()) {
    const salidas = aristas.filter((a) => a.desde === evento)
    tl.set(
      evento,
      salidas.length === 0 ? duracion : Math.min(...salidas.map((a) => (tl.get(a.hasta) as number) - a.duracion)),
    )
  }
  return tl
}

/**
 * Lee la precedencia que expresa la red: X precede a Y si desde el evento
 * final de X se puede llegar al evento inicial de Y. Sirve para verificar
 * que la red dice exactamente lo mismo que la tabla ingresada.
 */
export function precedenciasDeAOA(red: RedAOA): Map<string, Set<string>> {
  const aristas: Arista[] = red.flechas.map((f) => ({ ...f }))
  const reales = red.flechas.filter((f) => f.actividad !== null)
  const resultado = new Map<string, Set<string>>()

  for (const y of reales) {
    const predecesores = new Set<string>()
    for (const x of reales) {
      if (x === y) continue
      if (x.hasta === y.desde || alcanzables(aristas, x.hasta).has(y.desde)) predecesores.add(x.actividad as string)
    }
    resultado.set(y.actividad as string, predecesores)
  }
  return resultado
}
