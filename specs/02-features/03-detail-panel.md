# PNL — Panel de detalle

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.2 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST, SCN |

## 1. Propósito

Especificar el modal que muestra una sección sobre la escena: cómo se abre y se cierra, cómo se navega entre secciones sin volver a la placa, cómo gestiona el foco y el historial del navegador, y cómo registra las secciones visitadas.

## 2. Alcance

**Incluye:** el marco del panel, apertura y cierre, navegación anterior/siguiente, fragmentos de URL, foco, anuncios para lectores de pantalla, registro de visitas y sonido asociado.

**No incluye:** el contenido de cada sección (ver su spec), el aspecto del panel (ver VIS §4.5.2), ni la vista simple, donde las secciones se muestran sin panel (ver SMP).

Feature: `src/features/detail-panel/`. `index.ts` exporta el componente de cliente `DetailPanel`. No tiene `server.ts`: no lee el registro.

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Sección actual** | La que indica la URL (`parsePath`, TSC §4.10). Si la URL es el inicio, no hay sección actual y el panel está cerrado. |
| **Contenido** | El componente de servidor de la sección actual, que llega a `DetailPanel` como `children` desde la página, a través de `SceneLayer` (SYS-R46). |
| **Entrada directa** | La página se cargó en el navegador con la URL de una sección, sin navegación previa dentro del sitio. |

## 4. Requisitos

### 4.1 Estructura

| ID | Requisito |
| --- | --- |
| PNL-R01 | `DetailPanel` vive dentro de `SceneLayer`, en el layout, y por eso no se desmonta al cambiar de sección. Recibe `sections: readonly SectionNavItem[]` (SCN-R05), las cadenas de interfaz y, como `children`, el contenido. |
| PNL-R02 | El panel es un elemento `<dialog>` nativo abierto con `showModal()`. Tiene `aria-labelledby` apuntando a su título. Su aspecto es el de VIS §4.5.2 y su capa, `z-panel`. El `<dialog>` ocupa todo el viewport y es transparente; el velo y el marco son hijos suyos, de modo que ambos se animan como cualquier elemento y un clic en el velo se distingue de un clic en el marco. |
| PNL-R03 | La página de sección (`[section]/page.tsx`) renderiza únicamente el componente de la sección con `idScope="panel-"` (TSC-R33). La página de inicio no renderiza nada. |
| PNL-R04 | **Cabecera:** el título de la sección actual como `<h2>` con `tabindex="-1"`; un chip con el nombre de la pieza de hardware; y el botón de cerrar, con el icono `close` y el nombre accesible `panel.closeAriaLabel`. |
| PNL-R05 | **Pie:** un enlace a la sección anterior, un indicador de posición y un enlace a la sección siguiente (§4.3). |
| PNL-R06 | **Zona de contenido:** contiene el contenido dentro de un `<div>` con scroll vertical propio. Es enfocable (`tabindex="0"`) cuando su contenido desborda, para poder desplazarla con el teclado. |
| PNL-R25 | `DetailPanel` admite una propiedad `toolbar`, con controles que deben seguir al alcance mientras el panel está abierto. Un diálogo modal deja inerte el resto de la página, así que los dibuja dentro del `<dialog>`, sobre el velo. `SceneLayer` le pasa la barra fija (SET-R02). El panel no conoce su contenido. Al dibujar una sección, el foco pasa al título salvo que ya esté en uno de esos controles, como ocurre tras un cambio de idioma (I18N-R27). |

### 4.2 Apertura y cierre

| ID | Requisito |
| --- | --- |
| PNL-R07 | El panel está abierto si y solo si hay sección actual y el modo de render es `scene`. Abrir y cerrar son siempre consecuencia de un cambio de URL (SYS-R24); el panel no tiene estado propio de "abierto". |
| PNL-R08 | **Abrir.** Cuando aparece una sección actual, el panel llama a `showModal()`, ejecuta la animación M-06 y lleva el foco al título. En una entrada directa no hay animación de apertura. |
| PNL-R09 | **Cerrar.** El panel se cierra con el botón de cerrar, con Esc o con un clic en el velo, fuera del marco. Las tres acciones hacen lo mismo: se ejecuta la animación de cierre de M-06 y, al terminar, se navega según PNL-R10. |
| PNL-R10 | **Historial.** Abrir una sección desde la escena añade una entrada al historial. Pasar a la sección anterior o siguiente la **reemplaza**. Cerrar equivale a "Atrás" del navegador si el panel se abrió navegando dentro del sitio; en una entrada directa, cerrar navega al inicio del idioma (`homePath`) reemplazando la entrada. Así, desde cualquier panel, un solo "Atrás" devuelve a la escena y el historial no acumula una entrada por cada sección recorrida. |
| PNL-R11 | El botón "Atrás" del navegador con el panel abierto lo cierra con la misma animación (SYS-AC09). En ese caso la URL ya ha cambiado cuando empieza la animación: mientras dura, el `<dialog>` deja de ser modal y queda inerte, para que la página responda y el foco pueda volver a la escena (SCN-R38). |
| PNL-R12 | Esc cierra el panel aunque el foco esté dentro del contenido. El comportamiento por defecto del `<dialog>` ante Esc se intercepta para que la animación y la navegación de PNL-R09 se ejecuten. Si aun así el navegador cierra el `<dialog>` por su cuenta, el panel navega de inmediato, sin animación. |
| PNL-R13 | Si el modo de render pasa a `simple` con el panel abierto, el panel se cierra sin animación y sin navegar: la URL se conserva y la vista simple muestra esa sección (SYS-R18). Si vuelve a `scene`, el panel se abre sin animación. |
| PNL-R14 | Con el panel abierto, el resto de la página es inerte: no recibe foco ni eventos (lo garantiza `showModal()`), y la página no hace scroll. |

### 4.3 Navegación entre secciones

| ID | Requisito |
| --- | --- |
| PNL-R15 | El orden de navegación es el de `sections`: las siete secciones en orden canónico. Es circular: la anterior a la primera es la última, y la siguiente a la última es la primera. |
| PNL-R16 | Los controles anterior y siguiente son enlaces (`<a>`) a la ruta de la sección de destino. Su texto visible es el título de esa sección, precedido o seguido del icono `chevron-left` o `chevron-right`. Sus nombres accesibles son `panel.previousAriaLabel({ title })` y `panel.nextAriaLabel({ title })`. |
| PNL-R17 | El indicador de posición muestra `panel.positionLabel({ position, total })`, donde `position` es el lugar de la sección actual en `sections`, contando desde 1, y `total` es 7. Su texto para lectores de pantalla es `panel.positionAriaLabel({ position, total })`. |
| PNL-R18 | Al cambiar de sección, el marco y el velo permanecen; solo cambian el título, el chip y el contenido, con la animación M-07. El scroll de la zona de contenido vuelve al principio y el foco pasa al nuevo título. |
| PNL-R19 | No hay atajos de teclado para anterior y siguiente (QLT-R10): se usan los enlaces del pie. |

### 4.4 Fragmentos

| ID | Requisito |
| --- | --- |
| PNL-R20 | Si la URL tiene un fragmento (SYS-R11), tras abrirse el panel o cambiar de sección la zona de contenido se desplaza hasta el elemento cuyo `id` es `panel-` seguido del fragmento, y ese elemento recibe el foco si es enfocable. Solo se desplaza la zona de contenido. Si no existe tal elemento, el fragmento se ignora. |
| PNL-R21 | Los enlaces del contenido que apuntan a otra sección del sitio (por ejemplo, de Experiencia a un proyecto) navegan dentro del panel, reemplazando la entrada del historial como anterior y siguiente. |

### 4.5 Visitas, anuncios y sonido

| ID | Requisito |
| --- | --- |
| PNL-R22 | Cada vez que el panel muestra una sección primaria, llama a `markVisited` con su `componentId` (TSC §4.9). La sección `about` no se registra. |
| PNL-R23 | El cambio de sección se anuncia a los lectores de pantalla por el traslado del foco al título (PNL-R08, PNL-R18) y por el cambio del título del documento (ver SMP). No se usa una región viva adicional. |
| PNL-R24 | Con el sonido activado, el panel reproduce el efecto `open` al abrirse, `close` al cerrarse y `step` al cambiar de sección (ver SET). |

### 4.6 Textos de interfaz

Espacio de nombres `panel` del diccionario de interfaz.

| Clave | Español | Inglés |
| --- | --- | --- |
| `closeAriaLabel` | Cerrar | Close |
| `previousAriaLabel({ title })` | Sección anterior: {title} | Previous section: {title} |
| `nextAriaLabel({ title })` | Sección siguiente: {title} | Next section: {title} |
| `positionLabel({ position, total })` | {position} / {total} | {position} / {total} |
| `positionAriaLabel({ position, total })` | Sección {position} de {total} | Section {position} of {total} |

Identificador de prueba: `data-testid="panel-content"` en la zona de contenido. El `<dialog>` expone además `data-phase` con el momento en que está (`closed`, `opening`, `open`, `leaving`, `entering`, `closing` o `navigating`), y el velo lleva `data-part="veil"`.

El panel no tiene un estado propio de "abierto" (PNL-R07): `panelReducer`, función pura de `lib/`, deriva de los cambios de ruta lo único que la ruta no dice, que es qué animación está en curso y quién inició un cierre. `findNeighbours`, también en `lib/`, calcula la sección anterior, la siguiente y la posición (PNL-R15, PNL-R17).

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| PNL-AC01 | En `desktop`, abrir Proyectos desde la escena muestra un diálogo modal cuyo nombre accesible es "Proyectos" en `/es/` y "Projects" en `/en/`, con el chip "SSD NVMe" o "NVMe SSD", y el foco está en su título. | Prueba E2E |
| PNL-AC02 | El botón de cerrar, la tecla Esc y un clic en el velo cierran el panel y dejan la URL en `/{locale}/`. Un clic dentro del marco no lo cierra. | Prueba E2E |
| PNL-AC03 | Tras abrir Perfil desde la escena y pulsar "siguiente" tres veces, un solo "Atrás" del navegador devuelve a `/{locale}/` con el panel cerrado. | Prueba E2E |
| PNL-AC04 | En una entrada directa a `/es/projects/`, cerrar el panel deja la URL en `/es/` y "Atrás" no vuelve a abrir el panel. | Prueba E2E |
| PNL-AC05 | Desde Perfil, "siguiente" recorre Experiencia, Proyectos, Stack tecnológico, Contacto, Ecosistema personal, Acerca de este sitio y de nuevo Perfil; "anterior" recorre el orden inverso. El indicador muestra de "1 / 7" a "7 / 7". | Prueba E2E |
| PNL-AC06 | Al pasar de una sección a otra, el elemento `<dialog>` es el mismo nodo del DOM, la zona de contenido queda con el scroll en 0 y el foco está en el nuevo título. | Prueba E2E |
| PNL-AC07 | Los enlaces anterior y siguiente tienen como texto visible el título de la sección de destino y como nombre accesible "Sección anterior: …" o "Sección siguiente: …". | Prueba E2E |
| PNL-AC08 | Con el panel abierto, tabular cuarenta veces nunca enfoca un elemento exterior al diálogo, y la página no tiene scroll (QLT-AC04). | Prueba E2E |
| PNL-AC09 | Abrir `/es/projects/#projects-habicapital` desplaza la zona de contenido hasta que el elemento `panel-projects-habicapital` queda visible dentro de ella. Un fragmento inexistente no produce error. | Prueba E2E |
| PNL-AC10 | Abrir Perfil y Proyectos añade `cpu` y `ssd` a `visited` en `sessionStorage`; abrir "Acerca de este sitio" no añade nada. | Prueba E2E |
| PNL-AC11 | Con el panel de Proyectos abierto en `desktop`, redimensionar a `mobile` cierra el diálogo, conserva la URL y muestra la vista simple desplazada a Proyectos; al volver a `desktop`, el diálogo está abierto. | Prueba E2E |
| PNL-AC12 | En el HTML exportado de `/es/projects/` no hay ningún elemento `<dialog>` (SYS-AC17). | Prueba de exportación |
| PNL-AC13 | Con una sección cuyo contenido es más alto que la zona de contenido, esta tiene `tabindex="0"` y se desplaza con las teclas de flecha; la cabecera y el pie siguen visibles (VIS-AC10). | Prueba E2E |
| PNL-AC14 | Con la emulación de movimiento reducido, abrir, cerrar y cambiar de sección no aplican transformaciones y ninguna transición supera 150 ms (VIS-AC05). | Prueba E2E |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Modal centrado con `<dialog>` nativo** (D-09). | `showModal()` da la captura del foco, el fondo inerte y la capa superior sin librería ni código propio que mantener, y es el patrón que los lectores de pantalla anuncian correctamente. |
| **El estado del panel es la URL** (PNL-R07). | Un solo dueño del estado: los enlaces compartidos, el botón "Atrás" y el cambio de idioma funcionan sin lógica adicional. |
| **Anterior y siguiente reemplazan la entrada del historial** (PNL-R10). | Quien recorre las siete secciones espera volver a la placa con un "Atrás", no deshacer siete pasos. |
| **Navegación circular por las siete secciones** (PNL-R15). | Un reclutador puede leer el perfil completo sin volver a la escena. Incluir "Acerca de este sitio" al final lleva a quien llega hasta ahí a cómo está hecho el portfolio. |
| **Los enlaces muestran el título de destino** (PNL-R16). | "Proyectos ›" dice más que "Siguiente ›" y ocupa lo mismo. |
| **El panel vive en el layout y el contenido llega como `children`** (PNL-R01). | El panel persiste entre secciones, lo que permite animar el cambio de contenido, y cada sección sigue siendo un componente de servidor que no añade JavaScript. |
| **Sin atajos de teclado propios** (PNL-R19). | Evita conflictos con los atajos de los lectores de pantalla y con el scroll por teclado del contenido. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.2 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). El autor revisó el panel y leyó en él las siete secciones (A4) el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-13 | 1.2 | Durante M7, por delegación del autor (D-73). Nuevo PNL-R25: la propiedad `toolbar`, con la que la barra fija sigue operable con el panel abierto; sin ella no había forma de cambiar de idioma con una sección abierta (VSN-AC06, I18N-AC11). |
| 2026-10-13 | 1.1 | Durante M6, por delegación del autor. PNL-R02: el `<dialog>` cubre el viewport y el velo es un hijo suyo. PNL-R11: al cerrar con "Atrás", el diálogo deja de ser modal durante la animación para que el foco vuelva a la escena. PNL-R12: cierre forzado por el navegador. PNL-R20: el fragmento se aplica también al cambiar de sección. §4.6: atributos de prueba y funciones de `lib/`. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
