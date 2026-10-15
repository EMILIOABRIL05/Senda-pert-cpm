/**
 * Conversión de tiempos del proyecto a fechas de calendario.
 * Se usan días corridos (sin excluir fines de semana), como en los
 * ejercicios de clase.
 */

/** Unidades para las que tiene sentido mostrar fechas, con su equivalencia en días. */
const DIAS_POR_UNIDAD: Record<string, number> = { días: 1, semanas: 7 }

export function admiteFechas(unidad: string): boolean {
  return unidad in DIAS_POR_UNIDAD
}

/** Fecha en que ocurre el instante `t` del proyecto, o null si no aplica. */
export function fechaEn(fechaInicio: string | null, t: number, unidad: string): Date | null {
  const dias = DIAS_POR_UNIDAD[unidad]
  if (!fechaInicio || dias === undefined) return null
  const [anio, mes, dia] = fechaInicio.split('-').map(Number)
  if (!anio || !mes || !dia) return null
  // Se trabaja a mediodía local para que el cambio de horario no mueva el día.
  const fecha = new Date(anio, mes - 1, dia, 12)
  fecha.setDate(fecha.getDate() + Math.round(t * dias))
  return fecha
}

const FORMATO_CORTO = new Intl.DateTimeFormat('es-EC', { day: 'numeric', month: 'short' })
const FORMATO_LARGO = new Intl.DateTimeFormat('es-EC', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export function fechaCorta(fecha: Date): string {
  return FORMATO_CORTO.format(fecha).replace('.', '')
}

export function fechaLarga(fecha: Date): string {
  return FORMATO_LARGO.format(fecha)
}
