import { Background, Controls, Handle, MarkerType, Position, ReactFlow, type Edge, type Node, type NodeProps } from '@xyflow/react'
import { useMemo } from 'react'
import { formatear, iguales } from '../../core/numeros'
import type { ActividadNormalizada, FilaCPM, ResultadoCPM } from '../../core/tipos'
import { acomodar } from './acomodo'
import { AjusteAutomatico } from './AjusteAutomatico'
import { estiloFlecha } from './estilos'

const ANCHO = 156
const ALTO = 96
const EXTREMO = 52

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
  const fila = new Map(cpm.filas.map((f) => [f.nombre, f]))
  const conSucesor = new Set(actividades.flatMap((a) => a.predecesores))
  const enlaces: { desde: string; hasta: string; critica: boolean }[] = []

  for (const a of actividades) {
    const actual = fila.get(a.nombre) as FilaCPM
    if (a.predecesores.length === 0) enlaces.push({ desde: 'inicio', hasta: a.nombre, critica: actual.critica && actual.ic === 0 })
    for (const p of a.predecesores) {
      const previa = fila.get(p) as FilaCPM
      // La flecha es crítica solo si une dos críticas sin tiempo muerto entre ellas.
      const critica = previa.critica && actual.critica && iguales(previa.tc, actual.ic)
      enlaces.push({ desde: p, hasta: a.nombre, critica })
    }
    if (!conSucesor.has(a.nombre)) {
      enlaces.push({ desde: a.nombre, hasta: 'fin', critica: actual.critica && iguales(actual.tc, cpm.duracion) })
    }
  }

  const posiciones = acomodar(
    [
      { id: 'inicio', ancho: EXTREMO, alto: EXTREMO },
      ...actividades.map((a) => ({ id: a.nombre, ancho: ANCHO, alto: ALTO })),
      { id: 'fin', ancho: EXTREMO, alto: EXTREMO },
    ],
    enlaces,
    { entreNodos: 30, entreNiveles: 70, entreFlechas: 20 },
  )
  const posicion = (id: string) => posiciones.get(id) ?? { x: 0, y: 0 }

  const nodos: (NodoActividad | NodoExtremo)[] = [
    { id: 'inicio', type: 'extremo', position: posicion('inicio'), data: { etiqueta: 'Inicio' } },
    ...actividades.map(
      (a): NodoActividad => ({
        id: a.nombre,
        type: 'actividad',
        position: posicion(a.nombre),
        data: { fila: fila.get(a.nombre) as FilaCPM, descripcion: a.descripcion },
      }),
    ),
    { id: 'fin', type: 'extremo', position: posicion('fin'), data: { etiqueta: 'Fin' } },
  ]

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

  const firma = enlaces.map((e) => `${e.desde}>${e.hasta}`).join('|')
  return { nodos, aristas, firma }
}
