# TSC — Contratos TypeScript

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 3.0 |
| Última actualización | 2026-10-16 |
| Depende de | VSN, SYS, STR |

## 1. Propósito

Definir los tipos que comparte todo el código y las reglas con las que se escribe TypeScript en el proyecto. El objetivo es que los errores de contenido y de integración (un idioma sin traducir, un slug mal escrito, un enlace inseguro, una sección sin registrar) se detecten al compilar o en una prueba, nunca en producción.

Los bloques de código de esta spec son **normativos**: el archivo indicado DEBE contener esas declaraciones con esos nombres y tipos. Se compilaron y analizaron el 2026-10-12 con la configuración de §4.1 y §4.2.

## 2. Alcance

**Incluye:** configuración del compilador, reglas de tipado, identificadores canónicos, primitivas de contenido, contrato de las secciones, modelo de hechos y textos, registro de secciones, comprobaciones de integridad del contenido, forma del estado persistido y de los stores, ayudantes de rutas y tipos de los assets.

**No incluye:** los tipos del contenido de cada sección (los define la spec de cada sección), los datos de las zonas interactivas (ver SCN), el diccionario de interfaz y los formateadores (ver I18N), ni la configuración de las herramientas de prueba (ver TST).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Hecho** (fact) | Dato de contenido que no depende del idioma: identificador, fecha, URL, nombre propio, cifra, bandera. |
| **Texto** (text) | Cadena de contenido que sí depende del idioma: título, descripción, viñeta, etiqueta. |
| **Contrato** | Tipo o constante de `src/shared/contracts/` que usan dos o más partes del código. |
| **Guarda de tipo** | Función que comprueba en runtime que un valor desconocido pertenece a un tipo (`value is T`). |
| **Identificador local** | Valor que, precedido de `idScope`, forma un atributo `id` del HTML de una sección. |

## 4. Requisitos

### 4.1 Configuración del compilador

| ID | Requisito |
| --- | --- |
| TSC-R01 | `tsconfig.json` DEBE establecer en `compilerOptions` exactamente las opciones de la tabla siguiente. NO DEBE existir ningún otro archivo `tsconfig` que relaje estas opciones. |
| TSC-R02 | `include` DEBE ser `["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts", ".next/dev/types/**/*.ts"]` y `exclude` DEBE ser `["node_modules", "out"]`, de modo que `pnpm typecheck` cubra `src/`, `e2e/`, `tests/` y los archivos de configuración `.ts`. |
| TSC-R03 | `pnpm typecheck` DEBE terminar sin errores. NO DEBE usarse `// @ts-nocheck` en ningún archivo. |

| Opción | Valor | Opción | Valor |
| --- | --- | --- | --- |
| `target` | `ES2022` | `strict` | `true` |
| `lib` | `["dom", "dom.iterable", "ES2022"]` | `noUncheckedIndexedAccess` | `true` |
| `module` | `esnext` | `noImplicitOverride` | `true` |
| `moduleResolution` | `bundler` | `noImplicitReturns` | `true` |
| `jsx` | `react-jsx` | `noFallthroughCasesInSwitch` | `true` |
| `allowJs` | `false` | `noPropertyAccessFromIndexSignature` | `true` |
| `noEmit` | `true` | `noUnusedLocals` | `true` |
| `incremental` | `true` | `noUnusedParameters` | `true` |
| `isolatedModules` | `true` | `allowUnreachableCode` | `false` |
| `verbatimModuleSyntax` | `true` | `allowUnusedLabels` | `false` |
| `resolveJsonModule` | `true` | `forceConsistentCasingInFileNames` | `true` |
| `esModuleInterop` | `true` | `skipLibCheck` | `true` |
| `plugins` | `[{ "name": "next" }]` | `paths` | `{ "@/*": ["./src/*"] }` |

### 4.2 Reglas de tipado

| ID | Requisito |
| --- | --- |
| TSC-R04 | ESLint DEBE aplicar a todo archivo `.ts` y `.tsx` los conjuntos `strictTypeChecked` y `stylisticTypeChecked` de `typescript-eslint`, con información de tipos (`projectService`), además de las reglas de la tabla siguiente. Todas con severidad de error. |
| TSC-R05 | NO DEBE usarse `any`, ni explícito ni implícito. Todo valor que entra desde fuera del sistema de tipos (`JSON.parse`, almacenamiento, parámetros de ruta, `navigator`) se declara `unknown` y se estrecha con una guarda de tipo. |
| TSC-R06 | NO DEBE usarse el operador de aserción no nula (`!`). |
| TSC-R07 | NO DEBEN usarse aserciones de tipo con `as`, salvo `as const`. Las únicas excepciones son el archivo `src/shared/lib/typed-object.ts` (que encapsula `typedKeys` y `typedEntries`) y los archivos de prueba (`*.test.ts`, `*.test.tsx`, `e2e/`, `tests/`). |
| TSC-R08 | NO DEBEN usarse `enum` ni `namespace`. Un conjunto cerrado de valores se declara como un array `as const` y su tipo se deriva de él, de modo que la lista en runtime y el tipo sean la misma definición. |
| TSC-R09 | Las formas de objeto se declaran con `interface`; `type` se reserva para uniones, tipos derivados y plantillas de cadena. Toda propiedad de un contrato o de un tipo de contenido es `readonly`, y todo array es `readonly T[]`. |
| TSC-R10 | Todo `switch` sobre una unión DEBE ser exhaustivo sin rama `default`, de modo que añadir un miembro a la unión produzca un error en cada `switch` que no lo trate. |
| TSC-R11 | Los tipos se importan con `import type` o con el modificador `type` en línea. |
| TSC-R12 | Toda función exportada desde un archivo `.ts` declara su tipo de retorno. Los componentes de React (archivos `.tsx`) quedan exentos. |
| TSC-R13 | NO DEBE usarse `@ts-ignore`. `@ts-expect-error` solo PUEDE usarse en pruebas de tipos, seguido de una descripción de lo que se espera que falle. |
| TSC-R14 | La ausencia de un valor se expresa con una propiedad opcional (`?`). `null` solo se usa como valor de retorno que significa "no encontrado" o "no reconocido". |
| TSC-R15 | El contenido NO DEBE usar objetos `Date`: las fechas son `PartialDate` (§4.4). |

| Regla de ESLint | Qué impide |
| --- | --- |
| `no-restricted-syntax` con el selector `TSEnumDeclaration` | Declarar un `enum` |
| `no-restricted-syntax` con el selector `TSAsExpression:not([typeAnnotation.typeName.name='const'])` | Aserciones `as` distintas de `as const` (se desactiva solo en los archivos de TSC-R07) |
| `@typescript-eslint/switch-exhaustiveness-check` | Un `switch` que no trata todos los miembros de una unión |
| `@typescript-eslint/consistent-type-imports` | Importar un tipo como si fuera un valor |
| `@typescript-eslint/explicit-module-boundary-types`, solo en `**/*.ts` | Exportar una función sin tipo de retorno |
| `import/no-default-export`, con las excepciones de STR-R28 | Exportaciones por defecto |

### 4.3 Identificadores canónicos

| ID | Requisito |
| --- | --- |
| TSC-R16 | `src/shared/contracts/locale.ts` y `src/shared/contracts/ids.ts` DEBEN contener las declaraciones siguientes. Son la única definición en código de los identificadores de VSN §4. |
| TSC-R17 | Ningún otro archivo de `src/` DEBE volver a declarar estas listas ni escribir a mano una unión equivalente. Quien necesite un identificador importa el tipo o la constante. |
| TSC-R18 | Añadir, quitar o renombrar un identificador exige cambiar antes VSN §4. |

```ts
// src/shared/contracts/locale.ts

/** Idiomas de la interfaz, en el orden en que se listan al visitante. */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];

/** Idioma de respaldo cuando no se puede determinar otro (F-20). */
export const FALLBACK_LOCALE: Locale = "en";

export function isLocale(value: unknown): value is Locale {
  return LOCALES.some((locale) => locale === value);
}
```

```ts
// src/shared/contracts/ids.ts

/** Los seis componentes primarios, en orden canónico (VSN §4.1). */
export const PRIMARY_COMPONENT_IDS = ["cpu", "psu", "ssd", "ram", "io", "fan"] as const;
export type PrimaryComponentId = (typeof PRIMARY_COMPONENT_IDS)[number];

/** Los siete elementos que abren una sección, en orden canónico (VSN §4). */
export const COMPONENT_IDS = [...PRIMARY_COMPONENT_IDS, "cmos"] as const;
export type ComponentId = (typeof COMPONENT_IDS)[number];

/** Los nueve objetos de la escena que tienen zona calibrada (AST §4.4). */
export const SCENE_OBJECT_IDS = [...COMPONENT_IDS, "settings", "post-display"] as const;
export type SceneObjectId = (typeof SCENE_OBJECT_IDS)[number];

/** Sección que abre cada componente (VSN §4). Única definición de esta correspondencia. */
export const SECTION_BY_COMPONENT = {
  cpu: "profile",
  psu: "experience",
  ssd: "projects",
  ram: "stack",
  io: "contact",
  fan: "ecosystem",
  cmos: "about",
} as const satisfies Record<ComponentId, string>;

export type SectionSlugOf<C extends ComponentId> = (typeof SECTION_BY_COMPONENT)[C];
export type SectionSlug = SectionSlugOf<ComponentId>;
export type PrimarySectionSlug = SectionSlugOf<PrimaryComponentId>;

/** Componente que abre una sección dada. */
export type ComponentOf<S extends SectionSlug> = {
  [C in ComponentId]: SectionSlugOf<C> extends S ? C : never;
}[ComponentId];

/** Los siete slugs, en orden canónico. */
export const SECTION_SLUGS: readonly SectionSlug[] = COMPONENT_IDS.map(
  (id) => SECTION_BY_COMPONENT[id],
);

/** Los seis slugs primarios, en orden canónico. */
export const PRIMARY_SECTION_SLUGS: readonly PrimarySectionSlug[] = PRIMARY_COMPONENT_IDS.map(
  (id) => SECTION_BY_COMPONENT[id],
);

export function isComponentId(value: unknown): value is ComponentId {
  return COMPONENT_IDS.some((id) => id === value);
}

export function isPrimaryComponentId(value: unknown): value is PrimaryComponentId {
  return PRIMARY_COMPONENT_IDS.some((id) => id === value);
}

export function isSectionSlug(value: unknown): value is SectionSlug {
  return SECTION_SLUGS.some((slug) => slug === value);
}

export function componentOfSection(slug: SectionSlug): ComponentId {
  const match = COMPONENT_IDS.find((id) => SECTION_BY_COMPONENT[id] === slug);
  if (match === undefined) {
    throw new Error(`No component opens section "${slug}"`);
  }
  return match;
}

/**
 * Proyectos con caso de estudio, en el orden en que se listan (VSN-R21, D-82). Cada uno es un
 * `ProjectId` de SSD; una prueba de tipos lo comprueba (TSC-AC19).
 */
export const CASE_STUDY_IDS = ["thesis", "andespace", "dental-site"] as const;
export type CaseStudyId = (typeof CASE_STUDY_IDS)[number];

export function isCaseStudyId(value: unknown): value is CaseStudyId {
  return CASE_STUDY_IDS.some((id) => id === value);
}
```

### 4.4 Primitivas de contenido

| ID | Requisito |
| --- | --- |
| TSC-R19 | `src/shared/contracts/content.ts` DEBE contener las declaraciones siguientes. Los tipos de contenido de las secciones se construyen con ellas. |
| TSC-R20 | Todo enlace a un origen externo es un `ExternalUrl`: solo se admite `https://`. |
| TSC-R21 | `SitePath` se usa únicamente para archivos servidos desde `public/` (por ejemplo, los CVs en PDF). Los enlaces a páginas del sitio se construyen con los ayudantes de rutas (§4.10), nunca con un `SitePath` escrito a mano. |
| TSC-R22 | Un `Period` tiene la misma precisión en sus dos extremos: ambos con mes o ambos sin mes. `"present"` es compatible con cualquier precisión. |

```ts
// src/shared/contracts/content.ts

/** Enlace a un origen externo. Solo HTTPS. */
export type ExternalUrl = `https://${string}`;
/** Enlace de correo. */
export type MailtoUrl = `mailto:${string}@${string}`;
/** Ruta de un archivo servido por el propio sitio (por ejemplo, un PDF de `public/`). */
export type SitePath = `/${string}`;
export type Href = ExternalUrl | MailtoUrl | SitePath;

/** Enlace de contenido. Su texto visible vive en los textos de la sección, indexado por `id`. */
export interface LinkFact<Id extends string = string> {
  readonly id: Id;
  readonly href: Href;
}

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Fecha con precisión de año o de mes. */
export interface PartialDate {
  readonly year: number;
  readonly month?: Month;
}

/** Intervalo de tiempo. `"present"` significa que sigue vigente. */
export interface Period {
  readonly start: PartialDate;
  readonly end: PartialDate | "present";
}

export type RepositoryVisibility = "public" | "private";

/** Número de personas del equipo, incluido el autor. 1 significa trabajo individual. */
export type TeamSize = number;

/** Texto con un fragmento destacado (TSC-R58). `emphasis` aparece una sola vez dentro de `text`. */
export interface EmphasizedText {
  readonly text: string;
  readonly emphasis: string;
}

/** Elemento de contenido que admite un fragmento destacado: una cadena o un `EmphasizedText`. */
export type RichLine = string | EmphasizedText;
```

| ID | Requisito |
| --- | --- |
| TSC-R58 | Un campo de contenido admite texto destacado solo si su tipo es `RichLine` (o un array de `RichLine`), y la spec de su sección lo indica. En las tablas de las specs, el fragmento destacado se escribe en **negrita**: la cadena completa es `text` y lo que va en negrita es `emphasis`. Cada elemento destaca como mucho un fragmento, que es una cifra o un resultado (VSN-R24, D-85). |
| TSC-R59 | `src/shared/ui/rich-text.tsx` exporta el componente de servidor `RichText`, que recibe un `RichLine`: una cadena se renderiza tal cual; un `EmphasizedText`, como su `text` con la primera aparición de `emphasis` dentro de un `<strong>` (VIS §4.2, rol "Énfasis dentro de cuerpo"). Es el único lugar del código que interpreta un `RichLine`. |

### 4.4.1 Contrato de caso de estudio

| ID | Requisito |
| --- | --- |
| TSC-R60 | `src/shared/contracts/case-study.ts` DEBE contener las declaraciones siguientes. El contenido de cada caso vive en los textos de Proyectos (SSD §4.6) y la página que lo muestra la compone la vista simple (SMP §4.9). Los datos del proyecto que no dependen del idioma (nombre propio, tamaño de equipo, tecnologías y enlaces) no se repiten en el caso: se leen de sus hechos (SYS-R30). |

```ts
// src/shared/contracts/case-study.ts
import type { RichLine } from "./content";

/** Una decisión del proceso: qué alternativas había, qué se eligió y por qué. */
export interface CaseStudyDecision {
  readonly options: string;
  readonly choice: string;
  readonly reason: string;
}

/** Contenido de un caso de estudio en un idioma (VSN-R21). */
export interface CaseStudyText {
  /** Nombre breve para el título del documento y la vista previa: 40 caracteres como máximo. */
  readonly title: string;
  /** Descripción para los metadatos: entre 50 y 160 caracteres (QLT-R37). */
  readonly description: string;
  /** El problema y lo que estaba en juego, en párrafos. */
  readonly problem: readonly string[];
  /** Quiénes hicieron el proyecto y cómo se repartieron el trabajo, en una frase. */
  readonly team: string;
  /** Lo que hizo el autor. */
  readonly contributions: readonly string[];
  /** Lo que hizo el resto del equipo. Solo existe si el proyecto no es individual. */
  readonly teamContributions?: string;
  readonly decisions: readonly CaseStudyDecision[];
  /** Cambios de rumbo durante el proyecto. */
  readonly changes: readonly string[];
  /** Resultado. Admite texto destacado. */
  readonly outcome: readonly RichLine[];
  /** Lo aprendido y lo que el autor haría distinto. */
  readonly learned: readonly string[];
}
```

### 4.5 Contrato de sección

| ID | Requisito |
| --- | --- |
| TSC-R23 | `src/shared/contracts/section.ts` DEBE contener las declaraciones siguientes. |
| TSC-R24 | El `index.ts` de cada feature de sección exporta un único valor de tipo `SectionDefinition` con sus tres parámetros concretos, llamado `<nombreDelFeatureEnCamelCase>Section`: `cpuProfileSection`, `psuExperienceSection`, `ssdProjectsSection`, `ramStackSection`, `ioContactSection`, `fanEcosystemSection`, `cmosAboutSection`. |
| TSC-R25 | El par `componentId`–`slug` de una definición queda ligado por el tipo: una definición de `"ssd"` solo compila con `slug: "projects"`. |
| TSC-R26 | `meta.title` y `meta.hardwareName` de cada idioma DEBEN ser los nombres de VSN §4. `meta.description` es una frase de entre 50 y 160 caracteres. |
| TSC-R27 | `bootLines` contiene las líneas que la sección aporta al registro de arranque, en inglés, construidas a partir de sus hechos y de su texto en inglés. Cuántas son y qué dicen lo define la spec de cada sección dentro de los límites de BOOT. |

```ts
// src/shared/contracts/section.ts
import type { ReactNode } from "react";

import type { ComponentId, SectionSlugOf } from "./ids";
import type { Locale } from "./locale";

export interface SectionMeta {
  /** Nombre de la sección, tal como figura en VSN §4. */
  readonly title: string;
  /** Nombre de la pieza de hardware, tal como figura en VSN §4. */
  readonly hardwareName: string;
  /** Una frase que resume la sección. Se usa en metadatos y como descripción accesible. */
  readonly description: string;
}

/** Todo objeto de textos de una sección extiende este tipo. */
export interface SectionTextBase {
  readonly meta: SectionMeta;
}

/** Línea que una sección aporta al registro de arranque. Siempre en inglés (D-10). */
export interface BootLine {
  readonly message: string;
  readonly status: "ok" | "none";
}

export interface SectionProps {
  readonly locale: Locale;
  /** Prefijo que el componente antepone a todo atributo `id` que renderice. */
  readonly idScope: string;
  /** Vista en la que se muestra la sección: decide a dónde llevan sus enlaces internos (TSC-R61). */
  readonly view: SiteView;
}

export interface SectionDefinition<C extends ComponentId, F, T extends SectionTextBase> {
  readonly componentId: C;
  readonly slug: SectionSlugOf<C>;
  /** Datos que no dependen del idioma. */
  readonly facts: F;
  /** Textos por idioma. */
  readonly text: Readonly<Record<Locale, T>>;
  readonly bootLines: readonly BootLine[];
  /** Componente raíz de la sección. */
  readonly Section: (props: SectionProps) => ReactNode;
}

/** Definición con los tipos concretos borrados, para recorrer todas las secciones. */
export type AnySectionDefinition = SectionDefinition<ComponentId, unknown, SectionTextBase>;
```

#### 4.5.1 Contrato del componente raíz

El mismo componente se muestra dentro del panel de detalle y dentro de la vista simple, y en las páginas de sección aparece dos veces en el mismo documento (SYS §4.4). Estas reglas lo hacen posible.

| ID | Requisito |
| --- | --- |
| TSC-R28 | `Section` es un componente de servidor (STR-R26). Recibe solo `locale` e `idScope`; obtiene sus hechos y sus textos de su propio feature. |
| TSC-R29 | `Section` NO DEBE renderizar el título de la sección: lo renderiza quien lo contiene, como `<h2>`, a partir de `meta.title`. Los encabezados de primer nivel de `Section` son `<h3>` y los anidados `<h4>`. NO DEBE renderizar `<h1>` ni `<h2>`. |
| TSC-R30 | `Section` NO DEBE renderizar elementos de región (`<main>`, `<section>`, `<header>`, `<footer>`, `<nav>`) como raíz ni asumir un ancho: su contenido se adapta al contenedor. |
| TSC-R31 | Todo atributo `id` que renderice `Section` es la concatenación de `idScope` y un **identificador local**. Lo mismo aplica a los atributos que referencian un `id` (`aria-labelledby`, `aria-describedby`, `htmlFor`). |
| TSC-R32 | Todo identificador local empieza por el slug de su sección seguido de un guion y está en `kebab-case` (por ejemplo `projects-habicapital`), de modo que sea único en un documento que contiene todas las secciones. |
| TSC-R33 | `Section` NO DEBE cambiar su contenido ni su estructura según el valor de `idScope`, ni según `view`, salvo el destino de sus enlaces internos (TSC-R61). La capa base de la vista simple pasa `idScope=""`, de modo que sus identificadores locales son los fragmentos de URL de SYS-R11; el panel de detalle pasa `idScope="panel-"`. |

### 4.6 Modelo de contenido: hechos y textos

| ID | Requisito |
| --- | --- |
| TSC-R34 | El contenido de una sección se reparte en tres archivos de su carpeta `content/`: `facts.ts` (los hechos, escritos una sola vez), `es.ts` y `en.ts` (los textos de cada idioma, ambos del mismo tipo). Así se cumple SYS-R30: ningún dato se escribe dos veces. |
| TSC-R35 | La clasificación entre hecho y texto es la de la tabla siguiente. |
| TSC-R36 | Los tipos de hechos y de textos de una sección se declaran en el `types.ts` de su feature. El tipo de textos extiende `SectionTextBase`. |
| TSC-R37 | Cada elemento repetible del contenido (un proyecto, un empleo, un enlace, un bloque) tiene un identificador que es una unión de literales derivada de un array `as const`. Los textos de esos elementos se declaran como `Record<Identificador, …>`, de modo que el compilador exija el texto de cada elemento en cada idioma. |
| TSC-R38 | El orden en que se muestran los elementos es el orden del array de hechos. Los textos nunca determinan el orden. |
| TSC-R39 | Las cadenas de contenido son texto plano: sin HTML, sin Markdown y sin saltos de línea. El énfasis y la estructura se expresan con campos separados, no con marcas dentro de una cadena: un fragmento destacado es el campo `emphasis` de un `EmphasizedText` (TSC-R58). |
| TSC-R40 | `facts.ts` declara su objeto con `as const satisfies <TipoDeHechos>`; `es.ts` y `en.ts` declaran el suyo con `satisfies <TipoDeTextos>`. |

| Dato | Va en | Ejemplo |
| --- | --- | --- |
| Identificador de un elemento | Hechos | `"habicapital"` |
| Fecha o periodo | Hechos, como `PartialDate` o `Period` | Julio de 2024 a enero de 2025 |
| Enlace | Hechos, como `LinkFact` | URL de un repositorio |
| Nombre propio que no se traduce: tecnología, producto, institución, proyecto | Hechos | `"FastAPI"`, `"Hochschule München"`, `"AndeSpace"` |
| Cifra que se muestra como campo propio | Hechos, como `number` | Promedio 4,2; tamaño de equipo 6 |
| Bandera o categoría | Hechos | Proyecto destacado; repositorio privado |
| Orden de los elementos | Hechos (orden del array) | — |
| Título, descripción, viñeta, etiqueta de un enlace | Textos | "Simulación de banca digital segura" |
| Nombre que cambia con el idioma: cargo, curso, título descriptivo | Textos | "Monitor académico" / "Teaching Assistant" |
| Cifra dentro de una frase | Textos, como parte de la frase | "más de 100 pruebas automatizadas" |

### 4.7 Registro de secciones

| ID | Requisito |
| --- | --- |
| TSC-R41 | `src/features/registry.ts` DEBE exportar exactamente las cuatro declaraciones siguientes (STR-R15). En el bloque se omiten las importaciones. |
| TSC-R42 | `SECTIONS` da acceso con tipos concretos a una sección determinada (por ejemplo, `SECTIONS.contact.facts`). `SECTION_LIST` y `PRIMARY_SECTION_LIST` se usan para recorrer las secciones en orden canónico. |
| TSC-R43 | El tipo `Registry` obliga a que haya una definición por cada `SectionSlug` y a que cada una declare el componente que le corresponde. Registrar una sección bajo el slug equivocado no compila. |

```ts
// src/features/registry.ts
type Registry = {
  readonly [S in SectionSlug]: SectionDefinition<ComponentOf<S>, unknown, SectionTextBase>;
};

export const SECTIONS = {
  profile: cpuProfileSection,
  experience: psuExperienceSection,
  projects: ssdProjectsSection,
  stack: ramStackSection,
  contact: ioContactSection,
  ecosystem: fanEcosystemSection,
  about: cmosAboutSection,
} as const satisfies Registry;

export const SECTION_LIST: readonly AnySectionDefinition[] = SECTION_SLUGS.map(
  (slug) => SECTIONS[slug],
);

export const PRIMARY_SECTION_LIST: readonly AnySectionDefinition[] = PRIMARY_SECTION_SLUGS.map(
  (slug) => SECTIONS[slug],
);

export function getSection(slug: SectionSlug): AnySectionDefinition {
  return SECTIONS[slug];
}
```

### 4.8 Integridad del contenido

El compilador garantiza la forma del contenido. Lo que los tipos no pueden expresar lo comprueba una función pura, `findContentIssues`, en `src/shared/lib/content-integrity.ts`.

| ID | Requisito |
| --- | --- |
| TSC-R44 | `findContentIssues(sections: readonly AnySectionDefinition[]): readonly ContentIssue[]` recorre los hechos, los textos y las líneas de arranque de todas las secciones y devuelve un `ContentIssue` (sección, ruta del dato, regla y detalle) por cada incumplimiento de las reglas de la tabla siguiente. |
| TSC-R45 | Una prueba unitaria DEBE afirmar que `findContentIssues(SECTION_LIST)` devuelve una lista vacía. El mensaje de fallo lista cada incumplimiento con su ruta. |
| TSC-R46 | Las reglas C4 y C5 admiten excepciones: una lista explícita en la propia prueba, donde cada entrada indica la ruta del dato y la razón. Las demás reglas no admiten excepciones. |
| TSC-R47 | Una prueba DEBE comprobar que todo `SitePath` de los hechos corresponde a un archivo que existe en `public/`. |

| Regla | Qué comprueba |
| --- | --- |
| C1 Paridad de forma | Los textos en español y en inglés de cada sección tienen las mismas claves en todos los niveles y la misma longitud en cada array. |
| C2 Cadenas limpias | Ninguna cadena está vacía, empieza o termina con espacio, ni contiene dos espacios seguidos. |
| C3 Texto plano | Ninguna cadena contiene `<`, `>`, acento grave, `**`, `__` ni salto de línea (TSC-R39). Se aplica también a `text` y `emphasis` de todo `EmphasizedText`. |
| C4 Paridad numérica | Para cada cadena de texto, la colección de secuencias de dígitos que contiene es la misma en español y en inglés (por ejemplo, "4,2" y "4.2" contienen ambas `4` y `2`). |
| C5 Sin traducir | Ninguna cadena de texto de cinco o más palabras es idéntica en español y en inglés. |
| C6 Metadatos | `meta.title` y `meta.hardwareName` no están vacíos y `meta.title` no supera 40 caracteres; `meta.description` mide entre 50 y 160 caracteres. |
| C7 Enlaces | Toda cadena de los hechos que empieza por `http://` es un error. Toda cadena que empieza por `https://` es una URL válida. Todo `mailto:` contiene exactamente una `@`. |
| C8 Identificadores | En todo array de objetos con propiedad `id`, los `id` son únicos y están en `kebab-case`. |
| C9 Periodos | En todo objeto con `start` y `end`: los años están entre 2000 y 2100, el inicio no es posterior al fin y se cumple TSC-R22. |
| C10 Tamaño de equipo | Toda propiedad `teamSize` es un entero mayor o igual que 1. |
| C11 Líneas de arranque | Todo `message` es una sola línea no vacía de 96 caracteres como máximo. |
| C12 Mayúsculas | Ninguna cadena de tres o más palabras está escrita íntegramente en mayúsculas (VIS-R09). |
| C13 Texto destacado | En todo `EmphasizedText`, `emphasis` no está vacío, es distinto de `text` y aparece exactamente una vez dentro de él. En cada posición, el español y el inglés son los dos cadenas o los dos `EmphasizedText` (TSC-R58). |
| C14 Casos de estudio | En todo `CaseStudyText`, `title` mide 40 caracteres como máximo y `description` entre 50 y 160 (QLT-R37); `decisions` y `outcome` no están vacíos (TSC-R60). |

### 4.9 Estado

| ID | Requisito |
| --- | --- |
| TSC-R48 | `src/shared/contracts/state.ts` DEBE contener las declaraciones siguientes, que concretan la tabla de SYS §4.6. |
| TSC-R49 | El valor almacenado bajo cada clave es exactamente el texto JSON del objeto `PersistedPrefs` o `PersistedSession`, sin envoltorio ni campos adicionales (por ejemplo `{"soundEnabled":false,"sceneVariant":"photo","locale":"es"}`). El script previo al pintado y la redirección de `/` leen ese formato directamente. |
| TSC-R50 | `src/shared/state/persistence.ts` DEBE exportar `parsePrefs(raw: string \| null): PersistedPrefs` y `parseSession(raw: string \| null): PersistedSession`. Son funciones puras y totales: nunca lanzan. El mismo módulo exporta sus inversas, `serializePrefs` y `serializeSession`, que escriben exactamente el formato de TSC-R49 y descartan cualquier campo que no sea persistente. Cada campo se valida por separado y, si falta o es inválido, toma su valor por defecto; en `visited` se descartan los valores que no son `PrimaryComponentId` y los repetidos. |
| TSC-R51 | Los stores se exponen como hooks en `src/shared/state/`: `usePrefsStore` (tipo `PrefsStore`), `useSessionStore` (tipo `SessionStore`) y `useUiStore` (tipo `UiStore`). Sus acciones se comportan como indica la tabla siguiente. |
| TSC-R52 | Hasta que se hidratan, los stores devuelven los valores por defecto y `hasHydrated` es `false` (SYS-R26). `src/shared/state/` exporta el componente de cliente `StoreHydrator`, que no renderiza nada y, en un efecto, lee el almacenamiento con las funciones de TSC-R50, vuelca los valores a los stores y pone `hasHydrated` a `true`. `src/app/[locale]/layout.tsx` lo renderiza una vez. |
| TSC-R53 | Toda lectura y escritura del almacenamiento pasa por un único módulo, `src/shared/state/safe-storage.ts`, que captura cualquier excepción (SYS-R27). Ningún otro archivo de `src/` accede a `localStorage` ni a `sessionStorage`, salvo el script previo al pintado y la redirección de `/`, que se ejecutan antes que React. Los archivos de prueba quedan exentos, porque necesitan preparar y leer el almacenamiento para comprobarlo. |

```ts
// src/shared/contracts/state.ts
import { DEFAULT_SCENE_VARIANT, type SceneVariant } from "./assets";
import type { PrimaryComponentId } from "./ids";
import type { Locale } from "./locale";

/** Valor guardado en `localStorage` bajo `STORAGE_KEYS.prefs`. */
export interface PersistedPrefs {
  readonly locale?: Locale;
  readonly soundEnabled: boolean;
  readonly sceneVariant: SceneVariant;
}

/** Valor guardado en `sessionStorage` bajo `STORAGE_KEYS.session`. */
export interface PersistedSession {
  readonly bootSeen: boolean;
  readonly visited: readonly PrimaryComponentId[];
  /** La bienvenida de la escena ya se cerró en esta sesión (SCN-R50). */
  readonly welcomeSeen: boolean;
}

export const STORAGE_KEYS = {
  prefs: "portfolio:v1:prefs",
  session: "portfolio:v1:session",
} as const;

export const DEFAULT_PREFS: PersistedPrefs = {
  soundEnabled: false,
  sceneVariant: DEFAULT_SCENE_VARIANT,
};
export const DEFAULT_SESSION: PersistedSession = {
  bootSeen: false,
  visited: [],
  welcomeSeen: false,
};

export interface PrefsStore extends PersistedPrefs {
  readonly hasHydrated: boolean;
  readonly setLocale: (locale: Locale) => void;
  readonly setSoundEnabled: (enabled: boolean) => void;
  readonly setSceneVariant: (variant: SceneVariant) => void;
}

export interface SessionStore extends PersistedSession {
  readonly hasHydrated: boolean;
  readonly markBootSeen: () => void;
  readonly markVisited: (id: PrimaryComponentId) => void;
  readonly markWelcomeSeen: () => void;
  readonly reset: () => void;
}

export interface UiStore {
  readonly settingsOpen: boolean;
  readonly openSettings: () => void;
  readonly closeSettings: () => void;
  readonly toggleSettings: () => void;
}
```

| Acción | Efecto en el store | Persistencia |
| --- | --- | --- |
| `setLocale(locale)` | `locale` toma el valor dado | Escribe `PersistedPrefs` de inmediato |
| `setSoundEnabled(enabled)` | `soundEnabled` toma el valor dado | Escribe `PersistedPrefs` de inmediato |
| `setSceneVariant(variant)` | `sceneVariant` toma el valor dado | Escribe `PersistedPrefs` de inmediato |
| `markBootSeen()` | `bootSeen` pasa a `true` | Escribe `PersistedSession` de inmediato |
| `markVisited(id)` | Añade `id` al final de `visited` si no estaba; si ya estaba, no cambia nada | Escribe `PersistedSession` solo si hubo cambio |
| `markWelcomeSeen()` | `welcomeSeen` pasa a `true`; si ya lo era, no cambia nada | Escribe `PersistedSession` solo si hubo cambio |
| `reset()` | `bootSeen` y `welcomeSeen` pasan a `false` y `visited` a lista vacía | Escribe `PersistedSession` de inmediato |
| `openSettings()`, `closeSettings()`, `toggleSettings()` | Cambian `settingsOpen` | Ninguna |

### 4.10 Rutas

| ID | Requisito |
| --- | --- |
| TSC-R54 | `src/shared/config/routes.ts` DEBE exportar los tipos y las funciones siguientes, con el comportamiento de la tabla de ejemplos. Son funciones puras. De las funciones se muestra solo la firma. |
| TSC-R55 | Toda ruta interna del sitio se construye con estas funciones. NO DEBEN aparecer en `src/` literales de ruta que contengan un locale (por ejemplo `"/es/"` o una plantilla que concatene el locale) fuera de `routes.ts` y de los archivos de prueba, que escriben literalmente las rutas que esperan. |
| TSC-R56 | `parsePath` acepta la ruta con o sin barra final. Devuelve `null` para cualquier ruta que no corresponda a una de las cuatro vistas. Una ruta de caso solo es válida bajo `projects` y con un `CaseStudyId`. |
| TSC-R61 | **Los enlaces no cambian de vista** (D-103). `SiteView` (`"interactive" \| "simple"`), en `src/shared/contracts/navigation.ts`, es la vista en la que se muestra una sección: el panel de detalle pasa `"interactive"` y la vista simple, `"simple"`. Todo enlace de una sección a otra se construye con `crossSectionHref`: en la escena lleva a la ruta de la sección, que abre su panel; en la vista simple es solo el fragmento, que salta dentro de la misma página. Los enlaces a un caso de estudio se construyen con `caseStudyHref`, que en la vista simple añade `?view=simple` para que el caso devuelva al visitante a la vista simple (SMP-R30). |

```ts
// src/shared/config/routes.ts
export type HomePath = `/${Locale}/`;
export type SectionPath = `/${Locale}/${SectionSlug}/`;
export type CvPath = `/${Locale}/cv/`;
export type CaseStudyPath = `/${Locale}/projects/${CaseStudyId}/`;
export type AppPath = HomePath | SectionPath | CvPath | CaseStudyPath;

/** Segmento reservado para la vista simple; nunca es un `SectionSlug` (SYS-R10). */
export const CV_SEGMENT = "cv";

export type ParsedPath =
  | { readonly view: "home"; readonly locale: Locale }
  | { readonly view: "section"; readonly locale: Locale; readonly section: SectionSlug }
  | { readonly view: "cv"; readonly locale: Locale }
  | { readonly view: "case"; readonly locale: Locale; readonly caseStudy: CaseStudyId };

export function homePath(locale: Locale): HomePath;
export function sectionPath(locale: Locale, section: SectionSlug): SectionPath;
export function cvPath(locale: Locale): CvPath;
export function caseStudyPath(locale: Locale, caseStudy: CaseStudyId): CaseStudyPath;
/** Enlace de una sección a otra, o a un elemento de otra, sin salir de la vista (TSC-R61). */
export function crossSectionHref(
  locale: Locale,
  view: SiteView,
  section: SectionSlug,
  localId?: string,
): string;
/** Enlace a un caso de estudio que recuerda desde qué vista se abrió (TSC-R61). */
export function caseStudyHref(locale: Locale, caseStudy: CaseStudyId, view: SiteView): string;
/** Parámetro de consulta con el que una página de caso sabe que se abrió desde la vista simple. */
export const VIEW_QUERY = "view=simple";
export function parsePath(pathname: string): ParsedPath | null;
export function toPath(parsed: ParsedPath): AppPath;
/** Misma vista y sección en otro idioma. Una ruta no reconocida lleva al inicio de ese idioma. */
export function withLocale(pathname: string, target: Locale): AppPath;
```

| Llamada | Resultado |
| --- | --- |
| `homePath("es")` | `"/es/"` |
| `sectionPath("en", "projects")` | `"/en/projects/"` |
| `cvPath("es")` | `"/es/cv/"` |
| `caseStudyPath("en", "thesis")` | `"/en/projects/thesis/"` |
| `crossSectionHref("es", "interactive", "projects", "projects-dental-site")` | `"/es/projects/#projects-dental-site"` |
| `crossSectionHref("es", "simple", "projects", "projects-dental-site")` | `"#projects-dental-site"` |
| `crossSectionHref("en", "simple", "about")` | `"#about"` |
| `caseStudyHref("es", "thesis", "interactive")` | `"/es/projects/thesis/"` |
| `caseStudyHref("es", "thesis", "simple")` | `"/es/projects/thesis/?view=simple"` |
| `parsePath("/es/")` y `parsePath("/es")` | `{ view: "home", locale: "es" }` |
| `parsePath("/en/projects/")` | `{ view: "section", locale: "en", section: "projects" }` |
| `parsePath("/es/cv/")` | `{ view: "cv", locale: "es" }` |
| `parsePath("/es/projects/dental-site/")` | `{ view: "case", locale: "es", caseStudy: "dental-site" }` |
| `parsePath("/")`, `parsePath("/de/")`, `parsePath("/es/unknown/")`, `parsePath("/es/projects/extra/")` | `null` |
| `withLocale("/es/projects/", "en")` | `"/en/projects/"` |
| `withLocale("/es/cv/", "en")` | `"/en/cv/"` |
| `withLocale("/es/projects/andespace/", "en")` | `"/en/projects/andespace/"` |
| `withLocale("/algo/desconocido/", "en")` | `"/en/"` |

### 4.11 Assets y modo de render

| ID | Requisito |
| --- | --- |
| TSC-R57 | `src/shared/contracts/assets.ts` DEBE contener las declaraciones siguientes. El manifiesto generado declara `SCENE_ASSETS` con `as const satisfies SceneAssets` (AST-R36). El tipo del manifiesto de la fotografía lo define CPU en este mismo archivo; `OgAsset`, SMP; y `SiteTheme`, con el color que necesita la etiqueta `theme-color`, AST-R36. |

```ts
// src/shared/contracts/assets.ts
import type { SitePath } from "./content";

/** Variantes de imagen de la escena (AST §4.10). */
export const SCENE_VARIANTS = ["photo", "sketch"] as const;
export type SceneVariant = (typeof SCENE_VARIANTS)[number];

/** Variante que se muestra mientras el visitante no elija otra. */
export const DEFAULT_SCENE_VARIANT: SceneVariant = "photo";

export function isSceneVariant(value: unknown): value is SceneVariant {
  return SCENE_VARIANTS.some((variant) => variant === value);
}

/** Rectángulo en el espacio de escena (AST §4.2). */
export interface SceneRect {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

export interface ImageSource {
  readonly width: number;
  readonly src: SitePath;
}

export interface SceneAsset {
  readonly version: string;
  readonly provisional: boolean;
  readonly width: number;
  readonly height: number;
  readonly sceneSpace: { readonly width: 1600; readonly height: 900 };
  readonly safeArea: SceneRect;
  readonly sources: {
    readonly avif: readonly ImageSource[];
    readonly webp: readonly ImageSource[];
    readonly jpeg: readonly ImageSource[];
  };
  readonly placeholder: {
    readonly color: `#${string}`;
    readonly dataUrl: `data:image/webp;base64,${string}`;
  };
}

/** Manifiesto de la escena: una entrada por variante. */
export type SceneAssets = Readonly<Record<SceneVariant, SceneAsset>>;

export type RenderMode = "scene" | "simple";
```

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| TSC-AC01 | `tsconfig.json` contiene exactamente las opciones de TSC-R01 y los valores de `include` y `exclude` de TSC-R02, y no existe otro archivo `tsconfig*.json` en el repositorio. | Prueba unitaria que lee el archivo |
| TSC-AC02 | `pnpm typecheck` termina con código de salida 0. | Ejecución en CI |
| TSC-AC03 | Para cada regla de la tabla de §4.2 y para `any` explícito, la aserción no nula y `@ts-ignore`, ESLint marca un error en un fragmento de ejemplo que la incumple y no marca ninguno en su equivalente correcto. | Prueba unitaria que ejecuta ESLint con la configuración del proyecto sobre fragmentos de ejemplo |
| TSC-AC04 | ESLint no marca `as` en `src/shared/lib/typed-object.ts` ni en un archivo `*.test.ts`, y sí lo marca en cualquier otro archivo de `src/`. | Prueba unitaria que ejecuta ESLint sobre fragmentos de ejemplo |
| TSC-AC05 | Un archivo de pruebas de tipos demuestra, con `@ts-expect-error`, que no compilan: una definición con el slug de otro componente; un registro con una sección bajo el slug equivocado; un texto al que le falta un elemento en un idioma; un `Href` con `http://`; un `Period` con mes 13. | Prueba unitaria (archivo de tipos comprobado por `pnpm typecheck`) |
| TSC-AC06 | `SECTION_SLUGS` es `["profile", "experience", "projects", "stack", "contact", "ecosystem", "about"]`, no contiene `"cv"`, y cada guarda de §4.3 acepta todos los valores de su lista y rechaza valores ajenos, `null`, `undefined` y números. | Prueba unitaria |
| TSC-AC07 | `SECTION_LIST` tiene siete definiciones en el orden de `SECTION_SLUGS`, `PRIMARY_SECTION_LIST` las seis primeras, ningún `componentId` se repite y `getSection(slug).slug === slug` para los siete slugs. | Prueba unitaria |
| TSC-AC08 | `findContentIssues(SECTION_LIST)` devuelve una lista vacía. | Prueba unitaria |
| TSC-AC09 | Para cada regla C1 a C14 existe un caso de ejemplo que `findContentIssues` marca con esa regla y un caso correcto que no marca. | Prueba unitaria |
| TSC-AC10 | Todo `SitePath` presente en los hechos corresponde a un archivo existente en `public/`. | Prueba unitaria |
| TSC-AC11 | `parsePrefs` y `parseSession` devuelven los valores por defecto para `null`, texto que no es JSON, un array, un número y un objeto con tipos erróneos; conservan los campos válidos de un objeto parcialmente inválido; `parsePrefs` sustituye por `photo` un `sceneVariant` que no es una variante válida; y `parseSession` elimina de `visited` los repetidos y los valores que no son `PrimaryComponentId`. | Prueba unitaria |
| TSC-AC12 | Cada acción de los stores produce el efecto y la escritura de la tabla de §4.9; `markVisited` con un identificador ya presente no escribe en el almacenamiento. | Prueba unitaria |
| TSC-AC13 | Antes de hidratar, los stores devuelven los valores por defecto aunque el almacenamiento contenga otros; después de montar `StoreHydrator` devuelven los valores almacenados y `hasHydrated` es `true`. | Prueba de componente |
| TSC-AC14 | Las funciones de rutas devuelven los resultados de la tabla de §4.10, incluidas las de caso de estudio, y `parsePath("/es/projects/habicapital/")` y `parsePath("/es/stack/thesis/")` devuelven `null`. | Prueba unitaria |
| TSC-AC15 | No hay literales de ruta con locale en `src/` fuera de `routes.ts` y de los archivos de prueba, ni accesos a `localStorage` o `sessionStorage` fuera de los archivos que permite TSC-R53. | Prueba de arquitectura |
| TSC-AC16 | Al renderizar en un mismo documento las siete secciones con `idScope=""` y de nuevo con `idScope="panel-"`, para cada idioma: no hay ningún atributo `id` repetido, todo `id` de la primera tanda empieza por el slug de su sección, y ningún componente renderiza `<h1>`, `<h2>` ni un elemento de región como raíz. | Prueba de componente |
| TSC-AC17 | El HTML que produce cada sección con `idScope=""` es idéntico al que produce con `idScope="panel-"`, con la misma `view`, una vez eliminado ese prefijo de los atributos. | Prueba de componente |
| TSC-AC18 | Ningún archivo `content/*.ts` contiene `new Date` ni `Date.`, y cada feature de sección declara sus hechos y textos con `satisfies` (TSC-R40). | Prueba de arquitectura |
| TSC-AC19 | `CASE_STUDY_IDS` es `["thesis", "andespace", "dental-site"]`, `isCaseStudyId` acepta esos tres valores y rechaza `"habicapital"`, `null` y números, y un archivo de pruebas de tipos demuestra que `CaseStudyId` es asignable a `ProjectId` de SSD. | Prueba unitaria |
| TSC-AC20 | `parseSession` devuelve `welcomeSeen: false` y conserva `bootSeen` y `visited` para un valor guardado sin ese campo, como `{"bootSeen":true,"visited":["cpu"]}`; `markWelcomeSeen` escribe la sesión una sola vez; y `reset` deja `welcomeSeen` en `false`. | Prueba unitaria |
| TSC-AC21 | `RichText` renderiza una cadena sin ningún `<strong>` y un `EmphasizedText` con exactamente un `<strong>` que contiene `emphasis`, con el resto de `text` antes y después, sin espacios añadidos. | Prueba de componente |
| TSC-AC22 | `crossSectionHref` y `caseStudyHref` devuelven los resultados de la tabla de §4.10; y ninguna sección renderizada con `view="simple"` contiene un enlace interno cuyo `href` empiece por la ruta de una sección. | Prueba unitaria y prueba de componente |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Hechos escritos una vez y textos por idioma** (TSC-R34, D-33). | Con un archivo completo por idioma, las fechas, los enlaces y las cifras se escribirían dos veces y podrían divergir sin que nada lo detecte, lo que contradice SYS-R30. Separarlos deja en los diccionarios solo lo que de verdad se traduce. |
| **Textos indexados por identificador** (TSC-R37). | `Record<Id, …>` convierte "falta la traducción de un proyecto" en un error de compilación. Es la garantía de paridad más barata y la que hará que añadir el alemán sea seguir los errores del compilador. |
| **Par componente–slug ligado por el tipo** (TSC-R25, TSC-R43). | La tabla de VSN §4 queda escrita una sola vez en código (`SECTION_BY_COMPONENT`) y cualquier definición o registro que la contradiga no compila. |
| **Definición genérica con una versión de tipos borrados.** | Quien recorre todas las secciones (panel, vista simple, arranque) solo necesita lo común; quien necesita datos de una sección concreta (por ejemplo, los enlaces de contacto para los metadatos) los obtiene con su tipo exacto desde `SECTIONS`. |
| **`Section` recibe solo `locale` e `idScope`.** | Evita pasar hechos y textos a través de tipos borrados y mantiene el componente como componente de servidor puro. `idScope` resuelve el único problema de mostrar la sección dos veces en un documento, que son los `id` duplicados, sin que el componente sepa dónde se muestra (STR-R14). |
| **Cada sección aporta sus líneas de arranque** (TSC-R27). | La sección es quien conoce sus datos con tipos; el arranque se limita a ordenar y mostrar. Añadir una sección no obliga a tocar el arranque. |
| **Comprobaciones de integridad como función pura con casos de prueba propios** (§4.8). | Cubre lo que los tipos no pueden expresar, y sus propias pruebas demuestran que cada regla detecta lo que dice detectar. |
| **Paridad numérica entre idiomas** (C4). | El error de traducción más dañino en un CV es una cifra distinta en cada idioma. Compararlas es trivial y no tiene falsos negativos. |
| **Sin `as`, sin `!` y sin `any`** (TSC-R05 a TSC-R07). | Son las tres formas de decirle al compilador que no compruebe. Sin ellas, que el código compile significa algo. La excepción de `typed-object.ts` concentra en un solo archivo la única aserción que TypeScript hace inevitable. |
| **Arrays `as const` en lugar de `enum`.** | La lista en runtime (para recorrer o validar) y el tipo salen de la misma declaración, y no se genera código adicional. |
| **`exactOptionalPropertyTypes` no se activa.** | Sus errores aparecen sobre todo al pasar propiedades opcionales a componentes de librerías, donde obliga a rodeos sin aportar seguridad en un proyecto que no recibe datos externos. Las demás opciones estrictas sí se activan. |
| **Formato de almacenamiento propio y sin envoltorio** (TSC-R49). | El script previo al pintado y la redirección de `/` leen el almacenamiento antes de que exista React; necesitan un formato estable y documentado, no el interno de una librería. |
| **Rutas solo mediante funciones** (TSC-R55). | Un único lugar conoce la forma de las URLs; el tipo de retorno impide construir una ruta a una sección inexistente. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-16 | 3.0 | Versión 3, por decisión del autor (D-103), que encontró que los enlaces de la vista simple llevaban a la escena. `SectionProps` gana `view: SiteView`; TSC-R33 lo admite solo para el destino de los enlaces. Nuevo TSC-R61 y funciones `crossSectionHref` y `caseStudyHref` en §4.10. TSC-AC17 actualizado; nuevo TSC-AC22. |
| 2026-10-14 | 2.4 | Estado: pasa a "Implementada" al cerrar M12, con todos sus criterios automáticos citados por una prueba (TST-R38): `welcomeSeen` y `markWelcomeSeen` (TSC-AC11, TSC-AC12, TSC-AC20). Sin cambio de requisitos. |
| 2026-10-14 | 2.4 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 2.4 | Versión 2, pendiente de aprobación del autor (D-82, D-83, D-85). §4.3: `CASE_STUDY_IDS` y su guarda. §4.4: `EmphasizedText` y `RichLine`, con TSC-R58 y TSC-R59 (`RichText`); TSC-R39 remite a ellos. Nuevo §4.4.1 con el contrato de caso de estudio (TSC-R60). §4.8: C3 se aplica también al texto destacado y nuevas reglas C13 y C14. §4.9: campo `welcomeSeen` y acción `markWelcomeSeen`; `reset` también lo pone a `false`. §4.10: vista `case` y `caseStudyPath`. Nuevos TSC-AC19 a TSC-AC21. |
| 2026-10-13 | 2.3 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). Sin cambio de requisitos. |
| 2026-10-13 | 2.3 | Durante M4. TSC-R57: `assets.ts` contiene también `OgAsset` y `SiteTheme`. |
| 2026-10-13 | 2.2 | Aclaraciones surgidas al implementar M1, por delegación del autor. TSC-R50: `serializePrefs` y `serializeSession`. TSC-R53, TSC-R55 y TSC-AC15: los archivos de prueba quedan exentos de las dos restricciones. |
| 2026-10-13 | 2.1 | Por decisión del autor (D-66). §4.9: `PersistedPrefs` gana `sceneVariant`, con su valor por defecto y la acción `setSceneVariant`. §4.11: `SCENE_VARIANTS`, `SceneVariant`, `DEFAULT_SCENE_VARIANT`, `isSceneVariant` y `SceneAssets`. TSC-AC11 ampliado. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Código normativo compilado y analizado con TypeScript 6.0.3, typescript-eslint 8.71.2 y ESLint 10.12.0. |
| 2026-10-12 | 2.0 | Nuevo orden canónico decidido por el autor (D-46): cambian `PRIMARY_COMPONENT_IDS`, el orden de `SECTION_BY_COMPONENT` y de `SECTIONS`, y la lista esperada en TSC-AC06. |
