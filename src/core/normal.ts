/**
 * Distribución normal estándar, implementada sin librerías.
 *
 * Φ(z) usa el algoritmo de Hart (1968) en la versión de G. West (2005),
 * con precisión cercana a la doble precisión. Es más que suficiente para
 * mostrar probabilidades con 4 decimales, como pide la materia.
 */

const RAIZ_DOS_PI = 2.506628274631

/** Φ(z): probabilidad de que una normal estándar sea ≤ z. */
export function phi(z: number): number {
  const x = Math.abs(z)
  let colaSuperior: number

  if (x > 37) {
    colaSuperior = 0
  } else {
    const exponencial = Math.exp((-x * x) / 2)
    if (x < 7.07106781186547) {
      const numerador = polinomio(x, [
        3.52624965998911e-2, 0.700383064443688, 6.37396220353165, 33.912866078383, 112.079291497871,
        221.213596169931, 220.206867912376,
      ])
      const denominador = polinomio(x, [
        8.83883476483184e-2, 1.75566716318264, 16.064177579207, 86.7807322029461, 296.564248779674,
        637.333633378831, 793.826512519948, 440.413735824752,
      ])
      colaSuperior = (exponencial * numerador) / denominador
    } else {
      // Fracción continua para colas muy lejanas.
      let fraccion = x + 0.65
      fraccion = x + 4 / fraccion
      fraccion = x + 3 / fraccion
      fraccion = x + 2 / fraccion
      fraccion = x + 1 / fraccion
      colaSuperior = exponencial / fraccion / RAIZ_DOS_PI
    }
  }
  // La normal es simétrica: Φ(z) = 1 − Φ(−z).
  return z > 0 ? 1 - colaSuperior : colaSuperior
}

/** Evalúa un polinomio con el método de Horner (coeficientes de mayor a menor grado). */
function polinomio(x: number, coeficientes: number[]): number {
  return coeficientes.reduce((acumulado, c) => acumulado * x + c, 0)
}

/**
 * Φ⁻¹(p): el z tal que Φ(z) = p. Se resuelve por bisección porque Φ es
 * creciente; es simple de entender y converge sin sorpresas.
 */
export function phiInversa(p: number): number {
  if (!(p > 0 && p < 1)) throw new RangeError('La probabilidad debe estar entre 0 y 1 (sin incluirlos).')
  let bajo = -40
  let alto = 40
  for (let i = 0; i < 200 && alto - bajo > 1e-13; i++) {
    const medio = (bajo + alto) / 2
    if (phi(medio) < p) bajo = medio
    else alto = medio
  }
  return (bajo + alto) / 2
}
