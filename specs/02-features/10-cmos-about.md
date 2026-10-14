# CMOS — Sección Acerca de este sitio

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.2 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre la pila CMOS: cómo está hecho el portfolio. Convierte el propio sitio en un proyecto demostrable y lleva al evaluador técnico al repositorio, donde están el código y estas especificaciones (VSN-R14).

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección en ambos idiomas, su presentación y su línea de arranque.

**No incluye:** la URL del repositorio, que fija DEP en `SITE.repositoryUrl` (SMP-R01).

Feature: `src/features/cmos-about/`. Exporta `cmosAboutSection`. Es la séptima sección: no es primaria y no cuenta en el display de diagnóstico (VSN §4.2).

## 3. Definiciones

No aplica.

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| CMOS-R01 | `src/features/cmos-about/types.ts` declara los tipos siguientes. |

```ts
export interface AboutFacts {
  /** Tecnologías con las que está construido el sitio. */
  readonly stack: readonly string[];
  readonly repository: LinkFact<"repository">;
}

export interface AboutText extends SectionTextBase {
  readonly intro: string;
  readonly methodTitle: string;
  readonly method: readonly string[];
  readonly stackTitle: string;
  readonly qualityTitle: string;
  readonly quality: readonly string[];
  readonly imageTitle: string;
  readonly image: string;
  readonly repositoryLabel: string;
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| CMOS-R02 | `content/facts.ts` contiene `stack` con estos elementos, en este orden: `Next.js`, `React`, `TypeScript`, `Tailwind CSS`, `Zustand`, `Vitest`, `Playwright`. Y `repository`, con `id: "repository"` y `href` igual a `SITE.repositoryUrl`. |
| CMOS-R03 | `stack` DEBE corresponder a las dependencias reales del proyecto (SYS §4.1). Si una se sustituye, esta lista se actualiza en el mismo cambio. |

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| CMOS-R04 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de la tabla siguiente. |
| CMOS-R05 | Toda afirmación de `quality` DEBE ser cierta en el sitio publicado y estar respaldada por un criterio de aceptación de QLT. Si un criterio deja de cumplirse, la frase se retira antes de publicar. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Acerca de este sitio | About this site |
| `meta.hardwareName` | Pila CMOS | CMOS battery |
| `meta.description` | Cómo está hecho este portfolio: desarrollo guiado por especificaciones, stack, accesibilidad y enlace al código fuente. | How this portfolio is built: spec-driven development, stack, accessibility and a link to the source code. |
| `intro` | Este portfolio es también un proyecto: una placa madre donde cada componente abre una parte de mi perfil. | This portfolio is a project in itself: a motherboard where each component opens a part of my profile. |
| `methodTitle` | Cómo se construyó | How it was built |
| `method[0]` | Con desarrollo guiado por especificaciones (SDD): cada funcionalidad se escribió primero como una especificación con criterios de aceptación verificables. | With spec-driven development (SDD): every feature was first written as a specification with verifiable acceptance criteria. |
| `method[1]` | Cada criterio automático tiene una prueba que lo cita, y una comprobación de trazabilidad impide dar por terminada una funcionalidad sin ellas. | Every automated criterion has a test that cites it, and a traceability check prevents a feature from being marked as done without them. |
| `method[2]` | Desarrollado con asistencia de IA, con las especificaciones como fuente de verdad. | Built with AI assistance, with the specifications as the source of truth. |
| `stackTitle` | Stack | Stack |
| `qualityTitle` | Lo que no se ve | What you do not see |
| `quality[0]` | Sitio estático: sin servidor de aplicación, sin base de datos y sin cookies. | Static site: no application server, no database and no cookies. |
| `quality[1]` | Navegable por completo con teclado y con lector de pantalla, conforme a WCAG 2.2 AA. | Fully navigable by keyboard and screen reader, conforming to WCAG 2.2 AA. |
| `quality[2]` | Sin JavaScript, o en un teléfono, el mismo contenido se muestra como una página sencilla. | Without JavaScript, or on a phone, the same content is shown as a plain page. |
| `imageTitle` | La imagen | The image |
| `image` | La fotografía de la placa y su versión en boceto se generaron con IA y se escalaron a alta resolución; las zonas interactivas y las auras se dibujan en código sobre ellas. | The motherboard photograph and its sketch version were generated with AI and upscaled to high resolution; the interactive areas and the auras are drawn in code on top of them. |
| `repositoryLabel` | Código y especificaciones en GitHub | Code and specifications on GitHub |

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| CMOS-R06 | El componente raíz, `AboutSection`, renderiza `intro`, cuatro bloques con encabezado `<h3>` y el enlace al repositorio, en este orden: `methodTitle` (icono `clipboard-check`), con `method` como lista; `stackTitle` (icono `layers`), con `facts.stack` como chips neutros; `qualityTitle` (icono `shield`), con `quality` como lista; `imageTitle` (icono `image`), con `image`; y, al final, un enlace externo a `facts.repository.href` con el texto `repositoryLabel`, el icono de marca `github` y aspecto de botón primario. |
| CMOS-R07 | Cumple TSC §4.5.1 y no contiene componentes de cliente. |

Iconos propios de esta sección: `clipboard-check`, `layers` e `image`.

### 4.5 Línea de arranque

| ID | Requisito |
| --- | --- |
| CMOS-R08 | `bootLines` contiene una línea, construida con el primer elemento de `facts.stack`. |

| `message` | `status` |
| --- | --- |
| `rtc_cmos: about this site (spec-driven, built with Next.js)` | `none` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| CMOS-AC01 | `facts.stack` es exactamente la lista de CMOS-R02, y cada elemento corresponde, sin distinguir mayúsculas, a una dependencia de `package.json`: `next`, `react`, `typescript`, `tailwindcss`, `zustand`, `vitest` y `@playwright/test`. | Prueba unitaria |
| CMOS-AC02 | `facts.repository.href` es igual a `SITE.repositoryUrl` y empieza por `https://github.com/`. | Prueba unitaria |
| CMOS-AC03 | Cada idioma tiene tres elementos en `method` y tres en `quality`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| CMOS-AC04 | El componente renderiza cuatro `<h3>` con los títulos de §4.3 en ese orden, siete chips de stack y un enlace externo al repositorio con `target="_blank"` y `rel="noopener noreferrer"`. | Prueba de componente |
| CMOS-AC05 | `bootLines` es exactamente la tabla de §4.5. | Prueba unitaria |
| CMOS-AC06 | En `desktop`, abrir la zona de la pila CMOS en `/es/` muestra el panel "Acerca de este sitio" con "Cómo se construyó" y el enlace "Código y especificaciones en GitHub"; en `/en/`, "About this site" con "How it was built". El display de diagnóstico no cambia al abrirlo. | Prueba E2E |
| CMOS-AC07 | Antes de cada publicación, el autor confirma que las tres afirmaciones de `quality` siguen siendo ciertas (CMOS-R05) y revisa ambos idiomas (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Una sección sobre el propio sitio** (D-24). | Para un evaluador técnico, cómo está hecho el portfolio es la mejor muestra de cómo trabaja su autor. Sin esta sección, ese trabajo solo lo vería quien abriera el repositorio por su cuenta. |
| **En la pila CMOS.** | Es la pieza que guarda la configuración de la placa: un lugar natural para "los datos del sistema". Al ser secundaria, no compite con las seis secciones del perfil. |
| **Se declara el uso de IA en el desarrollo y en la imagen.** | Es cierto (principio P6), un evaluador lo va a suponer de todos modos, y contarlo junto con el método, especificaciones primero y pruebas trazables, lo convierte en una fortaleza. |
| **Las afirmaciones de calidad están ligadas a criterios** (CMOS-R05). | Decir "accesible" sin poder demostrarlo es peor que no decirlo. Cada frase tiene detrás una comprobación que falla si deja de ser verdad. |
| **El stack se comprueba contra `package.json`** (CMOS-AC01). | Evita que la lista quede desactualizada si cambia una dependencia. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.2 | Por decisión del autor (D-80). CMOS-R02, CMOS-AC01 y CMOS-AC04: `Motion` sale de la lista del stack, porque el sitio no lo usa: sus animaciones son CSS. |
| 2026-10-13 | 1.1 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). CMOS-AC07: el autor revisó ambos idiomas (A4) el 2026-10-13. Las tres afirmaciones de `quality` tienen detrás los criterios de QLT que M8 deja verificados; la de lector de pantalla se apoya en las pruebas automáticas, y su comprobación manual con Orca queda aplazada (QLT 2.3, PLAN-R10): si encontrara un fallo, se corrige o se retira la frase (CMOS-R05). Sin cambio de requisitos. |
| 2026-10-13 | 1.1 | Pendiente de la revisión de contenido del autor (A4). `image`: el texto menciona las dos variantes de la escena (D-66). |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
