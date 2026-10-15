/**
 * Genera los íconos PNG de la PWA a partir del logo de Senda, sin
 * dependencias: dibuja las figuras con supermuestreo y codifica el PNG
 * con zlib. Uso: node scripts/generar-iconos.mjs
 */
import { writeFileSync } from 'node:fs'
import { deflateSync } from 'node:zlib'

const FONDO = [29, 29, 31]
const CLARO = [245, 245, 247]
const TRAMO = [143, 143, 147]
const CRITICO = [255, 69, 58]

/** Figuras del logo en un lienzo de 32 × 32 (igual que src/componentes/Logo.tsx). */
const FIGURAS = [
  { tipo: 'segmento', a: [8, 21], b: [16, 11], grosor: 2.4, color: TRAMO },
  { tipo: 'segmento', a: [16, 11], b: [24, 21], grosor: 2.6, color: CRITICO },
  { tipo: 'circulo', c: [8, 21], r: 3, color: CLARO },
  { tipo: 'circulo', c: [16, 11], r: 3, color: CLARO },
  { tipo: 'circulo', c: [24, 21], r: 3, color: CRITICO },
]

function distanciaASegmento([px, py], [ax, ay], [bx, by]) {
  const dx = bx - ax
  const dy = by - ay
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)))
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy))
}

function dentroDeRectRedondeado([x, y], tamano, radio) {
  const cx = Math.min(Math.max(x, radio), tamano - radio)
  const cy = Math.min(Math.max(y, radio), tamano - radio)
  return Math.hypot(x - cx, y - cy) <= radio
}

/** Color de un punto del logo (coordenadas 0–32), o null si es transparente. */
function colorEn(punto, { redondeado, escalaLogo }) {
  if (redondeado && !dentroDeRectRedondeado(punto, 32, 8)) return null
  // El logo se puede achicar alrededor del centro (zona segura de íconos "maskable").
  const p = [16 + (punto[0] - 16) / escalaLogo, 16 + (punto[1] - 16) / escalaLogo]
  let color = FONDO
  for (const f of FIGURAS) {
    const dentro = f.tipo === 'segmento' ? distanciaASegmento(p, f.a, f.b) <= f.grosor / 2 : Math.hypot(p[0] - f.c[0], p[1] - f.c[1]) <= f.r
    if (dentro) color = f.color
  }
  return color
}

function rasterizar(tamano, opciones) {
  const MUESTRAS = 4
  const pixeles = Buffer.alloc(tamano * tamano * 4)
  for (let y = 0; y < tamano; y++) {
    for (let x = 0; x < tamano; x++) {
      let [r, g, b, a] = [0, 0, 0, 0]
      for (let sy = 0; sy < MUESTRAS; sy++) {
        for (let sx = 0; sx < MUESTRAS; sx++) {
          const punto = [((x + (sx + 0.5) / MUESTRAS) / tamano) * 32, ((y + (sy + 0.5) / MUESTRAS) / tamano) * 32]
          const color = colorEn(punto, opciones)
          if (!color) continue
          r += color[0]
          g += color[1]
          b += color[2]
          a += 1
        }
      }
      const i = (y * tamano + x) * 4
      pixeles[i] = a ? Math.round(r / a) : 0
      pixeles[i + 1] = a ? Math.round(g / a) : 0
      pixeles[i + 2] = a ? Math.round(b / a) : 0
      pixeles[i + 3] = Math.round((a / (MUESTRAS * MUESTRAS)) * 255)
    }
  }
  return pixeles
}

const TABLA_CRC = Array.from({ length: 256 }, (_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c >>> 0
})

function crc32(datos) {
  let c = 0xffffffff
  for (const byte of datos) c = TABLA_CRC[(c ^ byte) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function bloque(tipo, datos) {
  const largo = Buffer.alloc(4)
  largo.writeUInt32BE(datos.length)
  const cuerpo = Buffer.concat([Buffer.from(tipo, 'ascii'), datos])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(cuerpo))
  return Buffer.concat([largo, cuerpo, crc])
}

function codificarPNG(tamano, pixeles) {
  const cabecera = Buffer.alloc(13)
  cabecera.writeUInt32BE(tamano, 0)
  cabecera.writeUInt32BE(tamano, 4)
  cabecera.set([8, 6, 0, 0, 0], 8) // 8 bits, RGBA
  const filas = Buffer.alloc((tamano * 4 + 1) * tamano)
  for (let y = 0; y < tamano; y++) pixeles.copy(filas, y * (tamano * 4 + 1) + 1, y * tamano * 4, (y + 1) * tamano * 4)
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    bloque('IHDR', cabecera),
    bloque('IDAT', deflateSync(filas, { level: 9 })),
    bloque('IEND', Buffer.alloc(0)),
  ])
}

const ICONOS = [
  { archivo: 'public/icono-192.png', tamano: 192, redondeado: true, escalaLogo: 1 },
  { archivo: 'public/icono-512.png', tamano: 512, redondeado: true, escalaLogo: 1 },
  { archivo: 'public/icono-maskable-512.png', tamano: 512, redondeado: false, escalaLogo: 0.72 },
  { archivo: 'public/apple-touch-icon.png', tamano: 180, redondeado: false, escalaLogo: 0.86 },
]

for (const { archivo, tamano, ...opciones } of ICONOS) {
  writeFileSync(archivo, codificarPNG(tamano, rasterizar(tamano, opciones)))
  console.log(`✓ ${archivo}`)
}
