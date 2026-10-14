# SCN — Escena de la placa madre

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la vista interactiva: la imagen de la placa madre con sus zonas pulsables, las auras, las etiquetas que identifican cada pieza, el display que cuenta las secciones visitadas y el comportamiento con teclado y lector de pantalla.

## 2. Alcance

**Incluye:** el escenario y sus capas, los datos de las zonas interactivas, el área pulsable, los estados del aura, las etiquetas, el orden de foco, el display de diagnóstico, la placa de identidad, la bienvenida, la carga de la imagen y la superposición de calibración.

**No incluye:** la imagen en sí y su encuadre (ver AST), el aspecto del aura y de las etiquetas (ver VIS §4.4 y VIS §4.5.1), el panel que se abre (ver PNL), la barra fija y el menú de ajustes (ver SET), ni la composición de la capa de escena (ver SYS §4.13).

Feature: `src/features/motherboard-scene/`. `index.ts` exporta el componente de cliente `Scene`; `server.ts` exporta el componente de servidor `ScenePoster`.

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Zona** | Cada uno de los nueve objetos de `SCENE_OBJECT_IDS` (TSC §4.3) con su polígono calibrado. |
| **Zona de sección** | Las siete zonas que abren una sección (`ComponentId`). |
| **Silueta** | El polígono que sigue el contorno visible del objeto; sobre él se dibuja el aura. |
| **Área pulsable** | La región que responde al puntero. Es la silueta, o un rectángulo mayor si la silueta es demasiado pequeña. |
| **Caja** | El menor rectángulo, alineado con los ejes, que contiene un polígono. |

## 4. Requisitos

### 4.1 Estructura

| ID | Requisito |
| --- | --- |
| SCN-R01 | `Scene` renderiza un **escenario** con la geometría de AST-R03 y, dentro de él, estas capas de abajo arriba: (1) la imagen de la variante activa (§4.12); (2) el viñeteado de AST-R48; (3) un SVG decorativo con las auras y el display de diagnóstico; (4) las zonas pulsables, como elementos HTML; (5) las etiquetas. Fuera del escenario, el fondo es el de la variante (AST-R03). |
| SCN-R02 | El SVG decorativo usa `viewBox="0 0 1600 900"`, ocupa todo el escenario, lleva `aria-hidden="true"` y no recibe eventos de puntero. |
| SCN-R03 | La capa de escena contiene un `<h1>` visible solo para lectores de pantalla con el texto `scene.pageTitle` (QLT-R03), y el contenido de la escena está dentro de un `<main>` con `id="scene"`, que es el destino del enlace de salto en modo `scene` (SYS-R46). El `<h1>` lleva `tabindex="-1"` para recibir el foco al terminar el arranque (BOOT-R21). |
| SCN-R04 | `ScenePoster` es un componente de servidor que renderiza, para cada variante, un bloque con el tamaño del escenario que tiene como fondo el color medio y el marcador de posición desenfocado de su entrada en `SCENE_ASSETS`. Solo es visible el de la variante que indica `data-scene` (variantes `scene-photo` y `scene-sketch`, SYS-R50). Es lo que se ve bajo el arranque, o en su lugar cuando no hay arranque, hasta que `Scene` se monta. No solicita ningún archivo. |
| SCN-R05 | `Scene` recibe por propiedades (SYS-R49) la lista `sections: readonly SectionNavItem[]`, los datos de la placa de identidad `identity: SceneIdentity` (SCN-R52), el idioma y las cadenas de interfaz que necesita. NO DEBE importar el registro (STR-R32). |

```ts
// src/shared/contracts/navigation.ts
import type { ComponentId, SectionSlug } from "./ids";

/** Datos serializables de una sección para los componentes de cliente (SYS-R49). */
export interface SectionNavItem {
  readonly slug: SectionSlug;
  readonly componentId: ComponentId;
  /** `meta.title` en el idioma de la página. */
  readonly title: string;
  /** `meta.hardwareName` en el idioma de la página. */
  readonly hardwareName: string;
  /** Ruta de la sección en el idioma de la página. */
  readonly href: string;
  /** `true` para las seis secciones primarias. */
  readonly isPrimary: boolean;
}

/** Datos de la placa de identidad de la escena, resueltos para el idioma de la página (SCN-R46). */
export interface SceneIdentity {
  readonly name: string;
  readonly degree: string;
  readonly focusAreas: readonly string[];
}
```

| ID | Requisito |
| --- | --- |
| SCN-R06 | `buildSectionNav(sections: readonly AnySectionDefinition[], locale: Locale): readonly SectionNavItem[]`, en `src/shared/lib/section-nav.ts`, es una función pura que construye esa lista en el orden recibido. El layout del grupo `(scene)` la llama con `SECTION_LIST` y pasa el resultado a `SceneLayer`. |
| SCN-R52 | `buildSceneIdentity(name: string, profile: { readonly degree: string; readonly focusAreas: readonly string[] }): SceneIdentity`, en `src/shared/lib/section-nav.ts`, es una función pura que construye los datos de la placa. El layout del grupo `(scene)` la llama con `SITE.authorName` y los textos de Perfil del idioma de la página, y pasa el resultado a `SceneLayer`, que lo entrega a `Scene`. |

### 4.2 Datos de las zonas

| ID | Requisito |
| --- | --- |
| SCN-R07 | Los datos de calibración (AST §4.8) viven en `src/features/motherboard-scene/hotspots.ts`, con la forma siguiente. |
| SCN-R08 | Cada silueta tiene entre 4 y 24 vértices, todos dentro de la zona segura (AST-R05), y no se cruza a sí misma. |
| SCN-R09 | `HOTSPOTS_CALIBRATED_FOR` registra, para cada variante, la versión del máster con el que se comprobaron los polígonos (AST-R41). |
| SCN-R10 | `validateHotspots`, función pura de `src/features/motherboard-scene/lib/`, devuelve la lista de incumplimientos de SCN-R08, de los tamaños mínimos de AST §4.4, de la separación de AST-R11, de las regiones reservadas de AST-R47, AST-R55 y AST-R56 y del solapamiento entre áreas pulsables (SCN-R13). Una prueba afirma que, con los datos reales, la lista está vacía. |

```ts
// src/features/motherboard-scene/types.ts
import type { SceneObjectId } from "@/shared/contracts/ids";

export interface ScenePoint {
  readonly x: number;
  readonly y: number;
}

/** Lado de la zona junto al que se coloca su etiqueta. */
export type LabelPlacement = "top" | "right" | "bottom" | "left";

export interface Hotspot {
  readonly id: SceneObjectId;
  /** Silueta en el espacio de escena (AST §4.2). */
  readonly polygon: readonly ScenePoint[];
  readonly labelPlacement: LabelPlacement;
  /**
   * Desplazamiento de la etiqueta a lo largo de su lado, en unidades de escena: hacia la derecha
   * con `top` y `bottom`, hacia abajo con `left` y `right`. La calibración lo usa para separar
   * las etiquetas entre sí (SCN-R28).
   */
  readonly labelShift?: number;
}
```

```ts
// src/features/motherboard-scene/hotspots.ts
export const HOTSPOTS_CALIBRATED_FOR: Readonly<Record<SceneVariant, string>> = {
  photo: "dc169b385cc7",
  sketch: "b71cba0939ff",
};
export const HOTSPOTS: Readonly<Record<SceneObjectId, Hotspot>> = {
  /* una entrada por cada SceneObjectId, trazada en la calibración */
};
```

### 4.3 Zonas pulsables

| ID | Requisito |
| --- | --- |
| SCN-R11 | Cada zona de sección es un enlace nativo (`<a>`, mediante el componente `Link`) a la ruta de su sección (`SectionNavItem.href`). La zona `settings` es un `<button>` que alterna el menú de ajustes con `toggleSettings` del store de interfaz (TSC §4.9), con `aria-haspopup="dialog"` y `aria-expanded`. La zona `post-display` no es interactiva (§4.6). |
| SCN-R12 | Las ocho zonas interactivas aparecen en el DOM, y por tanto en el orden de tabulación, en el orden de QLT-R07: `cpu`, `psu`, `ssd`, `ram`, `io`, `fan`, `cmos`, `settings`. |
| SCN-R13 | El **área pulsable** de una zona es su silueta. Si la caja de la silueta mide menos de 69 unidades en alguna dimensión (AST §4.2), el área pulsable es esa caja ampliada de forma centrada hasta 69 unidades en esa dimensión. Si la ampliación invadiera el área pulsable de otra zona, se recorta en el punto medio entre ambas siluetas. Las áreas pulsables de dos zonas nunca se solapan. La calcula `computeHitArea`, función pura de `lib/`. |
| SCN-R14 | Cada elemento pulsable se posiciona sobre la caja de su área pulsable, en porcentajes del escenario, y recorta su forma al área pulsable con `clip-path`, de modo que el puntero solo lo active dentro de ella. |
| SCN-R15 | El nombre accesible de cada zona de sección es el texto `scene.hotspotName({ hardwareName, title })`, renderizado dentro del enlace como texto visible solo para lectores de pantalla (QLT-R23). El de `settings` es `scene.hotspotName` con `scene.settingsHardwareName` y `scene.settingsTitle`. |
| SCN-R16 | La zona cuya sección está abierta lleva `aria-current="page"`. Qué sección está abierta se obtiene de la URL con `parsePath` (TSC §4.10). |
| SCN-R17 | Pulsar fuera de toda zona no hace nada. |
| SCN-R45 | Con el foco en una de las ocho zonas interactivas, las flechas del teclado lo llevan a la zona interactiva más cercana en esa dirección, medida entre los centros de las cajas de sus siluetas. Para cada zona se calcula el **avance** (distancia en la dirección de la flecha) y el **desvío** (distancia perpendicular). Se descartan las zonas con avance nulo o negativo; entre las que quedan a 45° o menos de la dirección (desvío no mayor que el avance) se elige la de menor `avance + 2 × desvío`, y si no hay ninguna, la de menor valor entre todas las demás. Si no queda ninguna, el foco no se mueve. Con una tecla modificadora pulsada las flechas no actúan, y la página no se desplaza al usarlas. El orden de tabulación no cambia (SCN-R12). |

### 4.4 Aura y foco

| ID | Requisito |
| --- | --- |
| SCN-R18 | El SVG decorativo dibuja un aura por cada una de las ocho zonas interactivas, sobre su silueta, con la composición y los valores de VIS §4.4 y el color de aura de la variante activa (VIS-R44). Las seis primarias usan los valores "primaria"; `cmos` y `settings`, los de "secundaria". La zona `post-display` no tiene aura. |
| SCN-R19 | El estado de cada aura es: **activo** si su sección está abierta o, para `settings`, si el menú de ajustes está abierto; **hover o foco** si el puntero está sobre su área pulsable o el elemento tiene foco de teclado; **reposo** en otro caso. |
| SCN-R20 | La respiración del aura (VIS-R16) empieza cuando `data-boot` pasa a `done`, o al montarse la escena si ya lo estaba. |
| SCN-R21 | El elemento pulsable no puede mostrar un contorno propio, porque `clip-path` lo recortaría. En su lugar, cuando una zona tiene foco de teclado (`:focus-visible`), el SVG decorativo dibuja un rectángulo sin relleno alrededor de la caja de su área pulsable, separado 4 unidades de ella, con un trazo de 2 px, en el color de aura de la variante, que no escala con el escenario. Equivale al anillo de foco de VIS-R31. |

### 4.5 Etiquetas

| ID | Requisito |
| --- | --- |
| SCN-R22 | Cada zona interactiva tiene una etiqueta con el aspecto de VIS-R21 y dos líneas: el nombre de la pieza (`hardwareName`) y el nombre de la sección (`title`). Para `settings`: `scene.settingsHardwareName` y `scene.settingsTitle`. |
| SCN-R23 | La etiqueta se muestra mientras el puntero está sobre el área pulsable de su zona o sobre la propia etiqueta, o mientras la zona tiene foco de teclado. Al salir el puntero, se oculta tras 150 ms, salvo que en ese tiempo vuelva a entrar en la zona o en la etiqueta. Usa la animación M-05. |
| SCN-R24 | Pulsar Esc mientras una etiqueta es visible la oculta sin mover el puntero ni el foco. No vuelve a mostrarse hasta que el puntero salga y entre de nuevo o el foco cambie (QLT-R12). |
| SCN-R25 | En dispositivos sin hover (`(hover: none)`), las ocho etiquetas están siempre visibles. Para que quepan a la vez, ahí miden 128 px de ancho como máximo y su texto salta de línea (VIS-R21). |
| SCN-R26 | La etiqueta se coloca junto al lado de la caja del área pulsable que indica `labelPlacement`, a 12 unidades, centrada respecto a ese lado y desplazada a lo largo de él lo que indique `labelShift`. Si así se saliera del escenario, se desplaza lo necesario para quedar dentro, con 8 px de margen. La posición la calcula `labelPosition`, función pura de `lib/`, a partir del tamaño medido de la etiqueta y del escenario. |
| SCN-R27 | Las etiquetas llevan `aria-hidden="true"`: su información ya está en el nombre accesible de la zona. |
| SCN-R28 | La calibración elige cada `labelPlacement` de modo que, con las ocho etiquetas visibles a la vez a 1024×768 px, ninguna tape otra etiqueta ni el área pulsable de otra zona. |

### 4.6 Display de diagnóstico

| ID | Requisito |
| --- | --- |
| SCN-R29 | Sobre la zona `post-display`, el SVG decorativo dibuja dos dígitos de siete segmentos que muestran, con cero a la izquierda, cuántas secciones primarias se han visitado en la sesión: de `00` a `06`. Los segmentos encendidos van en el color de display de la variante (VIS-R44: `boot-ok` en la fotografía e `ink` en el boceto); los apagados, en ese mismo color con opacidad 0,08. Los dígitos ocupan la caja de la zona con un margen interior del 12 %. Bajo los dígitos se dibuja un rectángulo del color de fondo del display de la variante (VIS-R44), que deja a la vista el marco del display: es transparente en la fotografía y `paper` en el boceto, cuya imagen trae dibujado el contorno de los segmentos (AST-R51) y hacía ilegibles los dígitos. |
| SCN-R30 | El valor es la longitud de `visited` en el store de sesión (TSC §4.9). Antes de hidratar se muestra `00`. Al cambiar, se ejecuta la animación M-09. |
| SCN-R31 | La capa de escena contiene una región con `role="status"`, visible solo para lectores de pantalla, con el texto `common.visitedSectionsLabel({ count, total: 6 })`. Se actualiza al cambiar el valor (QLT-R24). |
| SCN-R32 | Al pasar el puntero sobre la zona `post-display` se muestra una etiqueta con `scene.postDisplayName` y `common.visitedSectionsLabel`, con las reglas de SCN-R23 a SCN-R27. La zona no es enfocable; el mismo dato está en el menú de ajustes (ver SET), alcanzable con teclado. |

### 4.7 Placa de identidad y bienvenida

| ID | Requisito |
| --- | --- |
| SCN-R33 | Retirado el 2026-10-14 (D-83): la pista inicial se sustituye por la bienvenida (SCN-R48 a SCN-R51). |
| SCN-R34 | Retirado el 2026-10-14 (D-83), junto con SCN-R33. |
| SCN-R46 | **Placa de identidad.** `Scene` muestra siempre, en la esquina superior izquierda del escenario, a 16 px de sus bordes superior e izquierdo y en la capa `z-bar`, una placa oscura (VIS §4.5.1) con relleno de 8 px en vertical y 12 px en horizontal, de 300 px de ancho como máximo y 112 px de alto como máximo (AST-R55). Contiene tres líneas, en este orden: el nombre del autor, con el rol tipográfico "Etiqueta de escena, línea de nombre" en `on-dark`; `degree`, con el rol "Etiqueta de escena, línea de contenido" en `on-dark-muted`; y los `focusAreas` unidos por " · ", con ese mismo rol en `on-dark`, que pueden ocupar hasta tres renglones. Los datos llegan por propiedades como `SceneIdentity` (SCN-R05) y proceden de `SITE.authorName` y de los textos de Perfil (CPU-R03, F-29). |
| SCN-R47 | La placa no es interactiva, no es enfocable, no recibe eventos de puntero y no es un encabezado: el `<h1>` sigue siendo el de SCN-R03. Está en el DOM justo después del `<h1>`, de modo que un lector de pantalla la lee a continuación. No se muestra mientras `data-boot` no es `done`. No cambia con la variante de escena (VIS §4.1.5). |
| SCN-R48 | **Bienvenida.** Se muestra cuando se cumplen a la vez: el store de sesión está hidratado, `welcomeSeen` es `false` (TSC §4.9), `data-boot` es `done`, no hay ninguna sección abierta y el menú de ajustes está cerrado. Por tanto aparece al terminar el arranque de una primera visita, también si se saltó; si la primera página es una sección, aparece al cerrarla; y vuelve tras un reinicio de sesión. |
| SCN-R49 | Es una `<section>` con `aria-labelledby` hacia su título, en la parte inferior central del escenario, a 16 px del borde inferior, con ancho `min(380px, 100% - 32px)` y 192 px de alto como máximo (AST-R56), en la capa `z-labels`. Es una placa oscura (VIS §4.5.1) con relleno de 16 px. Contiene, en este orden: el título `scene.welcomeTitle` como `<h2>`, con el rol "Etiqueta de escena, línea de nombre" en `on-dark`; el texto `scene.welcomeDescription`, con el rol "Cuerpo secundario" en `on-dark`; y una fila con un `<button>` con el texto `scene.exploreLabel` y un enlace a `sectionPath(locale, "profile")` con el texto `scene.profileLinkLabel`, ambos con el estilo "Botón sobre superficie oscura" (VIS-R29) y 44 px de alto. Aparece y se retira con la animación M-12. Sin sonido. |
| SCN-R50 | La bienvenida se cierra, y se llama a `markWelcomeSeen()`, cuando: el visitante activa "Explorar"; pulsa Esc con el foco dentro de ella; o, mientras es visible, se abre una sección por cualquier medio (una zona, "Ver mi perfil" o la URL) o se abre el menú de ajustes. Si el foco estaba dentro de ella cuando se cierra con "Explorar" o con Esc, pasa a la zona `cpu`, la primera del orden de tabulación de la escena (QLT-R08). No se cierra sola por tiempo (QLT-R21). |
| SCN-R51 | Al aparecer no toma el foco ni es una región viva: no interrumpe al lector de pantalla, que la encuentra después del `<h1>` y de la placa. En el orden de tabulación sus dos controles van después de la barra fija y antes de las zonas (QLT-R07), porque en el DOM está entre la placa y las zonas. Mientras es visible, las zonas que no tapa siguen respondiendo al puntero y al teclado. |

### 4.8 Imagen y disponibilidad

| ID | Requisito |
| --- | --- |
| SCN-R35 | La imagen de la variante activa se renderiza con el elemento `<picture>` de AST-R37, con `alt=""` (QLT-R16), `width` y `height` del máster, `decoding="async"` y `fetchpriority="high"`. Los tres formatos se ofrecen como elementos `<source>` y el `<img>` no lleva `src` ni `srcset`: la escena se crea desde JavaScript, y WebKit empieza a descargar el `src` de una imagen en cuanto se le asigna, antes de que esté dentro de su `<picture>`, con lo que Safari descargaría el JPEG además del AVIF. Aparece con la animación M-11 cuando termina de decodificarse; hasta entonces se ve `ScenePoster`. |
| SCN-R36 | En modo `scene`, el script previo al pintado (SYS-R51) inserta en `<head>` un `<link rel="preload" as="image">` para la imagen de la variante activa, con `imagesrcset` e `imagesizes` equivalentes a los del `<picture>` y el tipo `image/avif`. Así la descarga empieza antes de que cargue el JavaScript, nunca ocurre en modo `simple` y nunca incluye la otra variante. |
| SCN-R37 | `Scene` registra la marca `scene:ready` (QLT-R31) la primera vez que se cumplen a la vez dos condiciones: la imagen está decodificada y `data-boot` es `done`. |
| SCN-R38 | Cuando la URL pasa de una sección al inicio y ningún elemento de la escena tiene el foco, `Scene` enfoca la zona de la sección que se acaba de cerrar (QLT-R08). |
| SCN-R39 | Las zonas no responden al puntero ni al teclado mientras `data-boot` no es `done` (BOOT-R20). |

### 4.9 Sonido

| ID | Requisito |
| --- | --- |
| SCN-R40 | La escena no reproduce sonidos al pasar el puntero. Los sonidos de abrir y cerrar pertenecen al panel (ver PNL) y los del menú de ajustes, a SET. |

### 4.10 Superposición de calibración

| ID | Requisito |
| --- | --- |
| SCN-R41 | La superposición de AST-R42 es un componente de `motherboard-scene` que solo se importa, de forma dinámica, cuando `process.env.NODE_ENV` es `development` y la URL contiene `?debug=hotspots`. Dibuja, en el SVG: la silueta y el identificador de cada zona, la caja de su área pulsable, la zona segura, las regiones reservadas de AST-R47, AST-R55 y AST-R56 y una cuadrícula cada 100 unidades con sus coordenadas. Muestra además las coordenadas del puntero en unidades de escena. |

### 4.11 Textos de interfaz

Espacio de nombres `scene` del diccionario de interfaz.

| Clave | Español | Inglés |
| --- | --- | --- |
| `pageTitle` | Juan Esteban Álvarez García: portfolio interactivo | Juan Esteban Álvarez García: interactive portfolio |
| `hotspotName({ hardwareName, title })` | {hardwareName}: {title} | {hardwareName}: {title} |
| `settingsHardwareName` | Panel frontal | Front panel |
| `settingsTitle` | Ajustes | Settings |
| `postDisplayName` | Display de diagnóstico | Diagnostic display |
| `welcomeTitle` | Sistema listo | System ready |
| `welcomeDescription` | Te doy la bienvenida a mi portfolio. Navega por los componentes de la placa para conocer sobre mí y lo que puedo hacer por ti. | Welcome to my portfolio. Explore the components on the board to learn about me and what I can do for you. |
| `exploreLabel` | Explorar | Explore |
| `profileLinkLabel` | Ver mi perfil | See my profile |

Identificadores de prueba: `data-testid="scene-root"` en el escenario, `data-testid="post-display"` en el grupo SVG del display, `data-testid="scene-label"` en cada etiqueta, `data-testid="scene-plate"` en la placa de identidad, `data-testid="scene-welcome"` en la bienvenida, `data-testid="scene-auras"` en el SVG decorativo, `data-testid="scene-poster"` en el póster y `data-testid="calibration-overlay"` en la superposición de calibración.

Además, estos atributos exponen a las pruebas el estado que de otro modo solo estaría en las clases: `data-zone` (identificador de la zona, en cada elemento pulsable) y, en la zona `settings`, `data-label-placement` con su lado, que el menú de ajustes lee para colocarse (SET-R10); `data-aura` y `data-state` (`rest`, `hover` o `active`) en el grupo de cada aura, y `data-part` (`glow`, `fill` o `focus-ring`) en sus partes; `data-visible` en cada etiqueta y en la bienvenida; `data-value` en el display, con sus dos dígitos; y `data-variant` y `data-state` (`pending`, `shown`, `kept` o `replaced`) en cada imagen.

### 4.12 Variante de escena

| ID | Requisito |
| --- | --- |
| SCN-R42 | La variante activa es `sceneVariant` del store de preferencias (TSC §4.9). Hasta que el store se hidrata, es la que indica `data-scene` en `<html>`, que escribe el script previo al pintado (SYS-R51): la primera imagen que se solicita ya es la de la variante guardada. |
| SCN-R43 | Cuando cambia la variante, `Scene` actualiza `data-scene`, solicita la imagen de la nueva variante y la muestra, con la animación M-11, cuando termina de decodificarse; hasta entonces sigue visible la anterior. Las zonas, las etiquetas, el orden de tabulación y el foco no cambian. |
| SCN-R44 | Dependen de la variante únicamente: la imagen y su marcador de posición, el color del aura y del rectángulo de foco, el color de fondo de las franjas y del viñeteado, y el color del display de diagnóstico (VIS-R44). Todo lo demás es idéntico en las dos. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SCN-AC01 | `buildSectionNav` devuelve, para cada idioma, siete elementos en orden canónico con el título, el nombre de pieza y la ruta de cada sección, e `isPrimary` verdadero solo en los seis primeros. | Prueba unitaria |
| SCN-AC02 | `validateHotspots(HOTSPOTS)` devuelve una lista vacía, y cada versión de `HOTSPOTS_CALIBRATED_FOR` coincide con la de su variante en `SCENE_ASSETS` (AST-AC17). | Prueba unitaria |
| SCN-AC03 | Para cada regla de SCN-R10, `validateHotspots` marca un caso de ejemplo que la incumple. | Prueba unitaria |
| SCN-AC04 | `computeHitArea` devuelve la silueta cuando su caja mide 69 unidades o más en ambas dimensiones; una caja ampliada y centrada cuando no; y, con dos siluetas pequeñas separadas 20 unidades, dos áreas que no se solapan. | Prueba unitaria |
| SCN-AC05 | En `desktop`, la escena tiene siete enlaces y un botón con los nombres accesibles de SCN-R15, en el orden de SCN-R12; cada enlace apunta a la ruta de su sección. | Prueba E2E |
| SCN-AC06 | En `desktop`, hacer clic en el centro de la caja de cada zona de sección lleva a la URL de su sección; hacer clic en un punto del escenario fuera de toda zona no cambia la URL. | Prueba E2E |
| SCN-AC07 | Con el foco en la zona `cpu`: su etiqueta es visible y contiene "Procesador (CPU)" y "Perfil" en `/es/`, y "Processor (CPU)" y "Profile" en `/en/`; el aura está en los valores de hover de VIS §4.4; y el SVG muestra el rectángulo de foco de SCN-R21. | Prueba E2E |
| SCN-AC08 | Al pasar el puntero sobre una zona aparece su etiqueta; al llevarlo sobre la etiqueta, sigue visible; Esc la oculta sin mover el puntero; al sacar el puntero de ambas, desaparece. | Prueba E2E |
| SCN-AC09 | Con la emulación de un dispositivo sin hover a 1024×768 px, las ocho etiquetas son visibles, todas quedan dentro del escenario y ninguna caja de etiqueta se solapa con otra. | Prueba E2E, solo en Chromium, que es el único motor que emula un dispositivo sin hover |
| SCN-AC10 | El display muestra `00` en una sesión nueva; tras abrir y cerrar Perfil y Proyectos muestra `02`; abrir Perfil otra vez no cambia el valor; abrir "Acerca de este sitio" tampoco. La región de estado contiene "2 de 6 secciones visitadas" en `/es/`. | Prueba E2E |
| SCN-AC11 | Retirado el 2026-10-14 (D-83): la pista ya no existe. La sustituyen SCN-AC21 a SCN-AC24. | Revisión manual del autor: criterio retirado, sin comprobación |
| SCN-AC12 | En `desktop`, en una primera visita, se solicita exactamente un archivo de la imagen de la escena y es un derivado AVIF de la variante `photo`; en `mobile` no se solicita ninguno (SYS-R16). | Prueba E2E, solo en Chromium |
| SCN-AC13 | En cada viewport de modo `scene` de QLT §4.6, la caja del escenario tiene relación 16:9 con un error menor de 1 px, está centrada y no supera el viewport (AST-AC12). | Prueba E2E |
| SCN-AC14 | Al cerrar el panel de Proyectos abierto por URL directa, el elemento con foco es la zona `ssd`. | Prueba E2E |
| SCN-AC15 | El sitio exportado no contiene el código de la superposición de calibración: ningún archivo de `out/` contiene la cadena `debug=hotspots` (AST-AC18). | Prueba de exportación |
| SCN-AC16 | La imagen tiene `alt=""`; el SVG decorativo y las etiquetas tienen `aria-hidden="true"`. | Prueba de componente |
| SCN-AC17 | El autor completa la calibración con la superposición, sobre las dos variantes, y confirma AST-AC10 a AST-AC12, AST-AC20 y SCN-R28. | Revisión manual del autor, registrada en `PROVENANCE.md` y en el historial de esta spec |
| SCN-AC18 | En `desktop`, tras elegir "Boceto" en los ajustes: `<html>` tiene `data-scene="sketch"`, la imagen visible es un derivado de la variante `sketch`, el halo del aura de `cpu` tiene el color `aura-sketch`, y el enlace de la zona `cpu` conserva su posición, su tamaño y su nombre accesible. Tras recargar la página, todo ello se mantiene. | Prueba E2E |
| SCN-AC19 | La función de navegación con flechas, sobre zonas de ejemplo, elige la más cercana dentro de los 45°, recurre al semiplano cuando no hay ninguna en ese ángulo y devuelve nada cuando no hay zona en esa dirección. | Prueba unitaria |
| SCN-AC20 | En `desktop`, con el foco en `cpu`, la flecha derecha lleva el foco a `ram`, la izquierda desde `ram` lo devuelve a `cpu`, la flecha abajo desde `cpu` lo lleva a `ssd` y la flecha abajo desde `fan` a `settings`; cada pieza enfocada muestra su etiqueta, y la página no se desplaza. | Prueba E2E |
| SCN-AC21 | En `desktop`, al terminar el arranque, la placa de identidad muestra "Juan Esteban Álvarez García", "Ingeniería de Sistemas y Computación" y las cuatro áreas de enfoque en `/es/`, y "Systems and Computing Engineering" con sus áreas en inglés en `/en/`; no contiene ningún elemento enfocable; y en cada viewport de modo `scene` de QLT §4.6 su caja no se solapa con la de ninguna zona interactiva ni con la barra fija. Durante el arranque no es visible. | Prueba E2E |
| SCN-AC22 | En una sesión nueva, al terminar el arranque, la bienvenida es visible con "Sistema listo" y su texto, y el foco no está dentro de ella. Desde el último control de la barra fija, el tabulador recorre "Explorar", "Ver mi perfil" y después la zona `cpu`. | Prueba E2E |
| SCN-AC23 | Activar "Explorar" oculta la bienvenida y deja el foco en la zona `cpu`; tras recargar la página no vuelve a mostrarse y `sessionStorage` tiene `welcomeSeen: true`. En otra sesión nueva: Esc con el foco en "Explorar" la oculta; abrir una sección mientras es visible la oculta y no reaparece al cerrarla; y tras un reinicio de sesión vuelve a mostrarse al terminar el arranque. Abrir directamente `/es/projects/` en una sesión nueva no la muestra hasta cerrar el panel. | Prueba E2E |
| SCN-AC24 | En cada viewport de modo `scene` de QLT §4.6, la caja de la bienvenida no se solapa con la de ninguna de las ocho zonas interactivas, y su alto no supera 192 px. | Prueba E2E |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Flechas espaciales además del tabulador** (SCN-R45, D-81). | El tabulador sigue el orden canónico, que es predecible y coincide con la vista simple (QLT-R07). Las flechas responden a la posición de las piezas en la imagen, que es lo que el visitante ve: pedirlas fue una decisión del autor tras probar el sitio con teclado. La preferencia por el cono de 45° evita que una flecha salte a una pieza casi lateral. |
| **Zonas como enlaces HTML recortados, y auras en un SVG aparte** (SCN-R11, SCN-R14). | Un enlace nativo da gratis el foco, la activación con teclado, el nombre accesible, "abrir en pestaña nueva" y la navegación del lado del cliente. El SVG queda como dibujo puro, sin semántica. Recortar el enlace a la silueta hace que el puntero responda a la forma real de la pieza. |
| **Área pulsable mínima de 44 px con la escala más pequeña** (SCN-R13). | La pila CMOS y el panel I/O son estrechos. Ampliar solo el área que responde, no el aura, cumple el tamaño mínimo sin falsear la silueta. |
| **Etiqueta con nombre de pieza y de sección** (D-25, SCN-R22). | Quien no sabe de hardware lee "SSD NVMe" y debajo "Proyectos": aprende qué es la pieza y qué va a encontrar. |
| **Etiquetas siempre visibles sin hover** (SCN-R25). | En una tableta no hay forma de "pasar por encima"; sin esto las piezas serían anónimas. |
| **Display de dos dígitos, no interactivo** (D-23). | Informa del progreso sin añadir otro control. El texto equivalente llega a los lectores de pantalla por la región de estado y a todos por el menú de ajustes. |
| **Placa de identidad y bienvenida en lugar de la pista** (SCN-R46 a SCN-R51, D-83). | La pista explicaba el mecanismo, pero no quién era el autor: el nombre solo existía para lectores de pantalla. La placa responde a quién y se queda; la bienvenida responde a qué hacer y se va en cuanto el visitante empieza, sin bloquear la escena ni robar el foco (P1, P2). Un reclutador entiende en segundos de quién es el sitio y cómo se usa. La frase se dirige al visitante porque así lo pidió el autor (I18N-R38). |
| **Precarga de la imagen condicionada por la consulta de medios** (SCN-R36). | La descarga empieza con el HTML, en paralelo al JavaScript, y un teléfono nunca la inicia. |
| **La variante se resuelve antes del primer pintado** (SCN-R36, SCN-R42). | Quien eligió el boceto no debe ver un fotograma de la fotografía ni descargarla. El script previo al pintado ya lee las preferencias para decidir el modo, así que fija también la variante e inicia la descarga de la imagen correcta. Por eso la precarga deja de ser una etiqueta estática, que no puede depender de una preferencia. |
| **Rectángulo de foco dibujado en el SVG** (SCN-R21). | Es la única forma de mostrar un anillo alrededor de un elemento recortado con `clip-path`. Usa la caja y no la silueta porque un rectángulo se percibe como foco de forma inequívoca. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 2.0 | Estado: pasa a "Implementada" al cerrar M12, con todos sus criterios automáticos citados por una prueba (TST-R38): la placa de identidad, la bienvenida (SCN-AC21 a SCN-AC24) y las tres reservas en `validateHotspots` y en la superposición (SCN-AC02, SCN-AC03). Sin cambio de requisitos. |
| 2026-10-14 | 2.0 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 2.0 | Versión 2, pendiente de aprobación del autor (D-83, D-89). §4.7: se retiran la pista inicial (SCN-R33 y SCN-R34) y su criterio SCN-AC11; nuevos SCN-R46 y SCN-R47 (placa de identidad) y SCN-R48 a SCN-R51 (bienvenida). SCN-R05 y nuevo SCN-R52: `SceneIdentity` llega por propiedades. SCN-R10 y SCN-R41: las reservas de AST-R55 y AST-R56. §4.11: textos de la bienvenida en lugar de `hintLabel`, e identificadores de prueba. Nuevos SCN-AC21 a SCN-AC24. |
| 2026-10-13 | 1.7 | Por decisión del autor (D-81), tras probar la escena con teclado: las flechas mueven el foco entre las piezas según su posición en la imagen. Nuevo SCN-R45 y criterios SCN-AC19 y SCN-AC20. |
| 2026-10-13 | 1.6 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). SCN-AC17 quedó confirmado por el autor en la versión 1.4. Sin cambio de requisitos respecto a la fila anterior. |
| 2026-10-13 | 1.6 | Por indicación del autor al revisar las imágenes (D-76). SCN-R29: fondo bajo los dígitos del display, visible en el boceto. |
| 2026-10-13 | 1.5 | Durante M7, por delegación del autor. SCN-R03: el `<h1>` es enfocable por programa. SCN-R33: cómo se detecta el reinicio de sesión. §4.11: `data-label-placement` en la zona `settings`. La geometría del escenario pasa a `src/shared/ui/stage.styles.ts`, porque la usan también la barra fija y el póster. |
| 2026-10-13 | 1.4 | SCN-AC17: el autor revisó la calibración con la superposición, sobre las dos variantes, y la posición de las etiquetas, dentro de su revisión conjunta de M2 a M5, y la aprobó. Sin cambios en los requisitos. |
| 2026-10-13 | 1.3 | Por decisión del autor al revisar M5 (D-71): el aura es un halo sin línea de contorno (VIS 2.5). SCN-AC18 y §4.11 dejan de nombrar el trazo. |
| 2026-10-13 | 1.2 | Durante M5, por delegación del autor (D-69). SCN-R07 y SCN-R26: nuevo `Hotspot.labelShift`, porque ocho etiquetas centradas no caben a 1024×768 px. SCN-R25: sin hover, las etiquetas miden 128 px como máximo. SCN-R33: la pista queda a 8 px del borde y no a 24, para no tapar el display de diagnóstico. SCN-R03: `id` del `<main>`. SCN-R35: los tres formatos de la imagen son `<source>` y el `<img>` no lleva `src`, tras comprobar en WebKit que con `src` se descargaban dos archivos. §4.11: nuevos identificadores y atributos de prueba. SCN-AC09: solo en Chromium. Calibración trazada sobre las dos variantes; pendiente la revisión del autor (SCN-AC17). |
| 2026-10-13 | 1.1 | Por decisión del autor (D-66). Nuevo §4.12 (SCN-R42 a SCN-R44): variante de escena. SCN-R04, R09, R18, R21, R29 y R35 pasan a depender de la variante; SCN-R36: la precarga la inserta el script previo al pintado. SCN-AC02, AC12 y AC17 adaptados; nuevo SCN-AC18. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
