import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { formatear } from '../../core/numeros'
import type { NodoAOA, RedAOA as Red } from '../../core/tipos'
import { AjusteAutomatico } from './AjusteAutomatico'
import { DIAMETRO_EVENTO, disponerAOA } from './disposicion'
import { estiloFlecha } from './estilos'

type NodoEvento = Node<{ evento: NodoAOA; critico: boolean }, 'evento'>

/**
 * Evento con la notación de clase: número arriba y, abajo,
 * el tiempo más próximo (TE) y el más lejano (TL).
 */
function Evento({ data }: NodeProps<NodoEvento>) {
  const { evento, critico } = data
  return (
    <div
      className={`relative flex flex-col items-center overflow-hidden rounded-full bg-superficie text-texto ${
        critico ? 'border-[2.5px] border-critico' : 'border-[1.5px] border-borde-fuerte'
      }`}
      style={{ width: DIAMETRO_EVENTO, height: DIAMETRO_EVENTO }}
      title={`Evento ${evento.id}: TE = ${formatear(evento.te)}, TL = ${formatear(evento.tl)}`}
    >
      <Handle type="target" position={Position.Left} className="!invisible" />
      <span className="flex h-1/2 items-end pb-0.5 font-display text-lg font-semibold leading-none">{evento.id}</span>
      <span className="numeros flex h-1/2 w-full items-start justify-center border-t border-borde text-[11px] leading-none">
        <span className="flex-1 pr-1.5 pt-1.5 text-right">{formatear(evento.te)}</span>
        <span className="h-full w-px bg-borde" />
        <span className="flex-1 pl-1.5 pt-1.5 text-left text-texto-3">{formatear(evento.tl)}</span>
      </span>
      <Handle type="source" position={Position.Right} className="!invisible" />
    </div>
  )
}

const TIPOS_NODO = { evento: Evento }

export function RedAOA({ red, temaOscuro }: { red: Red; temaOscuro: boolean }) {
  const { nodos, aristas, firma } = useMemo(() => construirElementos(red), [red])

  return (
    <ReactFlow
      key={firma}
      nodes={nodos}
      edges={aristas}
      nodeTypes={TIPOS_NODO}
      colorMode={temaOscuro ? 'dark' : 'light'}
      fitView
      fitViewOptions={{ padding: 0.15, maxZoom: 1.3 }}
      minZoom={0.2}
      maxZoom={2.5}
      nodesConnectable={false}
      elementsSelectable={false}
      aria-label="Red de actividades en flechas"
    >
      <Background gap={20} size={1} />
      <Controls showInteractive={false} />
      <AjusteAutomatico relleno={0.15} />
    </ReactFlow>
  )
}

function construirElementos(red: Red) {
  const { eventos, flechas, firma } = disponerAOA(red)

  const nodos: NodoEvento[] = eventos.map(({ evento, critico, x, y }) => ({
    id: String(evento.id),
    type: 'evento',
    position: { x, y },
    data: { evento, critico },
  }))

  const aristas: Edge[] = flechas.map((f, i) => {
    const estilo = estiloFlecha(f.critica, f.ficticia)
    return {
      id: `f${i}`,
      source: String(f.desde),
      target: String(f.hasta),
      type: 'default',
      label: etiquetaFlecha(f),
      ariaLabel: f.ficticia
        ? `Actividad ficticia del evento ${f.desde} al ${f.hasta}`
        : `Actividad ${f.actividad}, duración ${formatear(f.duracion)}${f.critica ? ', crítica' : ''}`,
      ...estilo,
      markerEnd: { type: MarkerType.ArrowClosed, color: estilo.color, width: 16, height: 16 },
    }
  })

  return { nodos, aristas, firma }
}

export function etiquetaFlecha(f: { ficticia: boolean; actividad: string | null; duracion: number }): string {
  return f.ficticia ? 'ficticia' : `${f.actividad} = ${formatear(f.duracion)}`
}
