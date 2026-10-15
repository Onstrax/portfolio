# SMP — Vista simple y metadatos

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-15 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N, QLT, TST, CPU, IO |

## 1. Propósito

Especificar la vista simple, que es la página plana con las siete secciones y lo que ven los móviles, los buscadores y quien no ejecuta JavaScript, y los metadatos de todas las páginas: títulos, descripciones, alternativas por idioma, imagen para compartir, datos estructurados, `robots.txt`, `sitemap.xml` e iconos.

## 2. Alcance

**Incluye:** estructura y comportamiento de la vista simple, su uso como capa base, el desplazamiento a una sección, la impresión, la página de caso de estudio, la configuración del sitio y todos los metadatos.

**No incluye:** el contenido de las secciones (ver su spec), el aspecto de la página clara (ver VIS §4.5.3), las reglas de metadatos por idioma (ver I18N §4.6, que esta spec implementa) ni la analítica (ver DEP).

Feature: `src/features/simple-view/`. `server.ts` exporta `SimpleView`, `CaseStudyPage`, `PersonJsonLd`, `getPageMetadata`, `getEntryMetadata` y `getSitemapEntries`; `index.ts` exporta el componente de cliente `SectionScroller` (STR-R33).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Vista** | Uno de los cuatro tipos de página con idioma: `home`, `section`, `cv` o `case` (`ParsedPath`, TSC §4.10). |
| **Origen del sitio** | El valor validado de `NEXT_PUBLIC_SITE_URL` (SYS-R35). |
| **Capaz de escena** | Un viewport que cumple la consulta de SYS-R12; en CSS, la variante `scene-capable` (SYS-R50). |

## 4. Requisitos

### 4.1 Configuración del sitio

| ID | Requisito |
| --- | --- |
| SMP-R01 | `src/shared/config/site.ts` exporta `SITE`, con `authorName: "Juan Esteban Álvarez García"` y `repositoryUrl` (la URL del repositorio público, que fija DEP), y la función `getSiteUrl(env)`, que valida `NEXT_PUBLIC_SITE_URL` según SYS-AC13 y devuelve el origen del sitio. |
| SMP-R02 | El nombre del autor se escribe una sola vez, en `SITE.authorName`. Las secciones, los metadatos y los datos estructurados lo toman de ahí. |

### 4.2 Estructura de la vista simple

| ID | Requisito |
| --- | --- |
| SMP-R03 | `SimpleView` es un componente de servidor que recibe `locale` y `variant` (`"base"` cuando es la capa base del grupo `(scene)`, `"standalone"` en `/{locale}/cv/`). Renderiza, en este orden, los bloques de la tabla siguiente. |
| SMP-R04 | El contenido principal es un `<main id="content">` con una `<section>` por cada elemento de `SECTION_LIST`, en orden canónico. Cada una tiene como `id` el slug de la sección, `aria-labelledby` apuntando a su título, un `<h2>` con `meta.title` cuyo `id` es el slug seguido de `-title`, y el componente de la sección con `idScope=""` (TSC-R33). |
| SMP-R05 | La vista simple no muestra los nombres de las piezas de hardware: en ella las secciones son secciones de un perfil, sin metáfora. |
| SMP-R06 | La página usa una sola columna centrada de 760 px de ancho máximo, con 16 px de margen lateral por debajo de 640 px de ancho y 24 px por encima, y el aspecto de VIS §4.5.3. Entre secciones hay 48 px de separación y una línea de 1 px en `ink` con opacidad 20 %. |
| SMP-R07 | No hay scroll horizontal en ningún ancho desde 320 px (QLT-R15). Los chips y los enlaces largos se parten en varias líneas. |

| Bloque | Elemento | Contenido |
| --- | --- | --- |
| Enlace de salto | `<a>` | `common.skipToContentLabel`, hacia `#content` (QLT-R02). Solo en la variante `standalone`; en la capa base lo aporta el layout para ambas capas |
| Cabecera | `<header>` | El nombre del autor como `<h1>`, que es el destino de "Volver arriba" (SMP-R29); el selector de idioma (SET-R05) con el nombre `common.languageLabel`; en la variante `standalone`, y visible solo si el viewport es capaz de escena, el selector de vista (SET-R32) sobre superficie clara, con "Simple" como opción actual (D-93); y un enlace de descarga del CV del idioma de la página (`CV_FILES`, ver IO) con el texto `common.downloadCvLabel` y aspecto de botón primario |
| Aviso | `<p>` | `simpleView.desktopHint`. Visible solo si el viewport **no** es capaz de escena |
| Navegación | `<nav>` | Nombre accesible `simpleView.navAriaLabel`. Una lista con un enlace por sección, hacia `#` seguido de su slug, con `meta.title` como texto |
| Contenido | `<main>` | Las siete secciones (SMP-R04) |
| Pie | `<footer>` | Un enlace `simpleView.backToTopLabel` hacia `#top` (SMP-R29) |

### 4.3 Comportamiento

| ID | Requisito |
| --- | --- |
| SMP-R08 | La vista simple funciona completa sin JavaScript: toda su navegación son enlaces y anclas (QLT-R41). |
| SMP-R09 | `SectionScroller` es un componente de cliente que no renderiza nada. En modo `simple`, cuando la URL es la de una sección, desplaza la página hasta la `<section>` de ese slug y lleva el foco a su `<h2>`, que tiene `tabindex="-1"` (SYS-R18). Si la URL tiene además un fragmento, se desplaza al elemento con ese `id`. Lo hace al cargar la página y cada vez que el modo pasa de `scene` a `simple`. |
| SMP-R10 | En modo `scene`, la capa base está oculta con `display: none` y `SectionScroller` no actúa. |
| SMP-R11 | El desplazamiento es instantáneo con movimiento reducido y suave en otro caso (`scroll-behavior`). |
| SMP-R12 | **Impresión.** Al imprimir cualquier página con idioma se imprime la vista simple, en negro sobre blanco, sin la capa de escena, la navegación, el selector de idioma, el aviso ni los botones (todo enlace o control con aspecto de botón); los enlaces externos muestran su URL a continuación del texto; y ninguna sección de proyecto o de experiencia se parte entre dos páginas si cabe en una. |
| SMP-R29 | **Volver arriba.** El enlace `simpleView.backToTopLabel` de la vista simple y de las páginas de caso lleva a `#top`: el `<h1>` de la vista simple y la `<header>` de la página de caso llevan `id="top"`, `tabindex="-1"` y un margen de desplazamiento igual al margen superior de la página, de modo que la página vuelve hasta arriba del todo, con la cabecera a la vista, y el foco queda en ese destino. `#content` sigue siendo solo el destino del enlace de salto. |

### 4.4 Títulos y descripciones

| ID | Requisito |
| --- | --- |
| SMP-R13 | `getPageMetadata(view, locale)` devuelve los metadatos de cada página, y las páginas de `src/app/` lo usan en `generateMetadata`. No se escriben metadatos a mano en las páginas. |
| SMP-R14 | El título y la descripción de cada vista son los de la tabla siguiente, con los textos del espacio de nombres `site` (§4.8) y de `meta` de la sección (TSC-R26). Cumplen QLT-R37. |
| SMP-R15 | Cada página declara: URL canónica, alternativas `hreflang` y `x-default` (I18N-R28, I18N-R29); `og:title`, `og:description`, `og:url`, `og:type` con valor `profile` en el inicio y `website` en el resto, `og:locale` y sus alternativas (I18N-R30), `og:site_name` con `SITE.authorName` y `og:image` con sus dimensiones y `site.ogImageAlt`; tarjeta de Twitter de tipo `summary_large_image`; y `theme-color` con el valor del token `void`, que el layout de locale toma de `SITE_THEME` en el manifiesto generado (AST-R36), porque el código no puede escribir colores literales (STR-R22). |
| SMP-R16 | Todas las URLs de los metadatos son absolutas y se construyen con el origen del sitio y los ayudantes de rutas (TSC §4.10). |
| SMP-R17 | Las páginas `/` y 404 usan como título `languageGate.title` y `notFound.title` en inglés (I18N §4.3.2) y llevan `robots: noindex`. No son páginas de contenido (QLT-R39). Pero `/` es la dirección que se comparte, y las redes no ejecutan su redirección: `getEntryMetadata()` le da la descripción de `site.description` y los datos para compartir de SMP-R15 de la página de inicio en inglés (`og:title` con `site.homeTitle`, `og:url` con el origen del sitio y `/`, `og:type` `profile`, imagen y tarjeta), sin URL canónica ni alternativas. |

| Vista | Título | Descripción |
| --- | --- | --- |
| `home` | `site.homeTitle` | `site.description` |
| `section` | `site.sectionTitle({ title })`, con `meta.title` de la sección | `meta.description` de la sección |
| `cv` | `site.cvTitle` | `site.cvDescription` |
| `case` | `site.caseTitle({ title })`, con `title` del caso (SSD §4.6) | `description` del caso |

### 4.5 Datos estructurados, sitemap y robots

| ID | Requisito |
| --- | --- |
| SMP-R18 | `PersonJsonLd` renderiza, en la capa base del grupo `(scene)` y por tanto en las páginas de inicio y de sección, un bloque `<script type="application/ld+json">` con un objeto `Person` de schema.org. Sus campos son los de la tabla siguiente y proceden de `SITE`, de `SECTIONS.profile` y de `SECTIONS.contact`; ningún valor se escribe a mano en este feature. |
| SMP-R19 | `src/app/sitemap.ts` devuelve `getSitemapEntries()`: las 24 páginas con idioma (dos de inicio, catorce de sección, dos de `cv` y seis de caso de estudio), cada una con sus alternativas por idioma. No incluye `/`. |
| SMP-R20 | `src/app/robots.ts` permite el rastreo de todo el sitio a cualquier agente y declara la URL absoluta del sitemap. |

| Campo de `Person` | Valor |
| --- | --- |
| `name` | `SITE.authorName` |
| `url` | URL absoluta del inicio en el idioma de la página |
| `image` | URL absoluta del derivado JPEG de mayor tamaño de la fotografía (ver CPU) |
| `description` | `site.description` |
| `email` | El correo de contacto (ver IO) |
| `sameAs` | Las URLs de LinkedIn y GitHub (ver IO) |
| `alumniOf` | Un objeto `CollegeOrUniversity` con el nombre de la universidad (ver CPU) |
| `knowsLanguage` | `["es", "en", "de"]`, derivado de los idiomas de Perfil (ver CPU) |
| `address` | Un objeto `PostalAddress` con `addressLocality: "Bogotá"` y `addressCountry: "CO"` (ver CPU) |

### 4.6 Imagen para compartir e iconos

| ID | Requisito |
| --- | --- |
| SMP-R21 | `pnpm assets:build` (AST §4.7) genera la imagen para compartir a partir del máster de la variante `photo` de la escena: el recorte horizontal centrado de 3840×2016 px, reducido a 1200×630 px, en JPEG progresivo de 220 kB como máximo y sin metadatos, en `public/og/og-image.<versión>.jpg`. El manifiesto exporta `OG_ASSET` con `src`, `width` y `height`. `assets:check` comprueba su existencia, sus dimensiones y su peso. |
| SMP-R22 | La imagen para compartir no lleva texto superpuesto: el título lo aportan `og:title` y la plataforma que la muestra. |
| SMP-R23 | `src/app/icon.svg` es el icono del sitio: un cuadrado de 32×32 unidades con esquinas redondeadas de 6 y fondo del color `void`, y sobre él, centrado, el contorno de un procesador en el color `aura` con trazo de 2: un cuadrado de 14 de lado con tres patillas de 3 de largo en cada uno de sus cuatro lados. Es uno de los tres archivos que pueden contener colores literales (STR-R22). |
| SMP-R24 | `src/app/apple-icon.png` es la versión de 180×180 px del mismo icono, generada por `pnpm assets:build` a partir de `icon.svg` y versionada. |

### 4.7 Tipos

`src/shared/contracts/assets.ts` añade:

```ts
export interface OgAsset {
  readonly src: SitePath;
  readonly width: 1200;
  readonly height: 630;
}
```

### 4.8 Textos de interfaz

Espacio de nombres `simpleView`:

| Clave | Español | Inglés |
| --- | --- | --- |
| `navAriaLabel` | Secciones | Sections |
| `desktopHint` | La versión interactiva de este portfolio está disponible en pantallas de escritorio. | The interactive version of this portfolio is available on desktop screens. |
| `backToTopLabel` | Volver arriba | Back to top |
| `caseKindTitle` | Caso de estudio | Case study |
| `caseBackLabel` | Todos los proyectos | All projects |
| `caseProblemTitle` | El problema | The problem |
| `caseRoleTitle` | Mi rol | My role |
| `caseContributionsTitle` | Mis aportes | My contributions |
| `caseTeamTitle` | Aportes del equipo | Team contributions |
| `caseProcessTitle` | El proceso | The process |
| `caseDecisionsTitle` | Decisiones | Decisions |
| `caseOptions` | Alternativas | Options |
| `caseChoice` | Elección | Choice |
| `caseReason` | Por qué | Why |
| `caseChangesTitle` | Cambios de rumbo | Changes of direction |
| `caseOutcomeTitle` | Resultado | Outcome |
| `caseLearnedTitle` | Aprendizajes | Lessons learned |

Espacio de nombres `site`:

| Clave | Español | Inglés |
| --- | --- | --- |
| `homeTitle` | Juan Esteban Álvarez García · Portfolio interactivo | Juan Esteban Álvarez García · Interactive portfolio |
| `sectionTitle({ title })` | {title} · Juan Esteban Álvarez García | {title} · Juan Esteban Álvarez García |
| `cvTitle` | Currículum · Juan Esteban Álvarez García | Résumé · Juan Esteban Álvarez García |
| `caseTitle({ title })` | {title} · Caso de estudio | {title} · Case study |
| `description` | Portfolio de Juan Esteban Álvarez García, estudiante de Ingeniería de Sistemas en la Universidad de los Andes: software, cloud/DevOps y seguridad aplicada. | Portfolio of Juan Esteban Álvarez García, Systems Engineering student at Universidad de los Andes: software, cloud/DevOps and applied security. |
| `cvDescription` | Perfil, experiencia, proyectos, stack y contacto de Juan Esteban Álvarez García en una sola página, lista para leer o imprimir. | Profile, experience, projects, stack and contact details of Juan Esteban Álvarez García on a single page, ready to read or print. |
| `ogImageAlt` | Placa madre sobre un banco de trabajo, vista desde arriba | Motherboard on a workbench, seen from above |

`sectionTitle` es idéntica en ambos idiomas porque solo compone un título ya traducido con un nombre propio; es una excepción registrada a la regla C5 (I18N-R48).

### 4.9 Página de caso de estudio

| ID | Requisito |
| --- | --- |
| SMP-R25 | `CaseStudyPage`, componente de servidor que `simple-view` exporta desde `server.ts`, renderiza la página de un caso de estudio (VSN-R21). Recibe `locale` y `caseStudy: CaseStudyId`, y toma de `SECTIONS.projects` (D-88) el proyecto con ese `id`, sus hechos (nombre propio, tamaño de equipo, visibilidad del repositorio, tecnologías y enlaces) y sus textos (`name`, `tagline`, `award`, `linkLabels` y `cases[caseStudy]`). Renderiza los bloques de la tabla siguiente, en ese orden. |
| SMP-R26 | La página `src/app/[locale]/(plain)/projects/[caseStudy]/page.tsx` declara `generateStaticParams` con los `CASE_STUDY_IDS` y `dynamicParams = false`, obtiene sus metadatos con `getPageMetadata({ view: "case", caseStudy }, locale)` y renderiza `CaseStudyPage`. Es del grupo `(plain)`: sin script previo al pintado ni capa de escena (SYS-R19). |
| SMP-R27 | La página usa la disposición de SMP-R06, el aspecto de VIS §4.5.3 y los estilos de contenido del panel (encabezados con icono, chips, listas y enlaces de VIS §4.6). Funciona completa sin JavaScript (SMP-R08) y se imprime en negro sobre blanco (SMP-R12). Su único componente de cliente es el selector de idioma, que lleva al mismo caso en el otro idioma (`withLocale`, TSC §4.10). |
| SMP-R28 | Los `<h2>` de los cuatro bloques de contenido llevan como `id` `case-problem`, `case-role`, `case-process` y `case-outcome`. Cada decisión es un elemento de lista con una lista de descripción (`<dl>`) de tres términos: `simpleView.caseOptions`, `simpleView.caseChoice` y `simpleView.caseReason`, con `options`, `choice` y `reason`. Los elementos de `outcome` se renderizan con `RichText` (TSC-R59). |

| Bloque | Elemento | Contenido |
| --- | --- | --- |
| Enlace de salto | `<a>` | `common.skipToContentLabel`, hacia `#content` (QLT-R02) |
| Cabecera | `<header>` | Un enlace interno hacia `sectionPath(locale, "projects")` con el texto `simpleView.caseBackLabel` y el icono `chevron-left`; el selector de idioma (SET-R05) con el nombre `common.languageLabel`; y el enlace de descarga del CV de la cabecera de la vista simple (§4.2) |
| Presentación | Dentro de `<main id="content">` | `simpleView.caseKindTitle` con el rol "Encabezado de bloque"; el nombre del proyecto (`properName` o `name`) como `<h1>`, con el rol "Vista simple, nombre"; `tagline`; los chips de SSD-R07 (reconocimiento, tamaño de equipo, repositorio privado y tecnologías); y los enlaces del proyecto con su `linkLabels`, como enlaces externos |
| El problema | `<section>` | `<h2>` con `simpleView.caseProblemTitle` (icono `flag`) y los párrafos de `problem` |
| Mi rol | `<section>` | `<h2>` con `simpleView.caseRoleTitle` (icono `users`); `team`; un `<h3>` con `simpleView.caseContributionsTitle` y la lista de `contributions`; y, si existe `teamContributions`, un `<h3>` con `simpleView.caseTeamTitle` y ese párrafo |
| El proceso | `<section>` | `<h2>` con `simpleView.caseProcessTitle` (icono `compass`); un `<h3>` con `simpleView.caseDecisionsTitle` y la lista de `decisions` (SMP-R28); y un `<h3>` con `simpleView.caseChangesTitle` y la lista de `changes` |
| Resultado | `<section>` | `<h2>` con `simpleView.caseOutcomeTitle` (icono `award`); la lista de `outcome`; y un `<h3>` con `simpleView.caseLearnedTitle` y la lista de `learned` |
| Pie | `<footer>` | De nuevo el enlace `simpleView.caseBackLabel`, y `simpleView.backToTopLabel` hacia `#top` (SMP-R29) |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SMP-AC01 | El HTML exportado de `/es/`, `/es/projects/` y `/es/cv/` contiene un `<main id="content">` con siete `<section>` cuyos `id` son los slugs en orden canónico, cada una con su `<h2>` y contenido no vacío (VSN-AC03). | Prueba de exportación |
| SMP-AC02 | En `mobile`, `/es/` muestra como `<h1>` "Juan Esteban Álvarez García", el aviso de `simpleView.desktopHint`, la navegación con siete enlaces y el enlace "Descargar CV (PDF)", que apunta al PDF en español. No hay scroll horizontal. | Prueba E2E |
| SMP-AC03 | En `desktop`, `/es/cv/` muestra la vista simple con el selector de vista en la cabecera, "Simple" como opción actual y "Interactiva" como enlace a `/es/`, y sin el aviso; `<html>` no tiene `data-mode="scene"` y no existe la capa de escena. | Prueba E2E |
| SMP-AC04 | En `mobile`, activar el enlace "Proyectos" de la navegación desplaza la página hasta esa sección sin cambiar de página. | Prueba E2E |
| SMP-AC05 | En `mobile`, abrir `/es/projects/` deja la sección Proyectos en la parte superior del viewport y el foco en su `<h2>`. Abrir `/es/projects/#projects-habicapital` deja visible ese proyecto. | Prueba E2E |
| SMP-AC06 | Con JavaScript desactivado, en `/es/` todos los enlaces de la navegación, el de descarga del CV y el de cambio de idioma funcionan (QLT-R41). | Prueba E2E |
| SMP-AC07 | A 320 px de ancho, la vista simple no tiene scroll horizontal en ningún idioma (QLT-AC07). | Prueba E2E |
| SMP-AC08 | Con la emulación de medio de impresión, no son visibles la navegación, el selector de idioma, el aviso ni los botones, y el color de fondo calculado del cuerpo es blanco. | Prueba E2E |
| SMP-AC09 | `getPageMetadata` devuelve, para las 24 páginas, títulos y descripciones únicos dentro de los límites de QLT-R37, con los valores de la tabla de §4.4. | Prueba unitaria |
| SMP-AC10 | El HTML exportado de cada página con idioma contiene los metadatos de SMP-R15 con URLs absolutas que empiezan por el origen del sitio (I18N-AC15, QLT-AC19). | Prueba de exportación |
| SMP-AC11 | El HTML exportado de las páginas de inicio y de sección contiene un único bloque JSON-LD válido con `@type` `Person` y los nueve campos de §4.5; las páginas `/{locale}/cv/`, las de caso de estudio, `/` y 404 no lo contienen (QLT-AC20). | Prueba de exportación |
| SMP-AC12 | `out/sitemap.xml` lista exactamente las 24 URLs de SMP-R19 con sus alternativas, y `out/robots.txt` referencia el sitemap con URL absoluta. | Prueba de exportación |
| SMP-AC13 | `out/index.html` y `out/404.html` contienen `noindex`; ninguna otra página lo contiene. | Prueba de exportación |
| SMP-AC14 | `public/og/` contiene exactamente un archivo, de 1200×630 px y 220 kB como máximo, y `OG_ASSET.src` apunta a él. | Ejecución de `pnpm assets:check` |
| SMP-AC15 | `src/app/icon.svg` existe, y `src/app/apple-icon.png` mide 180×180 px. | Prueba unitaria que lee los archivos |
| SMP-AC16 | Los textos de `simpleView` y `site` de ambos diccionarios son los de §4.8. | Prueba unitaria |
| SMP-AC17 | El autor comparte la URL desplegada en LinkedIn y en WhatsApp y confirma que la vista previa muestra el título, la descripción y la imagen. | Revisión manual del autor, registrada en el historial de esta spec |
| SMP-AC19 | El HTML exportado de `/` contiene la descripción, `og:title`, `og:description`, `og:url` igual al origen del sitio con `/`, `og:type` `profile`, `og:image` absoluta con sus dimensiones y la tarjeta `summary_large_image`, y sigue pidiendo no ser indexado. | Prueba de exportación |
| SMP-AC20 | El HTML exportado de cada una de las seis páginas de caso tiene un `<main id="content">` con un único `<h1>` con el nombre del proyecto y cuatro `<h2>` con los `id` de SMP-R28 en ese orden; contiene `problem[0]`, `contributions[0]` y `decisions[0].choice` de su caso en el idioma de la página; tiene `lang` de su idioma; y no contiene el script previo al pintado, la capa de escena ni un bloque JSON-LD. | Prueba de exportación |
| SMP-AC21 | `getPageMetadata({ view: "case", caseStudy: "thesis" }, "es")` devuelve el título "Tesis de autenticación poscuántica · Caso de estudio", la descripción del caso, la URL canónica `/es/projects/thesis/`, alternativas hacia `/es/projects/thesis/` y `/en/projects/thesis/` y `og:type` `website`; y los títulos y descripciones de las seis páginas de caso cumplen QLT-R37. | Prueba unitaria |
| SMP-AC22 | En `desktop`, en el panel de Proyectos de `/es/projects/`, "Leer el caso completo" de la tesis lleva a `/es/projects/thesis/`; ahí, la opción de inglés del selector lleva a `/en/projects/thesis/`, y "All projects" a `/en/projects/` con el panel de Proyectos abierto. En `mobile`, "Todos los proyectos" lleva a la vista simple desplazada hasta Proyectos. | Prueba E2E |
| SMP-AC23 | En `desktop`, en `/es/cv/` y en `/es/projects/thesis/`, tras bajar hasta el pie, activar "Volver arriba" deja la página en `scrollY` 0, con la cabecera visible y el foco en el destino de SMP-R29. | Prueba E2E |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **La vista simple no usa la metáfora del hardware** (SMP-R05). | Es la salida rápida (principio P3): quien la elige, o quien llega desde un móvil, quiere un CV legible. "Memoria RAM" sobre el stack sería ruido. |
| **Un componente con dos variantes en lugar de dos páginas** (SMP-R03). | La capa base y `/cv/` muestran exactamente lo mismo; solo cambian el enlace de salto, que en la capa base comparte el layout, y el enlace de vuelta a la escena. |
| **Navegación por anclas, sin JavaScript** (SMP-R08). | Es la vista que debe funcionar siempre, también cuando todo lo demás falla (QLT-R43, QLT-R44). |
| **Cada página es su propia canónica, también `/cv/`** (SMP-R15, I18N-R28). | El inicio y `/cv/` comparten contenido, pero son destinos distintos para una persona: uno abre la escena y el otro no. Declararlas alternativas entre idiomas y dejar que el buscador elija es más simple y menos frágil que canonizar una hacia la otra. |
| **Datos estructurados derivados de las secciones** (SMP-R18). | El correo, los perfiles y la universidad ya están escritos en Perfil y Contacto. Copiarlos aquí los duplicaría (SYS-R30). |
| **Datos estructurados en todas las páginas del grupo `(scene)`** (SMP-R18). | El contenido de una página nunca llega al HTML del servidor en ese grupo, porque `SceneLayer` no lo renderiza allí (SYS-R48): lo único que el servidor escribe es el layout, que no sabe si la ruta es el inicio o una sección. Poner el bloque en el layout lo lleva a las dieciséis páginas, todas con la misma `url` del inicio. La alternativa, una ruta paralela solo para el inicio, añadía estructura a `src/app/` sin beneficio para los buscadores. La versión 1.1 lo limitaba al inicio. |
| **Imagen para compartir sin texto** (SMP-R22). | Renderizar texto sobre la imagen depende de las fuentes instaladas en la máquina que la genera. La fotografía de la placa identifica el sitio por sí sola. |
| **Hoja de impresión** (SMP-R12). | Hay quien imprime o guarda como PDF el perfil de un candidato. Cuesta pocas reglas y evita que salga una captura de la escena. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-15 | 2.0 | Por decisión del autor, tras probar el sitio con varios visitantes (D-93). §4.2: el enlace "Ver la versión interactiva" se sustituye por el selector de vista de la cabecera (SET-R32), más visible; se retira su texto. Nuevo SMP-R29: "Volver arriba" lleva hasta arriba del todo, a la cabecera, también en las páginas de caso, donde antes se quedaba en el principio del contenido. SMP-AC03 actualizado; nuevo SMP-AC23. |
| 2026-10-14 | 1.4 | Estado: pasa a "Implementada" al cerrar M11 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. Sin cambio de requisitos. |
| 2026-10-14 | 1.4 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.4 | Versión 2, pendiente de aprobación del autor (D-82, D-88). Nuevo §4.9: la página de caso de estudio (`CaseStudyPage`, SMP-R25 a SMP-R28) en `/{locale}/projects/{case}/`. SMP-R14: vista `case`. SMP-R19: el sitemap pasa a 24 páginas. §2 y §3: la página de caso y la vista `case`. §4.8: quince textos de `simpleView` y `site.caseTitle`. SMP-AC09, SMP-AC11 y SMP-AC12 actualizados; nuevos SMP-AC20 a SMP-AC22. |
| 2026-10-14 | 1.3 | SMP-AC17: tras SMP 1.3, el autor compartió la URL en LinkedIn (Post Inspector) y en WhatsApp; las dos vistas previas muestran título, descripción e imagen, sin avisos. Sin cambio de requisitos. |
| 2026-10-13 | 1.3 | Durante M9, por delegación del autor, tras compartir la URL en LinkedIn (A9): la vista previa solo mostraba el título, porque `/` no tenía descripción ni imagen y LinkedIn no ejecuta su redirección. SMP-R17: `/` lleva la descripción y los datos para compartir de la página de inicio en inglés. Nuevo SMP-AC19. |
| 2026-10-13 | 1.2 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). SMP-AC17 necesita la URL desplegada: se verifica en M9 (A9). Sin cambio de requisitos. |
| 2026-10-13 | 1.2 | Durante M4, por delegación del autor. SMP-R18 y SMP-AC11: los datos estructurados van en la capa base del grupo `(scene)`, es decir, en inicio y secciones. SMP-R15: `theme-color` sale del manifiesto. SMP-R12: se aclara qué cuenta como botón al imprimir. |
| 2026-10-13 | 1.1 | SMP-R21: la imagen para compartir sale del máster de la variante `photo` (D-66). |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
