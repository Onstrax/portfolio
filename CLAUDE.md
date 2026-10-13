# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Portfolio interactivo de Juan Esteban Álvarez García: una placa madre fotorrealista donde cada componente de hardware abre una sección del perfil. Next.js con exportación estática, en español e inglés.

## La regla principal

Este proyecto se desarrolla con Spec-Driven Development. **Las specs de `specs/` son la fuente de verdad.** Antes de escribir o cambiar código:

1. Lee `specs/README.md` completo: índice, convenciones, registro de decisiones y proceso de cambio.
2. Lee las specs que indica su sección 3 para la tarea, y las del hito en curso en `specs/03-delivery/02-implementation-plan.md`.
3. Si el código y una spec no coinciden, el código está mal o la spec está desactualizada. Corrige antes de seguir.

Ningún cambio de comportamiento, contenido o estructura se implementa sin que una spec lo diga. Si un requisito resulta inviable o erróneo, detén esa tarea y propón el cambio de spec al autor; no improvises una alternativa. Una enmienda marcada como "pendiente de confirmación" no se implementa.

## Dónde está cada cosa

| Qué                                                      | Dónde                                                |
| -------------------------------------------------------- | ---------------------------------------------------- |
| Qué se construye, identificadores y glosario             | `specs/00-foundations/01-vision-and-scope.md`        |
| Stack, versiones, rutas, modos de render                 | `specs/00-foundations/02-system-overview.md`         |
| Árbol de carpetas y reglas de importación                | `specs/00-foundations/03-feature-first-structure.md` |
| Colores, tipografía, aura, movimiento                    | `specs/00-foundations/04-visual-system.md`           |
| Imagen de la escena, derivados, manifiesto y calibración | `specs/00-foundations/05-scene-asset.md`             |
| Tipos compartidos y reglas de TypeScript                 | `specs/01-standards/01-typescript-contracts.md`      |
| Textos, traducción y formato                             | `specs/01-standards/02-i18n-guidelines.md`           |
| Accesibilidad, rendimiento y definición de terminado     | `specs/01-standards/03-quality-bar.md`               |
| Pruebas y CI                                             | `specs/01-standards/04-testing-and-ci.md`            |
| Cada funcionalidad y el contenido de cada sección        | `specs/02-features/`                                 |
| Repositorio, publicación, cabeceras y CSP                | `specs/03-delivery/01-deployment.md`                 |
| Hitos, orden y tareas del autor                          | `specs/03-delivery/02-implementation-plan.md`        |

## Arquitectura en una página

Resumen para orientarse; el detalle normativo está en las specs citadas.

- **Sitio estático.** `output: "export"`, sin servidor ni APIs. Todo el contenido es código tipado y la compilación deja archivos en `out/` (SYS).
- **Dos capas en el mismo HTML.** La capa base es la vista simple, renderizada en el servidor y completa sin JavaScript. La capa de escena es una mejora progresiva que solo existe en el cliente y solo con viewport de al menos 1024×600 px. Un script en línea previo al pintado escribe `data-mode` (`scene` o `simple`) y `data-boot` en `<html>`, y el CSS elige la capa con las variantes de Tailwind `mode-*` y `boot-*`. Si el JavaScript no arranca en 5 s o la escena lanza una excepción, la página cae a `simple` (SYS §4.4 y §4.13, QLT §4.4).
- **La URL es el estado.** `/{locale}/` es la escena sin panel, `/{locale}/{section}/` es el panel de esa sección abierto y `/{locale}/cv/` es siempre la vista simple. Zustand solo guarda preferencias, estado de sesión y si los ajustes están abiertos (SYS §4.3 y §4.6).
- **Features.** Siete de sección, cada uno con su contenido y un único componente de servidor que sirve al panel y a la vista simple (se distinguen por `idScope`); y cinco de armazón: `boot-sequence`, `motherboard-scene`, `detail-panel`, `settings` y `simple-view`. `features/registry.ts` es el único acceso a las secciones. Dirección de los imports: `app → armazón → registry → secciones → shared` (STR).
- **Frontera servidor/cliente.** El registro nunca llega al navegador: los layouts de servidor resuelven los datos y los pasan por propiedades. Un armazón con las dos caras expone `index.ts` (cliente) y `server.ts` (servidor). `src/app/[locale]/(scene)/scene-layer.tsx` es el único lugar donde se componen los armazones, cargados bajo demanda (STR-R32, STR-R33, SYS-R47).
- **Escena.** Imagen pre-renderizada: `design/scene/master.png` genera los derivados de `public/scene/` y `manifest.generated.ts`. Las zonas son enlaces HTML recortados con `clip-path` sobre polígonos en un espacio de 1600×900 unidades (`hotspots.ts`, ligado a la versión del máster); las auras van en un SVG decorativo aparte (AST, SCN). Hay dos variantes de imagen, `photo` y `sketch`, que el visitante intercambia en los ajustes: comparten zonas y calibración, y solo cambian la imagen y tres colores (`--scene-aura`, `--scene-backdrop`, `--scene-display`).

## Reglas que más se incumplen

- **Idioma:** specs en español; código, identificadores, nombres de archivo, comentarios, títulos de pruebas y commits en inglés.
- **Límites entre carpetas:** un feature no importa de otro feature; desde fuera solo se importa su `index.ts` o su `server.ts`; los componentes de cliente no importan el registro ni los features de sección.
- **Contenido:** los datos que no dependen del idioma van una sola vez en `content/facts.ts`; los textos, en `content/es.ts` y `content/en.ts`. Ningún texto visible se escribe a mano en un componente.
- **Tipos:** sin `any`, sin `!` y sin `as` (salvo `as const`).
- **Estilos:** solo tokens de `src/styles/tokens.css`; ningún color literal en componentes.
- **Pruebas:** TDD para la lógica (`lib/`, `shared/`). El título de una prueba que verifica un criterio empieza por su identificador, por ejemplo `"SYS-AC05: ..."`.
- **Dependencias:** no se añade ninguna que no esté en la tabla de SYS §4.1, con versión exacta. pnpm rechaza versiones con menos de 7 días y no se le añaden excepciones (`minimumReleaseAgeExclude`); los scripts de instalación están bloqueados salvo lo listado en `allowBuilds`.
- **Hitos:** solo se implementa el hito en curso, sin adelantar ni dejar código preparado para uno posterior. Dentro del hito: lógica con TDD, después componentes, después E2E (PLAN §4.1).
- **Commits:** Conventional Commits en inglés, con el feature o el área como ámbito, asunto de 72 caracteres como máximo y, en el cuerpo, los identificadores de los requisitos o criterios que implementa (PLAN-R07).
- **Specs:** toda edición sube la versión y añade una fila al historial (README §5.2). Prettier no las formatea: están excluidas a propósito.
- **E2E:** corren contra el sitio exportado, nunca contra `pnpm dev`; localizan por rol y nombre accesible y escriben literalmente los textos que esperan (TST §4.5).
- **`docs/`** es material privado del autor: no se lee desde el código ni se versiona.

## Comandos

| Comando                                                  | Para qué                                                                                                    |
| -------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `pnpm dev`                                               | Servidor de desarrollo                                                                                      |
| `pnpm check`                                             | Todas las comprobaciones, en el orden del CI. Debe pasar antes de cada `push`                               |
| `pnpm test`                                              | Pruebas unitarias, de componente y de arquitectura, con cobertura                                           |
| `pnpm test:e2e`                                          | Pruebas de extremo a extremo contra el sitio exportado                                                      |
| `pnpm assets:build`                                      | Regenera los derivados de imagen y el manifiesto                                                            |
| `pnpm build` y `pnpm preview`                            | Compila a `out/` (con `out/_headers`) y lo sirve en `http://localhost:4173` con las cabeceras de producción |
| `pnpm exec vitest run <ruta>`                            | Un solo archivo de pruebas; con `-t "SYS-AC05"` filtra por identificador de criterio                        |
| `pnpm exec playwright test <archivo> --project=chromium` | Un solo archivo E2E. Necesita un `pnpm build` previo                                                        |

- `NEXT_PUBLIC_SITE_URL` es obligatoria para compilar, y por tanto para `pnpm check`. En local y en CI vale `http://localhost:4173` (ver `.env.example`).
- La superposición de calibración de zonas se abre en `pnpm dev` añadiendo `?debug=hotspots` a la URL.
- Los scripts los fija SYS §4.9. `pnpm exec vitest run` no mide cobertura; los mínimos solo se aplican con `pnpm test`.
- En este equipo (CachyOS) el WebKit de Playwright no arranca: la puerta local completa es `pnpm check:docker`, que ejecuta `pnpm check` en la imagen de Playwright, igual que CI (TST §4.10). Para iterar rápido sin WebKit: `pnpm test:e2e --project=chromium --project=firefox --project=export`.
- Las pruebas de lint (`tests/lint/`) analizan fragmentos bajo la ruta de un archivo real; las de arquitectura y trazabilidad leen el repositorio, así que un texto de ejemplo con una infracción literal las hace fallar: se ensambla en tiempo de ejecución.

## Al terminar un trabajo

- `pnpm check` pasa.
- Las specs afectadas reflejan lo implementado, con su historial actualizado.
- Si se cerró un hito, está anotado en el registro de avance del plan.
- Se permite `push` directo a `main`; solo se publica un commit con el CI en verde.
