import { describe, expect, it } from 'vitest'
import { analizarProyecto } from '../analizar'
import { CASO_1, proyectoCPM, proyectoPERT } from './ayudas'

describe('analizarProyecto', () => {
  it('no calcula nada mientras haya errores', () => {
    const analisis = analizarProyecto(proyectoCPM([['A', 'Z', 1]]))
    expect(analisis.ok).toBe(false)
    expect('cpm' in analisis).toBe(false)
  })

  it('en CPM devuelve tabla y red, sin PERT', () => {
    const analisis = analizarProyecto(CASO_1)
    if (!analisis.ok) throw new Error('debía ser válido')
    expect(analisis.cpm.duracion).toBe(12)
    expect(analisis.aoa.ficticias).toBe(1)
    expect(analisis.pert).toBeNull()
  })

  it('en PERT agrega la parte probabilística', () => {
    const analisis = analizarProyecto(proyectoPERT([['A', '', 2, 3, 4]]))
    if (!analisis.ok) throw new Error('debía ser válido')
    expect(analisis.pert?.media).toBe(3)
  })
})
