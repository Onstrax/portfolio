# DEP — Despliegue

| Campo | Valor |
| --- | --- |
| Estado | Aprobada |
| Versión | 1.7 |
| Última actualización | 2026-10-14 |
| Depende de | VSN, SYS, STR, AST, QLT, TST, SMP |

## 1. Propósito

Especificar dónde vive el código, bajo qué licencia, dónde se publica el sitio, cómo llega un cambio a producción, qué cabeceras de seguridad y de caché se sirven y cómo se mide el uso. Todo debe ser gratuito y sin dependencia de un proveedor que no se pueda sustituir en una tarde.

## 2. Alcance

**Incluye:** repositorio, licencias, hosting, flujo de publicación, cabeceras, política de seguridad de contenido, analítica, plan alternativo y mantenimiento.

**No incluye:** el pipeline de integración continua (ver TST §4.8), los umbrales de calidad (ver QLT) ni los metadatos de las páginas (ver SMP).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Producción** | El sitio público, servido desde la URL que asigna Cloudflare Pages. |
| **Publicación** | Una ejecución del flujo `deploy.yml` que sustituye el contenido de producción. |
| **Subida directa** | Modo de Cloudflare Pages en el que se sube una carpeta ya compilada, sin que Cloudflare compile el proyecto. |
| **Script en línea** | Un elemento `<script>` sin atributo `src` cuyo contenido se ejecuta. No incluye los bloques de datos como `application/ld+json`. |

## 4. Requisitos

### 4.1 Repositorio

| ID | Requisito |
| --- | --- |
| DEP-R01 | El código vive en un repositorio público de GitHub, `Onstrax/portfolio`, con `main` como única rama permanente. `SITE.repositoryUrl` (SMP-R01) es `https://github.com/Onstrax/portfolio`. |
| DEP-R02 | El repositorio contiene lo que indica STR §4.1. Antes del primer `push`, el autor comprueba que `docs/` no está versionado y que no hay ningún archivo `.env` distinto de `.env.example`. |
| DEP-R03 | `README.md` está en inglés y contiene, en este orden: una frase que describe el proyecto; el enlace a producción; una imagen de la escena; una sección sobre cómo está construido, que explica el desarrollo guiado por especificaciones y enlaza a `specs/README.md`; el stack; los comandos `pnpm dev`, `pnpm check` y `pnpm build`; el estado del CI; y la licencia, con la distinción de DEP-R05. |
| DEP-R04 | La descripción del repositorio en GitHub es la frase inicial del README, y su campo de sitio web es la URL de producción. |

### 4.2 Licencias

| ID | Requisito |
| --- | --- |
| DEP-R05 | El archivo `LICENSE` contiene el texto de la licencia MIT, sin modificaciones, con el nombre del autor y el año 2026. Cubre el código fuente, la configuración, los scripts, las pruebas y estas especificaciones. |
| DEP-R06 | Quedan fuera de esa licencia, con todos los derechos reservados: los textos del perfil (`src/features/*/content/`), los CVs (`public/cv/`), la fotografía (`design/portrait/`, `public/portrait/`) y la imagen de la escena y sus derivados (`design/scene/`, `public/scene/`, `public/og/`). El README lo indica de forma expresa. |

### 4.3 Hosting

| ID | Requisito |
| --- | --- |
| DEP-R07 | El sitio se publica en **Cloudflare Pages**, plan gratuito, en un proyecto de subida directa llamado `juan-esteban-alvarez`, cuya rama de producción es `main`. |
| DEP-R08 | La URL de producción es la que Cloudflare asigne al crear el proyecto: `https://juan-esteban-alvarez.pages.dev` o, si ese nombre no está libre, la variante que proponga. El autor la anota en la tabla de §4.9 y es el valor de `NEXT_PUBLIC_SITE_URL` en producción. |
| DEP-R09 | No se usan Pages Functions, Workers ni ningún otro servicio de pago o con cuota de ejecución. El sitio son archivos estáticos (VSN-R13). |
| DEP-R10 | El sitio publicado respeta los límites del plan gratuito, comprobados en la documentación de Cloudflare el 2026-10-12: 20 000 archivos por sitio, 25 MiB por archivo, 100 reglas en `_headers` y 2000 caracteres por línea de `_headers`. |
| DEP-R11 | No se usa un dominio propio en la versión 1. Añadirlo más adelante solo exige cambiar `NEXT_PUBLIC_SITE_URL` y volver a publicar. |

### 4.4 Publicación

| ID | Requisito |
| --- | --- |
| DEP-R12 | El flujo `.github/workflows/deploy.yml` se ejecuta cuando el flujo de CI termina bien sobre un commit de `main` (evento `workflow_run`) y también a petición manual (`workflow_dispatch`). Nunca se ejecuta para un commit cuyo trabajo `ci-ok` no haya terminado bien (TST-R44): con `workflow_run`, solo continúa si el CI se lanzó por un `push` a `main` y terminó bien; y en los dos casos, antes de instalar nada, consulta el resultado del trabajo `ci-ok` de ese commit y termina con error si no es correcto, de modo que una ejecución manual tampoco publica un commit sin CI en verde. Una ejecución manual solo se admite sobre `main`. |
| DEP-R13 | El flujo hace, en este orden, sobre el mismo commit que pasó el CI: (1) instala con el lockfile congelado; (2) ejecuta `pnpm assets:check --release`, que falla si el máster de la escena es provisional (AST-R45); (3) ejecuta `pnpm build` con `NEXT_PUBLIC_SITE_URL` igual a la URL de producción; (4) sube `out/` al proyecto con `wrangler pages deploy`, indicando la rama `main`; (5) ejecuta la comprobación de DEP-R16 contra la URL de producción, con una espera de hasta 120 segundos. `wrangler` no es una dependencia del sitio: el flujo lo instala con npm fuera del repositorio, en la versión exacta que fija su variable `WRANGLER_VERSION`, publicada al menos 7 días antes (el mismo criterio que SYS-R37 aplica a las dependencias), y sin ejecutar scripts de instalación. Solo el paso que publica recibe los dos secretos. |
| DEP-R14 | El flujo usa dos secretos del repositorio, `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID`, y ninguno más. El token tiene únicamente el permiso de edición de Cloudflare Pages sobre la cuenta. |
| DEP-R15 | El flujo declara `permissions: contents: read` y `checks: read`; el segundo le permite consultar el resultado de `ci-ok` (DEP-R12). No registra el despliegue en GitHub. Sus acciones se referencian por el SHA completo de su commit y solo pueden ser de las organizaciones `actions`, `pnpm` y `cloudflare`. No se ejecutan dos publicaciones a la vez: una nueva espera a que termine la anterior. |
| DEP-R16 | `scripts/smoke-test.mjs` recibe una URL base y comprueba, con peticiones HTTP: que `/`, `/es/`, `/en/`, `/es/projects/`, `/en/cv/` y `/es/projects/thesis/` responden 200; que `/es/` declara como canónica una URL que empieza por la URL base; que una ruta inexistente responde 404; que `/robots.txt` y `/sitemap.xml` responden 200; y que la respuesta de `/es/` incluye las cabeceras `Content-Security-Policy` y `X-Content-Type-Options`. Termina con error, indicando qué falló, si alguna comprobación no se cumple. Las peticiones no siguen redirecciones. Admite la opción `--wait <segundos>`: repite las comprobaciones cada 5 segundos hasta que todas se cumplen o se agota ese tiempo, porque el alojamiento puede tardar unos segundos en servir una publicación recién subida. |
| DEP-R17 | Si la comprobación falla, el flujo termina con error. La versión anterior se restaura desde el panel de Cloudflare Pages, que conserva los despliegues previos, y el defecto se corrige con un nuevo commit. |

### 4.5 Cabeceras

| ID | Requisito |
| --- | --- |
| DEP-R18 | `scripts/build-headers.mjs` se ejecuta al final de `pnpm build` (SYS §4.9) y escribe `out/_headers`, el archivo de cabeceras que Cloudflare Pages aplica al servir el sitio. |
| DEP-R32 | Antes de calcular los hashes, `build-headers.mjs` reúne en un único script, en su orden original y en el lugar del primero, los scripts en línea con los que Next.js entrega los datos de cada página (los que escriben en `self.__next_f`), y reescribe el documento. Una página con contenido real lleva decenas de ellos, y un hash por cada uno no cabe en los 2000 caracteres de una línea de `_headers` (DEP-R10). Los demás scripts en línea no se tocan. La operación es idempotente. |
| DEP-R19 | El archivo contiene una regla para `/*` con las cabeceras de la primera tabla, las reglas de caché de la segunda tabla y una regla por cada documento HTML de `out/` con su política de seguridad de contenido (DEP-R21). |
| DEP-R20 | `scripts/serve-static.mjs` aplica las reglas de `out/_headers` a sus respuestas (SYS §4.9), de modo que las pruebas E2E se ejecuten bajo las mismas cabeceras que producción y una infracción de la política haga fallar una prueba (TST-R23). Única diferencia: al servir por HTTP sin cifrar, retira de la política la directiva `upgrade-insecure-requests`, porque WebKit la obedece también en `localhost` y pediría todos los recursos por HTTPS a un servidor que no lo ofrece. El archivo `out/_headers`, que es lo que se publica, la conserva. Además comprime con gzip las respuestas de texto (HTML, CSS, JavaScript, JSON, SVG, XML y texto plano) cuando el navegador lo admite, como hace el alojamiento: sin ello, Lighthouse mediría un sitio varias veces más pesado que el publicado. |

| Cabecera | Valor |
| --- | --- |
| `X-Content-Type-Options` | `nosniff` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `X-Frame-Options` | `DENY` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Strict-Transport-Security` | `max-age=31536000` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |

| Rutas | `Cache-Control` | Razón |
| --- | --- | --- |
| `/_next/static/*`, `/scene/*`, `/portrait/*`, `/og/*` | `public, max-age=31536000, immutable` | Sus nombres cambian cuando cambia su contenido |
| `/cv/*` | `public, max-age=3600` | Sus nombres son estables y su contenido puede actualizarse (IO-R04) |
| Documentos HTML y el resto | El valor por defecto de Cloudflare Pages, que revalida en cada visita | Deben reflejar la última publicación |

### 4.6 Política de seguridad de contenido

| ID | Requisito |
| --- | --- |
| DEP-R21 | Cada documento HTML se sirve con una cabecera `Content-Security-Policy` propia, con exactamente las directivas de la tabla siguiente. En `script-src`, `build-headers.mjs` escribe el hash SHA-256 de cada script en línea de ese documento. |
| DEP-R22 | `script-src` NO DEBE contener `'unsafe-inline'`, `'unsafe-eval'` ni comodines. |
| DEP-R23 | Si la línea de la política de algún documento supera los 2000 caracteres, o el archivo supera las 100 reglas, `build-headers.mjs` falla e indica el documento y la medida. El límite solo se resuelve cambiando esta spec. |

| Directiva | Valor |
| --- | --- |
| `default-src` | `'self'` |
| `script-src` | `'self'`, los hashes de los scripts en línea del documento y `https://static.cloudflareinsights.com` |
| `style-src` | `'self'` |
| `style-src-attr` | `'unsafe-inline'` |
| `img-src` | `'self' data:` |
| `font-src` | `'self'` |
| `connect-src` | `'self'` y `https://cloudflareinsights.com` |
| `object-src` | `'none'` |
| `base-uri` | `'self'` |
| `form-action` | `'none'` |
| `frame-ancestors` | `'none'` |
| `upgrade-insecure-requests` | Sin valor |

`style-src-attr 'unsafe-inline'` es necesario porque la escena posiciona las zonas con el atributo `style` (STR-R23). `img-src data:` permite el marcador de posición de la escena (AST-R35). `connect-src https://cloudflareinsights.com` permite que el script de analítica envíe sus datos (DEP-R25).

### 4.7 Analítica

| ID | Requisito |
| --- | --- |
| DEP-R24 | El uso del sitio se mide con **Cloudflare Web Analytics**, activado desde el panel del proyecto de Pages, que inserta su script en las páginas al publicarlas. El repositorio no contiene el script ni ningún identificador de analítica. |
| DEP-R25 | Son las únicas peticiones a terceros que hace el sitio (SYS-R41): el script se carga desde `https://static.cloudflareinsights.com` y envía sus datos a `https://cloudflareinsights.com`, comprobado en la primera publicación. Según Cloudflare, no usa cookies ni almacenamiento local ni identifica a los visitantes por su dirección IP o su navegador; por eso no hay aviso de cookies (VSN §7). |
| DEP-R26 | No se envían eventos personalizados. Lo que interesa medir, qué secciones se abren, se obtiene de las páginas vistas, porque cada sección tiene su URL (SYS §4.3). |
| DEP-R27 | Las compilaciones locales y las de CI no incluyen analítica: la inserta Cloudflare solo en producción. |

### 4.8 Plan alternativo

| ID | Requisito |
| --- | --- |
| DEP-R28 | Si Cloudflare Pages dejara de ser gratuito o de estar disponible, el sitio se traslada a GitHub Pages. El traslado exige: publicar `out/` con el flujo oficial de GitHub Pages; fijar `basePath` en `next.config.ts` si el sitio no se sirve desde la raíz del dominio; y aceptar que GitHub Pages no admite cabeceras propias, por lo que la política de seguridad de contenido pasaría a declararse con una etiqueta `<meta>` generada por el mismo script. Este plan no se implementa mientras no haga falta. |

### 4.9 Mantenimiento

| ID | Requisito |
| --- | --- |
| DEP-R29 | Los datos de la tabla siguiente se anotan en esta spec cuando se crean los recursos. |
| DEP-R30 | Las dependencias se actualizan a mano, no con un bot: el autor revisa las versiones disponibles, actualiza la tabla de SYS §4.1 y el lockfile en el mismo cambio, y `pnpm check` debe pasar. La edad mínima de SYS-R37 se aplica también a las actualizaciones. |
| DEP-R31 | Un cambio de contenido (un CV nuevo, un proyecto, el enlace de un repositorio que pasa a ser público) sigue el mismo camino que un cambio de código: primero la spec de la sección, después los archivos, `pnpm check` y `push`. |

| Dato | Valor |
| --- | --- |
| URL de producción | `https://juan-esteban-alvarez.pages.dev` |
| Fecha de la primera publicación | 2026-10-13, desde el commit `c56272f` |

## 5. Criterios de aceptación

| ID | Criterio | Verificación |
| --- | --- | --- |
| DEP-AC01 | Tras `pnpm build`, `out/_headers` existe, tiene 100 reglas o menos, ninguna línea supera 2000 caracteres, y contiene la regla `/*` con las seis cabeceras de §4.5 y las reglas de caché de la segunda tabla. | Prueba de exportación |
| DEP-AC02 | Para cada documento HTML de `out/`, `_headers` tiene una regla para su ruta con una política que contiene las directivas de §4.6, y el conjunto de hashes de `script-src` es exactamente el de los scripts en línea de ese documento. | Prueba de exportación |
| DEP-AC03 | Ninguna política contiene `'unsafe-inline'` ni `'unsafe-eval'` en `script-src`. | Prueba de exportación |
| DEP-AC04 | Con una carpeta de ejemplo, `build-headers.mjs` genera los hashes correctos de dos scripts en línea, ignora un bloque `application/ld+json`, reúne en uno los scripts de datos de Next.js (DEP-R32), y falla cuando la política de un documento superaría los 2000 caracteres. | Prueba de script |
| DEP-AC05 | Las respuestas de `pnpm preview` para `/es/` incluyen las cabeceras de §4.5 y la política del documento, sin la directiva `upgrade-insecure-requests` (DEP-R20), y durante las pruebas E2E no se registra ninguna infracción de la política (QLT-AC21). | Prueba E2E |
| DEP-AC06 | `deploy.yml` se dispara solo con `workflow_run` del flujo de CI sobre `main` con resultado correcto y con `workflow_dispatch`; referencia únicamente los secretos `CLOUDFLARE_API_TOKEN` y `CLOUDFLARE_ACCOUNT_ID` y declara solo los permisos de DEP-R15; toda línea `uses:` apunta a un SHA de 40 caracteres de una organización admitida; y ejecuta `assets:check --release` antes de compilar. | Prueba unitaria que lee el archivo |
| DEP-AC07 | `smoke-test.mjs`, contra un servidor de ejemplo, termina bien cuando se cumplen todas las comprobaciones de DEP-R16 y con error cuando falta la cabecera de la política, cuando una página responde 500 y cuando la ruta inexistente responde 200. | Prueba de script |
| DEP-AC08 | `LICENSE` contiene el texto de la licencia MIT con el nombre del autor. | Prueba unitaria que lee el archivo |
| DEP-AC09 | La URL de producción sirve el sitio; `smoke-test.mjs` pasa contra ella; y el Observatorio HTTP de Mozilla le da una calificación de A o superior. | Revisión manual del autor tras la primera publicación, registrada en el historial de esta spec |
| DEP-AC10 | Un día después de la primera publicación, el panel de Web Analytics muestra visitas, y en las herramientas de desarrollo del navegador no aparece ninguna cookie del sitio. | Revisión manual del autor, registrada en el historial de esta spec |
| DEP-AC11 | El README cumple DEP-R03 y el repositorio no contiene `docs/` ni archivos `.env`. | Revisión manual del autor antes del primer `push`, registrada en el historial de esta spec |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Cloudflare Pages** (D-15). | Su plan gratuito no cobra por tráfico, admite cabeceras propias y da una dirección con el nombre del autor. Como el sitio son archivos estáticos, nada ata al proveedor: el plan alternativo es cuestión de minutos. Nadie puede garantizar que un servicio sea gratuito para siempre; lo que sí se puede garantizar es que cambiar de servicio no cueste nada. |
| **Subida directa desde GitHub Actions, no la integración con Git de Cloudflare** (D-59). | La integración compila en Cloudflare con cada `push`, sin esperar al CI. Subir la carpeta ya compilada desde un flujo que solo corre tras un CI en verde es lo que hace cierta la regla de TST-R44, y evita depender del entorno de compilación del proveedor. |
| **Se vuelve a compilar para publicar.** | El CI compila con la URL local que necesitan las pruebas. Las URLs canónicas y del sitemap deben llevar la de producción, así que se compila de nuevo el mismo commit con esa única diferencia, y la comprobación posterior confirma que quedó bien. |
| **Política de seguridad por hash, generada tras compilar** (D-60). | Next.js inserta varios scripts en línea en cada página. Permitirlos con `'unsafe-inline'` anularía la protección. En el prototipo del 2026-10-12, cada página exportada tenía 5 o 6. Con el contenido real, el 2026-10-13, cada página tenía 52 y su política ocupaba 3072 caracteres, por encima del límite de 2000: por eso se reúnen en uno (DEP-R32), y la línea más larga queda en 426. Para un perfil orientado a seguridad, es coherente que el sitio no use atajos aquí. |
| **Las pruebas se ejecutan con las cabeceras reales** (DEP-R20). | Una política de seguridad que solo se aplica en producción se rompe en producción. Aplicarla en el servidor de pruebas convierte cualquier infracción en una prueba fallida. |
| **Analítica insertada por Cloudflare** (D-61). | Sin código ni identificadores que mantener, y con la certeza de que el desarrollo local y el CI nunca envían datos. Al no usar cookies, no hace falta aviso de consentimiento. |
| **MIT para el código y derechos reservados para el contenido** (D-62). | El código y las specs son la parte que tiene sentido compartir. La fotografía, los CVs y los textos sobre el autor son datos personales, y nadie debería reutilizarlos. |
| **Actualizaciones manuales de dependencias** (DEP-R30). | Con pocas dependencias y versiones exactas, una revisión periódica a mano es menos trabajo que atender las propuestas de un bot, y mantiene la tabla de SYS como fuente de verdad. |
| **Sin dominio propio en la versión 1.** | El requisito del autor es coste cero permanente. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-14 | 1.7 | Aprobada por el autor el 2026-10-14 (versión 2). |
| 2026-10-14 | 1.7 | Versión 2, pendiente de aprobación del autor (D-82). DEP-R16: la comprobación posterior a la publicación pide también una página de caso de estudio. |
| 2026-10-14 | 1.6 | Estado: pasa a "Implementada" al cerrar M9, con todos sus criterios verificados: los automáticos, citados por pruebas (TST-R38), y los manuales, en las filas anteriores. Sin cambio de requisitos. |
| 2026-10-13 | 1.6 | Verificación manual tras la primera publicación. DEP-AC09: la comprobación posterior pasa contra la URL de producción, y el Observatorio HTTP de Mozilla da A+ (125/100, 11 de 12 pruebas); la única que no pasa es la integridad de subrecursos (SRI) del script de analítica, que inserta Cloudflare y se sirve por HTTPS. DEP-AC10: el autor ve visitas en Web Analytics, y en producción no se crea ninguna cookie (comprobado con un navegador). DEP-AC11: el autor revisó el README y pidió que hablara en primera persona, cambio ya hecho; el repositorio, ya público (A2), no contiene `docs/` ni archivos `.env` en ningún commit. Sin cambio de requisitos. |
| 2026-10-13 | 1.6 | Por decisión del autor (D-80). §4.6: se retira la mención de la librería de animación, que ya no existe. |
| 2026-10-13 | 1.5 | §4.9: fecha de la primera publicación (DEP-R29). El flujo de publicación se ejecutó solo tras el CI en verde de ese commit y la comprobación posterior pasó contra la URL de producción. Sin cambio de requisitos. |
| 2026-10-13 | 1.5 | Tras la primera publicación, por delegación del autor (D-79). DEP-R25 era erróneo: el script de analítica no envía sus datos al propio dominio, sino a `https://cloudflareinsights.com`, y la política lo bloqueaba, con un error en la consola en cada página y sin registrar visitas. §4.6: `connect-src` admite ese origen. |
| 2026-10-13 | 1.4 | Durante M9, por delegación del autor (D-78). DEP-R12: el flujo comprueba por sí mismo el resultado de `ci-ok` del commit, también en una ejecución manual. DEP-R13: `wrangler` se instala fuera del proyecto, en versión exacta y sin scripts de instalación. DEP-R15: permiso `checks: read` y sin registro de despliegues. DEP-R16: opción `--wait` y peticiones sin redirecciones. DEP-AC06 precisado. §4.9: URL de producción, comunicada por el autor tras crear el proyecto (A8). |
| 2026-10-13 | 1.3 | Durante M8, por delegación del autor (D-77). DEP-R20: el servidor de `preview` comprime con gzip las respuestas de texto. |
| 2026-10-13 | 1.2 | Durante M4, por delegación del autor: un requisito resultó inviable con el contenido real. Nuevo DEP-R32: los scripts de datos de Next.js se reúnen en uno por documento antes de calcular los hashes, porque 52 hashes no caben en una línea de `_headers`. DEP-AC04 ampliado. |
| 2026-10-13 | 1.1 | Decidido por delegación del autor durante M0, tras fallar WebKit en el primer CI. DEP-R20 y DEP-AC05: el servidor de `preview` retira `upgrade-insecure-requests` de la política, porque sirve por HTTP; `out/_headers` no cambia. |
| 2026-10-13 | 1.0 | Aprobada por el autor. Repositorio `Onstrax/portfolio` creado, por ahora privado. |
| 2026-10-12 | 1.0 | Versión inicial. Límites de Cloudflare Pages y funcionamiento de `_headers`, de la subida directa y de Web Analytics comprobados en la documentación de Cloudflare ese día. |
