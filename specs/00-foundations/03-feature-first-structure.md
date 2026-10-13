# STR — Estructura feature-first

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.7 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS |

## 1. Propósito

Definir dónde vive cada archivo, qué puede importar cada parte del código y cómo se nombran las cosas. El objetivo es que cada funcionalidad sea una carpeta autocontenida que se puede leer, probar, modificar o eliminar sin tocar las demás.

## 2. Alcance

**Incluye:** árbol del repositorio, capas y reglas de dependencia, catálogo de features, anatomía de un feature, registro de secciones, separación de vista, lógica y estilos, nomenclatura y mecanismo de cumplimiento.

**No incluye:** el contenido de `src/app/` (ver SYS §4.5), la forma de los tipos (ver TSC) ni el comportamiento de cada feature (ver su spec).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Feature de sección** | Feature que posee el contenido y la presentación de una de las siete secciones del perfil. No tiene interactividad propia más allá de la que declare su spec. |
| **Feature de armazón** (shell) | Feature que aporta estructura o comportamiento transversal (escena, panel, arranque, ajustes, vista simple) y que presenta o recorre las secciones sin poseer su contenido. |
| **API pública** | Lo que un feature exporta desde su `index.ts`. Es lo único que el resto del código puede importar de él. |
| **Import profundo** | Importar de cualquier archivo de un feature que no sea su `index.ts`, desde fuera de ese feature. |

## 4. Requisitos

### 4.1 Árbol del repositorio

| ID | Requisito |
| --- | --- |
| STR-R01 | El repositorio DEBE tener la estructura de los dos diagramas siguientes. Añadir una carpeta de primer nivel, una carpeta directa de `src/` o un feature exige actualizar antes esta spec. |
| STR-R02 | `.gitignore` DEBE excluir: `docs/`, `node_modules/`, `.next/`, `out/`, `coverage/`, `playwright-report/`, `test-results/`, `.lighthouseci/`, los archivos que generan Next.js y TypeScript (`next-env.d.ts` y `*.tsbuildinfo`) y todos los archivos `.env*` salvo `.env.example`. |
| STR-R03 | La carpeta `docs/` es material privado de entrada (CVs originales, foto original, imágenes de inspiración). El código y la compilación NO DEBEN leer nada de `docs/`. Lo que se publica se copia a su ubicación versionada: la foto a `design/portrait/source.jpg` y los CVs a `public/cv/`. |

```text
.
├── CLAUDE.md                  Instrucciones para agentes; apunta a specs/README.md
├── README.md                  Presentación del repositorio (ver DEP)
├── LICENSE                    Licencias (ver DEP)
├── .dockerignore              Contexto vacío de la imagen (ver TST §4.10)
├── .editorconfig
├── .env.example               Variables de entorno (ver SYS §4.10)
├── .gitignore
├── .nvmrc
├── .prettierignore            Exclusiones de formato (ver TST-R14)
├── .github/
│   └── workflows/
│       ├── ci.yml             Pipeline de CI (ver TST)
│       └── deploy.yml         Publicación en producción (ver DEP)
├── compose.yaml               Servicio `check` en contenedor (ver TST §4.10)
├── Dockerfile                 Réplica local del entorno de CI (ver TST §4.10)
├── eslint.config.mjs
├── lighthouserc.desktop.json  Lighthouse, preajuste de escritorio (ver TST §4.6)
├── lighthouserc.mobile.json   Lighthouse, preajuste móvil (ver TST §4.6)
├── next.config.ts
├── package.json
├── playwright.config.ts
├── pnpm-lock.yaml
├── pnpm-workspace.yaml        Configuración de pnpm (ver SYS §4.11)
├── postcss.config.mjs
├── prettier.config.mjs
├── tsconfig.json
├── vitest.config.ts
├── vitest.setup.ts
├── design/                    Archivos fuente de diseño, versionados
│   ├── portrait/
│   │   └── source.jpg         Fotografía original
│   └── scene/
│       ├── master.png         Máster de la variante fotografía (ver AST)
│       ├── master-sketch.png  Máster de la variante boceto (ver AST §4.10)
│       └── PROVENANCE.md      Procedencia de los dos másteres (ver AST)
├── docs/                      Material privado de entrada. NO versionado
├── e2e/                       Pruebas E2E y de exportación (ver TST §4.5)
├── public/                    Archivos servidos tal cual
│   ├── cv/                    CVs en PDF (ver IO)
│   ├── og/                    Imagen para compartir (generada, versionada; ver SMP)
│   ├── portrait/              Derivados de la fotografía (generados, versionados)
│   └── scene/                 Derivados de la escena (generados, versionados)
├── scripts/
│   ├── assets-shared.mjs      Constantes y funciones comunes de `assets:build` y `assets:check`
│   ├── build-assets.mjs       Script de `assets:build`
│   ├── build-headers.mjs      Genera `out/_headers` tras compilar (ver DEP)
│   ├── check-assets.mjs       Script de `assets:check`
│   ├── run-lighthouse.mjs     Script de `test:lighthouse`
│   ├── serve-static.mjs       Script de `preview`
│   └── smoke-test.mjs         Comprobación del sitio publicado (ver DEP)
├── specs/                     Estas especificaciones
├── src/                       Código de la aplicación (diagrama siguiente)
└── tests/                     Pruebas de repositorio: arquitectura, configuración, lint,
                               scripts y trazabilidad (ver TST §4.4)
```

```text
src/
├── app/                       Rutas y layouts. Solo composición (ver SYS §4.5)
├── features/
│   ├── registry.ts            Registro de secciones (§4.5)
│   ├── boot-sequence/         ┐
│   ├── motherboard-scene/     │
│   ├── detail-panel/          │ Features de armazón
│   ├── settings/              │
│   ├── simple-view/           ┘
│   ├── cpu-profile/           ┐
│   ├── ram-stack/             │
│   ├── ssd-projects/          │
│   ├── psu-experience/        │ Features de sección
│   ├── io-contact/            │
│   ├── fan-ecosystem/         │
│   └── cmos-about/            ┘
├── shared/
│   ├── assets/                manifest.generated.ts (ver AST §4.7)
│   ├── config/                site.ts, routes.ts, render-mode.ts
│   ├── contracts/             Tipos compartidos (ver TSC)
│   ├── i18n/                  Locales y diccionario de interfaz (ver I18N)
│   ├── lib/                   Utilidades puras; pre-paint-script.ts; cn.ts
│   ├── state/                 prefs-store.ts, session-store.ts, ui-store.ts
│   └── ui/                    Primitivas visuales reutilizables; icons/
└── styles/
    ├── globals.css            Reset, estilos base de elementos y variantes de `data-mode`
    │                          y `data-boot` (SYS-R50)
    └── tokens.css             Tokens de diseño (ver VIS)
```

### 4.2 Capas y dependencias

| ID | Requisito |
| --- | --- |
| STR-R04 | Cada capa solo PUEDE importar de las capas que le asigna la tabla siguiente. Todo lo que no está permitido está prohibido. |
| STR-R05 | Desde fuera de un feature solo se PUEDE importar su `index.ts` (por ejemplo `@/features/detail-panel`) o, si existe, su `server.ts` (STR-R33). Los imports profundos están prohibidos. |
| STR-R06 | Un feature NO DEBE importar de otro feature. La única excepción es `registry.ts`, que importa la API pública de los features de sección. |
| STR-R07 | Los features de armazón NO DEBEN importarse entre sí. Se comunican únicamente por la URL o por los stores de `shared/state/`, y se componen en los layouts de `src/app/`. |
| STR-R08 | Dentro de `shared/`, `contracts/` NO DEBE importar de ninguna otra carpeta. El resto de carpetas de `shared/` PUEDEN importarse entre sí siempre que no formen ciclos. |

| Capa | PUEDE importar de |
| --- | --- |
| `src/app/` | API pública de los features de armazón · `features/registry.ts` · `shared/` · `styles/` |
| Feature de armazón | `features/registry.ts` · `shared/` |
| `features/registry.ts` | API pública de los features de sección · `shared/` |
| Feature de sección | `shared/` |
| `shared/` | `shared/` (con las restricciones de STR-R08) |
| `styles/` | Nada |

```text
app ──► armazón ──► registry ──► secciones
 │         │           │             │
 │         └───────────┴─────────────┴──► shared
 │
 └──► registry, shared, styles

(la flecha significa "puede importar de")
```

### 4.3 Catálogo de features

| ID | Requisito |
| --- | --- |
| STR-R09 | `src/features/` DEBE contener exactamente los doce features de esta tabla y `registry.ts`. |

| Carpeta | Tipo | Responsabilidad | Spec |
| --- | --- | --- | --- |
| `boot-sequence` | Armazón | Generar y reproducir el registro de arranque; transición hacia la escena | BOOT |
| `motherboard-scene` | Armazón | Imagen de la escena, zonas interactivas, auras, etiquetas, display de diagnóstico | SCN |
| `detail-panel` | Armazón | Marco del modal, navegación anterior/siguiente, cierre | PNL |
| `settings` | Armazón | Barra fija, menú de ajustes, sonido, reinicio de sesión, cambio de idioma | SET |
| `simple-view` | Armazón | Página plana con todas las secciones; metadatos y SEO | SMP |
| `cpu-profile` | Sección | Contenido y presentación de Perfil | CPU |
| `psu-experience` | Sección | Contenido y presentación de Experiencia | PSU |
| `ssd-projects` | Sección | Contenido y presentación de Proyectos | SSD |
| `ram-stack` | Sección | Contenido y presentación de Stack tecnológico | RAM |
| `io-contact` | Sección | Contenido y presentación de Contacto | IO |
| `fan-ecosystem` | Sección | Contenido y presentación de Ecosistema personal | FAN |
| `cmos-about` | Sección | Contenido y presentación de Acerca de este sitio | CMOS |

### 4.4 Anatomía de un feature

| ID | Requisito |
| --- | --- |
| STR-R10 | Todo feature DEBE tener un `index.ts` que reexporta su API pública y nada más. |
| STR-R33 | Un feature de armazón que tiene a la vez componentes de cliente y componentes de servidor que leen el registro DEBE separar su API pública en dos archivos: `index.ts` exporta lo que puede usarse desde componentes de cliente, y `server.ts` exporta lo que solo puede usarse desde componentes de servidor. `index.ts` NO DEBE reexportar nada que importe el registro. |
| STR-R11 | Un feature solo contiene las subcarpetas de los diagramas siguientes. Una subcarpeta que quedaría vacía no se crea. |
| STR-R12 | La API pública de un **feature de sección** es un único valor: la definición de la sección (tipo `SectionDefinition`, ver TSC), que reúne su slug, su componente de hardware, sus nombres, su contenido en ambos idiomas y su componente de React. |
| STR-R13 | El contenido de una sección vive en la carpeta `content/` de su feature, en tres archivos: `facts.ts` contiene los datos que no dependen del idioma, escritos una sola vez; `es.ts` y `en.ts` contienen los textos de cada idioma y exportan un objeto del mismo tipo. El reparto entre hechos y textos lo define TSC §4.6. |
| STR-R14 | Cada sección tiene **un único componente de React raíz**, que renderiza HTML semántico sin conocer dónde se muestra. El panel de detalle y la vista simple presentan ese mismo componente; NO DEBE existir una segunda implementación de una sección. |

#### Feature de sección

```text
src/features/ssd-projects/
├── index.ts                   Exporta la definición de la sección
├── types.ts                   Tipos del contenido de esta sección
├── content/
│   ├── facts.ts               Datos que no dependen del idioma
│   ├── es.ts                  Textos en español
│   └── en.ts                  Textos en inglés
├── components/                Componentes de React de la sección
│   └── projects-section.tsx   Componente raíz
└── lib/                       Lógica pura propia de la sección (si la hay)
```

#### Feature de armazón

```text
src/features/detail-panel/
├── index.ts                   Exporta los componentes y hooks públicos
├── server.ts                  Solo si aplica STR-R33: API para componentes de servidor
├── types.ts                   Tipos propios (si los hay)
├── components/                Vistas
├── hooks/                     Estado y efectos
└── lib/                       Lógica pura
```

Los archivos de estilos (`*.styles.ts`) y de prueba (`*.test.ts`, `*.test.tsx`) se colocan junto al archivo al que pertenecen.

### 4.5 Registro de secciones

| ID | Requisito |
| --- | --- |
| STR-R15 | `src/features/registry.ts` es el único punto por el que el resto del código accede a las secciones. DEBE exportar la lista de las siete definiciones en el orden canónico (VSN §4), la lista de las seis primarias y una función para obtener una definición a partir de su `SectionSlug`. Los nombres y tipos exactos se definen en TSC. |
| STR-R16 | Quien necesite datos de una sección (título, nombre del hardware, contenido, componente) DEBE obtenerlos del registro. Esto incluye las etiquetas de la escena, los títulos del panel, la vista simple, la secuencia de arranque y los metadatos. |
| STR-R17 | Añadir una sección en el futuro DEBE consistir en crear su feature y añadir una entrada al registro, sin modificar los features de armazón. |

### 4.6 Separación de vista, lógica y estilos

| ID | Requisito |
| --- | --- |
| STR-R18 | **Vista** (`components/*.tsx`): contiene marcado y composición. PUEDE llamar hooks y recorrer datos para renderizarlos. NO DEBE contener `useEffect`, acceso a `window`, `document` o almacenamiento, ni transformación de datos que no sea trivial. |
| STR-R19 | **Hook** (`hooks/use-*.ts`): contiene estado, efectos y suscripciones. NO DEBE devolver JSX. |
| STR-R20 | **Lógica pura** (`lib/*.ts`): funciones deterministas sin React ni DOM. Toda función de `lib/` DEBE tener pruebas unitarias. |
| STR-R21 | **Estilos:** se aplican con clases de utilidad de Tailwind que referencian los tokens de VIS. Cuando las clases de un componente dependen de una variante o de un estado con dos o más valores, los mapas de clases se extraen a `<componente>.styles.ts` y la vista selecciona por clave. |
| STR-R22 | NO DEBEN aparecer colores literales (hexadecimal, `rgb()`, `hsl()`, `oklch()`) en ningún archivo de `src/`, salvo en `src/styles/tokens.css`, en los archivos generados (`*.generated.ts`) y en `src/app/icon.svg`. |
| STR-R23 | El atributo `style` solo PUEDE usarse para valores numéricos calculados en runtime que no se pueden expresar como clase (coordenadas de una zona interactiva, valor de una propiedad personalizada de CSS). |
| STR-R24 | NO DEBEN usarse CSS Modules, CSS-in-JS ni etiquetas `<style>` escritas a mano. Las únicas hojas de estilo son las dos de `src/styles/`. |

### 4.7 Componentes de servidor y de cliente

| ID | Requisito |
| --- | --- |
| STR-R25 | Un archivo es componente de servidor salvo que necesite estado, efectos, manejadores de eventos o APIs del navegador. La directiva `"use client"` se coloca en el archivo más bajo del árbol que la necesite. |
| STR-R26 | El componente raíz de cada sección DEBE ser componente de servidor (SYS-R31). Un feature de sección solo PUEDE contener un componente de cliente si su spec lo exige de forma explícita y nombra ese componente. |
| STR-R27 | Los stores de `shared/state/` solo se leen desde componentes de cliente y hooks. |
| STR-R32 | Ningún archivo con la directiva `"use client"`, ni ningún archivo de `src/` que este importe directa o indirectamente, DEBE importar `features/registry.ts`, un feature de sección o un archivo `server.ts`. De lo contrario, todo el contenido del sitio y los componentes de sección acabarían en el JavaScript del cliente. Los componentes de cliente reciben los datos de las secciones por propiedades (SYS-R49). |

### 4.8 Nomenclatura

| ID | Requisito |
| --- | --- |
| STR-R28 | Las reglas de la tabla siguiente son obligatorias en todo `src/`, `e2e/`, `tests/` y `scripts/`. |

| Elemento | Regla | Ejemplo |
| --- | --- | --- |
| Carpetas y archivos | `kebab-case` | `detail-panel/`, `use-render-mode.ts` |
| Componente de React | `PascalCase`; el archivo lleva el mismo nombre en `kebab-case`; un componente exportado por archivo | `detail-panel.tsx` exporta `DetailPanel` |
| Hook | Nombre `useX`; archivo `use-x.ts` | `use-render-mode.ts` exporta `useRenderMode` |
| Tipos e interfaces | `PascalCase`, sin prefijos | `SectionDefinition` |
| Funciones y variables | `camelCase`; los booleanos empiezan por `is`, `has` o `should` | `isPrimarySection` |
| Constantes de módulo inmutables | `UPPER_SNAKE_CASE` | `RENDER_MODE_QUERY` |
| Mapas de clases | Archivo `<componente>.styles.ts` | `hotspot.styles.ts` |
| Prueba unitaria o de componente | `<archivo>.test.ts` o `.test.tsx`, junto al archivo probado | `build-boot-log.test.ts` |
| Prueba E2E | `e2e/<flujo>.spec.ts` | `e2e/open-section.spec.ts` |
| Archivo generado | Sufijo `.generated.ts`; primera línea con un comentario que indica que no se edita a mano y qué script lo produce | `manifest.generated.ts` |
| Exportaciones | Siempre con nombre. La exportación por defecto solo se usa donde Next.js o una herramienta la exige (`page.tsx`, `layout.tsx`, `not-found.tsx`, `robots.ts`, `sitemap.ts` y archivos de configuración) | — |
| Imports | Alias `@/` (equivale a `src/`) para cruzar límites de feature o de carpeta de `shared/`; rutas relativas solo dentro del mismo feature o de la misma carpeta de `shared/` | `import { cn } from "@/shared/lib/cn"` |

### 4.9 Cumplimiento automático

| ID | Requisito |
| --- | --- |
| STR-R29 | Las reglas STR-R04 a STR-R09, STR-R22 y STR-R26 DEBEN comprobarse con **pruebas de arquitectura** en `tests/architecture/`, ejecutadas por `pnpm test`. Estas pruebas leen los archivos de `src/` y fallan con un mensaje que indica el archivo, la línea y la regla incumplida. |
| STR-R30 | La lógica de detección de las pruebas de arquitectura DEBE ser una función pura con sus propias pruebas unitarias sobre casos de ejemplo válidos e inválidos, de modo que se pueda demostrar que detecta cada tipo de infracción. |
| STR-R31 | La regla de exportaciones con nombre (STR-R28) DEBE comprobarse con ESLint. ESLint PUEDE reproducir además las reglas de límites para dar aviso en el editor, pero la fuente de verdad del cumplimiento son las pruebas de arquitectura. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| STR-AC01 | Las carpetas directas de `src/` son exactamente `app`, `features`, `shared` y `styles`; las entradas de `src/features/` son exactamente las de STR-R09; las carpetas de `src/shared/` son exactamente las de §4.1. | Prueba de arquitectura |
| STR-AC02 | Ningún archivo importa en contra de la tabla de STR-R04. | Prueba de arquitectura |
| STR-AC03 | No existe ningún import profundo hacia un feature. | Prueba de arquitectura |
| STR-AC04 | Ningún feature importa de otro feature, salvo `registry.ts` hacia los `index.ts` de los features de sección. | Prueba de arquitectura |
| STR-AC05 | Ningún archivo de `src/shared/` importa de `src/features/` ni de `src/app/`; ningún archivo de `src/shared/contracts/` importa de otra carpeta. | Prueba de arquitectura |
| STR-AC06 | Todo feature tiene `index.ts`, y cada feature de sección tiene `content/facts.ts`, `content/es.ts` y `content/en.ts`, y ningún otro archivo en `content/` salvo sus pruebas. | Prueba de arquitectura |
| STR-AC07 | No hay colores literales en `src/` fuera de los tres lugares que permite STR-R22. | Prueba de arquitectura |
| STR-AC08 | La directiva `"use client"` no aparece en ningún feature de sección, salvo en los archivos que su spec nombre de forma explícita. La lista de excepciones vive en la propia prueba y cita el requisito que la autoriza. | Prueba de arquitectura |
| STR-AC09 | Para cada tipo de infracción de STR-AC02 a STR-AC08 existe al menos un caso de ejemplo inválido que la función de detección marca y uno válido que no marca. | Prueba unitaria de la función de detección |
| STR-AC10 | ESLint marca una exportación por defecto en un archivo que no está en la lista de STR-R28 y no la marca en `page.tsx`, `layout.tsx` ni en un archivo de configuración. | Prueba unitaria que ejecuta ESLint sobre fragmentos de ejemplo |
| STR-AC12 | Ningún archivo alcanzable por imports desde un archivo con `"use client"` importa `features/registry.ts`, un feature de sección ni un `server.ts` (STR-R32). La función de detección marca un caso directo y uno indirecto. | Prueba de arquitectura |
| STR-AC11 | Ningún archivo de `src/`, `scripts/`, `e2e/` o `tests/` lee rutas dentro de `docs/`. | Prueba de arquitectura |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **El contenido vive dentro del feature de su sección** (STR-R13, D-30). | Cada spec de sección corresponde a una sola carpeta: quien implementa o corrige "Proyectos" abre un único lugar. La alternativa, una carpeta global de contenido, separa los datos de la única vista que los presenta. |
| **Hechos en un archivo aparte de los textos** (STR-R13, D-33). | Con solo un archivo por idioma, fechas, enlaces y cifras se escribirían dos veces y podrían divergir, en contra de SYS-R30. Ver TSC §6. |
| **Un único componente por sección para el panel y la vista simple** (STR-R14). | Garantiza por construcción que ambas presentaciones muestran lo mismo y reduce el código a la mitad. El marco visual (modal o página) lo pone quien lo contiene. |
| **Dos tipos de feature y un registro** (§4.2, §4.5). | La escena, el panel, la vista simple y el arranque necesitan recorrer todas las secciones. El registro les da un único punto de acceso y mantiene a las secciones sin dependencias entre sí; sin él, cada armazón importaría siete features. |
| **Los armazones no se importan entre sí** (STR-R07). | Evita acoplamientos difíciles de ver (por ejemplo, la escena conociendo los ajustes). Lo que comparten es estado, y el estado ya tiene dueño en `shared/state/` o en la URL. |
| **Dos entradas públicas, `index.ts` y `server.ts`** (STR-R32, STR-R33). | El registro reúne todo el contenido y los componentes de sección. Si un componente de cliente lo importara, aunque fuera a través de un `index.ts` que reexporta otras cosas, ese contenido se empaquetaría para el navegador. Separar las entradas hace que el error sea visible en el propio `import` y comprobable por una prueba. |
| **Pruebas de arquitectura como mecanismo único** (STR-R29). | Una sola implementación de las reglas, independiente de la herramienta de lint y ejecutada en CI. Sus propias pruebas demuestran que detecta lo que dice detectar. |
| **Vista sin efectos ni acceso al navegador** (STR-R18). | Es la forma concreta de "separar lógica de presentación": las vistas quedan triviales de leer y los hooks y funciones puras concentran lo que merece pruebas. |
| **`kebab-case` en todos los archivos** (STR-R28). | Un único criterio evita discusiones y problemas en sistemas de archivos que no distinguen mayúsculas. |
| **`docs/` fuera del control de versiones** (STR-R02, STR-R03, D-22). | Contiene material que no debe publicarse (CV antiguo, imágenes de inspiración con datos falsos). Lo publicable se copia a ubicaciones explícitas. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.7 | Durante M2, por delegación del autor. Árbol: se añade `scripts/assets-shared.mjs`, para que la lista de derivados, sus pesos máximos y la medición del brillo estén escritos una sola vez. |
| 2026-10-13 | 1.6 | Por decisión del autor (D-66 y D-67). Árbol: se añaden `design/scene/master-sketch.png`, `Dockerfile`, `compose.yaml` y `.dockerignore`. |
| 2026-10-13 | 1.5 | Decidido por delegación del autor durante M0. STR-R02: `.gitignore` excluye también `next-env.d.ts` y `*.tsbuildinfo`, que se regeneran en cada compilación; `pnpm typecheck` pasa en una copia limpia sin ellos. |
| 2026-10-13 | 1.4 | Cabecera: se retira la marca de enmienda pendiente; el autor confirmó el 2026-10-13 que todas las enmiendas están aprobadas. Sin cambio de requisitos. |
| 2026-10-12 | 1.4 | Confirmada por el autor el 2026-10-13. Árbol: se añaden `.github/workflows/deploy.yml`, `scripts/build-headers.mjs` y `scripts/smoke-test.mjs` (DEP). |
| 2026-10-12 | 1.3 | Catálogo de features en el orden canónico de D-46. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Versión inicial. Aprobada por el autor. |
| 2026-10-12 | 1.1 | Confirmada por el autor el 2026-10-12. STR-R13 y STR-AC06: se añade `content/facts.ts` para los datos que no dependen del idioma (D-33). Árbol del repositorio: dos archivos de configuración de Lighthouse en lugar de uno y nuevo script `run-lighthouse.mjs` (TST §4.6), y nuevo `.prettierignore` (TST-R14). STR-AC09 y STR-AC10: verificación reescrita con el vocabulario de README §4.5. |
| 2026-10-12 | 1.2 | Confirmada por el autor el 2026-10-12. Nuevos STR-R32 (los componentes de cliente no importan el registro) y STR-R33 (entrada `server.ts`), con STR-AC12. STR-R22 y STR-AC07: se exceptúan los archivos generados y `icon.svg`. Árbol: se añade `public/og/` y se retira `public/sounds/` (D-50). |
