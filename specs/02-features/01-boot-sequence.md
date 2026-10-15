# BOOT — Secuencia de arranque

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-15 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la pantalla inicial: un registro de arranque al estilo del kernel de Linux, generado a partir del contenido del portfolio, que dura menos de 2 segundos y da paso a la escena. Es un detalle de presentación (principio P2 de VSN): nunca retiene al visitante ni le impide llegar al contenido.

## 2. Alcance

**Incluye:** cuándo se muestra, qué líneas contiene y cómo se generan, su aspecto, su temporización, cómo se salta, la transición hacia la escena y su repetición tras un reinicio de sesión.

**No incluye:** las líneas que aporta cada sección (las define su spec, dentro de los límites de §4.2), el sonido (ver SET), ni la escena que aparece después (ver SCN).

Feature: `src/features/boot-sequence/`. Tiene las dos entradas de STR-R33: `server.ts` exporta `BootScreen` (componente de servidor) y `buildBootLog`; `index.ts` exporta `BootController` (componente de cliente).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Registro** | La lista de líneas que muestra la pantalla de arranque. |
| **Línea fija** | Línea de cabecera o de cierre, igual en todas las compilaciones. |
| **Línea de sección** | Línea que aporta una sección a través de `bootLines` (TSC-R27). |
| **Estado del arranque** | Valor del atributo `data-boot` de `<html>`: `play` (se está mostrando), `exit` (transición en curso) o `done` (terminado u omitido). |

## 4. Requisitos

### 4.1 Cuándo se muestra

| ID | Requisito |
| --- | --- |
| BOOT-R01 | El script previo al pintado (SYS-R20) escribe `data-boot="play"` si se cumplen las cuatro condiciones siguientes, y `data-boot="done"` en cualquier otro caso: (1) el modo de render es `scene`; (2) la ruta es el inicio, `/{locale}/`; (3) el almacenamiento de sesión no indica `bootSeen: true` (TSC §4.9); (4) el visitante no tiene activada la preferencia `prefers-reduced-motion: reduce`. |
| BOOT-R02 | Por tanto el arranque no se muestra en la vista simple, al entrar por la URL de una sección, en una segunda carga dentro de la misma sesión ni con movimiento reducido. |
| BOOT-R03 | Cuando la capa de escena se monta con `data-boot="done"`, `BootController` llama a `markBootSeen()`, de modo que el arranque no aparezca más tarde en esa sesión. |
| BOOT-R04 | **Repetición.** Cuando `bootSeen` pasa de `true` a `false` en el store de sesión (reinicio de sesión, ver SET) estando en modo `scene`, `BootController` vuelve a mostrar el arranque desde el principio, sea cual sea la preferencia de movimiento, porque lo ha pedido el visitante. Con movimiento reducido, las líneas se muestran todas a la vez y el arranque termina a los 400 ms. |
| BOOT-R05 | El cambio de modo de render (SYS-R17) nunca inicia el arranque. |

### 4.2 Contenido del registro

| ID | Requisito |
| --- | --- |
| BOOT-R06 | `buildBootLog(sections: readonly AnySectionDefinition[]): readonly BootLogLine[]`, en `src/features/boot-sequence/lib/build-boot-log.ts`, es una función pura que devuelve, en este orden: las dos líneas de cabecera, las líneas de cada sección en el orden recibido y las dos líneas de cierre. `BootLogLine` tiene `timestamp`, `message` y `status` (`"ok"` o `"none"`). |
| BOOT-R07 | Las líneas fijas son exactamente las de la tabla siguiente. |
| BOOT-R08 | Cada sección aporta una o dos líneas. Cada `message` mide 72 caracteres como máximo. El registro completo tiene 18 líneas como máximo. |
| BOOT-R09 | Las marcas de tiempo son sintéticas y deterministas. La primera línea lleva `0.000000`; cada línea siguiente suma al valor anterior el siguiente elemento, en orden y de forma cíclica, de esta lista de segundos: `0.142512`, `0.169532`, `0.088068`, `0.189090`, `0.066119`, `0.065229`, `0.090883`. Se escriben como en `dmesg`: entre corchetes, con seis decimales y alineadas a la derecha en un ancho de 12 caracteres, por ejemplo `[    0.000000]` y `[    0.312044]`. |
| BOOT-R10 | Una línea con `status: "ok"` muestra, a continuación del mensaje y separada por un espacio, la etiqueta `[  OK  ]`. |
| BOOT-R11 | El registro está siempre en inglés (D-10). Su contenedor lleva `lang="en"` (I18N-R33) y `aria-hidden="true"`: es decorativo y su información está en las secciones. |

| Posición | `message` | `status` |
| --- | --- | --- |
| Cabecera 1 | `Booting portfolio kernel 1.0 (juan-esteban-alvarez-garcia)` | `none` |
| Cabecera 2 | `Detecting hardware on motherboard...` | `none` |
| Cierre 1 | `Starting graphical interface...` | `ok` |
| Cierre 2 | `Reached target portfolio.target` | `ok` |

### 4.3 Presentación

| ID | Requisito |
| --- | --- |
| BOOT-R12 | `BootScreen` es un componente de servidor que renderiza todas las líneas como HTML estático dentro de la capa de escena (SYS-R46). Así la pantalla se pinta sin esperar JavaScript (QLT-R32). Solo es visible con la variante `boot-play` o `boot-exit` (SYS-R50). |
| BOOT-R13 | La pantalla cubre todo el viewport, en la capa `z-boot`, con fondo `boot-bg`. En la esquina superior izquierda, con 32 px de margen, están, de arriba abajo: la línea de contexto (BOOT-R16), la barra de progreso (BOOT-R24) y, 24 px por debajo de esta, el registro, que usa el rol tipográfico "Registro de arranque" de VIS §4.2. Las marcas de tiempo van en `boot-dim`, los mensajes en `boot-text` y la etiqueta `[  OK  ]` en `boot-ok`. Cada línea ocupa una sola línea de pantalla; lo que no quepa se corta sin puntos suspensivos. |
| BOOT-R14 | Las líneas aparecen de una en una, de arriba abajo, mediante una animación CSS de opacidad de `duration-instant` con un retardo propio por línea (animación M-01 de VIS). La línea `i`, contando desde cero, aparece a los `i × intervalo` milisegundos del primer pintado, donde `intervalo = 1400 / (N − 1)` redondeado hacia abajo y `N` es el número de líneas. La última línea aparece, por tanto, a los 1400 ms como máximo. |
| BOOT-R15 | En la esquina inferior derecha, fuera del contenedor del registro y en el idioma de la página, se muestran la indicación `boot.skipHint` en `boot-text` y un botón con el texto `boot.skipLabel`, con texto y borde de 1 px en `boot-text` (D-96). El botón es el único elemento enfocable de la pantalla. Mientras dura el arranque, el enlace de salto de la escena no se muestra. |
| BOOT-R16 | **Línea de contexto.** Sobre el registro, la pantalla muestra desde el primer pintado, sin animación y en el idioma de la página, el texto `boot.loadingAnnouncement`, con el rol "Contexto del arranque" de VIS §4.2 en `boot-text`, fuera del contenedor con `lang="en"`. Es una región con `role="status"`. Dice de quién es el sitio y que está cargando, para que quien no conoce una terminal no la tome por algo peligroso (D-96). El nombre del autor procede de `SITE.authorName` (SMP-R02). |

### 4.4 Fin, salto y transición

| ID | Requisito |
| --- | --- |
| BOOT-R17 | **Fin normal.** El arranque termina 400 ms después de que aparezca la última línea, es decir, a los 1800 ms del primer pintado como máximo. Si en ese momento el código de la escena aún no se ha cargado, termina en cuanto se cargue. El tiempo transcurrido desde el primer pintado se toma de la medida de pintado del navegador (`first-contentful-paint`). |
| BOOT-R18 | **Salto.** El arranque termina de inmediato cuando el visitante pulsa cualquier tecla que no sea solo un modificador (Mayús, Control, Alt, Meta) ni el tabulador, pulsa o toca cualquier punto de la pantalla, o activa el botón de saltar. El tabulador no salta, para que con teclado se pueda llegar al botón (BOOT-R15). Una pulsación anterior a la carga del código también cuenta: mientras `data-boot` es `play`, el script previo al pintado anota la primera en el atributo `data-boot-skip` de `<html>`, y `BootController` la atiende al iniciarse. |
| BOOT-R19 | **Transición.** Al terminar, `BootController` escribe `data-boot="exit"` y se ejecuta la animación M-02 de VIS: la pantalla de arranque se desvanece y la escena aparece. Tras un salto, el desvanecimiento del arranque dura `duration-fast` en lugar de `duration-slow`. Al acabar la animación escribe `data-boot="done"`, la pantalla deja de mostrarse (`display: none`) y se llama a `markBootSeen()`. Solo se espera al desvanecimiento de la pantalla, no a las líneas que aún no habían aparecido. |
| BOOT-R20 | Mientras `data-boot` es `play` o `exit`, la escena está montada debajo y carga su imagen, pero es inerte: no recibe foco ni eventos de puntero. |
| BOOT-R21 | Si al terminar el arranque el foco estaba en el botón de saltar, pasa al `<h1>` de la escena. Tras una repetición pasa siempre al `<h1>`, porque el control que la pidió, en el menú de ajustes, ya no existe; si el foco quedara en ningún sitio, WebKit no volvería a avanzarlo con el tabulador. En otro caso no se mueve. Si al terminar el arranque se abre la bienvenida de la escena, que es modal, el foco pasa después a su título (SCN-R51). |
| BOOT-R22 | El arranque nunca bloquea la página: si el código de la aplicación no llega a iniciarse, el temporizador de respaldo del script previo al pintado pasa a la vista simple (QLT-R43), en la que la pantalla de arranque no se muestra. |
| BOOT-R23 | En una repetición con el sonido activado, al empezar se reproduce el efecto `boot` (ver SET). En la primera visita no suena nada, porque el sonido está desactivado por defecto. |
| BOOT-R24 | **Barra de progreso.** 12 px por debajo de la línea de contexto hay una barra decorativa, con `aria-hidden="true"`, de 12 px de alto y ancho `min(480px, 100% - 64px)`: un marco de 1 px en `boot-dim` con 2 px de relleno interior y, dentro, un relleno en `boot-ok` que crece de izquierda a derecha con la animación M-13 de VIS y se completa cuando aparece la última línea del registro (BOOT-R14). En una repetición del arranque vuelve a empezar vacía. Con movimiento reducido se muestra llena desde el primer fotograma (D-96). |

### 4.5 Textos de interfaz

Espacio de nombres `boot` del diccionario de interfaz (I18N §4.3).

| Clave | Español | Inglés |
| --- | --- | --- |
| `skipLabel` | Saltar | Skip |
| `skipHint` | Cualquier tecla salta el arranque | Any key skips the boot sequence |
| `loadingAnnouncement` | Cargando el portfolio de Juan Esteban Álvarez García | Loading Juan Esteban Álvarez García’s portfolio |

Identificador de prueba (TST-R24): `data-testid="boot-screen"` en el contenedor de la pantalla. Sus partes llevan `data-part`: `log` en el contenedor del registro, `line` en cada línea y `skip` en el botón. Tras un salto, la pantalla lleva `data-skipped="true"`.

Los tiempos de BOOT-R14 y BOOT-R17 los calculan `lineDelay` y `bootDuration`, funciones puras de `lib/`, e `isSkipKey` decide qué teclas saltan (BOOT-R18).

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| BOOT-AC01 | `buildBootLog` devuelve las líneas fijas de BOOT-R07 en las posiciones primera, segunda, penúltima y última, y entre ellas las líneas de las secciones en el orden recibido. | Prueba unitaria |
| BOOT-AC02 | Las marcas de tiempo de las ocho primeras líneas son `[    0.000000]`, `[    0.142512]`, `[    0.312044]`, `[    0.400112]`, `[    0.589202]`, `[    0.655321]`, `[    0.720550]` y `[    0.811433]`. | Prueba unitaria |
| BOOT-AC03 | Con el registro real (`SECTION_LIST`): hay entre 11 y 18 líneas, cada sección aporta una o dos, y ningún `message` supera 72 caracteres. | Prueba unitaria |
| BOOT-AC04 | El HTML exportado de `/es/` contiene todas las líneas del registro dentro de un contenedor con `lang="en"` y `aria-hidden="true"`; el de `/es/cv/` no contiene la pantalla de arranque. | Prueba de exportación |
| BOOT-AC05 | En `desktop`, primera visita a `/es/`: la pantalla de arranque es visible, y deja de serlo sin intervención antes de 2600 ms desde el primer pintado, que es desde donde cuenta BOOT-R17. | Prueba E2E; el límite de tiempo, solo en Chromium y con el reloj de la página |
| BOOT-AC06 | En `desktop`, primera visita a `/es/`: pulsar una tecla de letra a los 300 ms oculta la pantalla de arranque antes de 700 ms desde la pulsación. Lo mismo al hacer clic en cualquier punto y al activar el botón "Saltar". Pulsar solo Mayús no la oculta. | Prueba E2E; el límite de tiempo, solo en Chromium y con el reloj de la página |
| BOOT-AC07 | El arranque no se muestra: al recargar `/es/` en la misma sesión; al abrir directamente `/es/projects/` y cerrar después el panel; con la emulación de movimiento reducido activa; ni en `mobile`. | Prueba E2E |
| BOOT-AC08 | Con todas las peticiones de archivos `.js` bloqueadas, en `desktop` las primeras líneas del registro son visibles antes de un segundo. | Prueba E2E |
| BOOT-AC09 | Mientras el arranque es visible, tabular solo alcanza el botón "Saltar", y ningún elemento de la escena recibe un clic. | Prueba E2E |
| BOOT-AC10 | Tras reiniciar la sesión desde los ajustes, el arranque vuelve a mostrarse y, al terminar, `sessionStorage` contiene `bootSeen: true`. | Prueba E2E |
| BOOT-AC11 | Con movimiento reducido activo, reiniciar la sesión muestra el arranque con todas las líneas visibles desde el primer fotograma y este termina antes de 800 ms. | Prueba E2E; el límite de tiempo, solo en Chromium y con el reloj de la página |
| BOOT-AC12 | En `/es/`, la indicación y el botón de saltar están en español y fuera del contenedor con `lang="en"`, y la línea de contexto dice "Cargando el portfolio de Juan Esteban Álvarez García", también fuera de él, y está en una región con `role="status"`. | Prueba E2E |
| BOOT-AC13 | En `desktop`, primera visita a `/es/`: la línea de contexto y la barra de progreso son visibles encima del registro; la barra tiene `aria-hidden="true"` y la duración de su animación es la del retardo de la última línea del registro; con movimiento reducido, la barra está llena y sin animación. | Prueba E2E |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Máximo 1,8 segundos y salto con cualquier tecla o clic** (D-10). | Es una demostración de cuidado por el detalle, no contenido. Quien tiene prisa no debe pagarla; quien la mira ve algo coherente con el tema del sitio. |
| **Solo en la primera visita al inicio** (BOOT-R01). | Quien llega por un enlace a una sección quiere esa sección. Quien vuelve ya lo vio. |
| **Líneas renderizadas en el servidor y reveladas con CSS** (BOOT-R12, BOOT-R14). | La pantalla aparece con el primer pintado, antes de que llegue el JavaScript, y hace de indicador de carga real mientras se descargan el código y la imagen de la escena. |
| **Registro generado desde las secciones** (BOOT-R06). | Lo que se lee en el arranque es verdad porque sale de los mismos datos que el resto del sitio (principio P4). Cambiar un proyecto cambia su línea sin tocar este feature. |
| **Marcas de tiempo sintéticas y fijas.** | Dan el aspecto de `dmesg` y hacen que el HTML generado sea idéntico en cada compilación, lo que permite probarlo. |
| **Omitido con movimiento reducido, salvo que el visitante lo pida** (BOOT-R01, BOOT-R04). | Una sucesión rápida de líneas es justo el tipo de movimiento que esa preferencia pide evitar. Si el visitante pulsa "Reiniciar sesión", se le muestra sin animación. |
| **Registro oculto a los lectores de pantalla.** | Leer dieciocho líneas técnicas en inglés antes del contenido sería un obstáculo. Se anuncia solo que el portfolio se está iniciando. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-15 | 2.0 | Por decisión del autor (D-96): un visitante que no conoce la tecnología se asustó al ver la terminal y pensó en un ataque. Sin quitar ni alargar la animación, la pantalla dice de qué se trata: BOOT-R16, la línea de contexto pasa de solo para lectores de pantalla a visible, encima del registro, con el texto "Cargando el portfolio de Juan Esteban Álvarez García"; nuevo BOOT-R24, una barra de progreso que se llena al ritmo de las líneas; BOOT-R15, la indicación y el botón de saltar, en `boot-text`, más visibles. BOOT-R13: orden de la pantalla. BOOT-AC12 ampliado y nuevo BOOT-AC13. |
| 2026-10-14 | 1.2 | Por decisión del autor (D-92). BOOT-R21: cuando al terminar el arranque se abre la bienvenida, el foco termina en su título. |
| 2026-10-13 | 1.1 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). Sin cambio de requisitos. |
| 2026-10-13 | 1.1 | Durante M7, por delegación del autor (D-74). BOOT-R18: el tabulador no salta el arranque, porque BOOT-AC09 exige poder llegar con él al botón; y una pulsación anterior a la carga del código cuenta, anotada por el script previo al pintado. BOOT-R15: el enlace de salto de la escena se oculta durante el arranque. BOOT-R19 precisado. §4.5: atributos de prueba y funciones de `lib/`. BOOT-AC05: los 2600 ms cuentan desde el primer pintado, como BOOT-R17, y se miden con el reloj de la página. BOOT-R17: reloj del primer pintado. BOOT-R21: tras una repetición el foco va al título de la escena. BOOT-AC05, AC06 y AC11: sus límites de tiempo se miden solo en Chromium (TST-R22). |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
