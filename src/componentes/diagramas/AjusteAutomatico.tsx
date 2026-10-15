import { useReactFlow, useStore } from '@xyflow/react'
import { useEffect } from 'react'

/**
 * Vuelve a encuadrar el diagrama cuando cambia el tamaño de su contenedor
 * (girar el celular, abrir la barra lateral, etc.).
 */
export function AjusteAutomatico({ relleno = 0.15 }: { relleno?: number }) {
  const { fitView } = useReactFlow()
  const ancho = useStore((s) => s.width)
  const alto = useStore((s) => s.height)

  useEffect(() => {
    if (ancho === 0 || alto === 0) return
    const cuadro = requestAnimationFrame(() => void fitView({ padding: relleno, maxZoom: 1.3 }))
    return () => cancelAnimationFrame(cuadro)
  }, [ancho, alto, fitView, relleno])

  return null
}
