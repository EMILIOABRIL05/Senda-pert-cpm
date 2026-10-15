import { describe, expect, it } from 'vitest'
import { construirRedAOA, precedenciasDeAOA } from '../aoa'
import { calcularCPM } from '../cpm'
import { cierreTransitivo } from '../grafo'
import type { Proyecto, RedAOA } from '../tipos'
import { validarProyecto } from '../validacion'
import { CASO_1, CASO_2, CASO_3, proyectoCPM } from './ayudas'

function redDe(proyecto: Proyecto) {
  const { errores, actividades } = validarProyecto(proyecto)
  expect(errores).toEqual([])
  const cpm = calcularCPM(actividades)
  return { red: construirRedAOA(actividades, cpm), actividades, cpm }
}

/** Compara la precedencia (alcanzabilidad) de la red con la ingresada: ni de más ni de menos. */
function expectPrecedenciasEquivalentes(proyecto: Proyecto) {
  const { red, actividades } = redDe(proyecto)
  const esperadas = cierreTransitivo(actividades)
  const obtenidas = precedenciasDeAOA(red)
  for (const { nombre } of actividades) {
    expect([...(obtenidas.get(nombre) ?? [])].sort(), `predecesores de ${nombre}`).toEqual(
      [...(esperadas.get(nombre) ?? [])].sort(),
    )
  }
}

/** Reglas de forma que debe cumplir cualquier red AOA bien construida. */
function expectRedBienFormada(red: RedAOA, nombres: string[], duracion: number) {
  const ids = red.nodos.map((n) => n.id)
  expect(ids).toEqual(ids.map((_, i) => i + 1))

  const conEntrada = new Set(red.flechas.map((f) => f.hasta))
  const conSalida = new Set(red.flechas.map((f) => f.desde))
  expect(ids.filter((id) => !conEntrada.has(id)), 'un único nodo inicial').toEqual([1])
  expect(ids.filter((id) => !conSalida.has(id)), 'un único nodo final').toEqual([ids.length])

  for (const f of red.flechas) expect(f.desde).toBeLessThan(f.hasta)

  const reales = red.flechas.filter((f) => !f.ficticia)
  expect(reales.map((f) => f.actividad).sort()).toEqual([...nombres].sort())
  expect(red.flechas.filter((f) => f.ficticia)).toHaveLength(red.ficticias)

  const pares = reales.map((f) => `${f.desde}-${f.hasta}`)
  expect(new Set(pares).size, 'sin flechas paralelas').toBe(pares.length)

  const inicio = red.nodos[0]
  const fin = red.nodos[red.nodos.length - 1]
  expect(inicio).toMatchObject({ te: 0, tl: 0 })
  expect(fin?.te).toBeCloseTo(duracion, 9)
  expect(fin?.tl).toBeCloseTo(duracion, 9)
}

describe('Red AOA — casos de clase', () => {
  it('caso 1: exactamente una ficticia', () => {
    const { red, actividades, cpm } = redDe(CASO_1)
    expect(red.ficticias).toBe(1)
    expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
    expectPrecedenciasEquivalentes(CASO_1)
  })

  it('caso 1: tiempos de los eventos', () => {
    const { red } = redDe(CASO_1)
    // Eventos: 1 (inicio), 2 (fin de A), 3 (fin de C), 4 (B y C listos), 5 (fin).
    expect(red.nodos.map((n) => [n.te, n.tl])).toEqual([
      [0, 0],
      [3, 3],
      [5, 7],
      [7, 7],
      [12, 12],
    ])
  })

  it('caso 1: la ficticia sale de C y las críticas son A, B y D', () => {
    const { red } = redDe(CASO_1)
    const criticas = red.flechas.filter((f) => f.critica && !f.ficticia).map((f) => f.actividad)
    expect(criticas.sort()).toEqual(['A', 'B', 'D'])
    expect(red.flechas.find((f) => f.ficticia)?.critica).toBe(false)
  })

  it('caso 2: no necesita ficticias', () => {
    const { red, actividades, cpm } = redDe(CASO_2)
    expect(red.ficticias).toBe(0)
    expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
    expectPrecedenciasEquivalentes(CASO_2)
  })

  it('caso 3: traslape parcial con al menos una ficticia', () => {
    const { red, actividades, cpm } = redDe(CASO_3)
    expect(red.ficticias).toBeGreaterThanOrEqual(1)
    expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
    expectPrecedenciasEquivalentes(CASO_3)
  })
})

describe('Red AOA — casos borde', () => {
  it('una precedencia redundante no agrega ficticias', () => {
    const proyecto = proyectoCPM([
      ['A', '', 1],
      ['B', 'A', 1],
      ['C', 'A, B', 1],
    ])
    expect(redDe(proyecto).red.ficticias).toBe(0)
    expectPrecedenciasEquivalentes(proyecto)
  })

  it('dos actividades paralelas de inicio a fin necesitan una ficticia', () => {
    const proyecto = proyectoCPM([
      ['A', '', 2],
      ['B', '', 3],
    ])
    const { red, actividades, cpm } = redDe(proyecto)
    expect(red.ficticias).toBe(1)
    expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
  })

  it('una sola actividad: dos eventos y una flecha', () => {
    const { red } = redDe(proyectoCPM([['A', '', 5]]))
    expect(red.nodos).toHaveLength(2)
    expect(red.flechas).toEqual([{ desde: 1, hasta: 2, actividad: 'A', duracion: 5, critica: true, ficticia: false }])
  })

  it('proyecto de 10 actividades con varios traslapes', () => {
    const proyecto = proyectoCPM([
      ['A', '', 4],
      ['B', '', 6],
      ['C', 'A', 3],
      ['D', 'A', 5],
      ['E', 'A, B', 2],
      ['F', 'C', 4],
      ['G', 'C, D', 3],
      ['H', 'D, E', 6],
      ['I', 'F, G', 2],
      ['J', 'G, H', 5],
    ])
    const { red, actividades, cpm } = redDe(proyecto)
    expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
    expectPrecedenciasEquivalentes(proyecto)
  })
})

describe('Red AOA — propiedad sobre proyectos aleatorios', () => {
  /** Generador pseudoaleatorio con semilla (mulberry32) para que la prueba sea reproducible. */
  function aleatorio(semilla: number) {
    let estado = semilla
    return () => {
      estado = (estado + 0x6d2b79f5) | 0
      let t = Math.imul(estado ^ (estado >>> 15), 1 | estado)
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
  }

  function proyectoAleatorio(semilla: number): Proyecto {
    const azar = aleatorio(semilla)
    const cantidad = 2 + Math.floor(azar() * 11)
    const nombres = Array.from({ length: cantidad }, (_, i) => String.fromCharCode(65 + i))
    return proyectoCPM(
      nombres.map((nombre, i) => {
        // Solo predecesores con índice menor: así nunca hay ciclos.
        const predecesores = nombres.slice(0, i).filter(() => azar() < 0.3)
        return [nombre, predecesores.join(', '), Math.floor(azar() * 9)]
      }),
    )
  }

  it('300 proyectos: red bien formada y precedencias idénticas a las ingresadas', () => {
    for (let semilla = 1; semilla <= 300; semilla++) {
      const proyecto = proyectoAleatorio(semilla)
      const { red, actividades, cpm } = redDe(proyecto)
      expectRedBienFormada(red, actividades.map((a) => a.nombre), cpm.duracion)
      expectPrecedenciasEquivalentes(proyecto)
    }
  })
})
