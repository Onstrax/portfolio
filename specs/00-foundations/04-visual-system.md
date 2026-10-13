# VIS — Sistema visual

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 2.1 |
| Última actualización | 2026-10-12 |
| Depende de | VSN, SYS, STR |

## 1. Propósito

Definir el lenguaje visual común: colores, tipografía, medidas, aura, superficies, controles, movimiento e iconos. Cada valor tiene un nombre (token) y se define una sola vez. Las specs de funcionalidad dicen **qué** se muestra y **cuándo**; esta spec dice **cómo se ve**.

## 2. Alcance

**Incluye:** tokens de diseño, anatomía visual de las superficies y controles compartidos, reglas de movimiento y de iconografía.

**No incluye:** la imagen de la escena (ver AST), el comportamiento de cada elemento (ver su spec en `02-features/`), los efectos de sonido (ver SET) ni los umbrales de accesibilidad y rendimiento (ver QLT).

## 3. Principios visuales

| ID | Principio |
| --- | --- |
| V1 | **Dos mundos, una frontera clara.** La escena es oscura, cálida y fotográfica. El contenido se lee sobre una superficie clara, plana y de alto contraste. Abrir un panel es pasar de "explorar" a "leer". |
| V2 | **El ámbar significa "se puede pulsar".** En superficies oscuras, el ámbar se reserva para lo interactivo. Nunca se usa como decoración ni para texto sobre superficies claras. |
| V3 | **La interfaz no compite con la fotografía.** Mientras no se interactúa, sobre la escena solo hay auras y una barra discreta. |
| V4 | **Tipografía de dos voces.** Monoespaciada para lo que suena a hardware (títulos, etiquetas, registro de arranque); sans-serif para lo que se lee de corrido. |
| V5 | **El movimiento informa.** Cada animación responde a una acción o indica un cambio de estado. Nada se mueve para adornar, salvo la respiración inicial del aura, que señala interactividad. |

## 4. Requisitos

### 4.1 Color

| ID | Requisito |
| --- | --- |
| VIS-R01 | Los colores del sitio son exactamente los de las tablas siguientes. NO DEBE usarse ningún otro color en la interfaz. |
| VIS-R02 | Cada par texto/fondo usado en la interfaz DEBE ser uno de los pares de la tabla de contraste de §4.1.4 o tener un contraste igual o superior al mínimo WCAG AA aplicable. |
| VIS-R03 | `aura` NO DEBE usarse para texto ni para indicadores sobre `screen` o `control`: su contraste es 1,26:1. |
| VIS-R04 | El color nunca es el único medio para transmitir información: todo estado se comunica además con texto, forma o icono. |

#### 4.1.1 Superficies oscuras (escena, barra fija, etiquetas, ajustes)

| Token | Valor | Uso |
| --- | --- | --- |
| `void` | `#0A0907` | Fondo de página detrás de la escena y bandas fuera del escenario |
| `plate` | `#0F0E0C` | Fondo de las placas oscuras (barra fija, etiquetas, ajustes); se aplica con opacidad 92 % |
| `on-dark` | `#F3F1E7` | Texto principal sobre superficies oscuras |
| `on-dark-muted` | `#B5B1A3` | Texto secundario sobre superficies oscuras |
| `aura` | `#FFC53D` | Aura de las zonas interactivas; borde, texto y foco de controles interactivos sobre superficies oscuras |
| `backdrop` | `#050504` | Velo sobre la escena cuando hay un panel abierto; se aplica con opacidad 60 % |

#### 4.1.2 Superficies claras (panel de detalle, vista simple)

| Token | Valor | Uso |
| --- | --- | --- |
| `screen` | `#E8E6DD` | Fondo de lectura: pantalla del panel y página de la vista simple |
| `control` | `#DAD8CE` | Fondo de botones secundarios y chips |
| `ink` | `#15171A` | Texto principal, líneas, bordes y anillo de foco sobre superficies claras |
| `ink-muted` | `#4A4E53` | Texto secundario sobre superficies claras |
| `accent` | `#7A4E00` | Énfasis sobre superficies claras: reconocimientos, enlaces en hover, botón primario en hover |
| `frame-light` | `#C9CBC6` | Marco metálico del panel, extremo claro del degradado |
| `frame-dark` | `#9FA29C` | Marco metálico del panel, extremo oscuro del degradado |
| `frame-edge` | `#6F726D` | Borde exterior del marco |

#### 4.1.3 Secuencia de arranque

| Token | Valor | Uso |
| --- | --- | --- |
| `boot-bg` | `#040604` | Fondo de la pantalla de arranque |
| `boot-text` | `#9BEFA9` | Texto de las líneas del registro |
| `boot-dim` | `#5FA36C` | Marcas de tiempo |
| `boot-ok` | `#4ADE80` | Indicador `OK`; segmentos encendidos del display de diagnóstico |

#### 4.1.4 Contraste verificado

Relaciones de contraste WCAG 2.2 calculadas el 2026-10-12. Mínimos: 4,5:1 para texto normal y 3:1 para texto grande, componentes de interfaz y anillos de foco.

| Primer plano | Fondo | Contraste | Mínimo exigido |
| --- | --- | --- | --- |
| `on-dark` | `plate` | 17,04:1 | 4,5:1 |
| `on-dark-muted` | `plate` | 8,99:1 | 4,5:1 |
| `aura` | `plate` | 12,22:1 | 4,5:1 |
| `on-dark` | `plate` al 92 % sobre blanco (peor caso de fondo) | 14,21:1 | 4,5:1 |
| `on-dark-muted` | `plate` al 92 % sobre blanco (peor caso de fondo) | 7,49:1 | 4,5:1 |
| `ink` | `screen` | 14,36:1 | 4,5:1 |
| `ink-muted` | `screen` | 6,70:1 | 4,5:1 |
| `accent` | `screen` | 5,76:1 | 4,5:1 |
| `ink` | `control` | 12,57:1 | 4,5:1 |
| `ink-muted` | `control` | 5,86:1 | 4,5:1 |
| `accent` | `control` | 5,04:1 | 4,5:1 |
| `screen` | `ink` (botón primario) | 14,36:1 | 4,5:1 |
| `screen` | `accent` (botón primario en hover) | 5,76:1 | 4,5:1 |
| `ink` | `frame-dark` | 6,95:1 | 4,5:1 |
| `frame-edge` | `screen` | 3,90:1 | 3:1 |
| `boot-text` | `boot-bg` | 14,82:1 | 4,5:1 |
| `boot-dim` | `boot-bg` | 6,72:1 | 4,5:1 |
| `boot-ok` | `boot-bg` | 11,67:1 | 4,5:1 |

### 4.2 Tipografía

| ID | Requisito |
| --- | --- |
| VIS-R05 | Se usan exactamente dos familias: **Inter** (token `font-sans`) y **JetBrains Mono** (token `font-mono`), ambas en su versión variable, con el subconjunto `latin` y `display: swap`. |
| VIS-R06 | Cada texto de la interfaz DEBE corresponder a un rol de la tabla siguiente. |
| VIS-R07 | El texto de cuerpo nunca mide menos de 16 px. Ningún texto mide menos de 12 px. |
| VIS-R08 | Un bloque de texto de corrido no supera 72 caracteres por línea. El texto se alinea a la izquierda; no se justifica. |
| VIS-R09 | El texto en mayúsculas se obtiene con CSS (`text-transform`), nunca escribiéndolo en mayúsculas en el contenido. |

| Rol | Familia | Tamaño / interlínea | Peso | Otros |
| --- | --- | --- | --- | --- |
| Cuerpo | sans | 16 / 24 px | 400 | — |
| Cuerpo secundario | sans | 14 / 20 px | 400 | — |
| Énfasis dentro de cuerpo | sans | hereda | 600 | — |
| Título de panel | mono | 20 / 28 px | 600 | Mayúsculas, espaciado 0,06 em |
| Encabezado de bloque | mono | 14 / 20 px | 600 | Mayúsculas, espaciado 0,06 em |
| Botón | mono | 14 / 20 px | 600 | Mayúsculas, espaciado 0,06 em |
| Chip | mono | 12 / 16 px | 500 | — |
| Etiqueta de escena, línea de nombre | mono | 14 / 20 px | 600 | Mayúsculas, espaciado 0,06 em |
| Etiqueta de escena, línea de contenido | mono | 12 / 16 px | 400 | — |
| Registro de arranque | mono | 14 / 21 px; 16 / 24 px con viewport de 1440 px de ancho o más | 400 | Cifras de ancho fijo |
| Vista simple, nombre | mono | 30 / 36 px | 600 | — |
| Vista simple, título de sección | mono | 24 / 32 px | 600 | Mayúsculas, espaciado 0,06 em |

### 4.3 Espaciado, radios, sombras y capas

| ID | Requisito |
| --- | --- |
| VIS-R10 | El espaciado usa la escala por defecto de Tailwind (unidad de 4 px). |
| VIS-R11 | Radios, sombras y capas usan exactamente los tokens de las tablas siguientes. |
| VIS-R12 | El orden de apilamiento se controla solo con los tokens de capa; NO DEBEN usarse valores de `z-index` sueltos. |

| Token | Valor | Uso |
| --- | --- | --- |
| `radius-control` | 4 px | Botones, chips, campos |
| `radius-plate` | 6 px | Placas oscuras; pantalla del panel |
| `radius-frame` | 14 px | Marco del panel |
| `shadow-plate` | `0 4px 16px rgb(0 0 0 / 0.5)` | Placas oscuras |
| `shadow-panel` | `0 24px 60px rgb(0 0 0 / 0.55)` | Panel de detalle |

| Token de capa | Valor | Contenido |
| --- | --- | --- |
| `z-scene` | 0 | Imagen de la escena |
| `z-hotspots` | 10 | Zonas interactivas y auras |
| `z-labels` | 20 | Etiquetas |
| `z-bar` | 30 | Barra fija |
| `z-settings` | 40 | Menú de ajustes |
| `z-panel` | 50 | Velo y panel de detalle |
| `z-boot` | 60 | Secuencia de arranque |
| `z-skip-link` | 70 | Enlace "saltar al contenido" |

### 4.4 Aura

El aura es la señal de que una pieza de hardware se puede pulsar. Se dibuja en la capa SVG, en unidades del espacio de escena (ver AST §4.2), siguiendo el polígono de la zona interactiva.

| ID | Requisito |
| --- | --- |
| VIS-R13 | El aura se compone de tres elementos del color `aura`: un **trazo** de 2 unidades de grosor sobre el contorno del polígono; un **resplandor** formado por dos copias desenfocadas del trazo (desenfoque gaussiano de 3 y de 10 unidades); y, solo en los estados de hover, foco y activo, un **relleno** del polígono con opacidad 0,08. |
| VIS-R14 | El aura se dibuja sobre el contorno y hacia fuera. En reposo no rellena ni cubre la pieza. |
| VIS-R15 | Las opacidades por estado son las de la tabla siguiente. Las seis zonas primarias usan los valores "primaria"; `cmos` y `settings` usan los valores "secundaria". |
| VIS-R16 | Cuando la escena se hace visible, la opacidad del resplandor de las zonas en reposo **respira** durante 4800 ms: dos ciclos de 2400 ms entre el valor mínimo y el máximo de la tabla, con curva `ease-in-out` y todas las zonas en fase. Después queda fija en el valor máximo. La respiración solo se repite cuando la escena vuelve a hacerse visible tras una secuencia de arranque. Se interrumpe en la zona que pasa a hover, foco o activa. |
| VIS-R17 | El cambio entre estados es una transición de opacidad de `duration-fast`. Solo se anima la opacidad; el radio de desenfoque nunca se anima. |
| VIS-R18 | Con `prefers-reduced-motion: reduce` no hay respiración: en reposo el resplandor queda fijo en su valor máximo. |
| VIS-R19 | El color y la forma del aura son los mismos para todas las zonas y no cambian según se haya visitado o no la sección (D-07). |

| Estado | Trazo, primaria | Resplandor, primaria | Trazo, secundaria | Resplandor, secundaria |
| --- | --- | --- | --- | --- |
| Reposo | 0,55 | 0,30 a 0,45 | 0,35 | 0,18 a 0,27 |
| Hover o foco de teclado | 1,00 | 0,85 | 0,80 | 0,60 |
| Activo (su panel o menú está abierto) | 1,00 | 0,85 | 0,80 | 0,60 |

### 4.5 Superficies

#### 4.5.1 Placa oscura

Superficie de la barra fija, las etiquetas de la escena y el menú de ajustes.

| ID | Requisito |
| --- | --- |
| VIS-R20 | Fondo `plate` con opacidad 92 %, radio `radius-plate`, sombra `shadow-plate` y borde de 1 px en `on-dark-muted` con opacidad 25 %. |
| VIS-R21 | La etiqueta de escena tiene relleno interior de 8 px en vertical y 12 px en horizontal, y un borde de 1 px en `aura` con opacidad 60 % en lugar del borde de VIS-R20. Contiene dos líneas: nombre (`on-dark`) y contenido (`on-dark-muted`), con los roles tipográficos de §4.2. |

#### 4.5.2 Panel claro

Superficie del panel de detalle. Reproduce la referencia `DetailIdea1Component`: un marco metálico que contiene una pantalla clara de lectura.

```text
┌──────────────────────────────────────────────┐  ← marco: degradado frame-light → frame-dark
│ ┌──────────────────────────────────────────┐ │
│ │ TÍTULO DE LA SECCIÓN         [CPU]  [X]  │ │  ← cabecera fija
│ │ ════════════════════════════════════════ │ │  ← línea de 2 px en ink
│ │                                          │ │
│ │  ▤ ENCABEZADO DE BLOQUE                  │ │
│ │  Texto de cuerpo …                       │ │  ← contenido con scroll interno
│ │                                          │ │
│ └──────────────────────────────────────────┘ │
│ [ ‹ ANTERIOR ]      2 / 6      [ SIGUIENTE › ] │  ← pie, sobre el marco
└──────────────────────────────────────────────┘
```

| ID | Requisito |
| --- | --- |
| VIS-R22 | **Marco:** degradado lineal vertical de `frame-light` (arriba) a `frame-dark` (abajo), borde de 1 px en `frame-edge`, radio `radius-frame`, sombra `shadow-panel` y relleno interior de 14 px. |
| VIS-R23 | **Pantalla:** fondo `screen`, radio `radius-plate`, borde de 1 px en `ink` con opacidad 20 % y relleno interior de 28 px (32 px con viewport de 1280 px de ancho o más). |
| VIS-R24 | **Tamaño:** ancho `min(760px, 100vw - 96px)`; alto máximo `min(86vh, 900px)`. Si el contenido no cabe, hace scroll la zona de contenido de la pantalla; la cabecera y el pie permanecen fijos. |
| VIS-R25 | **Cabecera:** título con el rol "Título de panel" a la izquierda; a la derecha, un chip con el nombre de la pieza de hardware y el botón de cerrar. Debajo, una línea de 2 px en `ink` de ancho completo. |
| VIS-R26 | **Pie:** situado sobre el marco, debajo de la pantalla; texto en `ink`. Contiene los controles de navegación entre secciones. |
| VIS-R27 | **Contenido:** los encabezados de bloque usan el rol "Encabezado de bloque" precedidos de un icono de 16 px; entre bloques hay 24 px de separación; las listas usan viñeta cuadrada en `ink`. |

#### 4.5.3 Página clara

| ID | Requisito |
| --- | --- |
| VIS-R28 | La vista simple usa fondo `screen` y texto `ink` en toda la página, con los mismos roles tipográficos, controles y estilos de contenido que la pantalla del panel. Su disposición se define en SMP. |

### 4.6 Controles y foco

| ID | Requisito |
| --- | --- |
| VIS-R29 | Los controles tienen exactamente los estilos de la tabla siguiente. |
| VIS-R30 | Todo control con el que se interactúa mediante puntero mide al menos 44×44 px de área pulsable. Quedan exentos los enlaces dentro de una línea de texto. |
| VIS-R31 | Todo elemento enfocable DEBE mostrar un anillo de foco con `:focus-visible`: contorno de 2 px con separación de 2 px, en `aura` sobre superficies oscuras y en `ink` sobre superficies claras. El anillo NO DEBE eliminarse ni sustituirse por un cambio de color. |
| VIS-R32 | Un control deshabilitado se muestra con opacidad 0,45 y cursor por defecto, y no reacciona a hover. |

| Control | Reposo | Hover | Pulsado |
| --- | --- | --- | --- |
| Botón primario (superficie clara) | Fondo `ink`, texto `screen` | Fondo `accent` | Escala 0,98 |
| Botón secundario (superficie clara) | Fondo `control`, borde 1 px `ink`, texto `ink` | Fondo `ink`, texto `screen` | Escala 0,98 |
| Botón sobre superficie oscura | Fondo transparente, borde 1 px `on-dark-muted` al 40 %, texto `on-dark` | Borde y texto `aura` | Escala 0,98 |
| Enlace (superficie clara) | Texto `ink`, subrayado de 1 px con separación de 3 px | Texto `accent` | — |
| Enlace (superficie oscura) | Texto `on-dark`, subrayado de 1 px con separación de 3 px | Texto `aura` | — |
| Chip neutro | Fondo `control`, borde 1 px `ink-muted`, texto `ink` | No interactivo | — |
| Chip de reconocimiento | Fondo `control`, borde 1 px `accent`, texto `accent` | No interactivo | — |

Los enlaces que abren un origen externo llevan, a continuación del texto, el icono `external-link` a 16 px.

### 4.7 Movimiento

| ID | Requisito |
| --- | --- |
| VIS-R33 | Las duraciones y curvas son exactamente los tokens de la tabla siguiente. |
| VIS-R34 | Solo se animan `opacity` y `transform`. NO DEBEN animarse propiedades de maquetación, sombras, filtros ni colores de fondo de áreas grandes. NO DEBE usarse `transition: all`. |
| VIS-R35 | Las animaciones del sitio son exactamente las del inventario siguiente. Añadir una animación exige añadirla antes al inventario. |
| VIS-R36 | Con `prefers-reduced-motion: reduce` se aplica la columna "Movimiento reducido" del inventario: no hay animaciones en bucle ni desplazamientos o escalados; quedan fundidos de opacidad de 150 ms como máximo. |

| Token | Valor |
| --- | --- |
| `duration-instant` | 100 ms |
| `duration-fast` | 150 ms |
| `duration-base` | 250 ms |
| `duration-slow` | 400 ms |
| `duration-scene` | 700 ms |
| `ease-out` | `cubic-bezier(0.22, 1, 0.36, 1)` |
| `ease-in` | `cubic-bezier(0.55, 0, 1, 0.45)` |
| `ease-in-out` | `cubic-bezier(0.65, 0, 0.35, 1)` |

| ID | Animación | Qué cambia | Duración y curva | Movimiento reducido |
| --- | --- | --- | --- | --- |
| M-01 | Aparición de las líneas del registro de arranque | Definida en BOOT; usa solo opacidad | Definida en BOOT; total de 2000 ms como máximo | Definida en BOOT |
| M-02 | Paso del arranque a la escena | Arranque: opacidad 1 → 0. Escena: opacidad 0 → 1 y escala 1,04 → 1 | Arranque: `duration-slow`, `ease-in`. Escena: `duration-scene`, `ease-out` | Fundido cruzado de 150 ms, sin escala |
| M-03 | Respiración del aura | Opacidad del resplandor (VIS-R16) | Dos ciclos de 2400 ms (4800 ms en total), `ease-in-out`; no es un bucle | Desactivada (VIS-R18) |
| M-04 | Cambio de estado del aura | Opacidad de trazo, resplandor y relleno | `duration-fast`, `ease-out` | Igual |
| M-05 | Etiqueta de escena | Entrada: opacidad 0 → 1 y desplazamiento de 4 px → 0. Salida: opacidad 1 → 0 | Entrada: `duration-fast`, `ease-out`. Salida: `duration-instant`, `ease-in` | Solo opacidad |
| M-06 | Apertura y cierre del panel | Velo: opacidad 0 ↔ 0,6. Panel: opacidad 0 ↔ 1, escala 0,97 ↔ 1, desplazamiento vertical 8 px ↔ 0 | Apertura: `duration-base`, `ease-out`. Cierre: `duration-fast`, `ease-in` | Solo opacidad, 150 ms |
| M-07 | Cambio de sección dentro del panel | Contenido saliente: opacidad 1 → 0 y desplazamiento horizontal de 16 px. Contenido entrante: lo inverso | `duration-fast` cada fase, `ease-in` y `ease-out` | Cambio instantáneo |
| M-08 | Apertura y cierre del menú de ajustes | Opacidad 0 ↔ 1 y escala 0,98 ↔ 1 | `duration-fast`, `ease-out` | Solo opacidad |
| M-09 | Cambio de valor del display de diagnóstico | Opacidad del dígito 0,4 → 1 | `duration-fast`, `ease-out` | Cambio instantáneo |
| M-10 | Pulsación de un botón | Escala 1 → 0,98 → 1 | `duration-instant`, `ease-out` | Sin animación |
| M-11 | Aparición de la imagen de la escena al terminar de decodificarse | Opacidad 0 → 1 | `duration-base`, `ease-out` | Igual |
| M-12 | Aparición y retirada de la pista de la escena | Opacidad 0 ↔ 1 | `duration-base`, `ease-out` | Igual |

### 4.8 Iconografía

| ID | Requisito |
| --- | --- |
| VIS-R37 | Los iconos son SVG en línea, definidos como componentes de React en `src/shared/ui/icons/`, con `viewBox="0 0 24 24"`, sin relleno, trazo de 2 unidades en `currentColor` y extremos redondeados. Se muestran a 16, 20 o 24 px. |
| VIS-R38 | Los iconos de interfaz proceden del conjunto Lucide (licencia ISC), copiados al repositorio; no se instala el paquete. |
| VIS-R39 | Los iconos de marca (GitHub, LinkedIn, WhatsApp) son el símbolo oficial de cada marca en una sola tinta (`currentColor`), con relleno en lugar de trazo, y siempre van acompañados del nombre de la marca en texto. |
| VIS-R40 | Un icono junto a un texto es decorativo y lleva `aria-hidden="true"`. Un botón que solo muestra un icono DEBE tener nombre accesible. |
| VIS-R41 | El conjunto base, usado por más de un feature, es: `close`, `chevron-left`, `chevron-right`, `external-link`, `download`, `volume-on`, `volume-off`, `reset`, `lock`, `users`. Los iconos propios de una sección se enumeran en la spec de esa sección y se añaden a la misma carpeta. |

### 4.9 Implementación de los tokens

| ID | Requisito |
| --- | --- |
| VIS-R42 | Todos los tokens de esta spec se declaran una sola vez en `src/styles/tokens.css`, con el mismo nombre que en las tablas. Los que corresponden a un espacio de nombres de Tailwind (color, familia tipográfica, radio, sombra, curva) se declaran dentro de `@theme` para que generen clases de utilidad; el resto (duraciones, capas, opacidades y medidas del aura) se declaran como propiedades personalizadas en `:root`. |
| VIS-R43 | Los componentes referencian tokens, nunca valores literales (ver STR-R22). Un valor que no tenga token y se use en dos o más lugares DEBE convertirse en token y añadirse a esta spec. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| VIS-AC01 | `src/styles/tokens.css` define cada token de §4.1, §4.3 y §4.7 con el valor exacto de esta spec. | Prueba unitaria que lee el archivo y lo compara con la lista esperada |
| VIS-AC02 | Cada par de la tabla de §4.1.4, calculado a partir de los valores de `tokens.css`, alcanza su mínimo exigido. | Prueba unitaria con una función de contraste WCAG |
| VIS-AC03 | El análisis automático de accesibilidad no encuentra infracciones de contraste en la escena, en cada uno de los siete paneles, en el menú de ajustes ni en la vista simple, en ambos idiomas. | Prueba E2E con axe |
| VIS-AC04 | Al recorrer con el tabulador todos los elementos enfocables de la escena, de un panel y de la vista simple, cada uno muestra un contorno de al menos 2 px cuyo color es `aura` o `ink` según la superficie. | Prueba E2E que lee el estilo calculado |
| VIS-AC05 | Con la emulación de movimiento reducido activa, ningún elemento tiene una animación en bucle en ejecución y ninguna transición calculada supera 150 ms. | Prueba E2E |
| VIS-AC06 | No aparece `transition-all` ni `transition: all` en `src/`. | Prueba de arquitectura |
| VIS-AC07 | El texto de cuerpo de los paneles y de la vista simple tiene un tamaño calculado de 16 px o más; ningún texto visible mide menos de 12 px. | Prueba E2E que lee el estilo calculado |
| VIS-AC08 | Todos los botones de la barra fija, del menú de ajustes y del panel miden al menos 44×44 px. | Prueba E2E que mide las cajas |
| VIS-AC09 | Las únicas familias tipográficas cargadas son Inter y JetBrains Mono. | Prueba E2E que consulta `document.fonts` |
| VIS-AC10 | A 1280×720 px y a 1920×1080 px, el panel cumple VIS-R24: no supera los máximos, queda dentro del viewport y, con un contenido más alto que la pantalla, la cabecera y el pie siguen visibles mientras el contenido hace scroll. | Prueba E2E |
| VIS-AC11 | Las opacidades del aura en reposo, hover y activo coinciden con la tabla de §4.4 para una zona primaria y una secundaria. | Prueba de componente que lee los atributos del SVG |
| VIS-AC13 | Sin movimiento reducido, la respiración del aura termina antes de 5 segundos desde que la escena es visible y el resplandor de las zonas en reposo queda en su valor máximo. | Prueba E2E |
| VIS-AC12 | El autor revisa el panel, las etiquetas y la barra fija sobre la imagen final de la escena y confirma que el aura se distingue en todo el perímetro de cada zona y que el panel corresponde a la referencia `DetailIdea1Component`. | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Panel claro de alto contraste** (D-06). | De las cuatro referencias es la que mejor se lee: texto oscuro sobre fondo claro a 14:1, estructura de CV. El holograma tiene bajo contraste, el plano técnico añade líneas que compiten con el texto y el manual en perspectiva es frágil de construir y de adaptar. |
| **Aura ámbar fija** (D-07). | Contraste alto frente a los tonos reales de la escena (entre 5:1 y 9:1 sobre PCB verde oscuro y madera oscura) y coherencia con la luz cálida de la lámpara. Es fija porque su única función es decir "esto se puede pulsar". |
| **La respiración del aura dura 4,8 segundos y no se repite** (VIS-R16, D-34). | WCAG 2.2.2 (nivel A) exige poder pausar todo movimiento automático de más de 5 segundos. Limitarla cumple el criterio sin añadir un control de pausa: atrae la mirada cuando la escena aparece y después deja el aura fija, que es lo que pidió el autor. La versión 1.0 la definía como un bucle continuo. |
| **El aura se dibuja hacia fuera del contorno** (VIS-R14). | Sobre metal claro (disipador del CPU, chapa del panel I/O) el ámbar apenas contrasta (1,5:1). Dibujada hacia fuera, se ve contra el PCB o la madera que rodean la pieza. AST exige que ese entorno sea oscuro. |
| **Opacidad del 92 % en las placas oscuras.** | Deja intuir la fotografía detrás sin comprometer la lectura: incluso sobre un fondo blanco, que nunca ocurre en la escena, el texto mantiene 14:1 y el secundario 7,5:1. |
| **`accent` oscuro en lugar del ámbar del aura sobre superficies claras.** | El ámbar del aura no es legible sobre claro. `accent` es el mismo matiz oscurecido hasta superar 4,5:1, así que conserva la identidad sin perder contraste. |
| **Inter y JetBrains Mono.** | Ambas son variables, de licencia libre y con buena legibilidad en pantalla a tamaños pequeños. La monoespaciada da el carácter técnico; usarla también en el cuerpo cansaría la lectura. |
| **Solo opacidad y transformaciones** (VIS-R34). | Son las propiedades que el navegador anima sin recalcular maquetación ni repintar, lo que mantiene fluida la escena sobre una imagen grande. Animar el desenfoque del aura sería lo más costoso de toda la página. |
| **Mayúsculas por CSS** (VIS-R09). | Los lectores de pantalla pueden deletrear el texto escrito en mayúsculas, y el contenido debe poder reutilizarse en otros contextos sin reescribirlo. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-12 | 2.1 | Confirmada por el autor el 2026-10-12. Inventario de movimiento: se añaden M-11 y M-12 (SCN). `boot-ok` se usa también en el display de diagnóstico. |
| 2026-10-12 | 1.0 | Versión inicial. Contrastes calculados sobre los valores de §4.1. Aprobada por el autor. |
| 2026-10-12 | 2.0 | Confirmada por el autor el 2026-10-12. VIS-R16 y M-03: la respiración del aura deja de ser un bucle continuo y pasa a durar 4800 ms tras hacerse visible la escena (D-34, QLT-R19). Nuevo criterio VIS-AC13. |
