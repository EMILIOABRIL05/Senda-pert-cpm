import { useMemo, useReducer } from 'react'
import { analizarProyecto } from '../core/analizar'
import { EJEMPLOS } from '../ejemplos'
import { reductorProyecto } from './proyecto'
import type { Proyecto } from '../core/tipos'

function proyectoInicial(): Proyecto {
  return (EJEMPLOS[0] as (typeof EJEMPLOS)[number]).crear()
}

/** Estado del proyecto y su análisis, recalculado en cada cambio. */
export function useProyecto() {
  const [proyecto, despachar] = useReducer(reductorProyecto, undefined, proyectoInicial)
  const analisis = useMemo(() => analizarProyecto(proyecto), [proyecto])
  return { proyecto, despachar, analisis }
}
