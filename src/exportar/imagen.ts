/**
 * Exportación de diagramas a PNG y PDF.
 *
 * Todos los diagramas se exportan como SVG con estilos en línea: un SVG
 * suelto no conoce las clases ni las variables CSS de la página, así que
 * primero se copian los estilos calculados y después html-to-image lo
 * convierte en PNG (que jsPDF puede insertar en un PDF).
 */
import { descargar, nombreSeguro } from './archivos'

export type Formato = 'png' | 'pdf'

export async function exportarDiagrama(svg: SVGSVGElement, formato: Formato, nombreProyecto: string, vista: string): Promise<void> {
  const imagen = await aPNG(svg)
  const nombre = `${nombreSeguro(nombreProyecto)}-${nombreSeguro(vista)}`
  if (formato === 'png') descargar(imagen, `${nombre}.png`)
  else await guardarPDF(imagen, nombreProyecto, vista, `${nombre}.pdf`)
}

/** Propiedades que el SVG toma de las clases CSS y que hay que fijar antes de convertirlo en imagen. */
const PROPIEDADES_SVG = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
]

async function aPNG(svg: SVGSVGElement): Promise<string> {
  const { toPng } = await import('html-to-image')
  // Se monta fuera de la pantalla para que el navegador calcule sus estilos.
  const contenedor = document.createElement('div')
  contenedor.style.cssText = 'position:fixed;left:-100000px;top:0;pointer-events:none'
  document.body.appendChild(contenedor)
  try {
    const copia = svg.isConnected ? copiarConEstilos(svg) : svg
    contenedor.appendChild(copia)
    const ancho = copia.width.baseVal.value
    const alto = copia.height.baseVal.value
    return await toPng(copia as unknown as HTMLElement, { width: ancho, height: alto, pixelRatio: 2 })
  } finally {
    contenedor.remove()
  }
}

/** Clona un SVG de la página fijando como estilo en línea lo que hoy viene de clases CSS. */
function copiarConEstilos(svg: SVGSVGElement): SVGSVGElement {
  const copia = svg.cloneNode(true) as SVGSVGElement
  const originales = [svg, ...svg.querySelectorAll<SVGElement>('*')]
  const copias = [copia, ...copia.querySelectorAll<SVGElement>('*')]
  originales.forEach((original, i) => {
    const estilo = getComputedStyle(original)
    const destino = copias[i]
    if (!destino) return
    for (const propiedad of PROPIEDADES_SVG) destino.style.setProperty(propiedad, estilo.getPropertyValue(propiedad))
  })
  copia.setAttribute('xmlns', 'http://www.w3.org/2000/svg')
  return copia
}

/** PDF horizontal A4 con título, la imagen del diagrama ajustada a la página y la fecha. */
async function guardarPDF(imagen: string, nombreProyecto: string, vista: string, nombreArchivo: string): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
  const ancho = pdf.internal.pageSize.getWidth()
  const alto = pdf.internal.pageSize.getHeight()
  const margen = 14

  pdf.setFont('helvetica', 'bold')
  pdf.setFontSize(16)
  pdf.text(nombreProyecto || 'Proyecto', margen, margen + 2)
  pdf.setFont('helvetica', 'normal')
  pdf.setFontSize(10)
  pdf.setTextColor(110)
  pdf.text(`${vista} · Generado con Senda el ${new Date().toLocaleDateString('es-EC')}`, margen, margen + 8)

  const { width, height } = pdf.getImageProperties(imagen)
  const escala = Math.min((ancho - margen * 2) / width, (alto - margen * 2 - 14) / height)
  pdf.addImage(imagen, 'PNG', margen, margen + 14, width * escala, height * escala)
  pdf.save(nombreArchivo)
}
