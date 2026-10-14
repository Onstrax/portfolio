# FAN — Sección Ecosistema personal

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 1.0 |
| Última actualización | 2026-10-12 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre el ventilador: el entorno de trabajo de Juan Esteban, lo que construye y configura por iniciativa propia y lo que hace fuera de la pantalla. Es la sección más personal; su función es mostrar curiosidad técnica y dar pie a una conversación.

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección en ambos idiomas, su presentación y su línea de arranque.

**No incluye:** capturas del escritorio, nombres de videojuegos ni la sincronización del portapapeles con KDE Connect, excluidos por el autor (F-17).

Feature: `src/features/fan-ecosystem/`. Exporta `fanEcosystemSection`. Fuentes: hechos F-16, F-17 y F-18 del README, y los repositorios públicos del autor.

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Desarrollado** | Software cuyo código escribió el autor. |
| **Configurado** | Herramientas de terceros que el autor instaló, integró y ajustó, sin escribir su código. |

## 4. Requisitos

### 4.1 Tipos

| ID | Requisito |
| --- | --- |
| FAN-R01 | `src/features/fan-ecosystem/types.ts` declara los tipos siguientes. |
| FAN-R02 | La distinción entre lo desarrollado y lo configurado (F-17, principio P6) es estructural: son dos bloques distintos con títulos distintos, y ningún elemento configurado aparece en el bloque de lo desarrollado. |

```ts
export const SETUP_IDS = ["system", "shell"] as const;
export type SetupId = (typeof SETUP_IDS)[number];

export const BUILT_IDS = ["bongo-cat", "steam-library-hub"] as const;
export type BuiltId = (typeof BUILT_IDS)[number];

export const CONFIGURED_IDS = ["homelab", "sync"] as const;
export type ConfiguredId = (typeof CONFIGURED_IDS)[number];

export interface EcosystemItemFact<Id extends string> {
  readonly id: Id;
  /** Nombres propios de productos y herramientas: no se traducen. */
  readonly tools: readonly string[];
  readonly repository?: RepositoryVisibility;
  readonly link?: LinkFact;
}

export interface EcosystemFacts {
  readonly setup: readonly EcosystemItemFact<SetupId>[];
  readonly built: readonly EcosystemItemFact<BuiltId>[];
  readonly configured: readonly EcosystemItemFact<ConfiguredId>[];
  readonly leadershipTrainingPeriod: Period;
}

export interface EcosystemItemText {
  readonly name: string;
  readonly description: string;
  readonly linkLabel?: string;
}

export interface EcosystemText extends SectionTextBase {
  readonly intro: string;
  readonly setupTitle: string;
  readonly setup: Readonly<Record<SetupId, EcosystemItemText>>;
  readonly builtTitle: string;
  readonly built: Readonly<Record<BuiltId, EcosystemItemText>>;
  readonly configuredTitle: string;
  readonly configured: Readonly<Record<ConfiguredId, EcosystemItemText>>;
  readonly offlineTitle: string;
  readonly interests: readonly string[];
  readonly leadershipTraining: string;
}
```

### 4.2 Hechos

| ID | Requisito |
| --- | --- |
| FAN-R03 | `content/facts.ts` contiene exactamente los valores de la tabla siguiente (F-16). |

| Grupo | `id` | `tools` | `repository` | `link` |
| --- | --- | --- | --- | --- |
| `setup` | `system` | `CachyOS`, `Hyprland` | `private` | — |
| `setup` | `shell` | `caelestia`, `Quickshell` | — | `id: "caelestia"`, `https://github.com/caelestia-dots/caelestia` |
| `built` | `bongo-cat` | `Obsidian`, `TypeScript` | `public` | `id: "bongo-cat"`, `https://github.com/Onstrax/bongo-cat` |
| `built` | `steam-library-hub` | `Next.js`, `SQLite`, `Docker` | `public` | `id: "github-profile"`, `https://github.com/Onstrax` |
| `configured` | `homelab` | `Docker`, `Kokoro`, `Home Assistant` | — | — |
| `configured` | `sync` | `Syncthing`, `Obsidian` | — | — |

`leadershipTrainingPeriod`: de 2014 a 2019, sin mes.

### 4.3 Textos

| ID | Requisito |
| --- | --- |
| FAN-R04 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de la tabla siguiente. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Ecosistema personal | Personal ecosystem |
| `meta.hardwareName` | Ventilador ARGB | ARGB fan |
| `meta.description` | El ecosistema personal de Juan Esteban Álvarez García: su entorno Linux, proyectos propios, homelab y aficiones fuera de la pantalla. | The personal ecosystem of Juan Esteban Álvarez García: his Linux setup, side projects, homelab and interests away from the screen. |
| `intro` | Me gusta entender mis herramientas y ajustarlas hasta que dejan de estorbar. | I like to understand my tools and tune them until they get out of the way. |
| `setupTitle` | Mi entorno | My setup |
| `setup.system.name` | Linux a diario | Linux as a daily driver |
| `setup.system.description` | Trabajo sobre una distribución basada en Arch con un gestor de ventanas en mosaico; mi configuración (ricing) vive en un repositorio privado. | I work on an Arch-based distribution with a tiling window manager; my configuration (ricing) lives in a private repository. |
| `setup.shell.name` | Interfaz de escritorio | Desktop shell |
| `setup.shell.description` | Mi escritorio parte del proyecto abierto caelestia, que adapto a mi forma de trabajar. | My desktop builds on the open-source caelestia project, which I adapt to the way I work. |
| `setup.shell.linkLabel` | Proyecto caelestia | The caelestia project |
| `builtTitle` | Desarrollado por mí | Built by me |
| `built.bongo-cat.name` | Bongo Cat View | Bongo Cat View |
| `built.bongo-cat.description` | Plugin para Obsidian: un gato que tamborilea mientras se escribe, con estados de reposo y sueño. Funciona sin conexión. | Obsidian plugin: a cat that drums along as you type, with idle and sleep states. Works offline. |
| `built.bongo-cat.linkLabel` | Repositorio | Repository |
| `built.steam-library-hub.name` | Steam Local Library Hub | Steam Local Library Hub |
| `built.steam-library-hub.description` | Aplicación web local para explorar, filtrar y ordenar mi biblioteca de Steam, con datos guardados en la propia máquina. | Local web app to browse, filter and sort my Steam library, with all data stored on the machine itself. |
| `built.steam-library-hub.linkLabel` | Disponible en mi perfil de GitHub | Available on my GitHub profile |
| `configuredTitle` | Configurado e integrado | Configured and integrated |
| `configured.homelab.name` | Homelab en contenedores | Containerized homelab |
| `configured.homelab.description` | Síntesis de voz local y control de las luces de mi habitación, que manejo con atajos de teclado globales. | Local text-to-speech and control of my room lights, which I drive with global keyboard shortcuts. |
| `configured.sync.name` | Sincronización entre dispositivos | Sync across devices |
| `configured.sync.description` | Mi bóveda de notas se sincroniza directamente entre el PC y el móvil, de igual a igual. | My notes vault syncs directly between PC and phone, peer to peer. |
| `offlineTitle` | Fuera de la pantalla | Away from the screen |
| `interests[0]` | Calistenia | Calisthenics |
| `interests[1]` | Parkour | Parkour |
| `interests[2]` | Gaming | Gaming |
| `leadershipTraining` | Formación en liderazgo ignaciano durante el colegio. | Ignatian leadership training during school. |

`built.bongo-cat.name` y `built.steam-library-hub.name` son idénticos en ambos idiomas por ser los nombres con los que están publicados.

### 4.4 Presentación

| ID | Requisito |
| --- | --- |
| FAN-R05 | El componente raíz, `EcosystemSection`, renderiza `intro` y cuatro bloques con encabezado `<h3>`, en este orden: `setupTitle` (icono `monitor`), `builtTitle` (icono `hammer`), `configuredTitle` (icono `sliders`) y `offlineTitle` (icono `sun`). Cumple TSC §4.5.1 y no contiene componentes de cliente. |
| FAN-R06 | Cada elemento de los tres primeros bloques muestra: `name` como `<h4>`; `description`; sus `tools` como chips neutros; `common.privateRepositoryLabel` como chip con el icono `lock` si `repository` es `"private"`; y su enlace, si lo tiene, como enlace externo con el texto `linkLabel`. |
| FAN-R07 | El bloque "Fuera de la pantalla" muestra `interests` como chips neutros y, debajo, `leadershipTraining` seguido de su periodo con `PeriodText`. |

Iconos propios de esta sección: `monitor`, `hammer`, `sliders` y `sun`.

### 4.5 Línea de arranque

| ID | Requisito |
| --- | --- |
| FAN-R08 | `bootLines` contiene una línea, construida con las `tools` del elemento `system`. |

| `message` | `status` |
| --- | --- |
| `fan0: personal ecosystem online (CachyOS, Hyprland)` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| FAN-AC01 | Los hechos contienen los seis elementos de §4.2, en sus grupos y en ese orden, con sus `tools`, `repository` y enlaces exactos. | Prueba unitaria |
| FAN-AC02 | Ningún `id` de `CONFIGURED_IDS` aparece en `built` ni al revés, y los elementos de `configured` no tienen `repository` ni enlace. | Prueba unitaria |
| FAN-AC03 | Cada idioma tiene un texto por cada identificador de los tres grupos y tres `interests`; `meta.title` y `meta.hardwareName` son los de VSN §4. | Prueba unitaria |
| FAN-AC04 | El componente renderiza cuatro `<h3>` con los títulos de §4.3 en ese orden, seis `<h4>` y tres enlaces externos; el elemento `system` muestra "Repositorio privado" o "Private repository". | Prueba de componente |
| FAN-AC05 | El periodo de la formación en liderazgo se renderiza como "2014 – 2019". | Prueba de componente |
| FAN-AC06 | `bootLines` es exactamente la tabla de §4.5. | Prueba unitaria |
| FAN-AC07 | En `desktop`, abrir la zona del ventilador en `/es/` muestra el panel "Ecosistema personal" con "Desarrollado por mí" y "Configurado e integrado"; en `/en/`, "Personal ecosystem" con "Built by me" y "Configured and integrated". | Prueba E2E |
| FAN-AC08 | El contenido no menciona ningún videojuego por su nombre, ni KDE Connect, ni incluye imágenes (F-17). | Revisión manual del autor, registrada en el historial de esta spec |
| FAN-AC09 | El autor revisa ambos idiomas y confirma que cada descripción corresponde a lo que tiene en uso (I18N-AC18). | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **"Desarrollado por mí" y "Configurado e integrado" como bloques separados** (FAN-R02). | Un evaluador técnico distingue al instante entre escribir un plugin y levantar un contenedor ajeno. Presentarlos por separado hace creíbles los dos (F-17). |
| **Se incluyen el homelab y la sincronización; se excluye KDE Connect** (F-16, F-17). | Los dos primeros muestran criterio: contenedores, automatización del hogar y sincronización sin intermediarios. Emparejar una aplicación no aporta nada. |
| **Las herramientas van como chips y la descripción habla del resultado.** | "Kokoro" o "Syncthing" no dicen nada a un reclutador; "síntesis de voz local" y "de igual a igual" sí. Quien conoce las herramientas las ve en los chips. |
| **`steam-library-hub` enlaza al perfil de GitHub** (F-16). | Lo indicó el autor: basta con decir que está disponible en su perfil. |
| **Una sola línea para el liderazgo ignaciano.** | Es formación previa a la universidad; mencionarla aporta contexto personal, extenderla restaría peso a lo reciente. |
| **Sin capturas ni nombres de juegos** (F-17). | Decisión del autor. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 1.0 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). FAN-AC08 y FAN-AC09: el autor revisó el contenido en ambos idiomas, en la vista simple y en el panel (A4), el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-16, F-17 y la parte de F-18 relativa a las aficiones. |
