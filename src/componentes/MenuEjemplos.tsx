import type { Proyecto } from '../core/tipos'
import { EJEMPLOS, proyectoEnBlanco } from '../ejemplos'
import { IconoDocumento, IconoLibro } from './iconos'
import { Menu } from './ui/Menu'

/** Botón "Ejemplos": carga un ejercicio precargado o un proyecto en blanco. */
export function MenuEjemplos({ onCargar }: { onCargar: (proyecto: Proyecto, mensaje: string) => void }) {
  return (
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
          alElegir: () => onCargar(ejemplo.crear(), `Se cargó «${ejemplo.titulo}»`),
        })),
        {
          etiqueta: 'Proyecto en blanco',
          descripcion: 'Empezar desde cero',
          icono: <IconoDocumento tamano={16} />,
          alElegir: () => onCargar(proyectoEnBlanco(), 'Nuevo proyecto en blanco'),
        },
      ]}
    />
  )
}
