# PSU — Sección Experiencia

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-16 |
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
| `freelance` | De julio de 2024 a `"present"` (F-30) | — | 1 | `Python`, `Selenium` | `"public"` (F-25) |
| `teaching-assistant` | De enero de 2026 a diciembre de 2026 (F-30) | `"Universidad de los Andes"` | 1 | Vacío | — |
| `tutor` | De enero de 2022 a diciembre de 2026 (F-30) | — | 1 | Vacío | — |

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
| `meta.description` | Experiencia de Juan Esteban Álvarez García como desarrollador freelance, monitor académico y tutor de programación, y sus competencias interpersonales. | Experience of Juan Esteban Álvarez García as a freelance developer, teaching assistant and programming tutor, plus his interpersonal skills. |
| `jobsTitle` | Experiencia laboral | Work experience |
| `jobs.freelance.role` | Desarrollador freelance | Freelance Developer |
| `jobs.freelance.highlights[0]` | Automaticé con Python/Selenium la extracción de datos y el registro de cientos a miles de reservas hoteleras por ejecución, reduciendo **un proceso semanal a aproximadamente un día**. | Automated data extraction and the entry of hundreds to thousands of hotel reservations per run with Python/Selenium, reducing **a weekly process to approximately one day**. |
| `jobs.freelance.highlights[1]` | Diseñé y publiqué una web odontológica (Next.js, Tailwind CSS, Netlify) con CTA a WhatsApp y formulario de contacto; ha contribuido a atraer **~2-3 nuevos clientes al mes**. | Designed and launched a dental website (Next.js, Tailwind CSS, Netlify) with a WhatsApp CTA and contact form; it has helped attract **~2-3 new clients per month**. |
| `jobs.teaching-assistant.role` | Monitor académico | Teaching Assistant |
| `jobs.teaching-assistant.highlights[0]` | He acompañado a **~60 estudiantes** de Diseño de Productos e Innovación en TI, en dos semestres, mediante evaluación de entregas, resolución de dudas, talleres de apoyo y creación de material didáctico. | Supported **~60 students** in Product Design and Innovation in IT over two semesters by assessing submissions, answering questions, running support workshops and creating teaching materials. |
| `jobs.teaching-assistant.highlights[1]` | Doy retroalimentación a equipos cuyos proyectos buscan llegar al mercado, en sus iteraciones de JTBD, ICP, customer discovery y encaje Producto-Mercado-Modelo-Canal; creación y validación de hipótesis; un MVP en tres iteraciones; growth loops; estimación de mercado y monetización. | I give feedback to teams whose projects aim to reach the market, across their iterations of JTBD, ICP, customer discovery and Product-Market-Model-Channel fit; hypothesis creation and validation; an MVP built in three iterations; growth loops; market sizing and monetization. |
| `jobs.tutor.role` | Tutor particular de programación | Private Programming Tutor |
| `jobs.tutor.highlights[0]` | He acompañado a **~20 estudiantes** en programación, POO, estructuras de datos y algoritmos; diseñé ejercicios y dirigí sesiones personalizadas individuales y grupales de hasta cuatro personas. | I have tutored **~20 students** in programming, OOP, data structures and algorithms; designed exercises and led personalized one-on-one and group sessions of up to four people. |
| `jobs.tutor.highlights[1]` | Materias: Introducción a la Programación; Estructuras de Datos y Algoritmos; Diseño y Programación Orientada a Objetos; Desarrollo de Software en Equipo. | Courses: Introduction to Programming; Data Structures and Algorithms; Object-Oriented Design and Programming; Team Software Development. |
| `jobs.tutor.highlights[2]` | Mis estudiantes mejoran su desempeño en proyectos y exámenes; la mayoría vuelve a contactarme en materias posteriores y me recomienda. | My students improve their performance in projects and exams; most come back for later courses and recommend me. |
| `dentalSiteLinkLabel` | Ver el proyecto | See the project |
| `automationLinkLabel` | Ver el repositorio | See the repository |
| `skillsTitle` | Competencias interpersonales | Interpersonal skills |
| `skills[0]` | Resolución analítica de problemas | Analytical problem-solving |
| `skills[1]` | Comunicación clara y multicultural | Clear and multicultural communication |
| `skills[2]` | Colaboración y liderazgo | Collaboration and leadership |
| `skills[3]` | Autonomía e iniciativa | Autonomy and initiative |
| `skills[4]` | Orientación al detalle | Attention to detail |
| `skills[5]` | Trabajo bajo presión | Working under pressure |
| `skills[6]` | Adaptabilidad y orientación al usuario | Adaptability and user focus |
| `skills[7]` | Mentoría y docencia | Mentoring and teaching |
| `leadershipTitle` | Liderazgo | Leadership |
| `leadership` | Ex co-representante del equipo de calistenia de la Universidad de los Andes: organización de torneos y actividades. | Former co-representative of the Universidad de los Andes calisthenics team: organized tournaments and activities. |

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| PSU-R04 | El componente raíz, `ExperienceSection`, renderiza tres bloques con encabezado `<h3>`, en este orden: experiencia laboral (icono `briefcase`), competencias interpersonales (icono `users`) y liderazgo (icono `flag`). Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| PSU-R05 | Cada trabajo se muestra, en el orden de `facts.jobs`, como un `<article>` con: `role` como `<h4>`; `organization`, si existe; el periodo con `PeriodText`; `formatTeamSize(teamSize, locale)` como chip neutro; los elementos de `stack` como chips neutros; `common.privateRepositoryLabel` como chip con el icono `lock` si `repository` es `"private"`; y `highlights` como lista, cada elemento con `RichText` (TSC-R59). Los fragmentos destacados son los que aparecen en negrita en la tabla de §4.3. |
| PSU-R06 | A continuación de `jobs.freelance.highlights[1]`, en la misma línea, hay un enlace a `sectionPath(locale, "projects")` con el fragmento `#projects-dental-site` y el texto `dentalSiteLinkLabel`. |
| PSU-R07 | El repositorio de la automatización hotelera es público (F-25). A continuación de `jobs.freelance.highlights[0]`, en la misma línea, hay un enlace externo (SYS-R40) a `repositoryLink.href` con el texto `automationLinkLabel`. Como `repository` es `"public"`, el trabajo freelance ya no muestra el chip de repositorio privado (PSU-R05). |
| PSU-R08 | Las competencias se muestran como una lista de ocho chips neutros, en el orden del CV. El liderazgo, como una frase seguida de su periodo con `PeriodText`. |

Iconos propios de esta sección: `briefcase` y `flag`.

### 4.5 Línea de arranque

| ID | Requisito |
| --- | --- |
| PSU-R09 | `bootLines` contiene una línea, construida a partir del número de trabajos y de una palabra clave en inglés por trabajo, tomada de la constante `BOOT_KEYWORDS` del feature: `teaching-assistant` → `teaching`, `freelance` → `freelance`, `tutor` → `tutoring`. |

| `message` | `status` |
| --- | --- |
| `psu0: 3 rails online (freelance, teaching, tutoring)` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| PSU-AC01 | Los hechos son los de §4.2: tres trabajos en el orden freelance, monitoría y tutoría, con sus periodos, todos con `teamSize` 1, y el periodo de liderazgo de 2022 a 2024. | Prueba unitaria |
| PSU-AC02 | Cada idioma tiene 2, 2 y 3 `highlights` para los tres trabajos, en ese orden, y ocho `skills`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| PSU-AC03 | El componente renderiza tres `<h3>` con los títulos de §4.3 en ese orden y tres `<article>`; los periodos son "Jul. 2024 – actualidad", "Ene. – dic. 2026" y "Ene. 2022 – dic. 2026" en español; cada trabajo muestra "Trabajo individual" o "Individual work"; y el trabajo freelance muestra los chips "Python" y "Selenium". | Prueba de componente |
| PSU-AC04 | El enlace "Ver el proyecto" apunta a la ruta de Proyectos con el fragmento `#projects-dental-site`. | Prueba de componente |
| PSU-AC05 | `bootLines` es exactamente la tabla de §4.5 y su mensaje mide 72 caracteres o menos. | Prueba unitaria |
| PSU-AC06 | En `desktop`, abrir la zona de la fuente de poder en `/es/` muestra el panel "Experiencia" con "Monitor académico"; en `/en/`, "Experience" con "Teaching Assistant". Activar "Ver el proyecto" abre el panel de Proyectos con el proyecto de la web odontológica visible. | Prueba E2E |
| PSU-AC07 | El autor revisa ambos idiomas (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |
| PSU-AC08 | El trabajo freelance muestra el enlace "Ver el repositorio" ("See the repository") hacia `https://github.com/PortafolioSor0/All-Inclusive`, con `target="_blank"` y `rel="noopener noreferrer"`, y la sección no muestra ningún chip de repositorio privado. | Prueba de componente |
| PSU-AC09 | La sección renderiza exactamente cuatro `<strong>`, con "un proceso semanal a aproximadamente un día", "~2-3 nuevos clientes al mes", "~60 estudiantes" y "~20 estudiantes" en español, y sus equivalentes en inglés. | Prueba de componente |

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
| 2026-10-16 | 2.0 | Versión 3, por decisión del autor tras su revisión con reclutadores (D-97): se alinea con los CVs actualizados. Nuevo orden de los trabajos: freelance, monitoría y tutoría. Freelance hasta la actualidad; monitoría y tutoría hasta diciembre de 2026 (F-30). Textos del CV en freelance y tutoría (grupos de hasta cuatro); la monitoría suma ~60 estudiantes en dos semestres y una viñeta nueva sobre la retroalimentación a proyectos que buscan llegar al mercado (F-32). Ocho competencias, con "Orientación al detalle" y "Trabajo bajo presión". PSU-R08, la línea de arranque y PSU-AC01 a AC03 y AC09 actualizados. |
| 2026-10-14 | 1.1 | PSU-AC07: el autor leyó en el sitio el contenido nuevo de M10 en ambos idiomas y lo aprobó (A11), el 2026-10-14. Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Estado: pasa a "Implementada" al cerrar M10 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. La lectura del contenido nuevo en el sitio queda para A11. Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.1 | Versión 2, pendiente de aprobación del autor (D-85, F-25). La automatización hotelera es pública: `repository` pasa a `"public"`, `JobFact` gana `repositoryLink` y PSU-R07 enlaza el repositorio con `automationLinkLabel`. Los `highlights` son `RichLine` y destacan tres cifras. PSU-AC03 ya no espera el chip de repositorio privado. Nuevos PSU-AC08 y PSU-AC09. |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). PSU-AC07: el autor revisó ambos idiomas, en la vista simple y en el panel (A4), el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-02, F-08, F-09 y la parte de F-05 y F-18 relativa a la experiencia. |
