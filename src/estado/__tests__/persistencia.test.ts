import { describe, expect, it } from 'vitest'
import { CASO_1 } from '../../core/__tests__/ayudas'
import { convertirAProyecto, guardarProyecto, leerProyectoGuardado, paraArchivo } from '../persistencia'

type Almacen = Pick<Storage, 'getItem' | 'setItem'>

function almacenEnMemoria(): Almacen & { datos: Map<string, string> } {
  const datos = new Map<string, string>()
  return {
    datos,
    getItem: (clave) => datos.get(clave) ?? null,
    setItem: (clave, valor) => void datos.set(clave, valor),
  }
}

const almacenRoto: Almacen = {
  getItem: () => {
    throw new Error('bloqueado')
  },
  setItem: () => {
    throw new Error('lleno')
  },
}

describe('guardado automático', () => {
  it('guarda y recupera el mismo proyecto', () => {
    const almacen = almacenEnMemoria()
    expect(guardarProyecto(CASO_1, almacen)).toBe(true)
    expect(leerProyectoGuardado(almacen)).toEqual(CASO_1)
  })

  it('sin nada guardado devuelve null', () => {
    expect(leerProyectoGuardado(almacenEnMemoria())).toBeNull()
  })

  it('ignora datos corruptos sin lanzar errores', () => {
    const almacen = almacenEnMemoria()
    almacen.datos.set('senda:proyecto', '{esto no es json')
    expect(leerProyectoGuardado(almacen)).toBeNull()
    almacen.datos.set('senda:proyecto', JSON.stringify({ hola: 1 }))
    expect(leerProyectoGuardado(almacen)).toBeNull()
  })

  it('si el almacenamiento falla, la app sigue funcionando', () => {
    expect(leerProyectoGuardado(almacenRoto)).toBeNull()
    expect(guardarProyecto(CASO_1, almacenRoto)).toBe(false)
  })
})

describe('convertirAProyecto (importar .json)', () => {
  it('acepta el formato exportado por la app', () => {
    const archivo = JSON.parse(JSON.stringify(paraArchivo(CASO_1)))
    expect(convertirAProyecto(archivo)).toEqual(CASO_1)
  })

  it('acepta un proyecto sin envoltorio y completa lo que falta', () => {
    const proyecto = convertirAProyecto({
      actividades: [{ nombre: 'A', duracion: 3 }, { nombre: 'B', predecesores: 'A', duracion: '2' }],
    })
    expect(proyecto?.modo).toBe('CPM')
    expect(proyecto?.unidad).toBe('días')
    expect(proyecto?.actividades[0]).toMatchObject({ nombre: 'A', duracion: '3', predecesores: '' })
    expect(proyecto?.actividades[1]?.id).toBeTruthy()
  })

  it('acepta predecesores como lista', () => {
    const proyecto = convertirAProyecto({ actividades: [{ nombre: 'C', predecesores: ['A', 'B'] }] })
    expect(proyecto?.actividades[0]?.predecesores).toBe('A, B')
  })

  it('rechaza archivos que no son proyectos', () => {
    expect(convertirAProyecto(null)).toBeNull()
    expect(convertirAProyecto([1, 2])).toBeNull()
    expect(convertirAProyecto({ actividades: 'A' })).toBeNull()
    expect(convertirAProyecto({ actividades: [{ duracion: 3 }] })).toBeNull()
  })
})
