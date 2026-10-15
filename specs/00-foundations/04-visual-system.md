# VIS — Sistema visual

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 4.1 |
| Última actualización | 2026-10-15 |
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
| V2 | **El ámbar significa "se puede pulsar".** En superficies oscuras, el ámbar se reserva para lo interactivo. Nunca se usa como decoración ni para texto sobre superficies claras. En la variante boceto de la escena, cuyo fondo es claro, ese papel lo hace el azul `aura-sketch` (§4.1.5). |
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
| `aura` | `#FFC53D` | Aura de las zonas interactivas en la variante fotografía; borde, texto y foco de controles interactivos sobre superficies oscuras, en ambas variantes |
| `backdrop` | `#050504` | Velo sobre la escena cuando hay un panel o la bienvenida abiertos; se aplica con opacidad 60 % |

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
| `boot-bg` | `#040604` | Fondo de la pantalla de arranque y de la terminal de la bienvenida |
| `boot-text` | `#9BEFA9` | Texto de las líneas del registro, de la línea de contexto y de la indicación y el botón de saltar del arranque, y de la bienvenida; texto y anillo de foco de los controles de la bienvenida |
| `boot-dim` | `#5FA36C` | Marcas de tiempo; marco de la barra de progreso del arranque; borde de la terminal de la bienvenida y de sus botones, y su signo `›` |
| `boot-ok` | `#4ADE80` | Indicador `OK`; relleno de la barra de progreso del arranque; segmentos encendidos del display de diagnóstico; título de la bienvenida |

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
| `aura-sketch` | `paper` | 6,05:1 | 3:1 |
| `ink` | `paper` (display de diagnóstico en el boceto) | 15,16:1 | 3:1 |

#### 4.1.5 Variante boceto de la escena

La variante boceto (AST §4.10) es un dibujo sobre papel claro, donde el ámbar no se distingue: su contraste con el papel es de 1,33:1. Estos dos tokens existen solo para ella.

| Token | Valor | Uso |
| --- | --- | --- |
| `aura-sketch` | `#1F4FBF` | Aura y rectángulo de foco de las zonas interactivas en la variante boceto. Azul de bolígrafo (D-86) |
| `paper` | `#F2EBDF` | Franjas fuera del escenario y viñeteado en la variante boceto. Es el color mediano del máster del boceto |

Las placas oscuras (barra fija, placa de identidad, etiquetas y ajustes) y la terminal de la bienvenida no cambian con la variante: su fondo es propio, y sus acentos siguen en `aura` en las placas y en los colores del arranque en la terminal.

#### 4.1.6 Impresión

La hoja de impresión de la vista simple (SMP-R12) usa negro sobre blanco.

| Token | Valor | Uso |
| --- | --- | --- |
| `print-paper` | `#FFFFFF` | Fondo de la página impresa |
| `print-ink` | `#000000` | Texto de la página impresa |

### 4.2 Tipografía

| ID | Requisito |
| --- | --- |
| VIS-R05 | Se usan exactamente dos familias: **Inter** (token `font-sans`) y **JetBrains Mono** (token `font-mono`), ambas en su versión variable, con el subconjunto `latin` y `display: swap`. |
| VIS-R06 | Cada texto de la interfaz DEBE corresponder a un rol de la tabla siguiente. |
| VIS-R07 | El texto de cuerpo nunca mide menos de 16 px. Ningún texto mide menos de 12 px. |
| VIS-R08 | Un bloque de texto de corrido no supera 72 caracteres por línea. El texto se alinea a la izquierda; no se justifica. |
| VIS-R09 | El texto en mayúsculas se obtiene con CSS (`text-transform`), nunca escribiéndolo en mayúsculas en el contenido. |
| VIS-R45 | El texto destacado (TSC-R58) usa el rol "Énfasis dentro de cuerpo": hereda la familia, el tamaño y el color del texto que lo rodea y solo cambia el peso a 600. NO DEBE llevar color, fondo, subrayado ni cursiva propios (D-85). |

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
| Contexto del arranque | mono | 16 / 24 px; 18 / 28 px con viewport de 1440 px de ancho o más | 600 | — |
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
| `z-panel` | 50 | Velo y panel de detalle; velo y terminal de la bienvenida, que nunca está abierta a la vez que el panel |
| `z-boot` | 60 | Secuencia de arranque |
| `z-skip-link` | 70 | Enlace "saltar al contenido" |

### 4.4 Aura

El aura es la señal de que una pieza de hardware se puede pulsar. Se dibuja en la capa SVG, en unidades del espacio de escena (ver AST §4.2), siguiendo el polígono de la zona interactiva.

| ID | Requisito |
| --- | --- |
| VIS-R13 | El aura tiene dos partes del color de aura de la variante activa (VIS-R44). Un **halo**: luz que parece salir de detrás de la pieza; se obtiene desenfocando dos veces la silueta rellena (desenfoque gaussiano de 6 y de 18 unidades), sumando ambas copias, multiplicando su opacidad por 1,5 y eliminando la parte que cae sobre la propia pieza, con un borde interior suavizado 1,5 unidades. Y un **relleno** de la silueta, presente en todos los estados, que hace brillar también la pieza. El aura NO DEBE dibujar ninguna línea de contorno. |
| VIS-R14 | El halo se dibuja alrededor de la pieza y hacia fuera, más intenso junto a ella y desvanecido a unas 50 unidades. El relleno cubre la pieza entera con una opacidad baja, que deja ver la imagen. En hover, foco y activo suben los dos. |
| VIS-R15 | Las opacidades por estado son las de la tabla siguiente. Las seis zonas primarias usan los valores "primaria"; `cmos` y `settings` usan los valores "secundaria". |
| VIS-R16 | Cuando la escena se hace visible, la opacidad del halo de las zonas en reposo **respira** durante 4800 ms: dos ciclos de 2400 ms entre el valor mínimo y el máximo de la tabla, con curva `ease-in-out` y todas las zonas en fase. Después queda fija en el valor máximo. La respiración solo se repite cuando la escena vuelve a hacerse visible tras una secuencia de arranque. Se interrumpe en la zona que pasa a hover, foco o activa. |
| VIS-R17 | El cambio entre estados es una transición de opacidad de `duration-fast`. Solo se anima la opacidad; el radio de desenfoque nunca se anima. |
| VIS-R18 | Con `prefers-reduced-motion: reduce` no hay respiración: en reposo el halo queda fijo en su valor máximo. |
| VIS-R19 | El color y la forma del aura son los mismos para todas las zonas y no cambian según se haya visitado o no la sección (D-07). |

| Estado | Halo, primaria | Halo, secundaria | Relleno |
| --- | --- | --- | --- |
| Reposo | 0,32 a 0,50 | 0,28 a 0,42 | 0,08 |
| Hover o foco de teclado | 1,00 | 0,90 | 0,14 |
| Activo (su panel o menú está abierto) | 1,00 | 0,90 | 0,14 |

### 4.5 Superficies

#### 4.5.1 Placa oscura

Superficie de la barra fija, la placa de identidad, las etiquetas de la escena y el menú de ajustes.

| ID | Requisito |
| --- | --- |
| VIS-R20 | Fondo `plate` con opacidad 92 %, radio `radius-plate`, sombra `shadow-plate` y borde de 1 px en `on-dark-muted` con opacidad 25 %. |
| VIS-R21 | La etiqueta de escena tiene relleno interior de 8 px en vertical y 12 px en horizontal, y un borde de 1 px en `aura` con opacidad 60 % en lugar del borde de VIS-R20. Contiene dos líneas: nombre (`on-dark`) y contenido (`on-dark-muted`), con los roles tipográficos de §4.2. Cada línea ocupa un solo renglón, salvo en dispositivos sin hover, donde la etiqueta mide 128 px de ancho como máximo y el texto salta de renglón (SCN-R25). El borde usa el color de aura de la variante activa (VIS-R44). |

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

#### 4.5.4 Terminal de la bienvenida

Superficie de la bienvenida de la escena (SCN §4.7), con la estética de la pantalla de arranque (BOOT).

| ID | Requisito |
| --- | --- |
| VIS-R46 | Fondo `boot-bg` opaco, borde de 1 px en `boot-dim`, radio `radius-plate`, sombra `shadow-panel` y relleno interior de 24 px. El título usa el rol "Etiqueta de escena, línea de nombre" en `boot-ok`, precedido del signo `›` en `boot-dim`; el texto, el rol "Registro de arranque" en `boot-text`. "Explorar" y "Ver mi perfil" tienen el estilo "Botón de terminal" (VIS-R29). El botón de cerrar muestra el icono `close` a 20 px en `boot-text`, que pasa a `boot-ok` con hover, sobre un área de 44×44 px. |

### 4.6 Controles y foco

| ID | Requisito |
| --- | --- |
| VIS-R29 | Los controles tienen exactamente los estilos de la tabla siguiente. |
| VIS-R30 | Todo control con el que se interactúa mediante puntero mide al menos 44×44 px de área pulsable. Quedan exentos los enlaces dentro de una línea de texto. |
| VIS-R31 | Todo elemento enfocable DEBE mostrar un anillo de foco con `:focus-visible`: contorno de 2 px con separación de 2 px, en `aura` sobre superficies oscuras y en `ink` sobre superficies claras. Sobre la escena, el color es el de aura de la variante activa (VIS-R44); sobre la terminal de la bienvenida, es `boot-text`. El anillo NO DEBE eliminarse ni sustituirse por un cambio de color. |
| VIS-R32 | Un control deshabilitado se muestra con opacidad 0,45 y cursor por defecto, y no reacciona a hover. |

| Control | Reposo | Hover | Pulsado |
| --- | --- | --- | --- |
| Botón primario (superficie clara) | Fondo `ink`, texto `screen` | Fondo `accent` | Escala 0,98 |
| Botón secundario (superficie clara) | Fondo `control`, borde 1 px `ink`, texto `ink` | Fondo `ink`, texto `screen` | Escala 0,98 |
| Botón sobre superficie oscura | Fondo transparente, borde 1 px `on-dark-muted` al 40 %, texto `on-dark` | Borde y texto `aura` | Escala 0,98 |
| Botón de terminal | Fondo transparente, borde 1 px `boot-dim`, texto `boot-text` | Borde `boot-text` | Escala 0,98 |
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
| M-03 | Respiración del aura | Opacidad del halo (VIS-R16) | Dos ciclos de 2400 ms (4800 ms en total), `ease-in-out`; no es un bucle | Desactivada (VIS-R18) |
| M-04 | Cambio de estado del aura | Opacidad de halo y relleno | `duration-fast`, `ease-out` | Igual |
| M-05 | Etiqueta de escena | Entrada: opacidad 0 → 1 y desplazamiento de 4 px → 0. Salida: opacidad 1 → 0 | Entrada: `duration-fast`, `ease-out`. Salida: `duration-instant`, `ease-in` | Solo opacidad |
| M-06 | Apertura y cierre del panel | Velo: opacidad 0 ↔ 0,6. Panel: opacidad 0 ↔ 1, escala 0,97 ↔ 1, desplazamiento vertical 8 px ↔ 0 | Apertura: `duration-base`, `ease-out`. Cierre: `duration-fast`, `ease-in` | Solo opacidad, 150 ms |
| M-07 | Cambio de sección dentro del panel | Contenido saliente: opacidad 1 → 0 y desplazamiento horizontal de 16 px. Contenido entrante: lo inverso | `duration-fast` cada fase, `ease-in` y `ease-out` | Cambio instantáneo |
| M-08 | Apertura y cierre del menú de ajustes | Opacidad 0 ↔ 1 y escala 0,98 ↔ 1 | `duration-fast`, `ease-out` | Solo opacidad |
| M-09 | Cambio de valor del display de diagnóstico | Opacidad del dígito 0,4 → 1 | `duration-fast`, `ease-out` | Cambio instantáneo |
| M-10 | Pulsación de un botón | Escala 1 → 0,98 → 1 | `duration-instant`, `ease-out` | Sin animación |
| M-11 | Aparición de la imagen de la escena al terminar de decodificarse | Opacidad 0 → 1 | `duration-base`, `ease-out` | Igual, en `duration-fast` |
| M-12 | Aparición y retirada de la bienvenida de la escena (SCN §4.7) | Velo: opacidad 0 ↔ 0,6. Terminal: opacidad 0 ↔ 1 y escala 0,98 ↔ 1 | Aparición: `duration-base`, `ease-out`. Retirada: `duration-fast`, `ease-in` | Solo opacidad, 150 ms |
| M-13 | Barra de progreso del arranque (BOOT-R24) | Escala horizontal del relleno 0 → 1, desde la izquierda | Lineal, con la duración del retardo de la última línea del registro: 1400 ms como máximo | Sin animación: llena |

### 4.8 Iconografía

| ID | Requisito |
| --- | --- |
| VIS-R37 | Los iconos son SVG en línea, definidos como componentes de React en `src/shared/ui/icons/`, con `viewBox="0 0 24 24"`, sin relleno, trazo de 2 unidades en `currentColor` y extremos redondeados. Se muestran a 16, 20 o 24 px. |
| VIS-R38 | Los iconos de interfaz proceden del conjunto Lucide (licencia ISC), copiados al repositorio; no se instala el paquete. |
| VIS-R39 | Los iconos de marca (GitHub, LinkedIn, WhatsApp) son el símbolo oficial de cada marca en una sola tinta (`currentColor`), con relleno en lugar de trazo, y siempre van acompañados del nombre de la marca en texto. Única excepción: los contactos de la barra fija (SET-R02, D-84), que muestran solo el icono, a 20 px, y llevan el nombre de la marca como nombre accesible. |
| VIS-R40 | Un icono junto a un texto es decorativo y lleva `aria-hidden="true"`. Un botón que solo muestra un icono DEBE tener nombre accesible. |
| VIS-R41 | El conjunto base, usado por más de un feature, es: `close`, `chevron-left`, `chevron-right`, `external-link`, `download`, `volume-on`, `volume-off`, `reset`, `lock`, `users`. Los iconos propios de una sección se enumeran en la spec de esa sección y se añaden a la misma carpeta. |

### 4.9 Implementación de los tokens

| ID | Requisito |
| --- | --- |
| VIS-R42 | Todos los tokens de esta spec se declaran una sola vez en `src/styles/tokens.css`, con el mismo nombre que en las tablas. Los que corresponden a un espacio de nombres de Tailwind (color, familia tipográfica, radio, sombra, curva) se declaran dentro de `@theme` para que generen clases de utilidad; el resto (duraciones, capas, opacidades y medidas del aura) se declaran como propiedades personalizadas en `:root`. |
| VIS-R43 | Los componentes referencian tokens, nunca valores literales (ver STR-R22). Un valor que no tenga token y se use en dos o más lugares DEBE convertirse en token y añadirse a esta spec. |
| VIS-R44 | `src/styles/tokens.css` declara cuatro propiedades personalizadas cuyo valor depende del atributo `data-scene` de `<html>` (SYS-R51), según la tabla siguiente. Los componentes de la escena usan estas propiedades y nunca eligen el color por su cuenta. Sin el atributo, valen lo que en `photo`. |

| Propiedad | En `photo` | En `sketch` | Uso |
| --- | --- | --- | --- |
| `--scene-aura` | `aura` | `aura-sketch` | Halo y relleno del aura; rectángulo de foco de las zonas (SCN-R21) |
| `--scene-backdrop` | `void` | `paper` | Fondo fuera del escenario y viñeteado (AST-R03, AST-R48) |
| `--scene-display` | `boot-ok` | `ink` | Segmentos del display de diagnóstico (SCN-R29) |
| `--scene-display-back` | `transparent` | `paper` | Fondo bajo los dígitos del display de diagnóstico (SCN-R29) |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| VIS-AC01 | `src/styles/tokens.css` define cada token de §4.1, §4.3 y §4.7 con el valor exacto de esta spec. | Prueba unitaria que lee el archivo y lo compara con la lista esperada |
| VIS-AC02 | Cada par de la tabla de §4.1.4, calculado a partir de los valores de `tokens.css`, alcanza su mínimo exigido. | Prueba unitaria con una función de contraste WCAG |
| VIS-AC03 | El análisis automático de accesibilidad no encuentra infracciones de contraste en la escena, en cada uno de los siete paneles, en el menú de ajustes ni en la vista simple, en ambos idiomas. | Prueba E2E con axe |
| VIS-AC04 | Al recorrer con el tabulador todos los elementos enfocables de la escena, de un panel y de la vista simple, cada uno muestra un contorno de al menos 2 px cuyo color es `aura`, `ink` o `boot-text` según la superficie. | Prueba E2E que lee el estilo calculado |
| VIS-AC05 | Con la emulación de movimiento reducido activa, ningún elemento tiene una animación en bucle en ejecución y ninguna transición calculada supera 150 ms. | Prueba E2E |
| VIS-AC06 | No aparece `transition-all` ni `transition: all` en `src/`. | Prueba de arquitectura |
| VIS-AC07 | El texto de cuerpo de los paneles y de la vista simple tiene un tamaño calculado de 16 px o más; ningún texto visible mide menos de 12 px. | Prueba E2E que lee el estilo calculado |
| VIS-AC08 | Todos los botones de la barra fija, del menú de ajustes y del panel miden al menos 44×44 px. | Prueba E2E que mide las cajas |
| VIS-AC09 | Las únicas familias tipográficas cargadas son Inter y JetBrains Mono. | Prueba E2E que consulta `document.fonts` |
| VIS-AC10 | A 1280×720 px y a 1920×1080 px, el panel cumple VIS-R24: no supera los máximos, queda dentro del viewport y, con un contenido más alto que la pantalla, la cabecera y el pie siguen visibles mientras el contenido hace scroll. | Prueba E2E |
| VIS-AC11 | Las opacidades del aura en reposo, hover y activo coinciden con la tabla de §4.4 para una zona primaria y una secundaria. | Prueba de componente que lee los atributos del SVG |
| VIS-AC13 | Sin movimiento reducido, la respiración del aura termina antes de 5 segundos desde que la escena es visible y el halo de las zonas en reposo queda en su valor máximo. | Prueba E2E |
| VIS-AC12 | El autor revisa el panel, las etiquetas y la barra fija sobre la imagen final de la escena y confirma que el aura se distingue en todo el perímetro de cada zona y que el panel corresponde a la referencia `DetailIdea1Component`. | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Panel claro de alto contraste** (D-06). | De las cuatro referencias es la que mejor se lee: texto oscuro sobre fondo claro a 14:1, estructura de CV. El holograma tiene bajo contraste, el plano técnico añade líneas que compiten con el texto y el manual en perspectiva es frágil de construir y de adaptar. |
| **Aura ámbar fija** (D-07). | Contraste alto frente a los tonos reales de la escena (entre 5:1 y 9:1 sobre PCB verde oscuro y madera oscura) y coherencia con la luz cálida de la lámpara. Es fija porque su única función es decir "esto se puede pulsar". |
| **La respiración del aura dura 4,8 segundos y no se repite** (VIS-R16, D-34). | WCAG 2.2.2 (nivel A) exige poder pausar todo movimiento automático de más de 5 segundos. Limitarla cumple el criterio sin añadir un control de pausa: atrae la mirada cuando la escena aparece y después deja el aura fija, que es lo que pidió el autor. La versión 1.0 la definía como un bucle continuo. |
| **El aura se dibuja hacia fuera del contorno** (VIS-R14). | Sobre metal claro (disipador del CPU, chapa del panel I/O) el ámbar apenas contrasta (1,5:1). Dibujada hacia fuera, se ve contra el PCB o la madera que rodean la pieza. AST exige que ese entorno sea oscuro. |
| **Azul de bolígrafo para el aura del boceto** (`aura-sketch`, D-66, D-86). | Sobre el papel del boceto, medido en `#F2EBDF`, el ámbar queda en 1,33:1. El primer color elegido fue un carmesí (5,78:1), pero en una interfaz el rojo se lee como un error. El autor comparó capturas de las dos opciones y eligió el azul `#1F4FBF`: alcanza 6,05:1, se integra con la cuadrícula del papel como la tinta de un plano anotado y no comunica fallo. Comparte familia con las aguadas azules y la tinta azul marino del dibujo; se distingue de ellas porque es más saturado y porque el halo y el relleno siguen la silueta (QLT-R14, AST-AC12). Es un token aparte porque, sobre las placas oscuras, ese azul solo llega a 2,69:1: ahí el acento sigue siendo el ámbar. |
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
| 2026-10-15 | 4.1 | Por decisión del autor (D-96). Nuevo rol tipográfico "Contexto del arranque" y nueva animación M-13, la barra de progreso del arranque. Usos de `boot-text`, `boot-dim` y `boot-ok` ampliados. |
| 2026-10-14 | 4.0 | Por decisión del autor (D-92): la bienvenida deja de ser una placa oscura y pasa a ser una terminal con los colores del arranque. Nuevo §4.5.4 (VIS-R46) y nuevo control "Botón de terminal" en VIS-R29. VIS-R31 y VIS-AC04: en la terminal, el anillo de foco es `boot-text`. M-12: velo y terminal, con escala. Usos de `backdrop`, de los colores del arranque y de `z-panel` ampliados. |
| 2026-10-14 | 3.0 | Estado: pasa a "Implementada" al cerrar M13, con todos sus criterios automáticos citados por una prueba (TST-R38). La auditoría con axe recorre ya la bienvenida en las dos variantes (VIS-AC03) y la prueba de movimiento reducido mide su transición (VIS-AC05). VIS-AC12 queda para la revisión del autor de la placa, la bienvenida y la barra fija (A13). Sin cambio de requisitos. |
| 2026-10-14 | 3.0 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 3.0 | Versión 2, pendiente de aprobación del autor. Por decisión del autor (D-86): `aura-sketch` pasa de `#B3123A` a `#1F4FBF` (6,05:1 sobre `paper`); principio V2, §4.1.4, §4.1.5 y decisión reescritos. Nuevo VIS-R45: el texto destacado solo cambia el peso (D-85). VIS-R39: excepción para los iconos de la barra fija (D-84). VIS-R20 y §4.1.5: la placa de identidad y la bienvenida son placas oscuras. M-12 pasa a ser la animación de la bienvenida, que sustituye a la pista (D-83). |
| 2026-10-13 | 2.7 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). VIS-AC12: el autor revisó la escena, las etiquetas, la barra fija y el panel sobre las dos imágenes definitivas al aprobar M5, M6 y M7 y en la auditoría A6, el 2026-10-13; el aura es la que él mismo pidió en D-71 y D-72. Sin cambio de requisitos respecto a la fila anterior. |
| 2026-10-13 | 2.7 | Por indicación del autor al revisar las imágenes (D-76): en el boceto, el contador no se leía. VIS-R44: cuarta propiedad, `--scene-display-back`, con el fondo de los dígitos del display. Durante M8: M-11 y M-12 duran `duration-fast` con movimiento reducido, como exige VIS-R36; el inventario decía "Igual" y contradecía a VIS-AC05. |
| 2026-10-13 | 2.6 | Por decisión del autor al revisar el halo (D-72): el relleno de la pieza pasa a estar en todos los estados, y el halo en reposo baja de intensidad para que el paso a hover se note más. VIS-R13, VIS-R14 y tabla de §4.4. Los valores de hover y activo no cambian. |
| 2026-10-13 | 2.5 | Por decisión del autor al revisar M5 (D-71): el aura deja de tener línea de contorno y pasa a ser un halo que rodea la pieza. VIS-R13 y VIS-R14 reescritos, tabla de opacidades de §4.4 sustituida (sin columnas de trazo, valores más altos), M-03 y M-04 adaptados. El rectángulo de foco de teclado (SCN-R21) no cambia. |
| 2026-10-13 | 2.4 | Durante M5, por delegación del autor. VIS-R21: ancho máximo de la etiqueta sin hover y color de su borde según la variante. VIS-R31: sobre la escena, el anillo de foco usa el color de aura de la variante. |
| 2026-10-13 | 2.3 | Durante M4, por delegación del autor. Nuevo §4.1.6 con los tokens `print-paper` y `print-ink` para la hoja de impresión (SMP-R12). |
| 2026-10-13 | 2.2 | Por decisión del autor (D-66). Nuevo §4.1.5 con los tokens `aura-sketch` y `paper`; nuevo VIS-R44 con las propiedades `--scene-aura`, `--scene-backdrop` y `--scene-display`; VIS-R13 usa el color de aura de la variante; dos pares nuevos en la tabla de contraste. |
| 2026-10-12 | 2.1 | Confirmada por el autor el 2026-10-12. Inventario de movimiento: se añaden M-11 y M-12 (SCN). `boot-ok` se usa también en el display de diagnóstico. |
| 2026-10-12 | 1.0 | Versión inicial. Contrastes calculados sobre los valores de §4.1. Aprobada por el autor. |
| 2026-10-12 | 2.0 | Confirmada por el autor el 2026-10-12. VIS-R16 y M-03: la respiración del aura deja de ser un bucle continuo y pasa a durar 4800 ms tras hacerse visible la escena (D-34, QLT-R19). Nuevo criterio VIS-AC13. |
