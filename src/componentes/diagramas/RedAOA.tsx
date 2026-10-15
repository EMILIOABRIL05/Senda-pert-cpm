import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { formatear } from '../../core/numeros'
import type { NodoAOA, RedAOA as Red } from '../../core/tipos'
import { acomodar } from './acomodo'
import { AjusteAutomatico } from './AjusteAutomatico'
import { estiloFlecha } from './estilos'

const DIAMETRO = 76

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
      style={{ width: DIAMETRO, height: DIAMETRO }}
      title={`Evento ${evento.id}: TE = ${formatear(evento.te)}, TL = ${formatear(evento.tl)}`}
    >
      <Handle type="target" position={Position.Left} className="!invisible" />
      <span className="flex h-1/2 items-end pb-0.5 font-display text-lg font-semibold leading-none">{evento.id}</span>
      <span className="numeros flex h-1/2 w-full items-start justify-center border-t border-borde text-[11px] leading-none">
        <span className="flex-1 pt-1.5 text-right pr-1.5">{formatear(evento.te)}</span>
        <span className="h-full w-px bg-borde" />
        <span className="flex-1 pt-1.5 text-left pl-1.5 text-texto-3">{formatear(evento.tl)}</span>
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
  const criticos = new Set<number>()
  for (const f of red.flechas) {
    if (f.critica) {
      criticos.add(f.desde)
      criticos.add(f.hasta)
    }
  }

  const posiciones = acomodar(
    red.nodos.map((n) => ({ id: String(n.id), ancho: DIAMETRO, alto: DIAMETRO })),
    red.flechas.map((f) => ({ desde: String(f.desde), hasta: String(f.hasta) })),
    { entreNodos: 60, entreNiveles: 120, entreFlechas: 70 },
  )

  const nodos: NodoEvento[] = red.nodos.map((evento) => ({
    id: String(evento.id),
    type: 'evento',
    position: posiciones.get(String(evento.id)) ?? { x: 0, y: 0 },
    data: { evento, critico: criticos.has(evento.id) },
  }))

  const aristas: Edge[] = red.flechas.map((f, i) => {
    const estilo = estiloFlecha(f.critica, f.ficticia)
    return {
      id: `f${i}`,
      source: String(f.desde),
      target: String(f.hasta),
      type: 'default',
      label: f.ficticia ? 'ficticia' : `${f.actividad} = ${formatear(f.duracion)}`,
      ariaLabel: f.ficticia
        ? `Actividad ficticia del evento ${f.desde} al ${f.hasta}`
        : `Actividad ${f.actividad}, duración ${formatear(f.duracion)}${f.critica ? ', crítica' : ''}`,
      ...estilo,
      markerEnd: { type: MarkerType.ArrowClosed, color: estilo.color, width: 16, height: 16 },
    }
  })

  const firma = red.flechas.map((f) => `${f.desde}-${f.hasta}-${f.actividad}`).join('|')
  return { nodos, aristas, firma }
}
