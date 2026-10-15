import type { ReactNode } from 'react'
import { formatear } from '../core/numeros'
import { explicarPasoAdelante, explicarPasoAtras, type Termino } from '../core/pasos'
import type { ActividadNormalizada, ResultadoCPM } from '../core/tipos'
import { Tarjeta } from './ui/Seccion'

interface Props {
  actividades: ActividadNormalizada[]
  cpm: ResultadoCPM
}

/**
 * Modo didáctico: muestra cada cálculo como se haría en el cuaderno,
 * resaltando el predecesor que dio el máximo y el sucesor que dio el mínimo.
 */
export function PasoAPaso({ actividades, cpm }: Props) {
  const adelante = explicarPasoAdelante(actividades, cpm)
  const atras = explicarPasoAtras(actividades, cpm)

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel numero={1} titulo="Paso hacia adelante" formula="IC = máx(TC de los predecesores) · TC = IC + duración">
        {adelante.map((p) => (
          <Linea key={p.nombre} nombre={p.nombre}>
            <span>
              IC ={' '}
              {p.terminos.length === 0 ? (
                <span className="text-texto-3">0 (no tiene predecesores)</span>
              ) : (
                <>
                  máx<Terminos terminos={p.terminos} elegido={p.origen} prefijo="TC" /> = <b>{formatear(p.ic)}</b>
                </>
              )}
            </span>
            <span className="text-texto-2">
              TC = {formatear(p.ic)} + {formatear(p.duracion)} = <b className="text-texto">{formatear(p.tc)}</b>
            </span>
          </Linea>
        ))}
        <p className="mt-3 text-sm text-texto-2">
          Duración del proyecto = máx(TC) = <b className="text-texto">{formatear(cpm.duracion)}</b>
        </p>
      </Panel>

      <Panel numero={2} titulo="Paso hacia atrás" formula="TL = mín(IL de los sucesores) · IL = TL − duración">
        {atras.map((p) => (
          <Linea key={p.nombre} nombre={p.nombre}>
            <span>
              TL ={' '}
              {p.terminos.length === 0 ? (
                <span className="text-texto-3">duración del proyecto = {formatear(p.tl)}</span>
              ) : (
                <>
                  mín<Terminos terminos={p.terminos} elegido={p.destino} prefijo="IL" /> = <b>{formatear(p.tl)}</b>
                </>
              )}
            </span>
            <span className="text-texto-2">
              IL = {formatear(p.tl)} − {formatear(p.duracion)} = <b className="text-texto">{formatear(p.il)}</b>
            </span>
          </Linea>
        ))}
      </Panel>

      <Panel numero={3} titulo="Holguras" formula="HT = IL − IC · HL = mín(IC de los sucesores) − TC" ancho>
        <div className="grid gap-x-8 sm:grid-cols-2">
          {cpm.filas.map((f) => (
            <Linea key={f.nombre} nombre={f.nombre} critica={f.critica}>
              <span>
                HT = {formatear(f.il)} − {formatear(f.ic)} = <b className={f.critica ? 'text-critico' : ''}>{formatear(f.holguraTotal)}</b>
                {f.critica && <span className="ml-1.5 text-xs font-semibold text-critico">→ crítica</span>}
              </span>
              <span className="text-texto-2">
                HL = {formatear(f.tc + f.holguraLibre)} − {formatear(f.tc)} = <b className="text-texto">{formatear(f.holguraLibre)}</b>
              </span>
            </Linea>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Panel({ numero, titulo, formula, ancho = false, children }: { numero: number; titulo: string; formula: string; ancho?: boolean; children: ReactNode }) {
  return (
    <Tarjeta className={ancho ? 'lg:col-span-2' : ''}>
      <div className="border-b border-borde px-5 py-4">
        <h3 className="flex items-center gap-2.5 font-semibold">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-acento text-xs text-sobre-acento">{numero}</span>
          {titulo}
        </h3>
        <p className="mt-1 font-mono text-xs text-texto-3">{formula}</p>
      </div>
      <div className="numeros px-5 py-3 text-sm">{children}</div>
    </Tarjeta>
  )
}

function Linea({ nombre, critica = false, children }: { nombre: string; critica?: boolean; children: ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-borde py-2 last:border-0">
      <span className={`w-8 shrink-0 font-semibold ${critica ? 'text-critico' : ''}`}>{nombre}</span>
      <div className="flex flex-wrap gap-x-6 gap-y-0.5">{children}</div>
    </div>
  )
}

function Terminos({ terminos, elegido, prefijo }: { terminos: Termino[]; elegido: string | null; prefijo: string }) {
  return (
    <span className="text-texto-2">
      {'{ '}
      {terminos.map((t, i) => (
        <span key={t.nombre}>
          {i > 0 && ', '}
          <span
            className={t.nombre === elegido ? 'rounded-md bg-acento-suave px-1 font-semibold text-acento' : ''}
            title={t.nombre === elegido ? 'Este valor decide el resultado' : undefined}
          >
            {prefijo}
            <sub>{t.nombre}</sub>={formatear(t.valor)}
          </span>
        </span>
      ))}
      {' }'}
    </span>
  )
}
