import type { ReactNode } from 'react'
import { fechaEn, fechaLarga } from '../core/fechas'
import { formatear } from '../core/numeros'
import type { Proyecto, RedAOA, ResultadoCPM, ResultadoPERT } from '../core/tipos'
import { RutaCritica } from './RutaCritica'
import { Tarjeta } from './ui/Seccion'

interface Props {
  proyecto: Proyecto
  cpm: ResultadoCPM
  pert: ResultadoPERT | null
  aoa: RedAOA
}

/** Cifras clave del proyecto, de un vistazo. */
export function Resumen({ proyecto, cpm, pert, aoa }: Props) {
  const criticas = cpm.filas.filter((f) => f.critica).length
  const fin = fechaEn(proyecto.fechaInicio, cpm.duracion, proyecto.unidad)

  return (
    <Tarjeta>
      <dl className="grid grid-cols-1 divide-y divide-borde sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-[1.1fr_1.6fr_1fr]">
        <Dato titulo={pert ? 'Duración esperada (Te)' : 'Duración del proyecto'}>
          <span className="font-display text-5xl font-semibold tracking-tight">{formatear(cpm.duracion)}</span>
          <span className="ml-2 text-lg text-texto-3">{proyecto.unidad}</span>
          {fin && <p className="mt-1 text-sm text-texto-3">Termina el {fechaLarga(fin)}</p>}
        </Dato>

        <Dato
          titulo={cpm.rutas.length === 1 ? 'Ruta crítica' : `${cpm.rutas.length} rutas críticas`}
          className="sm:border-l sm:border-borde"
        >
          <div className="space-y-2 pt-1">
            {cpm.rutas.map((ruta) => (
              <div key={ruta.join('-')}>
                <RutaCritica ruta={ruta} />
              </div>
            ))}
          </div>
          <p className="mt-2 text-sm text-texto-3">Cualquier retraso en estas actividades retrasa todo el proyecto.</p>
        </Dato>

        <Dato titulo="Actividades críticas" className="border-borde sm:col-span-2 sm:border-t lg:col-span-1 lg:border-t-0 lg:border-l">
          <span className="font-display text-3xl font-semibold tracking-tight">{criticas}</span>
          <span className="ml-1.5 text-texto-3">de {cpm.filas.length}</span>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-superficie-3" aria-hidden="true">
            <div className="h-full rounded-full bg-critico" style={{ width: `${(criticas / cpm.filas.length) * 100}%` }} />
          </div>
          <p className="mt-3 text-sm text-texto-3">
            Red AOA: {aoa.nodos.length} eventos · {aoa.ficticias} {aoa.ficticias === 1 ? 'ficticia' : 'ficticias'}
          </p>
        </Dato>
      </dl>

      {pert && (
        <div className="grid grid-cols-2 gap-px border-t border-borde bg-borde sm:grid-cols-3">
          <MiniDato titulo="Varianza del proyecto (σ²)" valor={formatear(pert.varianza, 4)} />
          <MiniDato titulo="Desviación estándar (σ)" valor={formatear(pert.desviacion, 4)} />
          <div className="col-span-2 bg-superficie px-6 py-4 sm:col-span-1">
            <dt className="etiqueta">Varianza tomada de</dt>
            <dd className="mt-1.5">
              <RutaCritica ruta={pert.rutaVarianza} tamano="sm" />
              {pert.variasRutas && (
                <p className="mt-1.5 text-xs text-texto-3">Hay varias rutas críticas; se usa la de mayor varianza.</p>
              )}
            </dd>
          </div>
        </div>
      )}
    </Tarjeta>
  )
}

function Dato({ titulo, children, className = '' }: { titulo: string; children: ReactNode; className?: string }) {
  return (
    <div className={`px-6 py-5 ${className}`}>
      <dt className="etiqueta mb-2">{titulo}</dt>
      <dd className="numeros">{children}</dd>
    </div>
  )
}

function MiniDato({ titulo, valor }: { titulo: string; valor: string }) {
  return (
    <div className="bg-superficie px-6 py-4">
      <dt className="etiqueta">{titulo}</dt>
      <dd className="numeros mt-1 text-xl font-semibold">{valor}</dd>
    </div>
  )
}
