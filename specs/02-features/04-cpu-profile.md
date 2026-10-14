# CPU — Sección Perfil

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.1 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre el procesador: quién es Juan Esteban, su resumen profesional, su formación, sus idiomas y sus reconocimientos. Es la primera sección en el orden canónico y la que más probablemente lee un reclutador.

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección en ambos idiomas, su presentación, sus líneas de arranque y los derivados de la fotografía.

**No incluye:** la experiencia laboral (ver PSU), los proyectos y sus premios (ver SSD), ni los datos de contacto y el archivo del CV (ver IO).

Feature: `src/features/cpu-profile/`. Exporta `cpuProfileSection`. Fuentes: CVs actualizados y hechos F-01, F-03, F-14, F-15 y F-18 del README.

## 3. Definiciones

No aplica.

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| CPU-R01 | `src/features/cpu-profile/types.ts` declara los tipos siguientes. |

```ts
export const EDUCATION_IDS = ["uniandes", "hm"] as const;
export type EducationId = (typeof EDUCATION_IDS)[number];

export const LANGUAGE_IDS = ["es", "en", "de"] as const;
export type LanguageId = (typeof LANGUAGE_IDS)[number];

export interface EducationFact {
  readonly id: EducationId;
  readonly institution: string;
  readonly period: Period;
}

export interface ProfileFacts {
  readonly name: string;
  readonly location: string;
  readonly city: string;
  readonly countryCode: string;
  readonly education: readonly EducationFact[];
  readonly gpa: { readonly value: number; readonly scale: number };
  readonly graduationYear: number;
  readonly exchangeCredits: string;
  readonly languages: readonly LanguageId[];
}

export interface ProfileText extends SectionTextBase {
  readonly degree: string;
  readonly focusAreas: readonly string[];
  readonly availability: string;
  readonly summaryTitle: string;
  readonly summary: readonly string[];
  readonly educationTitle: string;
  readonly education: Readonly<Record<EducationId, { readonly program: string; readonly detail: string }>>;
  readonly gpaLabel: string;
  readonly graduationLabel: string;
  readonly coursesLabel: string;
  readonly courses: readonly string[];
  readonly additionalTraining: string;
  readonly languagesTitle: string;
  readonly languages: Readonly<Record<LanguageId, { readonly name: string; readonly level: string }>>;
  readonly recognitionTitle: string;
  readonly hallOfFame: string;
  readonly projectAwards: string;
  readonly projectAwardsLinkLabel: string;
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| CPU-R02 | `content/facts.ts` contiene exactamente los valores de la tabla siguiente. |

| Campo | Valor |
| --- | --- |
| `name` | `SITE.authorName` (SMP-R02) |
| `location` | `"Bogotá, Colombia"` |
| `city` / `countryCode` | `"Bogotá"` / `"CO"` |
| `education[0]` | `id: "uniandes"`, `institution: "Universidad de los Andes"`, de enero de 2022 a `"present"` |
| `education[1]` | `id: "hm"`, `institution: "Hochschule München"`, de febrero de 2025 a julio de 2025 (F-01) |
| `gpa` | `value: 4.2`, `scale: 5` |
| `graduationYear` | `2027` (F-03) |
| `exchangeCredits` | `"17 ECTS"` |
| `languages` | `["es", "en", "de"]` |

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| CPU-R03 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de las tablas siguientes. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Perfil | Profile |
| `meta.hardwareName` | Procesador (CPU) | Processor (CPU) |
| `meta.description` | Perfil profesional, formación, idiomas y reconocimientos de Juan Esteban Álvarez García, estudiante de Ingeniería de Sistemas y Computación. | Professional profile, education, languages and recognition of Juan Esteban Álvarez García, Systems and Computing Engineering student. |
| `degree` | Ingeniería de Sistemas y Computación | Systems and Computing Engineering |
| `focusAreas[0]` | Desarrollo de software | Software development |
| `focusAreas[1]` | Cloud/DevOps | Cloud/DevOps |
| `focusAreas[2]` | Seguridad aplicada | Applied security |
| `focusAreas[3]` | Machine Learning | Machine Learning |
| `availability` | Disponible desde enero de 2027 · Tiempo completo · Presencial o híbrido en Bogotá | Available from January 2027 · Full-time · On-site or hybrid in Bogotá |
| `summaryTitle` | Resumen | Summary |
| `summary[0]` | Estudiante trilingüe de Ingeniería de Sistemas y Computación en la Universidad de los Andes, en el último semestre de asignaturas y desarrollando la tesis. | Trilingual Systems and Computing Engineering student at Universidad de los Andes, completing final coursework and an undergraduate thesis. |
| `summary[1]` | Experiencia práctica en diseño, desarrollo fullstack y despliegue de software, automatización y servicios cloud en GCP y AWS. | Hands-on experience designing, building and deploying fullstack software, automating workflows and using cloud services on GCP and AWS. |
| `summary[2]` | Interés especial en criptografía, ciberseguridad defensiva, backend/frontend, optimización algorítmica, DevOps e inteligencia artificial. | Particularly interested in cryptography, defensive cybersecurity, backend/frontend engineering, algorithm optimization, DevOps and applied AI. |
| `summary[3]` | He construido soluciones en equipos ágiles y multiculturales, aplicando arquitectura de software, pruebas, Design Thinking y un enfoque centrado en las personas. | Experienced in agile and multicultural teams, applying software architecture, testing, Design Thinking and user-centered problem-solving. |
| `educationTitle` | Formación | Education |
| `education.uniandes.program` | Ingeniería de Sistemas y Computación | B.Sc. in Systems and Computing Engineering |
| `education.uniandes.detail` | Último semestre de asignaturas; tesis en desarrollo; opción académica en Machine Learning, que se completa con el grado. | Final semester of coursework; thesis in progress; Machine Learning minor, completed with the degree. |
| `education.hm.program` | Intercambio académico · Múnich, Alemania | Academic exchange · Munich, Germany |
| `education.hm.detail` | Ingeniería de Software, Blockchain, Interacción Humano-Computadora y UX con seguimiento ocular; trabajo en equipos internacionales. | Software Engineering, Blockchain, Human-Computer Interaction and eye-tracking UX; international team collaboration. |
| `gpaLabel` | Promedio | GPA |
| `graduationLabel` | Graduación prevista | Expected graduation |
| `coursesLabel` | Cursos relevantes | Relevant coursework |
| `additionalTraining` | Formación adicional: Academia GEAR de Google (en curso). | Additional training: Google GEAR Academy (ongoing). |
| `languagesTitle` | Idiomas | Languages |
| `languages.es` | Español · Nativo | Spanish · Native |
| `languages.en` | Inglés · C1, IELTS General Training 7,5 (2025) | English · C1, IELTS General Training 7.5 (2025) |
| `languages.de` | Alemán · B1, sin certificar; cursado en Hochschule München | German · B1, uncertified; studied at Hochschule München |
| `recognitionTitle` | Reconocimientos | Recognition |
| `hallOfFame` | Hall de la Fama de Estructuras de Datos y Algoritmos (semestre 2022-20), por la implementación de los Retos 1, 2 y 3. | Data Structures and Algorithms Hall of Fame (semester 2022-20), for the implementation of Challenges 1, 2 and 3. |
| `projectAwards` | Tres proyectos reconocidos como los mejores de su sección y dos segundos puestos. | Three projects recognized as the best in their section, plus two runner-up awards. |
| `projectAwardsLinkLabel` | Ver los proyectos | See the projects |

En las filas de `languages`, el texto anterior a `·` es `name` y el posterior es `level`.

Cursos (`courses`), en este orden:

| # | Español | Inglés |
| --- | --- | --- |
| 1 | Ingeniería Criptográfica y sus Aplicaciones en TI | Cryptographic Engineering and IT Applications |
| 2 | Computación Cuántica y Criptografía | Quantum Computing and Cryptography |
| 3 | Algoritmos de Computación Cuántica | Quantum Computing Algorithms |
| 4 | Infraestructura Computacional | Computer Infrastructure |
| 5 | Diseño y Análisis de Algoritmos | Design and Analysis of Algorithms |
| 6 | Fundamentos de Machine Learning | Machine Learning Fundamentals |
| 7 | Inteligencia de Negocios | Business Intelligence |
| 8 | Modelado, Simulación y Optimización | Modeling, Simulation and Optimization |
| 9 | El Hombre Artificial | The Artificial Man |
| 10 | Análisis con Deep Learning | Deep Learning Analysis |
| 11 | Principios y Fundamentos del Deep Learning | Principles and Foundations of Deep Learning |
| 12 | Desarrollo de Software en Equipo | Team Software Development |
| 13 | Construcción de Aplicaciones Móviles | Mobile Application Development |
| 14 | Desarrollo de Software en la Nube | Cloud Software Development |
| 15 | DevOps y Despliegue Continuo | DevOps and Continuous Deployment |

Los cursos 6 a 11 son los de la opción académica en Machine Learning (F-22).

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| CPU-R04 | El componente raíz, `ProfileSection`, renderiza los cinco bloques de la tabla siguiente, en ese orden, cumpliendo TSC §4.5.1. |
| CPU-R05 | El promedio se muestra como `gpaLabel`, dos puntos y `formatDecimal(4.2, locale, 1)`, una barra y `formatDecimal(5, locale, 1)`: "Promedio: 4,2/5,0" y "GPA: 4.2/5.0". Los periodos se muestran con `PeriodText` (I18N-R21). |
| CPU-R06 | La lista de cursos se muestra dentro de un elemento `<details>` cerrado por defecto, cuyo `<summary>` es `coursesLabel` seguido del número de cursos entre paréntesis (principio P7). |
| CPU-R07 | Esta sección no contiene componentes de cliente. |

| Bloque | Encabezado `<h3>` e icono | Contenido |
| --- | --- | --- |
| Identidad | Sin encabezado | La fotografía (CPU-R09); el nombre, con el rol tipográfico "Título de panel"; `degree`; los cuatro `focusAreas` como chips neutros; `location`; `availability`; y un enlace con aspecto de botón primario a `CV_FILES[locale]` (ver IO), con el texto `common.downloadCvLabel` y el icono `download` |
| Resumen | `summaryTitle`, icono `file-text` | Los cuatro elementos de `summary`, como lista |
| Formación | `educationTitle`, icono `graduation-cap` | Una entrada por elemento de `education`: institución como `<h4>`, `program`, periodo y `detail`. La entrada de Uniandes añade el promedio, `graduationLabel` con `graduationYear` y los cursos (CPU-R06). La de Múnich añade `exchangeCredits` como chip. Al final, `additionalTraining` |
| Idiomas | `languagesTitle`, icono `languages` | Una lista con `name` y `level` de cada idioma, en el orden de `facts.languages` |
| Reconocimientos | `recognitionTitle`, icono `award` | `hallOfFame`; y `projectAwards` seguido de un enlace a `sectionPath(locale, "projects")` con el texto `projectAwardsLinkLabel` |

Iconos propios de esta sección, añadidos a `src/shared/ui/icons/` (VIS-R41): `file-text`, `graduation-cap`, `languages` y `award`.

### 4.5 Fotografía

| ID | Requisito |
| --- | --- |
| CPU-R08 | La fuente es `design/portrait/source.jpg` (699×762 px, F-14). `pnpm assets:build` recorta el cuadrado de 440 px de lado cuya esquina superior izquierda está en `x = 259`, `y = 205`, y genera los nueve derivados de la tabla siguiente en `public/portrait/`, con el nombre `portrait-<lado>.<versión>.<extensión>`, sin metadatos (QLT-R47). La versión son los 12 primeros caracteres del SHA-256 de la fuente. |
| CPU-R09 | La fotografía se muestra con un elemento `<picture>` (AVIF, WebP y JPEG), a 96×96 px, con los tres tamaños en `srcset`, `width` y `height` declarados, esquinas con `radius-control`, borde de 1 px en `ink` y `alt` igual a `facts.name`. |
| CPU-R10 | El manifiesto exporta `PORTRAIT_ASSET` con el tipo `PortraitAsset`, que se añade a `src/shared/contracts/assets.ts`. `assets:check` comprueba para la fotografía lo mismo que para la escena: versión, existencia, pesos y ausencia de metadatos. |

| Lado (px) | AVIF, máximo | WebP, máximo | JPEG, máximo |
| --- | --- | --- | --- |
| 96 | 4 kB | 5 kB | 7 kB |
| 192 | 9 kB | 12 kB | 16 kB |
| 384 | 22 kB | 30 kB | 42 kB |

```ts
export interface PortraitAsset {
  readonly version: string;
  readonly sources: {
    readonly avif: readonly ImageSource[];
    readonly webp: readonly ImageSource[];
    readonly jpeg: readonly ImageSource[];
  };
}
```

### 4.6 Líneas de arranque

| ID | Requisito |
| --- | --- |
| CPU-R11 | `bootLines` contiene las dos líneas siguientes, construidas a partir de `facts.name`, del `degree` en inglés y de `facts.languages` con el nivel de cada idioma. |

| `message` | `status` |
| --- | --- |
| `cpu0: Juan Esteban Álvarez García (Systems and Computing Engineering)` | `none` |
| `Language packs loaded: es (native), en (C1), de (B1)` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| CPU-AC01 | Los hechos son los de §4.2: dos entradas de formación con sus periodos, promedio 4.2 sobre 5, graduación en 2027 y tres idiomas. | Prueba unitaria |
| CPU-AC02 | Cada idioma tiene cuatro elementos en `summary`, quince cursos, cuatro `focusAreas` y un texto por cada `EducationId` y `LanguageId`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| CPU-AC03 | El componente renderiza, en ambos idiomas, cuatro encabezados `<h3>` con los títulos de §4.4 en ese orden, la imagen con `alt` igual al nombre, y el promedio como "4,2/5,0" en español y "4.2/5.0" en inglés. | Prueba de componente |
| CPU-AC04 | Los periodos se renderizan como "Ene. 2022 – actualidad" y "Feb. – jul. 2025" en español, y "Jan. 2022 – present" y "Feb. – Jul. 2025" en inglés, dentro de elementos `<time>`. | Prueba de componente |
| CPU-AC05 | Los cursos están dentro de un `<details>` cerrado cuyo resumen es "Cursos relevantes (15)" o "Relevant coursework (15)". | Prueba de componente |
| CPU-AC06 | `bootLines` es exactamente la tabla de §4.6. | Prueba unitaria |
| CPU-AC07 | En `desktop`, abrir la zona del procesador en `/es/` muestra el panel "Perfil" con el texto "Disponible desde enero de 2027" y el enlace "Descargar CV (PDF)"; en `/en/`, "Profile", "Available from January 2027" y "Download résumé (PDF)". | Prueba E2E |
| CPU-AC08 | El enlace "Ver los proyectos" del panel de Perfil abre el panel de Proyectos. | Prueba E2E |
| CPU-AC09 | `public/portrait/` contiene exactamente nueve archivos con los nombres de CPU-R08, cada uno dentro de su peso máximo y sin metadatos. | Ejecución de `pnpm assets:check` |
| CPU-AC10 | El autor revisa ambos idiomas y el encuadre de la fotografía (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Resumen en cuatro frases, no en un párrafo.** | Es el mismo texto del CV, partido por ideas. Un reclutador lo recorre en diagonal (principio P7). |
| **Cursos plegados** (CPU-R06). | Diez nombres de asignaturas interesan a quien evalúa en profundidad, no a quien hace una primera lectura. |
| **Solo "2027" y la disponibilidad** (F-03). | La fecha exacta de grado depende de si hay prácticas; lo que le importa al reclutador es desde cuándo puede trabajar a tiempo completo. |
| **Los premios por proyecto no se listan aquí** (CPU-R04). | Cada premio se muestra junto a su proyecto (ver SSD). Aquí hay una frase de resumen con un enlace, para no escribir el mismo dato dos veces (SYS-R30). |
| **Fotografía con el nombre como texto alternativo.** | Identifica a la persona sin describir la imagen con palabras como "foto", que los lectores de pantalla ya anuncian. |
| **Botón de descarga del CV en Perfil.** | Es la primera sección que se abre y la acción que más busca un reclutador (VSN-AC02). |
| **Recorte de la fotografía definido en píxeles.** | Hace reproducible el encuadre y deja fuera el edificio del fondo. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 1.1 | Estado: pasa a "Implementada" al cerrar M10 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. La lectura del contenido nuevo en el sitio queda para A11. Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.1 | Versión 2, pendiente de aprobación del autor (D-87, F-22, F-29). `focusAreas` añade Machine Learning, que también muestra la placa de identidad de la escena (SCN-R46). `education.uniandes.detail` menciona la opción académica en Machine Learning, y los cursos pasan de diez a quince con los cinco restantes de esa opción. CPU-R04, CPU-AC02 y CPU-AC05 actualizados. Las traducciones al inglés de los cursos nuevos son propuestas y las revisa el autor. |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). CPU-AC10: el autor revisó ambos idiomas y el encuadre de la fotografía, en la vista simple y en el panel (A4), el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-01, F-03, F-14, F-15 y la parte de F-18 relativa al Hall de la Fama. |
