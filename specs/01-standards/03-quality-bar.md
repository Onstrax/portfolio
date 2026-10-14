# QLT — Listón de calidad

| Campo | Valor |
| --- | --- |
| Estado | En revisión |
| Versión | 3.0 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N |

## 1. Propósito

Fijar los mínimos de accesibilidad, rendimiento, robustez y privacidad que debe cumplir todo el sitio, con umbrales numéricos y un método de comprobación para cada uno. Una funcionalidad que hace lo que dice su spec pero incumple este listón no está terminada.

Quien evalúe técnicamente el portfolio abrirá las herramientas de desarrollo. Este documento describe lo que debe encontrar.

## 2. Alcance

**Incluye:** requisitos de accesibilidad, presupuestos y métricas de rendimiento, mínimos de metadatos, robustez ante fallos, privacidad y seguridad en el navegador, matriz de viewports y definición de "terminado".

**No incluye:** cómo se escriben y ejecutan las pruebas (ver TST), los valores de color y movimiento (ver VIS), la implementación de los metadatos (ver SMP) ni las cabeceras del servidor (ver DEP).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Estado auditable** | Una combinación de página, viewport y situación de la interfaz que se somete a las comprobaciones de este documento (tabla de §4.1.7). |
| **Carga inicial** | Todo lo que el navegador descarga desde que empieza la navegación hasta que la página queda en reposo, sin que el visitante haya interactuado. |
| **Peso** | Tamaño de un recurso comprimido con gzip de nivel 9. Las fuentes `woff2` y las imágenes se miden tal cual, porque ya están comprimidas. |
| **Base del marco** | El JavaScript de Next.js y React que carga cualquier página aunque no tenga código propio. Medido el 2026-10-12 con Next.js 16.4.0 y React 19.3.0: 171 kB. |
| **Preajuste** | Configuración de Lighthouse que simula un tipo de dispositivo: `desktop` (pantalla de 1350×940 px, sin limitación) o `mobile` (pantalla de 412×823 px, red 4G lenta y CPU cuatro veces más lenta). Lighthouse puede **estimar** el efecto de esa limitación con un modelo, que es su modo por defecto, o **aplicarla** de verdad al navegador mientras carga la página (QLT-R30). |

## 4. Requisitos

### 4.1 Accesibilidad

| ID | Requisito |
| --- | --- |
| QLT-R01 | Todas las páginas, en ambos modos de render y en todos sus estados, DEBEN cumplir WCAG 2.2 nivel AA. |

#### 4.1.1 Estructura y semántica

| ID | Requisito |
| --- | --- |
| QLT-R02 | Cada página tiene exactamente un elemento `<main>` expuesto a las tecnologías de apoyo. El primer elemento enfocable de cada página es un enlace "saltar al contenido" que lleva a `<main>`. |
| QLT-R03 | En cada modo de render hay exactamente un `<h1>` expuesto. En modo `scene` es un `<h1>` de la capa de escena, visible solo para lectores de pantalla; en modo `simple` es el nombre del autor. Los títulos de sección son `<h2>` y los encabezados interiores `<h3>` y `<h4>` (TSC-R29). No se salta ningún nivel. |
| QLT-R04 | Se usan elementos nativos: `<a>` para navegar, `<button>` para actuar, `<dialog>` para el panel. NO DEBEN usarse elementos sin semántica con manejadores de clic, valores positivos de `tabindex`, ni atributos `role` que contradigan el elemento. ARIA se usa solo cuando no existe un elemento nativo equivalente. |
| QLT-R05 | La capa que no corresponde al modo activo y el contenido tras un panel abierto NO DEBEN ser alcanzables con teclado ni con lector de pantalla (`display: none` o `inert`). |

#### 4.1.2 Teclado y foco

| ID | Requisito |
| --- | --- |
| QLT-R06 | Toda la funcionalidad es operable solo con teclado. No existe ninguna trampa de foco; un panel o menú abierto retiene el foco pero siempre se cierra con Esc. |
| QLT-R07 | En la escena, el orden de tabulación es: enlace de salto; controles de la barra fija (selector de idioma, vista simple y los cuatro contactos directos de SET-R30); los dos controles de la bienvenida, mientras es visible (SCN-R51); y, después, los ocho elementos interactivos en este orden: `cpu`, `psu`, `ssd`, `ram`, `io`, `fan`, `cmos`, `settings` (el orden canónico de VSN §4, seguido del panel frontal). El orden no depende de la posición de cada pieza en la imagen. |
| QLT-R08 | Al abrir un panel o un menú, el foco pasa a su interior. Al cerrarlo, el foco vuelve al elemento que lo abrió. Esc cierra el elemento abierto más reciente. |
| QLT-R09 | El anillo de foco es siempre visible (VIS-R31) y el elemento con foco nunca queda tapado por la barra fija ni por otra capa. |
| QLT-R10 | No hay atajos de una sola tecla, salvo durante la secuencia de arranque, en la que cualquier tecla la salta. |

#### 4.1.3 Puntero

| ID | Requisito |
| --- | --- |
| QLT-R11 | Toda área pulsable mide al menos 44×44 px (VIS-R30; para las zonas de la escena, AST §4.2). |
| QLT-R12 | El contenido que aparece al pasar el cursor o al recibir foco (las etiquetas de la escena) DEBE poder descartarse con Esc sin mover el cursor, permanecer visible mientras el cursor esté sobre él y no desaparecer por tiempo. La información que muestra DEBE estar también en el nombre accesible del elemento. |
| QLT-R13 | Ninguna función depende solo del hover, de arrastrar ni de gestos con varios dedos. |

#### 4.1.4 Percepción

| ID | Requisito |
| --- | --- |
| QLT-R14 | El contraste cumple VIS §4.1.4. El aura se distingue de su entorno en todo su perímetro, en las dos variantes de la escena (AST-AC12). |
| QLT-R15 | Con el zoom del navegador al 200 % y al 400 % todo el contenido sigue disponible y sin scroll horizontal. Con el texto ampliado según WCAG 1.4.12 (interlineado 1,5; espaciado entre párrafos 2; entre letras 0,12; entre palabras 0,16) no se recorta ni se solapa ningún texto. |
| QLT-R16 | La imagen de la escena es decorativa (`alt=""`): su función la transmiten los elementos interactivos. La fotografía del autor lleva un texto alternativo que procede del contenido. |
| QLT-R17 | En el modo de colores forzados del sistema (`forced-colors: active`), los controles, el anillo de foco y los límites del panel DEBERÍAN seguir siendo visibles. |

#### 4.1.5 Movimiento, tiempo y sonido

| ID | Requisito |
| --- | --- |
| QLT-R18 | Se respeta `prefers-reduced-motion` según VIS-R36. |
| QLT-R19 | Ninguna animación que empiece sin intervención del visitante dura más de 5 segundos ni se repite en bucle (WCAG 2.2.2). |
| QLT-R20 | Nada parpadea más de tres veces por segundo. |
| QLT-R21 | El sitio no impone límites de tiempo. La secuencia de arranque dura 2 segundos como máximo y se puede saltar. |
| QLT-R22 | No se reproduce ningún sonido sin que el visitante lo haya activado. |

#### 4.1.6 Lectores de pantalla

| ID | Requisito |
| --- | --- |
| QLT-R23 | Todo elemento interactivo tiene un nombre accesible que describe su función. El de cada pieza de la escena incluye el nombre de la pieza y el de su sección. |
| QLT-R24 | Los cambios de estado se comunican: un panel se anuncia con su título al abrirse; el cambio del contador de secciones visitadas se anuncia en una región viva de prioridad baja; los controles de dos estados (sonido) exponen su estado; la secuencia de arranque no retiene el foco ni impide leer la página. |
| QLT-R25 | El idioma de la página y de sus partes se declara según I18N §4.7. |

#### 4.1.7 Verificación

| ID | Requisito |
| --- | --- |
| QLT-R26 | El análisis automático con axe, con las reglas de las etiquetas `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa` y `wcag22aa`, NO DEBE encontrar ninguna infracción, de ninguna severidad, en ninguno de los estados auditables de la tabla siguiente. |
| QLT-R27 | NO DEBE desactivarse ninguna regla de axe ni excluirse ningún elemento del análisis sin registrar aquí la regla, el elemento y la razón. A la fecha de esta versión no hay ninguna excepción. |
| QLT-R28 | Antes de la primera publicación, y antes de cada publicación que cambie la interfaz, el autor realiza la auditoría manual de §4.8. El análisis automático no la sustituye. |

| Estado auditable | Página | Viewport | Idiomas |
| --- | --- | --- | --- |
| Arranque visible | `/{locale}/`, primera visita | 1280×720 | es |
| Escena en reposo | `/{locale}/` | 1280×720 | es, en |
| Escena en reposo, variante boceto | `/{locale}/`, con `sceneVariant: "sketch"` guardado | 1280×720 | es |
| Escena con una etiqueta visible | `/{locale}/`, foco en `cpu` | 1280×720 | es |
| Panel abierto, uno por sección | `/{locale}/{section}/`, las siete | 1280×720 | es, en |
| Menú de ajustes abierto | `/{locale}/` | 1280×720 | es, en |
| Escena con la bienvenida visible | `/{locale}/`, sesión nueva, al terminar el arranque | 1280×720 | es, en |
| Escena con la bienvenida visible, variante boceto | `/{locale}/`, sesión nueva, con `sceneVariant: "sketch"` guardado | 1280×720 | es |
| Caso de estudio, uno por proyecto | `/{locale}/projects/{case}/`, los tres | 1280×720 | es, en |
| Caso de estudio en un teléfono | `/{locale}/projects/thesis/` | 390×844 | es |
| Vista simple | `/{locale}/cv/` | 1280×720 y 390×844 | es, en |
| Inicio en modo simple | `/{locale}/` | 390×844 | es, en |
| Página de entrada sin JavaScript | `/` | 1280×720 | — |
| Página 404 | `/es/unknown/` | 1280×720 | — |

### 4.2 Rendimiento

| ID | Requisito |
| --- | --- |
| QLT-R29 | Lighthouse DEBE alcanzar las puntuaciones de la tabla siguiente en cada página y preajuste indicados. Cada medición es la mediana de tres ejecuciones sobre el sitio exportado. |
| QLT-R30 | Las métricas de laboratorio DEBEN respetar los límites de la segunda tabla, también como mediana de tres ejecuciones. Se toman de esas mismas ejecuciones, con una excepción: el Largest Contentful Paint del preajuste `mobile` se mide en una pasada aparte, con la red y el procesador limitados de verdad en el navegador. En las demás, Lighthouse carga la página sin limitación y estima con un modelo cuánto habría tardado; para estas páginas, esa estimación sitúa el pintado del texto bastante más tarde de lo que se mide al aplicar la limitación (ver el historial, versión 2.3). |
| QLT-R31 | La capa de escena DEBE registrar la marca `scene:ready` con `performance.mark` en el momento en que la imagen está decodificada y las zonas admiten interacción. En Chromium a 1280×720 px, sin limitación de red, `scene:ready` ocurre como máximo 3000 ms después del inicio de la navegación en una primera visita (con arranque) y 1200 ms cuando el arranque se omite. |
| QLT-R32 | El primer pintado NO DEBE depender de JavaScript descargado: la vista simple y la primera pantalla del arranque se pintan con el HTML y el CSS del servidor más el script previo al pintado. |
| QLT-R33 | Los recursos de la carga inicial DEBEN respetar los presupuestos de peso de la tercera tabla. Un presupuesto solo se cambia modificando esta spec. |
| QLT-R34 | El código de la capa de escena (escena, arranque, panel, menú de ajustes) se carga bajo demanda y solo en modo `scene`. Los sonidos se sintetizan en el navegador (ver SET): no hay archivos de audio, y no se crea ningún contexto de audio mientras el sonido está desactivado. La imagen de la escena no se solicita en modo `simple` (SYS-R16). |
| QLT-R35 | Toda imagen declara su ancho y su alto, y las fuentes usan el ajuste de métricas de respaldo de `next/font`, de modo que la carga no desplace el contenido. |
| QLT-R36 | En la carga inicial se descargan como máximo dos archivos de fuente. |

| Página | Preajuste | Rendimiento | Accesibilidad | Buenas prácticas | SEO |
| --- | --- | --- | --- | --- | --- |
| `/es/` (escena) | `desktop` | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 |
| `/en/projects/` (escena con panel) | `desktop` | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 |
| `/es/` (vista simple) | `mobile` | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 |
| `/en/cv/` (vista simple) | `mobile` | ≥ 90 | ≥ 95 | ≥ 95 | ≥ 95 |

| Métrica | Preajuste `desktop` | Preajuste `mobile` |
| --- | --- | --- |
| Largest Contentful Paint | ≤ 2,5 s | ≤ 2,5 s |
| Cumulative Layout Shift | ≤ 0,02 | ≤ 0,02 |
| Total Blocking Time | ≤ 200 ms | ≤ 350 ms |

| Recurso de la carga inicial | Presupuesto |
| --- | --- |
| JavaScript total, modo `simple` (`/{locale}/` a 390×844 px, `/{locale}/cv/` y las páginas de caso) | ≤ 195 kB |
| JavaScript total, modo `scene` (`/{locale}/` a 1280×720 px, primera visita) | ≤ 250 kB |
| CSS total | ≤ 20 kB |
| Documento HTML de cualquier página | ≤ 45 kB |
| Fuentes | ≤ 95 kB en total |
| Imagen de la escena | El máximo de su derivado en AST §4.7 |
| Total transferido, modo `simple` a 390×844 px | ≤ 420 kB |
| Total transferido, modo `scene` a 1920×1080 px, primera visita | ≤ 800 kB |

Los presupuestos de JavaScript parten de la base del marco (171 kB): dejan 24 kB para el código propio en modo `simple` y 79 kB para el código propio en modo `scene`. El script de analítica (ver DEP) no cuenta en estos presupuestos.

### 4.3 Metadatos

SMP implementa estos mínimos.

| ID | Requisito |
| --- | --- |
| QLT-R37 | Cada página tiene un título único de 60 caracteres como máximo y una descripción única de entre 50 y 160 caracteres, en su idioma. |
| QLT-R38 | Cada página de `/{locale}/…` cumple I18N §4.6 y declara una imagen para compartir de 1200×630 px. |
| QLT-R39 | El sitio publica `robots.txt` y `sitemap.xml`, no marca ninguna página de contenido como no indexable y publica datos estructurados de tipo `Person` válidos según schema.org. |

### 4.4 Robustez

| ID | Requisito |
| --- | --- |
| QLT-R40 | Durante cualquier recorrido del sitio compilado para producción NO DEBE aparecer en la consola ningún error ni advertencia (incluidos los de hidratación de React), ninguna excepción sin capturar, ninguna promesa rechazada sin tratar ni ninguna petición fallida. |
| QLT-R41 | Sin JavaScript, el sitio muestra la vista simple completa y todos sus enlaces funcionan (VSN-AC03). |
| QLT-R42 | Con el almacenamiento del navegador inaccesible, el sitio funciona con los valores por defecto (SYS-R27). |
| QLT-R43 | **Fallo de carga del JavaScript.** Si 5 segundos después de ejecutarse el script previo al pintado el código de la aplicación aún no se ha iniciado (por ejemplo, porque la red bloqueó un archivo), la página DEBE pasar a `data-mode="simple"` para que el visitante vea la vista simple en lugar de la pantalla de arranque detenida. El temporizador vive en el script previo al pintado (SYS-R20). |
| QLT-R44 | **Fallo en la capa de escena.** Si un componente de la capa de escena lanza una excepción durante el render o en un efecto, la página DEBE mostrar la vista simple, no una pantalla en blanco ni un mensaje de error técnico. |
| QLT-R45 | Una URL inexistente muestra la página 404 con enlaces al inicio en ambos idiomas (I18N §4.3.2). |

### 4.5 Privacidad y seguridad en el navegador

| ID | Requisito |
| --- | --- |
| QLT-R46 | El sitio no usa cookies, no guarda en el navegador nada distinto de las dos claves de SYS §4.6 y no realiza peticiones a terceros, salvo la analítica que defina DEP. |
| QLT-R47 | Las imágenes publicadas (escena, fotografía, imagen para compartir) NO DEBEN contener metadatos EXIF, XMP ni de ubicación. `assets:build` los elimina y `assets:check` lo comprueba. |
| QLT-R48 | `dangerouslySetInnerHTML` solo PUEDE usarse en tres lugares: el script previo al pintado, el script de redirección de `/` y los datos estructurados. En los tres, el contenido se genera en compilación a partir de constantes del proyecto, nunca a partir de la URL ni de datos del visitante. |
| QLT-R49 | NO DEBEN usarse `eval`, `new Function` ni manejadores de eventos en atributos HTML, de modo que el sitio sea compatible con una política de seguridad de contenido estricta (ver DEP). |

### 4.6 Matriz de viewports

| ID | Requisito |
| --- | --- |
| QLT-R50 | Las pruebas y las specs se refieren a los viewports por los nombres de la tabla siguiente. El comportamiento DEBE ser correcto en todos ellos. |

| Nombre | Tamaño (px) | Modo esperado | Por qué se prueba |
| --- | --- | --- | --- |
| `desktop` | 1280×720 | `scene` | Referencia; se ejecuta en los tres motores |
| `desktop-min` | 1024×600 | `scene` | Mínimo admitido para la escena (SYS-R12) |
| `desktop-hd` | 1920×1080 | `scene` | Pantalla completa habitual |
| `ultrawide` | 2560×1080 | `scene` | Más ancho que 16:9: franjas a los lados (AST-R03) |
| `classic` | 1024×768 | `scene` | Más estrecho que 16:9: franjas arriba y abajo (AST-R03) |
| `short` | 1280×500 | `simple` | Altura por debajo del mínimo |
| `tablet` | 768×1024 | `simple` | Tableta en vertical |
| `mobile` | 390×844 | `simple` | Teléfono; se ejecuta en los tres motores |

### 4.7 Definición de terminado

| ID | Requisito |
| --- | --- |
| QLT-R51 | Una funcionalidad está terminada, y su spec PUEDE pasar a "Implementada", solo cuando se cumplen todos los puntos de la lista siguiente. |

1. Todos los criterios de aceptación de su spec están verificados: los automáticos con pruebas que citan su identificador (TST §4.7) y los manuales registrados en el historial de la spec.
2. `pnpm check` termina sin errores.
3. Los estados auditables que la funcionalidad añade o modifica están incluidos en el análisis de axe y pasan sin infracciones.
4. La funcionalidad se ha recorrido solo con teclado y con movimiento reducido activado.
5. Todo su texto existe en ambos idiomas y cumple I18N §4.8.
6. Los presupuestos de peso y los umbrales de Lighthouse siguen cumpliéndose.
7. No se ha añadido ninguna dependencia que no figure en SYS §4.1.
8. La spec refleja lo implementado: cualquier desviación se resolvió cambiando la spec, no el criterio.

### 4.8 Auditoría manual

| ID | Requisito |
| --- | --- |
| QLT-R52 | La auditoría manual de QLT-R28 consiste en los pasos siguientes, en ambos idiomas. Su resultado se registra en el historial de esta spec con la fecha y la versión publicada. |

1. **Teclado.** Recorrer el sitio completo sin ratón: saltar el arranque, visitar los ocho elementos de la escena, abrir y cerrar cada panel, navegar entre paneles, cambiar de idioma, activar el sonido y reiniciar la sesión. Comprobar el orden de QLT-R07 y que el foco nunca se pierde ni queda tapado.
2. **Lector de pantalla.** Repetir el recorrido con Orca y Firefox en Linux. Comprobar que cada elemento se anuncia con un nombre comprensible, que al abrir un panel se anuncia su título, que el contenido de fondo no es alcanzable y que el cambio de idioma se percibe.
3. **Zoom.** Comprobar QLT-R15 al 200 % y al 400 %.
4. **Movimiento reducido.** Activar la preferencia del sistema y comprobar que no queda ninguna animación de desplazamiento, escala o bucle.
5. **Teléfono real.** Abrir el sitio desplegado en un teléfono: vista simple legible, enlaces de contacto y descarga del CV operativos.
6. **Sin JavaScript.** Desactivarlo en el navegador y comprobar QLT-R41.
7. **Herramientas de desarrollo.** Con la consola abierta durante un recorrido completo, comprobar QLT-R40; en la pestaña de red, que no hay peticiones a terceros distintas de la analítica.

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| QLT-AC01 | axe no encuentra infracciones en ninguno de los estados auditables de §4.1.7, con las etiquetas de QLT-R26 y sin reglas desactivadas. | Prueba E2E con axe |
| QLT-AC02 | En cada página hay un solo `<main>` y un solo `<h1>` en el árbol de accesibilidad, en modo `scene` y en modo `simple`; el primer elemento que recibe foco al tabular es el enlace de salto y, al activarlo, el foco pasa a `<main>`. | Prueba E2E |
| QLT-AC03 | En `desktop`, tabular desde el inicio de la página recorre los elementos en el orden de QLT-R07. | Prueba E2E |
| QLT-AC04 | Abrir un panel con Intro desde una pieza de la escena lleva el foco al interior del panel; Esc lo cierra y el foco vuelve a esa pieza. Con el panel abierto, tabular cuarenta veces nunca enfoca un elemento exterior al panel. | Prueba E2E |
| QLT-AC05 | Ningún elemento de `src/` incumple QLT-R04: no hay manejadores `onClick` en elementos que no sean `<a>`, `<button>` u otros controles nativos, ni `tabIndex` mayor que 0. | Prueba unitaria que ejecuta ESLint con las reglas `jsx-a11y` de TST sobre fragmentos de ejemplo |
| QLT-AC06 | Con una etiqueta de la escena visible por hover, pulsar Esc la oculta sin mover el cursor; mover el cursor sobre la etiqueta no la oculta. | Prueba E2E |
| QLT-AC07 | A 1280×720 px con zoom del 200 % (viewport efectivo de 640×360 px) la página muestra la vista simple sin scroll horizontal. A 320 px de ancho no hay scroll horizontal en la vista simple. | Prueba E2E |
| QLT-AC08 | Con los valores de espaciado de texto de QLT-R15 inyectados como estilos, ningún elemento de texto de un panel ni de la vista simple tiene contenido recortado (su `scrollWidth` no supera su `clientWidth`, ni su `scrollHeight` su `clientHeight`, salvo la zona de scroll del panel). | Prueba E2E |
| QLT-AC09 | Seis segundos después de que la escena es visible, y sin interactuar, no hay ninguna animación en ejecución en la página. | Prueba E2E que consulta `document.getAnimations()` |
| QLT-AC10 | Durante una primera visita completa, con el sonido desactivado, no se crea ningún `AudioContext` ni elemento de audio, y no se solicita ningún archivo de audio. | Prueba E2E |
| QLT-AC11 | El nombre accesible de cada una de las siete piezas que abren sección contiene el nombre de la pieza y el de la sección, en el idioma de la página. | Prueba E2E |
| QLT-AC12 | Lighthouse alcanza las puntuaciones de QLT-R29 y respeta los límites de QLT-R30 en las cuatro combinaciones de página y preajuste. | Ejecución en CI de `pnpm test:lighthouse` |
| QLT-AC13 | `scene:ready` cumple los dos límites de QLT-R31. | Prueba E2E, solo en Chromium |
| QLT-AC14 | Con todas las peticiones de archivos `.js` bloqueadas, a 390×844 px se ve el contenido completo de la vista simple; a 1280×720 px, transcurridos 5,5 segundos, `<html>` tiene `data-mode="simple"` y la vista simple es visible. | Prueba E2E |
| QLT-AC15 | Los pesos de la carga inicial respetan cada presupuesto de QLT-R33, midiendo cada respuesta comprimida con gzip de nivel 9. | Prueba E2E, solo en Chromium |
| QLT-AC16 | A 390×844 px no se descarga ningún archivo JavaScript que solo se descargue en modo `scene`: el conjunto de archivos `.js` solicitados en `/es/` a 390×844 px es un subconjunto estricto del solicitado a 1280×720 px. | Prueba E2E |
| QLT-AC17 | En la carga inicial se solicitan como máximo dos archivos de fuente y su peso total respeta el presupuesto. | Prueba E2E |
| QLT-AC18 | Todo elemento `<img>` del HTML exportado tiene atributos `width` y `height`. | Prueba de exportación |
| QLT-AC19 | Cada página exportada tiene título y descripción dentro de los límites de QLT-R37, y no hay dos páginas con el mismo título ni con la misma descripción. | Prueba de exportación |
| QLT-AC20 | `out/` contiene `robots.txt` y `sitemap.xml`; ninguna página de contenido contiene `noindex`; los datos estructurados de `/es/` y `/en/` son JSON válido con `@type` igual a `Person`. | Prueba de exportación |
| QLT-AC21 | Durante las pruebas E2E no se registra ningún error ni advertencia de consola, excepción, promesa rechazada ni petición fallida. | Prueba E2E (comprobación incorporada en todas las pruebas, TST-R23) |
| QLT-AC22 | Si un componente de la capa de escena lanza una excepción, la página queda con `data-mode="simple"` y la vista simple visible. | Prueba de componente con un componente que lanza a propósito |
| QLT-AC23 | Tras un recorrido completo, `document.cookie` está vacío y las únicas claves de `localStorage` y `sessionStorage` son las de SYS §4.6. | Prueba E2E |
| QLT-AC24 | Ningún archivo de `public/scene/`, `public/portrait/` ni la imagen para compartir contiene metadatos EXIF, XMP o de ubicación. | Ejecución de `pnpm assets:check` |
| QLT-AC25 | `dangerouslySetInnerHTML` aparece en `src/` solo en los tres lugares de QLT-R48, y no aparecen `eval(`, `new Function(` ni atributos de evento en cadenas HTML. | Prueba de arquitectura |
| QLT-AC26 | En cada viewport de §4.6, `<html>` tiene el `data-mode` esperado y no hay scroll horizontal. | Prueba E2E |
| QLT-AC27 | El autor completa la auditoría manual de §4.8 antes de la primera publicación. | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **WCAG 2.2 AA como norma y axe como puerta automática** (D-19). | AA es el nivel que exigen las normativas de accesibilidad y el que un revisor técnico espera. axe detecta de forma fiable una parte de los criterios; por eso la puerta automática se complementa con la auditoría manual en lugar de sustituirla. |
| **Ninguna animación automática de más de 5 segundos** (QLT-R19, D-34). | WCAG 2.2.2 es de nivel A y exige poder pausar todo movimiento automático que dure más. Limitar la respiración del aura a sus primeros segundos cumple el criterio sin añadir un control de pausa, y deja la escena en calma mientras se leen las etiquetas. Esta decisión obligó a enmendar VIS-R16. |
| **Orden de tabulación canónico, no espacial** (QLT-R07). | La posición de las piezas depende de la imagen generada. Un orden fijo es predecible, coincide con el de la vista simple y no cambia si se regenera la imagen. |
| **Presupuestos de peso medidos sobre la base real del marco** (QLT-R33). | Next.js 16 y React 19 ocupan 171 kB antes de escribir una línea. Fijar los presupuestos a partir de esa medida los hace exigentes pero alcanzables; inventarlos habría producido límites imposibles o inútiles. |
| **Código de la escena bajo demanda** (QLT-R34, D-40). | Quien llega desde un teléfono ve la vista simple; no debe pagar la descarga de la escena ni del arranque. |
| **Marca `scene:ready` propia** (QLT-R31). | Las métricas estándar no ven la escena: mientras dura el arranque, el elemento más grande pintado es texto. La marca mide lo que importa al visitante, que es cuándo puede explorar. |
| **Vista simple como red de seguridad ante fallos** (QLT-R43, QLT-R44). | Sin estas dos reglas, un archivo bloqueado por una red corporativa o un error en la escena dejarían al visitante ante una pantalla de arranque detenida o en blanco. La vista simple ya existe en el HTML; solo hay que mostrarla. |
| **Cero errores y advertencias de consola** (QLT-R40). | Es lo primero que ve quien abre las herramientas de desarrollo, y las advertencias de hidratación suelen esconder defectos reales. |
| **Rendimiento ≥ 90 también en el preajuste móvil.** | El preajuste móvil simula un teléfono modesto en red lenta; es la condición más exigente y la que corresponde al primer contacto habitual (VSN §2). |
| **Auditoría con Orca y Firefox.** | Es el lector de pantalla disponible en el entorno de trabajo del autor (Linux). No sustituye a una prueba con otros lectores, pero detecta los defectos estructurales, que son comunes a todos. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 3.0 | Versión 2, pendiente de aprobación del autor (D-82 a D-84). QLT-R07: el orden de tabulación de la escena incluye los contactos directos de la barra fija y, mientras es visible, la bienvenida. QLT-R26: cuatro estados auditables nuevos (bienvenida, en las dos variantes, y casos de estudio en escritorio y en teléfono). §4.2: el presupuesto de JavaScript del modo `simple` se aplica también a las páginas de caso. |
| 2026-10-14 | 2.4 | QLT-AC27, paso 2: el autor repitió el recorrido con lector de pantalla y funciona. La auditoría manual de §4.8 queda completa. Sin cambio de requisitos. |
| 2026-10-13 | 2.4 | QLT-AC27, paso 5: el autor abrió el sitio desplegado en su teléfono; la vista simple se lee bien y los enlaces de contacto y la descarga del CV funcionan. Solo queda aplazado el paso del lector de pantalla (PLAN-R10). Sin cambio de requisitos. |
| 2026-10-13 | 2.4 | Por decisión del autor (D-80). QLT-R34 y §4.2: ya no hay librería de animación; las animaciones son CSS. Sin cambio de presupuestos. |
| 2026-10-13 | 2.3 | Durante M8, por delegación del autor (D-77). QLT-R30 y glosario: el Largest Contentful Paint del preajuste `mobile` se mide con la limitación aplicada de verdad, no estimada; el límite de 2,5 s no cambia. Medido el 2026-10-13 en `/es/` y `/en/cv/`: 1,6 s con limitación aplicada y 2,7 s con la estimación por defecto de Lighthouse. Estado: pasa a "Implementada" al cerrar M8. QLT-AC27: el autor completó el 2026-10-13, en su equipo y antes de la primera publicación, los pasos de teclado, zoom, movimiento reducido, sin JavaScript y herramientas de desarrollo de §4.8, sin incidencias. Quedan dos pasos: el del lector de pantalla, aplazado con su visto bueno (PLAN-R10), y el del teléfono real, que necesita el sitio desplegado (M9). |
| 2026-10-13 | 2.2 | Por decisión del autor (D-66). §4.1.7: nuevo estado auditable con la variante boceto. QLT-R14: el aura se distingue en las dos variantes. |
| 2026-10-13 | 2.1 | Cabecera: se retira la marca de enmienda pendiente; el autor confirmó el 2026-10-13 que todas las enmiendas están aprobadas. Sin cambio de requisitos. |
| 2026-10-12 | 2.1 | Confirmada por el autor el 2026-10-12. §4.6: filas `ultrawide` y `classic` adaptadas al escenario 16:9 sin recortes (D-48). |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Base del marco medida en 171 kB con un prototipo de Next.js 16.4.0 y React 19.3.0. |
| 2026-10-12 | 2.0 | QLT-R07: nuevo orden de tabulación por decisión del autor (D-46). Confirmado por el autor el 2026-10-12: QLT-R34 y QLT-AC10 reescritos porque los sonidos se sintetizan y no hay archivos de audio (D-50). |
