# Proyecto: Planificador PERT-CPM

## Qué es
Aplicación web para resolver problemas de **Modelo de Diseño y Programación de Redes: PERT-CPM, Ruta Crítica y Diagrama de Gantt**, de la asignatura Investigación Operativa (UTA, Ecuador).

- **Usuarios:** estudiantes y docentes.
- **Objetivo:** ingresar las actividades de un proyecto y obtener, de forma correcta y clara, la tabla de tiempos, las holguras, la ruta crítica, el diagrama de red y el diagrama de Gantt.
- **Idioma:** toda la interfaz, los mensajes y los comentarios del código en **español**.
- **Prioridad número uno:** que los cálculos sean **correctos**. Una interfaz bonita que calcula mal no sirve.

## Stack (no cambiar sin preguntar)
- **React + TypeScript (modo estricto) + Vite**
- **Tailwind CSS** para estilos
- **@xyflow/react (React Flow) + dagre** para el diagrama de red
- **Gantt:** componente propio en SVG
- **Vitest** para pruebas unitarias
- **SheetJS (xlsx)** para exportar a Excel; **html-to-image + jsPDF** para PNG y PDF
- **PWA** (vite-plugin-pwa): instalable en celular y funciona sin internet
- **Sin backend ni base de datos.** Persistencia con `localStorage` (guardado automático) y exportar/importar proyecto como `.json`
- Despliegue: Vercel o GitHub Pages

## Estructura de carpetas
```
src/
  core/            # Lógica pura, SIN React. Todo lo matemático vive aquí.
    tipos.ts       # Tipos: Actividad, Proyecto, ResultadoCPM, ResultadoPERT, RedAOA...
    validacion.ts  # Detección de errores en los datos
    cpm.ts         # Ordenamiento topológico, pasos adelante/atrás, holguras
    pert.ts        # te, varianza, desviación, probabilidad (normal)
    aoa.ts         # Conversión a red de flechas (AOA) con actividades ficticias
    normal.ts      # Función de distribución normal estándar (implementación propia)
  core/__tests__/  # Pruebas de todo lo anterior
  componentes/     # Interfaz: TablaEntrada, TablaResultados, RedAON, RedAOA, Gantt, Resumen
  estado/          # Estado del proyecto + persistencia en localStorage
  exportar/        # PNG, PDF, Excel, JSON
  ejemplos/        # Ejercicios precargados
```
Regla: `src/core` no importa nada de React ni de la interfaz. Se debe poder probar por sí solo.

## Reglas del dominio (usar exactamente estas definiciones)

### Datos de entrada
- Cada actividad tiene: **nombre** (único, ej. A, B, C), **predecesores** (lista de nombres, puede estar vacía) y duración.
- **Modo CPM:** una duración determinística por actividad.
- **Modo PERT:** tres tiempos: optimista `a`, más probable `m`, pesimista `b`, con `a ≤ m ≤ b`.
- Unidad de tiempo configurable (días por defecto).

### CPM
- **Paso hacia adelante:** IC = máx(TC de los predecesores), o 0 si no tiene predecesores. TC = IC + duración.
- **Duración del proyecto** = máx(TC) de todas las actividades.
- **Paso hacia atrás:** TL = mín(IL de los sucesores), o la duración del proyecto si no tiene sucesores. IL = TL − duración.
- **Holgura total** = IL − IC = TL − TC.
- **Holgura libre** = mín(IC de los sucesores) − TC (o duración del proyecto − TC si no tiene sucesores).
- **Actividad crítica:** holgura total = 0 (comparar con tolerancia 1e-9 por los decimales de PERT).
- **Ruta crítica:** puede haber **más de una**. Mostrar todas las rutas críticas completas (ej. A-B-D).

### PERT
- Tiempo esperado: `te = (a + 4m + b) / 6`
- Varianza: `σ² = ((b − a) / 6)²`
- El CPM se corre con `te` como duración.
- Varianza del proyecto = suma de las varianzas de las actividades de la ruta crítica. Si hay varias rutas críticas, usar la de **mayor varianza** e indicarlo en pantalla.
- Probabilidad de terminar en un plazo T: `Z = (T − Te) / σ_proyecto`, `P = Φ(Z)`.
- También el cálculo inverso: dado un porcentaje de confianza, qué plazo se necesita.
- Mostrar Z y P con 4 decimales.

### Validaciones (mensajes claros en español, señalando la fila con error)
- Nombres vacíos o repetidos.
- Predecesor que no existe.
- Actividad que es su propio predecesor.
- **Ciclos** en las precedencias (indicar cuáles actividades forman el ciclo).
- Duraciones vacías, negativas o no numéricas.
- En PERT: que no se cumpla `a ≤ m ≤ b`.
- No calcular nada mientras haya errores.

### Red AOA (actividades en las flechas) con actividades ficticias
Es la representación que se usa en clase y la parte más delicada del proyecto.
- Nodos = eventos numerados en orden (un nodo inicial y un nodo final únicos; la numeración respeta que el origen de una flecha tenga número menor que su destino).
- Flechas = actividades, con etiqueta "nombre = duración".
- **Actividad ficticia** (duración 0, flecha punteada) cuando:
  1. Dos actividades tendrían el mismo nodo de inicio y el mismo nodo de fin.
  2. Los conjuntos de predecesores se traslapan parcialmente (ej. C depende de A; D depende de A y B).
- Minimizar el número de ficticias, pero **la corrección es más importante que el mínimo**.
- **Verificación obligatoria:** la relación de precedencia que expresa la red AOA (alcanzabilidad entre actividades) debe ser exactamente igual a la ingresada, sin dependencias de más ni de menos. Esto debe estar cubierto por pruebas.
- Mostrar en cada nodo el tiempo más próximo (TE) y el más lejano (TL).

### Red AON (actividades en los nodos)
- Vista alternativa: cada nodo muestra nombre, duración, IC, TC, IL, TL y holgura.
- Acomodo automático de izquierda a derecha con dagre.

### Gantt
- Una barra por actividad desde IC hasta TC, sobre una línea de tiempo con escala.
- Críticas en rojo; no críticas en otro color, con la holgura total como barra clara a continuación.
- Opción de fecha de inicio real del proyecto para mostrar fechas (por defecto, solo números de día).

## Funcionalidades de la interfaz
1. **Tabla de entrada editable:** agregar, eliminar y reordenar actividades; selector CPM/PERT.
2. **Botón "Cargar ejemplo"** con los ejercicios de `src/ejemplos/`.
3. **Resultados:** tabla con duración (o a, m, b, te, σ²), IC, TC, IL, TL, holgura total, holgura libre y marca de crítica.
4. **Resumen:** duración total, ruta(s) crítica(s) y, en PERT, desviación del proyecto y calculadora de probabilidad.
5. **Pestañas de visualización:** Red AOA (principal), Red AON y Gantt. Los diagramas permiten zoom y desplazamiento.
6. **Modo "paso a paso"** (didáctico): muestra cómo se calculó cada IC (qué predecesor dio el máximo) y cada TL (qué sucesor dio el mínimo).
7. **Exportar:** red y Gantt como PNG/PDF; tabla de resultados a Excel; proyecto completo a `.json`. **Importar** `.json`.
8. **Guardado automático** en `localStorage` (envuelto en try/catch; si falla, la app sigue funcionando).
9. **Diseño responsive:** usable en celular, aunque la experiencia principal es en laptop.
10. **Accesibilidad:** buen contraste, navegación con teclado, la ruta crítica no se distingue solo por color (también por grosor o etiqueta).

## Casos de prueba obligatorios (Vitest)

### Caso 1 — CPM con ficticia (ejercicio de clase)
| Actividad | Predecesores | Duración |
|---|---|---|
| A | — | 3 |
| B | A | 4 |
| C | A | 2 |
| D | B, C | 5 |

Esperado:
- Duración del proyecto = **12**
- Ruta crítica = **A-B-D**
- A: IC 0, TC 3, IL 0, TL 3, holgura 0
- B: IC 3, TC 7, IL 3, TL 7, holgura 0
- C: IC 3, TC 5, IL 5, TL 7, holgura **2**
- D: IC 7, TC 12, IL 7, TL 12, holgura 0
- Red AOA: **1 actividad ficticia** (B y C salen del mismo nodo y ambas deben preceder a D)

### Caso 2 — Dos rutas críticas
| Actividad | Predecesores | Duración |
|---|---|---|
| A | — | 3 |
| B | — | 3 |
| C | A | 2 |
| D | B | 2 |
| E | C, D | 4 |

Esperado: duración = **9**; rutas críticas **A-C-E** y **B-D-E**; todas las holguras = 0.

### Caso 3 — Traslape parcial de predecesores
| Actividad | Predecesores | Duración |
|---|---|---|
| A | — | 2 |
| B | — | 3 |
| C | A | 4 |
| D | A, B | 2 |

Esperado: duración = **6**; ruta crítica **A-C**; holgura de B = 1, de D = 1. Red AOA con al menos una ficticia y precedencias equivalentes a las ingresadas.

### Caso 4 — PERT
- Actividad con a=2, m=3, b=4 → te = **3**, σ² = **0.1111** (4 decimales).
- Para cualquier proyecto: P(T ≤ Te) = **0.5000**.
- Φ(1.96) ≈ **0.9750**, Φ(−1) ≈ **0.1587**, Φ(0) = **0.5000**.

### Caso 5 — Validaciones
- A con predecesor B y B con predecesor A → error de **ciclo** que nombra A y B.
- Predecesor "Z" inexistente → error en la fila correspondiente.
- Duración −1 → error.

### Pruebas de propiedad para AOA
Para varios proyectos (incluidos los casos 1 a 3), verificar que la alcanzabilidad entre actividades en la red AOA es idéntica a la de las precedencias ingresadas.

## Plan de trabajo por fases
Trabajar **una fase a la vez**. Al terminar cada una: correr las pruebas, mostrar un resumen corto de lo hecho y **esperar confirmación antes de seguir**.

1. **Configuración:** Vite + React + TS + Tailwind + Vitest. Estructura de carpetas.
2. **Núcleo de cálculo:** `tipos`, `validacion`, `cpm`, `pert`, `normal` con todas sus pruebas (casos 1, 2, 4 y 5). **Primero las pruebas, luego el código.**
3. **Red AOA:** `aoa.ts` con ficticias y pruebas (casos 1 y 3 y propiedades).
4. **Interfaz base:** tabla de entrada, ejemplos, tabla de resultados, resumen, mensajes de error.
5. **Visualizaciones:** Red AOA, Red AON y Gantt.
6. **Extras:** modo paso a paso, calculadora de probabilidad PERT.
7. **Persistencia y exportación:** localStorage, JSON, Excel, PNG/PDF.
8. **PWA, pulido visual, accesibilidad y responsive.**
9. **Despliegue** y README con instrucciones de uso.

## Reglas de calidad
- `npm run test`, `npm run build` y el chequeo de tipos deben pasar sin errores antes de dar una fase por terminada.
- Nunca dar por correcto un cálculo sin una prueba que lo respalde.
- Funciones pequeñas, con nombres en español y comentarios que expliquen el *porqué*, pensando en que un estudiante lea el código.
- Nada de `any` en TypeScript.
- No agregar librerías fuera del stack sin preguntar primero.
- Si una regla de este documento es ambigua o choca con otra, **preguntar** en vez de suponer.
