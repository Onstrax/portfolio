# PSU — Sección Experiencia

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.1 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre la fuente de poder: la experiencia laboral de Juan Esteban, sus competencias interpersonales y su experiencia de liderazgo.

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección en ambos idiomas, su presentación y su línea de arranque.

**No incluye:** el detalle de la web odontológica, que es un proyecto destacado (ver SSD); aquí solo se menciona y se enlaza.

Feature: `src/features/psu-experience/`. Exporta `psuExperienceSection`. Fuentes: CVs actualizados y hechos F-02, F-05, F-08, F-09 y F-18 del README.

## 3. Definiciones

No aplica.

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| PSU-R01 | `src/features/psu-experience/types.ts` declara los tipos siguientes. |

```ts
export const JOB_IDS = ["teaching-assistant", "freelance", "tutor"] as const;
export type JobId = (typeof JOB_IDS)[number];

export interface JobFact {
  readonly id: JobId;
  readonly period: Period;
  /** Institución, si el trabajo se hizo para una. */
  readonly organization?: string;
  readonly teamSize: TeamSize;
  /** Tecnologías, como chips. Puede estar vacío. */
  readonly stack: readonly string[];
  /** Visibilidad del repositorio asociado, si lo hay. */
  readonly repository?: RepositoryVisibility;
  /** Enlace al repositorio, si es público (PSU-R07). */
  readonly repositoryLink?: LinkFact<"repository">;
}

export interface ExperienceFacts {
  readonly jobs: readonly JobFact[];
  readonly leadershipPeriod: Period;
}

export interface JobText {
  readonly role: string;
  /** Admiten texto destacado (TSC-R58). */
  readonly highlights: readonly RichLine[];
}

export interface ExperienceText extends SectionTextBase {
  readonly jobsTitle: string;
  readonly jobs: Readonly<Record<JobId, JobText>>;
  readonly dentalSiteLinkLabel: string;
  readonly automationLinkLabel: string;
  readonly skillsTitle: string;
  readonly skills: readonly string[];
  readonly leadershipTitle: string;
  readonly leadership: string;
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| PSU-R02 | `content/facts.ts` contiene exactamente los valores de la tabla siguiente. Todos los trabajos son individuales (F-05). |

| `id` | `period` | `organization` | `teamSize` | `stack` | `repository` |
| --- | --- | --- | --- | --- | --- |
| `teaching-assistant` | De enero de 2026 a `"present"` (F-02) | `"Universidad de los Andes"` | 1 | Vacío | — |
| `freelance` | De julio de 2024 a enero de 2025 (F-09) | — | 1 | `Python`, `Selenium` | `"public"` (F-25) |
| `tutor` | De enero de 2022 a `"present"` | — | 1 | Vacío | — |

`leadershipPeriod`: de 2022 a 2024, sin mes.

`freelance` tiene además `repositoryLink`, con `id` `"repository"` y `href` `https://github.com/PortafolioSor0/All-Inclusive` (F-25). Los otros dos trabajos no tienen enlace.

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| PSU-R03 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de la tabla siguiente. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Experiencia | Experience |
| `meta.hardwareName` | Fuente de poder (PSU) | Power supply (PSU) |
| `meta.description` | Experiencia de Juan Esteban Álvarez García como monitor académico, desarrollador freelance y tutor de programación, y sus competencias interpersonales. | Experience of Juan Esteban Álvarez García as a teaching assistant, freelance developer and programming tutor, plus his interpersonal skills. |
| `jobsTitle` | Experiencia laboral | Work experience |
| `jobs.teaching-assistant.role` | Monitor académico | Teaching Assistant |
| `jobs.teaching-assistant.highlights[0]` | Acompaño a **~30 estudiantes** de Diseño de Productos e Innovación en TI mediante evaluación de entregas, resolución de dudas, talleres de apoyo y creación de material didáctico. | Support **~30 students** in IT Product Design and Innovation through assessment, in-class Q&A, supplementary workshops and creation of learning materials. |
| `jobs.freelance.role` | Desarrollador freelance | Freelance Software Developer |
| `jobs.freelance.highlights[0]` | Automaticé la extracción de datos y el registro de cientos a miles de reservas hoteleras por ejecución, reduciendo **un proceso semanal a aproximadamente un día**. | Automated data extraction and entry for hundreds to thousands of hotel bookings per run, cutting **approximately one week of repetitive work to one day**. |
| `jobs.freelance.highlights[1]` | Diseñé y publiqué la web de un consultorio odontológico, que sigo manteniendo. | Designed and deployed a dental practice website, which I still maintain. |
| `jobs.tutor.role` | Tutor particular de programación | Private Programming Tutor |
| `jobs.tutor.highlights[0]` | He acompañado a **~20 estudiantes** en programación, POO, estructuras de datos y algoritmos; diseñé ejercicios y dirigí sesiones individuales y grupos de hasta cinco personas. | Tutored **~20 students** in programming, OOP, data structures and algorithms; designed practice exercises and led one-on-one sessions and groups of up to five. |
| `jobs.tutor.highlights[1]` | Materias: Introducción a la Programación; Estructuras de Datos y Algoritmos; Diseño y Programación Orientada a Objetos; Desarrollo de Software en Equipo. | Courses: Introduction to Programming; Data Structures and Algorithms; Object-Oriented Design and Programming; Team Software Development. |
| `jobs.tutor.highlights[2]` | Mis estudiantes mejoran su desempeño en proyectos y exámenes; la mayoría vuelve a contactarme en materias posteriores y me recomienda. | My students improve their performance in projects and exams; most come back for later courses and recommend me. |
| `dentalSiteLinkLabel` | Ver el proyecto | See the project |
| `automationLinkLabel` | Ver el repositorio | See the repository |
| `skillsTitle` | Competencias interpersonales | Interpersonal skills |
| `skills[0]` | Resolución analítica de problemas | Analytical problem-solving |
| `skills[1]` | Comunicación clara y multicultural | Clear cross-cultural communication |
| `skills[2]` | Colaboración y liderazgo | Teamwork and leadership |
| `skills[3]` | Mentoría y docencia | Teaching and mentoring |
| `skills[4]` | Autonomía e iniciativa | Ownership and initiative |
| `skills[5]` | Adaptabilidad y orientación al usuario | Adaptability and user empathy |
| `leadershipTitle` | Liderazgo | Leadership |
| `leadership` | Ex co-representante del equipo de calistenia de la Universidad de los Andes: organización de torneos y actividades. | Former co-representative of the Universidad de los Andes calisthenics team: organized tournaments and activities. |

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| PSU-R04 | El componente raíz, `ExperienceSection`, renderiza tres bloques con encabezado `<h3>`, en este orden: experiencia laboral (icono `briefcase`), competencias interpersonales (icono `users`) y liderazgo (icono `flag`). Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| PSU-R05 | Cada trabajo se muestra, en el orden de `facts.jobs`, como un `<article>` con: `role` como `<h4>`; `organization`, si existe; el periodo con `PeriodText`; `formatTeamSize(teamSize, locale)` como chip neutro; los elementos de `stack` como chips neutros; `common.privateRepositoryLabel` como chip con el icono `lock` si `repository` es `"private"`; y `highlights` como lista, cada elemento con `RichText` (TSC-R59). Los fragmentos destacados son los que aparecen en negrita en la tabla de §4.3. |
| PSU-R06 | A continuación de `jobs.freelance.highlights[1]`, en la misma línea, hay un enlace a `sectionPath(locale, "projects")` con el fragmento `#projects-dental-site` y el texto `dentalSiteLinkLabel`. |
| PSU-R07 | El repositorio de la automatización hotelera es público (F-25). A continuación de `jobs.freelance.highlights[0]`, en la misma línea, hay un enlace externo (SYS-R40) a `repositoryLink.href` con el texto `automationLinkLabel`. Como `repository` es `"public"`, el trabajo freelance ya no muestra el chip de repositorio privado (PSU-R05). |
| PSU-R08 | Las competencias se muestran como una lista de seis chips neutros. El liderazgo, como una frase seguida de su periodo con `PeriodText`. |

Iconos propios de esta sección: `briefcase` y `flag`.

### 4.5 Línea de arranque

| ID | Requisito |
| --- | --- |
| PSU-R09 | `bootLines` contiene una línea, construida a partir del número de trabajos y de una palabra clave en inglés por trabajo, tomada de la constante `BOOT_KEYWORDS` del feature: `teaching-assistant` → `teaching`, `freelance` → `freelance`, `tutor` → `tutoring`. |

| `message` | `status` |
| --- | --- |
| `psu0: 3 rails online (teaching, freelance, tutoring)` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| PSU-AC01 | Los hechos son los de §4.2: tres trabajos en ese orden, con sus periodos, todos con `teamSize` 1, y el periodo de liderazgo de 2022 a 2024. | Prueba unitaria |
| PSU-AC02 | Cada idioma tiene 1, 2 y 3 `highlights` para los tres trabajos, en ese orden, y seis `skills`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| PSU-AC03 | El componente renderiza tres `<h3>` con los títulos de §4.3 en ese orden y tres `<article>`; los periodos son "Ene. 2026 – actualidad", "Jul. 2024 – ene. 2025" y "Ene. 2022 – actualidad" en español; cada trabajo muestra "Trabajo individual" o "Individual work"; y el trabajo freelance muestra los chips "Python" y "Selenium". | Prueba de componente |
| PSU-AC04 | El enlace "Ver el proyecto" apunta a la ruta de Proyectos con el fragmento `#projects-dental-site`. | Prueba de componente |
| PSU-AC05 | `bootLines` es exactamente la tabla de §4.5 y su mensaje mide 72 caracteres o menos. | Prueba unitaria |
| PSU-AC06 | En `desktop`, abrir la zona de la fuente de poder en `/es/` muestra el panel "Experiencia" con "Monitor académico"; en `/en/`, "Experience" con "Teaching Assistant". Activar "Ver el proyecto" abre el panel de Proyectos con el proyecto de la web odontológica visible. | Prueba E2E |
| PSU-AC07 | El autor revisa ambos idiomas (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |
| PSU-AC08 | El trabajo freelance muestra el enlace "Ver el repositorio" ("See the repository") hacia `https://github.com/PortafolioSor0/All-Inclusive`, con `target="_blank"` y `rel="noopener noreferrer"`, y la sección no muestra ningún chip de repositorio privado. | Prueba de componente |
| PSU-AC09 | La sección renderiza exactamente tres `<strong>`, con "~30 estudiantes", "un proceso semanal a aproximadamente un día" y "~20 estudiantes" en español, y sus equivalentes en inglés. | Prueba de componente |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **La web odontológica se detalla en Proyectos y aquí solo se enlaza** (PSU-R06). | Es a la vez un trabajo freelance y un proyecto destacado (F-06). Describirla en los dos sitios duplicaría sus datos (SYS-R30). |
| **El rango del freelance se mantiene en julio de 2024 a enero de 2025** (F-09). | El mantenimiento posterior es menor y no remunerado como trabajo nuevo; la frase "que sigo manteniendo" lo refleja sin alterar las fechas. |
| **Se omite "durante los últimos 3 meses" del CV.** | Es una referencia temporal relativa que deja de ser cierta con el paso del tiempo. El dato de clientes se da en Proyectos sin ventana temporal. |
| **Competencias interpersonales y liderazgo en esta sección.** | Son experiencia, no formación; el encargo original las sitúa junto a la experiencia laboral. |
| **Sin nombres de profesores, clientes ni compañeros** (F-04). | VSN-R17. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 1.1 | Estado: pasa a "Implementada" al cerrar M10 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. La lectura del contenido nuevo en el sitio queda para A11. Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.1 | Versión 2, pendiente de aprobación del autor (D-85, F-25). La automatización hotelera es pública: `repository` pasa a `"public"`, `JobFact` gana `repositoryLink` y PSU-R07 enlaza el repositorio con `automationLinkLabel`. Los `highlights` son `RichLine` y destacan tres cifras. PSU-AC03 ya no espera el chip de repositorio privado. Nuevos PSU-AC08 y PSU-AC09. |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). PSU-AC07: el autor revisó ambos idiomas, en la vista simple y en el panel (A4), el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-02, F-08, F-09 y la parte de F-05 y F-18 relativa a la experiencia. |
