import { useId, useState } from 'react'
import { phi } from '../core/normal'
import { aNumero, formatear } from '../core/numeros'
import { plazoParaConfianza, probabilidadPlazo } from '../core/pert'
import type { ResultadoPERT } from '../core/tipos'
import { ControlSegmentado } from './ui/ControlSegmentado'
import { Tarjeta } from './ui/Seccion'

type Pregunta = 'probabilidad' | 'plazo'

interface Props {
  pert: ResultadoPERT
  unidad: string
}

/** Calculadora de probabilidad de la duración del proyecto (normal con media Te y desviación σ). */
export function CalculadoraPERT({ pert, unidad }: Props) {
  const [pregunta, setPregunta] = useState<Pregunta>('probabilidad')
  const [plazoTexto, setPlazoTexto] = useState(() => String(Math.ceil(pert.media + pert.desviacion)))
  const [confianzaTexto, setConfianzaTexto] = useState('95')
  const idEntrada = useId()

  const plazo = aNumero(plazoTexto)
  const confianza = aNumero(confianzaTexto)
  const confianzaValida = confianza !== null && confianza > 0 && confianza < 100

  const resultado =
    pregunta === 'probabilidad'
      ? plazo === null
        ? null
        : { ...probabilidadPlazo(plazo, pert), t: plazo }
      : confianzaValida
        ? { ...plazoParaConfianza(confianza / 100, pert), p: confianza / 100 }
        : null

  return (
    <Tarjeta>
      <div className="grid lg:grid-cols-[1fr_1.15fr]">
        <div className="border-b border-borde p-6 lg:border-b-0 lg:border-r">
          <h3 className="font-display text-lg font-semibold">Calculadora de probabilidad</h3>
          <p className="mt-1 text-sm text-texto-3">
            Se supone que la duración sigue una normal con media Te = {formatear(pert.media, 4)} y σ ={' '}
            {formatear(pert.desviacion, 4)}.
          </p>

          <div className="mt-5">
            <ControlSegmentado
              etiqueta="Tipo de pregunta"
              tamano="sm"
              valor={pregunta}
              onCambio={setPregunta}
              opciones={[
                { valor: 'probabilidad', etiqueta: 'Probabilidad de un plazo' },
                { valor: 'plazo', etiqueta: 'Plazo para una confianza' },
              ]}
            />
          </div>

          <div className="mt-5">
            {pregunta === 'probabilidad' ? (
              <>
                <label htmlFor={idEntrada} className="etiqueta mb-2 block">
                  Plazo T ({unidad})
                </label>
                <input id={idEntrada} inputMode="decimal" value={plazoTexto} onChange={(e) => setPlazoTexto(e.target.value)} className="campo-caja numeros w-40 text-lg" />
              </>
            ) : (
              <>
                <label htmlFor={idEntrada} className="etiqueta mb-2 block">
                  Confianza deseada (%)
                </label>
                <input
                  id={idEntrada}
                  inputMode="decimal"
                  value={confianzaTexto}
                  onChange={(e) => setConfianzaTexto(e.target.value)}
                  aria-invalid={!confianzaValida}
                  className="campo-caja numeros w-40 text-lg aria-invalid:border-critico"
                />
                {!confianzaValida && <p className="mt-1.5 text-xs text-critico">Escribe un porcentaje mayor que 0 y menor que 100.</p>}
              </>
            )}
          </div>

          {resultado && (
            <dl className="numeros mt-6 grid grid-cols-2 gap-4">
              <div>
                <dt className="etiqueta">Z = (T − Te) / σ</dt>
                <dd className="mt-1 text-xl font-semibold">{formatearZ(resultado.z)}</dd>
              </div>
              <div>
                <dt className="etiqueta">{pregunta === 'probabilidad' ? 'P(T ≤ plazo) = Φ(Z)' : 'Plazo necesario'}</dt>
                <dd className="mt-1 text-xl font-semibold">
                  {pregunta === 'probabilidad' ? resultado.p.toFixed(4) : `${formatear(resultado.t, 4)} ${unidad}`}
                </dd>
              </div>
            </dl>
          )}
        </div>

        <div className="flex flex-col justify-center p-6">
          {resultado ? (
            <>
              <p className="text-[15px] leading-relaxed text-texto-2" aria-live="polite">
                {pregunta === 'probabilidad' ? (
                  <>
                    Hay un <b className="text-texto">{formatear(resultado.p * 100, 2)}%</b> de probabilidad de terminar el proyecto en{' '}
                    {formatear(resultado.t, 4)} {unidad} o menos.
                  </>
                ) : (
                  <>
                    Para terminar con un <b className="text-texto">{formatear(resultado.p * 100, 2)}%</b> de confianza se necesitan{' '}
                    <b className="text-texto">{formatear(resultado.t, 4)} {unidad}</b>.
                  </>
                )}
              </p>
              <CurvaNormal z={resultado.z} />
            </>
          ) : (
            <p className="text-sm text-texto-3">Escribe un valor para ver el resultado.</p>
          )}
        </div>
      </div>
    </Tarjeta>
  )
}

function formatearZ(z: number): string {
  if (z === Infinity) return '+∞'
  if (z === -Infinity) return '−∞'
  return z.toFixed(4)
}

/** Campana de Gauss con el área Φ(z) sombreada. */
function CurvaNormal({ z }: { z: number }) {
  const ANCHO = 420
  const ALTO = 150
  const LIMITE = 3.6
  const x = (valor: number) => ((valor + LIMITE) / (2 * LIMITE)) * ANCHO
  const y = (valor: number) => ALTO - 18 - (Math.exp((-valor * valor) / 2) / Math.sqrt(2 * Math.PI)) * ((ALTO - 30) / 0.4)
  const zRecortado = Math.max(-LIMITE, Math.min(LIMITE, z))

  const puntos: string[] = []
  const area: string[] = [`M ${x(-LIMITE)} ${y(-LIMITE * 10)}`]
  for (let v = -LIMITE; v <= LIMITE + 1e-9; v += 0.05) {
    puntos.push(`${x(v).toFixed(1)},${y(v).toFixed(1)}`)
    if (v <= zRecortado) area.push(`L ${x(v).toFixed(1)} ${y(v).toFixed(1)}`)
  }
  area.push(`L ${x(zRecortado)} ${y(zRecortado)} L ${x(zRecortado)} ${ALTO - 18} L ${x(-LIMITE)} ${ALTO - 18} Z`)

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} className="mt-4 w-full" role="img" aria-label={`Curva normal con el ${formatear(phi(z) * 100)}% del área sombreada`}>
      <path d={area.join(' ')} className="fill-acento-suave" />
      <polyline points={puntos.join(' ')} fill="none" className="stroke-acento" strokeWidth={2} />
      <line x1={0} x2={ANCHO} y1={ALTO - 18} y2={ALTO - 18} className="stroke-borde-fuerte" />
      <line x1={x(0)} x2={x(0)} y1={y(0)} y2={ALTO - 18} className="stroke-texto-3" strokeDasharray="3 3" />
      <text x={x(0)} y={ALTO - 3} textAnchor="middle" fontSize={11} className="fill-texto-3">
        Te
      </text>
      {Number.isFinite(z) && (
        <>
          <line x1={x(zRecortado)} x2={x(zRecortado)} y1={12} y2={ALTO - 18} className="stroke-acento" strokeWidth={1.5} />
          <text x={x(zRecortado)} y={10} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-acento">
            z = {z.toFixed(2)}
          </text>
        </>
      )}
    </svg>
  )
}
