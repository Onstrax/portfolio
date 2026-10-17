# IO — Sección Contacto

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 2.0 |
| Última actualización | 2026-10-16 |
| Depende de | VSN, SYS, STR, VIS, TSC, I18N, QLT, TST |

## 1. Propósito

Especificar la sección que abre el panel I/O: las vías para contactar a Juan Esteban y la descarga de su currículum en ambos idiomas. Es el destino de quien ya decidió escribirle, así que cada vía debe funcionar con un solo clic.

## 2. Alcance

**Incluye:** tipos, hechos y textos de la sección, los archivos del CV, el botón de copiar, su presentación y su línea de arranque.

**No incluye:** un formulario de contacto (VSN §7) ni la disponibilidad laboral, que se muestra en Perfil (ver CPU).

Feature: `src/features/io-contact/`. Exporta `ioContactSection`. Fuentes: CVs actualizados y hecho F-13 del README.

## 3. Definiciones

No aplica.

## 4. Requisitos

### 4.1 Archivos del CV

| ID | Requisito |
| --- | --- |
| IO-R01 | Los CVs publicados son copias de `docs/CVs/CV_Juan_Esteban_Alvarez_Garcia_ES_Actualizado.pdf` y `docs/CVs/CV_Juan_Esteban_Alvarez_Garcia_EN_Actualizado.pdf`, guardadas en `public/cv/` con los nombres `juan-esteban-alvarez-garcia-cv-es.pdf` y `juan-esteban-alvarez-garcia-cv-en.pdf`. Las copias conservan en sus propiedades solo el título y el autor: se eliminan `Creator`, `Producer` y las fechas, tanto del diccionario de información del PDF como de su paquete XMP (IO-R04). |
| IO-R02 | `src/shared/config/site.ts` exporta `CV_FILES: Readonly<Record<Locale, SitePath>>` con las rutas `/cv/juan-esteban-alvarez-garcia-cv-es.pdf` y `/cv/juan-esteban-alvarez-garcia-cv-en.pdf`. Es la única definición de esas rutas; la usan Perfil, Contacto, la vista simple y los contactos directos de la barra fija (SET-R30). |
| IO-R03 | Todo enlace de descarga del CV lleva el atributo `download` y el atributo `type="application/pdf"`. |
| IO-R04 | Cada vez que el autor actualiza un CV, sustituye el archivo de `public/cv/` conservando el nombre. Antes de publicar, comprueba que las propiedades del documento PDF no contienen datos distintos de su nombre y el título. Una prueba lo verifica sobre los archivos de `public/cv/`. |
| IO-R05 | Los CVs publicados DEBEN ser coherentes con el contenido del sitio. Si un dato cambia en un CV, se actualiza la spec de la sección afectada en el mismo cambio. |

### 4.2 Tipos

| ID | Requisito |
| --- | --- |
| IO-R06 | `src/features/io-contact/types.ts` declara los tipos siguientes. |

```ts
export const CONTACT_IDS = ["email", "whatsapp", "linkedin", "github"] as const;
export type ContactId = (typeof CONTACT_IDS)[number];

export interface ContactFact extends LinkFact<ContactId> {
  /** Texto que se muestra como valor: la dirección, el número o el nombre de usuario. */
  readonly display: string;
}

export const REFERENCE_IDS = ["jaramillo", "quiroga", "duitama", "hernandez"] as const;
export type ReferenceId = (typeof REFERENCE_IDS)[number];

/** Una persona que recomienda al autor (D-104, F-34). Su nombre y su correo no se traducen. */
export interface ReferenceFact {
  readonly id: ReferenceId;
  readonly name: string;
  readonly email: `${string}@${string}`;
}

export interface ContactFacts {
  readonly email: string;
  readonly channels: readonly ContactFact[];
  readonly references: readonly ReferenceFact[];
}

export interface ContactText extends SectionTextBase {
  readonly intro: string;
  readonly channelsTitle: string;
  readonly channelLabels: Readonly<Record<ContactId, string>>;
  readonly copyEmailAriaLabel: string;
  readonly cvTitle: string;
  readonly cvLabels: Readonly<Record<Locale, string>>;
  readonly referencesTitle: string;
  readonly referencesIntro: string;
  /** Rol de cada referencia, en una línea. */
  readonly referenceRoles: Readonly<Record<ReferenceId, string>>;
}
```

### 4.3 Hechos

| ID | Requisito |
| --- | --- |
| IO-R07 | `content/facts.ts` contiene exactamente los valores de la tabla siguiente (F-12, F-13). `email` es `"juanalvarezgcl@gmail.com"`. Los canales `email`, `linkedin` y `github` alimentan también los contactos directos de la barra fija (SET-R31), que no repiten ninguna dirección. |

| `id` | `href` | `display` |
| --- | --- | --- |
| `email` | `mailto:juanalvarezgcl@gmail.com` | `juanalvarezgcl@gmail.com` |
| `whatsapp` | `https://wa.me/573005628702` | `+57 300 562 8702` |
| `linkedin` | `https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/` | `juan-esteban-alvarez-garcia` |
| `github` | `https://github.com/Onstrax` | `Onstrax` |

`references` contiene, en este orden, las personas de la tabla siguiente (F-34). Sus nombres se escriben como cada persona los muestra en LinkedIn.

| `id` | `name` | `email` |
| --- | --- | --- |
| `jaramillo` | Santiago Jaramillo | s.jaramillo4@uniandes.edu.co |
| `quiroga` | Milton Quiroga | mquiroga@uniandes.edu.co |
| `duitama` | Jorge Duitama | ja.duitama@uniandes.edu.co |
| `hernandez` | Marcela Hernandez | marc-her@uniandes.edu.co |

### 4.4 Textos

| ID | Requisito |
| --- | --- |
| IO-R08 | `content/es.ts` y `content/en.ts` contienen exactamente los textos de la tabla siguiente. |

| Campo | Español | Inglés |
| --- | --- | --- |
| `meta.title` | Contacto | Contact |
| `meta.hardwareName` | Panel I/O | I/O panel |
| `meta.description` | Contacto de Juan Esteban Álvarez García: correo, WhatsApp, LinkedIn, GitHub, referencias y descarga del currículum en español y en inglés. | Contact details of Juan Esteban Álvarez García: email, WhatsApp, LinkedIn, GitHub, references and résumé download in Spanish and English. |
| `intro` | La forma más rápida de contactarme es por correo o por WhatsApp. | The fastest way to reach me is by email or WhatsApp. |
| `channelsTitle` | Canales | Channels |
| `channelLabels.email` | Correo | Email |
| `channelLabels.whatsapp` | WhatsApp | WhatsApp |
| `channelLabels.linkedin` | LinkedIn | LinkedIn |
| `channelLabels.github` | GitHub | GitHub |
| `copyEmailAriaLabel` | Copiar la dirección de correo | Copy the email address |
| `cvTitle` | Currículum | Résumé |
| `cvLabels.es` | Descargar en español (PDF) | Download in Spanish (PDF) |
| `cvLabels.en` | Descargar en inglés (PDF) | Download in English (PDF) |
| `referencesTitle` | Referencias | References |
| `referencesIntro` | Personas que conocen mi trabajo y a las que puedes escribir para preguntar por mí. | People who know my work and whom you can write to ask about me. |
| `referenceRoles.jaramillo` | Emprendedor e inversionista. Fundador de Falcon; cofundador y ex-CEO de Bunny Studio. | Entrepreneur and investor. Founder of Falcon; co-founder and former CEO of Bunny Studio. |
| `referenceRoles.quiroga` | Criptógrafo, empresario e inventor. Criptografía poscuántica y computación cuántica. | Cryptographer, entrepreneur and inventor. Post-quantum cryptography and quantum computing. |
| `referenceRoles.duitama` | Profesor asociado de Ingeniería de Sistemas y Computación, Universidad de los Andes. Bioinformática y algoritmos. | Associate Professor of Systems and Computing Engineering, Universidad de los Andes. Bioinformatics and algorithms. |
| `referenceRoles.hernandez` | Profesora, investigadora y líder académica de la Universidad de los Andes. | Professor, researcher and academic leader at Universidad de los Andes. |

### 4.5 Presentación

| ID | Requisito |
| --- | --- |
| IO-R09 | El componente raíz, `ContactSection`, renderiza `intro` y tres bloques con encabezado `<h3>`, en este orden: `channelsTitle` (icono `plug`), `referencesTitle` (icono `users`, IO-R17) y `cvTitle` (icono `file-text`). Cumple TSC §4.5.1. |
| IO-R10 | Los canales se muestran como una lista de descripción (`<dl>`), en el orden de `facts.channels`. Cada canal tiene como término su icono y su `channelLabels`, y como descripción un enlace a su `href` cuyo texto es `display`. Los canales `whatsapp`, `linkedin` y `github` son enlaces externos (SYS-R40); `email` es un enlace `mailto:` que no abre pestaña. |
| IO-R11 | Junto al canal `email` hay un botón de copiar (IO-R13) que copia `facts.email`. Su texto visible es `common.copyLabel` y su nombre accesible, `copyEmailAriaLabel`. |
| IO-R12 | El bloque del currículum muestra dos enlaces de descarga, uno por idioma, con los textos de `cvLabels` y el icono `download`. El del idioma de la página va primero y con aspecto de botón primario; el otro, con aspecto de botón secundario. |
| IO-R17 | **Referencias** (D-104). El bloque muestra `referencesIntro` y, por cada elemento de `facts.references` en su orden, su `name` como `<h4>` con el rol "Título de elemento", su `referenceRoles[id]` y un enlace `mailto:` a su `email` cuyo texto es la dirección. No hay teléfonos, fotos ni relación con el autor. Las referencias no aparecen en los datos estructurados, en los metadatos ni en las líneas de arranque: solo en esta sección. |

Iconos propios de esta sección: `plug`, `mail`, `copy`, `check` y los tres iconos de marca `whatsapp`, `linkedin` y `github` (VIS-R39).

### 4.6 Botón de copiar

| ID | Requisito |
| --- | --- |
| IO-R13 | `CopyButton` es un componente de cliente de `src/shared/ui/`. Recibe el texto que copia, su etiqueta visible, su nombre accesible y el texto de confirmación. Es el único código de cliente que usa esta sección y no forma parte del feature (STR-R26). |
| IO-R14 | El botón se renderiza con el atributo `hidden` y lo pierde al hidratarse, de modo que sin JavaScript no se muestre un botón que no funciona. Tampoco se muestra si el navegador no ofrece la API del portapapeles. |
| IO-R15 | Al activarlo: copia el texto al portapapeles; durante 2 segundos su icono pasa de `copy` a `check` y su texto visible a `common.copiedAnnouncement`; y ese mismo texto se anuncia en una región con `role="status"`. Si la copia falla, el botón no cambia y no se muestra ningún error. |

### 4.7 Línea de arranque

| ID | Requisito |
| --- | --- |
| IO-R16 | `bootLines` contiene una línea, construida con el número de canales y sus `id`. |

| `message` | `status` |
| --- | --- |
| `io: 4 ports up (email, whatsapp, linkedin, github)` | `ok` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| IO-AC01 | Los hechos contienen los cuatro canales de §4.3 en ese orden, con sus `href` y `display` exactos. | Prueba unitaria |
| IO-AC02 | `CV_FILES` contiene las dos rutas de IO-R02 y ambos archivos existen en `public/cv/`, empiezan por la firma `%PDF` y pesan menos de 500 kB. | Prueba unitaria |
| IO-AC03 | El componente renderiza, en ambos idiomas, tres `<h3>`, una lista de descripción con cuatro canales y dos enlaces de descarga con los atributos `download` y `type="application/pdf"`; en `/es/` el primero es el del CV en español y en `/en/` el del CV en inglés. | Prueba de componente |
| IO-AC04 | El enlace de correo tiene `href` `mailto:juanalvarezgcl@gmail.com` y no tiene `target`; los otros tres canales tienen `target="_blank"` y `rel="noopener noreferrer"`. | Prueba de componente |
| IO-AC05 | `CopyButton`: sin hidratar tiene el atributo `hidden`; tras montarse, no. Al activarlo llama a la API del portapapeles con el texto recibido, muestra el texto de confirmación durante 2 segundos y lo expone en una región `role="status"`. Si la API rechaza la copia, no cambia y no lanza. | Prueba de componente |
| IO-AC06 | `bootLines` es exactamente la tabla de §4.7. | Prueba unitaria |
| IO-AC07 | En `desktop`, abrir la zona del panel I/O en `/es/` muestra el panel "Contacto" con la dirección de correo, el número de WhatsApp y el enlace "Descargar en español (PDF)"; en `/en/`, "Contact" y "Download in English (PDF)". | Prueba E2E |
| IO-AC08 | En `desktop`, activar el enlace de descarga del CV inicia la descarga de un archivo llamado `juan-esteban-alvarez-garcia-cv-es.pdf` (VSN-AC02). | Prueba E2E |
| IO-AC09 | Activar el botón de copiar deja la dirección de correo en el portapapeles. | Prueba E2E, solo en Chromium |
| IO-AC10 | El autor abre cada canal desde el sitio desplegado, en escritorio y en un teléfono, y confirma que llega a su correo, a su chat de WhatsApp y a sus perfiles; revisa ambos idiomas (I18N-AC18) y las propiedades de los dos PDF (IO-R04). | Revisión manual del autor, registrada en el historial de esta spec |
| IO-AC11 | Los hechos contienen las cuatro referencias de §4.3 en ese orden, con sus nombres y correos exactos, y cada idioma tiene un rol por referencia. El componente renderiza, en ambos idiomas, el bloque de referencias entre los canales y el currículum, con cuatro `<h4>` y cuatro enlaces `mailto:`. El JSON-LD de la persona no menciona a ninguna referencia. | Prueba unitaria y prueba de componente |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Enlaces directos, sin formulario.** | Un formulario exige un servicio externo o un servidor, y añade un paso. Un enlace a correo o WhatsApp abre la aplicación que el visitante ya usa. |
| **Botón de copiar el correo** (IO-R11). | En muchos equipos corporativos el enlace `mailto:` no abre nada útil, porque el correo se usa en el navegador. Copiar la dirección siempre funciona. |
| **Número de WhatsApp visible** (F-13). | El autor lo decidió a sabiendas de que un número publicado puede recibir mensajes no deseados. |
| **Los dos CVs disponibles en ambas versiones del sitio** (IO-R12). | Un reclutador puede leer el sitio en un idioma y necesitar el CV en el otro para su empresa. |
| **Rutas del CV en la configuración del sitio** (IO-R02). | Las necesitan tres features que no pueden importarse entre sí; es un dato del sitio, no de una sección. |
| **Nombres de archivo estables.** | Actualizar un CV no rompe los enlaces ya compartidos. |
| **El botón de copiar se oculta sin JavaScript** (IO-R14). | La vista simple debe funcionar entera sin JavaScript (QLT-R41); un botón inerte la haría parecer rota. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-16 | 2.0 | Versión 3, por decisión del autor (D-104, F-34): nuevo bloque de referencias, con nombre, rol y correo de cuatro personas que dieron su consentimiento. IO-R06 (tipos), §4.3 (hechos), §4.4 (textos), IO-R09 (tres bloques) y nuevo IO-R17. IO-AC03 actualizado; nuevo IO-AC11. |
| 2026-10-14 | 1.2 | Estado: pasa a "Implementada" al cerrar M12, con todos sus criterios automáticos citados por una prueba (TST-R38). Los canales de Contacto alimentan también los contactos de la barra fija (SET-R31). Sin cambio de requisitos. |
| 2026-10-14 | 1.2 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.2 | Versión 2, pendiente de aprobación del autor (D-84). IO-R02 e IO-R07: los contactos directos de la barra fija leen el CV y tres canales de esta sección. Sin cambio de contenido. |
| 2026-10-13 | 1.1 | IO-AC10: el autor abrió cada canal desde el sitio desplegado, en escritorio y en su teléfono, y todos funcionan. Sin cambio de requisitos. |
| 2026-10-13 | 1.1 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). IO-AC10, en la parte que no necesita el sitio desplegado: el autor revisó ambos idiomas (A4) y aceptó las propiedades de los dos PDF, que conservan un objeto interno de ONLYOFFICE, el 2026-10-13. La comprobación de cada canal desde el sitio desplegado, en escritorio y en un teléfono, se hace en M9. Sin cambio de requisitos. |
| 2026-10-13 | 1.1 | Por indicación del autor ("solo nombre y título"). IO-R01 e IO-R04: las copias publicadas de los CVs no llevan `Creator`, `Producer` ni fechas en sus propiedades, y una prueba lo comprueba. |
| 2026-10-12 | 1.0 | Aprobada por el autor. Versión inicial. Incorpora F-13 y la parte de F-12 relativa al contacto. |
