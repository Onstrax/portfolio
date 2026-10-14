# RAM — Sección Stack tecnológico

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.1 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre la memoria RAM: las tecnologías, herramientas y metodologías con las que trabaja Juan Esteban, agrupadas por área.

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección en ambos idiomas, su presentación y su línea de arranque.

**No incluye:** niveles de dominio por tecnología (ver §6) ni en qué proyecto se usó cada una, que se ve en Proyectos (ver SSD).

Feature: `src/features/ram-stack/`. Exporta `ramStackSection`. Fuente: sección de habilidades técnicas de los CVs actualizados.

## 3. Definiciones

No aplica.

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| RAM-R01 | `src/features/ram-stack/types.ts` declara los tipos siguientes. |

```ts
export const STACK_GROUP_IDS = [
  "languages",
  "frontend",
  "backend",
  "gcp",
  "aws",
  "devops",
  "data",
  "security",
] as const;
export type StackGroupId = (typeof STACK_GROUP_IDS)[number];

export interface StackGroupFact {
  readonly id: StackGroupId;
  /** Nombres de tecnologías: no se traducen. */
  readonly items: readonly string[];
}

export interface StackFacts {
  readonly groups: readonly StackGroupFact[];
}

export interface StackText extends SectionTextBase {
  readonly groups: Readonly<Record<StackGroupId, { readonly title: string; readonly note?: string }>>;
  readonly methodsTitle: string;
  /** Metodologías y fundamentos: sí se traducen. */
  readonly methods: readonly string[];
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| RAM-R02 | `content/facts.ts` contiene los ocho grupos de la tabla siguiente, en ese orden y con sus elementos en el orden indicado. |

| `id` | `items` |
| --- | --- |
| `languages` | `Python`, `Java`, `TypeScript`, `SQL`, `Dart` |
| `frontend` | `Next.js`, `React`, `Angular`, `Flutter`, `Tailwind CSS`, `Swing` |
| `backend` | `FastAPI`, `Spring`, `Django`, `Flask` |
| `gcp` | `Cloud Run`, `Compute Engine`, `Cloud SQL`, `Cloud Storage`, `IAM`, `Artifact Registry`, `BigQuery` |
| `aws` | `EC2`, `ECS/Fargate`, `Elastic Beanstalk`, `S3`, `RDS/Aurora`, `ELB`, `Secrets Manager`, `CloudWatch`, `CodeBuild`, `CodePipeline` |
| `devops` | `Git`, `GitHub Actions`, `CI/CD`, `Docker`, `Docker Compose`, `Linux`, `Nginx`, `Jenkins`, `SonarQube`, `SSH` |
| `data` | `PostgreSQL`, `MySQL`, `MongoDB`, `pandas`, `scikit-learn`, `Keras` |
| `security` | `AES`, `RSA`, `TLS`, `JWT`, `Argon2id`, `HMAC`, `ZKP/LWE`, `Kyber`, `ECDSA` |

En total, 57 elementos. `pandas` y `scikit-learn` proceden de los proyectos públicos de Machine Learning (F-23).

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| RAM-R03 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de la tabla siguiente. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Stack tecnológico | Tech stack |
| `meta.hardwareName` | Memoria RAM | RAM |
| `meta.description` | Stack tecnológico de Juan Esteban Álvarez García: lenguajes, frontend, backend, cloud en GCP y AWS, DevOps, datos, seguridad y metodologías. | Tech stack of Juan Esteban Álvarez García: languages, frontend, backend, cloud on GCP and AWS, DevOps, data, security and engineering methods. |
| `groups.languages.title` | Lenguajes | Languages |
| `groups.frontend.title` | Frontend y móvil | Frontend and mobile |
| `groups.backend.title` | Backend y APIs | Backend and APIs |
| `groups.backend.note` | Diseño e integración de APIs REST. | REST API design and integration. |
| `groups.gcp.title` | Cloud: Google Cloud | Cloud: Google Cloud |
| `groups.aws.title` | Cloud: AWS | Cloud: AWS |
| `groups.devops.title` | DevOps y herramientas | DevOps and tooling |
| `groups.data.title` | Datos e inteligencia artificial | Data and AI |
| `groups.data.note` | Opción académica en Machine Learning. Además de los dos proyectos públicos de Proyectos, he construido un MLP que clasifica rayos gamma y hadrones, una CNN que diagnostica enfermedades de la yuca a partir de fotos y ejercicios de regresión lineal y K-Means, en repositorios privados. | Machine Learning minor. Besides the two public projects in Projects, built an MLP that classifies gamma rays and hadrons, a CNN that diagnoses cassava diseases from photos, and linear regression and K-Means exercises, in private repositories. |
| `groups.security.title` | Seguridad y criptografía | Security and cryptography |
| `methodsTitle` | Ingeniería y metodologías | Engineering and methods |
| `methods[0]` | Arquitectura de software | Software architecture |
| `methods[1]` | Estructuras de datos | Data structures |
| `methods[2]` | Análisis Big O | Big O analysis |
| `methods[3]` | Optimización de algoritmos | Algorithm optimization |
| `methods[4]` | Pruebas automatizadas | Automated testing |
| `methods[5]` | Agile/Scrum | Agile/Scrum |
| `methods[6]` | Design Thinking | Design Thinking |
| `methods[7]` | Modelado ER | ER modeling |
| `methods[8]` | Redes: TCP/IP, UDP y DNS | Networking: TCP/IP, UDP and DNS |

Solo los grupos `backend` y `data` tienen `note`.

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| RAM-R04 | El componente raíz, `StackSection`, renderiza nueve bloques con encabezado `<h3>`: uno por cada grupo de `facts.groups`, en su orden y con su `title`, y al final el de metodologías, con `methodsTitle`. Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| RAM-R05 | Cada grupo muestra sus `items` como una lista (`<ul>`) de chips neutros en el orden de los hechos y, debajo, su `note` si existe. El bloque de metodologías muestra `methods` del mismo modo. |
| RAM-R06 | Los bloques se disponen en dos columnas cuando el contenedor mide 640 px o más de ancho, y en una cuando mide menos. El orden de lectura y de foco es siempre el de RAM-R04. |
| RAM-R07 | No se muestran barras, porcentajes, estrellas ni ningún otro indicador de nivel. |
| RAM-R08 | Cada encabezado va precedido del icono de su grupo: `code` (lenguajes), `layout` (frontend), `server` (backend), `cloud` (GCP y AWS), `git-branch` (DevOps), `database` (datos), `shield` (seguridad) y `compass` (metodologías). |

Iconos propios de esta sección: `code`, `layout`, `server`, `cloud`, `git-branch`, `database`, `shield` y `compass`.

### 4.5 Línea de arranque

| ID | Requisito |
| --- | --- |
| RAM-R09 | `bootLines` contiene una línea, construida con el número de grupos de `facts.groups` y la suma de sus elementos. |

| `message` | `status` |
| --- | --- |
| `Memory: 8 banks, 57 modules online` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| RAM-AC01 | Los hechos contienen los ocho grupos de §4.2 en ese orden, con 5, 6, 4, 7, 10, 10, 6 y 9 elementos, y sus elementos son exactamente los de la tabla. | Prueba unitaria |
| RAM-AC02 | Ningún elemento se repite dentro de un grupo ni entre grupos. | Prueba unitaria |
| RAM-AC03 | Cada idioma tiene un `title` por grupo, `note` solo en `backend` y `data`, y nueve `methods`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| RAM-AC04 | El componente renderiza nueve `<h3>` en el orden de RAM-R04, cada uno seguido de una lista con tantos elementos como indica RAM-AC01, y nueve en la de metodologías. | Prueba de componente |
| RAM-AC05 | El componente no renderiza ningún elemento `<progress>` ni `<meter>`, ni ningún atributo `aria-valuenow`. | Prueba de componente |
| RAM-AC06 | `bootLines` es exactamente la tabla de §4.5. | Prueba unitaria |
| RAM-AC07 | En `desktop`, abrir la zona de la memoria RAM en `/es/` muestra el panel "Stack tecnológico" con "Lenguajes", "Python" y "Seguridad y criptografía"; en `/en/`, "Tech stack" con "Languages" y "Security and cryptography". | Prueba E2E |
| RAM-AC08 | El autor revisa ambos idiomas y confirma que la lista corresponde a lo que usa hoy (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Sin indicadores de nivel** (RAM-R07). | Un "80 % en Python" no significa nada y nadie puede verificarlo (principio P6). Lo que demuestra el dominio son los proyectos, y por eso cada proyecto muestra su stack. |
| **Tecnologías como hechos y metodologías como textos** (RAM-R01). | "FastAPI" se escribe igual en ambos idiomas y se escribe una vez. "Pruebas automatizadas" se traduce. Es la regla de TSC-R35. |
| **GCP y AWS en grupos separados.** | El CV los lista juntos en una línea larga. Separados se ve de un vistazo que hay experiencia con los dos proveedores. |
| **"Machine Learning" y "APIs REST" como notas, no como chips.** | No son herramientas concretas sino áreas; como chip junto a "Keras" o "FastAPI" mezclarían niveles distintos. |
| **Chips en listas con encabezado.** | Un lector de pantalla anuncia "lista de 5 elementos" bajo "Lenguajes", que es justo la estructura que ve quien mira la pantalla. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 1.1 | Estado: pasa a "Implementada" al cerrar M10 (PLAN §4.6), con todos sus criterios automáticos citados por una prueba. La lectura del contenido nuevo en el sitio queda para A11. Sin cambio de requisitos. |
| 2026-10-14 | 1.1 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.1 | Versión 2, pendiente de aprobación del autor (D-87, F-22 a F-24). Grupo `data`: añade `pandas` y `scikit-learn` (57 elementos, RAM-AC01 y línea de arranque actualizados). `groups.data.note`: la opción académica en Machine Learning y los proyectos privados de ese ámbito. |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). RAM-AC08: el autor revisó ambos idiomas y la lista, en la vista simple y en el panel (A4), el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
