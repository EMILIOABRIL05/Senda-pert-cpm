import { describe, expect, it } from 'vitest'
import { calcularCPM } from '../cpm'
import { explicarPasoAdelante, explicarPasoAtras } from '../pasos'
import { validarProyecto } from '../validacion'
import { CASO_1 } from './ayudas'

const { actividades } = validarProyecto(CASO_1)
const cpm = calcularCPM(actividades)

describe('paso a paso — hacia adelante', () => {
  const pasos = explicarPasoAdelante(actividades, cpm)

  it('sigue el orden topológico', () => {
    expect(pasos.map((p) => p.nombre)).toEqual(['A', 'B', 'C', 'D'])
  })

  it('una actividad inicial empieza en 0 sin términos', () => {
    expect(pasos[0]).toMatchObject({ terminos: [], ic: 0, origen: null, tc: 3 })
  })

  it('D toma el máximo entre TC(B)=7 y TC(C)=5', () => {
    expect(pasos[3]).toMatchObject({
      terminos: [
        { nombre: 'B', valor: 7 },
        { nombre: 'C', valor: 5 },
      ],
      ic: 7,
      origen: 'B',
      duracion: 5,
      tc: 12,
    })
  })
})

describe('paso a paso — hacia atrás', () => {
  const pasos = explicarPasoAtras(actividades, cpm)

  it('recorre en orden inverso', () => {
    expect(pasos.map((p) => p.nombre)).toEqual(['D', 'C', 'B', 'A'])
  })

  it('la actividad final toma la duración del proyecto', () => {
    expect(pasos[0]).toMatchObject({ terminos: [], tl: 12, destino: null, il: 7 })
  })

  it('A toma el mínimo entre IL(B)=3 e IL(C)=5', () => {
    expect(pasos[3]).toMatchObject({
      terminos: [
        { nombre: 'B', valor: 3 },
        { nombre: 'C', valor: 5 },
      ],
      tl: 3,
      destino: 'B',
      il: 0,
    })
  })
})
