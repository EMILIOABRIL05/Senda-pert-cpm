# Auditoría Académica, Solución Manual y Documentación del Proyecto Final — Senda PERT-CPM

**Universidad:** Universidad Técnica de Ambato (UTA)  
**Asignatura:** Investigación Operativa  
**Proyecto:** Senda — Planificador de proyectos con PERT, CPM, Ruta Crítica y Diagrama de Gantt  
**Repositorio:** https://github.com/EMILIOABRIL05/Senda-pert-cpm  
**Aplicación desplegada:** https://emilioabril05.github.io/Senda-pert-cpm/  
**Bibliografía base:** Taha, H. A. (2017). *Investigación de operaciones* (10.ª ed.). Pearson Educación.

---

## 1. Registro de Avance

| Tarea | Estado | Archivos afectados | Pruebas | Observaciones |
|---|---|---|---|---|
| Auditoría | Verificado | Repositorio completo (`src/`, `README.md`) | `npm test` (97/97) | Se verificó el motor matemático CPM, PERT, distribución normal y red AOA. |
| Notación CPM | Verificado | `src/core/aoa.ts`, `src/componentes/TablaResultados.tsx`, `src/App.tsx` | `src/core/__tests__/aoa.test.ts` | Tabla de resultados actualizada con `Actividad`, `Duración`, `Ei`, `Lj`, `h`, `Estado` e inclusión de `Ficticia 1, Ficticia 2...` sin marcarlas como ruta crítica. |
| Notación PERT | Verificado | `src/componentes/TablaResultados.tsx`, `src/exportar/excel.ts` | `src/core/__tests__/pert.test.ts` | Presenta `a`, `m`, `b`, `te`, `σ²`, `Ei`, `Lj`, `h`, `Estado` conforme a Taha (2017). |
| Cálculo Z | Verificado | `src/core/pert.ts`, `src/core/normal.ts`, `src/componentes/CalculadoraPERT.tsx` | `src/core/__tests__/pert.test.ts` | Cálculo directo $Z = (T - T_e)/\sigma$, inverso $T = T_e + Z\cdot\sigma$, y manejo seguro de $\sigma = 0$. |
| Exportaciones | Verificado | `src/exportar/excel.ts`, `src/componentes/MenuArchivo.tsx` | `npm run build` | Exportación a Excel sincronizada con las columnas `Ei`, `Lj`, `h` y las actividades ficticias. |
| Corrección UI Interruptor | Verificado | `src/componentes/ui/Interruptor.tsx` | `npm run build` | Corrección de posicionamiento (`left-0` y `shrink-0`) para evitar superposición del círculo sobre el texto «Paso a paso». |
| Casos académicos y solución manual | Verificado | `docs/INFORME_ACADEMICO_Y_AUDITORIA.md`, `src/core/__tests__/` | `npm test` | Tres casos experimentales documentados y contrastados con solución analítica paso a paso. |
| Informe APA y presentación | Verificado | `docs/INFORME_ACADEMICO_Y_AUDITORIA.md` | Revisión documental | Guía estructurada con las 12 secciones APA 7, declaración de IA y estructura de exposición. |

---

## 2. Diagnóstico de Cumplimiento frente al Documento del Docente

| Requisito del docente | Estado | Evidencia | Problema detectado | Acción necesaria |
|---|---|---|---|---|
| Ingreso y validación de actividades, predecesores, duraciones y ciclos | Cumple | `src/core/validacion.ts`, `src/core/__tests__/validacion.test.ts` (17 pruebas) | Ninguno; detecta ciclos, nombres duplicados, predecesores inexistentes y $a \le m \le b$. | Mantener sin cambios. |
| Tabla de resultados CPM con notación de clase ($E_i, L_j, h$) y actividades ficticias | Cumple | `src/componentes/TablaResultados.tsx`, `src/core/aoa.ts` (`filasResultadosAOA`) | Antes mostraba `IC, TC, IL, TL, HT, HL` y omitía las actividades ficticias en la tabla. | Corregido: muestra `Actividad`, `Duración`, `Ei`, `Lj`, `h`, `Estado` e incluye `Ficticia 1, Ficticia 2...` como no críticas. |
| Tabla de resultados PERT según Taha ($a, m, b, t_e, \sigma^2, E_i, L_j, h$) | Cumple | `src/componentes/TablaResultados.tsx`, `src/core/pert.ts` | Requería unificar las columnas de tiempos con `Ei`, `Lj`, `h` e incluir las ficticias. | Corregido en `TablaResultados.tsx` y `excel.ts`. |
| Construcción de red AOA con actividades ficticias y preservación de precedencias | Cumple | `src/core/aoa.ts`, `src/core/__tests__/aoa.test.ts` (pruebas en casos de clase + 300 redes aleatorias) | Ninguno en el algoritmo; preserva exactamente el cierre transitivo. | Se añadió prueba unitaria para `filasResultadosAOA`. |
| Cálculo probabilístico PERT ($Z$, $\Phi(Z)$, plazo inverso y caso $\sigma = 0$) | Cumple | `src/core/pert.ts`, `src/core/normal.ts`, `src/componentes/CalculadoraPERT.tsx` | Ninguno; maneja $\sigma < 10^{-9}$ sin división por cero y múltiples rutas críticas eligiendo la de mayor varianza. | Documentado en el análisis crítico y en el informe. |
| Coherencia visual del interruptor «Paso a paso» | Cumple | `src/componentes/ui/Interruptor.tsx` | El círculo blanco carecía de `left-0` y se desplazaba sobre el texto «Paso a paso». | Corregido con `left-0` y `shrink-0`. |
| Coherencia entre interfaz y exportación a Excel | Cumple | `src/exportar/excel.ts`, `src/componentes/MenuArchivo.tsx` | Excel exportaba los encabezados antiguos sin las actividades ficticias. | Corregido para exportar `Ei`, `Lj`, `h`, `Estado` y las actividades ficticias. |
| Solución manual analítica paso a paso | Cumple | Sección 3 (Paso 3) de este documento | Faltaba documentar las sustituciones manuales completas para el informe. | Documentado paso a paso en este archivo; el equipo debe transcribirlo/validarlo en su entrega final. |
| Tres casos experimentales y matriz de contrastación | Cumple | Sección 3 (Pasos 5 y 6) de este documento y suite Vitest | Faltaba la matriz formal comparando resultado manual vs. resultado de Senda. | Completado con valores reales verificados y diferencia `0`. |
| Informe final en Word (APA 7, 12 secciones) y presentación formal | Cumple parcialmente | Sección 4 y Sección 5 de este documento | La redacción del documento `.docx` con editor de ecuaciones de Word y la defensa oral dependen del equipo. | Se entrega la estructura completa de las 12 secciones, ecuaciones numeradas y declaración de IA lista para pasar a Word. |

---

## 3. Desarrollo de los Siete Pasos del Componente Práctico Experimental

### Paso 1. Planteamiento del problema

1. **Contexto del problema:**  
   El desarrollo y lanzamiento de una aplicación de software («Lanzamiento de una app» / módulos de ingeniería de software) requiere coordinar actividades secuenciales y paralelas de levantamiento de requisitos, diseño de arquitectura, diseño de interfaz, desarrollo de backend y frontend, integración, pruebas, documentación y publicación.
2. **Justificación de PERT-CPM:**  
   - Cuando las duraciones se conocen con certeza determinística (contratos o actividades estandarizadas), el **Método de la Ruta Crítica (CPM)** permite determinar la duración mínima del proyecto e identificar qué actividades no admiten retraso ($h = 0$).
   - Cuando existe incertidumbre en la duración de las tareas de desarrollo y pruebas, la **Técnica de Evaluación y Revisión de Proyectos (PERT)** modela cada actividad mediante tres estimaciones ($a$: optimista, $m$: más probable, $b$: pesimista) para estimar la probabilidad de cumplir un plazo objetivo $T$.
3. **Supuestos y restricciones del modelo:**
   - Las actividades son tecnológicamente bien definidas y el grafo de precedencias es un grafo acíclico dirigido (DAG).
   - Una actividad no puede iniciar hasta que todas sus actividades predecesoras inmediatas hayan finalizado (relación Fin-Inicio).
   - En PERT se asume que las duraciones siguen una distribución Beta aproximada por los tres tiempos $(a, m, b)$, que las actividades son estadísticamente independientes y que la duración total sobre la ruta crítica se aproxima mediante una distribución normal $\mathcal{N}(T_e, \sigma^2)$ por el Teorema Central del Límite (Taha, 2017).

---

### Paso 2. Modelo matemático o técnico (Taha, 2017)

Sea $G = (V, A)$ una red de proyecto en representación de actividades en las flechas (**AOA**), donde $V = \{1, 2, \dots, n\}$ es el conjunto de eventos (nodos) numerados topológicamente ($i < j$ para toda flecha $i \to j$) y $A$ es el conjunto de actividades (reales y ficticias).

1. **Paso hacia adelante (tiempos más tempranos de los eventos, $E_i$):**
   $$E_1 = 0 \tag{1}$$
   $$E_j = \max_{i \in P(j)} \{ E_i + d_{ij} \}, \quad j = 2, \dots, n \tag{2}$$
   donde $d_{ij}$ es la duración de la actividad $(i, j)$ y $P(j)$ es el conjunto de eventos iniciales de las flechas que entran al evento $j$. La duración total del proyecto es $T_{\text{proy}} = E_n$.

2. **Paso hacia atrás (tiempos más tardíos de los eventos, $L_j$):**
   $$L_n = E_n \tag{3}$$
   $$L_i = \min_{j \in S(i)} \{ L_j - d_{ij} \}, \quad i = n-1, \dots, 1 \tag{4}$$
   donde $S(i)$ es el conjunto de eventos finales de las flechas que salen del evento $i$.

3. **Holgura total de cada actividad ($h$ o $H_{ij}$):**
   $$h_{ij} = L_j - E_i - d_{ij} \tag{5}$$

4. **Condición de criticidad y actividades ficticias:**
   - Una actividad **real** es crítica si y solo si $h_{ij} = 0$. Una **ruta crítica** es una cadena continua de actividades críticas desde el evento inicial hasta el evento final cuya suma de duraciones es igual a $E_n$.
   - Una **actividad ficticia** tiene duración $d_{ij} = 0$ y se introduce exclusivamente para preservar relaciones de precedencia o evitar flechas paralelas entre el mismo par de eventos $(i, j)$. Su holgura se calcula como $h_{ij} = L_j - E_i$, pero por definición no es una tarea física y no se incluye como actividad de la ruta crítica.

5. **Extensión probabilística PERT:**
   Para cada actividad con tiempo optimista $a$, más probable $m$ y pesimista $b$ ($a \le m \le b$):
   $$t_e = \frac{a + 4m + b}{6} \tag{6}$$
   $$\sigma^2 = \left(\frac{b - a}{6}\right)^2, \quad \sigma = \frac{b - a}{6} \tag{7}$$
   Para la ruta crítica $RC$ (eligiendo la de mayor varianza si existen múltiples rutas críticas):
   $$T_e = \sum_{(i,j) \in RC} t_{e,ij}, \quad \sigma^2_{\text{proy}} = \sum_{(i,j) \in RC} \sigma^2_{ij}, \quad \sigma_{\text{proy}} = \sqrt{\sigma^2_{\text{proy}}} \tag{8}$$
   Para un plazo objetivo $T$:
   $$Z = \frac{T - T_e}{\sigma_{\text{proy}}}, \quad P(\text{Duración} \le T) \approx \Phi(Z) \tag{9}$$
   Y para un nivel de confianza deseado $P \in (0, 1)$:
   $$T = T_e + \Phi^{-1}(P)\cdot \sigma_{\text{proy}} \tag{10}$$

---

### Paso 3. Solución manual o analítica (Paso a Paso)

#### 3.1. Desarrollo manual del Caso 1 (CPM con actividad ficticia — Ejercicio de clase)

**Datos de entrada:**
- $A$: sin predecesores, $d_A = 3$
- $B$: predecesor $A$, $d_B = 4$
- $C$: predecesor $A$, $d_C = 2$
- $D$: predecesores $B, C$, $d_D = 5$

**Construcción de la red AOA:**
Como $B$ y $C$ comparten el mismo predecesor ($A$) y ambas preceden a $D$, no pueden compartir simultáneamente el mismo evento inicial y final. Por tanto:
- $A$: evento $1 \to 2$ ($d_{1,2} = 3$)
- $C$: evento $2 \to 3$ ($d_{2,3} = 2$)
- $B$: evento $2 \to 4$ ($d_{2,4} = 4$)
- $\text{Ficticia 1}$: evento $3 \to 4$ ($d_{3,4} = 0$)
- $D$: evento $4 \to 5$ ($d_{4,5} = 5$)

**Paso hacia adelante ($E_j = \max(E_i + d_{ij})$):**
- Evento 1: $E_1 = 0$
- Evento 2: $E_2 = E_1 + d_A = 0 + 3 = 3$
- Evento 3: $E_3 = E_2 + d_C = 3 + 2 = 5$
- Evento 4: $E_4 = \max\{ E_2 + d_B,\; E_3 + d_{\text{Ficticia 1}} \} = \max\{ 3 + 4,\; 5 + 0 \} = \max\{7, 5\} = 7$
- Evento 5: $E_5 = E_4 + d_D = 7 + 5 = 12$  
$\Rightarrow$ **Duración del proyecto:** $12$ días.

**Paso hacia atrás ($L_i = \min(L_j - d_{ij})$):**
- Evento 5: $L_5 = E_5 = 12$
- Evento 4: $L_4 = L_5 - d_D = 12 - 5 = 7$
- Evento 3: $L_3 = L_4 - d_{\text{Ficticia 1}} = 7 - 0 = 7$
- Evento 2: $L_2 = \min\{ L_4 - d_B,\; L_3 - d_C \} = \min\{ 7 - 4,\; 7 - 2 \} = \min\{3, 5\} = 3$
- Evento 1: $L_1 = L_2 - d_A = 3 - 3 = 0$

**Cálculo de holguras ($h = L_j - E_i - d_{ij}$):**
- $A\;(1 \to 2)$: $E_1 = 0,\; L_2 = 3,\; d = 3 \implies h_A = 3 - 0 - 3 = 0$ (**Crítica**)
- $B\;(2 \to 4)$: $E_2 = 3,\; L_4 = 7,\; d = 4 \implies h_B = 7 - 3 - 4 = 0$ (**Crítica**)
- $C\;(2 \to 3)$: $E_2 = 3,\; L_3 = 7,\; d = 2 \implies h_C = 7 - 3 - 2 = 2$ (Holgura de 2)
- $D\;(4 \to 5)$: $E_4 = 7,\; L_5 = 12,\; d = 5 \implies h_D = 12 - 7 - 5 = 0$ (**Crítica**)
- $\text{Ficticia 1}\;(3 \to 4)$: $E_3 = 5,\; L_4 = 7,\; d = 0 \implies h_{\text{Ficticia 1}} = 7 - 5 - 0 = 2$ (Holgura de 2, no forma parte de la ruta crítica)

**Ruta crítica:** $A \to B \to D$ (duración = $3 + 4 + 5 = 12$ días).

---

#### 3.2. Desarrollo manual del Caso 2 (Rutas paralelas, múltiples rutas críticas y traslape con ficticias)

**Subcaso 2A — Dos rutas críticas paralelas:**
- $A$ (sin pred., $d=3$), $B$ (sin pred., $d=3$), $C$ (pred. $A$, $d=2$), $D$ (pred. $B$, $d=2$), $E$ (pred. $C, D$, $d=4$).
- Eventos AOA:
  - $A: 1 \to 2$ ($d=3$), $B: 1 \to 3$ ($d=3$), $C: 2 \to 4$ ($d=2$), $D: 3 \to 4$ ($d=2$), $E: 4 \to 5$ ($d=4$).
- Paso adelante: $E_1 = 0,\; E_2 = 3,\; E_3 = 3,\; E_4 = \max(3+2, 3+2) = 5,\; E_5 = 5+4 = 9$.
- Paso atrás: $L_5 = 9,\; L_4 = 5,\; L_3 = 3,\; L_2 = 3,\; L_1 = 0$.
- Holguras: todas $h = 0$. **Dos rutas críticas:** $A \to C \to E$ y $B \to D \to E$ (duración = $9$).

**Subcaso 2B — Traslape parcial de predecesores con ficticia:**
- $A$ (sin pred., $d=2$), $B$ (sin pred., $d=3$), $C$ (pred. $A$, $d=4$), $D$ (pred. $A, B$, $d=2$).
- Como $C$ depende solo de $A$, pero $D$ depende de $A$ y $B$, del evento fin de $A$ (evento 2, $E_2 = 2$) sale $C$ ($2 \to 4$, $d=4$) y una **Ficticia 1** ($2 \to 3$, $d=0$) hacia el evento donde termina $B$ ($1 \to 3$, $d=3$, $E_3 = \max(3, 2+0) = 3$), desde el cual sale $D$ ($3 \to 4$, $d=2$).
- Duración total: $E_4 = \max(2+4, 3+2) = 6$.
- Tiempos tardíos: $L_4 = 6,\; L_3 = 6 - 2 = 4,\; L_2 = \min(6 - 4, 4 - 0) = 2,\; L_1 = 0$.
- Holguras:
  - $A\;(1 \to 2)$: $E_1=0, L_2=2, d=2 \implies h_A = 0$ (**Crítica**)
  - $B\;(1 \to 3)$: $E_1=0, L_3=4, d=3 \implies h_B = 4 - 0 - 3 = 1$
  - $C\;(2 \to 4)$: $E_2=2, L_4=6, d=4 \implies h_C = 6 - 2 - 4 = 0$ (**Crítica**)
  - $D\;(3 \to 4)$: $E_3=3, L_4=6, d=2 \implies h_D = 6 - 3 - 2 = 1$
  - $\text{Ficticia 1}\;(2 \to 3)$: $E_2=2, L_3=4, d=0 \implies h_{\text{Ficticia 1}} = 4 - 2 - 0 = 2$
- **Ruta crítica:** $A \to C$ (duración = $6$).

---

#### 3.3. Desarrollo manual del Caso 3 (Caso límite PERT — Lanzamiento de una app y análisis probabilístico)

**Datos de entrada (Ejemplo precargado «Lanzamiento de una app»):**

| Actividad | Predecesores | $a$ | $m$ | $b$ | $t_e = \frac{a+4m+b}{6}$ | $\sigma^2 = \left(\frac{b-a}{6}\right)^2$ |
|---|---|---|---|---|---|---|
| A | — | 2 | 4 | 6 | $(2+16+6)/6 = 4$ | $((6-2)/6)^2 = 16/36 \approx 0.4444$ |
| B | A | 3 | 5 | 9 | $(3+20+9)/6 = 5.3333$ | $((9-3)/6)^2 = 36/36 = 1$ |
| C | A | 2 | 3 | 6 | $(2+12+6)/6 = 3.3333$ | $((6-2)/6)^2 = 16/36 \approx 0.4444$ |
| D | B | 8 | 12 | 20 | $(8+48+20)/6 = 12.6667$ | $((20-8)/6)^2 = 144/36 = 4$ |
| E | B, C | 6 | 10 | 14 | $(6+40+14)/6 = 10$ | $((14-6)/6)^2 = 64/36 \approx 1.7778$ |
| F | D, E | 3 | 4 | 7 | $(3+16+7)/6 = 4.3333$ | $((7-3)/6)^2 = 16/36 \approx 0.4444$ |
| G | F | 2 | 4 | 8 | $(2+16+8)/6 = 4.3333$ | $((8-2)/6)^2 = 36/36 = 1$ |
| H | E | 1 | 2 | 3 | $(1+8+3)/6 = 2$ | $((3-1)/6)^2 = 4/36 \approx 0.1111$ |
| I | G, H | 1 | 1 | 2 | $(1+4+2)/6 = 1.1667$ | $((2-1)/6)^2 = 1/36 \approx 0.0278$ |

**Cálculo de la ruta crítica y parámetros del proyecto:**
- Ruta crítica: $A \to B \to D \to F \to G \to I$
- Duración esperada del proyecto ($T_e$):
  $$T_e = 4 + \frac{16}{3} + \frac{38}{3} + \frac{13}{3} + \frac{13}{3} + \frac{7}{6} = 31.8333\text{ días}$$
- Varianza del proyecto sobre la ruta crítica ($\sigma^2_{\text{proy}}$):
  $$\sigma^2_{\text{proy}} = \frac{16}{36} + 1 + 4 + \frac{16}{36} + 1 + \frac{1}{36} = \frac{249}{36} = 6.9167$$
- Desviación estándar del proyecto ($\sigma_{\text{proy}}$):
  $$\sigma_{\text{proy}} = \sqrt{6.9167} \approx 2.6299\text{ días}$$

**Cálculo de probabilidad para un plazo $T = 35$ días:**
$$Z = \frac{35 - 31.8333}{2.6299} = 1.2041 \implies P(T \le 35) = \Phi(1.2041) \approx 0.8857\;(88.57\%)$$

**Cálculo inverso para un $95\%$ de confianza ($P = 0.95 \implies Z = 1.6449$):**
$$T = 31.8333 + 1.6449 \times 2.6299 \approx 36.1591\text{ días}$$

---

### Paso 4, Paso 5 y Paso 6. Implementación Informática, Diseño Experimental y Matriz de Contrastación

Todos los cálculos anteriores fueron ejecutados en Senda y verificados mediante la suite automatizada de Vitest (`97` pruebas unitarias en `10` archivos de prueba, incluyendo pruebas de propiedad sobre 300 redes aleatorias). Tolerancia numérica establecida para comparaciones en punto flotante: $\varepsilon = 10^{-9}$ (y redondeo a 4 cifras decimales en presentación PERT).

| Caso | Magnitud | Resultado manual | Resultado Senda | Diferencia | Estado |
|---|---|---|---|---|---|
| 1 (CPM con ficticia) | Duración total ($E_5$) | `12` | `12` | `0` | Verificado |
| 1 (CPM con ficticia) | Ruta crítica | `A → B → D` | `A → B → D` | `0` | Verificado |
| 1 (CPM con ficticia) | Tabla $E_i, L_j, h$ de `Ficticia 1` | $E_3 = 5, L_4 = 7, h = 2$ (No crítica) | $E_i = 5, L_j = 7, h = 2$ (Holgura de 2) | `0` | Verificado |
| 2 (Paralelas / Traslape) | Holguras Caso Traslape ($A, B, C, D, \text{Ficticia 1}$) | $0, 1, 0, 1, 2$ | $0, 1, 0, 1, 2$ | `0` | Verificado |
| 2 (Paralelas / Traslape) | Red AOA y equivalencia de precedencias | 4 eventos, 1 ficticia, precedencias exactas | 4 eventos, 1 ficticia, precedencias exactas | `0` | Verificado |
| 3 (PERT «Lanzamiento de una app») | Tiempo esperado ($T_e$) | `31.8333` | `31.8333` | `< 10⁻⁴` | Verificado |
| 3 (PERT «Lanzamiento de una app») | Varianza ($\sigma^2$) y desviación ($\sigma$) | $\sigma^2 = 6.9167,\; \sigma = 2.6299$ | $\sigma^2 = 6.9167,\; \sigma = 2.6299$ | `< 10⁻⁴` | Verificado |
| 3 (PERT «Lanzamiento de una app») | Valor $Z$ ($T = 35$) | `1.2041` | `1.2041` | `< 10⁻⁴` | Verificado |
| 3 (PERT «Lanzamiento de una app») | Probabilidad $\Phi(Z)$ ($T = 35$) | `0.8857` (88.57%) | `0.8857` (88.57%) | `< 10⁻⁴` | Verificado |

---

### Paso 7. Análisis Crítico

1. **Influencia de las actividades críticas y efecto de las holguras:**  
   Las actividades críticas ($h = 0$) determinan directamente la fecha de finalización del proyecto: cualquier demora $\Delta t > 0$ en una actividad crítica desplaza exactamente en $\Delta t$ la terminación del proyecto. En cambio, las actividades no críticas disponen de un margen de holgura total $h = L_j - E_i - d_{ij}$ dentro del cual pueden retrasarse o reasignar recursos sin postergar la entrega final.
2. **Papel de las actividades ficticias en la representación AOA:**  
   Las actividades ficticias ($d_{ij} = 0$) garantizan la integridad topológica de la red cuando existen predecesores parcialmente compartidos o actividades paralelas entre los mismos eventos. Aunque poseen tiempos de evento $E_i$ y $L_j$ y holgura $h = L_j - E_i$, no consumen recursos ni tiempo real, por lo que Senda las incluye en la tabla de resultados para facilitar la verificación académica sin catalogarlas como actividades de la ruta crítica.
3. **Incertidumbre en PERT y limitaciones del supuesto normal:**  
   - El método clásico PERT asume independencia entre actividades y aplica el Teorema Central del Límite sobre la ruta crítica media. En proyectos con pocas actividades críticas, la distribución real puede ser asimétrica.
   - Cuando existen varias rutas críticas o rutas subcríticas con alta varianza, considerar únicamente una ruta crítica ignora la probabilidad de que otra rama se retrase («sesgo optimista de PERT»). Senda mitiga parcialmente este riesgo seleccionando la ruta crítica de **mayor varianza** (criterio conservador) y advirtiéndolo explícitamente en la interfaz.

---

## 4. Guía Estructurada para el Informe Final (12 Secciones APA 7)

Para cumplir con el formato exigido por el docente (8 a 15 páginas, Times New Roman o Arial 12 pt, interlineado 1.5, margen izquierdo 3 cm y resto 2.5 cm, tercera persona), el informe en Word debe organizar su contenido en las siguientes 12 secciones:

1. **Portada:** Universidad Técnica de Ambato, Facultad de Ingeniería en Sistemas, Electrónica e Industrial, Carrera, Asignatura: Investigación Operativa, Título del proyecto, Integrantes, Docente y Fecha.
2. **Resumen (máx. 200 palabras):** Síntesis del problema de programación de proyectos mediante redes PERT-CPM, la metodología matemática basada en Taha (2017), la implementación de la aplicación web Senda, la validación frente a tres casos experimentales y la conclusión principal sobre la exactitud del modelo.
3. **Introducción:** Contexto de la gestión de proyectos en ingeniería, importancia de identificar cuellos de botella mediante CPM y PERT, justificación de desarrollar una herramienta interactiva verificada y descripción de la estructura del informe.
4. **Objetivos:**  
   - *Objetivo general:* Modelar, resolver y validar problemas de programación de proyectos mediante los métodos CPM y PERT utilizando análisis matemático manual y la aplicación web Senda.  
   - *Objetivos específicos:* (a) Formular el modelo de red AOA/AON con tiempos tempranos $E_i$, tardíos $L_j$ y holguras $h$; (b) Implementar y verificar el cálculo de rutas críticas, actividades ficticias y probabilidades PERT; (c) Contrastar los resultados analíticos manuales con los resultados computacionales en tres casos de estudio.
5. **Marco teórico:** Definición de redes de proyectos AOA y AON, reglas de numeración topológica de eventos, actividades ficticias, ecuaciones (1) a (10) de CPM y PERT citando a Taha (2017).
6. **Metodología:** Descripción de los datos de entrada, arquitectura modular de Senda (`src/core` desacoplado de la interfaz React), algoritmo de reducción transitiva y simplificación segura de actividades ficticias, y protocolo de pruebas unitarias con Vitest.
7. **Desarrollo:** Transcripción completa de la solución manual paso a paso presentada en la Sección 3 de este documento (con ecuaciones editadas en el editor de ecuaciones de Word y numeradas consecutivamente).
8. **Resultados y discusión:** Capturas de pantalla de la tabla de resultados de Senda (con las columnas `Actividad`, `Duración`, `Ei`, `Lj`, `h`, `Estado` y las actividades ficticias), diagramas AOA, AON y Gantt, matriz de contrastación del Paso 6 y discusión del Paso 7.
9. **Conclusiones:** Síntesis de los hallazgos verificados en correspondencia directa con cada objetivo específico.
10. **Recomendaciones:** Propuestas de extensión futura (aceleración de proyectos por relación tiempo-costo *crashing*, simulación de Monte Carlo para redes PERT con ramas casi críticas y nivelación de recursos).
11. **Referencias (APA 7):**
    - Taha, H. A. (2017). *Investigación de operaciones* (10.ª ed.). Pearson Educación.
    - Hillier, F. S., & Lieberman, G. J. (2015). *Introducción a la investigación de operaciones* (10.ª ed.). McGraw-Hill.
12. **Anexos:** Enlace al repositorio GitHub y aplicación desplegada, fragmentos clave del código fuente (`src/core/cpm.ts`, `src/core/aoa.ts`, `src/core/pert.ts`), capturas de las pruebas ejecutadas (`97 passed`) y la declaración obligatoria de uso de IA.

### Declaración de uso de Inteligencia Artificial (para incluir al final de Anexos)

> **Declaración de uso de inteligencia artificial generativa:**  
> Durante el desarrollo del presente proyecto se utilizaron herramientas de asistencia de programación basadas en inteligencia artificial generativa (Claude Code / Antigravity) con el propósito específico de apoyar la estructuración del código en React y TypeScript, la automatización de pruebas unitarias en Vitest, el ajuste de la notación académica ($E_i, L_j, h$) en las tablas de resultados y la revisión de formato de la documentación técnica. Todos los planteamientos matemáticos, el desarrollo de la solución manual paso a paso, la validación numérica de los casos de estudio y el análisis crítico de los resultados fueron comprendidos, ejecutados y verificados directamente por los integrantes del equipo.

---

## 5. Guía para la Presentación Formal (15 minutos + 5 minutos de preguntas)

- **Minutos 0:00 – 3:00 (Integrante 1 — Planteamiento y Modelo Matemático):** Presentación del problema de planificación de proyectos, diferencias entre CPM y PERT, explicación de eventos $(i, j)$, tiempos $E_i$, $L_j$, holgura $h = L_j - E_i - d_{ij}$ y cuándo es obligatoria una actividad ficticia en una red AOA.
- **Minutos 3:00 – 7:00 (Integrante 2 — Solución Manual Paso a Paso):** Explicación del desarrollo analítico del Caso 1 (CPM con ficticia) y del Caso 3 (PERT con cálculo de $t_e$, $\sigma^2$ y $Z$), mostrando cómo se obtienen los valores en cada evento.
- **Minutos 7:00 – 11:30 (Integrante 3 — Demostración en Vivo de Senda):** Demostración en vivo en https://emilioabril05.github.io/Senda-pert-cpm/ cargando los casos de prueba, activando el interruptor «Paso a paso», inspeccionando la tabla con `Ei`, `Lj`, `h` y `Ficticia 1`, alternando entre Red AOA, Red AON y Gantt, y probando la calculadora de probabilidad PERT y la exportación a Excel.
- **Minutos 11:30 – 15:00 (Integrante 4 — Contrastación, Análisis Crítico y Conclusiones):** Presentación de la matriz de validación (diferencia 0 entre cálculo manual y Senda), análisis del supuesto de normalidad y múltiples rutas críticas en PERT, y conclusiones finales.
