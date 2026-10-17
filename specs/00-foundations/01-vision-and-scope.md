# VSN — Visión y alcance

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 4.0 |
| Última actualización | 2026-10-16 |
| Depende de | — |

## 1. Propósito

Definir qué es el producto, para quién es, qué entra en la primera versión y qué queda fuera. Este documento también fija los identificadores y el vocabulario que usan todas las demás specs.

### 1.1 Declaración de producto

Un portfolio web para Juan Esteban Álvarez García, estudiante de último semestre de Ingeniería de Sistemas y Computación (Universidad de los Andes), que busca empleo o prácticas a tiempo completo desde enero de 2027.

El visitante ve una placa madre fotorrealista sobre un workbench. Seis componentes de hardware tienen un aura ámbar; al hacer clic en uno se abre un panel con una sección del perfil. El sitio tiene dos propósitos simultáneos:

1. **Informar:** que quien evalúa encuentre el perfil, el stack, los proyectos, la experiencia y el contacto en segundos.
2. **Demostrar:** que el propio sitio sea evidencia de criterio técnico (arquitectura, accesibilidad, rendimiento, pruebas y metodología SDD visibles en un repositorio público).

Cuando los dos propósitos entran en conflicto, gana **informar**.

## 2. Audiencia

| Persona | Qué busca | Tiempo que dedica | Cómo llega |
| --- | --- | --- | --- |
| **Reclutador o reclutadora de talento** (perfil no técnico) | Confirmar formación, idiomas, disponibilidad y contacto; descargar el CV | 30 a 60 segundos | Enlace en el CV, LinkedIn, correo o WhatsApp; a veces desde el móvil |
| **Líder técnico o entrevistador** | Juzgar profundidad técnica: proyectos, decisiones, calidad del código del sitio | 3 a 10 minutos; abre DevTools y el repositorio | Enlace reenviado por el reclutador; escritorio |
| **Par técnico** (compañeros, comunidad) | Curiosidad por la ejecución y el setup personal | Variable | GitHub, redes |

No se asume que el visitante sepa qué es cada pieza de hardware.

## 3. Principios de producto

Cada principio resuelve conflictos de diseño; se citan por su identificador.

| ID | Principio | Consecuencia práctica |
| --- | --- | --- |
| P1 | **El contenido manda.** | Ninguna animación, sonido o efecto retrasa o tapa la información. |
| P2 | **Todo lo decorativo se puede saltar.** | La secuencia de arranque se salta con un clic o una tecla; el movimiento se desactiva con `prefers-reduced-motion`. |
| P3 | **Siempre hay una salida rápida.** | La vista simple (todo el contenido en una página plana) está a un clic desde cualquier pantalla y es lo que ve un móvil. |
| P4 | **Una sola fuente de contenido.** | La escena, la vista simple y la secuencia de arranque leen los mismos datos; nada se escribe dos veces. |
| P5 | **Cada componente se reconoce sin saber de hardware.** | Al hacer hover aparece el nombre de la pieza y lo que contiene. |
| P6 | **Honestidad del contenido.** | Solo se publica lo que respaldan los CVs o el autor. Se distingue lo desarrollado de lo configurado y lo individual de lo hecho en equipo. |
| P7 | **Digerible como un CV.** | Cada sección se lee en menos de un minuto; el detalle adicional se revela a demanda. |

## 4. Mapa de componentes

Esta tabla es la referencia canónica de identificadores, slugs y nombres. Ninguna otra spec los redefine.

### 4.1 Componentes primarios (los seis con aura principal)

| `ComponentId` | Pieza de hardware (ES / EN) | Ubicación en la escena | Sección (ES / EN) | `SectionSlug` | Spec |
| --- | --- | --- | --- | --- | --- |
| `cpu` | Procesador (CPU) / Processor (CPU) | Sobre la placa | Perfil / Profile | `profile` | CPU |
| `psu` | Fuente de poder (PSU) / Power supply (PSU) | Sobre el workbench, cableada a la placa | Experiencia / Experience | `experience` | PSU |
| `ssd` | SSD NVMe / NVMe SSD | Sobre la placa | Proyectos / Projects | `projects` | SSD |
| `ram` | Memoria RAM / RAM | Sobre la placa | Stack tecnológico / Tech stack | `stack` | RAM |
| `io` | Panel I/O / I/O panel | Borde de la placa | Contacto / Contact | `contact` | IO |
| `fan` | Ventilador ARGB / ARGB fan | Sobre el workbench | Ecosistema personal / Personal ecosystem | `ecosystem` | FAN |

El orden de esta tabla es el **orden canónico** de las secciones primarias en la navegación anterior/siguiente, en la vista simple y en cualquier listado.

### 4.2 Elementos secundarios

| Identificador | Pieza de hardware (ES / EN) | Ubicación | Función | `SectionSlug` | Spec |
| --- | --- | --- | --- | --- | --- |
| `cmos` | Pila CMOS / CMOS battery | Sobre la placa | Abre la sección "Acerca de este sitio / About this site" | `about` | CMOS |
| `settings` | Panel de control / Control panel | Sobre el workbench | Abre los ajustes (sonido, reset, idioma). No es una sección ni tiene URL. | — | SET |
| `post-display` | Display de diagnóstico / Diagnostic display | Sobre la placa | Muestra cuántas secciones primarias se han visitado. No es interactivo. | — | SCN |

- `ComponentId` es la unión de los seis primarios más `cmos`: son los siete elementos que abren una sección.
- `SectionSlug` es la unión de los siete slugs: `profile`, `experience`, `projects`, `stack`, `contact`, `ecosystem`, `about`.
- La sección `about` va siempre después de las seis primarias y no participa en el contador de visitadas.

## 5. Alcance de la versión 1

| ID | Requisito de alcance |
| --- | --- |
| VSN-R01 | El sitio DEBE ofrecer la **escena interactiva** en viewports de al menos 1024×600 px con JavaScript activo: imagen de la placa, siete elementos que abren sección, panel de control de ajustes y display de diagnóstico. |
| VSN-R02 | El sitio DEBE ofrecer la **vista simple** con todo el contenido de las siete secciones en una sola página, y esta DEBE ser lo que ve un visitante en un viewport menor que 1024×600 px o sin JavaScript. |
| VSN-R03 | Cada una de las siete secciones DEBE tener una URL propia que se pueda compartir y que abra directamente esa sección. |
| VSN-R04 | Todo texto visible DEBE existir en español y en inglés, con el mismo contenido en ambos idiomas. |
| VSN-R05 | El visitante DEBE poder cambiar de idioma desde cualquier pantalla sin perder la sección en la que está. |
| VSN-R06 | Al cargar la escena por primera vez en una sesión, DEBE mostrarse una **secuencia de arranque** de como máximo 2 segundos que el visitante puede saltar. |
| VSN-R07 | Al pasar el cursor o el foco de teclado sobre un elemento interactivo de la escena, DEBE mostrarse una etiqueta con el nombre de la pieza y lo que contiene. |
| VSN-R08 | El visitante DEBE poder descargar el CV en PDF en el idioma activo. |
| VSN-R09 | El visitante DEBE poder activar y desactivar efectos de sonido; DEBEN estar desactivados por defecto. |
| VSN-R10 | El visitante DEBE poder reiniciar la sesión (repetir el arranque y borrar el progreso de secciones visitadas). |
| VSN-R11 | Toda la experiencia DEBE ser operable solo con teclado y cumplir WCAG 2.2 nivel AA (detalle en QLT). |
| VSN-R12 | La escena interactiva NO DEBE requerir scroll de página. Los paneles PUEDEN tener scroll interno. |
| VSN-R13 | El sitio DEBE funcionar como archivos estáticos, sin servidor de aplicación, base de datos ni llamadas a APIs propias. |
| VSN-R14 | El sitio DEBE incluir una sección "Acerca de este sitio" que explique el stack, la metodología y enlace al repositorio. |
| VSN-R20 | La escena DEBE ofrecer dos **variantes de imagen**, fotografía y boceto, con los mismos objetos en las mismas posiciones. El visitante DEBE poder cambiar de una a otra desde los ajustes y su elección se conserva entre visitas. La variante por defecto es la fotografía. |

### 5.1 Política de contenido y datos personales

| ID | Requisito |
| --- | --- |
| VSN-R15 | Se publican: nombre completo, ciudad (Bogotá, Colombia), correo, número de WhatsApp, LinkedIn, GitHub, fotografía, formación, experiencia, proyectos y CV en PDF. |
| VSN-R16 | Todo dato publicado DEBE poder rastrearse a un CV actualizado, a un hecho `F-nn` del [README](../README.md) o a una spec. NO DEBE publicarse ningún dato tomado de las imágenes de `docs/VisualIdeas/`. |
| VSN-R17 | NO DEBEN publicarse nombres de terceros: asesor de tesis, profesores, compañeros de equipo ni clientes. Los trabajos en equipo indican el tamaño del equipo. Quedan exceptuados los identificadores que forman parte de las URLs públicas que se enlazan (el nombre comercial en la dirección del sitio odontológico y los nombres de usuario u organización en las direcciones de repositorios), porque ya son públicos y no se pueden omitir sin romper el enlace; y las referencias de Contacto (IO-R17), personas que dieron su consentimiento para publicar su nombre, su rol y su correo, y nada más (F-34, D-104). |
| VSN-R18 | El contenido DEBE distinguir lo que el autor desarrolló de lo que configuró o integró, y lo individual de lo hecho en equipo. |
| VSN-R19 | Los repositorios privados se mencionan con la etiqueta "Repositorio privado / Private repository" y sin enlace. |

## 6. Versión 2

La versión 2 nace de lo que piden los procesos de selección y de las primeras pruebas con personas reales (D-82 a D-87). No cambia el concepto: añade profundidad al contenido y hace más amable la llegada a la escena.

| ID | Requisito de alcance |
| --- | --- |
| VSN-R21 | Tres proyectos destacados, la tesis, AndeSpace y la web odontológica, DEBEN tener un **caso de estudio**: una página propia, que se abre sin iniciar sesión y sin JavaScript, con el problema, el rol del autor (qué hizo él y, si fue en equipo, qué hizo el resto), el proceso (decisiones con sus alternativas y cambios de rumbo) y el resultado con lo aprendido. Desde la tarjeta de cada uno de esos proyectos se llega a su caso (ver SSD y SMP). |
| VSN-R22 | La escena DEBE mostrar siempre una **placa de identidad** con el nombre del autor, su carrera y sus áreas de enfoque, y DEBE dar la **bienvenida** al terminar el arranque, una vez por sesión, en un diálogo que se cierra con un clic en cualquier parte, con Esc o con su botón de cerrar (ver SCN). |
| VSN-R23 | Desde la escena, el CV, el correo, LinkedIn y GitHub DEBEN estar a una sola interacción (ver SET). |
| VSN-R24 | Los resultados y las cifras más relevantes del contenido DEBEN destacarse con peso tipográfico, nunca con color, y como mucho uno por elemento de lista (ver TSC y VIS). |
| VSN-R25 | El contenido DEBE incluir la opción académica en Machine Learning, sus cursos y sus proyectos (F-22 a F-24), y los enlaces a los repositorios que pasaron a ser públicos (F-25). |

### 6.1 Previstas sin fecha

No forman parte de v2 (D-90). La arquitectura NO DEBE impedirlas, pero no se implementan ni se deja código preparado para ellas.

| ID | Funcionalidad | Qué exige de la arquitectura |
| --- | --- | --- |
| V2-01 | Escena interactiva en móvil con un encuadre vertical propio. | El modo de render se decide en un único punto (ver SYS-R12). |
| V2-02 | Un tercer idioma. | Añadir un idioma consiste en añadir un locale y sus diccionarios, sin tocar componentes (ver I18N §4.9). |

## 7. Fuera de alcance

No se construye en v1 ni está planificado. Añadir cualquiera de estos puntos exige una decisión explícita del autor y un cambio de esta spec.

- Terminal interactiva o línea de comandos dentro del sitio.
- Render 3D en tiempo real (WebGL, Three.js).
- Backend, base de datos, autenticación, CMS o panel de administración.
- Formulario de contacto (el contacto es por enlaces directos).
- Blog, noticias o cualquier contenido con fecha de publicación.
- Selector de tema claro/oscuro. La variante de escena de VSN-R20 cambia la imagen y sus auras; los paneles y la vista simple no cambian.
- Pantalla de "apagado" o cualquier acción que deje la pantalla sin contenido.
- Capturas de pantalla o demos embebidas de los proyectos, también en los casos de estudio (no existen; D-90).
- Chatbot, testimonios de terceros (VSN-R17) y animaciones nuevas que no sirvan al contenido (P1).
- Cambio de color del aura según el estado de visita.
- Banner de cookies (no se usan cookies; ver DEP).

## 8. Criterios de aceptación de producto

Estos criterios validan el producto completo. Los criterios de cada funcionalidad están en su spec.

| ID | Criterio | Verificación |
| --- | --- | --- |
| VSN-AC01 | En un viewport de 1280×720 px, desde que la escena es visible, cualquier sección se abre con **un** clic o con una activación de teclado. | Prueba E2E |
| VSN-AC02 | Desde la escena, cualquier enlace de contacto (correo, WhatsApp, LinkedIn, GitHub) y la descarga del CV se alcanzan en **dos** interacciones como máximo. | Prueba E2E |
| VSN-AC03 | El HTML que el servidor entrega para `/es/` y `/en/` contiene el texto completo de las siete secciones sin ejecutar JavaScript. | Prueba E2E con JavaScript desactivado |
| VSN-AC04 | En un viewport de 390×844 px se muestra la vista simple, no hay scroll horizontal y el navegador no solicita ningún archivo de la imagen de la escena. | Prueba E2E que inspecciona las peticiones de red |
| VSN-AC05 | Para cada una de las siete secciones, abrir su URL directa en 1280×720 px muestra la escena con el panel de esa sección abierto, sin secuencia de arranque. | Prueba E2E |
| VSN-AC06 | Cambiar de idioma con una sección abierta conserva la sección: de `/es/projects/` se pasa a `/en/projects/`. | Prueba E2E |
| VSN-AC07 | Ambos idiomas tienen exactamente las mismas claves de contenido y el mismo número de elementos en cada lista. | Prueba unitaria de integridad de contenido |
| VSN-AC08 | Recorrido completo solo con teclado: saltar el arranque, enfocar cada elemento interactivo, abrir y cerrar cada panel, cambiar idioma, activar sonido y reiniciar. | Prueba E2E |
| VSN-AC09 | El sitio desplegado no contiene nombres de terceros (VSN-R17), salvo las referencias de Contacto, ni datos de las imágenes de referencia (VSN-R16). | Revisión manual del autor antes de cada publicación de contenido |
| VSN-AC10 | El resultado de la compilación es una carpeta de archivos estáticos que se sirve correctamente con cualquier servidor de archivos, sin proceso de Node en ejecución. | Prueba E2E contra la carpeta exportada servida de forma estática |
| VSN-AC11 | En `desktop`, desde la escena en reposo, el CV, el correo, LinkedIn y GitHub se alcanzan con una sola activación cada uno, sin abrir ningún panel. | Prueba E2E |
| VSN-AC12 | Con JavaScript desactivado, la página de caso de cada uno de los tres proyectos de VSN-R21 se abre en su URL, en ambos idiomas, y contiene los cuatro bloques: problema, rol, proceso y resultado. | Prueba E2E con JavaScript desactivado |

## 9. Glosario

Términos usados en todas las specs. En el código se usa el término en inglés entre paréntesis.

| Término | Definición |
| --- | --- |
| **Escena** (scene) | La vista interactiva: la imagen del workbench con la placa madre y la capa de elementos interactivos encima. |
| **Imagen de la escena** / **máster** (scene asset / master) | La imagen fotorrealista de fondo. El máster es el archivo original a máxima resolución; los derivados son sus versiones optimizadas para la web. |
| **Variante de escena** (scene variant) | Cada una de las dos imágenes con las que se puede ver la escena: `photo` (fotografía) o `sketch` (boceto). Ver AST §4.10. |
| **Espacio de escena** (scene space) | Sistema de coordenadas de 1600×900 unidades en el que se definen las zonas interactivas (ver AST §4.2). |
| **Zona segura** (safe area) | Rectángulo del espacio de escena que es visible en todos los viewports admitidos; contiene todos los elementos interactivos. |
| **Componente** (component) | Una pieza de hardware de la escena que abre una sección. Se identifica con un `ComponentId`. No confundir con "componente de React", que en las specs se llama siempre así, con el apellido. |
| **Zona interactiva** (hotspot) | El área clicable asociada a un componente o elemento secundario, definida como un polígono en el espacio de escena. |
| **Aura** (aura) | El resplandor ámbar que rodea el contorno de una zona interactiva. |
| **Etiqueta** (label) | El rótulo que aparece junto a una zona interactiva con el nombre de la pieza y lo que contiene. |
| **Sección** (section) | Un bloque de contenido del perfil (por ejemplo, Proyectos). Se identifica con un `SectionSlug`. |
| **Panel de detalle** (detail panel) | El modal que muestra una sección sobre la escena. |
| **Vista simple** (simple view) | La página plana, sin escena, con las siete secciones una tras otra. |
| **Modo de render** (render mode) | `scene` o `simple`: cuál de las dos presentaciones ve el visitante (ver SYS §4.4). |
| **Secuencia de arranque** (boot sequence) | La animación inicial con un registro de arranque al estilo del kernel de Linux. |
| **Barra fija** (fixed bar) | La barra de controles siempre visible en una esquina de la escena (idioma, vista simple y contactos). |
| **Placa de identidad** (identity plate) | La placa siempre visible en la esquina superior izquierda de la escena con el nombre, la carrera y las áreas del autor (ver SCN). |
| **Bienvenida** (welcome) | El diálogo con estética de terminal que saluda al visitante al terminar el arranque, una vez por sesión (ver SCN). |
| **Caso de estudio** (case study) | La página de un proyecto destacado con su problema, el rol del autor, el proceso y el resultado (ver SSD y SMP). |
| **Texto destacado** (emphasized text) | Una cadena de contenido con un fragmento que se muestra con más peso (ver TSC §4.4). |
| **Panel de control** (control panel) | La caja de mandos sobre el workbench que abre los ajustes. Hasta el 2026-10-15 se llamó "panel frontal" (D-95). |
| **Ajustes** (settings) | El menú con sonido, reinicio de sesión e idioma. |
| **Display de diagnóstico** (POST display) | El indicador de dos dígitos en la placa que muestra las secciones visitadas. |
| **Sección visitada** (visited section) | Una sección primaria cuyo panel se ha abierto al menos una vez en la sesión actual. |
| **Sesión** (session) | El tiempo de vida de una pestaña del navegador, tal como lo define `sessionStorage`. |
| **Locale** | Idioma de la interfaz: `es` o `en`. |
| **Feature** | Carpeta de `src/features/` que agrupa todo el código de una funcionalidad (ver STR). |

## 10. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| En caso de conflicto, informar gana a demostrar (§1.1). | El reclutador con 30 segundos es quien decide si el perfil avanza; una experiencia inmersiva que le cueste tiempo anula el beneficio de la demostración técnica. |
| Móvil recibe la vista simple en v1 (VSN-R02, D-08). | El primer contacto llega a menudo desde un teléfono, así que bloquear el móvil pierde visitantes. La escena depende del hover, que no existe en táctil, y exigiría un segundo encuadre de la imagen; la vista simple cubre el caso con coste casi nulo porque debe existir de todos modos. |
| Slugs de sección en inglés para ambos idiomas (§4, D-13). | Un único identificador estable por sección: cambiar de idioma es cambiar el prefijo de la URL, y no hay tabla de traducción de rutas que mantener. |
| La sección `about` no cuenta en el display de diagnóstico (§4.2). | El contador comunica el progreso sobre el perfil profesional, que son las seis secciones primarias. |
| Casos de estudio en páginas propias (VSN-R21, D-82). | Un reclutador técnico necesita el porqué de las decisiones, no solo el resultado; y un proceso de selección pide un enlace que lleve directamente al proyecto. Una página por caso se puede enviar, se lee en un teléfono y no alarga el panel de Proyectos (P7). |
| Bienvenida en lugar de pista (VSN-R22, D-83, D-92). | Quien llega no sabía de quién era el portfolio ni qué hacer: el nombre solo existía para lectores de pantalla. La placa responde a quién; la bienvenida, a qué hacer. Por decisión del autor (D-92) es una terminal centrada en un diálogo: se ve sin falta y se cierra con un clic en cualquier parte, así que no retiene a nadie (P1, P2). |

## 11. Preguntas abiertas

Ninguna.

## 12. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-16 | 4.0 | Por decisión del autor (D-104): VSN-R17 admite una excepción, las referencias de Contacto, con el consentimiento de cada persona (F-34). VSN-AC09 actualizado. |
| 2026-10-15 | 3.1 | Por decisión del autor (D-95): la pieza de ajustes pasa a llamarse panel de control, en el mapa de componentes, VSN-R01 y el glosario. |
| 2026-10-14 | 3.0 | Por decisión del autor (D-92): la bienvenida es un diálogo con estética de terminal que se cierra con un clic en cualquier parte, con Esc o con su botón. VSN-R22, glosario y decisión reescritos. |
| 2026-10-14 | 2.4 | Estado: pasa a "Implementada" al cerrar M13, con todos sus criterios automáticos citados por una prueba (TST-R38), VSN-AC11 y VSN-AC12 incluidos. VSN-AC09 sigue siendo la revisión del autor antes de cada publicación de contenido; para v2 la hizo con A11 y A12. Sin cambio de requisitos. |
| 2026-10-14 | 2.4 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 2.4 | Versión 2, pendiente de aprobación del autor (D-82 a D-87, D-90). §6 reescrito con el alcance de v2: VSN-R21 a VSN-R25. Las antiguas V2-01 y V2-02 pasan a §6.1, sin fecha. §7: capturas y demos tampoco en los casos; chatbot, testimonios y animaciones gratuitas, fuera. Nuevos VSN-AC11 y VSN-AC12. Glosario: placa de identidad, bienvenida, caso de estudio y texto destacado. |
| 2026-10-13 | 2.3 | VSN-AC09: el autor revisó el sitio desplegado y no contiene nombres de terceros ni datos de las imágenes de referencia. Sin cambio de requisitos. |
| 2026-10-13 | 2.3 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). VSN-AC09 se comprueba antes de la primera publicación, en M9. Sin cambio de requisitos. |
| 2026-10-13 | 2.3 | Por decisión del autor (D-66): nuevo VSN-R20, la escena tiene dos variantes de imagen que el visitante intercambia desde los ajustes. Glosario: variante de escena. §7: se aclara que no es un selector de tema. |
| 2026-10-13 | 2.2 | §4.2: los slugs se enumeran en el orden canónico de D-46. Sin cambio de requisitos. |
| 2026-10-12 | 2.1 | Confirmada por el autor el 2026-10-12. VSN-R17: se aclara que la excepción cubre los identificadores que forman parte de URLs públicas enlazadas, como los nombres de usuario en direcciones de repositorios. |
| 2026-10-12 | 1.0 | Versión inicial. Aprobada por el autor. |
| 2026-10-12 | 2.0 | Por decisión del autor, el orden canónico de las secciones primarias pasa a ser el de mayor relevancia para quien evalúa: Perfil, Experiencia, Proyectos, Stack tecnológico, Contacto, Ecosistema personal (D-46). |
