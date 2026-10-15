import { describe, expect, it } from 'vitest'
import { parsearPredecesores, validarProyecto } from '../validacion'
import { CASO_1, proyectoCPM, proyectoPERT } from './ayudas'

describe('parsearPredecesores', () => {
  it('acepta coma, punto y coma y espacios como separadores', () => {
    expect(parsearPredecesores('A, B;C  D')).toEqual(['A', 'B', 'C', 'D'])
  })

  it('trata vacío y guiones como "sin predecesores"', () => {
    expect(parsearPredecesores('')).toEqual([])
    expect(parsearPredecesores(' - ')).toEqual([])
    expect(parsearPredecesores('—')).toEqual([])
  })

  it('elimina repetidos', () => {
    expect(parsearPredecesores('A, A')).toEqual(['A'])
  })
})

describe('validarProyecto', () => {
  it('no reporta errores en un proyecto correcto', () => {
    const { errores, actividades } = validarProyecto(CASO_1)
    expect(errores).toEqual([])
    expect(actividades.map((a) => a.nombre)).toEqual(['A', 'B', 'C', 'D'])
    expect(actividades[3]?.predecesores).toEqual(['B', 'C'])
  })

  it('normaliza espacios en nombres y predecesores', () => {
    const { errores, actividades } = validarProyecto(
      proyectoCPM([
        [' A ', '', 1],
        ['B', ' A ', 2],
      ]),
    )
    expect(errores).toEqual([])
    expect(actividades[1]?.predecesores).toEqual(['A'])
  })

  it('distingue mayúsculas: "a" no es "A"', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['A', '', 1],
        ['B', 'a', 2],
      ]),
    )
    expect(errores).toHaveLength(1)
    expect(errores[0]).toMatchObject({ fila: 1, campo: 'predecesores' })
  })

  it('detecta un ciclo y nombra las actividades que lo forman', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['A', 'B', 1],
        ['B', 'A', 1],
      ]),
    )
    const ciclo = errores.find((e) => e.mensaje.includes('ciclo'))
    expect(ciclo).toBeDefined()
    expect(ciclo?.mensaje).toContain('A')
    expect(ciclo?.mensaje).toContain('B')
  })

  it('detecta un ciclo largo A → B → C → A', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['A', 'C', 1],
        ['B', 'A', 1],
        ['C', 'B', 1],
        ['D', '', 1],
      ]),
    )
    const ciclo = errores.find((e) => e.mensaje.includes('ciclo'))
    expect(ciclo?.mensaje).toMatch(/A.*B.*C|B.*C.*A|C.*A.*B/)
    expect(ciclo?.mensaje).not.toContain('D')
  })

  it('señala la fila con un predecesor inexistente', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['A', '', 1],
        ['B', 'A', 1],
        ['C', 'Z', 1],
      ]),
    )
    expect(errores).toHaveLength(1)
    expect(errores[0]).toMatchObject({ fila: 2, campo: 'predecesores' })
    expect(errores[0]?.mensaje).toContain('Z')
  })

  it('rechaza duración negativa', () => {
    const { errores } = validarProyecto(proyectoCPM([['A', '', -1]]))
    expect(errores).toHaveLength(1)
    expect(errores[0]).toMatchObject({ fila: 0, campo: 'duracion' })
  })

  it('rechaza duración vacía o no numérica', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['A', '', ''],
        ['B', '', 'tres'],
      ]),
    )
    expect(errores.map((e) => e.fila)).toEqual([0, 1])
  })

  it('acepta duración 0 (hito) y coma decimal', () => {
    const { errores, actividades } = validarProyecto(
      proyectoCPM([
        ['A', '', 0],
        ['B', 'A', '2,5'],
      ]),
    )
    expect(errores).toEqual([])
    expect(actividades[1]?.duracion).toBe(2.5)
  })

  it('rechaza nombres vacíos y repetidos', () => {
    const { errores } = validarProyecto(
      proyectoCPM([
        ['', '', 1],
        ['A', '', 1],
        ['A', '', 1],
      ]),
    )
    expect(errores.find((e) => e.fila === 0)?.campo).toBe('nombre')
    expect(errores.find((e) => e.fila === 2)?.mensaje).toContain('repetido')
  })

  it('rechaza que una actividad sea su propio predecesor', () => {
    const { errores } = validarProyecto(proyectoCPM([['A', 'A', 1]]))
    expect(errores).toHaveLength(1)
    expect(errores[0]?.mensaje).toContain('propio predecesor')
  })

  it('exige al menos una actividad', () => {
    const { errores } = validarProyecto(proyectoCPM([]))
    expect(errores[0]).toMatchObject({ fila: null, campo: 'general' })
  })

  it('en PERT exige a ≤ m ≤ b', () => {
    const { errores } = validarProyecto(
      proyectoPERT([
        ['A', '', 2, 3, 4],
        ['B', '', 5, 3, 4],
      ]),
    )
    expect(errores).toHaveLength(1)
    expect(errores[0]).toMatchObject({ fila: 1, campo: 'tiempos' })
  })

  it('en PERT usa te como duración y calcula la varianza', () => {
    const { actividades } = validarProyecto(proyectoPERT([['A', '', 2, 3, 4]]))
    expect(actividades[0]?.duracion).toBe(3)
    expect(actividades[0]?.tiempos?.varianza).toBeCloseTo(1 / 9, 10)
  })
})
