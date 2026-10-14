# Especificaciones — Portfolio interactivo de Juan Esteban Álvarez García

Esta carpeta es la **fuente de verdad** del proyecto. El código se escribe a partir de estas specs y nunca al revés: si el código y una spec no coinciden, el código está mal o la spec está desactualizada, y en ambos casos se corrige antes de seguir.

- **Qué se construye:** un portfolio web donde el visitante explora una placa madre fotorrealista sobre un workbench; cada componente de hardware abre una sección del perfil profesional.
- **Cómo se construye:** Spec-Driven Development (SDD). Cada funcionalidad tiene una spec con requisitos identificados y criterios de aceptación verificables.

## 1. Jerarquía de fuentes de verdad

Cuando dos fuentes se contradicen, gana la de número menor.

| # | Fuente | Alcance |
| --- | --- | --- |
| 1 | Instrucción explícita más reciente del autor (Juan Esteban) | Cualquier tema. DEBE volcarse a la spec afectada en el mismo cambio en que se aplica. |
| 2 | Specs de esta carpeta | Todo el producto. |
| 3 | CVs actualizados (`docs/CVs/*_Actualizado.pdf`) | Datos personales, académicos y profesionales. |
| 4 | CV antiguo (`docs/CVs/CV Juan Esteban Álvarez García.pdf`) | Solo los detalles rescatados explícitamente en la sección 7 de este archivo. |
| 5 | Imágenes de `docs/VisualIdeas/` | **No normativas.** Son inspiración; contienen datos falsos y no deben copiarse. |

Una contradicción entre dos specs es un defecto: se detiene el trabajo afectado, se resuelve con el autor y se corrigen ambas. Mientras se resuelve, `00-foundations/` y `01-standards/` prevalecen sobre `02-features/`.

## 2. Índice y estado

Estados posibles: **Pendiente** (sin escribir) · **En revisión** (escrita, espera aprobación del autor) · **Aprobada** (lista para implementar) · **Implementada** (código conforme y criterios verificados) · **Obsoleta**. Una spec aprobada con una **enmienda pendiente** conserva su aprobación salvo en lo que cambia la enmienda, que está detallado en su historial (ver §5.2).

| Código | Archivo | Contenido | Estado |
| --- | --- | --- | --- |
| VSN | [00-foundations/01-vision-and-scope.md](00-foundations/01-vision-and-scope.md) | Objetivo, audiencia, principios, mapa de componentes, alcance, glosario | Aprobada |
| SYS | [00-foundations/02-system-overview.md](00-foundations/02-system-overview.md) | Stack y versiones, rutas, modos de render, estado global | Aprobada |
| STR | [00-foundations/03-feature-first-structure.md](00-foundations/03-feature-first-structure.md) | Árbol de carpetas, capas, reglas de dependencia, nomenclatura | Aprobada |
| VIS | [00-foundations/04-visual-system.md](00-foundations/04-visual-system.md) | Tokens de color, tipografía, aura, superficies, movimiento | Aprobada |
| AST | [00-foundations/05-scene-asset.md](00-foundations/05-scene-asset.md) | Imagen de la escena: composición, prompt, aceptación, derivados, calibración | Aprobada |
| TSC | [01-standards/01-typescript-contracts.md](01-standards/01-typescript-contracts.md) | Reglas de TypeScript, identificadores, contrato de sección, hechos y textos, estado, rutas | Aprobada |
| I18N | [01-standards/02-i18n-guidelines.md](01-standards/02-i18n-guidelines.md) | Diccionarios, formateadores, cambio de idioma, reglas de traducción | Aprobada |
| QLT | [01-standards/03-quality-bar.md](01-standards/03-quality-bar.md) | Accesibilidad, rendimiento, presupuestos de peso, robustez, definición de terminado | Aprobada |
| TST | [01-standards/04-testing-and-ci.md](01-standards/04-testing-and-ci.md) | Niveles de prueba, TDD, E2E, Lighthouse, trazabilidad, pipeline de CI | Aprobada |
| BOOT | [02-features/01-boot-sequence.md](02-features/01-boot-sequence.md) | Secuencia de arranque | Implementada |
| SCN | [02-features/02-motherboard-scene.md](02-features/02-motherboard-scene.md) | Zonas pulsables, auras, etiquetas, teclado, display de diagnóstico | Aprobada |
| PNL | [02-features/03-detail-panel.md](02-features/03-detail-panel.md) | Modal, anterior/siguiente, historial, fragmentos | Implementada |
| CPU | [02-features/04-cpu-profile.md](02-features/04-cpu-profile.md) | Sección Perfil y fotografía | Implementada |
| PSU | [02-features/05-psu-experience.md](02-features/05-psu-experience.md) | Sección Experiencia | Implementada |
| SSD | [02-features/06-ssd-projects.md](02-features/06-ssd-projects.md) | Sección Proyectos | Aprobada |
| RAM | [02-features/07-ram-stack.md](02-features/07-ram-stack.md) | Sección Stack tecnológico | Implementada |
| IO | [02-features/08-io-contact.md](02-features/08-io-contact.md) | Sección Contacto y archivos del CV | Aprobada |
| FAN | [02-features/09-fan-ecosystem.md](02-features/09-fan-ecosystem.md) | Sección Ecosistema personal | Implementada |
| CMOS | [02-features/10-cmos-about.md](02-features/10-cmos-about.md) | Sección Acerca de este sitio | Implementada |
| SET | [02-features/11-settings.md](02-features/11-settings.md) | Barra fija, menú de ajustes, sonido, reinicio | Aprobada |
| SMP | [02-features/12-simple-view-and-seo.md](02-features/12-simple-view-and-seo.md) | Vista simple, móvil, metadatos, iconos | Aprobada |
| DEP | [03-delivery/01-deployment.md](03-delivery/01-deployment.md) | Repositorio, licencias, hosting, publicación, cabeceras, analítica | Aprobada |
| PLAN | [03-delivery/02-implementation-plan.md](03-delivery/02-implementation-plan.md) | Hitos ordenados, tareas del autor y criterios de salida | Aprobada |

`CLAUDE.md`, en la raíz del repositorio, resume las reglas de trabajo para agentes y apunta a este índice.

## 3. Orden de lectura

Para implementar una funcionalidad, un agente o persona DEBE leer, en este orden:

1. Este archivo completo.
2. `00-foundations/01-vision-and-scope.md` (glosario e identificadores).
3. `00-foundations/02-system-overview.md` y `00-foundations/03-feature-first-structure.md`.
4. Todas las specs de `01-standards/`.
5. La spec de la funcionalidad en `02-features/` y las que declare en su cabecera como dependencias.
6. `00-foundations/04-visual-system.md` si la funcionalidad tiene interfaz; `00-foundations/05-scene-asset.md` si toca la escena.

## 4. Convenciones

### 4.1 Idioma

- Las specs se escriben en **español**.
- Código, identificadores, nombres de archivo, mensajes de commit y comentarios se escriben en **inglés**.
- Los textos visibles para el visitante existen siempre en español e inglés (ver I18N).

### 4.2 Lenguaje normativo

| Término | Significado |
| --- | --- |
| **DEBE** / **NO DEBE** | Obligatorio. Incumplirlo es un defecto. |
| **DEBERÍA** / **NO DEBERÍA** | Recomendado. Apartarse exige dejar la razón escrita en la spec. |
| **PUEDE** | Opcional. |

### 4.3 Identificadores

- Requisito: `<CÓDIGO>-R<nn>` (por ejemplo `SYS-R04`).
- Criterio de aceptación: `<CÓDIGO>-AC<nn>` (por ejemplo `SYS-AC02`).
- Decisión: `D-<nn>` (sección 6). Hecho confirmado por el autor: `F-<nn>` (sección 7).
- Un identificador nunca se reutiliza. Si un requisito se elimina, su fila queda marcada como "Retirado" con la fecha.
- Las pruebas automáticas que verifican un criterio DEBEN citar su identificador en el nombre o descripción de la prueba.

### 4.4 Qué no puede contener una spec

- Marcadores de trabajo pendiente ni enumeraciones abiertas ("etc.", "entre otros", "por definir").
- Requisitos no verificables ("rápido", "bonito", "intuitivo") sin un umbral o un procedimiento de comprobación.
- Contenido duplicado de otra spec: se enlaza, no se copia.

### 4.5 Vocabulario de verificación

La columna "Verificación" de todo criterio de aceptación empieza por uno de estos términos. El término decide cómo se comprueba el criterio; la prueba de trazabilidad (TST §4.7) lo lee de forma automática.

| Clase | La verificación empieza por | Cómo se comprueba |
| --- | --- | --- |
| Automática | `Prueba unitaria` · `Prueba de componente` · `Prueba de arquitectura` · `Prueba de script` · `Prueba E2E` · `Prueba de exportación` | Una prueba cuyo título cita el identificador del criterio |
| Puerta | `Ejecución` | Un comando del pipeline termina sin errores |
| Manual | `Revisión manual` · `Medición manual` | Una persona lo comprueba y lo anota en el historial de la spec |

Después del término se PUEDE añadir cualquier precisión (por ejemplo, "Prueba E2E con axe"). Si un criterio combina una parte automática y otra manual, se escribe primero la automática.

## 5. Plantilla y proceso de cambio

### 5.1 Plantilla

Toda spec tiene la cabecera de campos y, en este orden, las secciones **Propósito**, **Alcance**, **Requisitos**, **Criterios de aceptación**, **Decisiones y justificación**, **Preguntas abiertas** e **Historial de cambios**. Una spec PUEDE intercalar secciones propias (por ejemplo, principios, glosario o un mapa) y numera sus secciones de forma consecutiva. Si una sección obligatoria no aplica, se conserva con el texto "No aplica". Única excepción: en VSN, que es el propio documento de alcance, los requisitos viven en su sección "Alcance de la versión 1".

```markdown
# <CÓDIGO> — <Título>

| Campo | Valor |
| --- | --- |
| Estado | Pendiente / En revisión / Aprobada / Implementada / Obsoleta |
| Versión | <mayor>.<menor> |
| Última actualización | AAAA-MM-DD |
| Depende de | <códigos de otras specs> |

## 1. Propósito
## 2. Alcance            (qué incluye y qué no incluye)
## 3. Definiciones       (solo términos que no estén en el glosario de VSN)
## 4. Requisitos         (tablas o listas con ID)
## 5. Criterios de aceptación   (ID · criterio · método de verificación)
## 6. Decisiones y justificación
## 7. Preguntas abiertas (debe estar vacía para pasar a "Aprobada")
## 8. Historial de cambios
```

### 5.2 Proceso de cambio

1. **Primero la spec.** Ningún cambio de comportamiento, contenido o estructura se implementa sin que la spec lo diga. El cambio de la spec y el del código PUEDEN ir en el mismo commit, pero la spec nunca queda atrás.
2. **Toda instrucción del autor se registra.** Si el autor decide algo en una conversación, se actualiza la spec afectada y, si es una decisión de producto o arquitectura, se añade o modifica una fila en la sección 6.
3. **Versionado.** Sube el número menor cuando se añaden requisitos, valores o aclaraciones compatibles con lo ya aprobado; sube el mayor cuando cambia el comportamiento que exige un requisito aprobado o cuando se retira un requisito.
4. **Historial.** Cada cambio añade una fila al historial de la spec con fecha, versión y resumen.
5. **Estado.** Solo el autor mueve una spec a "Aprobada". Una spec pasa a "Implementada" cuando todos sus criterios de aceptación están verificados.
6. **Desviaciones.** Si durante la implementación un requisito resulta inviable o erróneo, se detiene esa tarea, se propone el cambio de spec al autor y no se improvisa una alternativa.
7. **Enmiendas a specs aprobadas.** Cuando escribir o implementar una spec obliga a cambiar otra que ya está aprobada, el cambio se aplica para que las specs sigan siendo coherentes entre sí, se anota en el historial de la spec enmendada con la marca "Pendiente de confirmación" y se refleja en el índice. El autor confirma la enmienda o la rechaza; si la rechaza, se revierte junto con lo que dependa de ella. Ninguna enmienda pendiente se implementa en código.

## 6. Registro de decisiones

Resumen de una línea por decisión; el detalle y la justificación completa viven en la spec indicada. Todas las fechas son 2026-10-12 salvo que se indique otra.

| ID | Decisión | Spec |
| --- | --- | --- |
| D-01 | La escena es una vista cenital (cámara a 90°) con la iluminación cálida de lámpara de la referencia `Fav-TopView3`. | AST |
| D-02 | La escena se renderiza como imagen pre-renderizada con una capa SVG encima; las auras y zonas clicables se dibujan en código, no en la imagen. | SYS, AST |
| D-03 | La imagen se genera con Gemini y se escala con Upscayl; las zonas clicables se calibran después, sobre el resultado. | AST |
| D-04 | La fuente de poder va sobre el workbench, con su cable conectado a la placa; fuente, cable y conector forman una sola zona interactiva. | AST, PSU |
| D-05 | El CPU va expuesto en su socket, sin disipador; el ventilador ARGB es una pieza separada sobre el workbench. | AST |
| D-06 | Los paneles de detalle usan el estilo "placa clara" (referencia `DetailIdea1Component`), construidos en HTML/CSS. | VIS, PNL |
| D-07 | El aura es ámbar `#FFC53D`, fija; no cambia de color al visitar un componente. | VIS |
| D-08 | La escena interactiva solo se muestra en viewports de al menos 1024×600 px; por debajo se muestra la vista simple. La escena en móvil queda para v2. | VSN, SYS |
| D-09 | El detalle se abre en un modal centrado con navegación anterior/siguiente entre secciones. | PNL |
| D-10 | La secuencia de arranque dura como máximo 2 s, se puede saltar, se muestra una vez por sesión, está siempre en inglés y se genera desde el contenido. | BOOT |
| D-11 | Idioma y acceso a la vista simple van en una barra fija; el panel físico abre los ajustes (sonido, reset, idioma). El botón Power no tiene acción. | SET |
| D-12 | El sonido está apagado por defecto. | SET |
| D-13 | Cada sección tiene URL propia. Los slugs son los mismos en ambos idiomas y están en inglés (`/es/projects/`, `/en/projects/`). | SYS |
| D-14 | Proyectos: cuatro destacados y el resto compactos. No se publican nombres de terceros; solo tamaños de equipo. | SSD, VSN |
| D-15 | Next.js con exportación estática, desplegado en Cloudflare Pages; GitHub Pages es el plan B. | SYS, DEP |
| D-16 | Internacionalización por rutas `/es` y `/en` con diccionarios TypeScript propios, sin librería; inglés como idioma de respaldo. | SYS, I18N |
| D-17 | La URL es la fuente de verdad del idioma y de la sección abierta; Zustand solo guarda preferencias y estado de sesión. | SYS |
| D-18 | TDD solo para la lógica; Vitest, Testing Library y Playwright con comprobación de accesibilidad. | TST |
| D-19 | Listón de calidad: Lighthouse ≥ 95 en accesibilidad, buenas prácticas y SEO, ≥ 90 en rendimiento; WCAG 2.2 AA. | QLT |
| D-20 | Analítica con Cloudflare Web Analytics (sin cookies). | DEP |
| D-21 | Specs en `specs/`, en español; código e identificadores en inglés. | README |
| D-22 | Repositorio público. Código bajo MIT; contenido, foto e imágenes con derechos reservados. `docs/` no se versiona. | DEP, STR |
| D-23 | Un display de diagnóstico en la placa muestra cuántas secciones se han visitado (n/6); no es interactivo. | SCN |
| D-24 | La pila CMOS abre la sección "Acerca de este sitio". | CMOS |
| D-25 | Al hacer hover, cada componente muestra una etiqueta con su nombre y lo que contiene; en pantallas táctiles las etiquetas están siempre visibles. | SCN |
| D-26 | La terminal interactiva queda fuera del alcance. | VSN |
| D-27 | El alemán queda fuera de v1; la internacionalización DEBE permitir añadirlo sin rediseño. | I18N |
| D-28 | TypeScript se fija en 6.0.x: `typescript-eslint` aún no admite TypeScript 7. | SYS |
| D-29 | La vista simple es la capa base de la página de inicio; la escena es una mejora progresiva que se monta encima. | SYS |
| D-30 | El contenido de cada sección vive en su feature; cada sección tiene un único componente que sirve al panel y a la vista simple. | STR |
| D-31 | No se usan librería de i18n, librería de validación en runtime, librería de audio, librería de componentes UI ni el optimizador de imágenes de Next. | SYS |
| D-32 | Los derivados de imagen se versionan en el repositorio junto con un manifiesto; CI comprueba que corresponden al máster. | AST |
| D-33 | El contenido de cada sección se divide en hechos (datos que no dependen del idioma, escritos una vez) y textos por idioma indexados por identificador. | TSC, STR |
| D-34 | La respiración del aura dura 4,8 segundos al aparecer la escena y no se repite; ninguna animación automática supera los 5 segundos. | VIS, QLT |
| D-35 | pnpm: edad mínima de 7 días sin excepciones, política de confianza `no-downgrade` con exención a los 30 días, scripts de instalación bloqueados salvo decisión explícita y versiones exactas. | SYS |
| D-36 | Una prueba automática de trazabilidad exige que todo criterio de una spec "Implementada" esté citado por una prueba. | TST |
| D-37 | La cobertura es obligatoria solo sobre la lógica: 95 % de líneas, funciones y sentencias, y 90 % de ramas. | TST |
| D-38 | No se usan pruebas de regresión visual por capturas en v1. | TST |
| D-39 | Las pruebas E2E se ejecutan contra el sitio exportado y escriben literalmente los textos que esperan. | TST |
| D-40 | El código de la escena y la librería de animación se cargan bajo demanda, solo en modo `scene`. Presupuestos de JavaScript: 195 kB en modo `simple` y 250 kB en modo `scene`. | QLT |
| D-41 | Fuera de `/`, el sitio nunca redirige por el idioma del navegador ni por la preferencia guardada. | I18N |
| D-42 | El diccionario de interfaz está centralizado, con un espacio de nombres por feature y el inglés como referencia de tipo. | I18N |
| D-43 | Si el JavaScript no se inicia en 5 segundos o la capa de escena falla, la página muestra la vista simple. | QLT, SYS |
| D-44 | Fechas y cifras son hechos que se formatean por idioma con funciones propias; los meses abreviados no se toman de `Intl`. | I18N |
| D-45 | `push` directo a `main` permitido; solo se publica un commit con CI en verde. | TST, DEP |
| D-46 | El orden canónico de las secciones sigue la relevancia para quien evalúa: Perfil, Experiencia, Proyectos, Stack, Contacto, Ecosistema. | VSN, TSC, QLT |
| D-47 | La capa de escena solo existe en el cliente; el panel no forma parte del HTML exportado, porque el contenido ya está en la capa base. | SYS |
| D-48 | El escenario es siempre 16:9 y la imagen nunca se recorta; lo que sobra del viewport son franjas oscuras fundidas con un viñeteado. | AST |
| D-49 | Máster de la escena aceptado: "Tenth generation". La imagen se genera con un prompt solo de texto, en una conversación nueva; se regenera en lugar de encadenar ediciones. | AST |
| D-50 | Los efectos de sonido se sintetizan con Web Audio; no hay archivos de audio. | SET, QLT |
| D-51 | Los componentes de cliente no importan el registro: reciben los datos por propiedades. Los features de armazón separan `index.ts` (cliente) y `server.ts` (servidor). | STR, SYS |
| D-52 | Las zonas de la escena son enlaces HTML recortados a la silueta; las auras se dibujan en un SVG decorativo aparte. | SCN |
| D-53 | El estado del panel es la URL. Anterior y siguiente recorren las siete secciones de forma circular y reemplazan la entrada del historial. | PNL |
| D-54 | La web odontológica se describe como proyecto destacado; Experiencia solo la menciona y enlaza. | SSD, PSU |
| D-55 | El stack se muestra sin indicadores de nivel. | RAM |
| D-56 | La vista simple no usa la metáfora del hardware: muestra las secciones como un perfil. | SMP |
| D-57 | "Acerca de este sitio" declara el uso de IA en el desarrollo y en la imagen, junto con el método de trabajo. | CMOS |
| D-58 | La escena muestra una frase de orientación hasta que se abre la primera sección. | SCN |
| D-59 | Se publica por subida directa a Cloudflare Pages desde GitHub Actions, solo tras un CI en verde sobre `main`, y se comprueba el sitio publicado al terminar. | DEP |
| D-60 | Política de seguridad de contenido estricta: los scripts en línea se autorizan por hash, página a página, en un archivo de cabeceras generado tras compilar. | DEP |
| D-61 | La analítica se activa por inyección automática de Cloudflare, sin código ni identificadores en el repositorio. | DEP |
| D-62 | El código y las specs se publican bajo licencia MIT; el contenido personal, la fotografía, los CVs y la imagen de la escena quedan con derechos reservados. | DEP |
| D-63 | La implementación sigue diez hitos; el sitio se publica por primera vez al completar el último. | PLAN |
| D-64 | 2026-10-13: la implementación empieza de inmediato con las versiones anteriores que cumplen la edad mínima de 7 días, y con ESLint 9. | SYS, PLAN |
| D-65 | 2026-10-13: M0 adelanta los identificadores canónicos y la validación del entorno; los scripts de assets y de Lighthouse existen como marcadores hasta M2 y M8. La publicación debe estar hecha al final del 2026-10-16. | PLAN |
| D-66 | 2026-10-13: la escena tiene dos variantes de imagen, fotografía (por defecto) y boceto, que el visitante intercambia desde los ajustes. Comparten objetos, zonas y calibración; cambian la imagen, el color del aura, el de las franjas y el del display. | VSN, AST, VIS, SCN, SET, TSC, SYS |
| D-67 | 2026-10-13: `pnpm check:docker` ejecuta la puerta completa en la imagen de Playwright, para verificar WebKit en un equipo que no es Ubuntu ni Debian. | TST, SYS, STR |
| D-68 | 2026-10-13, por delegación del autor: el elemento `<html>` lo renderiza el layout de cada grupo de rutas, no el de `[locale]`. Es la única forma de que el script previo al pintado quede en `<head>` en las páginas de la escena y no exista en `/cv/`. Como una navegación del cliente entre grupos o entre idiomas vuelve a montar `<html>`, la aplicación restablece los atributos que ese script escribió. | SYS |
| D-69 | 2026-10-13, por delegación del autor: cada zona puede desplazar su etiqueta a lo largo de su lado (`labelShift`); sin hover, las etiquetas miden 128 px como máximo; y la pista inicial queda a 8 px del borde inferior. Con las etiquetas centradas y de una sola línea, las ocho no cabían a 1024×768 px, y a 24 px la pista tapaba el display de diagnóstico. | SCN, VIS |
| D-71 | 2026-10-13, al revisar M5: el aura no dibuja ninguna línea de contorno. Es un halo, más intenso que el resplandor anterior, que rodea la pieza como si la luz saliera de detrás de ella. Una línea cerrada alrededor de cada componente se percibía como una caja artificial. | VIS, SCN |
| D-82 | 2026-10-14, por decisión del autor (v2): los proyectos de la tesis, AndeSpace y la web odontológica tienen un caso de estudio con el problema, su rol, el proceso (decisiones y cambios de rumbo) y el resultado, cada uno en su propia página. Es lo que piden los procesos de selección: dos o tres proyectos con ese detalle y un enlace que se abra sin iniciar sesión. HabiCapital sigue destacado, sin caso. | SSD, SMP, SYS, TSC |
| D-83 | 2026-10-14, por decisión del autor (v2): una placa de identidad siempre visible en la escena (nombre, carrera y áreas) y, tras el arranque, una bienvenida no modal, una vez por sesión, que sustituye a la pista inicial. Su frase habla en primera persona y se dirige al visitante, como pidió el autor ("conoce sobre mí y lo que puedo hacer por ti"), excepción registrada a I18N-R38. Solo dice que se navega por los componentes; no menciona las flechas. | SCN, I18N, TSC, AST |
| D-84 | 2026-10-14, por decisión del autor (v2): el CV, el correo, LinkedIn y GitHub quedan a un clic desde la barra fija, como iconos discretos con nombre accesible. | SET, VIS, VSN |
| D-85 | 2026-10-14, por decisión del autor (v2): los resultados y las cifras más relevantes se destacan con peso tipográfico, nunca con color, como mucho uno por viñeta. Por delegación: el fragmento destacado es un campo aparte de la cadena (`EmphasizedText`), de modo que el contenido sigue siendo texto plano (TSC-R39). | TSC, VIS, SSD, PSU |
| D-86 | 2026-10-14, por decisión del autor tras comparar capturas: el aura de la variante boceto pasa de carmesí a azul de bolígrafo, `#1F4FBF`, porque el rojo puede leerse como un error. | VIS |
| D-87 | 2026-10-14, por decisión del autor: el portfolio incluye la opción académica en Machine Learning, sus cursos y sus proyectos, aunque los CVs no los mencionen: el CV debe ser conciso y el portfolio puede ser más holgado. | CPU, RAM, SSD |
| D-88 | 2026-10-14, por delegación del autor: la página de cada caso vive en `/{locale}/projects/{caso}/`, en el grupo `(plain)`, como la del CV. Su contenido está en `ssd-projects` y la página la compone `simple-view`, que ya reúne las páginas planas, los metadatos y el sitemap; así no hace falta un feature nuevo. | SYS, STR, SMP, SSD, TSC |
| D-89 | 2026-10-14, por delegación del autor: la escena reserva sin objetos interactivos la franja superior (barra fija y placa), la esquina superior izquierda (placa) y el centro inferior (bienvenida), y `validateHotspots` lo comprueba. La calibración actual ya lo cumple. | AST, SCN |
| D-90 | 2026-10-14, por decisión del autor: quedan fuera de v2 las capturas o demos de los proyectos, los idiomas nuevos (portugués y alemán), un chatbot, un blog, más animaciones, el modo claro u oscuro y los testimonios. | VSN |
| D-81 | 2026-10-13, por decisión del autor tras probar la escena con teclado: además del tabulador, las flechas mueven el foco entre las piezas de la escena según su posición en la imagen. El orden de tabulación no cambia. | SCN |
| D-80 | 2026-10-13, por decisión del autor: se retira la librería `motion`. Estaba en las dependencias y en la lista del stack de "Acerca de este sitio", pero ningún código la usaba: todas las animaciones son CSS. Deja sin efecto la parte de D-40 que habla de la librería. | SYS, QLT, CMOS, DEP |
| D-79 | 2026-10-13, por delegación del autor, tras la primera publicación: la política admite en `connect-src` el origen al que el script de analítica envía sus datos, `https://cloudflareinsights.com`. La spec suponía que los enviaba al propio dominio del sitio; en producción la política los bloqueaba. | DEP |
| D-78 | 2026-10-13, por delegación del autor: el flujo de publicación instala `wrangler` por su cuenta, fuera del proyecto, en una versión exacta con más de 7 días y sin scripts de instalación, en lugar de usar la acción de Cloudflare, que lo instalaría dentro del proyecto con pnpm y chocaría con sus reglas de cadena de suministro. Además comprueba él mismo que el trabajo `ci-ok` del commit terminó bien, para que tampoco una ejecución manual publique sin CI en verde. | DEP, SYS |
| D-77 | 2026-10-13, por delegación del autor: Lighthouse se ejecuta en tres pasadas. El Largest Contentful Paint del preajuste `mobile` se mide con la red y el procesador limitados de verdad (1,6 s) y no con la estimación por defecto de Lighthouse (2,7 s); el límite de 2,5 s no cambia. La diferencia viene sobre todo de las dos fuentes precargadas: sin la precarga la estimación bajaba a 2,1 s, pero el texto se desplazaba al llegar la fuente (CLS de 0,10), así que la precarga se mantiene. El servidor de `preview` comprime el texto con gzip, como el alojamiento, para que se mida lo que se publica. | QLT, TST, DEP, SYS, STR |
| D-76 | 2026-10-13, al revisar las imágenes: en el boceto el contador no se leía, porque sus dígitos se dibujaban en tinta sobre los segmentos que la propia imagen trae dibujados. Ahí se pinta bajo ellos un fondo del color del papel. | SCN, VIS |
| D-75 | 2026-10-13, por delegación del autor: el menú de ajustes elige un lado con sitio junto al panel frontal (el de su etiqueta, el opuesto y después los otros dos) en lugar de desplazarse sobre la pieza que lo abre. | SET |
| D-74 | 2026-10-13, por delegación del autor: el tabulador no salta el arranque, para que con teclado se llegue al botón "Saltar"; y una tecla o pulsación anterior a la carga del código sí lo salta, porque el script previo al pintado la anota. | BOOT, SYS |
| D-73 | 2026-10-13, por delegación del autor: con un panel abierto, la barra fija se dibuja también dentro del diálogo, sobre el velo. El panel es modal y deja inerte el resto de la página; sin esto no se podía cambiar de idioma con una sección abierta. | PNL, SET, SYS |
| D-72 | 2026-10-13, al revisar el halo: en reposo el aura también rellena la pieza, con poca opacidad, y su halo es más tenue; en hover, foco y activo, halo y relleno suben a los valores que ya tenían. | VIS |
| D-70 | 2026-10-13, por delegación del autor: `next dev` no escribe en `CLAUDE.md` (`agentRules: false`). Next.js 16 añade por defecto un bloque propio a ese archivo cada vez que arranca el servidor de desarrollo. | SYS |

## 7. Hechos confirmados por el autor

Datos que el autor confirmó en conversación y que no están (o están distintos) en los CVs. Cada hecho DEBE quedar incorporado en la spec de destino cuando esta se escriba; la columna "Incorporado en" se rellena en ese momento. Esta tabla no se borra: es la trazabilidad de dónde salió cada dato.

| ID | Hecho | Spec de destino | Incorporado en |
| --- | --- | --- | --- |
| F-01 | El intercambio en Hochschule München fue de febrero a julio de **2025**. Los PDFs actualizados ya lo reflejan. | CPU | CPU-R02 |
| F-02 | Monitor académico desde enero de 2026 hasta la actualidad. Trabajo individual. | PSU | PSU-R02 |
| F-03 | Graduación: se muestra solo "2027". Disponibilidad: tiempo completo desde enero de 2027. No se publica el detalle de ceremonias ni de matrícula. | CPU, IO | CPU-R02, CPU-R03 |
| F-04 | No se publica el nombre del asesor de tesis (se dice "asesorada en la Universidad de los Andes") ni nombres de compañeros, profesores o clientes. | SSD, PSU, VSN | VSN-R17, SSD-R04 |
| F-05 | Tamaños de equipo, incluyendo al autor: tesis 2 · AndeSpace 6 · HabiCapital 1 · plataforma de monitorías (Cloud) 4 · microservicio de lista negra (DevOps) 4 · AhorrApp 3 · DogSPA 5 · monitor 1 · freelance 1. Los dos proyectos de Diseño y Análisis de Algoritmos se hicieron en pareja (confirmado por el autor el 2026-10-12). | SSD, PSU | SSD-R03, PSU-R02 |
| F-06 | Proyectos destacados: Tesis, AndeSpace, HabiCapital y la web odontológica. El resto se muestra en formato compacto. | SSD | SSD-R03 |
| F-07 | Web odontológica: sitio en vivo `https://martha-landing.netlify.app/`; repositorio privado. El enlace "Web" de los CVs apunta a este sitio. | SSD, PSU | SSD-R03, PSU-R06 |
| F-08 | Automatización hotelera: repositorio privado; el autor prevé hacerlo público la semana del 2026-10-19. No tiene sitio en vivo. Se muestra en Experiencia y el enlace se añade cuando el repositorio sea público. | PSU | PSU-R02, PSU-R07 |
| F-09 | Freelance: se mantiene el rango "Jul. 2024 – ene. 2025". Los commits posteriores de la web odontológica son mantenimiento menor y no amplían el rango. | PSU | PSU-R02 |
| F-10 | Proyectos de Diseño y Análisis de Algoritmos (minimización de costos con grafos; ordenamiento de panqueques con heurística): repositorios privados; mitad Java, mitad Python. Se muestran como una entrada compacta. | SSD | SSD-R03, SSD-R04 |
| F-11 | Repositorios privados (se mencionan con la etiqueta "repositorio privado", sin enlace): plataforma de monitorías, microservicio de lista negra, DogSPA, web odontológica, proyectos de algoritmos, `dotfiles-rice`. | SSD, FAN | SSD-R03, FAN-R03 |
| F-12 | Enlaces públicos: LinkedIn `https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/` · GitHub `https://github.com/Onstrax` · Tesis `https://github.com/CesarAAC/Tesis-ZPK-LWE-Autentication` · AndeSpace Flutter `https://github.com/G33-Moviles-2026-1/G33-Flutter-Moviles-2026-1` · AndeSpace Backend `https://github.com/G33-Moviles-2026-1/G33-Backend-Moviles-2026-1` · AndeSpace Wiki `https://github.com/G33-Moviles-2026-1/Wiki` · HabiCapital `https://github.com/Onstrax/HabiCapital` · AhorrApp Frontend `https://github.com/Onstrax/AhorrApp` · AhorrApp Backend `https://github.com/Onstrax/AhorrApp-Backend` · AhorrApp Landing `https://github.com/Onstrax/Ahorrapp-Landing`. | SSD, IO | SSD-R03, IO-R07 |
| F-13 | Contacto publicado: correo `juanalvarezgcl@gmail.com`, WhatsApp `+57 300 562 8702`, LinkedIn, GitHub y descarga del CV en PDF en español e inglés. | IO | IO-R07 |
| F-14 | Foto: `docs/Juanes.jpg` (699×762 px). Se usa con recorte cuadrado a cabeza y hombros. | CPU | CPU-R08 |
| F-15 | Idiomas: español nativo · inglés C1 (IELTS General Training 7,5, 2025) · alemán B1 sin certificar, cursado en Hochschule München. | CPU | CPU-R03 |
| F-16 | Ecosistema personal, contenido aprobado. **Setup:** CachyOS + Hyprland, ricing propio (repositorio privado), enlace a `https://github.com/caelestia-dots/caelestia`. **Construido y autoalojado:** plugin Bongo Cat para Obsidian `https://github.com/Onstrax/bongo-cat`; `steam-library-hub` (público, se indica "disponible en mi perfil de GitHub" sin enlace directo); homelab en contenedores con Kokoro para síntesis de voz y Home Assistant para las luces, controlado con atajos de teclado globales; sincronización P2P del vault de Obsidian entre PC y móvil con Syncthing. **Fuera de la pantalla:** calistenia, parkour, gaming y una línea sobre formación en liderazgo ignaciano. | FAN | FAN-R03, FAN-R04 |
| F-17 | Ecosistema personal, exclusiones: sin captura de escritorio, sin nombres de videojuegos, sin la sincronización de portapapeles con KDE Connect. Lo configurado (herramientas de terceros) DEBE distinguirse de lo desarrollado por el autor. | FAN | FAN-R02, FAN-AC08 |
| F-18 | Detalles rescatados del CV antiguo: materias que dicta como tutor (Introducción a la Programación; Estructuras de Datos y Algoritmos; Diseño y Programación Orientada a Objetos; Desarrollo de Software en Equipo); logro como tutor (los estudiantes mejoran su desempeño, vuelven a contactarlo y lo recomiendan); Hall de la Fama de Estructuras de Datos y Algoritmos, semestre 2022-20, por los Retos 1, 2 y 3; ex co-representante del equipo de calistenia de la universidad, 2022–2024. | PSU, CPU, FAN | CPU-R03, PSU-R03, FAN-R04 |
| F-19 | Herramientas para el asset de la escena: Gemini (generación y edición) y Upscayl (escalado). | AST | AST §4.5 |
| F-20 | Idioma de respaldo cuando el navegador no está en español ni en inglés: inglés. | SYS, I18N | SYS-R08, I18N-R01 |
| F-21 | El boceto de la escena ("Eleventh generation") se generó el 2026-10-13 con la misma herramienta y el mismo modelo que la fotografía, adjuntándola. Sus garabatos de los márgenes se conservan y su aura usa un color propio. | AST, VIS | AST-R51, AST-R52, VIS §4.1.5 |
| F-22 | Confirmado por el autor el 2026-10-14. Opción académica (énfasis o *minor*) en Machine Learning, que se completa junto con el grado. Cursos que la respaldan: Fundamentos de Machine Learning; Inteligencia de Negocios; Modelado, Simulación y Optimización; El Hombre Artificial; Análisis con Deep Learning; y Principios y Fundamentos del Deep Learning. No figura en los CVs por decisión del autor, que lo considera un área secundaria; el portfolio sí la incluye (D-87). | CPU, RAM, SCN | CPU-R03, RAM-R03, SCN-R46 |
| F-23 | Confirmado por el autor el 2026-10-14. Dos proyectos públicos de Machine Learning, ambos en el mismo equipo de 3 personas. ETL de enfermedades respiratorias agudas en Bogotá, `https://github.com/Onstrax/ETL`: el proceso ETL es íntegramente del autor; un compañero entrenó y desplegó un modelo de regresión y otro hizo los tableros de Power BI. Clasificador de textos según 4 Objetivos de Desarrollo Sostenible con SVM, `https://github.com/Onstrax/Analitica-de-textos`: el autor entrenó y probó el modelo SVM, exploró y procesó los datos, repartió tareas y fechas, documentó la wiki y, en la segunda etapa, desarrolló la interfaz web en Next.js y su conexión con el backend, implementó la aumentación de datos y comparó sus resultados, y coordinó las entregas. Las tecnologías de cada uno se tomaron de sus repositorios el 2026-10-14. | SSD | SSD-R03, SSD-R04 |
| F-24 | Confirmado por el autor el 2026-10-14. Proyectos privados de Machine Learning, que se mencionan sin enlace: un MLP que clasifica rayos gamma y hadrones, una CNN que diagnostica enfermedades de la yuca a partir de fotos, y ejercicios de regresión lineal y K-Means. | RAM | RAM-R03 |
| F-25 | Confirmado por el autor el 2026-10-14. Repositorios que pasaron a ser públicos: la automatización hotelera, `https://github.com/PortafolioSor0/All-Inclusive` (actualiza F-08), y el microservicio de lista negra de correos, `https://github.com/DevOps-Misw4304-202610/Proyecto1` (actualiza F-11). | PSU, SSD | PSU-R02, SSD-R03 |
| F-26 | Confirmado por el autor el 2026-10-14. Caso de la tesis. Problema: la amenaza cuántica, estimada entre 2028 y 2035, y la soberanía de los datos durante la autenticación; riesgo: suplantación y filtración de información personal sensible. Equipo: pareja; ambos aportan a todo, el autor sobre todo a LWE y su compañero a ZKP. Decisiones: protocolo interactivo o no, y variante de LWE (binaria, Ring, Module o con redondeo); se eligió un protocolo no interactivo con Module-LWE, porque se parametriza con facilidad hasta un objetivo de seguridad, es ligero y funciona en dispositivos de gama baja. Cambio de rumbo: la primera versión del prototipo podía filtrar el secreto del usuario, y ahora en lugar del compromiso solo se envían sus bits altos, que el verificador reconstruye. Cifras: de megabytes a pocos kilobytes y de varios segundos a menos de medio segundo. Lo que cambiaría: sumar al equipo a alguien de electrónica que lleve la NTT de la teoría a la práctica. | SSD | SSD §4.6 |
| F-27 | Confirmado por el autor el 2026-10-14. Caso de AndeSpace. Problema: espacios de la universidad desaprovechados y falta de una forma sencilla de reservar espacios grupales y organizarse con amigos según sus horarios; riesgo: espacios y tiempo desaprovechados, y amigos que no se coordinan por lo que cuesta encontrar horarios comunes. Equipo de 6: tres en Kotlin y tres en Flutter, todos en backend y base de datos. Del autor, de punta a punta (lluvia de ideas, diseño, documentación, base de datos, backend y Flutter): la pantalla de inicio, la búsqueda, la reserva de salones y la red de amigos con estados de visibilidad (ocupado, en casa, libre…). De sus compañeros, también de punta a punta: ajustes, favoritos, historial, horario personal, horarios cruzados con amigos, notificaciones en la app y detalle de un salón. Decisiones: inicio con muchas funciones o pocas, diseño cargado o sobrio, amigos siempre visibles o no; se eligió un diseño sobrio con un inicio que solo tiene lo esencial y que cada usuario decida su privacidad frente a sus amigos. Cambio de rumbo: la parte social no estaba prevista; con el feedback se vio que era inherente al aprovechamiento de los espacios. Resultado: mejor proyecto de la sección; aprendió a trabajar con un backend unificado e independiente de dos frontends. Lo que cambiaría: incorporar antes los amigos y los horarios. | SSD | SSD §4.6 |
| F-28 | Confirmado por el autor el 2026-10-14. Caso de la web odontológica. Problema: el consultorio no tenía presencia en línea; riesgo: perder a los pacientes que llegan por canales digitales, un mercado nuevo. Trabajo individual: identificar el problema, conversar con la doctora, especificar requisitos, diseñar, implementar y desplegar. Decisión: cambiar el vocabulario técnico de la doctora por uno cercano al paciente, con buenos resultados. Cambio de rumbo: no había previsto la versión móvil, y luego fue evidente que la mayoría de pacientes llegaría desde el móvil. Resultado: unos 2–3 pacientes nuevos al mes. Lo que cambiaría: iterar más rápido sobre los textos finales, contrastándolos con la doctora para su aprobación. Sin imágenes. | SSD | SSD §4.6 |
| F-29 | Confirmado por el autor el 2026-10-14. La placa de identidad dice "Ingeniería de Sistemas y Computación", no "ingeniero", porque el autor aún no se ha graduado. Machine Learning se añade a sus áreas de enfoque. | CPU, SCN | CPU-R03, SCN-R46 |

## 8. Historial de cambios

| Fecha | Cambio |
| --- | --- |
| 2026-10-12 | Creación: índice, convenciones, plantilla, registro de decisiones D-01 a D-32 y hechos F-01 a F-20. Primera tanda (`00-foundations/`) en revisión. |
| 2026-10-12 | El autor aprueba `00-foundations/`. Segunda tanda (`01-standards/`) en revisión. Nuevos: §4.5 (vocabulario de verificación), regla de enmiendas en §5.2 y decisiones D-33 a D-44. Enmiendas pendientes de confirmación en SYS 1.1, STR 1.1, VIS 2.0 y AST 1.1. F-05 confirmado. |
| 2026-10-12 | El autor aprueba `01-standards/` y confirma las enmiendas SYS 1.1, STR 1.1, VIS 2.0 y AST 1.1. Nueva decisión D-45. |
| 2026-10-12 | Máster de la escena aceptado. Tercera tanda (`02-features/`, doce specs) en revisión; los archivos de las secciones se numeran en el orden canónico. Decisiones D-46 a D-58. Hechos F-01 a F-18 incorporados. Enmiendas pendientes de confirmación en VSN 2.1, SYS 1.2, STR 1.2, VIS 2.1, AST 2.0, I18N 1.1 y 1.2, y QLT 2.0 y 2.1. |
| 2026-10-12 | El autor aprueba `02-features/` y confirma todas las enmiendas pendientes. Cuarta tanda (`03-delivery/`) en revisión y `CLAUDE.md` escrito. Decisiones D-59 a D-63. Enmiendas pendientes de confirmación en SYS 1.3 y STR 1.4. |
| 2026-10-13 | El autor aprueba `03-delivery/` y las últimas enmiendas. Todas las specs quedan aprobadas. Decisión D-64: versiones de arranque para empezar ya. |
| 2026-10-13 | Antes de empezar M0: se retira de las cabeceras de SYS, STR, AST, I18N y QLT la marca de enmienda pendiente, ya confirmada; VSN 2.2 y SYS 2.1 enumeran los slugs en orden canónico; PLAN 1.2 y decisión D-65. |
| 2026-10-13 | Durante M0, por delegación del autor: STR 1.5 (archivos generados en `.gitignore`) y TST 1.2 (regla de imágenes de Next desactivada, fragmentos de lint sobre archivos reales, WebKit solo en CI); y DEP 1.1 (el servidor de `preview` retira `upgrade-insecure-requests`, que rompía WebKit sobre HTTP). |
| 2026-10-13 | El autor confirma las enmiendas de M0 y decide D-66 (dos variantes de escena) y D-67 (puerta en contenedor). Hecho F-21. Enmiendas: VSN 2.3, SYS 2.2, STR 1.6, VIS 2.2, AST 3.0, TSC 2.1, QLT 2.2, TST 1.3, SCN 1.1, SET 1.1, SMP 1.1, CMOS 1.1 y PLAN 1.3. |
| 2026-10-13 | Durante M1, por delegación del autor: TSC 2.2 (funciones de serialización; los archivos de prueba quedan exentos de las restricciones de rutas y de almacenamiento) y nota en PLAN sobre `SITE` y los iconos `copy` y `check`. |
| 2026-10-13 | Durante M2, por delegación del autor: STR 1.7 (`scripts/assets-shared.mjs`) y AST 3.1 (AST-R54). |
| 2026-10-13 | Durante M3: IO 1.1 (propiedades de los PDF publicados) y TST 1.4 (barra final de las rutas en las pruebas). |
| 2026-10-13 | Durante M4, por delegación del autor: DEP 1.2 (DEP-R32, los scripts de datos de Next.js se reúnen en uno), SMP 1.2 (datos estructurados en inicio y secciones; `theme-color` desde el manifiesto), AST 3.2, VIS 2.3 (tokens de impresión), TST 1.5 y TSC 2.3. |
| 2026-10-13 | Durante M5, por delegación del autor: decisiones D-68 a D-70. SYS 2.3 (`<html>` en los layouts de grupo, dos enlaces de salto, variante `no-hover`, `agentRules`), SCN 1.2 (`labelShift`, etiquetas sin hover, posición de la pista, atributos de prueba), VIS 2.4, TST 1.6 (peticiones canceladas y preparación de Firefox en la prueba base) y PLAN 1.4 (reparto de cuatro pruebas E2E de SCN entre M6 y M7). |
| 2026-10-13 | Revisión de M5 por el autor: decisión D-71 (aura como halo, sin línea de contorno). VIS 2.5 y SCN 1.3. |
| 2026-10-13 | Revisión de M5 por el autor: decisión D-72 (relleno permanente y halo más tenue en reposo). VIS 2.6. |
| 2026-10-13 | El autor revisa y aprueba M2 a M5 en conjunto, incluidos el contenido (A4) y la calibración (A3): SCN 1.4. Durante M6, por delegación del autor: PNL 1.1 (detalles del diálogo y del cierre) y PLAN 1.5 (tres criterios de cambio de idioma pasan a M7). |
| 2026-10-13 | Durante M7, por delegación del autor: decisiones D-73 a D-75. BOOT 1.1, SET 1.2, PNL 1.2, SYS 2.4, SCN 1.5 y TST 1.7. |
| 2026-10-13 | Durante M8. Por decisión del autor al revisar las imágenes, D-76 (fondo del display de diagnóstico en el boceto): VIS 2.7 y SCN 1.6. Por delegación del autor, D-77 (Lighthouse en tres pasadas y `preview` con compresión): QLT 2.3, TST 1.8, SYS 2.5, STR 1.8 y DEP 1.3. |
| 2026-10-13 | Cierre de M8. El autor confirma la lectura del contenido en el panel (A4), los sonidos (A5), la auditoría manual salvo el lector de pantalla y el teléfono real (A6) y las dos imágenes al 100 %; aplaza A7, la medición de AST-AC01 y el lector de pantalla (PLAN-R10). Todas las specs salvo DEP y PLAN pasan a "Implementada"; los criterios manuales que necesitan el sitio desplegado se verifican en M9. |
| 2026-10-13 | Durante M9, por delegación del autor: decisión D-78. DEP 1.4 (flujo de publicación, comprobación posterior y URL de producción) y SYS 2.6. |
| 2026-10-13 | Durante M9, por delegación del autor: TST 1.9 (las pruebas sin JavaScript no esperan el aviso de navegación de Firefox; los recorridos de todo el sitio tienen el triple de tiempo). |
| 2026-10-13 | Tras la primera publicación, por delegación del autor: decisión D-79. DEP 1.5 (destino de los datos de la analítica en la política de seguridad). |
| 2026-10-13 | Durante M9, por delegación del autor, tras su prueba en LinkedIn (A9): SMP 1.3 (la página de entrada lleva la descripción y los datos para compartir). |
| 2026-10-13 | Por decisión del autor: D-80 (se retira `motion`). SYS 2.7, QLT 2.4, CMOS 1.2 y DEP 1.6. README del repositorio en primera persona, a petición del autor. |
| 2026-10-13 | Por decisión del autor: D-81 (flechas en la escena). SCN 1.7. |
| 2026-10-14 | Cierre de M9. El autor confirma la vista previa en LinkedIn y WhatsApp (SMP-AC17), revisa el flujo de publicación (TST-AC15) y completa la auditoría con lector de pantalla (QLT-AC27). DEP y PLAN pasan a "Implementada": las 23 specs lo están. Solo queda A7 (AST-AC06). |
| 2026-10-14 | Versión 2, pendiente de aprobación del autor. Hechos F-22 a F-29 y decisiones D-82 a D-90. Enmendadas: VSN 2.4, SYS 2.8, STR 1.9, VIS 3.0, AST 3.3, TSC 2.4, I18N 1.3, QLT 3.0, TST 1.10, SCN 2.0, CPU 1.1, PSU 1.1, SSD 1.1, RAM 1.1, IO 1.2, SET 2.0, SMP 1.4, DEP 1.7 y PLAN 1.6, todas en "En revisión". BOOT, PNL, FAN y CMOS no cambian. |
| 2026-10-14 | El autor aprueba todas las specs de la versión 2; las 19 enmendadas pasan a "Aprobada". Empieza M10. |
| 2026-10-14 | Cierre de M10: CPU, RAM y PSU pasan a "Implementada". |
