import { describe, expect, it } from 'vitest'
import { analizarProyecto } from '../core/analizar'
import { EJEMPLOS, proyectoEnBlanco } from '.'

describe('ejemplos precargados', () => {
  it.each(EJEMPLOS.map((e) => [e.titulo, e] as const))('"%s" es válido y calculable', (_, ejemplo) => {
    expect(analizarProyecto(ejemplo.crear()).ok).toBe(true)
  })

  it('el ejercicio de clase da 12 días y ruta A-B-D', () => {
    const analisis = analizarProyecto((EJEMPLOS[0] as (typeof EJEMPLOS)[number]).crear())
    if (!analisis.ok) throw new Error('inválido')
    expect(analisis.cpm.duracion).toBe(12)
    expect(analisis.cpm.rutas).toEqual([['A', 'B', 'D']])
  })

  it('el proyecto en blanco es válido', () => {
    expect(analizarProyecto(proyectoEnBlanco()).ok).toBe(true)
  })
})
