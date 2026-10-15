import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { formatear } from '../../core/numeros'
import type { ActividadNormalizada, FilaCPM, ResultadoCPM } from '../../core/tipos'
import { AjusteAutomatico } from './AjusteAutomatico'
import { ALTO_CAJA as ALTO, ANCHO_CAJA as ANCHO, DIAMETRO_EXTREMO as EXTREMO, disponerAON } from './disposicion'
import { estiloFlecha } from './estilos'

type NodoActividad = Node<{ fila: FilaCPM; descripcion: string }, 'actividad'>
type NodoExtremo = Node<{ etiqueta: string }, 'extremo'>

/**
 * Caja de actividad con la disposición de los libros de texto:
 *   IC | duración | TC
 *        NOMBRE
 *   IL | holgura  | TL
 */
function CajaActividad({ data }: NodeProps<NodoActividad>) {
  const { fila, descripcion } = data
  const celda = 'numeros flex items-center justify-center text-xs'
  return (
    <div
      className={`grid h-full grid-cols-3 grid-rows-[1fr_1.4fr_1fr] overflow-hidden rounded-xl bg-superficie text-texto shadow-suave ${
        fila.critica ? 'border-[2.5px] border-critico' : 'border-[1.5px] border-borde-fuerte'
      }`}
      style={{ width: ANCHO, height: ALTO }}
      title={descripcion || undefined}
    >
      <Handle type="target" position={Position.Left} className="!invisible" />
      <span className={`${celda} border-b border-r border-borde`} title="IC">{formatear(fila.ic)}</span>
      <span className={`${celda} border-b border-r border-borde text-texto-3`} title="Duración">{formatear(fila.duracion)}</span>
      <span className={`${celda} border-b border-borde`} title="TC">{formatear(fila.tc)}</span>
      <span className={`col-span-3 flex items-center justify-center gap-1.5 font-display text-base font-semibold ${fila.critica ? 'text-critico' : ''}`}>
        {fila.nombre}
        {fila.critica && <span className="rounded bg-critico-suave px-1 text-[9px] font-bold uppercase tracking-wider">crítica</span>}
      </span>
      <span className={`${celda} border-t border-r border-borde`} title="IL">{formatear(fila.il)}</span>
      <span className={`${celda} border-t border-r border-borde ${fila.critica ? 'text-critico font-semibold' : 'text-texto-3'}`} title="Holgura total">
        H {formatear(fila.holguraTotal)}
      </span>
      <span className={`${celda} border-t border-borde`} title="TL">{formatear(fila.tl)}</span>
      <Handle type="source" position={Position.Right} className="!invisible" />
    </div>
  )
}

function Extremo({ data }: NodeProps<NodoExtremo>) {
  return (
    <div
      className="flex items-center justify-center rounded-full border-[1.5px] border-borde-fuerte bg-superficie-3 text-[11px] font-semibold uppercase tracking-wider text-texto-3"
      style={{ width: EXTREMO, height: EXTREMO }}
    >
      <Handle type="target" position={Position.Left} className="!invisible" />
      {data.etiqueta}
      <Handle type="source" position={Position.Right} className="!invisible" />
    </div>
  )
}

const TIPOS_NODO = { actividad: CajaActividad, extremo: Extremo }

interface Props {
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  temaOscuro: boolean
}

export function RedAON({ cpm, actividades, temaOscuro }: Props) {
  const { nodos, aristas, firma } = useMemo(() => construirElementos(cpm, actividades), [cpm, actividades])
  return (
    <ReactFlow
      key={firma}
      nodes={nodos}
      edges={aristas}
      nodeTypes={TIPOS_NODO}
      colorMode={temaOscuro ? 'dark' : 'light'}
      fitView
      fitViewOptions={{ padding: 0.12, maxZoom: 1.3 }}
      minZoom={0.2}
      maxZoom={2.5}
      nodesConnectable={false}
      elementsSelectable={false}
      aria-label="Red de actividades en nodos"
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
      <AjusteAutomatico relleno={0.12} />
    </ReactFlow>
  )
}

function construirElementos(cpm: ResultadoCPM, actividades: ActividadNormalizada[]) {
  const { cajas, enlaces, firma } = disponerAON(cpm, actividades)

  const nodos: (NodoActividad | NodoExtremo)[] = cajas.map((caja) =>
    caja.tipo === 'actividad'
      ? { id: caja.id, type: 'actividad', position: { x: caja.x, y: caja.y }, data: { fila: caja.fila, descripcion: caja.descripcion } }
      : { id: caja.id, type: 'extremo', position: { x: caja.x, y: caja.y }, data: { etiqueta: caja.etiqueta } },
  )

  const aristas: Edge[] = enlaces.map((e, i) => {
    const estilo = estiloFlecha(e.critica)
    return {
      id: `a${i}`,
      source: e.desde,
      target: e.hasta,
      type: 'default',
      style: estilo.style,
      markerEnd: { type: MarkerType.ArrowClosed, color: estilo.color, width: 16, height: 16 },
    }
  })

  return { nodos, aristas, firma }
}
