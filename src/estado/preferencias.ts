/**
 * Preferencias visuales (tema y color de acento). Se guardan aparte del
 * proyecto porque pertenecen a la persona, no al ejercicio.
 */
import { useEffect, useState } from 'react'

export type Tema = 'claro' | 'oscuro' | 'sistema'
export type Acento = 'azul' | 'indigo' | 'verde' | 'grafito'

export interface Preferencias {
  tema: Tema
  acento: Acento
}

const CLAVE = 'senda:preferencias'
const POR_DEFECTO: Preferencias = { tema: 'sistema', acento: 'azul' }
const TEMAS: Tema[] = ['claro', 'oscuro', 'sistema']
const ACENTOS: Acento[] = ['azul', 'indigo', 'verde', 'grafito']

function leer(): Preferencias {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE) ?? 'null') as Partial<Preferencias> | null
    return {
      tema: TEMAS.includes(guardado?.tema as Tema) ? (guardado?.tema as Tema) : POR_DEFECTO.tema,
      acento: ACENTOS.includes(guardado?.acento as Acento) ? (guardado?.acento as Acento) : POR_DEFECTO.acento,
    }
  } catch {
    return POR_DEFECTO
  }
}

function prefiereOscuro(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-color-scheme: dark)').matches
}

/** Aplica las preferencias al <html> y las mantiene sincronizadas con el sistema. */
export function usePreferencias() {
  const [preferencias, setPreferencias] = useState<Preferencias>(leer)
  const [sistemaOscuro, setSistemaOscuro] = useState(prefiereOscuro)

  useEffect(() => {
    const consulta = matchMedia('(prefers-color-scheme: dark)')
    const alCambiar = () => setSistemaOscuro(consulta.matches)
    consulta.addEventListener('change', alCambiar)
    return () => consulta.removeEventListener('change', alCambiar)
  }, [])

  const temaEfectivo: 'claro' | 'oscuro' =
    preferencias.tema === 'sistema' ? (sistemaOscuro ? 'oscuro' : 'claro') : preferencias.tema

  useEffect(() => {
    const raiz = document.documentElement
    raiz.dataset.tema = temaEfectivo
    raiz.dataset.acento = preferencias.acento
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', temaEfectivo === 'oscuro' ? '#000000' : '#f5f5f7')
    try {
      localStorage.setItem(CLAVE, JSON.stringify(preferencias))
    } catch {
      // Sin almacenamiento disponible: la preferencia dura solo esta sesión.
    }
  }, [preferencias, temaEfectivo])

  return {
    preferencias,
    temaEfectivo,
    cambiarTema: (tema: Tema) => setPreferencias((p) => ({ ...p, tema })),
    cambiarAcento: (acento: Acento) => setPreferencias((p) => ({ ...p, acento })),
  }
}
