import { useRef } from 'react'
import type { ActividadNormalizada, Proyecto, RedAOA, ResultadoCPM } from '../../core/tipos'
import { BotonesExportar } from './BotonesExportar'
import { Visualizaciones } from './Visualizaciones'

interface Props {
  proyecto: Proyecto
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  aoa: RedAOA
  temaOscuro: boolean
  onError: (mensaje: string) => void
}

/**
 * Diagramas con sus botones de exportación. Vive en su propio módulo para
 * cargarse aparte (React Flow y dagre no se descargan hasta que hacen falta).
 */
export default function PanelDiagramas({ proyecto, cpm, actividades, aoa, temaOscuro, onError }: Props) {
  const refGantt = useRef<SVGSVGElement>(null)
  return (
    <Visualizaciones
      proyecto={proyecto}
      cpm={cpm}
      actividades={actividades}
      aoa={aoa}
      temaOscuro={temaOscuro}
      refGantt={refGantt}
      acciones={(pestana) => (
        <BotonesExportar
          pestana={pestana}
          nombreProyecto={proyecto.nombre}
          aoa={aoa}
          cpm={cpm}
          actividades={actividades}
          refGantt={refGantt}
          onError={onError}
        />
      )}
    />
  )
}
