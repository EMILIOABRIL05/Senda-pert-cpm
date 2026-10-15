import { redondear } from '../core/numeros'
import type { ActividadNormalizada, Proyecto, ResultadoCPM, ResultadoPERT } from '../core/tipos'
import { nombreSeguro } from './archivos'

interface Datos {
  proyecto: Proyecto
  actividades: ActividadNormalizada[]
  cpm: ResultadoCPM
  pert: ResultadoPERT | null
}

/** Exporta la tabla de resultados y un resumen a un libro de Excel con dos hojas. */
export async function exportarExcel({ proyecto, actividades, cpm, pert }: Datos): Promise<void> {
  // Se carga bajo demanda: SheetJS pesa y solo se necesita al exportar.
  const XLSX = await import('xlsx')
  const porNombre = new Map(actividades.map((a) => [a.nombre, a]))
  const r = (n: number) => redondear(n, 4)

  const filas = cpm.filas.map((f) => {
    const a = porNombre.get(f.nombre)
    const tiempos = a?.tiempos
    return {
      Actividad: f.nombre,
      Descripción: a?.descripcion ?? '',
      Predecesores: a?.predecesores.join(', ') ?? '',
      ...(tiempos ? { a: tiempos.a, m: tiempos.m, b: tiempos.b, te: r(f.duracion), 'σ²': r(tiempos.varianza) } : { Duración: r(f.duracion) }),
      IC: r(f.ic),
      TC: r(f.tc),
      IL: r(f.il),
      TL: r(f.tl),
      'Holgura total': r(f.holguraTotal),
      'Holgura libre': r(f.holguraLibre),
      Crítica: f.critica ? 'Sí' : 'No',
    }
  })

  const resumen: (string | number)[][] = [
    ['Proyecto', proyecto.nombre],
    ['Método', proyecto.modo],
    ['Unidad de tiempo', proyecto.unidad],
    [pert ? 'Duración esperada (Te)' : 'Duración del proyecto', r(cpm.duracion)],
    ...cpm.rutas.map((ruta, i) => [cpm.rutas.length > 1 ? `Ruta crítica ${i + 1}` : 'Ruta crítica', ruta.join(' → ')]),
  ]
  if (pert) {
    resumen.push(['Varianza del proyecto (σ²)', r(pert.varianza)], ['Desviación estándar (σ)', r(pert.desviacion)])
    resumen.push(['Ruta usada para la varianza', pert.rutaVarianza.join(' → ')])
  }

  const libro = XLSX.utils.book_new()
  const hojaResultados = XLSX.utils.json_to_sheet(filas)
  hojaResultados['!cols'] = Object.keys(filas[0] ?? {}).map((k) => ({ wch: Math.max(8, k.length + 2) }))
  XLSX.utils.book_append_sheet(libro, hojaResultados, 'Resultados')
  const hojaResumen = XLSX.utils.aoa_to_sheet(resumen)
  hojaResumen['!cols'] = [{ wch: 30 }, { wch: 40 }]
  XLSX.utils.book_append_sheet(libro, hojaResumen, 'Resumen')
  XLSX.writeFile(libro, `${nombreSeguro(proyecto.nombre)}-resultados.xlsx`)
}
