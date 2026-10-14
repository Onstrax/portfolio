# SSD — Sección Proyectos

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre el SSD: los once proyectos de Juan Esteban, cuatro destacados y siete en formato compacto, con su stack, el tamaño del equipo, los reconocimientos y los enlaces a los repositorios públicos; y el contenido de los casos de estudio de tres de los destacados (VSN-R21).

## 2. Alcance

**Incluye:** tipos, hechos y textos de los proyectos en ambos idiomas, su presentación, sus anclas, sus líneas de arranque y el contenido de los casos de estudio (§4.6).

**No incluye:** capturas ni demos de los proyectos, tampoco en los casos (VSN §7, D-90); la página que muestra un caso, que es de SMP §4.9; ni la automatización hotelera, que no tiene entidad de proyecto y se describe en Experiencia (ver PSU).

Feature: `src/features/ssd-projects/`. Exporta `ssdProjectsSection`. Fuentes: CVs actualizados, el repositorio de la web odontológica y hechos F-04 a F-07, F-10 a F-12, F-23 y F-25 a F-28 del README.

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Proyecto destacado** | Proyecto con `featured: true`. Se muestra completo y antes que los demás. |
| **Proyecto compacto** | Proyecto con `featured: false`. Se muestra con menos espacio. |

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| SSD-R01 | `src/features/ssd-projects/types.ts` declara los tipos siguientes. |
| SSD-R02 | Cada proyecto tiene nombre en exactamente uno de dos lugares: `properName` en los hechos, si es un nombre propio que no se traduce; o `name` en los textos, si es un nombre descriptivo. Una prueba lo comprueba. |

```ts
export const PROJECT_IDS = [
  "thesis",
  "andespace",
  "dental-site",
  "habicapital",
  "monitoring-platform",
  "email-blacklist",
  "ahorrapp",
  "dogspa",
  "algorithms",
  "respiratory-etl",
  "sdg-text-classifier",
] as const;
export type ProjectId = (typeof PROJECT_IDS)[number];

export const PROJECT_LINK_IDS = [
  "repository",
  "code",
  "flutter",
  "frontend",
  "backend",
  "wiki",
  "landing",
  "live-site",
] as const;
export type ProjectLinkId = (typeof PROJECT_LINK_IDS)[number];

export interface ProjectFact {
  readonly id: ProjectId;
  readonly featured: boolean;
  readonly properName?: string;
  readonly stack: readonly string[];
  readonly teamSize: TeamSize;
  readonly repository: RepositoryVisibility;
  readonly links: readonly LinkFact<ProjectLinkId>[];
}

export interface ProjectsFacts {
  readonly projects: readonly ProjectFact[];
}

export interface ProjectText {
  readonly name?: string;
  readonly tagline: string;
  /** Admiten texto destacado (TSC-R58). */
  readonly highlights: readonly RichLine[];
  /** Reconocimiento recibido, si lo hay. */
  readonly award?: string;
  /** Aclaración breve, si la hay. */
  readonly note?: string;
}

export interface ProjectsText extends SectionTextBase {
  readonly featuredTitle: string;
  readonly moreTitle: string;
  readonly projects: Readonly<Record<ProjectId, ProjectText>>;
  readonly linkLabels: Readonly<Record<ProjectLinkId, string>>;
  /** Texto del enlace de una tarjeta a su caso de estudio. */
  readonly caseLinkLabel: string;
  /** Contenido de los casos de estudio (TSC-R60, §4.6). */
  readonly cases: Readonly<Record<CaseStudyId, CaseStudyText>>;
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| SSD-R03 | `content/facts.ts` contiene los once proyectos de la tabla siguiente, en ese orden, y los enlaces de la segunda tabla (F-12, F-23, F-25). |

| `id` | `featured` | `properName` | `stack` | `teamSize` | `repository` |
| --- | --- | --- | --- | --- | --- |
| `thesis` | Sí | — | `Python`, `SageMath`, `LaTeX` | 2 | `public` |
| `andespace` | Sí | `AndeSpace` | `Flutter`, `FastAPI`, `PostgreSQL`, `GitHub Actions` | 6 | `public` |
| `dental-site` | Sí | — | `Next.js`, `TypeScript`, `Tailwind CSS`, `Leaflet`, `Netlify` | 1 | `private` |
| `habicapital` | Sí | `HabiCapital` | `Python`, `FastAPI`, `Next.js`, `PostgreSQL`, `Docker` | 1 | `public` |
| `monitoring-platform` | No | — | `GCP`, `GitHub Actions`, `CI/CD` | 4 | `private` |
| `email-blacklist` | No | — | `AWS`, `GitHub Actions`, `CI/CD` | 4 | `public` |
| `ahorrapp` | No | `AhorrApp` | `Angular` | 3 | `public` |
| `dogspa` | No | `DogSPA` | `Angular`, `Spring`, `MySQL` | 5 | `private` |
| `algorithms` | No | — | `Java`, `Python` | 2 | `private` |
| `respiratory-etl` | No | — | `Python`, `pandas`, `FastAPI`, `SQLAlchemy`, `SQLite` | 3 | `public` |
| `sdg-text-classifier` | No | — | `Python`, `scikit-learn`, `FastAPI`, `Next.js` | 3 | `public` |

| Proyecto | `id` del enlace | `href` |
| --- | --- | --- |
| `thesis` | `repository` | `https://github.com/CesarAAC/Tesis-ZPK-LWE-Autentication` |
| `andespace` | `flutter` | `https://github.com/G33-Moviles-2026-1/G33-Flutter-Moviles-2026-1` |
| `andespace` | `backend` | `https://github.com/G33-Moviles-2026-1/G33-Backend-Moviles-2026-1` |
| `andespace` | `wiki` | `https://github.com/G33-Moviles-2026-1/Wiki` |
| `dental-site` | `live-site` | `https://martha-landing.netlify.app/` |
| `habicapital` | `code` | `https://github.com/Onstrax/HabiCapital` |
| `ahorrapp` | `frontend` | `https://github.com/Onstrax/AhorrApp` |
| `ahorrapp` | `backend` | `https://github.com/Onstrax/AhorrApp-Backend` |
| `ahorrapp` | `landing` | `https://github.com/Onstrax/Ahorrapp-Landing` |
| `email-blacklist` | `repository` | `https://github.com/DevOps-Misw4304-202610/Proyecto1` |
| `respiratory-etl` | `repository` | `https://github.com/Onstrax/ETL` |
| `sdg-text-classifier` | `repository` | `https://github.com/Onstrax/Analitica-de-textos` |

Los proyectos que no aparecen en la segunda tabla no tienen enlaces.

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| SSD-R04 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de las tablas siguientes. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Proyectos | Projects |
| `meta.hardwareName` | SSD NVMe | NVMe SSD |
| `meta.description` | Proyectos de Juan Esteban Álvarez García: tesis de autenticación poscuántica, AndeSpace, HabiCapital, una web en producción y trabajos de cloud y DevOps. | Projects by Juan Esteban Álvarez García: post-quantum authentication thesis, AndeSpace, HabiCapital, a production website, and cloud and DevOps work. |
| `featuredTitle` | Destacados | Featured |
| `moreTitle` | Más proyectos | More projects |
| `linkLabels.repository` | Repositorio | Repository |
| `linkLabels.code` | Código | Code |
| `linkLabels.flutter` | Flutter | Flutter |
| `linkLabels.frontend` | Frontend | Frontend |
| `linkLabels.backend` | Backend | Backend |
| `linkLabels.wiki` | Wiki | Wiki |
| `linkLabels.landing` | Landing | Landing |
| `linkLabels.live-site` | Sitio en vivo | Live site |
| `caseLinkLabel` | Leer el caso completo | Read the full case study |

#### 4.3.1 `thesis`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Tesis: autenticación poscuántica de conocimiento cero | Thesis: post-quantum zero-knowledge authentication |
| `tagline` | Investigación en desarrollo | Ongoing research |
| `highlights[0]` | Codiseño de un protocolo de autenticación Zero-Knowledge **resistente a ataques cuánticos**, basado en Learning with Errors (LWE); lidero el componente matemático LWE. | Co-designing a **quantum-resistant** Zero-Knowledge authentication protocol based on Learning with Errors (LWE); leading the LWE mathematical component. |
| `highlights[1]` | Marco teórico completado; en desarrollo, benchmarks de tiempo, memoria, tráfico de red y estimación de seguridad en bits. | Theoretical framework completed; developing benchmarks for runtime, memory, network traffic and estimated security strength in bits. |
| `note` | Asesorada en la Universidad de los Andes. | Advised at Universidad de los Andes. |

#### 4.3.2 `andespace`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Reservas de espacios universitarios | University space booking app |
| `highlights[0]` | Implementé de extremo a extremo los módulos de búsqueda, inicio, reservas y perfil/amigos, integrando interfaz móvil, API y datos. | Owned the search, home, booking and profile/friends features end to end, integrating mobile UI, API and data layer. |
| `highlights[1]` | Calidad de código apoyada en SonarQube. | Used SonarQube for code quality checks. |
| `award` | Mejor proyecto de su sección · Construcción de Aplicaciones Móviles | Best Project in its section · Mobile Application Development |

#### 4.3.3 `dental-site`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Web para un consultorio odontológico | Dental practice website |
| `tagline` | Sitio en producción para un cliente real | Production site for a real client |
| `highlights[0]` | Diseñé, desarrollé y publiqué el sitio completo: tratamientos, profesionales, preguntas frecuentes, mapa de sedes y páginas legales. | Designed, built and deployed the whole site: treatments, team, FAQ, clinic map and legal pages. |
| `highlights[1]` | Llamada a la acción por WhatsApp y formulario de contacto; ha contribuido a atraer **~2-3 nuevos clientes al mes**. | WhatsApp call to action and contact form; it has helped attract an estimated **2-3 new clients per month**. |
| `highlights[2]` | Mantenimiento continuo desde su publicación. | Ongoing maintenance since launch. |

#### 4.3.4 `habicapital`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Simulación de banca digital segura | Secure digital banking simulation |
| `highlights[0]` | Diseñé y construí individualmente una plataforma P2P con seguridad aplicada: JWT, Argon2id, AES-256-GCM, HMAC, ledger inmutable e idempotencia. | Individually designed and built a P2P platform with applied security: JWT, Argon2id, AES-256-GCM, HMAC, immutable ledger and idempotency. |
| `highlights[1]` | Desarrollo asistido por IA con especificaciones (SDD) y TDD; más de 100 pruebas automatizadas exitosas y **~94 % de cobertura reportada**. | AI-assisted specification-driven development (SDD) and TDD; over 100 passing automated tests and **~94% reported code coverage**. |

#### 4.3.5 `monitoring-platform`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Plataforma de seguimiento de monitorías | Teaching assistant tracking platform |
| `tagline` | Cloud | Cloud |
| `highlights[0]` | Desarrollé en equipo un sistema de seguimiento semanal entre docentes y monitores sobre Cloud Run, Compute Engine, Cloud SQL, Cloud Storage, IAM y Artifact Registry. | Co-developed a weekly progress-tracking platform for faculty and teaching assistants on Cloud Run, Compute Engine, Cloud SQL, Cloud Storage, IAM and Artifact Registry. |

#### 4.3.6 `email-blacklist`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Microservicio de lista negra de correos | Email blacklist microservice |
| `tagline` | DevOps | DevOps |
| `highlights[0]` | Participé en el desarrollo y la entrega de un microservicio con integración y despliegue automatizados sobre ECS/Fargate, RDS, CloudWatch, CodeBuild y CodePipeline. | Collaborated on a microservice with automated integration and deployment on ECS/Fargate, RDS, CloudWatch, CodeBuild and CodePipeline. |

#### 4.3.7 `ahorrapp`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Finanzas personales para universitarios | Personal finance for university students |
| `highlights[0]` | Desarrollé la aplicación funcional y participé en entrevistas, definición de JTBD/ICP, iteraciones con usuarios y validación del producto. | Built the functional application and contributed to interviews, JTBD/ICP definition, user feedback cycles and product validation. |
| `award` | Mejor proyecto de su sección · Diseño de Productos e Innovación en TI | Best Project in its section · IT Product Design and Innovation |

#### 4.3.8 `dogspa`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Gestión de sedes y servicios | Location and services management |
| `highlights[0]` | Implementé módulos fullstack de sedes, ciudades y catálogo de servicios, con integración frontend-backend. | Built end-to-end location, city and service-catalog modules with frontend-backend integration. |
| `award` | Mejor proyecto final de su sección · Desarrollo de Software en Equipo | Best Final Project in its section · Team Software Development |

#### 4.3.9 `algorithms`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Proyectos de Diseño y Análisis de Algoritmos | Design and Analysis of Algorithms projects |
| `tagline` | Optimización y heurísticas | Optimization and heuristics |
| `highlights[0]` | Minimización de costos sobre grafos, con algoritmos de recorrido y manipulación. | Cost minimization on graphs, using traversal and manipulation algorithms. |
| `highlights[1]` | Solución aproximada, basada en heurística, al problema NP-completo de ordenamiento de panqueques. | Heuristic-based approximate solution to the NP-complete pancake sorting problem. |
| `award` | Dos segundos puestos de su sección | Two runner-up awards in its section |

#### 4.3.10 `respiratory-etl`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | ETL de enfermedades respiratorias agudas en Bogotá | Acute respiratory disease ETL for Bogotá |
| `tagline` | Ingeniería de datos | Data engineering |
| `highlights[0]` | Construí todo el proceso ETL: extracción, transformación y carga incremental a un data warehouse en SQLite, servido con una API en FastAPI. El resto del equipo entrenó un modelo de regresión y creó los tableros de Power BI. | Built the whole ETL pipeline: extraction, transformation and incremental loading into a SQLite data warehouse served through a FastAPI API. Teammates trained a regression model and built the Power BI dashboards. |

#### 4.3.11 `sdg-text-classifier`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Clasificador de textos según los Objetivos de Desarrollo Sostenible | Sustainable Development Goals text classifier |
| `tagline` | Machine Learning | Machine Learning |
| `highlights[0]` | Entrené y evalué un modelo SVM que clasifica textos en 4 Objetivos de Desarrollo Sostenible, y exploré y procesé los datos. | Trained and evaluated an SVM model that classifies texts into 4 Sustainable Development Goals, and explored and processed the data. |
| `highlights[1]` | Desarrollé la interfaz web en Next.js y su conexión con la API del modelo, implementé la aumentación de datos y comparé sus resultados, y coordiné las entregas del equipo. | Built the Next.js web interface and its connection to the model API, implemented data augmentation and compared its results, and coordinated the team’s deliverables. |

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| SSD-R05 | El componente raíz, `ProjectsSection`, renderiza dos bloques con encabezado `<h3>`: `featuredTitle` (icono `star`), con los proyectos destacados, y `moreTitle` (icono `folder`), con los compactos, cada grupo en el orden de `facts.projects`. Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| SSD-R06 | Cada proyecto es un `<article>` cuyo `id` es `idScope` seguido de `projects-` y de su `id` (TSC-R32). Ese identificador local es su fragmento de URL (SYS-R11). |
| SSD-R07 | Un proyecto muestra, en este orden: su nombre como `<h4>`; `tagline`; `award`, si existe, como chip de reconocimiento con el icono `award`; `formatTeamSize(teamSize, locale)` como chip neutro con el icono `users`; `common.privateRepositoryLabel` como chip con el icono `lock` si `repository` es `"private"`; los elementos de `stack` como chips neutros; `highlights` como lista, cada elemento con `RichText` (TSC-R59); `note`, si existe; sus enlaces, con el texto de `linkLabels` y aspecto de enlace externo (VIS §4.6, SYS-R40); y, si su `id` está en `CASE_STUDY_IDS`, un enlace interno a `caseStudyPath(locale, id)` con el texto `caseLinkLabel`, el icono `chevron-right` y aspecto de botón secundario. Los fragmentos destacados son los que aparecen en negrita en las tablas de §4.3. |
| SSD-R08 | Los proyectos destacados se muestran en una columna, separados por una línea de 1 px. Los compactos se muestran en una cuadrícula de dos columnas cuando el contenedor mide 640 px o más de ancho, y en una columna cuando mide menos. La diferencia entre unos y otros es solo de disposición: ambos muestran todos los campos de SSD-R07. |
| SSD-R09 | Los enlaces de un proyecto llevan un nombre accesible que incluye el nombre del proyecto, de modo que dos enlaces "Backend" de proyectos distintos se distingan: el texto visible es el de `linkLabels` y el nombre del proyecto se añade como texto solo para lectores de pantalla. |

Iconos propios de esta sección: `star` y `folder`.

### 4.5 Líneas de arranque

| ID | Requisito |
| --- | --- |
| SSD-R10 | `bootLines` contiene las dos líneas siguientes. La primera se construye con el número de proyectos y el de destacados. La segunda, con el `name` en inglés del primer proyecto destacado, con su inicial en minúscula. |

| `message` | `status` |
| --- | --- |
| `nvme0n1: 11 projects mounted, 4 featured` | `ok` |
| `Loading thesis: post-quantum zero-knowledge authentication` | `none` |

### 4.6 Casos de estudio

| ID | Requisito |
| --- | --- |
| SSD-R11 | `cases`, en `content/es.ts` y `content/en.ts`, contiene exactamente los textos de las tablas siguientes, uno por cada `CaseStudyId` (TSC-R60). Los fragmentos en negrita son el `emphasis` de un `EmphasizedText` (TSC-R58). Los datos que no dependen del idioma (nombre propio, tamaño de equipo, tecnologías, reconocimiento y enlaces) no se repiten aquí: la página del caso los toma del proyecto (SMP §4.9). |
| SSD-R12 | Un caso tiene `teamContributions` si y solo si su proyecto tiene `teamSize` mayor que 1, y su campo `team` lo deja claro: individual, en pareja o el tamaño y el reparto del equipo (VSN-R18). Las acciones del autor van en primera persona del singular en español y en primera persona implícita en inglés (I18N-R37); las del equipo, en primera persona del plural en español y en voz pasiva o con el sujeto explícito en inglés. Ningún caso nombra a otra persona (VSN-R17): se habla de "mi compañero", "el equipo" o "la doctora". |
| SSD-R13 | Cada caso se apoya solo en los hechos que el autor confirmó (F-26 a F-28) y en los que ya figuran en esta spec. Las cifras de un caso coinciden con las del proyecto en §4.3. |

#### 4.6.1 `thesis`

| Campo | Español | Inglés |
| --- | --- | --- |
| `title` | Tesis de autenticación poscuántica | Post-quantum authentication thesis |
| `description` | Caso de estudio de mi tesis: un protocolo de autenticación de conocimiento cero, resistente a la computación cuántica y basado en Module-LWE. | Case study of my thesis: a quantum-resistant zero-knowledge authentication protocol based on Module-LWE. |
| `problem[0]` | Se estima que, entre 2028 y 2035, la computación cuántica podrá romper la criptografía que hoy protege la autenticación. A la vez, para demostrar quién es, el usuario suele entregar más información de la que debería, y pierde el control de sus datos. | Quantum computing is expected to break the cryptography that protects authentication today somewhere between 2028 and 2035. At the same time, users usually hand over more information than they should just to prove who they are, and lose control of their data. |
| `problem[1]` | Si no se resuelve, el riesgo es doble: la suplantación de identidad y la filtración de información personal sensible. | Left unsolved, the risk is twofold: identity theft and leaks of sensitive personal information. |
| `team` | Tesis en pareja. Los dos aportamos a todo el trabajo, pero cada uno lidera una parte. | Thesis written in a pair. Both of us contribute to every part, but each one leads a different area. |
| `contributions[0]` | Lidero el componente matemático de Learning with Errors (LWE), incluida la elección de su variante y de sus parámetros. | Lead the Learning with Errors (LWE) mathematical component, including the choice of its variant and parameters. |
| `contributions[1]` | Codiseño el protocolo de autenticación y su prototipo. | Co-design the authentication protocol and its prototype. |
| `teamContributions` | Mi compañero lidera la parte de pruebas de conocimiento cero (ZKP). | My partner leads the zero-knowledge proof (ZKP) part. |
| `decisions[0].options` | Un protocolo interactivo o uno no interactivo; y, para LWE, la variante binaria, Ring-LWE, Module-LWE o la de redondeo (Learning with Rounding). | An interactive or a non-interactive protocol; and, for LWE, the binary, Ring-LWE, Module-LWE or rounding (Learning with Rounding) variant. |
| `decisions[0].choice` | Un protocolo no interactivo basado en Module-LWE. | A non-interactive protocol based on Module-LWE. |
| `decisions[0].reason` | Los dos se parametrizan con facilidad hasta alcanzar un objetivo de seguridad concreto, son ligeros y funcionan en dispositivos de gama baja. | Both can be tuned easily to reach a given security target, are lightweight and run on low-end devices. |
| `changes[0]` | La primera versión del prototipo podía filtrar el secreto del usuario. La rediseñamos: en lugar de enviar el compromiso por la red, ahora solo se envían sus bits altos, que el verificador reconstruye. | The first version of the prototype could leak the user’s secret, so it was redesigned: instead of sending the commitment over the network, it now sends only its high bits, which the verifier reconstructs. |
| `outcome[0]` | El tráfico de red pasó **de megabytes a pocos kilobytes**. | Network traffic went **from megabytes down to a few kilobytes**. |
| `outcome[1]` | El tiempo de ejecución pasó de varios segundos a **menos de medio segundo**. | Runtime went from several seconds to **under half a second**. |
| `outcome[2]` | El marco teórico está completo; los benchmarks de tiempo, memoria, tráfico de red y seguridad en bits siguen en desarrollo. | The theoretical framework is complete; benchmarks for runtime, memory, network traffic and security in bits are still in progress. |
| `learned[0]` | Sumaría al equipo a alguien de ingeniería electrónica que pudiera llevar la NTT (transformada teórica de números) de la teoría a una implementación real. | Would add someone with an electronic engineering background to the team, to take the NTT (number-theoretic transform) from theory to a real implementation. |

#### 4.6.2 `andespace`

| Campo | Español | Inglés |
| --- | --- | --- |
| `title` | AndeSpace | AndeSpace |
| `description` | Caso de estudio de AndeSpace: una app para reservar espacios de la universidad y coordinarse con amigos según sus horarios. | AndeSpace case study: an app to book university spaces and coordinate with friends based on their schedules. |
| `problem[0]` | En la universidad había espacios desaprovechados, y no existía una forma sencilla de reservar espacios para grupos ni de organizarse con amigos según sus horarios. | University spaces went unused, and there was no simple way to book group spaces or to get together with friends based on everyone’s schedule. |
| `problem[1]` | Sin ella se desperdician espacios y tiempo, y los grupos no llegan a coordinarse porque encontrar un horario común cuesta demasiado. | Without it, spaces and time are wasted, and groups fail to coordinate because finding a common slot takes too much effort. |
| `team` | Equipo de 6: tres personas en la app de Kotlin y tres en la de Flutter, todas también en el backend y la base de datos compartidos. Yo trabajé en la de Flutter. | Team of 6: three people on the Kotlin app and three on the Flutter app, all of them also on the shared backend and database. Worked on the Flutter app. |
| `contributions[0]` | Diseñé y construí la pantalla de inicio, la búsqueda, la reserva de salones y la red de amigos con estados de visibilidad (ocupado, en casa, libre…). | Designed and built the home screen, search, classroom booking and the friends network with visibility statuses (busy, at home, free…). |
| `contributions[1]` | Cada una de punta a punta: lluvia de ideas, diseño, documentación, base de datos, backend y Flutter. | Each one end to end: brainstorming, design, documentation, database, backend and Flutter. |
| `teamContributions` | Mis compañeros hicieron, también de punta a punta, los ajustes, los favoritos, el historial, el horario personal, el cruce de horarios con amigos, las notificaciones y el detalle de cada salón. | Teammates built, also end to end, settings, favorites, history, personal schedules, schedule matching with friends, in-app notifications and the room detail view. |
| `decisions[0].options` | Una pantalla de inicio con muchas funciones o solo con lo esencial, y un diseño cargado o sobrio. | A home screen with many features or only the essentials, and a busy or a restrained design. |
| `decisions[0].choice` | Un inicio sencillo y un diseño sobrio. | A simple home screen and a restrained design. |
| `decisions[0].reason` | Reducir la fricción, que la app se entendiera sin explicaciones y no abrumar a quien la usa. | To reduce friction, make the app understandable without explanations and avoid overwhelming its users. |
| `decisions[1].options` | Mostrar siempre a los amigos o no. | Always showing friends or not. |
| `decisions[1].choice` | Que cada persona decida su visibilidad frente a sus amigos. | Letting each person decide how visible they are to their friends. |
| `decisions[1].reason` | La privacidad la controla el usuario, no la app. | Privacy stays in the user’s hands, not the app’s. |
| `changes[0]` | La parte social no estaba en el plan inicial. Con el feedback vimos que era imprescindible, porque el círculo social es inseparable de cómo se aprovechan los espacios, y pivotamos para incorporarla. | The social side was not in the original plan. Feedback showed it was essential, because people’s social circle is inseparable from how they use spaces, so the team pivoted to include it. |
| `outcome[0]` | **Mejor proyecto de su sección** en Construcción de Aplicaciones Móviles. | **Best Project in its section** in Mobile Application Development. |
| `outcome[1]` | Aprendí a trabajar con un backend unificado e independiente de dos frontends distintos, algo que no había hecho antes. | Learned, for the first time, to build one unified backend that serves two different frontends. |
| `learned[0]` | Incorporaría mucho antes la parte de amigos y horarios, porque era la que más valor aportaba. | Would bring the friends and schedules features in much earlier, since they added the most value. |

#### 4.6.3 `dental-site`

| Campo | Español | Inglés |
| --- | --- | --- |
| `title` | Web de un consultorio odontológico | Dental practice website |
| `description` | Caso de estudio de la web de un consultorio odontológico: del problema a un sitio en producción que atrae pacientes nuevos cada mes. | Case study of a dental practice website: from the problem to a live site that brings in new patients every month. |
| `problem[0]` | El consultorio no tenía presencia en línea. | The practice had no online presence. |
| `problem[1]` | Eso significaba perder a los pacientes que buscan por canales digitales, un mercado nuevo para el consultorio. | That meant losing the patients who search through digital channels, a new market for the practice. |
| `team` | Trabajo individual, para un cliente real. | Individual work for a real client. |
| `contributions[0]` | Identifiqué el problema y conversé con la doctora para entender lo que necesitaba. | Identified the problem and talked with the dentist to understand what she needed. |
| `contributions[1]` | Especifiqué los requisitos, diseñé, implementé y desplegué el sitio, y lo sigo manteniendo. | Specified the requirements, designed, built and deployed the site, and still maintain it. |
| `decisions[0].options` | Escribir con el vocabulario de la doctora o con uno pensado para el paciente. | Writing with the dentist’s vocabulary or with one meant for patients. |
| `decisions[0].choice` | Reescribir los textos con un lenguaje cercano al paciente. | Rewriting the copy in plain, patient-friendly language. |
| `decisions[0].reason` | El vocabulario técnico de la doctora hacía difícil conectar con quien llega como paciente. La decisión ha dado buenos resultados. | Her technical vocabulary made it hard to connect with people arriving as patients. The decision has paid off. |
| `changes[0]` | Al principio no había previsto la versión móvil. Luego fue evidente que la mayoría de pacientes llegaría desde el teléfono y no desde el escritorio, y la incorporé. | The mobile version was not planned at first. It then became clear that most patients would arrive from their phones rather than from a desktop, so it was added. |
| `outcome[0]` | Ha contribuido a atraer **unos 2–3 pacientes nuevos al mes**. | It has helped bring in **about 2–3 new patients a month**. |
| `outcome[1]` | Sigue en producción, con mantenimiento continuo. | Still live, with ongoing maintenance. |
| `learned[0]` | Iteraría más rápido sobre los textos finales, contrastándolos antes con la doctora para su aprobación. | Would iterate faster on the final copy, checking it with the dentist earlier for approval. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SSD-AC01 | Los hechos contienen los once proyectos de §4.2 en ese orden, con los valores de `featured`, `stack`, `teamSize` y `repository` de la tabla, y los doce enlaces de la segunda tabla con sus URLs exactas. | Prueba unitaria |
| SSD-AC02 | Cada proyecto tiene `properName` en los hechos o `name` en ambos idiomas, pero no ambos; los cuatro proyectos con `properName` son `andespace`, `habicapital`, `ahorrapp` y `dogspa`. | Prueba unitaria |
| SSD-AC03 | En ambos idiomas, el número de `highlights` por proyecto es 2, 2, 3, 2, 1, 1, 1, 1, 2, 1 y 2, en el orden de `PROJECT_IDS`; tienen `award` exactamente `andespace`, `ahorrapp`, `dogspa` y `algorithms`; y solo `thesis` tiene `note`. | Prueba unitaria |
| SSD-AC04 | El componente renderiza dos `<h3>` y once `<article>`, cuatro bajo el primero y siete bajo el segundo, con `id` igual a `projects-` más el `id` del proyecto cuando `idScope` está vacío. | Prueba de componente |
| SSD-AC05 | El proyecto `andespace` muestra "Equipo de 6" o "Team of 6"; `habicapital`, "Trabajo individual" o "Individual work"; y los cuatro proyectos con repositorio privado (`dental-site`, `monitoring-platform`, `dogspa` y `algorithms`) muestran "Repositorio privado" o "Private repository" y ningún enlace a un repositorio. | Prueba de componente |
| SSD-AC06 | Hay doce enlaces externos en total, todos con `target="_blank"` y `rel="noopener noreferrer"`, y los dos enlaces "Backend" tienen nombres accesibles distintos. | Prueba de componente |
| SSD-AC07 | `bootLines` es exactamente la tabla de §4.5. | Prueba unitaria |
| SSD-AC08 | En `desktop`, abrir la zona del SSD en `/es/` muestra el panel "Proyectos" con "Destacados", "HabiCapital" y "Simulación de banca digital segura"; en `/en/`, "Projects", "Featured" y "Secure digital banking simulation". | Prueba E2E |
| SSD-AC09 | El contenido de la sección no contiene el nombre de ninguna persona distinta del autor (VSN-R17). | Revisión manual del autor, registrada en el historial de esta spec |
| SSD-AC10 | El autor revisa ambos idiomas y comprueba que cada enlace abre el repositorio o el sitio correcto (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |
| SSD-AC11 | `cases` tiene en ambos idiomas un texto por cada `CaseStudyId` con los valores de §4.6; `thesis` y `andespace` tienen `teamContributions` y `dental-site` no (SSD-R12); y `findContentIssues` no encuentra incumplimientos de C13 ni de C14 en ellos. | Prueba unitaria |
| SSD-AC12 | Las tarjetas de `thesis`, `andespace` y `dental-site` muestran el enlace "Leer el caso completo" (o "Read the full case study") hacia `/es/projects/thesis/`, `/es/projects/andespace/` y `/es/projects/dental-site/` (o sus equivalentes en inglés), sin `target`; ninguna otra tarjeta lo muestra. | Prueba de componente |
| SSD-AC13 | La sección renderiza exactamente tres `<strong>`, en las tarjetas de `thesis`, `dental-site` y `habicapital`, con los fragmentos en negrita de §4.3. | Prueba de componente |
| SSD-AC14 | El autor lee los tres casos en ambos idiomas, en su página, y confirma que son fieles a lo que contó y que no nombran a terceros (I18N-AC18, VSN-AC09). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Cuatro destacados y el resto compactos** (F-06, D-14). | Los destacados son los que mejor muestran profundidad: investigación, trabajo en equipo premiado, un proyecto individual con seguridad aplicada y un sitio real en producción. El resto aporta amplitud sin alargar la lectura. |
| **La web odontológica como proyecto destacado.** | Es el único trabajo con un cliente real y un resultado medible, y tiene sitio en vivo aunque el repositorio sea privado. |
| **Tamaño de equipo en cada proyecto, sin nombres** (F-04, F-05). | Distingue con honestidad lo individual de lo colectivo (principio P6) sin publicar datos de terceros. |
| **Los premios junto a su proyecto** (D-14). | Un premio se entiende con el proyecto que lo ganó. Perfil solo los resume y enlaza aquí. |
| **Repositorios privados con etiqueta y sin enlace** (VSN-R19). | Evita enlaces rotos y deja claro que el código existe aunque no sea público. |
| **Nombre propio en los hechos o nombre descriptivo en los textos** (SSD-R02). | "AndeSpace" no se traduce y se escribe una vez; "Dental practice website" sí se traduce. Es la regla de TSC-R35 aplicada a cada proyecto. |
| **Un ancla por proyecto** (SSD-R06). | Permite enlazar un proyecto concreto desde Experiencia y desde un mensaje a un reclutador. |
| **Los dos proyectos de algoritmos en una sola entrada** (F-10). | Son trabajos de curso con repositorio privado; juntos ocupan lo que merecen. |
| **Casos de estudio solo para tres destacados** (D-82). | Los procesos de selección piden dos o tres proyectos con detalle. La tesis muestra investigación, AndeSpace trabajo en equipo premiado y la web odontológica un cliente real con resultado medible; HabiCapital ya está documentado a fondo en su propio repositorio. |
| **El caso vive en los textos de Proyectos** (SSD-R11, D-88). | Es contenido del perfil, y los datos que comparte con la tarjeta (equipo, tecnologías, enlaces) se escriben una sola vez, en los hechos del proyecto. La página solo lo compone. |
| **Los proyectos de Machine Learning, como compactos** (D-87). | Son trabajos de curso en un área que el autor considera secundaria: aportan amplitud sin competir con los destacados. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 2.0 | Por decisión del autor al revisar M11 (D-91): la web odontológica pasa al tercer lugar y HabiCapital al cuarto, para que los tres destacados con caso de estudio vayan seguidos. Cambian `PROJECT_IDS`, el orden de las dos tablas de §4.2 y de §4.3.3 y §4.3.4, SSD-AC03 y SSD-AC13. SSD-AC10 y SSD-AC14: el autor leyó en el sitio el contenido nuevo de M10 y los tres casos en ambos idiomas, y los aprobó (A11 y A12), el 2026-10-14. |
| 2026-10-14 | 1.1 | Estado: pasa a "Implementada" al cerrar M11 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. La lectura de los tres casos en su página queda para A12 (SSD-AC14). Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Durante M10: los textos en inglés usan el apóstrofo tipográfico (’), como exige I18N-R41. Sin cambio de contenido. |
| 2026-10-14 | 1.1 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.1 | Versión 2, pendiente de aprobación del autor (D-82, D-85, D-87, D-88; F-23, F-25 a F-28). Dos proyectos compactos nuevos de Machine Learning, `respiratory-etl` y `sdg-text-classifier`; `email-blacklist` pasa a público con su enlace. Los `highlights` son `RichLine` y destacan tres resultados. Nuevo `caseLinkLabel` y enlace de la tarjeta al caso (SSD-R07). Nuevo §4.6 con el contenido de los tres casos de estudio, redactado a partir de las respuestas del autor; lo revisa él antes de aprobar. Líneas de arranque: 11 proyectos. Criterios SSD-AC01 y SSD-AC03 a SSD-AC07 actualizados; nuevos SSD-AC11 a SSD-AC14. |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). SSD-AC09 y SSD-AC10: el autor revisó el contenido en ambos idiomas, en la vista simple y en el panel (A4), y lo dio por bueno el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-04 a F-07 y F-10 a F-12. |
