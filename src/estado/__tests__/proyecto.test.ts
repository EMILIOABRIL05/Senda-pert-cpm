import { describe, expect, it } from 'vitest'
import { proyectoCPM, proyectoPERT } from '../../core/__tests__/ayudas'
import { reductorProyecto, siguienteNombre } from '../proyecto'

describe('reductorProyecto', () => {
  it('agrega con el siguiente nombre libre', () => {
    const proyecto = reductorProyecto(proyectoCPM([['A', '', 1], ['C', '', 1]]), { tipo: 'agregar' })
    expect(proyecto.actividades.map((a) => a.nombre)).toEqual(['A', 'C', 'B'])
  })

  it('agrega justo después de una fila', () => {
    const base = proyectoCPM([['A', '', 1], ['B', '', 1]])
    const proyecto = reductorProyecto(base, { tipo: 'agregar', despuesDe: 'A' })
    expect(proyecto.actividades.map((a) => a.nombre)).toEqual(['A', 'C', 'B'])
  })

  it('mueve filas y no sale de los límites', () => {
    const base = proyectoCPM([['A', '', 1], ['B', '', 1]])
    expect(reductorProyecto(base, { tipo: 'mover', id: 'B', direccion: -1 }).actividades[0]?.nombre).toBe('B')
    expect(reductorProyecto(base, { tipo: 'mover', id: 'A', direccion: -1 })).toBe(base)
  })

  it('CPM → PERT copia la duración en a, m y b', () => {
    const proyecto = reductorProyecto(proyectoCPM([['A', '', 4]]), { tipo: 'cambiarModo', modo: 'PERT' })
    expect(proyecto.actividades[0]).toMatchObject({ a: '4', m: '4', b: '4' })
  })

  it('PERT → CPM usa te como duración', () => {
    const base = proyectoPERT([['A', '', 1, 4, 13]])
    const proyecto = reductorProyecto(base, { tipo: 'cambiarModo', modo: 'CPM' })
    expect(proyecto.actividades[0]?.duracion).toBe('5')
  })
})

describe('siguienteNombre', () => {
  it('continúa con AA después de Z', () => {
    const todas = proyectoCPM(Array.from({ length: 26 }, (_, i) => [String.fromCharCode(65 + i), '', 1]))
    expect(siguienteNombre(todas.actividades)).toBe('AA')
  })
})
