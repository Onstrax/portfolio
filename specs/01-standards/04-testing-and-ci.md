# TST — Pruebas e integración continua

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.8 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS, STR, TSC, I18N, QLT |

## 1. Propósito

Definir qué se prueba, con qué herramienta, dónde vive cada prueba y qué se ejecuta en cada cambio. El objetivo es doble: que cada criterio de aceptación de las specs tenga una comprobación que se pueda señalar, y que nada llegue a la rama principal sin pasar por todas.

## 2. Alcance

**Incluye:** niveles de prueba, desarrollo guiado por pruebas, convenciones de las pruebas unitarias, de componente y de repositorio, análisis estático, pruebas de extremo a extremo, Lighthouse, trazabilidad entre criterios y pruebas, y el pipeline de integración continua.

**No incluye:** los umbrales de calidad (ver QLT), las reglas de arquitectura y de tipos que las pruebas comprueban (ver STR y TSC), ni el despliegue (ver DEP).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Prueba unitaria** | Comprueba una función o módulo sin DOM. Vitest en entorno Node. |
| **Prueba de componente** | Comprueba un componente de React o un hook renderizándolo en un DOM simulado. Vitest con jsdom y Testing Library. |
| **Prueba de arquitectura** | Lee los archivos fuente y comprueba reglas de estructura (STR-R29). Vitest. |
| **Prueba de script** | Ejecuta la lógica de un script de `scripts/` sobre archivos de ejemplo en una carpeta temporal. Vitest. |
| **Prueba E2E** | Maneja un navegador real contra el sitio exportado. Playwright. |
| **Prueba de exportación** | Inspecciona los archivos de `out/` sin abrir un navegador. Playwright, proyecto `export`. |
| **Puerta** | Comprobación que consiste en que un comando termine sin errores (por ejemplo `pnpm typecheck`). |
| **Lógica** | Código de `lib/`, `shared/lib/`, `shared/state/`, `shared/i18n/`, `shared/config/` y `shared/contracts/`. |

## 4. Requisitos

### 4.1 Niveles de prueba

| ID | Requisito |
| --- | --- |
| TST-R01 | El proyecto usa exactamente los niveles de la tabla siguiente. Cada criterio de aceptación de una spec se verifica en el nivel más bajo capaz de comprobarlo. |
| TST-R02 | La columna "Verificación" de los criterios de aceptación usa el vocabulario de [README §4.5](../README.md). El primer término decide cómo se comprueba el criterio y si necesita una prueba que cite su identificador (§4.7). |

| Nivel | Herramienta | Ubicación | Comando |
| --- | --- | --- | --- |
| Formato | Prettier | Todo el repositorio | `pnpm format:check` |
| Análisis estático | ESLint | Todo el repositorio | `pnpm lint` |
| Tipos | TypeScript | Todo el repositorio | `pnpm typecheck` |
| Prueba unitaria | Vitest (Node) | `src/**/*.test.ts`, junto al archivo probado | `pnpm test` |
| Prueba de componente | Vitest (jsdom) + Testing Library | `src/**/*.test.tsx`, junto al archivo probado | `pnpm test` |
| Prueba de arquitectura | Vitest (Node) | `tests/architecture/` | `pnpm test` |
| Prueba de script | Vitest (Node) | `tests/scripts/` | `pnpm test` |
| Assets | Script propio | — | `pnpm assets:check` |
| Prueba de exportación | Playwright, sin navegador | `e2e/export/` | `pnpm test:e2e` |
| Prueba E2E | Playwright + axe | `e2e/*.spec.ts` | `pnpm test:e2e` |
| Lighthouse | Lighthouse CI | — | `pnpm test:lighthouse` |
| Auditoría manual | Persona | QLT §4.8 | — |

### 4.2 Desarrollo guiado por pruebas

| ID | Requisito |
| --- | --- |
| TST-R03 | La **lógica** (§3) y la lógica de los scripts se desarrollan con TDD: primero se escribe la prueba que expresa el criterio, se comprueba que falla, y después se escribe el código mínimo que la hace pasar. |
| TST-R04 | Los componentes de vista, los hooks y las animaciones no exigen TDD. Se prueban después de escribirlos, por su comportamiento observable. |
| TST-R05 | La corrección de un defecto empieza por una prueba que lo reproduce y falla. El cambio que corrige el defecto incluye esa prueba. |
| TST-R06 | Un cambio que añade o modifica lógica incluye sus pruebas en el mismo commit. |

### 4.3 Pruebas unitarias y de componente

| ID | Requisito |
| --- | --- |
| TST-R07 | Los archivos `*.test.ts` se ejecutan en entorno Node y los `*.test.tsx` en un DOM simulado con jsdom. `vitest.setup.ts` registra las aserciones de `@testing-library/jest-dom` y limpia el DOM después de cada prueba. La configuración de Vitest define la variable `__NEXT_TRAILING_SLASH`, para que `next/link` genere en las pruebas las mismas rutas con barra final que el sitio compilado (SYS-R05). |
| TST-R08 | `pnpm test` mide la cobertura con el proveedor V8 sobre la **lógica** (§3) y sobre `src/features/registry.ts`, y falla si no se alcanzan estos mínimos: 95 % de líneas, 95 % de funciones, 95 % de sentencias y 90 % de ramas. Los archivos `*.generated.ts` quedan excluidos. |
| TST-R09 | Una prueba de componente interactúa como lo haría un visitante: localiza elementos por rol y nombre accesible y actúa con `@testing-library/user-event`. NO DEBE comprobar nombres de clases, estado interno ni detalles de implementación. |
| TST-R10 | Solo se simulan las fronteras con el navegador: almacenamiento, `matchMedia`, audio, temporizadores y el enrutador de Next.js. NO DEBEN simularse módulos propios de lógica: se usan los reales. |
| TST-R11 | Las pruebas son deterministas e independientes entre sí: no dependen de la hora, la zona horaria, la red, valores aleatorios ni del orden de ejecución. El tiempo se controla con temporizadores simulados. |
| TST-R12 | NO DEBEN usarse instantáneas guardadas en archivos (`toMatchSnapshot`, `toMatchFileSnapshot`). El resultado esperado se escribe en la prueba. |
| TST-R13 | Cada prueba comprueba un solo comportamiento y su título lo describe en una frase. Las pruebas que verifican un criterio de aceptación llevan su identificador al inicio del título (§4.7). |
| TST-R48 | Las pruebas de tipos se escriben en un archivo `*.test.ts` normal: las líneas con `@ts-expect-error` van dentro del cuerpo de una prueba con título. Así `pnpm typecheck` comprueba los tipos y la prueba de trazabilidad encuentra el identificador del criterio. |

### 4.4 Análisis estático y pruebas de repositorio

| ID | Requisito |
| --- | --- |
| TST-R14 | `prettier.config.mjs` establece `printWidth: 100` y el complemento `prettier-plugin-tailwindcss`; el resto son los valores por defecto de Prettier. Todo archivo de código y de configuración DEBE estar formateado. `.prettierignore` excluye `specs/`, `design/`, `public/`, `out/`, `coverage/`, `pnpm-lock.yaml` y los archivos `*.generated.ts`. Las specs se excluyen porque Prettier rellena las columnas de las tablas de Markdown y vuelve ilegibles las diferencias entre versiones. |
| TST-R15 | `eslint.config.mjs` usa configuración plana y compone, en este orden: `eslint-config-next/core-web-vitals`; `eslint-config-next/typescript`; `strictTypeChecked` y `stylisticTypeChecked` de `typescript-eslint` (TSC-R04); las reglas propias de TSC §4.2, I18N-R46 y STR-R31; las reglas de accesibilidad de TST-R16; y, al final, `eslint-config-prettier`. Desactiva `@next/next/no-img-element`, porque el sitio sirve sus imágenes con `<picture>` y no con `next/image` (SYS §4.1). Ignora `.next/`, `out/`, `coverage/`, `next-env.d.ts` y los informes de pruebas. `pnpm lint` no admite ninguna advertencia. |
| TST-R16 | Las reglas siguientes del complemento `jsx-a11y`, que `eslint-config-next` ya registra, se activan con severidad de error: `alt-text`, `anchor-has-content`, `anchor-is-valid`, `aria-activedescendant-has-tabindex`, `aria-props`, `aria-proptypes`, `aria-role`, `aria-unsupported-elements`, `click-events-have-key-events`, `heading-has-content`, `html-has-lang`, `iframe-has-title`, `img-redundant-alt`, `interactive-supports-focus`, `label-has-associated-control`, `mouse-events-have-key-events`, `no-access-key`, `no-autofocus`, `no-distracting-elements`, `no-interactive-element-to-noninteractive-role`, `no-noninteractive-element-interactions`, `no-noninteractive-element-to-interactive-role`, `no-noninteractive-tabindex`, `no-redundant-roles`, `no-static-element-interactions`, `role-has-required-aria-props`, `role-supports-aria-props`, `scope` y `tabindex-no-positive`. |
| TST-R17 | NO DEBE desactivarse una regla de ESLint con un comentario (`eslint-disable`), salvo en `src/shared/lib/typed-object.ts` (TSC-R07) y en los tres lugares de QLT-R48, y en cada caso con la razón en el mismo comentario. |
| TST-R18 | `tests/` tiene exactamente las carpetas de la tabla siguiente. |
| TST-R19 | Las pruebas de configuración de ESLint ejecutan ESLint con la configuración real del proyecto sobre fragmentos de código escritos en la propia prueba, y comprueban qué regla salta. Cada fragmento se analiza bajo la ruta de un archivo real del proyecto, porque las reglas con información de tipos no admiten archivos que no existen: el texto sustituye al contenido y la ruta decide qué reglas se aplican. Así se demuestra que cada regla exigida por las specs está activa. |

| Carpeta | Contenido |
| --- | --- |
| `tests/architecture/` | Pruebas de arquitectura de STR, TSC, I18N, VIS y QLT, y la función de detección con sus propios casos |
| `tests/repo/` | Comprobaciones sobre `package.json`, `tsconfig.json`, la configuración de las herramientas y el flujo de CI |
| `tests/lint/` | Pruebas de configuración de ESLint (TST-R19) |
| `tests/scripts/` | Pruebas de script para `scripts/` |
| `tests/traceability/` | Prueba de trazabilidad (§4.7) |

### 4.5 Pruebas de extremo a extremo

| ID | Requisito |
| --- | --- |
| TST-R20 | Las pruebas E2E se ejecutan contra el sitio exportado (`out/`), servido por `pnpm preview` en `http://localhost:4173`. Playwright arranca y detiene ese servidor. Nunca se ejecutan contra el servidor de desarrollo. |
| TST-R21 | `playwright.config.ts` define exactamente los proyectos de la tabla siguiente. |
| TST-R22 | Las pruebas fijan su viewport con las constantes de `e2e/support/viewports.ts`, que reproducen la matriz de QLT §4.6. Las que usan `desktop` o `mobile` se ejecutan en los tres motores; las que usan otro viewport, las de presupuestos de peso, las de `scene:ready` y las de los límites de tiempo del arranque se ejecutan solo en Chromium y se omiten en los demás con una razón explícita. |
| TST-R23 | Todas las pruebas E2E parten de una prueba base común, definida en `e2e/support/`, que hace fallar cualquier prueba en la que ocurra alguna de estas cosas: un mensaje de consola de tipo error o advertencia; una excepción no capturada; una petición con respuesta de error o fallida; o una petición a un origen distinto de `localhost:4173`. Una prueba que necesite provocar una de estas situaciones lo declara de forma explícita y local. Una petición es fallida cuando la red o el servidor no la completan. No lo es la que cancela el propio navegador: el `HEAD` con el que el enrutador de Next.js sondea una página antes de precargarla, o las descargas y precargas que interrumpe una navegación. Cada motor las distingue por el texto del error; WebKit, además, las anota en consola como un error de control de acceso sobre una URL del propio sitio, que la prueba base tampoco cuenta. Tampoco cuenta el aviso con el que Firefox anota un script del sitio cuya descarga cancela una navegación: un script que falla de verdad aparece además como petición fallida o como respuesta de error. |
| TST-R24 | Los elementos se localizan por rol y nombre accesible. Un atributo `data-testid` solo se usa para elementos sin rol propio, y cada uno DEBE estar nombrado en la spec de su funcionalidad. NO DEBEN usarse selectores de clase ni de estructura. |
| TST-R25 | Los textos que una prueba espera encontrar se escriben literalmente en la prueba, en el idioma correspondiente. Las pruebas E2E NO DEBEN importar de `src/`, salvo constantes de `src/shared/contracts/` y `src/shared/config/`. |
| TST-R26 | Cada prueba empieza con un contexto de navegador nuevo. Por defecto, la prueba base marca el arranque como ya visto antes de cargar la página, para no esperar 2 segundos en cada prueba; las pruebas de la secuencia de arranque desactivan ese ajuste. En Firefox, además, navega una vez a `about:blank` antes de empezar: bajo carga, ese motor puede notificar el fin de la página en blanco inicial después de que la prueba haya iniciado su primera navegación, y Playwright se queda esperando una carga que ya ocurrió. El arranque se marca como visto con la opción `bootSeen` de la prueba base, que escribe la sesión solo si aún no existe, para que una recarga encuentre lo que guardó la página. Y en Firefox, si una navegación supera los 10 segundos, la prueba base comprueba por su cuenta que el documento pedido está cargado y, en ese caso, la da por buena. Sin JavaScript no la da por buena: la repite. Ahí una página no guarda estado, así que cargarla otra vez no cambia nada, y las pruebas que siguen enlaces necesitan que Playwright haya visto terminar una carga, porque cada clic es una navegación completa. Por la misma razón, las pruebas de la redirección de `/` preguntan a la propia página en qué ruta está, en lugar de esperar a que Playwright dé por terminada una navegación que inició un script. |
| TST-R27 | NO DEBEN usarse esperas de duración fija (`waitForTimeout`). Se espera a una condición observable con las aserciones de Playwright. |
| TST-R28 | El análisis de accesibilidad usa una única función auxiliar de `e2e/support/`, que aplica las etiquetas de QLT-R26 y no excluye ningún elemento. Los estados auditables de QLT §4.1.7 se recorren en una prueba que cita QLT-AC01. |
| TST-R29 | En CI: dos reintentos por prueba, con traza grabada en el primer reintento; `forbidOnly` activo; tiempo máximo de 30 segundos por prueba y de 5 segundos por aserción. En local no hay reintentos. Una prueba que solo pasa al reintentar se considera defectuosa y se corrige; no se acepta como normal. |
| TST-R30 | `e2e/` tiene la estructura de la segunda tabla. |

| Proyecto | Motor | Viewport por defecto | Ejecuta |
| --- | --- | --- | --- |
| `chromium` | Chromium | `desktop` | `e2e/*.spec.ts` |
| `firefox` | Firefox | `desktop` | `e2e/*.spec.ts` |
| `webkit` | WebKit | `desktop` | `e2e/*.spec.ts` |
| `export` | Ninguno | — | `e2e/export/*.spec.ts` |

| Ruta | Contenido |
| --- | --- |
| `e2e/*.spec.ts` | Un archivo por flujo de usuario |
| `e2e/export/*.spec.ts` | Pruebas de exportación |
| `e2e/support/` | Prueba base, constantes de viewport, función de accesibilidad y funciones auxiliares de medición |

### 4.6 Lighthouse

| ID | Requisito |
| --- | --- |
| TST-R31 | `pnpm test:lighthouse` ejecuta `scripts/run-lighthouse.mjs`, que lanza Lighthouse CI tres veces contra el sitio exportado servido por `pnpm preview`: con `lighthouserc.desktop.json`, con `lighthouserc.mobile.json` y con `lighthouserc.mobile-lcp.json`. La tercera pasada repite las páginas del preajuste `mobile` y mide solo su Largest Contentful Paint, con la limitación de red y de procesador aplicada de verdad al navegador (QLT-R30). Si `preview` no está en marcha, el script lo arranca y lo detiene al terminar. Los informes de cada pasada quedan en `.lighthouseci/<pasada>/`. |
| TST-R32 | Cada archivo de configuración declara sus páginas, su preajuste, tres ejecuciones por página y, como aserciones sobre la mediana, exactamente los umbrales y límites de las tablas de QLT-R29 y QLT-R30 que le corresponden: `lighthouserc.mobile.json` aserta las cuatro puntuaciones, el Cumulative Layout Shift y el Total Blocking Time; `lighthouserc.mobile-lcp.json`, solo el Largest Contentful Paint. El script ejecuta las tres pasadas aunque una falle, para que el informe sea completo, y el comando falla si alguna aserción no se cumple. |
| TST-R33 | Lighthouse usa el Chromium que instala Playwright, cuya ruta resuelve el script, de modo que no hace falta otro navegador en la máquina ni en CI. |

### 4.7 Trazabilidad

| ID | Requisito |
| --- | --- |
| TST-R34 | El título de una prueba que verifica un criterio de aceptación empieza por su identificador seguido de dos puntos, por ejemplo `"SYS-AC05: sets data-mode to scene at 1280×720"`. Una prueba PUEDE citar varios identificadores separados por comas. Los títulos de las pruebas se escriben en inglés. |
| TST-R35 | Cada criterio se clasifica por el primer término de su columna "Verificación", según el vocabulario de README §4.5: **automático** (necesita una prueba que lo cite), **puerta** (lo verifica un comando del pipeline) o **manual** (lo verifica una persona y se registra en el historial de la spec). |
| TST-R36 | La prueba de trazabilidad (`tests/traceability/`) lee todas las specs y todos los archivos de prueba y falla en cualquiera de estos casos: (1) una spec en estado "Implementada" tiene un criterio automático que ninguna prueba cita; (2) una prueba cita un identificador de criterio que no existe en ninguna spec; (3) la columna "Verificación" de un criterio, en cualquier spec, no empieza por un término del vocabulario; (4) un identificador de criterio está definido en más de una spec. |
| TST-R37 | La lógica de lectura y clasificación de la prueba de trazabilidad es una función pura con pruebas propias sobre textos de ejemplo. |
| TST-R38 | Una spec solo PUEDE pasar a "Implementada" cuando la prueba de trazabilidad pasa con ese estado ya escrito en su cabecera (QLT-R51). |

### 4.8 Integración continua

| ID | Requisito |
| --- | --- |
| TST-R39 | El flujo `.github/workflows/ci.yml` se ejecuta en cada `pull_request` y en cada `push` a `main`. Define los trabajos de la tabla siguiente. |
| TST-R40 | Todos los trabajos usan la imagen `ubuntu-24.04`, la versión de Node de `.nvmrc`, la versión de pnpm del campo `packageManager` e instalan con `pnpm install --frozen-lockfile` (SYS-R39). Se guarda en caché el almacén de pnpm. |
| TST-R41 | El flujo declara `permissions: contents: read` y no usa ningún secreto. Toda acción de terceros se referencia por el SHA completo de su commit, con la versión en un comentario. Solo se admiten acciones de las organizaciones `actions` y `pnpm`. |
| TST-R42 | Cada trabajo tiene un límite de 15 minutos. Un nuevo commit en la misma rama cancela la ejecución anterior de ese `pull_request`. |
| TST-R43 | Cuando falla un trabajo de pruebas E2E se guarda como artefacto el informe de Playwright con sus trazas. Los informes de Lighthouse y el resumen de cobertura se guardan siempre. Los artefactos se conservan 7 días. |
| TST-R44 | El autor trabaja solo y PUEDE hacer `push` directo a `main`; no se exigen `pull_request`. Antes de cada `push` DEBE pasar `pnpm check` en local, y el flujo de CI se ejecuta sobre cada `push`. Un commit de `main` cuyo trabajo `ci-ok` falla se corrige antes de cualquier otro cambio, y solo se publica un commit con `ci-ok` en verde (ver DEP). En un equipo donde el WebKit de Playwright no arranca, como el del autor (CachyOS: faltan dependencias de sistema que solo existen en Ubuntu y Debian), la puerta local es `pnpm check:docker` (§4.10). |
| TST-R45 | `pnpm check` (SYS-R34) ejecuta en local los mismos comandos que los trabajos `static`, `unit`, `build` y `e2e`. CI añade `lighthouse`. Un cambio que pasa `pnpm check` en local y falla en CI por una diferencia de entorno se trata como un defecto del pipeline. |

| Trabajo | Depende de | Qué ejecuta |
| --- | --- | --- |
| `static` | — | `pnpm format:check`, `pnpm lint`, `pnpm typecheck` |
| `unit` | — | `pnpm test` (con cobertura) |
| `build` | — | `pnpm assets:check` y `pnpm build` con `NEXT_PUBLIC_SITE_URL=http://localhost:4173`; guarda `out/` como artefacto |
| `e2e` | `build` | Matriz de tres ejecuciones: `chromium` junto con `export`, `firefox` y `webkit`. Cada una descarga `out/`, instala su navegador y ejecuta `pnpm test:e2e` para sus proyectos |
| `lighthouse` | `build` | Descarga `out/`, instala Chromium con Playwright (TST-R33) y ejecuta `pnpm test:lighthouse` |
| `ci-ok` | Todos los anteriores | Termina bien solo si todos los anteriores terminaron bien. Es la única comprobación obligatoria de la rama |

### 4.9 Verificación manual

| ID | Requisito |
| --- | --- |
| TST-R46 | Los criterios de clase manual se verifican cuando lo indica su spec y, en todo caso, antes de pasar la spec a "Implementada". El resultado se anota en el historial de esa spec con la fecha y los identificadores verificados. |
| TST-R47 | La auditoría manual de accesibilidad y robustez es la de QLT §4.8. |

### 4.10 Entorno en contenedor

| ID | Requisito |
| --- | --- |
| TST-R49 | `Dockerfile` define una imagen que reproduce el entorno de CI: parte de `mcr.microsoft.com/playwright:v<versión>-noble`, donde `<versión>` es exactamente la de `@playwright/test` en `package.json`, e instala el pnpm del campo `packageManager`. La imagen trae Ubuntu 24.04, la versión de Node de `.nvmrc` y los tres motores con sus dependencias. No copia nada del repositorio: `.dockerignore` excluye todo. |
| TST-R50 | `compose.yaml` define un único servicio, `check`, que monta el repositorio en `/work`, fija `NEXT_PUBLIC_SITE_URL=http://localhost:4173` y ejecuta `pnpm check`. `pnpm check:docker` (SYS §4.9) lo lanza con el usuario del equipo, para que los archivos que escribe no queden a nombre de `root`. |
| TST-R51 | El contenedor usa las dependencias ya instaladas en el equipo (`node_modules/`); no instala nada. Para ello el servicio desactiva la comprobación de pnpm `verifyDepsBeforeRun`, que dentro del contenedor intentaría borrarlas y reinstalarlas contra otro almacén. Al cambiar la versión de `@playwright/test` o de pnpm se actualiza `Dockerfile` en el mismo cambio. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| TST-AC01 | La configuración de Vitest mide la cobertura de las rutas de TST-R08 con los cuatro mínimos indicados y excluye los archivos generados. | Prueba unitaria que lee la configuración |
| TST-AC02 | `pnpm test` termina bien, lo que incluye superar los mínimos de cobertura de TST-R08. | Ejecución en CI |
| TST-AC03 | Ningún archivo de prueba contiene `.only`, `toMatchSnapshot`, `toMatchFileSnapshot` ni `waitForTimeout`; toda llamada a `.skip` o `test.skip` lleva una razón como argumento. | Prueba de arquitectura |
| TST-AC04 | `prettier.config.mjs` y `.prettierignore` cumplen TST-R14, y `pnpm format:check` no encuentra archivos sin formatear. | Ejecución en CI |
| TST-AC05 | Para cada regla de TST-R16, ESLint marca un fragmento de ejemplo que la incumple. | Prueba unitaria que ejecuta ESLint sobre fragmentos de ejemplo |
| TST-AC06 | Los únicos comentarios `eslint-disable` de `src/` están en los archivos que permite TST-R17 y cada uno incluye una razón. | Prueba de arquitectura |
| TST-AC07 | `playwright.config.ts` define exactamente los cuatro proyectos de TST-R21, usa `http://localhost:4173` como URL base y arranca el servidor con `pnpm preview`. | Prueba unitaria que lee la configuración |
| TST-AC08 | Con la prueba base, una página que escribe un error en la consola hace fallar la prueba; lo mismo una página que solicita un recurso de otro origen. | Prueba E2E marcada como fallo esperado |
| TST-AC09 | Ningún archivo de `e2e/` importa de `src/` fuera de `src/shared/contracts/` y `src/shared/config/`, ni usa selectores de clase. | Prueba de arquitectura |
| TST-AC10 | Los tres archivos de configuración de Lighthouse contienen las páginas, los preajustes, el número de ejecuciones y las aserciones que corresponden a las tablas de QLT-R29 y QLT-R30, repartidas como indica TST-R32. | Prueba unitaria que lee los archivos |
| TST-AC11 | La función de trazabilidad, sobre textos de ejemplo, detecta cada uno de los cuatro casos de TST-R36 y clasifica correctamente un criterio automático, uno de puerta y uno manual. | Prueba unitaria |
| TST-AC12 | La prueba de trazabilidad pasa sobre las specs y las pruebas reales del repositorio. | Prueba unitaria |
| TST-AC13 | `ci.yml` contiene los seis trabajos de TST-R39 con sus dependencias; declara `permissions: contents: read`; toda línea `uses:` referencia un SHA de 40 caracteres de una organización admitida; y no aparece ninguna referencia a `secrets.`. | Prueba unitaria que lee el archivo |
| TST-AC14 | El flujo de CI termina bien en `main`. | Ejecución en CI |
| TST-AC15 | El proceso de publicación solo se ejecuta para un commit de `main` cuyo trabajo `ci-ok` terminó bien. | Revisión manual del autor sobre el flujo de publicación, registrada en el historial de esta spec |
| TST-AC16 | La imagen de `Dockerfile` es la de Playwright en la versión de `@playwright/test`, instala el pnpm de `packageManager` y no copia archivos; el servicio `check` de `compose.yaml` monta el repositorio y ejecuta `pnpm check`; y `package.json` define `check:docker`. | Prueba unitaria que lee los archivos |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **TDD para la lógica, pruebas posteriores para la vista** (D-18). | La lógica tiene entradas y salidas definidas en las specs, así que la prueba se puede escribir antes y sirve de especificación ejecutable. En vistas y animaciones, escribir la prueba antes obliga a adivinar el marcado y produce pruebas frágiles. |
| **Cobertura obligatoria solo sobre la lógica** (TST-R08, D-37). | Es donde un porcentaje alto significa algo. Exigirlo en componentes incentiva pruebas que ejercitan líneas sin comprobar comportamiento; ahí el criterio son los criterios de aceptación y las pruebas E2E. |
| **E2E contra el sitio exportado** (TST-R20). | Se prueba exactamente lo que se publica: archivos estáticos sin servidor de aplicación. El servidor de desarrollo se comporta de otro modo en hidratación, caché y errores. |
| **Prueba base que falla ante errores de consola y peticiones externas** (TST-R23). | Convierte QLT-R40 y SYS-R41 en propiedades de todas las pruebas, no de una prueba dedicada que podría quedarse corta. |
| **Textos esperados escritos en la prueba** (TST-R25, D-39). | Una prueba que importa el mismo dato que muestra la página no puede detectar que el dato está mal. El texto literal actúa como segunda fuente. |
| **Sin pruebas de regresión visual por capturas en v1** (D-38). | El renderizado de fuentes e imágenes difiere entre sistemas y motores, y la escena depende de una imagen que aún va a cambiar. Las capturas generarían fallos falsos constantes. El aspecto se verifica con criterios medibles (tamaños, contrastes, estilos calculados) y con la revisión manual del autor. |
| **Sin instantáneas en archivo** (TST-R12). | Se actualizan sin leerlas. Un valor esperado escrito a mano obliga a decidir qué es lo correcto. |
| **Trazabilidad automática ligada al estado "Implementada"** (§4.7, D-36). | Da un significado mecánico a ese estado: no se puede declarar implementada una spec con criterios sin prueba. También detecta identificadores mal escritos y criterios cuya forma de verificación no está clara. |
| **Pruebas de la propia configuración** (TST-R19, TST-AC07, TST-AC10, TST-AC13). | Las reglas de lint, los proyectos de Playwright, los umbrales de Lighthouse y el flujo de CI son requisitos de las specs. Si alguien los relaja por accidente, debe fallar una prueba. |
| **Lighthouse con el Chromium de Playwright** (TST-R33). | Evita depender del navegador que tenga cada máquina y fija, a través del lockfile, la versión con la que se mide. |
| **Acciones fijadas por SHA y permisos de solo lectura** (TST-R41). | Una etiqueta de versión de una acción puede reasignarse a otro código; un SHA no. Con permisos de lectura y sin secretos, un flujo comprometido no puede modificar el repositorio. |
| **La puerta completa en un contenedor** (§4.10, D-67). | El WebKit de Playwright solo se distribuye para Ubuntu y Debian. Ejecutar `pnpm check` dentro de la imagen oficial da en local el mismo sistema, el mismo Node y los mismos tres motores que CI, de modo que un fallo de WebKit se ve antes del `push`. Se monta el repositorio en lugar de copiarlo para no reinstalar dependencias ni duplicar la política de pnpm. |
| **Un único trabajo obligatorio, `ci-ok`.** | La protección de la rama no necesita cambios cuando se añaden o renombran trabajos. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.8 | Durante M8, por delegación del autor (D-77). TST-R31, TST-R32 y TST-AC10: Lighthouse se ejecuta en tres pasadas; la tercera mide el Largest Contentful Paint del preajuste `mobile` con la limitación aplicada de verdad. §4.8: el trabajo `lighthouse` instala Chromium. TST-R26: sin JavaScript, la prueba base repite la navegación de Firefox que no ve terminar, en lugar de darla por buena; en la puerta local, bajo carga, dos pruebas sin JavaScript agotaron su tiempo en Firefox, una vez cada una, y esa situación es su causa más probable: no se pudo reproducir de forma aislada. Estado: pasa a "Implementada" al cerrar M8, con la prueba de trazabilidad en verde (TST-R38); TST-AC15 se verifica en M9, sobre el flujo de publicación. |
| 2026-10-13 | 1.7 | Durante M7, por delegación del autor. TST-R26: opción `bootSeen` de la prueba base, comprobación manual de una navegación de Firefox que Playwright no ve terminar y, en las pruebas de la redirección de `/`, consulta a la propia página. TST-R23: aviso de Firefox por scripts cancelados. TST-R22: los límites de tiempo del arranque se miden solo en Chromium; en WebKit dentro del contenedor las animaciones avanzan a saltos y no dan una medida fiable. |
| 2026-10-13 | 1.6 | Durante M5, por delegación del autor. TST-R23: una petición cancelada por el navegador no es fallida; con la escena, cada navegación interrumpe precargas en curso y Firefox las notificaba como fallos. TST-R26: en Firefox, la prueba base navega a `about:blank` antes de cada prueba. |
| 2026-10-13 | 1.5 | Durante M4, por delegación del autor. TST-R23: se precisa qué es una petición fallida. |
| 2026-10-13 | 1.4 | Durante M3, por delegación del autor. TST-R07: Vitest define `__NEXT_TRAILING_SLASH`. |
| 2026-10-13 | 1.3 | Por decisión del autor (D-67). Nuevo §4.10 (TST-R49 a TST-R51): `pnpm check:docker` ejecuta la puerta en la imagen de Playwright. TST-R44: esa es la puerta local donde WebKit no arranca. Nuevo TST-AC16. TST-R51: el servicio desactiva `verifyDepsBeforeRun`. |
| 2026-10-13 | 1.2 | Decidido por delegación del autor durante M0. TST-R15: se desactiva `@next/next/no-img-element`. TST-R19: los fragmentos se analizan bajo la ruta de un archivo real. TST-R44: en el equipo del autor WebKit no arranca; lo verifica CI. |
| 2026-10-12 | 1.1 | TST-R44 y TST-AC15: por decisión del autor se permite `push` directo a `main`; la garantía pasa a ser que solo se publica con CI en verde (D-45). |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Composición de ESLint, reglas `jsx-a11y` y cobertura con Vitest comprobadas en un prototipo con las versiones de SYS §4.1. |
