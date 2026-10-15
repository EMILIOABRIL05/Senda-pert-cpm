/** Utilidades comunes para descargar archivos generados en el navegador. */

export function descargar(contenido: Blob | string, nombreArchivo: string): void {
  const url = typeof contenido === 'string' ? contenido : URL.createObjectURL(contenido)
  const enlace = document.createElement('a')
  enlace.href = url
  enlace.download = nombreArchivo
  document.body.appendChild(enlace)
  enlace.click()
  enlace.remove()
  if (typeof contenido !== 'string') setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/** "Ejercicio de clase" → "ejercicio-de-clase" (sin tildes ni símbolos). */
export function nombreSeguro(texto: string): string {
  const limpio = texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return limpio || 'proyecto'
}
