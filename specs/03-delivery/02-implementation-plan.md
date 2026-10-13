# PLAN — Plan de implementación

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.3 |
| Última actualización | 2026-10-13 |
| Depende de | Todas las demás specs |

## 1. Propósito

Ordenar la construcción del sitio en hitos pequeños, cada uno con un resultado comprobable, y dejar claro qué specs cubre cada hito, qué debe hacer el autor en persona y cuándo se da un hito por cerrado.

## 2. Alcance

**Incluye:** reglas de ejecución, hitos con sus specs, entregables y criterios de salida, tareas que solo puede hacer el autor y registro de avance.

**No incluye:** un calendario por hito. El sitio debe estar publicado a más tardar al final del 2026-10-16, fecha dura confirmada por el autor el 2026-10-13; el plan fija el orden y las condiciones, y §4.5 dice qué se puede aplazar si el tiempo no alcanza.

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Hito** | Un bloque de trabajo que termina con `pnpm check` en verde en `main` y con sus criterios de salida cumplidos. |
| **Criterio de salida** | Condición comprobable que cierra un hito. Casi siempre es un conjunto de criterios de aceptación de las specs del hito. |
| **Tarea del autor** | Trabajo que requiere a Juan Esteban: una revisión manual, una decisión o una acción en una cuenta suya. |

## 4. Requisitos

### 4.1 Reglas de ejecución

| ID | Requisito |
| --- | --- |
| PLAN-R01 | Los hitos se ejecutan en el orden de §4.2. Un hito no empieza hasta que el anterior está cerrado, con la excepción de M2, que puede hacerse en paralelo con M1. |
| PLAN-R02 | El hito M0 empieza el 2026-10-13 con las versiones de arranque de SYS §4.1, que cumplen la edad mínima de SYS-R37. La subida a las versiones más recientes es opcional y no forma parte de ningún hito. |
| PLAN-R03 | Al empezar un hito, quien lo implementa lee las specs que ese hito lista, en el orden de README §3. No implementa nada que pertenezca a un hito posterior ni deja código preparado para él. |
| PLAN-R04 | Dentro de un hito el orden es: lógica con TDD (TST-R03), después componentes con sus pruebas, después pruebas E2E. |
| PLAN-R05 | Un hito se cierra cuando se cumplen todos sus criterios de salida, `pnpm check` pasa en local y el flujo de CI termina bien en `main`. Entonces se actualiza el estado de las specs que el hito deja implementadas (TST-R38) y se anota el cierre en la tabla de §4.4. |
| PLAN-R06 | Si un requisito resulta inviable o erróneo durante un hito, se aplica README §5.2, punto 6: se detiene esa tarea y se propone el cambio de spec al autor. No se improvisa. |
| PLAN-R07 | Los commits siguen Conventional Commits, en inglés, con el feature o el área como ámbito (por ejemplo `feat(detail-panel): close on backdrop click`). El asunto no supera 72 caracteres. El cuerpo cita los identificadores de los requisitos o criterios que el commit implementa. |
| PLAN-R08 | Cada `push` a `main` deja el repositorio en un estado en el que `pnpm check` pasa (TST-R44). |
| PLAN-R09 | Un criterio que describe el producto terminado (por ejemplo STR-AC01, que exige los doce features) se comprueba desde M0 en su forma parcial, que es que no exista nada ajeno a la spec, y en su forma completa en el hito que lo lista. |
| PLAN-R12 | M0 adelanta cuatro piezas que el resto del plan asigna a hitos posteriores, porque sus propios criterios de salida las necesitan: `shared/contracts/locale.ts` y `shared/contracts/ids.ts` (TSC §4.3), de las que salen las rutas de SYS-AC01 y SYS-AC02 y que TSC-R17 impide duplicar; y `getSiteUrl` en `shared/config/site.ts` (SMP-R01), que exige SYS-AC13; y `shared/lib/typed-object.ts`, que TSC-AC04 necesita como archivo real para comprobar su excepción. Se entregan completas y con sus pruebas. |
| PLAN-R13 | Los scripts `assets:build`, `assets:check` y `test:lighthouse` existen desde M0, porque `pnpm check` y el flujo de CI los ejecutan (SYS-R34, TST-R39). Hasta el hito que los implementa (M2 para los dos de assets, M8 para Lighthouse), su archivo de `scripts/` solo imprime qué hito lo implementa y termina sin error. Ese hito lo sustituye por la implementación real. Ningún marcador llega a M9. |

### 4.2 Hitos

| Hito | Nombre | Resultado visible | Specs principales |
| --- | --- | --- | --- |
| M0 | Andamiaje | Un proyecto vacío que compila, se prueba y pasa el CI | SYS, STR, TSC §4.1 y TSC §4.2, TST, DEP §4.5 y DEP §4.6 |
| M1 | Cimientos compartidos | Tipos, rutas, estado, diccionarios, formateadores, tokens y primitivas de interfaz | TSC, I18N, VIS |
| M2 | Assets | Derivados de la escena, de la fotografía y de la imagen para compartir, con su manifiesto | AST §4.7 a AST §4.9, CPU §4.5, SMP §4.6 |
| M3 | Secciones | Las siete secciones con todo su contenido, renderizables de forma aislada | CPU, PSU, SSD, RAM, IO, FAN, CMOS, TSC §4.7 y TSC §4.8 |
| M4 | Vista simple | El sitio completo en modo simple: todas las páginas, en ambos idiomas, sin escena | SMP, I18N §4.5 a I18N §4.7, SET §4.2 |
| M5 | Escena | La placa con sus zonas, auras, etiquetas y display, sin panel | SYS §4.4 y SYS §4.13, SCN, AST §4.8 |
| M6 | Panel | Las secciones se abren sobre la escena y se recorren | PNL |
| M7 | Arranque y ajustes | Secuencia de arranque, barra fija, menú de ajustes y sonido | BOOT, SET |
| M8 | Calidad | Auditoría completa y todas las specs implementadas | QLT, VIS, AST §5 |
| M9 | Publicación | El sitio en producción | DEP |

#### M0 — Andamiaje

- **Entregables:** repositorio inicializado con el árbol de STR §4.1; `package.json` con las versiones de SYS §4.1 y los scripts de SYS §4.9; `pnpm-workspace.yaml` (SYS-R45); `tsconfig.json`, ESLint y Prettier (TSC §4.1 y TSC §4.2, TST §4.4); Vitest y Playwright configurados (TST §4.3 y TST §4.5); las rutas y layouts de SYS §4.5 con páginas mínimas; `serve-static.mjs` y `build-headers.mjs` (DEP §4.5 y DEP §4.6); las pruebas de arquitectura y la de trazabilidad con sus funciones de detección; `ci.yml` (TST §4.8); `LICENSE`; las piezas adelantadas de PLAN-R12 y los marcadores de PLAN-R13.
- **Criterios de salida:** SYS-AC01 a AC03, AC12, AC13 y AC16; STR-AC02 a AC05 y AC09 a AC12; TSC-AC01 a AC04 y AC06; TST-AC01 a AC09, AC11 y AC13; DEP-AC01 a AC05 y AC08; el flujo de CI termina bien (TST-AC14).

#### M1 — Cimientos compartidos

- **Entregables:** `shared/contracts/`, `shared/config/routes.ts`, `shared/state/` con sus tres stores y `StoreHydrator`, `shared/i18n/` con los dos diccionarios y los formateadores, `shared/lib/` (integridad de contenido, `cn`, `typed-object`, `section-nav`, sonido), `styles/tokens.css` y `globals.css` con las variantes de SYS-R50, fuentes, y las primitivas de `shared/ui/`: chip, enlace externo, enlace con aspecto de botón, `PeriodText`, `LanguageSwitcher`, `CopyButton` e iconos base. Incluye además dos piezas que estas necesitan y que otras specs listan como suyas: `SITE` en `shared/config/site.ts` (SMP-R01), de donde los diccionarios toman el nombre del autor, y los iconos `copy` y `check` (IO §4.5), que usa `CopyButton`.
- **Criterios de salida:** TSC-AC05, AC09 y AC11 a AC15; I18N-AC01 a AC09; VIS-AC01, AC02 y AC06; STR-AC07; SET-AC07 y AC08; IO-AC05; SCN-AC01.

#### M2 — Assets

- **Entregables:** `build-assets.mjs` y `check-assets.mjs`; los derivados de `public/scene/` de las dos variantes, los de `public/portrait/` y `public/og/`; `apple-icon.png`; `manifest.generated.ts`. El máster puede seguir siendo provisional (AST §4.9).
- **Criterios de salida:** AST-AC08, AC09, AC13 a AC16 y AC21; CPU-AC09; SMP-AC14 y AC15; QLT-AC24.

#### M3 — Secciones

- **Entregables:** los siete features de sección con sus tipos, hechos, textos y componente raíz; `features/registry.ts`; los CVs en `public/cv/`, con solo el título y el autor en las propiedades del PDF (IO-R04; el autor confirmó el 2026-10-13 que no deben llevar nada más); los iconos de cada sección.
- **Criterios de salida:** los criterios de prueba unitaria y de componente de CPU, PSU, SSD, RAM, IO, FAN y CMOS; TSC-AC07, AC08, AC10 y AC16 a AC18; STR-AC06 y AC08; VSN-AC07.
- **Tarea del autor:** A4.

#### M4 — Vista simple

- **Entregables:** `simple-view` completo; la página `/` y la 404; `robots.ts`, `sitemap.ts` e `icon.svg`; metadatos de todas las páginas; el layout del grupo `(scene)` con la capa base, todavía sin capa de escena.
- **Criterios de salida:** todos los criterios automáticos de SMP; SYS-AC02, AC04, AC14; I18N-AC10 y AC13 a AC17; VSN-AC03, AC04 y AC10; QLT-AC07, AC18 a AC20.
- **Estado al cerrar:** el sitio es utilizable de principio a fin en cualquier dispositivo, aunque todavía sin la experiencia interactiva.

#### M5 — Escena

- **Entregables:** el script previo al pintado; `SceneLayer` con el cambio de modo, la carga bajo demanda y la captura de errores; `ScenePoster`; `Scene` con imagen, viñeteado, zonas, auras, etiquetas, display y pista; la superposición de calibración; `hotspots.ts` calibrado.
- **Criterios de salida:** SYS-AC05 a AC08, AC10, AC11 y AC17 a AC20; todos los criterios automáticos de SCN; AST-AC17 y AC18; VIS-AC04, AC11 y AC13; QLT-AC14, AC16, AC22 y AC26.
- **Tarea del autor:** A3.

#### M6 — Panel

- **Entregables:** `DetailPanel` y las páginas de sección.
- **Criterios de salida:** todos los criterios automáticos de PNL; SYS-AC09; los criterios E2E de las siete secciones; VSN-AC01, AC02, AC05 y AC06; I18N-AC11 y AC12; VIS-AC07 y AC10; QLT-AC04 y AC11.
- **Specs que quedan implementadas:** PNL, CPU, PSU, SSD, RAM, IO, FAN y CMOS, una vez hechas sus revisiones manuales.

#### M7 — Arranque y ajustes

- **Entregables:** `BootScreen` y `BootController`; `FixedBar` y `SettingsMenu`.
- **Criterios de salida:** todos los criterios automáticos de BOOT y de SET; STR-AC01 en su forma completa; VSN-AC08; QLT-AC03, AC09, AC10 y AC13.
- **Tarea del autor:** A5.
- **Specs que quedan implementadas:** BOOT, SET, SCN y SMP.

#### M8 — Calidad

- **Entregables:** el recorrido de axe por todos los estados auditables; las pruebas de presupuestos de peso; la configuración y el script de Lighthouse; las correcciones que resulten.
- **Criterios de salida:** todos los criterios de QLT y de VIS; TST-AC10 y AC12; AST-AC01 a AC07, AC10 a AC12, AC20 y AC22, con las dos secciones de `PROVENANCE.md` en estado `accepted` y el manifiesto sin `provisional`; la prueba de trazabilidad pasa con todas las specs, salvo DEP y PLAN, en estado "Implementada".
- **Tareas del autor:** A1, A6 y A7.

#### M9 — Publicación

- **Entregables:** `README.md`; el proyecto de Cloudflare Pages; `deploy.yml` y `smoke-test.mjs`; la primera publicación; la analítica activada.
- **Criterios de salida:** todos los criterios de DEP; SMP-AC17; TST-AC15; VSN-AC09; la URL de producción anotada en DEP §4.9.
- **Tareas del autor:** A2 (si el repositorio aún no es público), A8 y A9.
- **Specs que quedan implementadas:** todas.

### 4.3 Tareas del autor

| ID | Tarea | Cuándo | Criterio que cierra |
| --- | --- | --- | --- |
| A1 | Hecha el 2026-10-13: modelos anotados en `design/scene/PROVENANCE.md` | — | AST-AC19 |
| A2 | Hacer público el repositorio `Onstrax/portfolio`, ya creado como privado el 2026-10-13 | Al cerrar M9 | DEP-AC11 |
| A3 | Revisar la calibración de las zonas con la superposición de depuración, sobre las dos variantes de la escena, y la posición de las etiquetas | Durante M5 | SCN-AC17 |
| A4 | Leer el contenido de las siete secciones en ambos idiomas | Al cerrar M3 y de nuevo, ya en el panel, en M6 | I18N-AC18 y el criterio de revisión manual de cada sección |
| A5 | Escuchar los cinco efectos de sonido | Durante M7 | SET-AC12 |
| A6 | Auditoría manual: teclado, lector de pantalla, zoom, movimiento reducido, teléfono, sin JavaScript y consola | Durante M8 | QLT-AC27, VIS-AC12 |
| A7 | Mostrar la escena a una persona ajena al hardware y comprobar que identifica las seis piezas con sus etiquetas | Durante M8 | AST-AC06 |
| A8 | Crear la cuenta y el proyecto de Cloudflare Pages, generar el token, guardar los dos secretos en GitHub y activar Web Analytics | Al empezar M9 | DEP-AC09, DEP-AC10 |
| A9 | Compartir la URL en LinkedIn y WhatsApp para comprobar la vista previa, y pasar el Observatorio HTTP de Mozilla | Al cerrar M9 | SMP-AC17, DEP-AC09 |
| A10 | Cuando el repositorio de la automatización hotelera sea público, indicarlo para actualizar PSU (PSU-R07) | Cuando ocurra | — |

### 4.4 Registro de avance

Se rellena al cerrar cada hito (PLAN-R05).

| Hito | Fecha de cierre | Commit de cierre | Observaciones |
| --- | --- | --- | --- |
| M0 | 2026-10-13 | `ff3389b` | CI en verde en los tres motores. El primer `push` (`0fdef20`) falló solo en WebKit y se corrigió en este commit (DEP 1.1). En el equipo del autor WebKit no arranca: lo verifica CI (TST-R44). `assets:*` y `test:lighthouse` son marcadores hasta M2 y M8 (PLAN-R13). El autor revisó el cierre y confirmó las enmiendas el 2026-10-13. Complemento posterior del mismo día: `pnpm check:docker` (TST-AC16), con el que la puerta completa, WebKit incluido, pasa también en local. |
| M1 | 2026-10-13 | `223832a` | CI en verde en los tres motores y `pnpm check:docker` en local. 317 pruebas; cobertura de la lógica: 100 % de líneas y funciones, 97 % de ramas. Adelanta `SITE` y los iconos `copy` y `check`. Incluye ya la preferencia `sceneVariant` y los tokens de la variante boceto (D-66). El autor revisó y aprobó el cierre el 2026-10-13. |
| M2 | — | — | — |
| M3 | — | — | — |
| M4 | — | — | — |
| M5 | — | — | — |
| M6 | — | — | — |
| M7 | — | — | — |
| M8 | — | — | — |
| M9 | — | — | — |

### 4.5 Si el tiempo no alcanza

| ID | Requisito |
| --- | --- |
| PLAN-R10 | El orden de los hitos no cambia y ningún hito se cierra sin sus criterios automáticos. Lo que se puede aplazar, con el visto bueno del autor y anotándolo en §4.4, son revisiones manuales que no bloquean la publicación: A7 (prueba con una persona ajena), la medición con herramienta de AST-AC01 y la auditoría con lector de pantalla de QLT §4.8. Se hacen en los días siguientes a la publicación. |
| PLAN-R11 | No se aplazan: la calibración de las zonas (A3), la revisión del contenido (A4), la auditoría de teclado y sin JavaScript, ni ningún criterio que compruebe una prueba automática. |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| PLAN-AC01 | Cada hito cerrado tiene su fila de §4.4 completa, y el commit anotado tiene el flujo de CI terminado bien. | Revisión manual del autor al cerrar cada hito |
| PLAN-AC02 | Al cerrar M9, todas las specs del índice están en estado "Implementada" y la prueba de trazabilidad pasa. | Revisión manual del autor, registrada en el historial de esta spec |
| PLAN-AC03 | Los mensajes de los commits de `main` cumplen PLAN-R07. | Revisión manual del autor al cerrar cada hito |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Primero lo que no se ve** (M0 a M2). | El andamiaje, los contratos y las pruebas de arquitectura son los que hacen cumplir las specs. Montarlos antes de escribir funcionalidad evita rehacerla. |
| **La política de seguridad de contenido entra en M0.** | Si se añadiera al final, rompería cosas ya hechas. Activa desde el primer día, cada funcionalidad nace compatible con ella. |
| **La vista simple antes que la escena** (M4 antes de M5). | Es la capa base de la que depende todo lo demás (D-29) y, al cerrarla, el sitio ya es completo y utilizable. A partir de ahí cada hito añade experiencia sin poner en riesgo el contenido. |
| **El contenido antes que el armazón que lo muestra** (M3 antes de M4 a M6). | Las secciones son componentes de servidor que se prueban solos. Tenerlas terminadas permite construir la vista simple y el panel sobre contenido real. |
| **La calidad tiene su propio hito, pero no empieza ahí.** | Cada hito ya exige sus criterios de accesibilidad y de rendimiento. M8 existe para la auditoría completa, las mediciones de conjunto y las revisiones manuales, no para arreglar lo que se dejó pasar. |
| **Una sola publicación, al final** (D-63). | El máster provisional bloquea la publicación hasta que la imagen esté aceptada (AST-R45), y publicar a medias exigiría un modo "sin escena" que no existe en las specs. |
| **Tareas del autor identificadas y con momento.** | Las revisiones manuales son las que más fácilmente se quedan sin hacer. Nombrarlas y asociarlas a un criterio las convierte en parte del plan. |
| **Conventional Commits con identificadores de spec.** | El historial del repositorio público enlaza cada cambio con el requisito que lo motiva, que es la demostración más directa del método de trabajo. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.3 | Por decisión del autor (D-66 y D-67). M2 genera los derivados de las dos variantes (AST-AC21); M5 añade SYS-AC20; M8, AST-AC20 y AC22; A3 revisa la calibración sobre las dos variantes. `check:docker` (TST-AC16) se añade como complemento de M0. |
| 2026-10-13 | 1.2 | Decidido por delegación del autor el 2026-10-13. Nuevos PLAN-R12 (M0 adelanta `locale.ts`, `ids.ts`, `getSiteUrl` y `typed-object.ts`; TSC-AC06 pasa de M1 a M0) y PLAN-R13 (marcadores de `assets:*` y `test:lighthouse` hasta M2 y M8). §2: la fecha de publicación es dura. M3: los PDF publicados solo llevan título y autor en sus propiedades. |
| 2026-10-13 | 1.1 | Aprobada por el autor. PLAN-R02: M0 empieza el 2026-10-13 con las versiones de arranque. Nuevo §4.5 (qué se puede aplazar). A1 hecha; A2 actualizada. |
| 2026-10-12 | 1.0 | Versión inicial. |
