import { useCallback, useEffect, useRef, useState } from 'react'

export interface DatosAviso {
  mensaje: string
  /** Acción opcional, ej. "Deshacer". */
  accion?: { etiqueta: string; alElegir: () => void }
}

/** Gestiona un único aviso flotante que desaparece solo. */
export function useAviso(duracionMs = 5000) {
  const [aviso, setAviso] = useState<DatosAviso | null>(null)
  const temporizador = useRef<number | undefined>(undefined)

  const cerrar = useCallback(() => setAviso(null), [])
  const mostrar = useCallback(
    (datos: DatosAviso) => {
      window.clearTimeout(temporizador.current)
      setAviso(datos)
      temporizador.current = window.setTimeout(() => setAviso(null), duracionMs)
    },
    [duracionMs],
  )

  useEffect(() => () => window.clearTimeout(temporizador.current), [])
  return { aviso, mostrar, cerrar }
}

export function Aviso({ aviso, onCerrar }: { aviso: DatosAviso | null; onCerrar: () => void }) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-4">
      {aviso && (
        <div className="animar-aparicion pointer-events-auto flex items-center gap-4 rounded-full bg-texto py-2.5 pl-5 pr-2.5 text-sm text-fondo shadow-elevada">
          <span>{aviso.mensaje}</span>
          {aviso.accion && (
            <button
              type="button"
              onClick={() => {
                aviso.accion?.alElegir()
                onCerrar()
              }}
              className="rounded-full bg-fondo/15 px-3 py-1 font-semibold transition-colors hover:bg-fondo/25"
            >
              {aviso.accion.etiqueta}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
