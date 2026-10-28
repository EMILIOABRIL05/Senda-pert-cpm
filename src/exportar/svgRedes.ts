/**
 * Dibuja las redes AOA y AON como SVG independiente (con colores fijos),
 * a partir de la misma disposición que usa la vista interactiva. Así la
 * imagen exportada contiene la red completa, sin depender del zoom actual.
 */
import { getBezierPath, Position } from '@xyflow/react'
import {
  ALTO_CAJA,
  ANCHO_CAJA,
  DIAMETRO_EVENTO,
  DIAMETRO_EXTREMO,
  disponerAOA,
  disponerAON,
} from '../componentes/diagramas/disposicion'
import { posicionEtiquetaFlecha } from '../componentes/diagramas/estilos'
import { formatear } from '../core/numeros'
import type { ActividadNormalizada, RedAOA, ResultadoCPM } from '../core/tipos'

interface Paleta {
  superficie: string
  superficie3: string
  texto: string
  texto2: string
  texto3: string
  borde: string
  bordeFuerte: string
  critico: string
}

const FUENTE = '-apple-system, BlinkMacSystemFont, "Segoe UI", Inter, Roboto, Arial, sans-serif'
const MARGEN = 40

/** Lee los colores del tema activo. */
export function paletaActual(): Paleta {
  const estilo = getComputedStyle(document.documentElement)
  const v = (nombre: string) => estilo.getPropertyValue(nombre).trim()
  return {
    superficie: v('--superficie'),
    superficie3: v('--superficie-3'),
    texto: v('--texto'),
    texto2: v('--texto-2'),
    texto3: v('--texto-3'),
    borde: v('--borde'),
    bordeFuerte: v('--borde-fuerte'),
    critico: v('--critico'),
  }
}

/** Escapa los textos del usuario (nombres de actividades) para no romper el XML. */
function escapar(texto: string): string {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function texto(x: number, y: number, contenido: string, atributos: string): string {
  return `<text x="${x}" y="${y}" font-family='${FUENTE}' ${atributos}>${escapar(contenido)}</text>`
}

interface Flecha {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
  grosor: number
  punteada: boolean
  etiqueta?: { contenido: string; color: string; negrita: boolean; cursiva?: boolean }
}

function dibujarFlecha(f: Flecha, idMarcador: string): string {
  const [ruta, lx, ly] = getBezierPath({
    sourceX: f.x1,
    sourceY: f.y1,
    sourcePosition: Position.Right,
    targetX: f.x2,
    targetY: f.y2,
    targetPosition: Position.Left,
  })
  let svg = `<path d="${ruta}" fill="none" stroke="${f.color}" stroke-width="${f.grosor}" ${f.punteada ? 'stroke-dasharray="6 5"' : ''} marker-end="url(#${idMarcador})"/>`
  if (f.etiqueta) {
    const pos = posicionEtiquetaFlecha(f.x1, f.y1, f.x2, f.y2, lx, ly, f.etiqueta.contenido)
    svg += texto(
      pos.x,
      pos.y + 4,
      f.etiqueta.contenido,
      `text-anchor="middle" font-size="12" fill="${f.etiqueta.color}" ${f.etiqueta.cursiva ? 'font-style="italic"' : ''} font-weight="${f.etiqueta.negrita ? 700 : 500}"`,
    )
  }
  return svg
}

function marcadores(paleta: Paleta): string {
  const marcador = (id: string, color: string) =>
    `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}"/></marker>`
  return `<defs>${marcador('m-critica', paleta.critico)}${marcador('m-normal', paleta.texto2)}${marcador('m-ficticia', paleta.texto3)}</defs>`
}

function envolver(contenido: string, minX: number, minY: number, maxX: number, maxY: number, paleta: Paleta): SVGSVGElement {
  const ancho = maxX - minX + MARGEN * 2
  const alto = maxY - minY + MARGEN * 2
  const marcado = `<svg xmlns="http://www.w3.org/2000/svg" width="${ancho}" height="${alto}" viewBox="${minX - MARGEN} ${minY - MARGEN} ${ancho} ${alto}">
    <rect x="${minX - MARGEN}" y="${minY - MARGEN}" width="${ancho}" height="${alto}" fill="${paleta.superficie}"/>
    ${marcadores(paleta)}${contenido}</svg>`
  return new DOMParser().parseFromString(marcado, 'image/svg+xml').documentElement as unknown as SVGSVGElement
}

export function svgRedAOA(red: RedAOA, paleta: Paleta): SVGSVGElement {
  const { eventos } = disponerAOA(red)
  const r = DIAMETRO_EVENTO / 2
  const centro = new Map(eventos.map((e) => [e.evento.id, { x: e.x + r, y: e.y + r }]))

  const flechas = red.flechas
    .map((f) => {
      const a = centro.get(f.desde) ?? { x: 0, y: 0 }
      const b = centro.get(f.hasta) ?? { x: 0, y: 0 }
      const color = f.critica ? paleta.critico : f.ficticia ? paleta.texto3 : paleta.texto2
      const marcador = f.critica ? 'm-critica' : f.ficticia ? 'm-ficticia' : 'm-normal'
      return dibujarFlecha(
        {
          x1: a.x + r,
          y1: a.y,
          x2: b.x - r,
          y2: b.y,
          color,
          grosor: f.critica ? 3 : 1.5,
          punteada: f.ficticia,
          etiqueta: {
            contenido: f.ficticia ? 'ficticia' : `${f.actividad} = ${formatear(f.duracion)}`,
            color: f.critica ? paleta.critico : f.ficticia ? paleta.texto3 : paleta.texto,
            negrita: f.critica,
            cursiva: f.ficticia,
          },
        },
        marcador,
      )
    })
    .join('')

  const nodos = eventos
    .map(({ evento, critico, x, y }) => {
      const cx = x + r
      const cy = y + r
      return `<g>
        <circle cx="${cx}" cy="${cy}" r="${r - 1}" fill="${paleta.superficie}" stroke="${critico ? paleta.critico : paleta.bordeFuerte}" stroke-width="${critico ? 2.5 : 1.5}"/>
        <line x1="${cx - r + 4}" y1="${cy}" x2="${cx + r - 4}" y2="${cy}" stroke="${paleta.bordeFuerte}"/>
        <line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy + r - 2}" stroke="${paleta.bordeFuerte}"/>
        ${texto(cx, cy - 8, String(evento.id), `text-anchor="middle" font-size="18" font-weight="650" fill="${paleta.texto}"`)}
        ${texto(cx - 12, cy + 18, formatear(evento.te), `text-anchor="middle" font-size="11" fill="${paleta.texto}"`)}
        ${texto(cx + 12, cy + 18, formatear(evento.tl), `text-anchor="middle" font-size="11" fill="${paleta.texto3}"`)}
      </g>`
    })
    .join('')

  const xs = eventos.map((e) => e.x)
  const ys = eventos.map((e) => e.y)
  return envolver(flechas + nodos, Math.min(...xs), Math.min(...ys), Math.max(...xs) + DIAMETRO_EVENTO, Math.max(...ys) + DIAMETRO_EVENTO, paleta)
}

export function svgRedAON(cpm: ResultadoCPM, actividades: ActividadNormalizada[], paleta: Paleta): SVGSVGElement {
  const { cajas, enlaces } = disponerAON(cpm, actividades)
  const medida = (tipo: 'actividad' | 'extremo') =>
    tipo === 'actividad' ? { ancho: ANCHO_CAJA, alto: ALTO_CAJA } : { ancho: DIAMETRO_EXTREMO, alto: DIAMETRO_EXTREMO }
  const caja = new Map(cajas.map((c) => [c.id, { ...c, ...medida(c.tipo) }]))

  const flechas = enlaces
    .map((e) => {
      const a = caja.get(e.desde)
      const b = caja.get(e.hasta)
      if (!a || !b) return ''
      return dibujarFlecha(
        {
          x1: a.x + a.ancho,
          y1: a.y + a.alto / 2,
          x2: b.x,
          y2: b.y + b.alto / 2,
          color: e.critica ? paleta.critico : paleta.texto2,
          grosor: e.critica ? 3 : 1.5,
          punteada: false,
        },
        e.critica ? 'm-critica' : 'm-normal',
      )
    })
    .join('')

  const nodos = cajas
    .map((c) => {
      if (c.tipo === 'extremo') {
        const radio = DIAMETRO_EXTREMO / 2
        return `<circle cx="${c.x + radio}" cy="${c.y + radio}" r="${radio - 1}" fill="${paleta.superficie3}" stroke="${paleta.bordeFuerte}" stroke-width="1.5"/>
          ${texto(c.x + radio, c.y + radio + 4, c.etiqueta.toUpperCase(), `text-anchor="middle" font-size="10" font-weight="600" fill="${paleta.texto3}"`)}`
      }
      const f = c.fila
      const tercio = ANCHO_CAJA / 3
      const filaAlta = ALTO_CAJA / 3.4
      const yMedia = c.y + filaAlta
      const yBaja = c.y + ALTO_CAJA - filaAlta
      const celda = (columna: number, y: number, valor: string, color: string) =>
        texto(c.x + tercio * columna + tercio / 2, y + filaAlta / 2 + 4, valor, `text-anchor="middle" font-size="12" fill="${color}"`)
      return `<g>
        <rect x="${c.x}" y="${c.y}" width="${ANCHO_CAJA}" height="${ALTO_CAJA}" rx="12" fill="${paleta.superficie}" stroke="${f.critica ? paleta.critico : paleta.bordeFuerte}" stroke-width="${f.critica ? 2.5 : 1.5}"/>
        <line x1="${c.x}" y1="${yMedia}" x2="${c.x + ANCHO_CAJA}" y2="${yMedia}" stroke="${paleta.borde}"/>
        <line x1="${c.x}" y1="${yBaja}" x2="${c.x + ANCHO_CAJA}" y2="${yBaja}" stroke="${paleta.borde}"/>
        ${[1, 2].map((k) => `<line x1="${c.x + tercio * k}" y1="${c.y}" x2="${c.x + tercio * k}" y2="${yMedia}" stroke="${paleta.borde}"/><line x1="${c.x + tercio * k}" y1="${yBaja}" x2="${c.x + tercio * k}" y2="${c.y + ALTO_CAJA}" stroke="${paleta.borde}"/>`).join('')}
        ${celda(0, c.y, formatear(f.ic), paleta.texto)}${celda(1, c.y, formatear(f.duracion), paleta.texto3)}${celda(2, c.y, formatear(f.tc), paleta.texto)}
        ${texto(c.x + ANCHO_CAJA / 2, c.y + ALTO_CAJA / 2 + 6, f.critica ? `${f.nombre} · crítica` : f.nombre, `text-anchor="middle" font-size="${f.critica ? 14 : 16}" font-weight="650" fill="${f.critica ? paleta.critico : paleta.texto}"`)}
        ${celda(0, yBaja, formatear(f.il), paleta.texto)}${celda(1, yBaja, `H ${formatear(f.holguraTotal)}`, f.critica ? paleta.critico : paleta.texto3)}${celda(2, yBaja, formatear(f.tl), paleta.texto)}
      </g>`
    })
    .join('')

  const xs = cajas.map((c) => c.x)
  const ys = cajas.map((c) => c.y)
  const xMax = Math.max(...cajas.map((c) => c.x + medida(c.tipo).ancho))
  const yMax = Math.max(...cajas.map((c) => c.y + medida(c.tipo).alto))
  return envolver(flechas + nodos, Math.min(...xs), Math.min(...ys), xMax, yMax, paleta)
}
