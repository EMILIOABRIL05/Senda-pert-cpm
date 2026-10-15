# Senda — Plan de implementación

> **Para agentes:** SUB-SKILL REQUERIDA: superpowers:executing-plans (ejecución nativa). Los pasos usan casillas (`- [ ]`).

**Objetivo:** Aplicación web "Senda" que resuelve problemas de PERT-CPM: tabla de tiempos, holguras, ruta(s) crítica(s), red AOA con ficticias, red AON y diagrama de Gantt.

**Arquitectura:** `src/core` es TypeScript puro (sin React) y concentra todo el cálculo, probado con Vitest. La interfaz React consume un único `useProyecto()` que valida → calcula → construye la red; los componentes solo presentan. Sin backend: `localStorage` + importar/exportar `.json`.

**Stack:** React 19 + TypeScript estricto + Vite, Tailwind CSS v4, @xyflow/react + @dagrejs/dagre, Gantt SVG propio, Vitest, xlsx, html-to-image + jsPDF, vite-plugin-pwa.

**Spec:** `CLAUDE.md` (raíz del repositorio).

## Restricciones globales

- Toda la interfaz, mensajes y comentarios en **español**.
- `src/core` no importa React ni nada de la interfaz.
- Nada de `any`. `npm run test`, `npm run build` (incluye `tsc -b`) y `npm run lint:tipos` pasan antes de cerrar cada fase.
- Tolerancia de comparación: `EPSILON = 1e-9`.
- PERT: `te = (a + 4m + b) / 6`, `σ² = ((b − a) / 6)²`; Z y P con 4 decimales.
- Crítica = holgura total ≈ 0. La ruta crítica no se distingue solo por color (grosor + etiqueta).
- Sin librerías fuera del stack: los iconos son SVG propios.
- Flujo Git: una rama por fase (`feat/…`, `docs/…`), commits atómicos con mensaje convencional en español, PR a `main` fusionado con merge commit.

## Foco de revisión

1. **Precedencias redundantes** (D depende de A y B, y B ya depende de A): la red AOA no debe crear ficticias de más ni perder dependencias → prueba de propiedad con un caso redundante en `aoa.test.ts`.
2. **Varias actividades finales/iniciales con el mismo origen** (rutas paralelas de inicio a fin): requieren ficticia para no tener flechas paralelas → prueba en `aoa.test.ts`.
3. **Nombres con espacios o minúsculas** ("a", " B ") en predecesores: se normalizan con `trim()` y se comparan exactos (distinguiendo mayúsculas); el predecesor escrito con separador `,` o `;` o espacio → prueba en `validacion.test.ts`.
4. **Duración 0** en CPM (hitos): es válida y no rompe la ruta crítica ni la AOA → prueba en `cpm.test.ts`.
5. **`localStorage` lleno, bloqueado o con JSON corrupto**: la app arranca con el proyecto de ejemplo y sigue funcionando → prueba en `persistencia.test.ts`.

---

## Estructura de archivos

```
src/core/tipos.ts           Actividad, Proyecto, ResultadoCPM, FilaCPM, ResultadoPERT, RedAOA, ErrorValidacion
src/core/numeros.ts         EPSILON, iguales(), redondear(), formatear()
src/core/validacion.ts      validarProyecto(), parsearPredecesores(), detectarCiclo()
src/core/grafo.ts           ordenTopologico(), sucesores(), cierreTransitivo(), reduccionTransitiva()
src/core/cpm.ts             calcularCPM(), rutasCriticas()
src/core/normal.ts          phi(), phiInversa()
src/core/pert.ts            tiempoEsperado(), varianza(), calcularPERT(), probabilidadPlazo(), plazoParaConfianza()
src/core/aoa.ts             construirRedAOA(), precedenciasDeAOA()
src/core/analizar.ts        analizarProyecto(): orquesta validación + CPM + PERT + AOA
src/estado/                 proyecto.ts (reducer), persistencia.ts, preferencias.ts, useProyecto.ts
src/componentes/            Encabezado, Logo, iconos, PanelProyecto, TablaEntrada, MensajesError,
                            Resumen, CalculadoraPERT, TablaResultados, Visualizaciones, RedAOA, RedAON, Gantt, ui/*
src/exportar/               imagen.ts, excel.ts, json.ts
src/ejemplos/index.ts       Ejercicios precargados (casos 1–3, PERT clásico, proyecto de software)
```

## Tareas

### Tarea 1: Configuración (rama `feat/configuracion`)
- [x] Vite + React + TS (`strict`, `noUncheckedIndexedAccess`), Tailwind v4 (`@tailwindcss/vite`), Vitest (`environment: node` para core).
- [x] Scripts: `dev`, `build` (`tsc -b && vite build`), `test` (`vitest run`), `lint:tipos` (`tsc -b --noEmit`).
- [x] `.gitignore`, carpetas de la estructura. Verificar: `npm run build` y `npm run test` (con una prueba de humo) pasan.

### Tarea 2: Núcleo CPM/PERT (rama `feat/nucleo-calculo`) — pruebas primero
**Interfaces producidas:**
```ts
type Modo = 'CPM' | 'PERT'
interface Actividad { id: string; nombre: string; predecesores: string; duracion: string; a: string; m: string; b: string }
interface Proyecto { nombre: string; modo: Modo; unidad: string; fechaInicio: string | null; actividades: Actividad[] }
interface ActividadNormalizada { nombre: string; predecesores: string[]; duracion: number; a?: number; m?: number; b?: number; varianza?: number }
interface ErrorValidacion { fila: number | null; campo: 'nombre'|'predecesores'|'duracion'|'tiempos'|'general'; mensaje: string }
function validarProyecto(p: Proyecto): { errores: ErrorValidacion[]; actividades: ActividadNormalizada[] }
interface FilaCPM { nombre; duracion; ic; tc; il; tl; holguraTotal; holguraLibre; critica: boolean;
                    origenIC: string | null; destinoTL: string | null }  // paso a paso
interface ResultadoCPM { filas: FilaCPM[]; duracion: number; rutas: string[][] }
function calcularCPM(acts: ActividadNormalizada[]): ResultadoCPM
function phi(z: number): number; function phiInversa(p: number): number
interface ResultadoPERT { mediaProyecto; varianzaProyecto; desviacion; rutaVarianza: string[]; variasRutas: boolean }
function calcularPERT(acts, cpm): ResultadoPERT
function probabilidadPlazo(t, pert): { z: number; p: number }
function plazoParaConfianza(confianza, pert): { z: number; t: number }
```
- [x] `validacion.test.ts`: caso 5 (ciclo A↔B nombra A y B; predecesor "Z" → error con `fila` correcta; duración −1 → error), nombres vacíos/repetidos, autopredecesor, `a ≤ m ≤ b`, foco #3.
- [x] `cpm.test.ts`: caso 1 (12; A-B-D; filas exactas; C holgura 2), caso 2 (9; A-C-E y B-D-E; holguras 0), caso 3 (6; A-C; B y D holgura 1), holgura libre, foco #4, `origenIC`/`destinoTL`.
- [x] `pert.test.ts` / `normal.test.ts`: caso 4 (te 3, σ² 0.1111; P(Te)=0.5000; Φ(1.96)=0.9750, Φ(−1)=0.1587, Φ(0)=0.5000), inversa Φ⁻¹(0.975)≈1.96, elección de ruta de mayor varianza.
- [x] Implementar. `phi` con aproximación de erf de alta precisión (error < 1e-7); `phiInversa` por bisección sobre `phi`. Rutas críticas: DFS desde críticas con IC=0 siguiendo sucesores críticos con TC(x)=IC(y) hasta TC=duración.
- [x] Commits separados: tipos+numeros, validación, grafo+CPM, normal+PERT.

### Tarea 3: Red AOA (rama `feat/red-aoa`)
```ts
interface NodoAOA { id: number; te: number; tl: number }
interface FlechaAOA { desde: number; hasta: number; actividad: string | null; duracion: number; critica: boolean; ficticia: boolean }
interface RedAOA { nodos: NodoAOA[]; flechas: FlechaAOA[]; ficticias: number }
function construirRedAOA(acts: ActividadNormalizada[], cpm: ResultadoCPM): RedAOA
function precedenciasDeAOA(red: RedAOA): Map<string, Set<string>>   // alcanzabilidad actividad→actividad
```
Algoritmo (la corrección manda sobre el mínimo):
1. Reducción transitiva de las precedencias.
2. Nodo inicio; un nodo fin `F(x)` por actividad; un nodo `N(S)` por cada conjunto distinto de predecesores (S vacío → inicio). Flecha de x desde `N(pred(x))` hasta `F(x)`; ficticia `F(p) → N(S)` por cada p ∈ S; ficticia `F(x) → fin` si x no tiene sucesores.
3. Repetir hasta estabilizar: (a) borrar ficticias redundantes (existe otro camino); (b) contraer ficticia u→v si v tiene esa única entrada, o si u tiene esa única salida, **siempre que no queden dos actividades con el mismo par (origen, destino)**; (c) deduplicar ficticias.
4. Numerar en orden topológico (inicio = 1). TE/TL de eventos con pasos adelante/atrás sobre las flechas.
- [x] `aoa.test.ts`: caso 1 (1 ficticia), caso 3 (≥1 ficticia), propiedad: `precedenciasDeAOA` = cierre transitivo de lo ingresado para casos 1–3, focos #1 y #2 y un proyecto de 10 actividades; inicio y fin únicos; `desde < hasta` en toda flecha.

### Tarea 4: Interfaz base (rama `feat/interfaz-base`)
- [x] Tokens de diseño en `index.css` (claro/oscuro, acentos: azul, índigo, verde, grafito), tipografía del sistema, componentes `ui/` (Boton, ControlSegmentado, Tarjeta).
- [x] `estado/proyecto.ts` reducer: `agregar`, `eliminar`, `mover`, `editar`, `cambiarModo`, `cargar`, `renombrar`, `cambiarUnidad`, `cambiarFecha`. `analizar.ts` + `useProyecto`.
- [x] Encabezado con logo, menú de ejemplos, selector de tema; PanelProyecto; TablaEntrada (teclado: Enter agrega fila); MensajesError (fila señalada en la tabla); Resumen; TablaResultados.

### Tarea 5: Visualizaciones (rama `feat/visualizaciones`)
- [x] RedAOA (React Flow + dagre LR; eventos circulares con número, TE y TL; ficticias punteadas; críticas rojas y gruesas con etiqueta), RedAON (tarjetas con IC/TC/IL/TL/H), Gantt SVG (barras IC→TC, crítica roja + patrón, holgura clara, fechas opcionales, zoom). Pestañas accesibles (`role="tablist"`, flechas).

### Tarea 6: Extras (rama `feat/paso-a-paso-pert`)
- [x] Modo paso a paso en TablaResultados (IC = máx{…} ← predecesor; TL = mín{…} ← sucesor). CalculadoraPERT: P(T ≤ plazo) y plazo para una confianza, con curva normal sombreada.

### Tarea 7: Persistencia y exportación (rama `feat/persistencia-exportacion`)
- [x] `persistencia.ts` (try/catch, versión de esquema, foco #5 con prueba), importar/exportar `.json` con validación de forma, Excel de resultados, PNG/PDF de red y Gantt.

### Tarea 8: PWA y pulido (rama `feat/pwa-pulido`)
- [x] vite-plugin-pwa (manifest, iconos PNG generados por `scripts/generar-iconos.mjs`), responsive, foco visible, `prefers-reduced-motion`, revisión visual en navegador en claro/oscuro y móvil.

### Tarea 9: Despliegue y README (rama `docs/readme-despliegue`)
- [x] Workflow de GitHub Pages (`base: '/Senda-pert-cpm/'`), README con uso, capturas y fórmulas.
