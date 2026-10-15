import { useEffect, useRef, type Dispatch, type KeyboardEvent } from 'react'
import { aNumero, formatear } from '../core/numeros'
import { tiempoEsperado } from '../core/pert'
import type { Actividad, CampoConError, ErrorValidacion, Proyecto } from '../core/tipos'
import type { Accion, CampoEditable } from '../estado/proyecto'
import { IconoFlechaAbajo, IconoFlechaArriba, IconoMas, IconoPapelera } from './iconos'
import { Boton } from './ui/Boton'
import { Tarjeta } from './ui/Seccion'

interface Props {
  proyecto: Proyecto
  errores: ErrorValidacion[]
  despachar: Dispatch<Accion>
  onEliminar: (actividad: Actividad) => void
}

interface Columna {
  campo: CampoEditable
  titulo: string
  ayuda: string
  ancho: string
  numerica?: boolean
  marcador?: string
}

const COLUMNAS_COMUNES: Columna[] = [
  { campo: 'nombre', titulo: 'Actividad', ayuda: 'Nombre corto y único, ej. A', ancho: 'w-28' },
  { campo: 'descripcion', titulo: 'Descripción', ayuda: 'Opcional', ancho: '', marcador: 'Opcional' },
  { campo: 'predecesores', titulo: 'Predecesores', ayuda: 'Separados por coma; vacío si no tiene', ancho: 'w-40', marcador: '—' },
]

const COLUMNAS_CPM: Columna[] = [
  { campo: 'duracion', titulo: 'Duración', ayuda: 'Tiempo de la actividad', ancho: 'w-28', numerica: true },
]

const COLUMNAS_PERT: Columna[] = [
  { campo: 'a', titulo: 'a', ayuda: 'Tiempo optimista', ancho: 'w-20', numerica: true },
  { campo: 'm', titulo: 'm', ayuda: 'Tiempo más probable', ancho: 'w-20', numerica: true },
  { campo: 'b', titulo: 'b', ayuda: 'Tiempo pesimista', ancho: 'w-20', numerica: true },
]

/** Qué columnas resalta cada tipo de error. */
const CAMPOS_DE_ERROR: Record<CampoConError, CampoEditable[]> = {
  nombre: ['nombre'],
  predecesores: ['predecesores'],
  duracion: ['duracion'],
  tiempos: ['a', 'm', 'b'],
  general: [],
}

export function TablaEntrada({ proyecto, errores, despachar, onEliminar }: Props) {
  const esPERT = proyecto.modo === 'PERT'
  const columnas = [...COLUMNAS_COMUNES, ...(esPERT ? COLUMNAS_PERT : COLUMNAS_CPM)]
  const tabla = useRef<HTMLTableElement>(null)
  const enfocarNuevaFila = useRef(false)
  const cantidad = proyecto.actividades.length

  // Tras agregar con Enter, el foco salta al nombre de la nueva fila.
  useEffect(() => {
    if (!enfocarNuevaFila.current) return
    enfocarNuevaFila.current = false
    tabla.current?.querySelector<HTMLInputElement>(`[data-fila="${cantidad - 1}"][data-campo="nombre"]`)?.focus()
  }, [cantidad])

  const conError = (fila: number, campo: CampoEditable) =>
    errores.some((e) => e.fila === fila && CAMPOS_DE_ERROR[e.campo].includes(campo))

  const alPresionarTecla = (evento: KeyboardEvent<HTMLInputElement>, fila: number, campo: CampoEditable) => {
    if (evento.key !== 'Enter') return
    evento.preventDefault()
    const destino = fila + (evento.shiftKey ? -1 : 1)
    const siguiente = tabla.current?.querySelector<HTMLInputElement>(`[data-fila="${destino}"][data-campo="${campo}"]`)
    if (siguiente) {
      siguiente.focus()
      siguiente.select()
    } else if (!evento.shiftKey) {
      enfocarNuevaFila.current = true
      despachar({ tipo: 'agregar' })
    }
  }

  return (
    <Tarjeta>
      <div className="relative overflow-x-auto">
        <table ref={tabla} className="w-full min-w-[680px] table-fixed border-collapse text-sm">
          <caption className="sr-only">Actividades del proyecto. Enter pasa a la fila siguiente.</caption>
          <thead>
            <tr className="border-b border-borde text-left">
              <th scope="col" className="w-14 py-3 pl-5 pr-2 font-normal">
                <span className="etiqueta">#</span>
              </th>
              {columnas.map((c) => (
                <th key={c.campo} scope="col" className={`py-3 font-normal ${c.ancho} ${c.numerica ? "pl-1 pr-3.5 text-right" : "px-3.5 text-left"}`}>
                  <abbr title={c.ayuda} className={`etiqueta no-underline ${c.campo.length === 1 ? 'normal-case' : ''}`}>
                    {c.titulo}
                  </abbr>
                </th>
              ))}
              {esPERT && (
                <th scope="col" className="w-20 px-2 py-3 text-right font-normal">
                  <abbr title="Tiempo esperado: (a + 4m + b) / 6" className="etiqueta normal-case no-underline">
                    te
                  </abbr>
                </th>
              )}
              <th scope="col" className="w-32 pr-4 font-normal">
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {proyecto.actividades.map((actividad, fila) => {
              const filaConError = errores.some((e) => e.fila === fila)
              const nombre = actividad.nombre.trim() || `fila ${fila + 1}`
              return (
                <tr
                  key={actividad.id}
                  className="group border-b border-borde transition-colors last:border-0 hover:bg-superficie-2"
                >
                  <td className="py-1.5 pl-5 pr-2">
                    <span
                      className={`numeros inline-flex h-6 min-w-6 items-center justify-center rounded-full px-1.5 text-xs ${
                        filaConError ? 'bg-critico text-white' : 'text-texto-3'
                      }`}
                      title={filaConError ? 'Esta fila tiene un error' : undefined}
                    >
                      {fila + 1}
                    </span>
                  </td>
                  {columnas.map((c) => (
                    <td key={c.campo} className="px-1 py-1.5">
                      <input
                        data-fila={fila}
                        data-campo={c.campo}
                        value={actividad[c.campo]}
                        onChange={(e) => despachar({ tipo: 'editar', id: actividad.id, campo: c.campo, valor: e.target.value })}
                        onKeyDown={(e) => alPresionarTecla(e, fila, c.campo)}
                        aria-label={`${c.titulo === 'a' || c.titulo === 'm' || c.titulo === 'b' ? c.ayuda : c.titulo} de ${nombre}`}
                        aria-invalid={conError(fila, c.campo)}
                        inputMode={c.numerica ? 'decimal' : undefined}
                        placeholder={c.marcador}
                        autoComplete="off"
                        spellCheck={false}
                        className={`campo ${c.numerica ? 'numeros text-right' : ''} ${c.campo === 'nombre' ? 'font-semibold' : ''}`}
                      />
                    </td>
                  ))}
                  {esPERT && (
                    <td className="numeros px-2 py-1.5 text-right text-texto-3">{tiempoEsperadoTexto(actividad)}</td>
                  )}
                  <td className="py-1.5 pr-4">
                    <div className="flex justify-end gap-0.5 transition-opacity md:opacity-0 md:group-focus-within:opacity-100 md:group-hover:opacity-100">
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        soloIcono
                        icono={<IconoFlechaArriba tamano={16} />}
                        aria-label={`Subir ${nombre}`}
                        disabled={fila === 0}
                        onClick={() => despachar({ tipo: 'mover', id: actividad.id, direccion: -1 })}
                      />
                      <Boton
                        variante="fantasma"
                        tamano="sm"
                        soloIcono
                        icono={<IconoFlechaAbajo tamano={16} />}
                        aria-label={`Bajar ${nombre}`}
                        disabled={fila === cantidad - 1}
                        onClick={() => despachar({ tipo: 'mover', id: actividad.id, direccion: 1 })}
                      />
                      <Boton
                        variante="peligro"
                        tamano="sm"
                        soloIcono
                        icono={<IconoPapelera tamano={16} />}
                        aria-label={`Eliminar ${nombre}`}
                        onClick={() => onEliminar(actividad)}
                      />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-borde bg-superficie-2 px-5 py-3">
        <Boton variante="fantasma" tamano="sm" icono={<IconoMas tamano={16} />} onClick={() => despachar({ tipo: 'agregar' })} className="-ml-3 text-acento hover:text-acento">
          Agregar actividad
        </Boton>
        <p className="text-xs text-texto-3">
          <kbd className="rounded border border-borde-fuerte px-1 font-sans">Enter</kbd> baja a la siguiente fila ·
          predecesores separados por comas
        </p>
      </div>
    </Tarjeta>
  )
}

function tiempoEsperadoTexto(actividad: Actividad): string {
  const [a, m, b] = [actividad.a, actividad.m, actividad.b].map(aNumero)
  if (a == null || m == null || b == null || !(a <= m && m <= b)) return '—'
  return formatear(tiempoEsperado(a, m, b))
}
