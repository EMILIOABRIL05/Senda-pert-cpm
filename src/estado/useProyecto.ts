import { useEffect, useMemo, useReducer } from 'react'
import { analizarProyecto } from '../core/analizar'
import type { Proyecto } from '../core/tipos'
import { EJEMPLOS } from '../ejemplos'
import { guardarProyecto, leerProyectoGuardado } from './persistencia'
import { reductorProyecto } from './proyecto'

/** Al abrir la app se recupera el último proyecto; la primera vez, el ejercicio de clase. */
function proyectoInicial(): Proyecto {
  return leerProyectoGuardado() ?? (EJEMPLOS[0] as (typeof EJEMPLOS)[number]).crear()
}

/** Estado del proyecto y su análisis, recalculado en cada cambio y guardado solo. */
export function useProyecto() {
  const [proyecto, despachar] = useReducer(reductorProyecto, undefined, proyectoInicial)
  const analisis = useMemo(() => analizarProyecto(proyecto), [proyecto])

  // Se espera un momento tras la última tecla para no escribir en cada pulsación.
  useEffect(() => {
    const temporizador = window.setTimeout(() => guardarProyecto(proyecto), 300)
    return () => window.clearTimeout(temporizador)
  }, [proyecto])

  return { proyecto, despachar, analisis }
}
