/**
 * Acomodo automático de izquierda a derecha con dagre. Devuelve la esquina
 * superior izquierda de cada nodo, que es lo que espera React Flow.
 */
import { Graph, layout } from '@dagrejs/dagre'

export interface CajaNodo {
  id: string
  ancho: number
  alto: number
}

export interface Enlace {
  desde: string
  hasta: string
}

export function acomodar(
  nodos: CajaNodo[],
  enlaces: Enlace[],
  separacion = { entreNodos: 40, entreNiveles: 90, entreFlechas: 20 },
): Map<string, { x: number; y: number }> {
  const grafo = new Graph({ multigraph: true })
  grafo.setGraph({ rankdir: 'LR', nodesep: separacion.entreNodos, ranksep: separacion.entreNiveles, edgesep: separacion.entreFlechas, marginx: 20, marginy: 20 })
  grafo.setDefaultEdgeLabel(() => ({}))

  for (const n of nodos) grafo.setNode(n.id, { width: n.ancho, height: n.alto })
  enlaces.forEach((e, i) => grafo.setEdge(e.desde, e.hasta, {}, `e${i}`))

  layout(grafo)

  return new Map(
    nodos.map((n) => {
      const { x, y } = grafo.node(n.id) as { x: number; y: number }
      return [n.id, { x: x - n.ancho / 2, y: y - n.alto / 2 }]
    }),
  )
}
