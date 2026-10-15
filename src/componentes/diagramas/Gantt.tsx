import { useEffect, useId, useRef, useState, type Ref, type RefObject } from 'react'
import { fechaCorta, fechaEn } from '../../core/fechas'
import { formatear } from '../../core/numeros'
import type { ActividadNormalizada, FilaCPM, Proyecto, ResultadoCPM } from '../../core/tipos'
import { IconoAcercar, IconoAlejar, IconoEncuadrar } from '../iconos'
import { Boton } from '../ui/Boton'

interface Props {
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  proyecto: Proyecto
  /** El SVG completo, para exportarlo como imagen. */
  refSvg?: Ref<SVGSVGElement>
}

const FILA = 40
const CABECERA = 44
const MARGEN_DERECHO = 56
const ALTO_BARRA = 20
const ZOOMS = [0.5, 0.75, 1, 1.5, 2, 3, 4]

/** Diagrama de Gantt propio en SVG: una barra de IC a TC por actividad, con su holgura a continuación. */
export function Gantt({ cpm, actividades, proyecto, refSvg }: Props) {
  const contenedor = useRef<HTMLDivElement>(null)
  const anchoDisponible = useAnchoDe(contenedor)
  const [indiceZoom, setIndiceZoom] = useState(2)
  const idRayas = useId().replace(/:/g, '')

  const etiquetas = anchoDisponible < 560 ? 110 : 210
  const duracion = Math.max(cpm.duracion, 1)
  const escalaBase = Math.max(12, (anchoDisponible - etiquetas - MARGEN_DERECHO) / duracion)
  const escala = escalaBase * (ZOOMS[indiceZoom] ?? 1)
  const ancho = etiquetas + duracion * escala + MARGEN_DERECHO
  const descripcion = new Map(actividades.map((a) => [a.nombre, a.descripcion]))
  const filas = ordenarFilas(cpm.filas)
  const alto = CABECERA + filas.length * FILA + 12
  const x = (t: number) => etiquetas + t * escala
  const marcas = marcasDelEje(duracion, escala)
  const etiquetaTiempo = (t: number) => {
    const fecha = fechaEn(proyecto.fechaInicio, t, proyecto.unidad)
    return fecha ? fechaCorta(fecha) : formatear(t)
  }

  return (
    <div className="relative">
      <div className="absolute right-3 top-2 z-10 flex items-center gap-0.5 rounded-full border border-borde bg-superficie/90 p-0.5 shadow-suave backdrop-blur">
        <Boton variante="fantasma" tamano="sm" soloIcono aria-label="Alejar" icono={<IconoAlejar tamano={16} />} disabled={indiceZoom === 0} onClick={() => setIndiceZoom((i) => i - 1)} />
        <Boton variante="fantasma" tamano="sm" soloIcono aria-label="Ajustar al ancho" icono={<IconoEncuadrar tamano={16} />} onClick={() => setIndiceZoom(2)} />
        <Boton variante="fantasma" tamano="sm" soloIcono aria-label="Acercar" icono={<IconoAcercar tamano={16} />} disabled={indiceZoom === ZOOMS.length - 1} onClick={() => setIndiceZoom((i) => i + 1)} />
      </div>

      <div ref={contenedor} className="relative overflow-x-auto">
        <svg
          ref={refSvg}
          width={ancho}
          height={alto}
          viewBox={`0 0 ${ancho} ${alto}`}
          role="img"
          aria-label={`Diagrama de Gantt: ${filas.length} actividades, duración total ${formatear(cpm.duracion)} ${proyecto.unidad}`}
          className="block bg-superficie font-sans"
        >
          <defs>
            <pattern id={idRayas} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <rect width="2.5" height="6" fill="white" fillOpacity="0.28" />
            </pattern>
          </defs>

          {/* Franjas alternas para seguir cada fila con la vista. */}
          {filas.map((f, i) =>
            i % 2 === 1 ? <rect key={`franja-${f.nombre}`} x={0} y={CABECERA + i * FILA} width={ancho} height={FILA} className="fill-superficie-2" /> : null,
          )}

          {/* Eje de tiempo con su cuadrícula. */}
          {marcas.map((t) => (
            <g key={`marca-${t}`}>
              <line x1={x(t)} x2={x(t)} y1={CABECERA - 6} y2={alto - 8} className="stroke-borde" strokeWidth={1} />
              <text x={x(t)} y={CABECERA - 16} textAnchor="middle" className="fill-texto-3 numeros" fontSize={11}>
                {etiquetaTiempo(t)}
              </text>
            </g>
          ))}
          <line x1={etiquetas} x2={ancho - MARGEN_DERECHO + 8} y1={CABECERA - 6} y2={CABECERA - 6} className="stroke-borde-fuerte" />

          {filas.map((f, i) => (
            <FilaGantt
              key={f.nombre}
              fila={f}
              y={CABECERA + i * FILA}
              x={x}
              descripcion={descripcion.get(f.nombre) ?? ''}
              anchoEtiquetas={etiquetas}
              idRayas={idRayas}
              unidad={proyecto.unidad}
            />
          ))}

          {/* Línea de fin del proyecto. */}
          <line x1={x(cpm.duracion)} x2={x(cpm.duracion)} y1={CABECERA - 6} y2={alto - 8} className="stroke-critico" strokeWidth={1.5} strokeDasharray="4 4" />
          <text x={x(cpm.duracion) + 6} y={alto - 12} className="fill-critico" fontSize={11} fontWeight={600}>
            Fin
          </text>
        </svg>
      </div>
    </div>
  )
}

interface PropsFila {
  fila: FilaCPM
  y: number
  x: (t: number) => number
  descripcion: string
  anchoEtiquetas: number
  idRayas: string
  unidad: string
}

function FilaGantt({ fila, y, x, descripcion, anchoEtiquetas, idRayas, unidad }: PropsFila) {
  const yBarra = y + (FILA - ALTO_BARRA) / 2
  const inicio = x(fila.ic)
  const anchoBarra = x(fila.tc) - inicio
  const color = fila.critica ? 'fill-critico' : 'fill-acento'
  const resumen = `${fila.nombre}: de ${formatear(fila.ic)} a ${formatear(fila.tc)} ${unidad}${
    fila.critica ? ' (crítica)' : `, holgura ${formatear(fila.holguraTotal)}`
  }`
  const maxCaracteres = anchoEtiquetas > 150 ? 20 : 0

  return (
    <g>
      <title>{resumen}</title>
      <text x={16} y={y + FILA / 2 + 4} fontSize={13} fontWeight={650} className={fila.critica ? 'fill-critico' : 'fill-texto'}>
        {fila.nombre}
        {maxCaracteres > 0 && descripcion && (
          <tspan dx={8} fontWeight={400} fontSize={12} className="fill-texto-3">
            {descripcion.length > maxCaracteres ? `${descripcion.slice(0, maxCaracteres - 1)}…` : descripcion}
          </tspan>
        )}
      </text>

      {fila.holguraTotal > 0 && (
        <g>
          <rect
            x={x(fila.tc)}
            y={yBarra + 3}
            width={x(fila.tc + fila.holguraTotal) - x(fila.tc)}
            height={ALTO_BARRA - 6}
            rx={4}
            className="fill-acento-suave stroke-acento"
            strokeOpacity={0.45}
            strokeDasharray="3 3"
          />
          <text x={x(fila.tc + fila.holguraTotal) + 6} y={yBarra + ALTO_BARRA / 2 + 4} fontSize={11} className="fill-texto-3 numeros">
            +{formatear(fila.holguraTotal)}
          </text>
        </g>
      )}

      {anchoBarra < 1 ? (
        // Hito (duración 0): rombo.
        <path
          d={`M ${inicio} ${yBarra} l 8 ${ALTO_BARRA / 2} l -8 ${ALTO_BARRA / 2} l -8 ${-ALTO_BARRA / 2} Z`}
          className={color}
        />
      ) : (
        <g>
          <rect x={inicio} y={yBarra} width={anchoBarra} height={ALTO_BARRA} rx={5} className={color} />
          {fila.critica && <rect x={inicio} y={yBarra} width={anchoBarra} height={ALTO_BARRA} rx={5} fill={`url(#${idRayas})`} />}
          {anchoBarra > 30 && (
            <text x={inicio + anchoBarra / 2} y={yBarra + ALTO_BARRA / 2 + 4} textAnchor="middle" fontSize={11} fontWeight={600} className="fill-sobre-acento numeros" style={fila.critica ? { fill: '#fff' } : undefined}>
              {formatear(fila.duracion)}
            </text>
          )}
        </g>
      )}
    </g>
  )
}

/** Primero lo que empieza antes; ante empate, el orden de ingreso. */
function ordenarFilas(filas: FilaCPM[]): FilaCPM[] {
  return filas.map((f, i) => ({ f, i })).sort((a, b) => a.f.ic - b.f.ic || a.i - b.i).map(({ f }) => f)
}

/** Marcas del eje con un paso "redondo" (1, 2, 5, 10…) que deja al menos 44 px entre ellas. */
function marcasDelEje(duracion: number, escala: number): number[] {
  const minimo = 44 / escala
  const paso = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000].find((p) => p >= minimo) ?? 1000
  const marcas: number[] = []
  for (let t = 0; t <= duracion + 1e-9; t += paso) marcas.push(t)
  return marcas
}

/** Ancho del contenedor, actualizado al cambiar el tamaño de la ventana. */
function useAnchoDe(ref: RefObject<HTMLDivElement | null>): number {
  const [ancho, setAncho] = useState(900)
  useEffect(() => {
    const elemento = ref.current
    if (!elemento) return
    const observador = new ResizeObserver(([entrada]) => {
      if (entrada) setAncho(entrada.contentRect.width)
    })
    observador.observe(elemento)
    return () => observador.disconnect()
  }, [ref])
  return ancho
}
