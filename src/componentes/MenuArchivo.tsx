import { useRef, type ChangeEvent } from 'react'
import type { Analisis, Proyecto } from '../core/tipos'
import { exportarExcel } from '../exportar/excel'
import { exportarJSON, importarJSON } from '../exportar/json'
import { IconoDescargar, IconoDocumento, IconoSubir, IconoTabla } from './iconos'
import { Menu } from './ui/Menu'

interface Props {
  proyecto: Proyecto
  analisis: Analisis
  onImportar: (proyecto: Proyecto, nombreArchivo: string) => void
  onAviso: (mensaje: string) => void
}

/** Importar y exportar el proyecto (.json) y los resultados (Excel). */
export function MenuArchivo({ proyecto, analisis, onImportar, onAviso }: Props) {
  const selector = useRef<HTMLInputElement>(null)

  const alElegirArchivo = async (evento: ChangeEvent<HTMLInputElement>) => {
    const archivo = evento.target.files?.[0]
    evento.target.value = '' // Permite volver a elegir el mismo archivo.
    if (!archivo) return
    try {
      onImportar(await importarJSON(archivo), archivo.name)
    } catch (error) {
      onAviso(error instanceof Error ? error.message : 'No se pudo importar el archivo.')
    }
  }

  const alExportarExcel = async () => {
    if (!analisis.ok) {
      onAviso('Corrige los errores de la tabla antes de exportar los resultados.')
      return
    }
    try {
      await exportarExcel({ proyecto, actividades: analisis.actividades, cpm: analisis.cpm, pert: analisis.pert })
    } catch {
      onAviso('No se pudo generar el archivo de Excel.')
    }
  }

  return (
    <>
      <Menu
        etiqueta="Archivo"
        disparador={
          <>
            <IconoDocumento tamano={16} />
            <span className="hidden sm:inline">Archivo</span>
          </>
        }
        elementos={[
          {
            etiqueta: 'Abrir proyecto…',
            descripcion: 'Importar un archivo .json de Senda',
            icono: <IconoSubir tamano={16} />,
            alElegir: () => selector.current?.click(),
          },
          {
            etiqueta: 'Guardar proyecto',
            descripcion: 'Descargar como .json para compartirlo',
            icono: <IconoDescargar tamano={16} />,
            alElegir: () => exportarJSON(proyecto),
          },
          {
            etiqueta: 'Exportar resultados',
            descripcion: 'Tabla de tiempos y resumen en Excel',
            icono: <IconoTabla tamano={16} />,
            alElegir: () => void alExportarExcel(),
          },
        ]}
      />
      <input ref={selector} type="file" accept=".json,application/json" onChange={alElegirArchivo} className="hidden" tabIndex={-1} aria-hidden="true" />
    </>
  )
}
