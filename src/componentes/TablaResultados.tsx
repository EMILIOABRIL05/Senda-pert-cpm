import { formatear } from '../core/numeros'
import type { ActividadNormalizada, FilaCPM, ResultadoCPM } from '../core/tipos'
import { Tarjeta } from './ui/Seccion'

interface Props {
  cpm: ResultadoCPM
  actividades: ActividadNormalizada[]
  esPERT: boolean
}

interface Columna {
  titulo: string
  ayuda: string
  valor: (fila: FilaCPM, actividad: ActividadNormalizada) => string
}

const COLUMNAS_PERT: Columna[] = [
  { titulo: 'a', ayuda: 'Tiempo optimista', valor: (_, a) => formatear(a.tiempos?.a ?? 0) },
  { titulo: 'm', ayuda: 'Tiempo más probable', valor: (_, a) => formatear(a.tiempos?.m ?? 0) },
  { titulo: 'b', ayuda: 'Tiempo pesimista', valor: (_, a) => formatear(a.tiempos?.b ?? 0) },
  { titulo: 'te', ayuda: 'Tiempo esperado (a + 4m + b) / 6', valor: (f) => formatear(f.duracion, 4) },
  { titulo: 'σ²', ayuda: 'Varianza ((b − a) / 6)²', valor: (_, a) => formatear(a.tiempos?.varianza ?? 0, 4) },
]

const COLUMNA_DURACION: Columna = { titulo: 'Duración', ayuda: 'Duración de la actividad', valor: (f) => formatear(f.duracion) }

const COLUMNAS_TIEMPOS: Columna[] = [
  { titulo: 'IC', ayuda: 'Inicio más cercano: máx(TC de los predecesores)', valor: (f) => formatear(f.ic) },
  { titulo: 'TC', ayuda: 'Terminación más cercana: IC + duración', valor: (f) => formatear(f.tc) },
  { titulo: 'IL', ayuda: 'Inicio más lejano: TL − duración', valor: (f) => formatear(f.il) },
  { titulo: 'TL', ayuda: 'Terminación más lejana: mín(IL de los sucesores)', valor: (f) => formatear(f.tl) },
  { titulo: 'HT', ayuda: 'Holgura total: IL − IC', valor: (f) => formatear(f.holguraTotal) },
  { titulo: 'HL', ayuda: 'Holgura libre: mín(IC de los sucesores) − TC', valor: (f) => formatear(f.holguraLibre) },
]

export function TablaResultados({ cpm, actividades, esPERT }: Props) {
  const columnas = [...(esPERT ? COLUMNAS_PERT : [COLUMNA_DURACION]), ...COLUMNAS_TIEMPOS]
  const porNombre = new Map(actividades.map((a) => [a.nombre, a]))

  return (
    <Tarjeta>
      <div className="overflow-x-auto">
        <table className="numeros w-full min-w-[640px] border-collapse text-sm">
          <caption className="sr-only">Tabla de tiempos del CPM con holguras y actividades críticas</caption>
          <thead>
            <tr className="border-b border-borde">
              <th scope="col" className="py-3 pl-6 pr-3 text-left font-normal">
                <span className="etiqueta">Actividad</span>
              </th>
              {columnas.map((c) => (
                <th key={c.titulo} scope="col" className="px-3 py-3 text-right font-normal">
                  <abbr title={c.ayuda} className={`etiqueta cursor-help no-underline ${c.titulo.length <= 2 ? 'normal-case' : ''}`}>
                    {c.titulo}
                  </abbr>
                </th>
              ))}
              <th scope="col" className="py-3 pl-3 pr-6 text-left font-normal">
                <span className="etiqueta">Estado</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {cpm.filas.map((fila) => {
              const actividad = porNombre.get(fila.nombre) as ActividadNormalizada
              return (
                <tr
                  key={fila.nombre}
                  className={`border-b border-borde last:border-0 ${fila.critica ? 'bg-critico-suave/50' : ''}`}
                >
                  <th scope="row" className="relative py-2.5 pl-6 pr-3 text-left font-normal">
                    {fila.critica && <span className="absolute inset-y-0 left-0 w-1 bg-critico" aria-hidden="true" />}
                    <span className="font-semibold">{fila.nombre}</span>
                    {actividad.descripcion && (
                      <span className="ml-2 hidden text-texto-3 lg:inline">{actividad.descripcion}</span>
                    )}
                  </th>
                  {columnas.map((c) => (
                    <td
                      key={c.titulo}
                      className={`px-3 py-2.5 text-right ${
                        (c.titulo === 'HT' || c.titulo === 'HL') && fila.critica ? 'text-critico' : ''
                      } ${c.titulo === 'HT' ? 'font-semibold' : ''}`}
                    >
                      {c.valor(fila, actividad)}
                    </td>
                  ))}
                  <td className="py-2.5 pl-3 pr-6">
                    {fila.critica ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-critico-suave px-2 py-0.5 text-xs font-semibold text-critico ring-1 ring-critico/30 ring-inset">
                        <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
                          <circle cx="5" cy="5" r="3" fill="currentColor" />
                        </svg>
                        Crítica
                      </span>
                    ) : (
                      <span className="text-xs text-texto-3">Holgura de {formatear(fila.holguraTotal)}</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="border-t border-borde bg-superficie-2 px-6 py-3 text-xs leading-relaxed text-texto-3">
        IC/TC: inicio y terminación más cercanos · IL/TL: inicio y terminación más lejanos · HT: holgura total · HL:
        holgura libre. Una actividad es crítica cuando su holgura total es 0.
      </p>
    </Tarjeta>
  )
}
