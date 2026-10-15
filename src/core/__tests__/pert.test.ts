import { describe, expect, it } from 'vitest'
import { calcularCPM } from '../cpm'
import { phi, phiInversa } from '../normal'
import {
  calcularPERT,
  plazoParaConfianza,
  probabilidadPlazo,
  tiempoEsperado,
  varianza,
} from '../pert'
import { redondear } from '../numeros'
import type { Proyecto } from '../tipos'
import { validarProyecto } from '../validacion'
import { proyectoPERT } from './ayudas'

function pertDe(proyecto: Proyecto) {
  const { errores, actividades } = validarProyecto(proyecto)
  expect(errores).toEqual([])
  return calcularPERT(actividades, calcularCPM(actividades))
}

describe('Distribución normal estándar', () => {
  it.each([
    [0, 0.5],
    [1.96, 0.975],
    [-1, 0.1587],
    [1, 0.8413],
    [-2.33, 0.0099],
    [3, 0.9987],
  ])('Φ(%d) ≈ %d con 4 decimales', (z, esperado) => {
    expect(redondear(phi(z), 4)).toBe(esperado)
  })

  it('es simétrica: Φ(−z) = 1 − Φ(z)', () => {
    for (const z of [0.3, 1.1, 2.7]) expect(phi(-z)).toBeCloseTo(1 - phi(z), 12)
  })

  it('la inversa recupera z', () => {
    expect(phiInversa(0.975)).toBeCloseTo(1.96, 3)
    expect(phiInversa(0.5)).toBeCloseTo(0, 9)
    for (const z of [-2.5, -0.4, 0.8, 2.2]) expect(phiInversa(phi(z))).toBeCloseTo(z, 8)
  })

  it('la inversa rechaza probabilidades fuera de (0, 1)', () => {
    expect(() => phiInversa(0)).toThrow()
    expect(() => phiInversa(1)).toThrow()
  })
})

describe('PERT — fórmulas por actividad', () => {
  it('a=2, m=3, b=4 → te = 3 y σ² = 0.1111', () => {
    expect(tiempoEsperado(2, 3, 4)).toBe(3)
    expect(redondear(varianza(2, 4), 4)).toBe(0.1111)
  })

  it('te pondera más el tiempo más probable', () => {
    expect(tiempoEsperado(1, 4, 13)).toBe(5)
    expect(varianza(1, 13)).toBe(4)
  })
})

describe('PERT — proyecto', () => {
  // Rutas: A-C (te 5 + 5 = 10) y B-D (te 4 + 6 = 10) → dos rutas críticas.
  const proyecto = proyectoPERT([
    ['A', '', 1, 4, 13], // te 5, σ² 4
    ['B', '', 3, 4, 5], // te 4, σ² 0.1111
    ['C', 'A', 4, 5, 6], // te 5, σ² 0.1111
    ['D', 'B', 5, 6, 7], // te 6, σ² 0.1111
  ])
  const resultado = pertDe(proyecto)

  it('la media es la duración del CPM con te', () => {
    expect(resultado.media).toBeCloseTo(10, 9)
  })

  it('con varias rutas críticas usa la de mayor varianza y lo indica', () => {
    expect(resultado.variasRutas).toBe(true)
    expect(resultado.rutaVarianza).toEqual(['A', 'C'])
    expect(resultado.varianza).toBeCloseTo(4 + 1 / 9, 9)
    expect(resultado.desviacion).toBeCloseTo(Math.sqrt(4 + 1 / 9), 9)
  })

  it('P(T ≤ Te) = 0.5000 para cualquier proyecto', () => {
    const { z, p } = probabilidadPlazo(resultado.media, resultado)
    expect(redondear(z, 4)).toBe(0)
    expect(redondear(p, 4)).toBe(0.5)
  })

  it('Z = (T − Te) / σ', () => {
    const { z } = probabilidadPlazo(12, resultado)
    expect(z).toBeCloseTo(2 / Math.sqrt(4 + 1 / 9), 9)
  })

  it('el cálculo inverso devuelve el plazo para una confianza', () => {
    const { t, z } = plazoParaConfianza(0.975, resultado)
    expect(z).toBeCloseTo(1.96, 3)
    expect(t).toBeCloseTo(10 + z * resultado.desviacion, 9)
  })

  it('con varianza 0 la probabilidad es 0 o 1 sin dividir entre cero', () => {
    const fijo = pertDe(proyectoPERT([['A', '', 3, 3, 3]]))
    expect(probabilidadPlazo(3, fijo).p).toBe(1)
    expect(probabilidadPlazo(2.9, fijo).p).toBe(0)
    expect(plazoParaConfianza(0.9, fijo).t).toBe(3)
  })
})
