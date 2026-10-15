import { describe, expect, it } from 'vitest'
import { calcularCPM } from '../cpm'
import type { Proyecto } from '../tipos'
import { validarProyecto } from '../validacion'
import { CASO_1, CASO_2, CASO_3, proyectoCPM } from './ayudas'

function cpmDe(proyecto: Proyecto) {
  const { errores, actividades } = validarProyecto(proyecto)
  expect(errores).toEqual([])
  return calcularCPM(actividades)
}

function fila(proyecto: Proyecto, nombre: string) {
  const encontrada = cpmDe(proyecto).filas.find((f) => f.nombre === nombre)
  if (!encontrada) throw new Error(`No existe la fila ${nombre}`)
  return encontrada
}

describe('CPM — caso 1 (ejercicio de clase)', () => {
  const resultado = cpmDe(CASO_1)

  it('la duración del proyecto es 12', () => {
    expect(resultado.duracion).toBe(12)
  })

  it('la ruta crítica es A-B-D', () => {
    expect(resultado.rutas).toEqual([['A', 'B', 'D']])
  })

  it.each([
    ['A', 0, 3, 0, 3, 0],
    ['B', 3, 7, 3, 7, 0],
    ['C', 3, 5, 5, 7, 2],
    ['D', 7, 12, 7, 12, 0],
  ])('%s: IC %d, TC %d, IL %d, TL %d, holgura %d', (nombre, ic, tc, il, tl, holgura) => {
    expect(fila(CASO_1, nombre)).toMatchObject({ ic, tc, il, tl, holguraTotal: holgura })
  })

  it('marca como críticas solo A, B y D', () => {
    expect(resultado.filas.filter((f) => f.critica).map((f) => f.nombre)).toEqual(['A', 'B', 'D'])
  })

  it('conserva el orden de ingreso de las filas', () => {
    expect(resultado.filas.map((f) => f.nombre)).toEqual(['A', 'B', 'C', 'D'])
  })
})

describe('CPM — caso 2 (dos rutas críticas)', () => {
  const resultado = cpmDe(CASO_2)

  it('la duración del proyecto es 9', () => {
    expect(resultado.duracion).toBe(9)
  })

  it('encuentra las dos rutas críticas', () => {
    expect(resultado.rutas).toEqual([
      ['A', 'C', 'E'],
      ['B', 'D', 'E'],
    ])
  })

  it('todas las holguras son 0', () => {
    expect(resultado.filas.every((f) => f.holguraTotal === 0 && f.critica)).toBe(true)
  })
})

describe('CPM — caso 3 (traslape parcial)', () => {
  const resultado = cpmDe(CASO_3)

  it('dura 6 con ruta crítica A-C', () => {
    expect(resultado.duracion).toBe(6)
    expect(resultado.rutas).toEqual([['A', 'C']])
  })

  it('B y D tienen holgura 1', () => {
    expect(fila(CASO_3, 'B').holguraTotal).toBe(1)
    expect(fila(CASO_3, 'D').holguraTotal).toBe(1)
  })
})

describe('CPM — holgura libre', () => {
  it('es mín(IC de sucesores) − TC, o duración − TC al final', () => {
    // C (TC 5) precede a D (IC 7): holgura libre 2. D termina en 12 = duración: 0.
    expect(fila(CASO_1, 'C').holguraLibre).toBe(2)
    expect(fila(CASO_1, 'D').holguraLibre).toBe(0)
  })

  it('puede ser menor que la holgura total', () => {
    const proyecto = proyectoCPM([
      ['A', '', 5],
      ['B', '', 1],
      ['C', 'B', 1],
      ['D', 'A, C', 1],
    ])
    // B: holgura total 3, pero su sucesor C empieza justo al terminar B.
    expect(fila(proyecto, 'B')).toMatchObject({ holguraTotal: 3, holguraLibre: 0 })
    expect(fila(proyecto, 'C')).toMatchObject({ holguraTotal: 3, holguraLibre: 3 })
  })
})

describe('CPM — paso a paso', () => {
  it('registra qué predecesor dio el IC y qué sucesor dio el TL', () => {
    expect(fila(CASO_1, 'D').origenIC).toBe('B')
    expect(fila(CASO_1, 'A').origenIC).toBeNull()
    expect(fila(CASO_1, 'A').destinoTL).toBe('B')
    expect(fila(CASO_1, 'D').destinoTL).toBeNull()
  })
})

describe('CPM — casos borde', () => {
  it('admite hitos de duración 0 dentro de la ruta crítica', () => {
    const proyecto = proyectoCPM([
      ['A', '', 2],
      ['H', 'A', 0],
      ['B', 'H', 3],
    ])
    const resultado = cpmDe(proyecto)
    expect(resultado.duracion).toBe(5)
    expect(resultado.rutas).toEqual([['A', 'H', 'B']])
  })

  it('compara holguras con tolerancia en duraciones decimales', () => {
    const proyecto = proyectoCPM([
      ['A', '', 0.1],
      ['B', 'A', 0.2],
      ['C', '', 0.3],
      ['D', 'B, C', 1],
    ])
    const resultado = cpmDe(proyecto)
    // 0.1 + 0.2 ≠ 0.3 en punto flotante, pero ambas ramas son críticas.
    expect(resultado.rutas).toEqual([
      ['A', 'B', 'D'],
      ['C', 'D'],
    ])
  })

  it('una sola actividad es su propia ruta crítica', () => {
    const resultado = cpmDe(proyectoCPM([['A', '', 4]]))
    expect(resultado).toMatchObject({ duracion: 4, rutas: [['A']] })
  })
})
