# SYS — Visión general del sistema

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.6 |
| Última actualización | 2026-10-13 |
| Depende de | VSN |

## 1. Propósito

Fijar las decisiones técnicas que afectan a todo el sistema: tecnologías y versiones, configuración del framework, rutas, modos de render, estado global y flujo del contenido. Cualquier funcionalidad se construye dentro de este marco.

## 2. Alcance

**Incluye:** stack y versiones, configuración de Next.js, mapa de rutas, modos de render, árbol de layouts, propiedad del estado, scripts del proyecto, variables de entorno, política de dependencias y navegadores admitidos.

**No incluye:** la organización de carpetas (ver STR), los tipos de datos (ver TSC), las reglas de traducción (ver I18N), las pruebas y CI (ver TST), ni el despliegue (ver DEP).

## 3. Vista general

```text
                    Navegador del visitante
┌───────────────────────────────────────────────────────────────┐
│  HTML estático por ruta (generado en compilación)             │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Capa base: VISTA SIMPLE (HTML del servidor, sin JS)     │  │
│  └─────────────────────────────────────────────────────────┘  │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │ Mejora progresiva: ESCENA (solo si viewport ≥ 1024×600) │  │
│  │   arranque → imagen + zonas + auras → panel de detalle  │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                               │
│  Fuente de verdad:  URL ──► idioma y sección abierta          │
│                     Zustand ──► sonido, arranque visto,       │
│                                 secciones visitadas           │
└───────────────────────────────────────────────────────────────┘
        ▲                                         ▲
        │ archivos estáticos                      │ ningún API propio
┌───────┴────────┐                       ┌────────┴─────────┐
│ Hosting        │                       │ Contenido tipado │
│ estático (CDN) │                       │ dentro del código│
└────────────────┘                       └──────────────────┘
```

El sistema es un **monolito de frontend sin servidor de aplicación**. Todo el contenido está en el código fuente como datos tipados; la compilación produce una carpeta de archivos estáticos.

## 4. Requisitos

### 4.1 Stack fijado

Versiones verificadas contra el registro de npm el 2026-10-12. La combinación Next.js 16.4.0 + React 19.3.0 + TypeScript 6.0.3 con exportación estática se validó ese día con un prototipo desechable (ver §6).

**Versiones de arranque.** La implementación empieza el 2026-10-13, antes de que las versiones más recientes cumplan la edad mínima de SYS-R37. En aplicación de SYS-R03, la tabla fija la versión anterior más reciente que sí la cumple para diez paquetes: `next` y `eslint-config-next` 16.3.8 (en lugar de 16.4.0), `@playwright/test` 1.63.0 (1.64.0), `vite` 8.3.2 (8.3.4), `motion` 14.0.0 (14.1.0), `@types/node` 24.19.1 (24.19.2), `prettier` 3.9.9 (3.9.10), `vitest` y `@vitest/coverage-v8` 5.0.3 (5.0.4) y `typescript-eslint` 8.71.1 (8.71.2). Además `eslint` baja a 9.39.5, porque `eslint-config-next` 16.3.8 no funciona con ESLint 10. Esta combinación se instaló, compiló, analizó y probó en el prototipo el 2026-10-13 con la regla de 7 días activa y sin excepciones. Subir a las versiones entre paréntesis y a ESLint 10.12.0 es un cambio opcional a partir del 2026-10-20, en un solo commit que actualice esta tabla.

| ID | Requisito |
| --- | --- |
| SYS-R01 | El proyecto DEBE usar exactamente las versiones de la tabla siguiente. Las dependencias se declaran con versión exacta, sin `^` ni `~`. |
| SYS-R02 | Las dependencias pares que no aparecen en la tabla se instalan en la versión más reciente que satisfaga el rango exigido y quedan fijadas por el lockfile. |
| SYS-R03 | Cambiar una versión de la tabla exige actualizar esta tabla en el mismo cambio. Si una versión fijada aún no cumple la edad mínima de SYS-R37, se usa la inmediatamente anterior que la cumpla y se anota aquí. |
| SYS-R04 | NO DEBE añadirse ninguna dependencia de producción que no esté en esta tabla sin añadirla antes aquí con su justificación. |

#### Entorno

| Herramienta | Versión | Dónde se fija |
| --- | --- | --- |
| Node.js | 24 (LTS activa) | `.nvmrc` con el valor `24`; `engines.node` = `>=24` |
| pnpm | 11.28.4 | Campo `packageManager` de `package.json` |

#### Dependencias de producción

| Paquete | Versión | Función |
| --- | --- | --- |
| `next` | 16.3.8 | Framework (App Router, exportación estática) |
| `react`, `react-dom` | 19.3.0 | Librería de interfaz |
| `motion` | 14.0.0 | Animaciones (sucesor del paquete `framer-motion`) |
| `zustand` | 5.0.15 | Estado de sesión y preferencias |

#### Dependencias de desarrollo

| Paquete | Versión | Función |
| --- | --- | --- |
| `typescript` | 6.0.3 | Tipado estático |
| `@types/react`, `@types/react-dom` | 19.3.0 | Tipos de React |
| `@types/node` | 24.19.1 | Tipos de Node |
| `tailwindcss`, `@tailwindcss/postcss` | 4.3.3 | Estilos por utilidades |
| `eslint` | 9.39.5 | Análisis estático |
| `eslint-config-next` | 16.3.8 | Reglas de Next.js |
| `typescript-eslint` | 8.71.1 | Reglas de TypeScript |
| `eslint-config-prettier` | 10.1.8 | Desactiva reglas que chocan con Prettier |
| `prettier` | 3.9.9 | Formato |
| `prettier-plugin-tailwindcss` | 0.8.1 | Orden de clases de Tailwind |
| `vitest` | 5.0.3 | Pruebas unitarias y de componentes |
| `@vitest/coverage-v8` | 5.0.3 | Medición de cobertura (TST-R08) |
| `vite` | 8.3.2 | Requerido por Vitest |
| `@vitejs/plugin-react` | 6.1.2 | Soporte de React en Vitest |
| `jsdom` | 30.1.2 | DOM simulado para pruebas |
| `@testing-library/react` | 16.3.3 | Pruebas de componentes de React |
| `@testing-library/user-event` | 14.6.7 | Simulación de interacción |
| `@testing-library/jest-dom` | 7.0.1 | Aserciones de DOM |
| `@playwright/test` | 1.63.0 | Pruebas de extremo a extremo |
| `@axe-core/playwright` | 4.13.0 | Comprobación automática de accesibilidad |
| `@lhci/cli` | 0.15.1 | Lighthouse en CI |
| `sharp` | 0.35.5 | Generación de derivados de imagen (solo scripts) |

#### Excluido a propósito

| No se usa | Qué se usa en su lugar | Razón |
| --- | --- | --- |
| Librería de i18n (`next-intl`, `i18next`) | Diccionarios TypeScript propios (ver I18N) | Dos idiomas y contenido estático; el compilador ya garantiza la paridad de claves. |
| Librería de validación en runtime (`zod`) | Tipos de TypeScript y una prueba de integridad de contenido | No entra ningún dato externo en runtime; todo el contenido se comprueba al compilar y en las pruebas. |
| Librería de audio (`howler`) | Web Audio API nativa | Son pocos efectos cortos. |
| Librería de componentes UI (Radix, shadcn, Headless UI) | Elemento `<dialog>` nativo y componentes propios | El único patrón complejo es el modal, y `<dialog>` ya aporta captura de foco, cierre con Esc y fondo inerte. |
| Librería de iconos | SVG en línea en `src/shared/ui/icons/` | Se usan pocos iconos; evita peso y dependencia. |
| `next/image` | Elemento `<picture>` con derivados pregenerados (ver AST) | La exportación estática no tiene optimizador de imágenes; los derivados se generan una vez con `sharp`. |
| TypeScript 7 | TypeScript 6.0.x | `typescript-eslint` 8.71.2 exige `typescript` menor que 6.1.0. |
| Three.js / React Three Fiber | Imagen pre-renderizada con capa SVG | Ver D-02. |

### 4.2 Configuración de Next.js

| ID | Requisito |
| --- | --- |
| SYS-R05 | `next.config.ts` DEBE establecer `output: "export"`, `trailingSlash: true`, `images: { unoptimized: true }`, `reactStrictMode: true` y `agentRules: false`. Este último impide que `next dev` añada por su cuenta un bloque de texto a `CLAUDE.md`, que es un archivo del autor. |
| SYS-R06 | Todas las rutas DEBEN generarse de forma estática en compilación. Los segmentos dinámicos declaran `generateStaticParams` y `export const dynamicParams = false`. |
| SYS-R07 | NO DEBEN usarse funciones que requieran servidor en runtime: manejadores de ruta dinámicos, middleware o proxy, Server Actions, `cookies()`, `headers()`, ni revalidación. |

### 4.3 Rutas

`{locale}` ∈ `es`, `en`. `{section}` ∈ `profile`, `experience`, `projects`, `stack`, `contact`, `ecosystem`, `about` (los `SectionSlug` de VSN §4).

| Ruta | Qué muestra |
| --- | --- |
| `/` | Página de redirección por idioma (SYS-R08). |
| `/{locale}/` | **Inicio.** En modo `scene`: la escena sin panel abierto. En modo `simple`: la vista simple. |
| `/{locale}/{section}/` | En modo `scene`: la escena con el panel de esa sección abierto. En modo `simple`: la vista simple, desplazada hasta esa sección. |
| `/{locale}/cv/` | La vista simple, siempre, sea cual sea el viewport. |
| Cualquier otra | Página 404 estática. |

| ID | Requisito |
| --- | --- |
| SYS-R08 | `/` DEBE redirigir en el cliente, con `location.replace`, a `/{locale}/` según esta prioridad: (1) el idioma guardado en preferencias (§4.6), si existe y es válido; (2) `es` si algún elemento de `navigator.languages` empieza por `es`; (3) `en` en cualquier otro caso. Sin JavaScript, la página DEBE mostrar un enlace a cada idioma. |
| SYS-R09 | La compilación DEBE producir exactamente estos documentos HTML: `/`, `/es/`, `/en/`, las 14 combinaciones `/{locale}/{section}/`, `/es/cv/`, `/en/cv/` y la página 404. |
| SYS-R10 | `cv` es un segmento reservado y NO DEBE usarse nunca como `SectionSlug`. |
| SYS-R11 | Una spec de sección PUEDE definir fragmentos (`#...`) para enlazar a un elemento dentro de la sección. El fragmento nunca cambia qué sección está abierta. |

### 4.4 Modos de render

El **modo de render** decide si el visitante ve la escena o la vista simple.

| ID | Requisito |
| --- | --- |
| SYS-R12 | El modo es `scene` si y solo si JavaScript se ejecuta **y** se cumple la consulta de medios `(min-width: 1024px) and (min-height: 600px)`. En cualquier otro caso es `simple`. La consulta DEBE estar definida en una única constante (`src/shared/config/render-mode.ts`) de la que leen todos los consumidores. |
| SYS-R13 | En las páginas de inicio y de sección, un script en línea síncrono situado en `<head>` (el **script previo al pintado**) DEBE escribir `data-mode="scene"` o `data-mode="simple"` en el elemento `<html>` antes del primer pintado. |
| SYS-R14 | El HTML del servidor de esas páginas DEBE contener siempre la vista simple completa como capa base. El CSS la muestra por defecto y la oculta con `display: none` solo cuando `<html>` tiene `data-mode="scene"`. La capa de la escena está oculta salvo con `data-mode="scene"`. |
| SYS-R15 | En modo `scene` a 1280×720 px, el visitante NO DEBE ver la vista simple en ningún fotograma durante la carga. |
| SYS-R16 | En modo `simple` NO DEBE solicitarse ningún archivo de la imagen de la escena, NO DEBE mostrarse la secuencia de arranque y NO DEBE reproducirse sonido. |
| SYS-R17 | El modo DEBE actualizarse sin recargar la página cuando el viewport cruza el umbral (cambio de tamaño de ventana o rotación del dispositivo). |
| SYS-R18 | En modo `simple`, al cargar `/{locale}/{section}/` con JavaScript activo, la página DEBE desplazarse hasta el ancla de esa sección. Sin JavaScript se muestra la vista simple desde el inicio; esta limitación es aceptada. |
| SYS-R19 | `/{locale}/cv/` NO DEBE incluir el script previo al pintado ni la capa de la escena. |
| SYS-R20 | El script previo al pintado es el único script en línea escrito por el proyecto en las páginas de locale. Sus responsabilidades son exactamente cuatro: fijar `data-mode` (SYS-R13), fijar `data-boot` (definido en BOOT), fijar `data-scene` con la precarga de su imagen (SYS-R51) y programar el temporizador de respaldo que pasa la página a `data-mode="simple"` si el código de la aplicación no se inicia (QLT-R43). Su código fuente vive en un único módulo (`src/shared/lib/pre-paint-script.ts`). Fijar `data-boot` incluye anotar en `data-boot-skip` la primera pulsación que salta el arranque, si llega antes de que cargue el código (BOOT-R18). |
| SYS-R44 | El elemento `<html>` de las páginas de inicio y de sección lleva `suppressHydrationWarning`: el script previo al pintado le añade atributos antes de la hidratación y, sin esa propiedad, React emitiría una advertencia en consola (QLT-R40). |
| SYS-R51 | El script previo al pintado escribe en `<html>` el atributo `data-scene` con la variante de escena guardada en preferencias (§4.6), si es válida, o con `photo` en otro caso. En modo `scene` inserta además en `<head>` la precarga de la imagen de esa variante (SCN-R36). Cuando el visitante cambia de variante, el código de la aplicación actualiza el atributo (SCN-R43). |

En modo `scene`, el contenido de la sección abierta existe dos veces en el documento: en la capa base, que está oculta, y en el panel. Los identificadores no se repiten porque cada instancia usa un `idScope` distinto (TSC-R31 a TSC-R33). En el HTML exportado ese contenido aparece una sola vez, en la capa base (SYS-R48).

### 4.5 Árbol de layouts

| ID | Requisito |
| --- | --- |
| SYS-R21 | La estructura de `src/app/` DEBE ser la del diagrama siguiente. |
| SYS-R22 | El atributo `lang` de `<html>` DEBE coincidir con el locale de la ruta. Las páginas `/` y 404 usan `lang="en"`. |
| SYS-R23 | La escena DEBE vivir en el layout del grupo `(scene)` para que **no se desmonte** al navegar entre el inicio y las secciones: abrir, cerrar o cambiar de panel no recarga la imagen ni repite el arranque. |
| SYS-R24 | Abrir, cerrar y cambiar de sección DEBEN ser navegaciones del lado del cliente entre rutas (componente `Link` o el enrutador de Next.js), nunca estado local. El botón Atrás del navegador cierra el panel abierto. |
| SYS-R52 | El elemento `<html>`, con su atributo `lang` y las variables de las fuentes, lo renderiza el layout de cada grupo de rutas y no el de `[locale]`: solo así el script previo al pintado queda dentro de `<head>` en las páginas del grupo `(scene)` y no existe en las del grupo `(plain)` (SYS-R13, SYS-R19). Una navegación del lado del cliente que cambia de grupo o de idioma vuelve a montar `<html>`, y React elimina los atributos que escribió el script previo al pintado; `SceneLayer` y `Scene` los restablecen antes del siguiente pintado (SYS-R47, SCN-R43). |

```text
src/app/
├── layout.tsx                 Raíz. Solo devuelve `children` (no renderiza <html>).
├── page.tsx                   "/"  Redirección por idioma. Renderiza su propio <html lang="en">.
├── not-found.tsx              404. Renderiza su propio <html lang="en">.
├── icon.svg                   Icono del sitio (ver SMP).
├── apple-icon.png             Icono para iOS, generado (ver SMP).
├── robots.ts                  robots.txt (ver SMP).
├── sitemap.ts                 sitemap.xml (ver SMP).
└── [locale]/
    ├── layout.tsx             Estilos globales, metadatos base y StoreHydrator (TSC-R52).
    │                          No renderiza <html>: lo hace el layout de cada grupo (SYS-R52).
    ├── (scene)/
    │   ├── layout.tsx         <html lang={locale}> con el script previo al pintado en <head>,
    │   │                      capa base y capa de escena (§4.13).
    │   ├── scene-layer.tsx    Componente de cliente SceneLayer (SYS-R47).
    │   ├── page.tsx           "/{locale}/"            No renderiza nada: no hay panel.
    │   └── [section]/
    │       └── page.tsx       "/{locale}/{section}/"  Renderiza el contenido de la sección,
    │                                                  que SceneLayer muestra en el panel.
    └── (plain)/
        ├── layout.tsx         <html lang={locale}> sin script previo al pintado (SYS-R19).
        └── cv/
            └── page.tsx       "/{locale}/cv/"         Vista simple.
```

### 4.6 Estado y persistencia

| ID | Requisito |
| --- | --- |
| SYS-R25 | Cada dato de estado tiene una única fuente de verdad, según la tabla siguiente. NO DEBE duplicarse en otra. |
| SYS-R26 | El HTML del servidor NO DEBE depender de ningún valor persistido. Los valores persistidos se aplican después de la hidratación, con la única excepción de lo que resuelve el script previo al pintado. |
| SYS-R27 | Todo acceso a `localStorage` y `sessionStorage` DEBE estar protegido: si el almacenamiento no existe, lanza una excepción o contiene datos con forma inesperada, la aplicación usa los valores por defecto en memoria y sigue funcionando. |
| SYS-R28 | Las claves de almacenamiento DEBEN ser exactamente las de la tabla. El sitio NO DEBE usar cookies. |

| Dato | Fuente de verdad | Persistencia | Valor por defecto |
| --- | --- | --- | --- |
| Idioma activo | Segmento `{locale}` de la URL | — | — |
| Sección abierta | Segmento `{section}` de la URL | — | Ninguna |
| Modo de render | Consulta de medios (SYS-R12) | — | `simple` |
| Idioma preferido | Store de preferencias | `localStorage`, clave `portfolio:v1:prefs`, campo `locale` | Sin valor |
| Sonido activado | Store de preferencias | `localStorage`, clave `portfolio:v1:prefs`, campo `soundEnabled` | `false` |
| Variante de escena | Store de preferencias | `localStorage`, clave `portfolio:v1:prefs`, campo `sceneVariant` | `photo` |
| Arranque ya visto | Store de sesión | `sessionStorage`, clave `portfolio:v1:session`, campo `bootSeen` | `false` |
| Secciones visitadas | Store de sesión | `sessionStorage`, clave `portfolio:v1:session`, campo `visited` (lista de `ComponentId` primarios) | Lista vacía |
| Ajustes abiertos | Store de interfaz | Ninguna (memoria) | `false` |

- El idioma preferido se escribe cada vez que el visitante cambia de idioma de forma explícita, y solo lo lee la redirección de `/` (SYS-R08).
- Los tres stores viven en `src/shared/state/`: `prefs-store.ts`, `session-store.ts` y `ui-store.ts`. Su forma exacta se define en TSC.
- El prefijo `v1` de las claves es la versión del esquema: si cambia la forma de los datos, se cambia el prefijo y los datos antiguos se ignoran.

### 4.7 Flujo del contenido

| ID | Requisito |
| --- | --- |
| SYS-R29 | Todo el contenido visible vive en el código como datos tipados en español e inglés. No hay CMS ni peticiones de datos en runtime. |
| SYS-R30 | Cada dato de contenido DEBE escribirse una sola vez. La escena, el panel, la vista simple, la secuencia de arranque y los metadatos lo leen de la misma fuente, a través del registro de secciones (ver STR §4.5). |
| SYS-R31 | El componente raíz de cada sección DEBE ser un componente de servidor de React (sin `"use client"`), de modo que su HTML se genere en compilación y no añada JavaScript al cliente. Las excepciones dentro de una sección se rigen por STR-R26. |

### 4.8 Imágenes y fuentes

| ID | Requisito |
| --- | --- |
| SYS-R32 | La imagen de la escena y la fotografía se sirven desde derivados pregenerados y versionados en el repositorio, descritos por un manifiesto (ver AST §4.7). |
| SYS-R33 | Las fuentes tipográficas se cargan con `next/font/google`, que las descarga en compilación y las sirve desde el propio sitio. En runtime NO DEBE haber ninguna petición a dominios de Google. |

### 4.9 Scripts del proyecto

| ID | Requisito |
| --- | --- |
| SYS-R34 | `package.json` DEBE definir exactamente estos scripts, con este comportamiento. |

| Script | Comportamiento |
| --- | --- |
| `dev` | Servidor de desarrollo de Next.js. |
| `build` | Compilación de producción; deja el sitio estático en `out/` y, a continuación, genera `out/_headers` con `scripts/build-headers.mjs` (ver DEP). |
| `preview` | Sirve `out/` como archivos estáticos en el puerto 4173 con `scripts/serve-static.mjs` (sin dependencias; resuelve `index.html` de carpetas, devuelve `404.html` con estado 404, aplica a cada respuesta las cabeceras de `out/_headers`, para que las pruebas se ejecuten bajo la misma política de seguridad que producción, y comprime con gzip las respuestas de texto, como hace el alojamiento; ver DEP-R20). |
| `lint` | ESLint sobre todo el repositorio; cero advertencias permitidas. |
| `typecheck` | `tsc --noEmit`. |
| `format` | Prettier con escritura. |
| `format:check` | Prettier en modo comprobación. |
| `test` | Vitest, una pasada, con medición de cobertura (TST-R08). |
| `test:watch` | Vitest en modo observación. |
| `test:e2e` | Playwright contra el sitio exportado servido por `preview`. |
| `test:lighthouse` | Lighthouse CI contra el sitio exportado, con los umbrales de QLT (TST §4.6). |
| `assets:build` | Genera los derivados de imagen y el manifiesto (ver AST). |
| `assets:check` | Comprueba que derivados y manifiesto corresponden al máster (ver AST). |
| `check` | Ejecuta, en este orden y deteniéndose en el primer fallo: `format:check`, `lint`, `typecheck`, `test`, `assets:check`, `build`, `test:e2e`. Es la misma puerta que ejecuta CI, que añade `test:lighthouse`. |
| `check:docker` | Ejecuta `check` dentro de la imagen que reproduce el entorno de CI, con los tres motores de Playwright (TST §4.10). |

### 4.10 Variables de entorno

| ID | Requisito |
| --- | --- |
| SYS-R35 | El proyecto DEBE compilar con una única variable obligatoria, `NEXT_PUBLIC_SITE_URL`: el origen público del sitio, sin barra final (por ejemplo `https://ejemplo.pages.dev`). Se usa para URLs absolutas en metadatos, `hreflang` y sitemap. Si falta en una compilación de producción, la compilación DEBE fallar con un mensaje que nombre la variable. |
| SYS-R36 | El repositorio DEBE incluir `.env.example` con todas las variables y sin valores secretos. El proyecto no maneja ningún secreto. Si DEP añade variables de despliegue, DEBE registrarlas también en esta sección. DEP no añade ninguna al proyecto: los dos secretos de la publicación (DEP-R14) se guardan en GitHub y solo los lee `deploy.yml`. |

### 4.11 Cadena de suministro y seguridad

| ID | Requisito |
| --- | --- |
| SYS-R37 | pnpm DEBE rechazar versiones publicadas hace menos de 7 días (`minimumReleaseAge: 10080`, en minutos). NO DEBE usarse `minimumReleaseAgeExclude`: la regla no tiene excepciones. |
| SYS-R38 | Ningún paquete ejecuta scripts de instalación sin una decisión explícita: con `strictDepBuilds: true` la instalación falla si un paquete con scripts no figura en `allowBuilds`, y cada entrada de `allowBuilds` lleva un comentario con su razón. |
| SYS-R45 | `pnpm-workspace.yaml` DEBE contener exactamente los ajustes de la tabla que cierra este apartado. |
| SYS-R39 | CI DEBE instalar con el lockfile congelado (`pnpm install --frozen-lockfile`). `pnpm-lock.yaml` se versiona. |
| SYS-R40 | Todo enlace a un origen externo DEBE abrirse en una pestaña nueva con `target="_blank"` y `rel="noopener noreferrer"`. |
| SYS-R41 | El sitio NO DEBE cargar scripts, estilos, fuentes ni imágenes de terceros en runtime, con la única excepción del script de analítica que defina DEP. |

| Ajuste de `pnpm-workspace.yaml` | Valor | Para qué |
| --- | --- | --- |
| `minimumReleaseAge` | `10080` | Rechaza versiones con menos de 7 días (SYS-R37) |
| `trustPolicy` | `no-downgrade` | Rechaza una versión publicada con menos garantías de procedencia que versiones anteriores del mismo paquete, señal habitual de una cuenta comprometida |
| `trustPolicyIgnoreAfter` | `43200` | Exime de la comprobación anterior a las versiones con más de 30 días; sin esto, versiones antiguas y legítimas publicadas antes de que existiera la firma de procedencia bloquean la instalación |
| `blockExoticSubdeps` | `true` | Impide que una dependencia transitiva se instale desde un repositorio git o una URL en lugar del registro |
| `strictDepBuilds` | `true` | Hace fallar la instalación ante un script de instalación no decidido (SYS-R38) |
| `allowBuilds` | `unrs-resolver: false` | Única entrada inicial: el paquete trae binarios precompilados y su script de instalación no es necesario |
| `saveExact` | `true` | Guarda versiones exactas al añadir dependencias (SYS-R01) |

### 4.12 Navegadores admitidos

| ID | Requisito |
| --- | --- |
| SYS-R42 | El sitio DEBE funcionar en las dos últimas versiones estables de Chrome, Edge, Firefox y Safari (macOS e iOS) en la fecha de cada publicación. |
| SYS-R43 | Las pruebas E2E DEBEN ejecutarse en los tres motores de Playwright: Chromium, Firefox y WebKit. |

### 4.13 Capa de escena

| ID | Requisito |
| --- | --- |
| SYS-R46 | El layout del grupo `(scene)` renderiza, en este orden: el script previo al pintado; dos enlaces de salto, de los que el CSS muestra solo el del modo activo (el de modo `simple` lleva al contenido de la vista simple y el de modo `scene`, al `<main>` de la escena); la **capa base**, un `<div data-layer="base">` con la vista simple; y la **capa de escena**, un `<div data-layer="scene">`. La capa de escena tiene tres hijos: la pantalla de arranque y el póster de la escena, ambos renderizados en el servidor como HTML estático, y el componente de cliente `SceneLayer`, que recibe como hijos el contenido de la página. |
| SYS-R47 | `SceneLayer` vive en `src/app/[locale]/(scene)/scene-layer.tsx` y es el único lugar donde se componen los features de armazón de la escena. Tiene exactamente estas responsabilidades: (1) mantener `data-mode` sincronizado con la consulta de SYS-R12 cuando cambia el viewport (SYS-R17); (2) escribir `data-app="ready"` en `<html>` al montarse, que es la señal que consulta el temporizador de respaldo (QLT-R43), y escribir `data-boot="done"` si el atributo no existe, lo que ocurre cuando una navegación del lado del cliente ha vuelto a montar `<html>` (SYS-R52): una navegación así nunca inicia el arranque; (3) cargar bajo demanda, y solo en modo `scene`, los componentes de cliente de `boot-sequence`, `motherboard-scene`, `settings` y `detail-panel` (QLT-R34); (4) capturar cualquier excepción de esos componentes y, en ese caso, escribir `data-mode="simple"` y dejar de renderizarlos (QLT-R44). Los monta en este orden: `BootController`, `FixedBar`, `Scene`, `SettingsMenu` y `DetailPanel`, de modo que los controles de la barra precedan a las zonas en el orden de tabulación (SET-R03); a `DetailPanel` le pasa una segunda barra como `toolbar` (PNL-R25). El atributo `data-mode` se escribe siempre con lo que dice el viewport en ese momento, nunca con el valor que React mantiene mientras hidrata, que es `simple` y haría parpadear la vista simple (SYS-R15). |
| SYS-R48 | En el servidor y en modo `simple`, `SceneLayer` no renderiza nada, tampoco sus hijos. Por tanto el panel no forma parte del HTML exportado. |
| SYS-R49 | Los componentes de cliente reciben por propiedades, desde el layout de servidor, los datos de las secciones que necesitan (nombres, rutas, textos), ya resueltos para el idioma de la página y serializables. NO DEBEN obtenerlos del registro (STR-R32). |
| SYS-R50 | `src/styles/globals.css` declara las variantes de Tailwind `mode-scene`, `mode-simple`, `boot-play`, `boot-exit`, `boot-done`, `scene-photo` y `scene-sketch`, que se activan según los atributos `data-mode`, `data-boot` y `data-scene` de `<html>`, la variante `scene-capable`, cuya consulta de medios DEBE ser textualmente la de SYS-R12, y la variante `no-hover`, con la consulta `(hover: none)` (SCN-R25). Los componentes usan estas variantes y no escriben selectores de atributo propios. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SYS-AC01 | Tras `pnpm build`, la carpeta `out/` contiene un documento HTML por cada ruta de SYS-R09 y ninguno más (se excluyen los archivos internos que genera Next.js). | Prueba de exportación |
| SYS-AC02 | Cada documento HTML tiene el atributo `lang` que exige SYS-R22. | Prueba de exportación |
| SYS-AC03 | Ninguna dependencia de `package.json` usa rango (`^`, `~`, `*`, `>=`); existen los campos `packageManager` y `engines.node`. | Prueba unitaria que lee `package.json` |
| SYS-AC04 | Con `navigator.languages = ["es-CO"]`, `/` lleva a `/es/`; con `["de-DE"]`, a `/en/`; con `["en-US"]` y preferencia guardada `es`, a `/es/`. Con JavaScript desactivado, `/` muestra dos enlaces visibles. | Prueba E2E |
| SYS-AC05 | A 1280×720 px, `<html>` tiene `data-mode="scene"`; a 390×844 px y a 1280×500 px tiene `data-mode="simple"`. | Prueba E2E |
| SYS-AC06 | En el HTML exportado de las páginas de inicio y de sección, el script previo al pintado está dentro de `<head>` y no tiene los atributos `async`, `defer` ni `type="module"`. En `/{locale}/cv/` no aparece. | Prueba de exportación |
| SYS-AC07 | Al redimensionar de 1280×720 a 800×720 px, la página pasa a la vista simple sin recargar; al volver a 1280×720 px, vuelve la escena. | Prueba E2E |
| SYS-AC08 | Al navegar de `/es/` a `/es/projects/` y de vuelta, el nodo raíz de la escena es el mismo nodo del DOM y no se emite ninguna petición nueva de la imagen de la escena. | Prueba E2E |
| SYS-AC09 | Con una sección abierta, el botón Atrás del navegador cierra el panel y deja la URL en `/{locale}/`. | Prueba E2E |
| SYS-AC10 | Con `localStorage` y `sessionStorage` configurados para lanzar excepción en cualquier acceso, la escena carga, los paneles abren y no hay errores no capturados en consola. | Prueba E2E y prueba unitaria de los stores |
| SYS-AC11 | Durante un recorrido completo del sitio, todas las peticiones de red van al propio origen, salvo las del origen de analítica que defina DEP. | Prueba E2E que inspecciona las peticiones |
| SYS-AC12 | Una URL que no existe (por ejemplo `/es/unknown/`) devuelve la página 404 con estado HTTP 404 al servir `out/` con `preview`. | Prueba E2E |
| SYS-AC13 | La función que valida el entorno de compilación, invocada desde `next.config.ts`, lanza un error cuyo mensaje contiene `NEXT_PUBLIC_SITE_URL` cuando la variable falta, no es un origen `http` o `https` válido o termina en barra; y devuelve el origen cuando es válida. | Prueba unitaria |
| SYS-AC14 | Todos los enlaces externos del HTML exportado cumplen SYS-R40. | Prueba de exportación |
| SYS-AC15 | `pnpm check` termina con código de salida 0 en una copia limpia del repositorio. | Ejecución en CI |
| SYS-AC16 | `pnpm-workspace.yaml` contiene exactamente los ajustes de SYS-R45 y no contiene `minimumReleaseAgeExclude`. | Prueba unitaria que lee el archivo |
| SYS-AC17 | En el HTML exportado de `/es/projects/`, el contenido de la sección Proyectos está dentro de `[data-layer="base"]`, y dentro de `[data-layer="scene"]` no hay ningún elemento `<dialog>` ni `<main>`. | Prueba de exportación |
| SYS-AC18 | La consulta de medios de la variante `scene-capable` de `globals.css` es idéntica a la constante de `src/shared/config/render-mode.ts`. | Prueba de arquitectura |
| SYS-AC19 | A 1280×720 px, una vez cargada la página, `<html>` tiene `data-app="ready"`. | Prueba E2E |
| SYS-AC20 | A 1280×720 px, sin preferencias guardadas, `<html>` tiene `data-scene="photo"`. Con `sceneVariant: "sketch"` guardado, tiene `data-scene="sketch"`, la imagen solicitada es un derivado de la variante `sketch` y no se solicita ningún archivo de la variante `photo`. | Prueba E2E, solo en Chromium |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Exportación estática** (`output: "export"`). | El contenido no cambia en runtime. Archivos estáticos significan coste cero, portabilidad entre proveedores de hosting en minutos y ninguna superficie de servidor que mantener o asegurar. |
| **`trailingSlash: true`.** | Cada ruta se exporta como `carpeta/index.html`, que cualquier servidor de archivos resuelve igual. Evita diferencias de comportamiento entre Cloudflare Pages y el plan B (GitHub Pages). |
| **La URL es la fuente de verdad del idioma y la sección** (SYS-R24, SYS-R25). | Da enlaces compartibles, hace que Atrás/Adelante funcionen sin código adicional y permite prerenderizar cada sección para buscadores. |
| **La vista simple es la capa base y la escena una mejora progresiva** (SYS-R14, D-29). | Una sola decisión resuelve cuatro casos: móvil, sin JavaScript, buscadores y lectores de pantalla reciben HTML completo y semántico. La alternativa (redirigir a `/cv/` en pantallas pequeñas) produce un salto visible y deja la página de inicio sin contenido para quien no ejecuta JavaScript. |
| **La capa de escena solo existe en el cliente** (SYS-R47, SYS-R48, D-47). | La escena necesita JavaScript para funcionar y solo se muestra por encima de 1024×600 px, así que prerenderizarla añadiría peso a todas las páginas sin beneficio: el contenido ya está en la capa base. La pantalla de arranque y el póster sí se renderizan en el servidor, porque son lo que se ve antes de que llegue el JavaScript. |
| **Composición de los armazones en un único componente de `app/`** (SYS-R47). | Los features de armazón no se importan entre sí (STR-R07); alguien tiene que montarlos juntos, cargarlos bajo demanda y contener sus fallos. Hacerlo en un solo lugar deja esas tres responsabilidades a la vista. |
| **Script previo al pintado en línea** (SYS-R13). | Es la única forma de elegir el modo antes del primer fotograma sin servidor; el mismo patrón que se usa para evitar el parpadeo de tema. Se mantiene mínimo y con responsabilidades cerradas para poder autorizarlo por hash en la política de seguridad de contenido (ver DEP). |
| **Umbral de 1024×600 px** (SYS-R12). | 1024 px de ancho admite portátiles pequeños y tabletas en horizontal; 600 px de alto garantiza que la zona segura de la escena y un panel legible quepan sin scroll de página. |
| **Zustand solo para preferencias y sesión.** | Evita un segundo dueño del estado de navegación. Los tres stores son pequeños y se pueden probar de forma aislada. |
| **Layout raíz que solo devuelve `children`.** | Permite que cada rama renderice su propio `<html lang>`. Validado con el prototipo: Next.js 16.4.0 exporta correctamente `lang="es"` y `lang="en"` por ruta y genera `404.html`. |
| **Derivados de imagen versionados en el repositorio** (SYS-R32, D-32). | La compilación no depende de binarios nativos de `sharp` en el proveedor de hosting y es reproducible. El desfase entre máster y derivados lo impide `assets:check`. |
| **`next/font/google` en lugar de archivos de fuente en el repositorio.** | Aloja las fuentes en el propio sitio sin gestionarlas a mano. Validado con el prototipo: el HTML exportado no contiene referencias a dominios de Google. El coste es que la compilación necesita acceso de red a Google Fonts. |
| **Temporizador de respaldo en el script previo al pintado** (SYS-R20). | El script en línea se ejecuta aunque falle la descarga del resto del JavaScript. Sin el temporizador, ese caso dejaría al visitante ante la pantalla de arranque sin salida; con él, ve la vista simple, que ya está en el HTML. |
| **Política de confianza con exención por antigüedad** (SYS-R45). | `trustPolicy: no-downgrade` protege frente a versiones publicadas desde una cuenta robada. En la prueba del 2026-10-12 bloqueó `semver@6.3.1`, una versión antigua y legítima; eximir a las versiones con más de 30 días elimina esos falsos positivos y conserva la protección donde importa, que es en lo recién publicado. |
| **Versiones exactas y edad mínima de 7 días** (SYS-R01, SYS-R37). | Reduce la exposición a paquetes comprometidos recién publicados, que suelen detectarse y retirarse en pocos días, y hace las compilaciones reproducibles. |

### 6.1 Qué validó el prototipo

El 2026-10-12 se compiló un proyecto mínimo y desechable, fuera del repositorio, con Next.js 16.4.0, React 19.3.0 y TypeScript 6.0.3. Resultados:

- `output: "export"` con `trailingSlash: true` genera un `index.html` por ruta y `404.html`.
- El layout raíz que solo devuelve `children`, combinado con `<html>` en `[locale]/layout.tsx`, en `page.tsx` de la raíz y en `not-found.tsx`, compila y exporta el `lang` correcto en cada documento.
- Los grupos de rutas `(scene)` y `(plain)` conviven bajo `[locale]`; el segmento estático `cv` tiene prioridad sobre el dinámico `[section]`.
- `generateStaticParams` con `dynamicParams = false` genera exactamente las 14 páginas de sección.
- `next/font/google` deja las fuentes en `out/_next/static/media/` y no hay referencias a Google en el HTML.
- `robots.ts` y `sitemap.ts` con `export const dynamic = "force-static"` se exportan como `robots.txt` y `sitemap.xml`.

Ese mismo día se amplió el prototipo con el resto de herramientas de §4.1:

- ESLint 10.12.0 funciona en configuración plana con `eslint-config-next` 16.4.0 y los conjuntos `strictTypeChecked` y `stylisticTypeChecked` de `typescript-eslint` 8.71.2.
- Las opciones estrictas de TSC §4.1 compilan con Next.js y con el código normativo de TSC.
- Vitest 5.0.4 mide cobertura con `@vitest/coverage-v8` y aplica umbrales.
- `minimumReleaseAge` rechaza versiones recientes; `saveExact` guarda versiones exactas; `strictDepBuilds` detectó el script de instalación de `unrs-resolver`, y ESLint funciona con ese script desactivado.
- El JavaScript base de una página sin código propio pesa 171 kB comprimido (QLT §3).

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 2.6 | Durante M9, por delegación del autor. SYS-R36: se anota que los dos secretos de la publicación viven en GitHub y no son variables del proyecto. |
| 2026-10-13 | 2.5 | Durante M8, por delegación del autor (D-77). §4.9: `preview` comprime con gzip las respuestas de texto (DEP-R20). Estado: pasa a "Implementada" al cerrar M8. |
| 2026-10-13 | 2.4 | Durante M7, por delegación del autor. SYS-R20: el script previo al pintado anota una pulsación temprana que salta el arranque (D-74). SYS-R47: orden de montaje de los armazones y barra dentro del panel (D-73); `data-mode` no pasa por `simple` durante la hidratación, defecto de M5 corregido con una prueba que lo reproduce. |
| 2026-10-13 | 2.3 | Durante M5, por delegación del autor (D-68). Nuevo SYS-R52 y árbol de `src/app/`: el elemento `<html>` pasa a los layouts de grupo, con un layout nuevo en `(plain)`, porque es la única forma de que el script previo al pintado quede en `<head>` solo en las páginas de la escena. SYS-R46: dos enlaces de salto, uno por modo. SYS-R47: `SceneLayer` restablece `data-boot` tras una navegación del cliente. SYS-R50: variante `no-hover`. SYS-R05: `agentRules: false`. SYS-R44 precisado. |
| 2026-10-13 | 2.2 | Por decisión del autor (D-66 y D-67). §4.6: nueva preferencia `sceneVariant`. SYS-R20 y nuevo SYS-R51: el script previo al pintado fija `data-scene` e inserta la precarga de la variante. SYS-R50: variantes `scene-photo` y `scene-sketch`. §4.9: nuevo script `check:docker`. Nuevo SYS-AC20. |
| 2026-10-13 | 2.1 | Cabecera: se retira la marca de enmienda pendiente; el autor confirmó el 2026-10-13 que todas las enmiendas están aprobadas. §4.3: los slugs se enumeran en el orden canónico de D-46. Sin cambio de requisitos. |
| 2026-10-13 | 2.0 | Aprobada por el autor, que necesita empezar la implementación de inmediato. §4.1: once versiones bajan a la anterior que cumple la edad mínima (SYS-R03) y ESLint pasa a 9.39.5; combinación validada en el prototipo. Confirmada la enmienda 1.3. |
| 2026-10-12 | 1.3 | Confirmada por el autor el 2026-10-13. §4.9: `build` genera además `out/_headers` y `preview` aplica esas cabeceras (DEP). |
| 2026-10-12 | 1.0 | Versión inicial. Aprobada por el autor. |
| 2026-10-12 | 1.1 | Confirmada por el autor el 2026-10-12. SYS-R20: el script previo al pintado añade un temporizador de respaldo (QLT-R43). Nuevo SYS-R44 (`suppressHydrationWarning`). §4.1: se añade `@vitest/coverage-v8` y la nota sobre la edad de las versiones. §4.9: `test` mide cobertura y se añade `test:lighthouse`. §4.11: SYS-R37 y SYS-R38 concretados y nuevo SYS-R45 con los ajustes de pnpm, elegidos por delegación del autor. SYS-AC01, AC02, AC06, AC13 y AC14: verificación reescrita con el vocabulario de README §4.5. Nuevo SYS-AC16. |
| 2026-10-12 | 1.2 | Confirmada por el autor el 2026-10-12. Nuevo §4.13 (SYS-R46 a SYS-R50) con la composición de la capa de escena, y SYS-AC17 a SYS-AC19. Árbol de `src/app/`: se añaden `scene-layer.tsx`, los iconos, `robots.ts` y `sitemap.ts`. §4.4 y §6: el panel ya no se prerenderiza en el HTML (D-47). |
