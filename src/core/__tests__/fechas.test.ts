import { describe, expect, it } from 'vitest'
import { admiteFechas, fechaEn } from '../fechas'

describe('fechas', () => {
  it('suma días corridos desde la fecha de inicio', () => {
    const fecha = fechaEn('2026-10-15', 12, 'días')
    expect(fecha?.getFullYear()).toBe(2026)
    expect(fecha?.getMonth()).toBe(9)
    expect(fecha?.getDate()).toBe(27)
  })

  it('convierte semanas a días', () => {
    expect(fechaEn('2026-01-01', 2, 'semanas')?.getDate()).toBe(15)
  })

  it('no inventa fechas sin inicio o con unidades como horas', () => {
    expect(fechaEn(null, 3, 'días')).toBeNull()
    expect(fechaEn('2026-01-01', 3, 'horas')).toBeNull()
    expect(admiteFechas('horas')).toBe(false)
  })
})
