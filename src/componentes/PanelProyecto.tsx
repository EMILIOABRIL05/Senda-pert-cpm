import type { Dispatch } from 'react'
import { admiteFechas } from '../core/fechas'
import type { Proyecto } from '../core/tipos'
import type { Accion } from '../estado/proyecto'
import { ControlSegmentado } from './ui/ControlSegmentado'

const UNIDADES = ['días', 'semanas', 'horas', 'meses']

interface Props {
  proyecto: Proyecto
  despachar: Dispatch<Accion>
}

/** Cabecera de la página: nombre del proyecto y ajustes generales. */
export function PanelProyecto({ proyecto, despachar }: Props) {
  const fechasDisponibles = admiteFechas(proyecto.unidad)

  return (
    <div className="pb-10 pt-12 sm:pt-16">
      <p className="etiqueta mb-2">Proyecto · Modelo de redes</p>
      <label htmlFor="nombre-proyecto" className="sr-only">
        Nombre del proyecto
      </label>
      <input
        id="nombre-proyecto"
        value={proyecto.nombre}
        onChange={(e) => despachar({ tipo: 'renombrar', nombre: e.target.value })}
        placeholder="Proyecto sin título"
        spellCheck={false}
        className="-mx-2 w-full rounded-xl bg-transparent px-2 font-display text-4xl font-semibold tracking-tight text-texto outline-none transition-colors placeholder:text-texto-3 hover:bg-superficie-3/60 focus:bg-superficie sm:text-5xl"
      />
      <p className="mt-3 max-w-2xl text-[17px] leading-relaxed text-texto-2">
        Escribe las actividades y sus precedencias. Senda calcula los tiempos, las holguras y la ruta crítica, y dibuja
        la red y el diagrama de Gantt mientras escribes.
      </p>

      <div className="mt-8 flex flex-wrap items-end gap-x-8 gap-y-5">
        <div>
          <p className="etiqueta mb-2" id="etiqueta-modo">
            Método
          </p>
          <ControlSegmentado
            etiqueta="Método de cálculo"
            valor={proyecto.modo}
            onCambio={(modo) => despachar({ tipo: 'cambiarModo', modo })}
            opciones={[
              { valor: 'CPM', etiqueta: 'CPM', descripcion: 'Una duración conocida por actividad' },
              { valor: 'PERT', etiqueta: 'PERT', descripcion: 'Tres estimaciones: optimista, probable y pesimista' },
            ]}
          />
        </div>

        <div>
          <label htmlFor="unidad" className="etiqueta mb-2 block">
            Unidad de tiempo
          </label>
          <select
            id="unidad"
            value={proyecto.unidad}
            onChange={(e) => despachar({ tipo: 'cambiarUnidad', unidad: e.target.value })}
            className="campo-caja h-9 w-36 py-0"
          >
            {UNIDADES.map((u) => (
              <option key={u} value={u}>
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="fecha-inicio" className="etiqueta mb-2 block">
            Fecha de inicio <span className="font-normal normal-case tracking-normal">(opcional)</span>
          </label>
          <div className="flex items-center gap-2">
            <input
              id="fecha-inicio"
              type="date"
              disabled={!fechasDisponibles}
              value={proyecto.fechaInicio ?? ''}
              onChange={(e) => despachar({ tipo: 'cambiarFecha', fecha: e.target.value || null })}
              className="campo-caja h-9 w-44 py-0 disabled:opacity-50"
              aria-describedby="ayuda-fecha"
            />
            {proyecto.fechaInicio && (
              <button
                type="button"
                onClick={() => despachar({ tipo: 'cambiarFecha', fecha: null })}
                className="text-[13px] text-acento hover:underline"
              >
                Quitar
              </button>
            )}
          </div>
          <p id="ayuda-fecha" className="sr-only">
            {fechasDisponibles
              ? 'Si eliges una fecha, el diagrama de Gantt muestra fechas reales.'
              : 'Las fechas solo están disponibles con días o semanas.'}
          </p>
        </div>
      </div>
    </div>
  )
}
