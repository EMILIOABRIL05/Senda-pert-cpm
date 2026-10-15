import { Encabezado } from './componentes/Encabezado'
import { IconoDocumento, IconoInfo, IconoLibro } from './componentes/iconos'
import { MensajesError } from './componentes/MensajesError'
import { PanelProyecto } from './componentes/PanelProyecto'
import { Resumen } from './componentes/Resumen'
import { TablaEntrada } from './componentes/TablaEntrada'
import { TablaResultados } from './componentes/TablaResultados'
import { Aviso, useAviso } from './componentes/ui/Aviso'
import { Menu } from './componentes/ui/Menu'
import { Seccion } from './componentes/ui/Seccion'
import type { Actividad, Proyecto } from './core/tipos'
import { EJEMPLOS, proyectoEnBlanco } from './ejemplos'
import { usePreferencias } from './estado/preferencias'
import { useProyecto } from './estado/useProyecto'

export default function App() {
  const { proyecto, despachar, analisis } = useProyecto()
  const { preferencias, temaEfectivo, cambiarTema, cambiarAcento } = usePreferencias()
  const { aviso, mostrar, cerrar } = useAviso()

  /** Reemplaza el proyecto completo, pero deja deshacer: el trabajo del usuario nunca se pierde por un clic. */
  const reemplazarProyecto = (nuevo: Proyecto, mensaje: string) => {
    const anterior = proyecto
    despachar({ tipo: 'cargar', proyecto: nuevo })
    mostrar({ mensaje, accion: { etiqueta: 'Deshacer', alElegir: () => despachar({ tipo: 'cargar', proyecto: anterior }) } })
  }

  const eliminarActividad = (actividad: Actividad) => {
    const anterior = proyecto
    despachar({ tipo: 'eliminar', id: actividad.id })
    mostrar({
      mensaje: `Se eliminó la actividad ${actividad.nombre || 'sin nombre'}`,
      accion: { etiqueta: 'Deshacer', alElegir: () => despachar({ tipo: 'cargar', proyecto: anterior }) },
    })
  }

  const menuEjemplos = (
    <Menu
      etiqueta="Cargar ejemplo"
      disparador={
        <>
          <IconoLibro tamano={16} />
          <span className="hidden sm:inline">Ejemplos</span>
        </>
      }
      elementos={[
        ...EJEMPLOS.map((ejemplo) => ({
          etiqueta: ejemplo.titulo,
          descripcion: ejemplo.descripcion,
          alElegir: () => reemplazarProyecto(ejemplo.crear(), `Se cargó «${ejemplo.titulo}»`),
        })),
        {
          etiqueta: 'Proyecto en blanco',
          descripcion: 'Empezar desde cero',
          icono: <IconoDocumento tamano={16} />,
          alElegir: () => reemplazarProyecto(proyectoEnBlanco(), 'Nuevo proyecto en blanco'),
        },
      ]}
    />
  )

  return (
    <>
      <Encabezado
        tema={preferencias.tema}
        temaEfectivo={temaEfectivo}
        acento={preferencias.acento}
        onCambiarTema={cambiarTema}
        onCambiarAcento={cambiarAcento}
        acciones={menuEjemplos}
      />

      <main className="mx-auto max-w-6xl px-4 pb-28 sm:px-6">
        <PanelProyecto proyecto={proyecto} despachar={despachar} />

        <div className="space-y-16">
          <Seccion
            id="datos"
            titulo="Actividades"
            descripcion={
              proyecto.modo === 'CPM'
                ? 'Cada actividad con sus predecesores y su duración.'
                : 'Cada actividad con tres estimaciones: optimista (a), más probable (m) y pesimista (b).'
            }
          >
            <TablaEntrada
              proyecto={proyecto}
              errores={analisis.ok ? [] : analisis.errores}
              despachar={despachar}
              onEliminar={eliminarActividad}
            />
            {!analisis.ok && <MensajesError errores={analisis.errores} />}
          </Seccion>

          <Seccion id="resultados" titulo="Resultados" descripcion="Se actualizan solos mientras editas.">
            {analisis.ok ? (
              <div className="space-y-6">
                <Resumen proyecto={proyecto} cpm={analisis.cpm} pert={analisis.pert} aoa={analisis.aoa} />
                <TablaResultados cpm={analisis.cpm} actividades={analisis.actividades} esPERT={proyecto.modo === 'PERT'} />
              </div>
            ) : (
              <EstadoPendiente />
            )}
          </Seccion>
        </div>
      </main>

      <footer className="border-t border-borde py-8 text-center text-xs text-texto-3">
        Senda · Investigación Operativa — PERT, CPM, ruta crítica y diagrama de Gantt
      </footer>

      <Aviso aviso={aviso} onCerrar={cerrar} />
    </>
  )
}

function EstadoPendiente() {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-borde-fuerte px-6 py-14 text-center">
      <span className="mb-3 text-texto-3">
        <IconoInfo tamano={28} />
      </span>
      <p className="font-medium">Los resultados aparecerán cuando los datos estén completos</p>
      <p className="mt-1 max-w-md text-sm text-texto-3">
        Corrige los problemas señalados en la tabla de actividades. No se calcula nada con datos incorrectos.
      </p>
    </div>
  )
}
