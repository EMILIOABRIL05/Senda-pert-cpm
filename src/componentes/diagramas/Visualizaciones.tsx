import { useRef, useState, type KeyboardEvent, type ReactNode, type RefObject } from 'react'
import type { ActividadNormalizada, Proyecto, RedAOA as Red, ResultadoCPM } from '../../core/tipos'
import { Tarjeta } from '../ui/Seccion'
import { Gantt } from './Gantt'
import { RedAOA } from './RedAOA'
import { RedAON } from './RedAON'

export type Pestana = 'aoa' | 'aon' | 'gantt'

const PESTANAS: { id: Pestana; titulo: string; detalle: string }[] = [
  { id: 'aoa', titulo: 'Red AOA', detalle: 'Actividades en flechas' },
  { id: 'aon', titulo: 'Red AON', detalle: 'Actividades en nodos' },
  { id: 'gantt', titulo: 'Gantt', detalle: 'Línea de tiempo' },
]

interface Props {
  proyecto: Proyecto
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  aoa: Red
  temaOscuro: boolean
  /** Botones extra de la barra (exportar), según la pestaña visible. */
  acciones?: (pestana: Pestana) => ReactNode
  refGantt?: RefObject<SVGSVGElement | null>
}

export function Visualizaciones({ proyecto, cpm, actividades, aoa, temaOscuro, acciones, refGantt }: Props) {
  const [activa, setActiva] = useState<Pestana>('aoa')
  const botones = useRef<(HTMLButtonElement | null)[]>([])

  // Pestañas accesibles: flechas para moverse entre ellas (patrón WAI-ARIA).
  const alPresionarTecla = (evento: KeyboardEvent, indice: number) => {
    const paso = evento.key === 'ArrowRight' ? 1 : evento.key === 'ArrowLeft' ? -1 : 0
    if (!paso) return
    evento.preventDefault()
    const siguiente = (indice + paso + PESTANAS.length) % PESTANAS.length
    const pestana = PESTANAS[siguiente]
    if (!pestana) return
    setActiva(pestana.id)
    botones.current[siguiente]?.focus()
  }

  return (
    <Tarjeta>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-borde px-3 py-2.5 sm:px-4">
        <div role="tablist" aria-label="Tipo de diagrama" className="flex gap-1">
          {PESTANAS.map((p, i) => (
            <button
              key={p.id}
              ref={(el) => {
                botones.current[i] = el
              }}
              id={`pestana-${p.id}`}
              role="tab"
              type="button"
              aria-selected={activa === p.id}
              aria-controls={`panel-${p.id}`}
              tabIndex={activa === p.id ? 0 : -1}
              onClick={() => setActiva(p.id)}
              onKeyDown={(e) => alPresionarTecla(e, i)}
              className={`rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors ${
                activa === p.id ? 'bg-texto text-fondo' : 'text-texto-3 hover:bg-superficie-3 hover:text-texto'
              }`}
            >
              {p.titulo}
              <span className="sr-only">: {p.detalle}</span>
            </button>
          ))}
        </div>
        {acciones && <div className="flex items-center gap-1">{acciones(activa)}</div>}
      </div>

      <div
        id={`panel-${activa}`}
        role="tabpanel"
        aria-labelledby={`pestana-${activa}`}
        className={activa === 'gantt' ? 'bg-superficie' : 'h-[420px] bg-superficie sm:h-[540px]'}
      >
        {activa === 'aoa' && <RedAOA red={aoa} temaOscuro={temaOscuro} />}
        {activa === 'aon' && <RedAON cpm={cpm} actividades={actividades} temaOscuro={temaOscuro} />}
        {activa === 'gantt' && <Gantt cpm={cpm} actividades={actividades} proyecto={proyecto} refSvg={refGantt} />}
      </div>

      <Leyenda pestana={activa} ficticias={aoa.ficticias} />
    </Tarjeta>
  )
}

function Leyenda({ pestana, ficticias }: { pestana: Pestana; ficticias: number }) {
  const linea = (estilo: string, texto: string) => (
    <span className="inline-flex items-center gap-2">
      <svg width="28" height="8" aria-hidden="true">
        <line x1="0" y1="4" x2="28" y2="4" className={estilo} />
      </svg>
      {texto}
    </span>
  )
  const barra = (clase: string, texto: string, punteada = false) => (
    <span className="inline-flex items-center gap-2">
      <span className={`h-3 w-6 rounded-[3px] ${clase} ${punteada ? 'border border-dashed border-acento/50' : ''}`} aria-hidden="true" />
      {texto}
    </span>
  )

  return (
    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-borde bg-superficie-2 px-5 py-3 text-xs text-texto-3">
      {pestana === 'gantt' ? (
        <>
          {barra('bg-critico', 'Actividad crítica (rayada)')}
          {barra('bg-acento', 'Actividad no crítica')}
          {barra('bg-acento-suave', 'Holgura total', true)}
        </>
      ) : (
        <>
          {linea('stroke-critico [stroke-width:3]', 'Ruta crítica (roja y gruesa)')}
          {linea('stroke-texto-2 [stroke-width:1.5]', 'Actividad')}
          {pestana === 'aoa' && linea('stroke-texto-3 [stroke-width:1.5] [stroke-dasharray:5_4]', `Ficticia (${ficticias})`)}
          <span>
            {pestana === 'aoa'
              ? 'Cada evento muestra su número y, abajo, TE | TL.'
              : 'Cada caja: IC · duración · TC arriba; IL · holgura · TL abajo.'}
          </span>
          <span className="hidden md:inline">Rueda o pellizco para zoom · arrastra para desplazarte.</span>
        </>
      )}
    </div>
  )
}
