import type { Proyecto } from '../core/tipos'
import { convertirAProyecto, paraArchivo } from '../estado/persistencia'
import { descargar, nombreSeguro } from './archivos'

export function exportarJSON(proyecto: Proyecto): void {
  const texto = JSON.stringify(paraArchivo(proyecto), null, 2)
  descargar(new Blob([texto], { type: 'application/json' }), `${nombreSeguro(proyecto.nombre)}.senda.json`)
}

/** Lee un archivo elegido por el usuario. Lanza un Error con un mensaje claro si no sirve. */
export async function importarJSON(archivo: File): Promise<Proyecto> {
  let dato: unknown
  try {
    dato = JSON.parse(await archivo.text())
  } catch {
    throw new Error('El archivo no es un JSON válido.')
  }
  const proyecto = convertirAProyecto(dato)
  if (!proyecto) throw new Error('El archivo no contiene un proyecto de Senda.')
  return proyecto
}
