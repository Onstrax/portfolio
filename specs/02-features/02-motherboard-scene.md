# SCN — Escena de la placa madre

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.0 |
| Última actualización | 2026-10-12 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la vista interactiva: la imagen de la placa madre con sus zonas pulsables, las auras, las etiquetas que identifican cada pieza, el display que cuenta las secciones visitadas y el comportamiento con teclado y lector de pantalla.

## 2. Alcance

**Incluye:** el escenario y sus capas, los datos de las zonas interactivas, el área pulsable, los estados del aura, las etiquetas, el orden de foco, el display de diagnóstico, la pista inicial, la carga de la imagen y la superposición de calibración.

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
| SCN-R01 | `Scene` renderiza un **escenario** con la geometría de AST-R03 y, dentro de él, estas capas de abajo arriba: (1) la imagen; (2) el viñeteado de AST-R48; (3) un SVG decorativo con las auras y el display de diagnóstico; (4) las zonas pulsables, como elementos HTML; (5) las etiquetas. Fuera del escenario, el fondo es `void`. |
| SCN-R02 | El SVG decorativo usa `viewBox="0 0 1600 900"`, ocupa todo el escenario, lleva `aria-hidden="true"` y no recibe eventos de puntero. |
| SCN-R03 | La capa de escena contiene un `<h1>` visible solo para lectores de pantalla con el texto `scene.pageTitle` (QLT-R03), y el contenido de la escena está dentro de un `<main>`. |
| SCN-R04 | `ScenePoster` es un componente de servidor que renderiza un bloque con el tamaño del escenario, el color medio y el marcador de posición desenfocado de `SCENE_ASSET.placeholder` como fondo. Es lo que se ve bajo el arranque, o en su lugar cuando no hay arranque, hasta que `Scene` se monta. No solicita ningún archivo. |
| SCN-R05 | `Scene` recibe por propiedades (SYS-R49) la lista `sections: readonly SectionNavItem[]`, el idioma y las cadenas de interfaz que necesita. NO DEBE importar el registro (STR-R32). |

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
```

| ID | Requisito |
| --- | --- |
| SCN-R06 | `buildSectionNav(sections: readonly AnySectionDefinition[], locale: Locale): readonly SectionNavItem[]`, en `src/shared/lib/section-nav.ts`, es una función pura que construye esa lista en el orden recibido. El layout del grupo `(scene)` la llama con `SECTION_LIST` y pasa el resultado a `SceneLayer`. |

### 4.2 Datos de las zonas

| ID | Requisito |
| --- | --- |
| SCN-R07 | Los datos de calibración (AST §4.8) viven en `src/features/motherboard-scene/hotspots.ts`, con la forma siguiente. |
| SCN-R08 | Cada silueta tiene entre 4 y 24 vértices, todos dentro de la zona segura (AST-R05), y no se cruza a sí misma. |
| SCN-R09 | `HOTSPOTS_CALIBRATED_FOR` es la versión del máster sobre el que se trazaron los polígonos (AST-R41). |
| SCN-R10 | `validateHotspots`, función pura de `src/features/motherboard-scene/lib/`, devuelve la lista de incumplimientos de SCN-R08, de los tamaños mínimos de AST §4.4, de la separación de AST-R11, de la región reservada de AST-R47 y del solapamiento entre áreas pulsables (SCN-R13). Una prueba afirma que, con los datos reales, la lista está vacía. |

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
}
```

```ts
// src/features/motherboard-scene/hotspots.ts
export const HOTSPOTS_CALIBRATED_FOR = "dc169b385cc7";
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

### 4.4 Aura y foco

| ID | Requisito |
| --- | --- |
| SCN-R18 | El SVG decorativo dibuja un aura por cada una de las ocho zonas interactivas, sobre su silueta, con la composición y los valores de VIS §4.4. Las seis primarias usan los valores "primaria"; `cmos` y `settings`, los de "secundaria". La zona `post-display` no tiene aura. |
| SCN-R19 | El estado de cada aura es: **activo** si su sección está abierta o, para `settings`, si el menú de ajustes está abierto; **hover o foco** si el puntero está sobre su área pulsable o el elemento tiene foco de teclado; **reposo** en otro caso. |
| SCN-R20 | La respiración del aura (VIS-R16) empieza cuando `data-boot` pasa a `done`, o al montarse la escena si ya lo estaba. |
| SCN-R21 | El elemento pulsable no puede mostrar un contorno propio, porque `clip-path` lo recortaría. En su lugar, cuando una zona tiene foco de teclado (`:focus-visible`), el SVG decorativo dibuja un rectángulo sin relleno alrededor de la caja de su área pulsable, separado 4 unidades de ella, con un trazo de 2 px en `aura` que no escala con el escenario. Equivale al anillo de foco de VIS-R31. |

### 4.5 Etiquetas

| ID | Requisito |
| --- | --- |
| SCN-R22 | Cada zona interactiva tiene una etiqueta con el aspecto de VIS-R21 y dos líneas: el nombre de la pieza (`hardwareName`) y el nombre de la sección (`title`). Para `settings`: `scene.settingsHardwareName` y `scene.settingsTitle`. |
| SCN-R23 | La etiqueta se muestra mientras el puntero está sobre el área pulsable de su zona o sobre la propia etiqueta, o mientras la zona tiene foco de teclado. Al salir el puntero, se oculta tras 150 ms, salvo que en ese tiempo vuelva a entrar en la zona o en la etiqueta. Usa la animación M-05. |
| SCN-R24 | Pulsar Esc mientras una etiqueta es visible la oculta sin mover el puntero ni el foco. No vuelve a mostrarse hasta que el puntero salga y entre de nuevo o el foco cambie (QLT-R12). |
| SCN-R25 | En dispositivos sin hover (`(hover: none)`), las ocho etiquetas están siempre visibles. |
| SCN-R26 | La etiqueta se coloca junto al lado de la caja del área pulsable que indica `labelPlacement`, a 12 unidades, centrada respecto a ese lado. Si así se saliera del escenario, se desplaza lo necesario para quedar dentro, con 8 px de margen. |
| SCN-R27 | Las etiquetas llevan `aria-hidden="true"`: su información ya está en el nombre accesible de la zona. |
| SCN-R28 | La calibración elige cada `labelPlacement` de modo que, con las ocho etiquetas visibles a la vez a 1024×768 px, ninguna tape otra etiqueta ni el área pulsable de otra zona. |

### 4.6 Display de diagnóstico

| ID | Requisito |
| --- | --- |
| SCN-R29 | Sobre la zona `post-display`, el SVG decorativo dibuja dos dígitos de siete segmentos que muestran, con cero a la izquierda, cuántas secciones primarias se han visitado en la sesión: de `00` a `06`. Los segmentos encendidos van en `boot-ok`; los apagados, en `boot-ok` con opacidad 0,08. Los dígitos ocupan la caja de la zona con un margen interior del 12 %. |
| SCN-R30 | El valor es la longitud de `visited` en el store de sesión (TSC §4.9). Antes de hidratar se muestra `00`. Al cambiar, se ejecuta la animación M-09. |
| SCN-R31 | La capa de escena contiene una región con `role="status"`, visible solo para lectores de pantalla, con el texto `common.visitedSectionsLabel({ count, total: 6 })`. Se actualiza al cambiar el valor (QLT-R24). |
| SCN-R32 | Al pasar el puntero sobre la zona `post-display` se muestra una etiqueta con `scene.postDisplayName` y `common.visitedSectionsLabel`, con las reglas de SCN-R23 a SCN-R27. La zona no es enfocable; el mismo dato está en el menú de ajustes (ver SET), alcanzable con teclado. |

### 4.7 Pista inicial

| ID | Requisito |
| --- | --- |
| SCN-R33 | Mientras `visited` está vacío y no hay ninguna sección abierta, se muestra en la parte inferior central del escenario, a 24 px del borde, una placa oscura (VIS §4.5.1) con el texto `scene.hintLabel`. Desaparece al abrir la primera sección y no vuelve a mostrarse hasta un reinicio de sesión. Usa la animación M-12. |
| SCN-R34 | La pista no es interactiva, no recibe eventos de puntero y forma parte del contenido legible por lectores de pantalla. |

### 4.8 Imagen y disponibilidad

| ID | Requisito |
| --- | --- |
| SCN-R35 | La imagen se renderiza con el elemento `<picture>` de AST-R37, con `alt=""` (QLT-R16), `width` y `height` del máster, `decoding="async"` y `fetchpriority="high"`. Aparece con la animación M-11 cuando termina de decodificarse; hasta entonces se ve `ScenePoster`. |
| SCN-R36 | El layout del grupo `(scene)` incluye en `<head>` un `<link rel="preload" as="image">` para la imagen, con `imagesrcset` e `imagesizes` equivalentes a los del `<picture>`, el tipo `image/avif` y el atributo `media` igual a la consulta de SYS-R12, de modo que la descarga empiece antes de que cargue el JavaScript y nunca en modo `simple`. |
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
| SCN-R41 | La superposición de AST-R42 es un componente de `motherboard-scene` que solo se importa, de forma dinámica, cuando `process.env.NODE_ENV` es `development` y la URL contiene `?debug=hotspots`. Dibuja, en el SVG: la silueta y el identificador de cada zona, la caja de su área pulsable, la zona segura, la región reservada de AST-R47 y una cuadrícula cada 100 unidades con sus coordenadas. Muestra además las coordenadas del puntero en unidades de escena. |

### 4.11 Textos de interfaz

Espacio de nombres `scene` del diccionario de interfaz.

| Clave | Español | Inglés |
| --- | --- | --- |
| `pageTitle` | Juan Esteban Álvarez García: portfolio interactivo | Juan Esteban Álvarez García: interactive portfolio |
| `hotspotName({ hardwareName, title })` | {hardwareName}: {title} | {hardwareName}: {title} |
| `settingsHardwareName` | Panel frontal | Front panel |
| `settingsTitle` | Ajustes | Settings |
| `postDisplayName` | Display de diagnóstico | Diagnostic display |
| `hintLabel` | Cada componente iluminado abre una sección. | Each glowing component opens a section. |

Identificadores de prueba: `data-testid="scene-root"` en el escenario, `data-testid="post-display"` en el grupo SVG del display y `data-testid="scene-label"` en cada etiqueta.

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SCN-AC01 | `buildSectionNav` devuelve, para cada idioma, siete elementos en orden canónico con el título, el nombre de pieza y la ruta de cada sección, e `isPrimary` verdadero solo en los seis primeros. | Prueba unitaria |
| SCN-AC02 | `validateHotspots(HOTSPOTS)` devuelve una lista vacía, y `HOTSPOTS_CALIBRATED_FOR` coincide con `SCENE_ASSET.version` (AST-AC17). | Prueba unitaria |
| SCN-AC03 | Para cada regla de SCN-R10, `validateHotspots` marca un caso de ejemplo que la incumple. | Prueba unitaria |
| SCN-AC04 | `computeHitArea` devuelve la silueta cuando su caja mide 69 unidades o más en ambas dimensiones; una caja ampliada y centrada cuando no; y, con dos siluetas pequeñas separadas 20 unidades, dos áreas que no se solapan. | Prueba unitaria |
| SCN-AC05 | En `desktop`, la escena tiene siete enlaces y un botón con los nombres accesibles de SCN-R15, en el orden de SCN-R12; cada enlace apunta a la ruta de su sección. | Prueba E2E |
| SCN-AC06 | En `desktop`, hacer clic en el centro de la caja de cada zona de sección lleva a la URL de su sección; hacer clic en un punto del escenario fuera de toda zona no cambia la URL. | Prueba E2E |
| SCN-AC07 | Con el foco en la zona `cpu`: su etiqueta es visible y contiene "Procesador (CPU)" y "Perfil" en `/es/`, y "Processor (CPU)" y "Profile" en `/en/`; el aura está en los valores de hover de VIS §4.4; y el SVG muestra el rectángulo de foco de SCN-R21. | Prueba E2E |
| SCN-AC08 | Al pasar el puntero sobre una zona aparece su etiqueta; al llevarlo sobre la etiqueta, sigue visible; Esc la oculta sin mover el puntero; al sacar el puntero de ambas, desaparece. | Prueba E2E |
| SCN-AC09 | Con la emulación de un dispositivo sin hover a 1024×768 px, las ocho etiquetas son visibles, todas quedan dentro del escenario y ninguna caja de etiqueta se solapa con otra. | Prueba E2E |
| SCN-AC10 | El display muestra `00` en una sesión nueva; tras abrir y cerrar Perfil y Proyectos muestra `02`; abrir Perfil otra vez no cambia el valor; abrir "Acerca de este sitio" tampoco. La región de estado contiene "2 de 6 secciones visitadas" en `/es/`. | Prueba E2E |
| SCN-AC11 | La pista inicial es visible en una sesión nueva con el texto de `scene.hintLabel`, y deja de serlo tras abrir una sección, también después de cerrarla. | Prueba E2E |
| SCN-AC12 | En `desktop` se solicita exactamente un archivo de la imagen de la escena y es un derivado AVIF; en `mobile` no se solicita ninguno (SYS-R16). | Prueba E2E, solo en Chromium |
| SCN-AC13 | En cada viewport de modo `scene` de QLT §4.6, la caja del escenario tiene relación 16:9 con un error menor de 1 px, está centrada y no supera el viewport (AST-AC12). | Prueba E2E |
| SCN-AC14 | Al cerrar el panel de Proyectos abierto por URL directa, el elemento con foco es la zona `ssd`. | Prueba E2E |
| SCN-AC15 | El sitio exportado no contiene el código de la superposición de calibración: ningún archivo de `out/` contiene la cadena `debug=hotspots` (AST-AC18). | Prueba de exportación |
| SCN-AC16 | La imagen tiene `alt=""`; el SVG decorativo y las etiquetas tienen `aria-hidden="true"`. | Prueba de componente |
| SCN-AC17 | El autor completa la calibración con la superposición y confirma AST-AC10 a AST-AC12 y SCN-R28. | Revisión manual del autor, registrada en `PROVENANCE.md` y en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Zonas como enlaces HTML recortados, y auras en un SVG aparte** (SCN-R11, SCN-R14). | Un enlace nativo da gratis el foco, la activación con teclado, el nombre accesible, "abrir en pestaña nueva" y la navegación del lado del cliente. El SVG queda como dibujo puro, sin semántica. Recortar el enlace a la silueta hace que el puntero responda a la forma real de la pieza. |
| **Área pulsable mínima de 44 px con la escala más pequeña** (SCN-R13). | La pila CMOS y el panel I/O son estrechos. Ampliar solo el área que responde, no el aura, cumple el tamaño mínimo sin falsear la silueta. |
| **Etiqueta con nombre de pieza y de sección** (D-25, SCN-R22). | Quien no sabe de hardware lee "SSD NVMe" y debajo "Proyectos": aprende qué es la pieza y qué va a encontrar. |
| **Etiquetas siempre visibles sin hover** (SCN-R25). | En una tableta no hay forma de "pasar por encima"; sin esto las piezas serían anónimas. |
| **Display de dos dígitos, no interactivo** (D-23). | Informa del progreso sin añadir otro control. El texto equivalente llega a los lectores de pantalla por la región de estado y a todos por el menú de ajustes. |
| **Pista inicial** (SCN-R33). | El aura sugiere que algo se puede pulsar, pero una frase lo confirma a quien no lo intuye. Desaparece en cuanto cumple su función. |
| **Precarga de la imagen condicionada por la consulta de medios** (SCN-R36). | La descarga empieza con el HTML, en paralelo al JavaScript, y un teléfono nunca la inicia. |
| **Rectángulo de foco dibujado en el SVG** (SCN-R21). | Es la única forma de mostrar un anillo alrededor de un elemento recortado con `clip-path`. Usa la caja y no la silueta porque un rectángulo se percibe como foco de forma inequívoca. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
