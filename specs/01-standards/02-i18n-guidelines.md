# I18N — Guía de internacionalización

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.2 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS, STR, TSC |

## 1. Propósito

Definir cómo convive el sitio en dos idiomas: dónde vive cada texto, cómo se formatean fechas y cifras, cómo se cambia de idioma, qué metadatos por idioma se publican y con qué criterios se traduce. El objetivo es que español e inglés digan exactamente lo mismo y que añadir un tercer idioma no exija tocar componentes.

## 2. Alcance

**Incluye:** idiomas admitidos y sus datos, ubicación de los textos, diccionario de interfaz, formateadores, cambio de idioma, metadatos por idioma, marcado del idioma de las partes, reglas de traducción y estilo, procedimiento para añadir un idioma y mecanismos de cumplimiento.

**No incluye:** los textos de cada sección (los define la spec de cada sección), los textos de interfaz de cada feature de armazón (los define su spec, dentro de la estructura de §4.3), el aspecto del selector de idioma (ver SET) ni la implementación de los metadatos (ver SMP).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Diccionario de interfaz** | Objeto con todas las cadenas de la interfaz que no son contenido de una sección: botones, nombres accesibles, avisos. Hay uno por idioma. |
| **Espacio de nombres** | Primer nivel del diccionario de interfaz. Agrupa las cadenas de un feature de armazón o de un uso transversal. |
| **Texto de sección** | Los textos de una sección en un idioma (`content/es.ts`, `content/en.ts`; ver TSC §4.6). |
| **Formateador** | Función pura que convierte un hecho (fecha, cifra, tamaño de equipo) en la cadena que se muestra en un idioma. |
| **Cambio explícito de idioma** | El visitante activa el selector de idioma. No incluye llegar a una URL que ya trae un idioma. |

## 4. Requisitos

### 4.1 Idiomas

| ID | Requisito |
| --- | --- |
| I18N-R01 | Los idiomas del sitio son los de `LOCALES` (TSC §4.3): español (`es`) e inglés (`en`). El idioma de respaldo es el inglés (F-20). |
| I18N-R02 | `src/shared/i18n/locales.ts` DEBE exportar `LOCALE_META` con los datos siguientes. Es la única fuente de estos valores. |
| I18N-R03 | El español del sitio es el de Colombia y el inglés el de Estados Unidos, en ortografía, formato de cifras y vocabulario. |

```ts
// src/shared/i18n/locales.ts
export interface LocaleMeta {
  /** Nombre del idioma escrito en ese idioma. */
  readonly nativeName: string;
  /** Código corto que muestra el selector de idioma. */
  readonly shortCode: string;
  /** Valor de los atributos `lang` y `hreflang`. */
  readonly htmlLang: string;
  /** Etiqueta BCP 47 que usan los formateadores. */
  readonly intlTag: string;
  /** Valor de `og:locale`. */
  readonly ogLocale: string;
}

export const LOCALE_META = {
  es: { nativeName: "Español", shortCode: "ES", htmlLang: "es", intlTag: "es-CO", ogLocale: "es_CO" },
  en: { nativeName: "English", shortCode: "EN", htmlLang: "en", intlTag: "en-US", ogLocale: "en_US" },
} as const satisfies Record<Locale, LocaleMeta>;
```

### 4.2 Dónde vive cada texto

| ID | Requisito |
| --- | --- |
| I18N-R04 | Todo texto que ve o escucha el visitante vive en uno de los lugares de la tabla siguiente y en ningún otro. |
| I18N-R05 | Los componentes de React NO DEBEN contener texto visible escrito a mano: ni como contenido de un elemento ni como valor de `aria-label`, `aria-description`, `aria-roledescription`, `aria-valuetext`, `title`, `alt` o `placeholder`. Se exceptúan los signos de puntuación sueltos usados como separadores y `alt=""`. |
| I18N-R06 | El registro de arranque está solo en inglés (D-10) y no forma parte de los diccionarios por idioma. |
| I18N-R07 | El diccionario de interfaz NO DEBE contener contenido del perfil. Los textos de sección NO DEBEN contener cadenas de interfaz. |

| Tipo de texto | Dónde vive | Quién lo define |
| --- | --- | --- |
| Contenido de una sección | `content/es.ts` y `content/en.ts` del feature de la sección | La spec de la sección |
| Nombres de las secciones y de las piezas de hardware | `meta` de los textos de cada sección | VSN §4 |
| Interfaz de un feature de armazón | Su espacio de nombres en el diccionario de interfaz | La spec del feature |
| Interfaz transversal | Espacio de nombres `common` | Esta spec (§4.3.1) |
| Página 404 y página de entrada `/` | Espacios de nombres `notFound` y `languageGate` | Esta spec (§4.3.2) |
| Título y descripción del sitio | Espacio de nombres `site` | SMP |
| Nombre de cada idioma | `LOCALE_META` | Esta spec (§4.1) |
| Registro de arranque | `bootLines` de cada sección y líneas fijas del arranque | TSC-R27 y BOOT |

### 4.3 Diccionario de interfaz

| ID | Requisito |
| --- | --- |
| I18N-R08 | El diccionario de interfaz vive en `src/shared/i18n/dictionaries/en.ts` y `src/shared/i18n/dictionaries/es.ts`. El de inglés es la referencia de tipo: `export type UiDictionary = typeof en`. El de español se declara como `export const es: UiDictionary = { … }`, de modo que una clave que falte, sobre o tenga otro tipo no compile. |
| I18N-R09 | El primer nivel del diccionario son exactamente estos espacios de nombres: `common`, `site`, `languageGate`, `notFound`, `boot`, `scene`, `panel`, `settings` y `simpleView`. |
| I18N-R10 | Las claves están en `camelCase` y describen la función de la cadena, no su texto (`closeLabel`, no `cerrar`). Terminan con uno de los sufijos de la tabla siguiente. |
| I18N-R11 | Un valor del diccionario es una cadena o una función pura que recibe un único objeto de parámetros con nombre y devuelve una cadena. Las funciones no devuelven JSX. |
| I18N-R12 | Para el plural, las funciones distinguen únicamente entre `count === 1` y el resto, que es lo que necesitan el español y el inglés. |
| I18N-R13 | `src/shared/i18n/` DEBE exportar `getUiDictionary(locale: Locale): UiDictionary` para componentes de servidor, y los hooks `useLocale(): Locale` y `useUiDictionary(): UiDictionary` para componentes de cliente. Los hooks obtienen el idioma del segmento `[locale]` de la ruta. |
| I18N-R14 | Un componente de servidor que renderiza un componente de cliente le pasa como propiedades las cadenas ya resueltas que necesite, o deja que el componente de cliente use `useUiDictionary`. NO DEBEN pasarse funciones del diccionario como propiedades de un componente de servidor a uno de cliente. |
| I18N-R15 | Toda función del diccionario DEBE tener una prueba unitaria con su resultado esperado en ambos idiomas, incluido el caso singular si recibe un contador. |

| Sufijo | Uso |
| --- | --- |
| `Label` | Texto visible de un control |
| `AriaLabel` | Nombre accesible de un control sin texto visible |
| `Title` | Título o encabezado |
| `Description` | Texto explicativo |
| `Hint` | Indicación breve complementaria, visible o solo para lectores de pantalla |
| `Announcement` | Mensaje para una región viva de accesibilidad |
| Sin sufijo | Palabra o expresión que se inserta dentro de otra (por ejemplo `present`) |

#### 4.3.1 Espacio de nombres `common`

| Clave | Español | Inglés |
| --- | --- | --- |
| `skipToContentLabel` | Saltar al contenido | Skip to content |
| `opensInNewTabHint` | se abre en una pestaña nueva | opens in a new tab |
| `privateRepositoryLabel` | Repositorio privado | Private repository |
| `present` | actualidad | present |
| `individualWorkLabel` | Trabajo individual | Individual work |
| `teamOfLabel({ count })` | Equipo de {count} | Team of {count} |
| `languageLabel` | Idioma | Language |
| `visitedSectionsLabel({ count, total })` | {count} de {total} secciones visitadas | {count} of {total} sections visited |
| `downloadCvLabel` | Descargar CV (PDF) | Download résumé (PDF) |
| `copyLabel` | Copiar | Copy |
| `copiedAnnouncement` | Copiado | Copied |

`opensInNewTabHint` acompaña a todo enlace externo como texto solo para lectores de pantalla, entre paréntesis, a continuación del texto del enlace (SYS-R40).

#### 4.3.2 Espacios de nombres `languageGate` y `notFound`

Estas dos páginas no pertenecen a ningún idioma (SYS-R22). Muestran sus textos en los dos idiomas, cada bloque marcado con su atributo `lang`, con el inglés primero.

| Clave | Español | Inglés |
| --- | --- | --- |
| `languageGate.title` | Juan Esteban Álvarez García — Portfolio | Juan Esteban Álvarez García — Portfolio |
| `languageGate.continueLabel` | Continuar en español | Continue in English |
| `notFound.title` | Página no encontrada | Page not found |
| `notFound.description` | La dirección que abriste no existe en este sitio. | The address you opened does not exist on this site. |
| `notFound.homeLabel` | Ir al portfolio | Go to the portfolio |

`languageGate.title` es idéntico en ambos idiomas por ser un nombre propio; es una excepción registrada a la comprobación de cadenas sin traducir (§4.10).

### 4.4 Formateadores

| ID | Requisito |
| --- | --- |
| I18N-R16 | `src/shared/i18n/format.ts` DEBE exportar las funciones siguientes, de las que se muestra solo la firma. Son puras: no leen la fecha ni la zona horaria del sistema. |
| I18N-R17 | Los nombres abreviados de los meses son los de la tabla siguiente y NO se obtienen de `Intl`, cuyo resultado varía entre entornos. |
| I18N-R18 | `formatPeriod` produce exactamente los resultados de la tabla de ejemplos, según estas reglas: (1) si inicio y fin son iguales, se muestra una sola fecha; (2) si el fin es `"present"`, se usa `common.present`; (3) si ambos extremos tienen mes y el mismo año, el año se escribe una sola vez, al final; (4) en otro caso se escriben ambos extremos completos. El separador es un espacio de no separación (U+00A0), una raya corta (U+2013) y un espacio normal. |
| I18N-R19 | En español, el mes inicial de la cadena se escribe con mayúscula inicial y los demás en minúscula. En inglés, todos los meses llevan mayúscula inicial. |
| I18N-R20 | `formatDecimal` usa `Intl.NumberFormat` con el `intlTag` del idioma y exactamente `fractionDigits` decimales: coma decimal en español y punto en inglés. |
| I18N-R21 | Toda fecha que se muestra se renderiza dentro de un elemento `<time>` cuyo atributo `dateTime` es el resultado de `toIsoDate`. `src/shared/ui/` ofrece un componente `PeriodText` que lo hace para un `Period`; las secciones lo usan en lugar de llamar a `formatPeriod` directamente. |

```ts
// src/shared/i18n/format.ts
export function formatPartialDate(
  date: PartialDate,
  locale: Locale,
  options?: { readonly capitalize?: boolean },
): string;
export function formatPeriod(period: Period, locale: Locale): string;
/** "2024-07" si hay mes; "2024" si no. */
export function toIsoDate(date: PartialDate): string;
export function formatDecimal(value: number, locale: Locale, fractionDigits: number): string;
/** 1 → `common.individualWorkLabel`; n → `common.teamOfLabel({ count: n })`. */
export function formatTeamSize(size: TeamSize, locale: Locale): string;
```

| Mes | Español | Inglés | Mes | Español | Inglés |
| --- | --- | --- | --- | --- | --- |
| 1 | ene. | Jan. | 7 | jul. | Jul. |
| 2 | feb. | Feb. | 8 | ago. | Aug. |
| 3 | mar. | Mar. | 9 | sep. | Sep. |
| 4 | abr. | Apr. | 10 | oct. | Oct. |
| 5 | may. | May | 11 | nov. | Nov. |
| 6 | jun. | Jun. | 12 | dic. | Dec. |

En la tabla siguiente, `␣` representa el espacio de no separación.

| Entrada | Español | Inglés |
| --- | --- | --- |
| `formatPeriod` de julio de 2024 a enero de 2025 | `Jul. 2024␣– ene. 2025` | `Jul. 2024␣– Jan. 2025` |
| `formatPeriod` de febrero de 2025 a julio de 2025 | `Feb.␣– jul. 2025` | `Feb.␣– Jul. 2025` |
| `formatPeriod` de enero de 2026 a `"present"` | `Ene. 2026␣– actualidad` | `Jan. 2026␣– present` |
| `formatPeriod` de 2022 a 2024, sin mes | `2022␣– 2024` | `2022␣– 2024` |
| `formatPeriod` de mayo de 2025 a mayo de 2025 | `May. 2025` | `May 2025` |
| `formatPeriod` de 2027 a 2027, sin mes | `2027` | `2027` |
| `formatPartialDate` de junio de 2021 | `jun. 2021` | `Jun. 2021` |
| `formatPartialDate` de junio de 2021 con `capitalize` | `Jun. 2021` | `Jun. 2021` |
| `toIsoDate` de julio de 2024; de 2027 sin mes | `2024-07`; `2027` | `2024-07`; `2027` |
| `formatDecimal(4.2, …, 1)` | `4,2` | `4.2` |
| `formatDecimal(5, …, 1)` | `5,0` | `5.0` |
| `formatTeamSize(1, …)` | `Trabajo individual` | `Individual work` |
| `formatTeamSize(6, …)` | `Equipo de 6` | `Team of 6` |

### 4.5 Cambio de idioma y rutas

| ID | Requisito |
| --- | --- |
| I18N-R22 | El idioma de una página lo decide únicamente el segmento `{locale}` de su URL (SYS-R25). |
| I18N-R23 | Fuera de `/` (SYS-R08), el sitio NO DEBE redirigir según el idioma del navegador ni según la preferencia guardada: quien abre `/en/projects/` ve la página en inglés aunque su navegador esté en español. |
| I18N-R24 | El selector de idioma ofrece cada idioma como un enlace a `withLocale(rutaActual, idioma)` (TSC §4.10), conservando el fragmento de la URL si lo hay. Así se mantienen la vista y la sección: de `/es/projects/#projects-habicapital` se pasa a `/en/projects/#projects-habicapital`. |
| I18N-R25 | Cada opción del selector tiene como nombre accesible el `nativeName` de su idioma, lleva los atributos `lang` y `hrefLang` de ese idioma, y la del idioma activo se marca con `aria-current="true"` y no navega. |
| I18N-R26 | Un cambio explícito de idioma guarda la preferencia con `setLocale` (TSC §4.9) antes de navegar. Llegar a una URL con idioma no modifica la preferencia. |
| I18N-R27 | Tras un cambio explícito de idioma: el atributo `lang` de `<html>` y el título del documento corresponden al nuevo idioma; la sección abierta sigue abierta; la secuencia de arranque no se repite; las secciones visitadas se conservan; y el foco de teclado queda en el selector de idioma. |

### 4.6 Metadatos por idioma

SMP implementa estos requisitos; aquí se fija qué deben cumplir.

| ID | Requisito |
| --- | --- |
| I18N-R28 | Cada página de `/{locale}/…` declara como canónica su propia URL absoluta. |
| I18N-R29 | Cada página de `/{locale}/…` declara una alternativa `hreflang` por cada idioma, apuntando a la misma vista y sección en ese idioma, y una alternativa `x-default` que apunta a la versión en el idioma de respaldo. |
| I18N-R30 | Cada página declara `og:locale` con el `ogLocale` de su idioma y `og:locale:alternate` con el de los demás. |
| I18N-R31 | El título y la descripción de cada página están en el idioma de la página. El sitemap lista todas las páginas de todos los idiomas con sus alternativas. |

### 4.7 Idioma de las partes

| ID | Requisito |
| --- | --- |
| I18N-R32 | Todo fragmento de texto en un idioma distinto al de la página DEBE estar dentro de un elemento con el atributo `lang` de ese fragmento (WCAG 3.1.2). |
| I18N-R33 | En particular: el registro de arranque lleva `lang="en"` en todas las páginas; cada opción del selector de idioma lleva el `lang` de su idioma; y los bloques en español de las páginas `/` y 404 llevan `lang="es"`. |
| I18N-R34 | Quedan exentos de I18N-R32 los nombres propios, los nombres de tecnologías y productos, las siglas y los anglicismos de uso corriente en el español técnico que lista §4.8. |

### 4.8 Reglas de traducción y estilo

| ID | Requisito |
| --- | --- |
| I18N-R35 | **Equivalencia.** Ambos idiomas transmiten los mismos hechos, en el mismo orden y con el mismo número de elementos. Ningún dato aparece en un solo idioma. |
| I18N-R36 | **Fuente.** Para el contenido que ya figura en los CVs actualizados, la redacción de cada idioma parte de la del CV en ese idioma. El contenido nuevo se redacta en ambos idiomas a la vez; no se traduce de forma literal. |
| I18N-R37 | **Voz del contenido.** En español, primera persona del singular ("Diseñé", "Acompaño"). En inglés, primera persona implícita sin pronombre ("Designed", "Support"). Es el registro de los CVs. |
| I18N-R38 | **Voz de la interfaz.** En español, infinitivos y sustantivos ("Cerrar", "Descargar CV"). En inglés, imperativos y sustantivos ("Close", "Download CV"). La interfaz no se dirige al visitante de "tú" ni de "usted". |
| I18N-R39 | **Mayúsculas.** Títulos, etiquetas y botones usan mayúscula solo en la primera palabra y en los nombres propios, en ambos idiomas ("Stack tecnológico", "Tech stack"). El inglés no usa mayúsculas de título. Las mayúsculas sostenidas se aplican solo por CSS (VIS-R09). |
| I18N-R40 | **Cifras.** Coma decimal en español y punto en inglés. En español, el símbolo de porcentaje va separado de la cifra por un espacio de no separación ("94 %"); en inglés va unido ("94%"). |
| I18N-R41 | **Signos.** Raya corta (–) para intervalos; puntos suspensivos como un solo carácter (…); comillas tipográficas dobles (“ ”) y apóstrofo tipográfico (’) en ambos idiomas. El español abre las interrogaciones y exclamaciones (¿ ¡). |
| I18N-R42 | **Lo que no se traduce.** Nombres propios de personas, instituciones, proyectos, productos y tecnologías; siglas; y títulos oficiales que solo existen en un idioma. |
| I18N-R43 | **Anglicismos.** El texto en español conserva, sin cursiva, los términos técnicos que usan los CVs y el habla del sector: *backend*, *frontend*, *fullstack*, *freelance*, *stack*, *cloud*, *setup*, *homelab*, *plugin*, *ricing* y *gaming*. No se inventan traducciones para ellos. |
| I18N-R44 | **Términos fijos.** Los términos de la tabla siguiente se traducen siempre igual. Los nombres de secciones y piezas de hardware son los de VSN §4. |

| Español | Inglés |
| --- | --- |
| Ingeniería de Sistemas y Computación | Systems and Computing Engineering |
| Universidad de los Andes | Universidad de los Andes (no se traduce) |
| Hochschule München | Hochschule München (no se traduce) |
| Promedio | GPA |
| Intercambio académico | Academic exchange |
| Tesis | Thesis |
| Monitor académico | Teaching Assistant |
| Desarrollador freelance | Freelance Software Developer |
| Tutor particular de programación | Private Programming Tutor |
| Mejor proyecto de su sección | Best Project in its section |
| Hall de la Fama | Hall of Fame |
| Repositorio privado | Private repository |
| Trabajo individual | Individual work |
| Equipo de N | Team of N |
| Tiempo completo | Full-time |
| Vista simple | Simple view |

### 4.9 Añadir un idioma

| ID | Requisito |
| --- | --- |
| I18N-R45 | Añadir un idioma DEBE consistir exactamente en los pasos siguientes y NO DEBE requerir cambios en componentes de React, en features de armazón ni en la estructura de rutas (V2-02). |

1. Añadir el código a `LOCALES` en `src/shared/contracts/locale.ts`. A partir de aquí el compilador señala cada lugar incompleto.
2. Añadir su entrada en `LOCALE_META` (§4.1).
3. Crear su diccionario de interfaz en `src/shared/i18n/dictionaries/` y registrarlo en `getUiDictionary`.
4. Crear `content/<código>.ts` en cada feature de sección y añadirlo al `text` de su definición.
5. Añadir sus nombres de mes y sus reglas de mayúsculas en `format.ts`, con sus filas en las tablas de §4.4.
6. Añadir el CV en PDF de ese idioma (ver IO).
7. Revisar la regla de redirección de `/` (SYS-R08), que hoy solo distingue español e inglés, y actualizar SYS si procede.
8. Actualizar VSN §4 con los nombres de secciones y piezas en el nuevo idioma, y la tabla de términos fijos de §4.8.

Las rutas, el sitemap, las alternativas `hreflang` y el selector de idioma se generan a partir de `LOCALES` y no necesitan cambios.

### 4.10 Cumplimiento

| ID | Requisito |
| --- | --- |
| I18N-R46 | ESLint DEBE aplicar a los archivos `.tsx` de `src/` (salvo pruebas) la regla `react/jsx-no-literals` con `noStrings: true` e `ignoreProps: true`, permitiendo únicamente estas cadenas: `·`, `–`, `—`, `/`, `:`, `(`, `)`, `,`, `.` y `+`. |
| I18N-R47 | Una prueba de arquitectura DEBE fallar si algún archivo `.tsx` de `src/` (salvo pruebas) asigna una cadena literal no vacía a `aria-label`, `aria-description`, `aria-roledescription`, `aria-valuetext`, `title`, `alt` o `placeholder`. |
| I18N-R48 | Las reglas C2, C3, C5 y C12 de TSC §4.8 se aplican también a las cadenas de los dos diccionarios de interfaz, y la regla C4 a cada par de cadenas con la misma clave. Las excepciones a C4 y C5 se registran igual que en TSC-R46. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| I18N-AC01 | `LOCALE_META` contiene exactamente los valores de §4.1 para cada idioma de `LOCALES`. | Prueba unitaria |
| I18N-AC02 | Un diccionario de español al que le falta una clave, le sobra una o tiene una de otro tipo no compila. | Prueba unitaria (archivo de tipos comprobado por `pnpm typecheck`) |
| I18N-AC03 | El primer nivel de ambos diccionarios son exactamente los nueve espacios de nombres de I18N-R09, y los espacios `common`, `languageGate` y `notFound` contienen las cadenas de §4.3.1 y §4.3.2. | Prueba unitaria |
| I18N-AC04 | Los formateadores devuelven, carácter a carácter, los resultados de la tabla de ejemplos de §4.4, incluido el espacio de no separación. | Prueba unitaria |
| I18N-AC05 | Los formateadores dan el mismo resultado con la zona horaria del proceso puesta en `America/Bogota`, `UTC` y `Asia/Tokyo`. | Prueba unitaria |
| I18N-AC06 | Toda función de los diccionarios tiene una prueba con su resultado en ambos idiomas; `teamOfLabel({ count: 6 })` devuelve "Equipo de 6" y "Team of 6". | Prueba unitaria |
| I18N-AC07 | Las cadenas de ambos diccionarios cumplen las reglas de I18N-R48. | Prueba unitaria |
| I18N-AC08 | ESLint marca un texto escrito a mano dentro de un elemento JSX y no marca los separadores permitidos. | Prueba unitaria que ejecuta ESLint sobre fragmentos de ejemplo |
| I18N-AC09 | Ningún archivo `.tsx` de `src/` incumple I18N-R47. La función de detección marca cada uno de los siete atributos en un caso de ejemplo y no marca `alt=""`. | Prueba de arquitectura |
| I18N-AC10 | Con `navigator.languages = ["es-CO"]`, abrir directamente `/en/projects/` muestra la página en inglés y la URL no cambia. | Prueba E2E |
| I18N-AC11 | En `/es/projects/#projects-habicapital`, activar la opción de inglés del selector lleva a `/en/projects/#projects-habicapital`, con el panel de Proyectos abierto. | Prueba E2E |
| I18N-AC12 | Tras ese cambio: `document.documentElement.lang` es `en`, el título del documento está en inglés, el arranque no se muestra, el display de diagnóstico conserva su valor y el elemento con foco es el selector de idioma. | Prueba E2E |
| I18N-AC13 | Tras un cambio explícito a inglés, abrir `/` lleva a `/en/` aunque `navigator.languages` sea `["es-CO"]`. Abrir directamente una URL en inglés, sin usar el selector, no produce ese efecto. | Prueba E2E |
| I18N-AC14 | Cada opción del selector tiene como nombre accesible "Español" o "English", sus atributos `lang` y `hrefLang`, y la del idioma activo tiene `aria-current="true"`. | Prueba E2E |
| I18N-AC15 | En el HTML exportado, cada página de `/{locale}/…` tiene: canónica propia, una alternativa `hreflang` por idioma más `x-default` apuntando a la versión en inglés, y `og:locale` con su alternativa. | Prueba de exportación |
| I18N-AC16 | En `/es/`, el contenedor del registro de arranque tiene `lang="en"`. En las páginas `/` y 404, cada bloque en español tiene `lang="es"`. | Prueba E2E |
| I18N-AC17 | El análisis automático de accesibilidad no encuentra infracciones de las reglas de idioma (`html-has-lang`, `html-lang-valid`, `valid-lang`) en ninguna página. | Prueba E2E con axe |
| I18N-AC18 | El autor revisa ambos idiomas de cada sección y confirma que cumplen I18N-R35 a I18N-R44. | Revisión manual del autor, por sección, registrada en el historial de la spec de la sección |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Diccionarios TypeScript propios, sin librería** (D-16). | Con dos idiomas, contenido estático y exportación sin servidor, una librería de i18n aporta carga en el cliente y una capa de configuración a cambio de funciones que aquí resuelve el compilador: la paridad de claves es un error de tipos y las cadenas con parámetros son funciones tipadas. |
| **El inglés como referencia de tipo del diccionario** (I18N-R08, D-42). | Derivar el tipo de un diccionario evita mantener una interfaz aparte. Se elige el inglés por ser el idioma del código y el de respaldo; no implica que se escriba primero. |
| **Diccionario de interfaz centralizado, con un espacio de nombres por feature.** | Las cadenas de interfaz son pocas y cortas; un solo archivo por idioma permite revisar la traducción completa de una vez. El contenido, que es largo, sí vive con su sección. |
| **Abreviaturas de mes propias en lugar de `Intl`** (I18N-R17). | `Intl` devuelve, por ejemplo, "ene de 2026" en español, y su salida depende de la versión de los datos de idioma del entorno. Una tabla fija da el formato de los CVs y pruebas deterministas. |
| **Las fechas y las cifras son hechos que se formatean** (§4.4). | Escritas dentro de cada traducción podrían divergir. Como hechos se escriben una vez y el formato por idioma queda centralizado y probado. |
| **Sin redirección automática fuera de `/`** (I18N-R23, D-41). | Un enlace compartido debe mostrar lo que vio quien lo compartió. Redirigir por el idioma del navegador rompe esa expectativa y confunde a los buscadores. |
| **`x-default` apunta a la versión en inglés.** | Es el idioma de respaldo del sitio (F-20) y existe para todas las páginas; la página `/` solo equivale al inicio. |
| **El selector de idioma son enlaces** (I18N-R24). | Funcionan sin JavaScript, los buscadores los siguen y permiten abrir el otro idioma en una pestaña nueva. |
| **Regla de lint para el texto de los elementos y prueba de arquitectura para los atributos** (§4.10). | La regla `react/jsx-no-literals` detecta el texto dentro de los elementos; aplicada a los atributos marcaría también `className`. La prueba de arquitectura cubre los atributos que el visitante percibe. Comprobado el 2026-10-12 con la configuración del proyecto. |
| **Reglas de estilo escritas** (§4.8). | Sin ellas, cada sección acabaría con su propio criterio de mayúsculas, signos y persona gramatical, y la revisión de traducciones sería una discusión de gustos. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.2 | Cabecera: se retira la marca de enmienda pendiente; el autor confirmó el 2026-10-13 que todas las enmiendas están aprobadas. Sin cambio de requisitos. |
| 2026-10-12 | 1.2 | Confirmada por el autor el 2026-10-12. `common` gana `downloadCvLabel`, `copyLabel` y `copiedAnnouncement`, que usan varias secciones y la vista simple. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
| 2026-10-12 | 1.1 | Confirmada por el autor el 2026-10-12. §4.3.1: se añaden a `common` las claves `languageLabel` y `visitedSectionsLabel`, que usan dos o más features de armazón. |
