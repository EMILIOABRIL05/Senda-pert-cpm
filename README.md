<p align="center">
  <img src="public/icono-192.png" width="88" alt="Logo de Senda" />
</p>

<h1 align="center">Senda</h1>

<p align="center">
  Planificador de proyectos con <b>PERT</b>, <b>CPM</b>, <b>ruta crítica</b> y <b>diagrama de Gantt</b>.<br />
  Proyecto de la asignatura Investigación Operativa: Modelo de Diseño y Programación de Redes.
</p>

<p align="center">
  <a href="https://emilioabril05.github.io/Senda-pert-cpm/"><b>Abrir la aplicación →</b></a>
</p>

---

## Qué hace

Escribes las actividades de un proyecto con sus predecesores y su duración, y Senda calcula y dibuja todo mientras escribes:

- **Tabla de tiempos** con IC, TC, IL, TL, holgura total y holgura libre.
- **Ruta crítica**. Si hay varias, las muestra todas (por ejemplo, A‑C‑E y B‑D‑E).
- **Red AOA** (actividades en las flechas), la representación que se usa en clase: eventos numerados con su TE y TL, y **actividades ficticias** punteadas cuando hacen falta.
- **Red AON** (actividades en los nodos), con cada caja en el formato de los libros de texto.
- **Diagrama de Gantt** con la holgura de cada actividad y fechas reales si indicas cuándo empieza el proyecto.
- **PERT**: tiempo esperado, varianza, desviación del proyecto, la probabilidad de terminar en un plazo y el plazo necesario para un nivel de confianza.
- **Modo paso a paso**: muestra cómo salió cada IC y cada TL, resaltando el predecesor o el sucesor que decide el valor. Sirve para revisar un ejercicio hecho a mano.

Además se guarda sola en el navegador, se instala como app en el celular, funciona sin internet y exporta a **PNG, PDF, Excel y JSON**.

## Cómo se usa

1. Elige el método: **CPM** (una duración por actividad) o **PERT** (tiempos optimista *a*, más probable *m* y pesimista *b*).
2. Llena la tabla. Los predecesores se separan con comas (`B, C`) y se dejan vacíos si la actividad no tiene. Con <kbd>Enter</kbd> pasas a la fila siguiente o creas una nueva.
3. Revisa los **Resultados** y los **Diagramas** debajo. Si hay un error (un predecesor que no existe, un ciclo, una duración negativa…), Senda señala la fila y no calcula nada hasta que se corrija.
4. ¿No sabes por dónde empezar? En **Ejemplos** está el ejercicio de clase y otros cuatro.

## Fórmulas que usa

| Concepto | Fórmula |
|---|---|
| Inicio más cercano | IC = máx(TC de los predecesores), o 0 si no tiene |
| Terminación más cercana | TC = IC + duración |
| Terminación más lejana | TL = mín(IL de los sucesores), o la duración del proyecto si no tiene |
| Inicio más lejano | IL = TL − duración |
| Holgura total | HT = IL − IC |
| Holgura libre | HL = mín(IC de los sucesores) − TC |
| Tiempo esperado (PERT) | te = (a + 4m + b) / 6 |
| Varianza (PERT) | σ² = ((b − a) / 6)² |
| Probabilidad de un plazo T | Z = (T − Te) / σ, P = Φ(Z) |

Una actividad es crítica cuando su holgura total es 0 (se compara con una tolerancia de 10⁻⁹ por los decimales de PERT). Si hay varias rutas críticas, la varianza del proyecto se toma de la de **mayor varianza**, y la app lo indica.

## Cómo se construye la red AOA

Es la parte más delicada. Senda prioriza que la red sea **correcta** y después intenta usar pocas ficticias:

1. Se quitan las precedencias redundantes (si D depende de A y de B, y B ya depende de A, la flecha A→D sobra).
2. Se arma una red que es correcta por construcción: un evento por cada conjunto distinto de predecesores, unido a ellos con ficticias.
3. Se simplifica solo con dos reglas que no cambian la precedencia: borrar ficticias redundantes y fusionar los dos eventos de una ficticia cuando uno de ellos no tiene otra entrada u otra salida. Una fusión se descarta si dejaría dos actividades con el mismo par de eventos.
4. Se numeran los eventos de modo que cada flecha vaya de un número menor a uno mayor.

Las pruebas comprueban que la precedencia que expresa la red es **exactamente** la ingresada, sin dependencias de más ni de menos, en los casos de clase y en 300 proyectos generados al azar.

## Ejecutarlo en tu computadora

Necesitas [Node.js](https://nodejs.org) 22 o superior.

```bash
git clone https://github.com/EMILIOABRIL05/Senda-pert-cpm.git
cd Senda-pert-cpm
npm install
npm run dev
```

| Comando | Para qué sirve |
|---|---|
| `npm run dev` | Servidor de desarrollo en `http://localhost:5173` |
| `npm test` | Pruebas unitarias (Vitest) |
| `npm run build` | Chequeo de tipos y compilación para producción en `dist/` |
| `npm run lint:tipos` | Solo el chequeo de tipos |
| `node scripts/generar-iconos.mjs` | Vuelve a generar los íconos de la app |

Cada cambio en `main` pasa las pruebas y se publica automáticamente en GitHub Pages ([`.github/workflows/despliegue.yml`](.github/workflows/despliegue.yml)).

## Cómo está organizado el código

```
src/
  core/          Lógica pura en TypeScript, sin React. Todo el cálculo vive aquí.
    validacion   Errores de los datos (nombres, predecesores, ciclos, tiempos)
    grafo        Orden topológico, cierre y reducción transitiva
    cpm          Pasos hacia adelante y hacia atrás, holguras, rutas críticas
    pert         te, σ², probabilidad y plazo inverso
    normal       Distribución normal estándar (implementación propia)
    aoa          Red de flechas con actividades ficticias
    pasos        Explicación del modo paso a paso
  componentes/   Interfaz en React (tablas, resumen, diagramas, menús)
  estado/        Estado del proyecto, preferencias y guardado automático
  exportar/      PNG, PDF, Excel y JSON
  ejemplos/      Ejercicios precargados
```

`src/core` no depende de la interfaz, así que se puede probar por separado: tiene más de 90 pruebas, entre ellas todos los casos de clase.

**Tecnologías:** React, TypeScript (modo estricto), Vite, Tailwind CSS, React Flow con dagre, Vitest, SheetJS, html-to-image, jsPDF y vite-plugin-pwa.

---

<p align="center"><sub>Hecho para Investigación Operativa · Universidad Técnica de Ambato</sub></p>
