import { useState, type RefObject } from 'react'
import type { ActividadNormalizada, RedAOA, ResultadoCPM } from '../../core/tipos'
import { exportarDiagrama, type Formato } from '../../exportar/imagen'
import { paletaActual, svgRedAOA, svgRedAON } from '../../exportar/svgRedes'
import { IconoDocumento, IconoImagen } from '../iconos'
import { Boton } from '../ui/Boton'
import type { Pestana } from './Visualizaciones'

const NOMBRES: Record<Pestana, string> = { aoa: 'Red AOA', aon: 'Red AON', gantt: 'Diagrama de Gantt' }

interface Props {
  pestana: Pestana
  nombreProyecto: string
  aoa: RedAOA
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  refGantt: RefObject<SVGSVGElement | null>
  onError: (mensaje: string) => void
}

/** Exporta la vista activa (completa, no solo lo visible) como imagen PNG o como PDF. */
export function BotonesExportar({ pestana, nombreProyecto, aoa, cpm, actividades, refGantt, onError }: Props) {
  const [ocupado, setOcupado] = useState(false)

  const svgDeLaVista = (): SVGSVGElement | null => {
    if (pestana === 'gantt') return refGantt.current
    return pestana === 'aoa' ? svgRedAOA(aoa, paletaActual()) : svgRedAON(cpm, actividades, paletaActual())
  }

  const exportar = async (formato: Formato) => {
    const svg = svgDeLaVista()
    if (!svg) return
    setOcupado(true)
    try {
      await exportarDiagrama(svg, formato, nombreProyecto, NOMBRES[pestana])
    } catch {
      onError('No se pudo exportar el diagrama.')
    } finally {
      setOcupado(false)
    }
  }

  return (
    <>
      <Boton variante="fantasma" tamano="sm" icono={<IconoImagen tamano={16} />} disabled={ocupado} onClick={() => void exportar('png')}>
        PNG
      </Boton>
      <Boton variante="fantasma" tamano="sm" icono={<IconoDocumento tamano={16} />} disabled={ocupado} onClick={() => void exportar('pdf')}>
        PDF
      </Boton>
    </>
  )
}
