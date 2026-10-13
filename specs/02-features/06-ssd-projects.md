# SSD — Sección Proyectos

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.0 |
| Última actualización | 2026-10-12 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre el SSD: los nueve proyectos de Juan Esteban, cuatro destacados y cinco en formato compacto, con su stack, el tamaño del equipo, los reconocimientos y los enlaces a los repositorios públicos.

## 2. Alcance

**Incluye:** tipos, hechos y textos de los proyectos en ambos idiomas, su presentación, sus anclas y sus líneas de arranque.

**No incluye:** capturas ni demos de los proyectos (no existen; VSN §7), ni la automatización hotelera, que no tiene entidad de proyecto y se describe en Experiencia (ver PSU).

Feature: `src/features/ssd-projects/`. Exporta `ssdProjectsSection`. Fuentes: CVs actualizados, el repositorio de la web odontológica y hechos F-04 a F-07 y F-10 a F-12 del README.

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
  "habicapital",
  "dental-site",
  "monitoring-platform",
  "email-blacklist",
  "ahorrapp",
  "dogspa",
  "algorithms",
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
  readonly highlights: readonly string[];
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
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| SSD-R03 | `content/facts.ts` contiene los nueve proyectos de la tabla siguiente, en ese orden, y los enlaces de la segunda tabla (F-12). |

| `id` | `featured` | `properName` | `stack` | `teamSize` | `repository` |
| --- | --- | --- | --- | --- | --- |
| `thesis` | Sí | — | `Python`, `SageMath`, `LaTeX` | 2 | `public` |
| `andespace` | Sí | `AndeSpace` | `Flutter`, `FastAPI`, `PostgreSQL`, `GitHub Actions` | 6 | `public` |
| `habicapital` | Sí | `HabiCapital` | `Python`, `FastAPI`, `Next.js`, `PostgreSQL`, `Docker` | 1 | `public` |
| `dental-site` | Sí | — | `Next.js`, `TypeScript`, `Tailwind CSS`, `Leaflet`, `Netlify` | 1 | `private` |
| `monitoring-platform` | No | — | `GCP`, `GitHub Actions`, `CI/CD` | 4 | `private` |
| `email-blacklist` | No | — | `AWS`, `GitHub Actions`, `CI/CD` | 4 | `private` |
| `ahorrapp` | No | `AhorrApp` | `Angular` | 3 | `public` |
| `dogspa` | No | `DogSPA` | `Angular`, `Spring`, `MySQL` | 5 | `private` |
| `algorithms` | No | — | `Java`, `Python` | 2 | `private` |

| Proyecto | `id` del enlace | `href` |
| --- | --- | --- |
| `thesis` | `repository` | `https://github.com/CesarAAC/Tesis-ZPK-LWE-Autentication` |
| `andespace` | `flutter` | `https://github.com/G33-Moviles-2026-1/G33-Flutter-Moviles-2026-1` |
| `andespace` | `backend` | `https://github.com/G33-Moviles-2026-1/G33-Backend-Moviles-2026-1` |
| `andespace` | `wiki` | `https://github.com/G33-Moviles-2026-1/Wiki` |
| `habicapital` | `code` | `https://github.com/Onstrax/HabiCapital` |
| `dental-site` | `live-site` | `https://martha-landing.netlify.app/` |
| `ahorrapp` | `frontend` | `https://github.com/Onstrax/AhorrApp` |
| `ahorrapp` | `backend` | `https://github.com/Onstrax/AhorrApp-Backend` |
| `ahorrapp` | `landing` | `https://github.com/Onstrax/Ahorrapp-Landing` |

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

#### 4.3.1 `thesis`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Tesis: autenticación poscuántica de conocimiento cero | Thesis: post-quantum zero-knowledge authentication |
| `tagline` | Investigación en desarrollo | Ongoing research |
| `highlights[0]` | Codiseño de un protocolo de autenticación Zero-Knowledge resistente a ataques cuánticos, basado en Learning with Errors (LWE); lidero el componente matemático LWE. | Co-designing a quantum-resistant Zero-Knowledge authentication protocol based on Learning with Errors (LWE); leading the LWE mathematical component. |
| `highlights[1]` | Marco teórico completado; en desarrollo, benchmarks de tiempo, memoria, tráfico de red y estimación de seguridad en bits. | Theoretical framework completed; developing benchmarks for runtime, memory, network traffic and estimated security strength in bits. |
| `note` | Asesorada en la Universidad de los Andes. | Advised at Universidad de los Andes. |

#### 4.3.2 `andespace`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Reservas de espacios universitarios | University space booking app |
| `highlights[0]` | Implementé de extremo a extremo los módulos de búsqueda, inicio, reservas y perfil/amigos, integrando interfaz móvil, API y datos. | Owned the search, home, booking and profile/friends features end to end, integrating mobile UI, API and data layer. |
| `highlights[1]` | Calidad de código apoyada en SonarQube. | Used SonarQube for code quality checks. |
| `award` | Mejor proyecto de su sección · Construcción de Aplicaciones Móviles | Best Project in its section · Mobile Application Development |

#### 4.3.3 `habicapital`

| Campo | Español | Inglés |
| --- | --- | --- |
| `tagline` | Simulación de banca digital segura | Secure digital banking simulation |
| `highlights[0]` | Diseñé y construí individualmente una plataforma P2P con seguridad aplicada: JWT, Argon2id, AES-256-GCM, HMAC, ledger inmutable e idempotencia. | Individually designed and built a P2P platform with applied security: JWT, Argon2id, AES-256-GCM, HMAC, immutable ledger and idempotency. |
| `highlights[1]` | Desarrollo asistido por IA con especificaciones (SDD) y TDD; más de 100 pruebas automatizadas exitosas y ~94 % de cobertura reportada. | AI-assisted specification-driven development (SDD) and TDD; over 100 passing automated tests and ~94% reported code coverage. |

#### 4.3.4 `dental-site`

| Campo | Español | Inglés |
| --- | --- | --- |
| `name` | Web para un consultorio odontológico | Dental practice website |
| `tagline` | Sitio en producción para un cliente real | Production site for a real client |
| `highlights[0]` | Diseñé, desarrollé y publiqué el sitio completo: tratamientos, profesionales, preguntas frecuentes, mapa de sedes y páginas legales. | Designed, built and deployed the whole site: treatments, team, FAQ, clinic map and legal pages. |
| `highlights[1]` | Llamada a la acción por WhatsApp y formulario de contacto; ha contribuido a atraer ~2-3 nuevos clientes al mes. | WhatsApp call to action and contact form; it has helped attract an estimated 2-3 new clients per month. |
| `highlights[2]` | Mantenimiento continuo desde su publicación. | Ongoing maintenance since launch. |

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

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| SSD-R05 | El componente raíz, `ProjectsSection`, renderiza dos bloques con encabezado `<h3>`: `featuredTitle` (icono `star`), con los proyectos destacados, y `moreTitle` (icono `folder`), con los compactos, cada grupo en el orden de `facts.projects`. Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| SSD-R06 | Cada proyecto es un `<article>` cuyo `id` es `idScope` seguido de `projects-` y de su `id` (TSC-R32). Ese identificador local es su fragmento de URL (SYS-R11). |
| SSD-R07 | Un proyecto muestra, en este orden: su nombre como `<h4>`; `tagline`; `award`, si existe, como chip de reconocimiento con el icono `award`; `formatTeamSize(teamSize, locale)` como chip neutro con el icono `users`; `common.privateRepositoryLabel` como chip con el icono `lock` si `repository` es `"private"`; los elementos de `stack` como chips neutros; `highlights` como lista; `note`, si existe; y sus enlaces, con el texto de `linkLabels` y aspecto de enlace externo (VIS §4.6, SYS-R40). |
| SSD-R08 | Los proyectos destacados se muestran en una columna, separados por una línea de 1 px. Los compactos se muestran en una cuadrícula de dos columnas cuando el contenedor mide 640 px o más de ancho, y en una columna cuando mide menos. La diferencia entre unos y otros es solo de disposición: ambos muestran todos los campos de SSD-R07. |
| SSD-R09 | Los enlaces de un proyecto llevan un nombre accesible que incluye el nombre del proyecto, de modo que dos enlaces "Backend" de proyectos distintos se distingan: el texto visible es el de `linkLabels` y el nombre del proyecto se añade como texto solo para lectores de pantalla. |

Iconos propios de esta sección: `star` y `folder`.

### 4.5 Líneas de arranque

| ID | Requisito |
| --- | --- |
| SSD-R10 | `bootLines` contiene las dos líneas siguientes. La primera se construye con el número de proyectos y el de destacados. La segunda, con el `name` en inglés del primer proyecto destacado, con su inicial en minúscula. |

| `message` | `status` |
| --- | --- |
| `nvme0n1: 9 projects mounted, 4 featured` | `ok` |
| `Loading thesis: post-quantum zero-knowledge authentication` | `none` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SSD-AC01 | Los hechos contienen los nueve proyectos de §4.2 en ese orden, con los valores de `featured`, `stack`, `teamSize` y `repository` de la tabla, y los nueve enlaces de la segunda tabla con sus URLs exactas. | Prueba unitaria |
| SSD-AC02 | Cada proyecto tiene `properName` en los hechos o `name` en ambos idiomas, pero no ambos; los cuatro proyectos con `properName` son `andespace`, `habicapital`, `ahorrapp` y `dogspa`. | Prueba unitaria |
| SSD-AC03 | En ambos idiomas, el número de `highlights` por proyecto es 2, 2, 2, 3, 1, 1, 1, 1 y 2, en el orden de `PROJECT_IDS`; tienen `award` exactamente `andespace`, `ahorrapp`, `dogspa` y `algorithms`; y solo `thesis` tiene `note`. | Prueba unitaria |
| SSD-AC04 | El componente renderiza dos `<h3>` y nueve `<article>`, cuatro bajo el primero y cinco bajo el segundo, con `id` igual a `projects-` más el `id` del proyecto cuando `idScope` está vacío. | Prueba de componente |
| SSD-AC05 | El proyecto `andespace` muestra "Equipo de 6" o "Team of 6"; `habicapital`, "Trabajo individual" o "Individual work"; y los cinco proyectos con repositorio privado muestran "Repositorio privado" o "Private repository" y ningún enlace a un repositorio. | Prueba de componente |
| SSD-AC06 | Hay nueve enlaces externos en total, todos con `target="_blank"` y `rel="noopener noreferrer"`, y los dos enlaces "Backend" tienen nombres accesibles distintos. | Prueba de componente |
| SSD-AC07 | `bootLines` es exactamente la tabla de §4.5. | Prueba unitaria |
| SSD-AC08 | En `desktop`, abrir la zona del SSD en `/es/` muestra el panel "Proyectos" con "Destacados", "HabiCapital" y "Simulación de banca digital segura"; en `/en/`, "Projects", "Featured" y "Secure digital banking simulation". | Prueba E2E |
| SSD-AC09 | El contenido de la sección no contiene el nombre de ninguna persona distinta del autor (VSN-R17). | Revisión manual del autor, registrada en el historial de esta spec |
| SSD-AC10 | El autor revisa ambos idiomas y comprueba que cada enlace abre el repositorio o el sitio correcto (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Cuatro destacados y cinco compactos** (F-06, D-14). | Los destacados son los que mejor muestran profundidad: investigación, trabajo en equipo premiado, un proyecto individual con seguridad aplicada y un sitio real en producción. El resto aporta amplitud sin alargar la lectura. |
| **La web odontológica como proyecto destacado.** | Es el único trabajo con un cliente real y un resultado medible, y tiene sitio en vivo aunque el repositorio sea privado. |
| **Tamaño de equipo en cada proyecto, sin nombres** (F-04, F-05). | Distingue con honestidad lo individual de lo colectivo (principio P6) sin publicar datos de terceros. |
| **Los premios junto a su proyecto** (D-14). | Un premio se entiende con el proyecto que lo ganó. Perfil solo los resume y enlaza aquí. |
| **Repositorios privados con etiqueta y sin enlace** (VSN-R19). | Evita enlaces rotos y deja claro que el código existe aunque no sea público. |
| **Nombre propio en los hechos o nombre descriptivo en los textos** (SSD-R02). | "AndeSpace" no se traduce y se escribe una vez; "Dental practice website" sí se traduce. Es la regla de TSC-R35 aplicada a cada proyecto. |
| **Un ancla por proyecto** (SSD-R06). | Permite enlazar un proyecto concreto desde Experiencia y desde un mensaje a un reclutador. |
| **Los dos proyectos de algoritmos en una sola entrada** (F-10). | Son trabajos de curso con repositorio privado; juntos ocupan lo que merecen. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-04 a F-07 y F-10 a F-12. |
