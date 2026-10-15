import { lazy, Suspense, useState } from 'react'
import { CalculadoraPERT } from './componentes/CalculadoraPERT'
import { Encabezado } from './componentes/Encabezado'
import { IconoInfo } from './componentes/iconos'
import { MensajesError } from './componentes/MensajesError'
import { MenuArchivo } from './componentes/MenuArchivo'
import { MenuEjemplos } from './componentes/MenuEjemplos'
import { PanelProyecto } from './componentes/PanelProyecto'
import { PasoAPaso } from './componentes/PasoAPaso'
import { Resumen } from './componentes/Resumen'
import { TablaEntrada } from './componentes/TablaEntrada'
import { TablaResultados } from './componentes/TablaResultados'
import { Aviso, useAviso } from './componentes/ui/Aviso'
import { Interruptor } from './componentes/ui/Interruptor'
import { Seccion } from './componentes/ui/Seccion'
import type { Actividad, Proyecto } from './core/tipos'
import { usePreferencias } from './estado/preferencias'
import { useProyecto } from './estado/useProyecto'

// Los diagramas se cargan aparte para que la primera pantalla aparezca antes.
const PanelDiagramas = lazy(() => import('./componentes/diagramas/PanelDiagramas'))

export default function App() {
  const { proyecto, despachar, analisis } = useProyecto()
  const { preferencias, temaEfectivo, cambiarTema, cambiarAcento } = usePreferencias()
  const { aviso, mostrar, cerrar } = useAviso()
  const [pasoAPaso, setPasoAPaso] = useState(false)

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

  const avisar = (mensaje: string) => mostrar({ mensaje })

  return (
    <>
      <Encabezado
        tema={preferencias.tema}
        temaEfectivo={temaEfectivo}
        acento={preferencias.acento}
        onCambiarTema={cambiarTema}
        onCambiarAcento={cambiarAcento}
        acciones={
          <>
            <MenuEjemplos onCargar={reemplazarProyecto} />
            <MenuArchivo
              proyecto={proyecto}
              analisis={analisis}
              onImportar={(nuevo, archivo) => reemplazarProyecto(nuevo, `Se abrió «${archivo}»`)}
              onAviso={avisar}
            />
          </>
        }
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

          <Seccion
            id="resultados"
            titulo="Resultados"
            descripcion="Se actualizan solos mientras editas."
            acciones={
              analisis.ok && (
                <Interruptor activo={pasoAPaso} onCambio={setPasoAPaso}>
                  Paso a paso
                </Interruptor>
              )
            }
          >
            {analisis.ok ? (
              <div className="space-y-6">
                <Resumen proyecto={proyecto} cpm={analisis.cpm} pert={analisis.pert} aoa={analisis.aoa} />
                {analisis.pert && <CalculadoraPERT key={analisis.pert.media} pert={analisis.pert} unidad={proyecto.unidad} />}
                <TablaResultados cpm={analisis.cpm} actividades={analisis.actividades} esPERT={proyecto.modo === 'PERT'} />
                {pasoAPaso && <PasoAPaso actividades={analisis.actividades} cpm={analisis.cpm} />}
              </div>
            ) : (
              <EstadoPendiente />
            )}
          </Seccion>

          {analisis.ok && (
            <Seccion
              id="diagramas"
              titulo="Diagramas"
              descripcion="La red de flechas (como en clase), la red de nodos y el cronograma."
            >
              <Suspense fallback={<div className="h-[540px] animate-pulse rounded-2xl bg-superficie-3" aria-label="Cargando diagramas" />}>
                <PanelDiagramas
                  proyecto={proyecto}
                  cpm={analisis.cpm}
                  actividades={analisis.actividades}
                  aoa={analisis.aoa}
                  temaOscuro={temaEfectivo === 'oscuro'}
                  onError={avisar}
                />
              </Suspense>
            </Seccion>
          )}
        </div>
      </main>

      <footer className="border-t border-borde py-8 text-center text-xs text-texto-3">
        Senda · Investigación Operativa — PERT, CPM, ruta crítica y diagrama de Gantt. Tus datos se guardan solo en este
        navegador.
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
