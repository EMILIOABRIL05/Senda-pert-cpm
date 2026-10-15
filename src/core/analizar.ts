/**
 * Punto de entrada único del núcleo: valida y, solo si no hay errores,
 * calcula CPM, PERT (si corresponde) y la red AOA.
 */
import { construirRedAOA } from './aoa'
import { calcularCPM } from './cpm'
import { calcularPERT } from './pert'
import type { Analisis, Proyecto } from './tipos'
import { validarProyecto } from './validacion'

export function analizarProyecto(proyecto: Proyecto): Analisis {
  const { errores, actividades } = validarProyecto(proyecto)
  if (errores.length > 0) return { ok: false, errores }

  const cpm = calcularCPM(actividades)
  return {
    ok: true,
    actividades,
    cpm,
    pert: proyecto.modo === 'PERT' ? calcularPERT(actividades, cpm) : null,
    aoa: construirRedAOA(actividades, cpm),
  }
}
