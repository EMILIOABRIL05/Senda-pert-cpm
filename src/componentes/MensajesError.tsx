import type { ErrorValidacion } from '../core/tipos'
import { IconoAlerta } from './iconos'

const CAMPO_A_ENFOCAR: Record<ErrorValidacion['campo'], string | null> = {
  nombre: 'nombre',
  predecesores: 'predecesores',
  duracion: 'duracion',
  tiempos: 'a',
  general: null,
}

/** Lista de problemas en los datos; cada uno lleva al campo que hay que corregir. */
export function MensajesError({ errores }: { errores: ErrorValidacion[] }) {
  const irAlCampo = (error: ErrorValidacion) => {
    const campo = CAMPO_A_ENFOCAR[error.campo]
    if (error.fila === null || campo === null) return
    const entrada = document.querySelector<HTMLInputElement>(`[data-fila="${error.fila}"][data-campo="${campo}"]`)
    entrada?.focus()
    entrada?.select()
  }

  return (
    <div role="status" aria-live="polite" className="mt-4 rounded-2xl border border-critico/25 bg-critico-suave p-4 sm:p-5">
      <div className="flex items-center gap-2 font-medium text-critico">
        <IconoAlerta tamano={18} />
        {errores.length === 1 ? 'Hay un problema en los datos' : `Hay ${errores.length} problemas en los datos`}
      </div>
      <ul className="mt-2 space-y-1 pl-7 text-sm text-texto">
        {errores.map((error, i) => (
          <li key={i}>
            {error.fila !== null ? (
              <button type="button" onClick={() => irAlCampo(error)} className="text-left underline-offset-2 hover:underline">
                {error.mensaje}
              </button>
            ) : (
              error.mensaje
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
