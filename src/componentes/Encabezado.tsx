import type { ReactNode } from 'react'
import type { Acento, Tema } from '../estado/preferencias'
import { IconoLuna, IconoPantalla, IconoSol } from './iconos'
import { Logo } from './Logo'
import { ControlSegmentado } from './ui/ControlSegmentado'
import { Menu } from './ui/Menu'

interface Props {
  tema: Tema
  temaEfectivo: 'claro' | 'oscuro'
  acento: Acento
  onCambiarTema: (tema: Tema) => void
  onCambiarAcento: (acento: Acento) => void
  /** Menús de la derecha (ejemplos, archivo…). */
  acciones: ReactNode
}

const SECCIONES = [
  { id: 'datos', etiqueta: 'Datos' },
  { id: 'resultados', etiqueta: 'Resultados' },
  { id: 'diagramas', etiqueta: 'Diagramas' },
]

const ACENTOS: { valor: Acento; nombre: string; muestra: string }[] = [
  { valor: 'azul', nombre: 'Azul', muestra: '#0071e3' },
  { valor: 'indigo', nombre: 'Índigo', muestra: '#5856d6' },
  { valor: 'verde', nombre: 'Verde', muestra: '#1a7f37' },
  { valor: 'grafito', nombre: 'Grafito', muestra: '#3a3a3c' },
]

export function Encabezado({ tema, temaEfectivo, acento, onCambiarTema, onCambiarAcento, acciones }: Props) {
  return (
    <header className="sticky top-0 z-40 border-b border-borde bg-fondo/75 backdrop-blur-xl backdrop-saturate-150">
      <a
        href="#datos"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:rounded-lg focus:bg-superficie focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <div className="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <a href="#" className="flex items-center gap-2.5 rounded-lg" aria-label="Senda, ir al inicio">
          <Logo />
          <span className="font-display text-[17px] font-semibold tracking-tight">Senda</span>
        </a>

        <nav aria-label="Secciones" className="ml-4 hidden items-center gap-1 md:flex">
          {SECCIONES.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="rounded-full px-3 py-1.5 text-[13px] text-texto-3 transition-colors hover:text-texto"
            >
              {s.etiqueta}
            </a>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-0.5">
          {acciones}
          <Menu
            etiqueta="Apariencia"
            disparador={temaEfectivo === 'oscuro' ? <IconoLuna /> : <IconoSol />}
            claseDisparador="w-9 justify-center px-0"
          >
            <div className="w-72 space-y-5 p-3">
              <div>
                <p className="etiqueta mb-2">Tema</p>
                <ControlSegmentado
                  etiqueta="Tema"
                  tamano="sm"
                  valor={tema}
                  onCambio={onCambiarTema}
                  opciones={[
                    { valor: 'claro', etiqueta: <><IconoSol tamano={14} /> Claro</> },
                    { valor: 'oscuro', etiqueta: <><IconoLuna tamano={14} /> Oscuro</> },
                    { valor: 'sistema', etiqueta: <><IconoPantalla tamano={14} /> Auto</>, descripcion: 'Seguir al sistema' },
                  ]}
                />
              </div>
              <fieldset>
                <legend className="etiqueta mb-2">Color de acento</legend>
                <div className="flex gap-2">
                  {ACENTOS.map((a) => (
                    <label key={a.valor} className="group flex cursor-pointer flex-col items-center gap-1.5">
                      <input
                        type="radio"
                        name="acento"
                        value={a.valor}
                        checked={acento === a.valor}
                        onChange={() => onCambiarAcento(a.valor)}
                        className="peer sr-only"
                      />
                      <span
                        className="h-8 w-8 rounded-full ring-2 ring-transparent ring-offset-2 ring-offset-superficie transition-all peer-checked:ring-texto peer-focus-visible:ring-acento group-hover:scale-105"
                        style={{ background: a.muestra }}
                      />
                      <span className="text-[11px] text-texto-3 peer-checked:text-texto">{a.nombre}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>
          </Menu>
        </div>
      </div>
    </header>
  )
}
