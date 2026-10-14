# SET — Ajustes, barra fija y sonido

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, VIS, AST, TSC, I18N, QLT, TST, SCN, BOOT |

## 1. Propósito

Especificar los controles globales de la escena: la barra fija con el idioma, el acceso a la vista simple y los contactos directos, el menú de ajustes que abre el panel frontal (sonido, imagen de la escena, idioma, progreso y reinicio de sesión) y los efectos de sonido.

## 2. Alcance

**Incluye:** la barra fija y sus contactos directos, el selector de idioma, el menú de ajustes, el reinicio de sesión y el catálogo y la síntesis de los efectos de sonido.

**No incluye:** la zona del panel frontal en la escena, que es de SCN (SCN-R11); las reglas del cambio de idioma, que son de I18N §4.5; ni cuándo reproduce cada feature su sonido, que lo dice su spec.

Feature: `src/features/settings/`. `index.ts` exporta los componentes de cliente `FixedBar` y `SettingsMenu`. El selector de idioma y el motor de sonido viven en `shared/` porque los usan otros features (§4.2 y §4.5).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Barra fija** | La placa de controles siempre visible sobre la escena. |
| **Menú de ajustes** | El diálogo pequeño que se abre desde la zona `settings` de la escena. |
| **Efecto** | Un sonido breve sintetizado, identificado por un nombre de `SoundName`. |

## 4. Requisitos

### 4.1 Barra fija

| ID | Requisito |
| --- | --- |
| SET-R01 | `FixedBar` se muestra en la esquina superior derecha del escenario, a 16 px de sus bordes superior y derecho, en la capa `z-bar`, sobre la región reservada de AST-R47. Es una placa oscura (VIS §4.5.1) de 44 px de alto. |
| SET-R02 | Es un elemento `<nav>` con el nombre accesible `settings.barAriaLabel`. Contiene, de izquierda a derecha: el selector de idioma (§4.2); un enlace a la vista simple (`cvPath`, TSC §4.10) con el texto `settings.simpleViewLabel`; un separador vertical decorativo de 1 px en `on-dark-muted` con opacidad 25 %; y los **contactos directos** de SET-R30 (D-84). Mientras hay un panel abierto, la barra se dibuja también dentro de él, sobre el velo y en el mismo lugar, para que el idioma, la vista simple y los contactos sigan al alcance (PNL-R25). |
| SET-R03 | Sus controles, contactos incluidos, preceden en el orden de tabulación a la bienvenida y a las zonas de la escena (QLT-R07). |
| SET-R04 | No se muestra mientras `data-boot` no es `done`: la pantalla de arranque la cubre. |

### 4.2 Selector de idioma

| ID | Requisito |
| --- | --- |
| SET-R05 | `LanguageSwitcher` es un componente de cliente de `src/shared/ui/`, que usan la barra fija, el menú de ajustes y la vista simple. Recibe por propiedad su nombre accesible. Cumple I18N-R24 a I18N-R27. |
| SET-R06 | Es un grupo (`role="group"`) con una opción por cada idioma de `LOCALES`, en ese orden. Cada opción muestra el `shortCode` de su idioma (I18N §4.1). La del idioma activo es un `<span>` con `aria-current="true"` y texto en `aura` sobre superficie oscura o en negrita sobre superficie clara; las demás son enlaces. Entre opciones hay un separador `/` decorativo. |
| SET-R07 | Al activar un enlace de idioma: se llama a `setLocale` con ese idioma, se navega a la ruta equivalente conservando el fragmento, y tras la navegación el foco queda en la opción del idioma ahora activo (I18N-R27). |

### 4.3 Menú de ajustes

| ID | Requisito |
| --- | --- |
| SET-R08 | `SettingsMenu` está abierto mientras `settingsOpen` es `true` en el store de interfaz (TSC §4.9). Lo abre y lo cierra la zona `settings` de la escena. |
| SET-R09 | Es un `<dialog>` nativo abierto con `showModal()`, con `aria-labelledby` apuntando a su título. Su aspecto es una placa oscura de 320 px de ancho, en la capa `z-settings`, con velo transparente. Usa la animación M-08. |
| SET-R10 | Se coloca junto a la zona `settings` y dentro del escenario, con 8 px de margen. Va en el lado de su `labelPlacement` (SCN-R07); si ahí no cabe, en el lado opuesto, y después en los otros dos. A lo largo del lado elegido queda centrado respecto a la zona y se desplaza lo necesario para no salirse. Así el menú no tapa la pieza que lo abre. La posición la calcula `menuPosition`, función pura de `lib/`. |
| SET-R11 | Contiene, en este orden: (1) el título `settings.menuTitle`, como `<h2>`, y un botón de cerrar con el icono `close` y el nombre `settings.closeAriaLabel`; (2) el interruptor de sonido; (3) el selector de imagen de la escena (§4.8); (4) el selector de idioma, precedido de la etiqueta `common.languageLabel`; (5) el progreso, con el texto `common.visitedSectionsLabel({ count, total: 6 })`; (6) el botón de reinicio, con el texto `settings.resetLabel` y, debajo, la descripción `settings.resetDescription`. |
| SET-R12 | Se cierra con el botón de cerrar, con Esc, con un clic fuera de la placa o al activar de nuevo la zona `settings`. Al abrirse, el foco pasa al interruptor de sonido; al cerrarse, vuelve a la zona `settings` (QLT-R08). Como el menú es modal, una segunda activación de la zona es un clic sobre lo que queda detrás de él, que lo cierra igual que cualquier clic fuera de la placa. |
| SET-R13 | El menú se cierra si el modo de render pasa a `simple` o si cambia la URL. Elegir un idioma en el menú lo cierra antes de navegar, y el foco queda después en el selector de la barra fija (I18N-R27). |
| SET-R14 | Con el sonido activado, abrir y cerrar el menú reproducen el efecto `toggle`. |

### 4.4 Sonido e interruptor

| ID | Requisito |
| --- | --- |
| SET-R15 | El interruptor de sonido es un `<button role="switch">` con `aria-checked`, el texto visible `settings.soundLabel` y la descripción `settings.soundDescription`. Refleja y modifica `soundEnabled` del store de preferencias (TSC §4.9). Su valor inicial es apagado (D-12). |
| SET-R16 | Al encenderlo se reproduce el efecto `toggle` como confirmación. Al apagarlo no suena nada. |
| SET-R17 | La preferencia de sonido se conserva entre visitas. El reinicio de sesión no la modifica. |

### 4.5 Motor de sonido

| ID | Requisito |
| --- | --- |
| SET-R18 | El motor de sonido vive en `src/shared/lib/sound.ts` y exporta `playSound(name: SoundName): void` y el tipo `SoundName`, que es la unión de los nombres de la tabla siguiente. Cualquier feature de cliente lo llama directamente. |
| SET-R19 | Los efectos se sintetizan con la Web Audio API a partir de osciladores; no existe ningún archivo de audio (D-50). Cada efecto es un único oscilador con la forma de onda, las frecuencias y la duración de la tabla, y una envolvente de volumen con ataque lineal de 5 ms hasta la ganancia máxima y caída exponencial hasta el silencio al final de la duración. Si hay dos frecuencias, la frecuencia se desliza de la primera a la segunda de forma lineal durante el efecto. |
| SET-R20 | La ganancia máxima de todos los efectos es 0,06: deben percibirse como un matiz, no como una alerta. |
| SET-R21 | `playSound` no hace nada si `soundEnabled` es `false` o si el modo de render es `simple` (SYS-R16). El contexto de audio se crea en la primera llamada que sí deba sonar, nunca antes (QLT-R34). |
| SET-R22 | `playSound` nunca lanza una excepción ni deja una promesa rechazada: si el navegador no ofrece Web Audio o bloquea el contexto por no haber habido aún un gesto del visitante, el efecto se omite en silencio. |
| SET-R23 | No hay sonidos asociados al paso del puntero ni a ninguna acción que no haya iniciado el visitante, con la única excepción del efecto `boot` en una repetición del arranque, que el visitante ha pedido (BOOT-R23). |

| `SoundName` | Cuándo suena | Onda | Frecuencia (Hz) | Duración (ms) |
| --- | --- | --- | --- | --- |
| `boot` | Empieza una repetición del arranque (BOOT) | `sine` | 880 | 120 |
| `open` | Se abre el panel de detalle (PNL) | `triangle` | 660 → 880 | 90 |
| `close` | Se cierra el panel de detalle (PNL) | `triangle` | 660 → 440 | 90 |
| `step` | Se cambia de sección dentro del panel (PNL) | `triangle` | 740 | 50 |
| `toggle` | Se enciende el sonido; se abre o se cierra el menú de ajustes; se cambia la imagen de la escena | `sine` | 520 | 40 |

### 4.6 Reinicio de sesión

| ID | Requisito |
| --- | --- |
| SET-R24 | Al activar el botón de reinicio, y sin pedir confirmación, ocurre en este orden: (1) se cierra el menú de ajustes; (2) si hay una sección abierta, se navega al inicio del idioma actual; (3) se llama a `reset()` en el store de sesión, lo que borra las secciones visitadas y pone `bootSeen` y `welcomeSeen` a `false` (TSC §4.9); (4) la secuencia de arranque se repite (BOOT-R04). El paso (2) es una salvaguarda: el menú y el panel son modales y no pueden estar abiertos a la vez. |
| SET-R25 | El reinicio no cambia el idioma, la preferencia de sonido ni la imagen de la escena. Tras él, el display de diagnóstico muestra `00` y, al terminar el arranque, vuelve a mostrarse la bienvenida de la escena (SCN-R48). |
| SET-R26 | El botón Power del panel frontal, visible en la imagen, no tiene ninguna función (D-11). |

### 4.7 Textos de interfaz

Espacio de nombres `settings` del diccionario de interfaz. Identificador de prueba: `data-testid="settings-menu"` en la placa del menú.

| Clave | Español | Inglés |
| --- | --- | --- |
| `barAriaLabel` | Controles del sitio | Site controls |
| `simpleViewLabel` | Vista simple | Simple view |
| `cvShortLabel` | CV | CV |
| `emailAriaLabel` | Escribir un correo | Send an email |
| `linkedinAriaLabel` | LinkedIn | LinkedIn |
| `githubAriaLabel` | GitHub | GitHub |
| `menuTitle` | Ajustes | Settings |
| `closeAriaLabel` | Cerrar ajustes | Close settings |
| `soundLabel` | Sonido | Sound |
| `soundDescription` | Efectos breves al abrir y cerrar secciones. | Short effects when opening and closing sections. |
| `resetLabel` | Reiniciar sesión | Reset session |
| `resetDescription` | Repite el arranque y borra el progreso. | Replays the boot sequence and clears progress. |
| `sceneImageLabel` | Imagen de la escena | Scene image |
| `scenePhotoLabel` | Fotografía | Photo |
| `sceneSketchLabel` | Boceto | Sketch |

### 4.8 Imagen de la escena

| ID | Requisito |
| --- | --- |
| SET-R27 | El selector de imagen de la escena es un `<fieldset>` cuya `<legend>` es `settings.sceneImageLabel`, con un `<input type="radio">` nativo por cada variante de `SCENE_VARIANTS` (TSC §4.11), en ese orden, y las etiquetas `settings.scenePhotoLabel` y `settings.sceneSketchLabel`. Refleja y modifica `sceneVariant` del store de preferencias (TSC §4.9). En una primera visita está marcada la fotografía. |
| SET-R28 | El cambio se aplica de inmediato y sin cerrar el menú: la escena cambia de imagen como indica SCN-R43. Con el sonido activado se reproduce el efecto `toggle`. |
| SET-R29 | La variante elegida se conserva entre visitas. El reinicio de sesión no la modifica (SET-R25). |

### 4.9 Contactos directos

| ID | Requisito |
| --- | --- |
| SET-R30 | Los contactos directos son una lista (`<ul>`) de cuatro enlaces, en este orden, cada uno de 44×44 px como mínimo y con el estilo "Enlace (superficie oscura)" sin subrayado (VIS-R29): (1) el CV del idioma de la página, con el atributo `download` y `type="application/pdf"` (IO-R03), el icono `download` y el texto visible `settings.cvShortLabel`, y como nombre accesible `common.downloadCvLabel`, que contiene ese texto; (2) el correo, un enlace `mailto:` con el icono `mail` y el nombre accesible `settings.emailAriaLabel`; (3) LinkedIn y (4) GitHub, enlaces externos (SYS-R40) con su icono de marca a 20 px (VIS-R39) y como nombre accesible `settings.linkedinAriaLabel` o `settings.githubAriaLabel` seguido de `common.opensInNewTabHint` entre paréntesis. Los iconos son decorativos (VIS-R40). |
| SET-R31 | `FixedBar` recibe los contactos por propiedades (SYS-R49) como `contacts: readonly QuickContact[]`. `buildQuickContacts(channels: readonly LinkFact[], cv: SitePath): readonly QuickContact[]`, función pura de `src/shared/lib/section-nav.ts`, toma de los canales de Contacto (IO-R07) los de `email`, `linkedin` y `github`, en ese orden, y antepone el CV; lanza un error si falta alguno, de modo que la compilación falle antes que publicar una barra incompleta. El layout del grupo `(scene)` la llama con los canales de `SECTIONS.contact` y `CV_FILES[locale]`. Las direcciones se escriben una sola vez, en los hechos de Contacto (SYS-R30). |

```ts
// src/shared/contracts/navigation.ts (añade)
export const QUICK_CONTACT_IDS = ["cv", "email", "linkedin", "github"] as const;
export type QuickContactId = (typeof QUICK_CONTACT_IDS)[number];

/** Un contacto directo de la barra fija (SET-R30), con su dirección ya resuelta. */
export interface QuickContact {
  readonly id: QuickContactId;
  readonly href: Href;
}
```

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| SET-AC01 | En `desktop`, la barra fija es visible en la esquina superior derecha del escenario, es un `<nav>` con el nombre "Controles del sitio" en `/es/`, y contiene las opciones "ES" y "EN", el enlace "Vista simple", que lleva a `/es/cv/`, y los cuatro contactos directos, en ese orden. | Prueba E2E |
| SET-AC02 | En cada viewport de modo `scene` de QLT §4.6, la caja de la barra fija no se solapa con la caja de ninguna zona interactiva de la escena. | Prueba E2E |
| SET-AC03 | El selector de idioma cumple I18N-AC11, I18N-AC12 e I18N-AC14 desde la barra fija y desde el menú de ajustes. | Prueba E2E |
| SET-AC04 | Activar la zona "Panel frontal: Ajustes" abre un diálogo modal con el nombre "Ajustes" y el foco en el interruptor "Sonido". Esc, el botón de cerrar, un clic fuera y una segunda activación de la zona lo cierran, y el foco vuelve a la zona. | Prueba E2E |
| SET-AC05 | El menú queda dentro del escenario en `desktop-min` y en `desktop-hd`. | Prueba E2E |
| SET-AC06 | El interruptor de sonido tiene `role="switch"` y `aria-checked="false"` en una primera visita. Al activarlo pasa a `"true"`, `localStorage` contiene `soundEnabled: true`, y tras recargar la página sigue en `"true"`. | Prueba E2E |
| SET-AC07 | Con el sonido apagado, `playSound` no crea ningún `AudioContext`. Con el sonido encendido, cada `SoundName` crea un oscilador con la onda, las frecuencias y la duración de la tabla de §4.5, y la ganancia nunca supera 0,06. | Prueba unitaria con una Web Audio API simulada |
| SET-AC08 | `playSound` no lanza ni deja promesas rechazadas cuando `AudioContext` no existe, cuando su constructor lanza y cuando `resume()` se rechaza. | Prueba unitaria |
| SET-AC09 | Tras visitar dos secciones, el menú muestra "2 de 6 secciones visitadas" en `/es/`. Activar "Reiniciar sesión": cierra el menú, deja la URL en `/es/`, muestra el arranque y, al terminar, el display marca `00` y la bienvenida es visible. | Prueba E2E |
| SET-AC10 | El reinicio de sesión conserva el idioma de la página y los valores de `soundEnabled` y `sceneVariant`. | Prueba E2E |
| SET-AC11 | En `mobile` no se renderizan ni la barra fija ni el menú de ajustes. | Prueba E2E |
| SET-AC13 | El menú de ajustes muestra el grupo "Imagen de la escena" con las opciones "Fotografía" y "Boceto" en `/es/`, y "Scene image", "Photo" y "Sketch" en `/en/`; en una primera visita está marcada la primera. Al elegir "Boceto", el menú sigue abierto, `localStorage` contiene `sceneVariant: "sketch"` y, tras recargar la página, sigue marcada. | Prueba E2E |
| SET-AC14 | En `desktop`, la barra fija de `/es/` contiene, en este orden, los enlaces "Descargar CV (PDF)", que apunta a `/cv/juan-esteban-alvarez-garcia-cv-es.pdf` con `download`; "Escribir un correo", con `mailto:juanalvarezgcl@gmail.com`; y "LinkedIn" y "GitHub", con las URLs de IO-R07, `target="_blank"` y `rel="noopener noreferrer"`. Cada uno mide al menos 44×44 px, y con un panel abierto siguen al alcance en la barra que se dibuja dentro de él. `buildQuickContacts` devuelve esos cuatro en orden y lanza un error si falta un canal. | Prueba E2E y prueba unitaria |
| SET-AC12 | El autor escucha los cinco efectos con el sonido activado y confirma que son discretos y coherentes entre sí. | Revisión manual del autor, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Idioma y vista simple en una barra siempre visible** (D-11). | Son las dos salidas que un visitante puede necesitar de inmediato: leer en su idioma y saltarse la experiencia. No pueden depender de descubrir una pieza de la imagen. |
| **El resto de ajustes, tras el panel frontal.** | Sonido y reinicio son secundarios. Colocarlos en una pieza de hardware mantiene limpia la escena y encaja con el tema: el panel frontal es donde un PC tiene sus botones. |
| **Menú como `<dialog>` modal pequeño** (SET-R09). | Mismo patrón que el panel de detalle: foco retenido, Esc y fondo inerte sin código propio. |
| **Sonidos sintetizados, sin archivos** (D-50). | Cinco pitidos cortos se describen con una tabla y pesan cero bytes; no hay licencias que gestionar ni descargas. Además, un pitido sintético es exactamente lo que emite una placa madre al arrancar. |
| **Sonido apagado por defecto y nunca al pasar el puntero** (D-12, SET-R23). | Un sitio que suena sin permiso se cierra. El sonido es un extra que el visitante elige. |
| **La imagen de la escena se elige con botones de opción nativos** (SET-R27, D-66). | Son dos opciones excluyentes: el elemento nativo ya da el grupo, las flechas del teclado y el anuncio correcto en un lector de pantalla. Va en los ajustes y no en la barra fija porque es una preferencia secundaria, como el sonido. |
| **Reinicio sin confirmación** (SET-R24). | No destruye nada de valor: borra un contador y repite una animación de dos segundos. |
| **Power sin función** (D-11). | Cualquier acción de "apagar" dejaría al visitante ante una pantalla sin contenido. |
| **Selector de idioma en `shared/ui`.** | Lo usan tres features de armazón, que no pueden importarse entre sí (STR-R07). |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 2.0 | Estado: pasa a "Implementada" al cerrar M12, con todos sus criterios automáticos citados por una prueba (TST-R38): los contactos directos de la barra fija, también dentro del panel abierto (SET-AC01, SET-AC14), y la bienvenida tras el reinicio (SET-AC09). Sin cambio de requisitos. |
| 2026-10-14 | 2.0 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 2.0 | Versión 2, pendiente de aprobación del autor (D-83, D-84). SET-R02: la barra fija añade un separador y los contactos directos; nuevo §4.9 (SET-R30 y SET-R31). SET-R03: los contactos van antes de la bienvenida y de las zonas. SET-R24 y SET-R25: el reinicio borra también `welcomeSeen` y la bienvenida reemplaza a la pista. §4.7: cuatro textos nuevos. SET-AC01 y SET-AC09 actualizados; nuevo SET-AC14. |
| 2026-10-13 | 1.2 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). SET-AC12: el autor escuchó los cinco efectos con el sonido activado y los dio por buenos (A5) el 2026-10-13. Sin cambio de requisitos. |
| 2026-10-13 | 1.2 | Durante M7, por delegación del autor (D-73 y D-75). SET-R10: el menú elige un lado con sitio en lugar de tapar la pieza que lo abre. SET-R02: la barra fija se dibuja también dentro del panel abierto. SET-R12 y SET-R13 precisados. SET-R24 y SET-AC09: el reinicio no puede ocurrir con una sección abierta, porque los dos diálogos son modales. §4.7: identificador de prueba. |
| 2026-10-13 | 1.1 | Por decisión del autor (D-66). Nuevo §4.8 (SET-R27 a SET-R29): selector de imagen de la escena en el menú de ajustes. SET-R11: nuevo orden del contenido. SET-R25 y SET-AC10: el reinicio conserva la variante. Tres textos nuevos y nuevo SET-AC13. El efecto `toggle` suena también al cambiar de imagen. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. |
