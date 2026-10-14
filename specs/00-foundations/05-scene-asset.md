# AST — Imagen de la escena

| Campo | Valor |
| --- | --- |
| Estado | Implementada |
| Versión | 3.2 |
| Última actualización | 2026-10-13 |
| Depende de | VSN, SYS, STR, VIS |

## 1. Propósito

Especificar la imagen fotorrealista de fondo: qué debe mostrar, cómo se genera, cómo se acepta, cómo se convierte en archivos para la web y cómo se calibran sobre ella las zonas interactivas.

La escena tiene dos variantes de imagen, fotografía y boceto (§4.10). Salvo donde se diga otra cosa, los requisitos de esta spec describen la fotografía, que es la variante de referencia; §4.10 dice en qué se aparta el boceto. Las imágenes de `docs/VisualIdeas/` son inspiración y NO DEBEN usarse como asset.

## 2. Alcance

**Incluye:** sistema de coordenadas y encuadre, requisitos de composición, inventario de objetos, procedimiento de generación con Gemini y Upscayl, prompt, archivos derivados, manifiesto, procedimiento de calibración y máster provisional.

**No incluye:** el comportamiento de las zonas interactivas ni la forma de sus datos (ver SCN), el aspecto del aura (ver VIS §4.4), los derivados de la fotografía del autor (ver CPU) ni las cabeceras de caché (ver DEP).

## 3. Definiciones

| Término | Definición |
| --- | --- |
| **Máster** | El archivo original de una variante de la escena a máxima resolución: `design/scene/master.png` para la fotografía y `design/scene/master-sketch.png` para el boceto. |
| **Variante** | Cada una de las dos imágenes de la escena: `photo` o `sketch` (§4.10). |
| **Derivado** | Versión del máster redimensionada y comprimida para servirse en la web. |
| **Manifiesto** | Archivo generado que describe los derivados disponibles y la versión del máster de la que proceden. |
| **Versión del máster** | Los 12 primeros caracteres hexadecimales del SHA-256 del archivo máster. |
| **Escenario** (stage) | El rectángulo del viewport en el que se muestra la escena (AST-R03). |
| **Calibración** | Trazado de los polígonos de las zonas interactivas sobre un máster concreto. |
| **Objeto interactivo** | Cualquiera de los nueve objetos de la tabla de §4.4. |

## 4. Requisitos

### 4.1 Entregables

| ID | Requisito |
| --- | --- |
| AST-R01 | Los entregables de esta spec son: (1) los dos másteres; (2) el registro de procedencia `design/scene/PROVENANCE.md`; (3) los derivados en `public/scene/`; (4) el manifiesto `src/shared/assets/manifest.generated.ts`; (5) los scripts `scripts/build-assets.mjs` y `scripts/check-assets.mjs`. |

### 4.2 Espacio de escena y encuadre

| ID | Requisito |
| --- | --- |
| AST-R02 | El **espacio de escena** es un sistema de coordenadas de 1600×900 unidades con el origen en la esquina superior izquierda, `x` hacia la derecha e `y` hacia abajo. Corresponde a la imagen completa: la unidad es 1/1600 del ancho del máster. Todas las posiciones y medidas de zonas, auras y objetos se expresan en estas unidades. |
| AST-R03 | El **escenario** es el mayor rectángulo de relación 16:9 que cabe en el viewport, centrado en ambos ejes. Lo que queda fuera del escenario se rellena con el color de fondo de la variante activa: `void` en la fotografía y `paper` en el boceto (VIS-R44). La imagen se muestra siempre completa: nunca se recorta. |
| AST-R04 | La imagen ocupa exactamente el escenario. La capa de zonas interactivas ocupa el mismo rectángulo, de modo que una coordenada del espacio de escena corresponde siempre al mismo punto de la imagen. |
| AST-R05 | La **zona segura** es el rectángulo del espacio de escena con `x` entre 16 y 1584 e `y` entre 16 y 884. Todo objeto interactivo queda dentro, de modo que ningún aura toque el borde de la imagen. |
| AST-R48 | Sobre la imagen se dibuja en código un **viñeteado**: en cada uno de los cuatro bordes del escenario, una franja de 64 unidades con un degradado lineal que va del color de fondo de la variante (AST-R03), opaco en el borde, a transparente. Así la imagen se funde con las franjas exteriores y no se percibe su límite. |

Con el viewport mínimo de la escena (1024×600 px, SYS-R12) el escenario mide 1024×576 px y una unidad de escena mide 0,64 px. Esa es la escala más pequeña posible y la que se usa para fijar tamaños mínimos: un área pulsable de 44 px equivale ahí a 69 unidades. SCN amplía el área pulsable de cada zona hasta ese mínimo cuando el objeto es más pequeño.

### 4.3 Composición

| ID | Requisito |
| --- | --- |
| AST-R06 | **Cámara:** vista cenital, perpendicular al workbench (90°), sin inclinación ni perspectiva apreciable: los bordes de la placa madre son paralelos a los bordes de la imagen con una desviación máxima de 1°. |
| AST-R07 | **Formato:** horizontal, relación 16:9. |
| AST-R08 | **Superficie:** workbench de madera oscura, mate, que ocupa toda la imagen. |
| AST-R09 | **Contención:** los nueve objetos interactivos DEBEN estar completos dentro de la zona segura. |
| AST-R10 | **Disposición:** la placa madre en el centro; la fuente de poder a su izquierda; el ventilador y el panel frontal a su derecha. La disposición objetivo es la de la tabla siguiente; sus coordenadas son orientativas, no obligatorias. |
| AST-R11 | **Separación:** entre las siluetas de dos objetos interactivos cualesquiera hay al menos 12 unidades, y sus áreas pulsables, una vez ampliadas por SCN, no se solapan. |
| AST-R12 | **Entorno oscuro:** el material que rodea de forma inmediata a cada objeto interactivo (PCB o madera) DEBE ser lo bastante oscuro para que el aura ámbar se distinga en todo su perímetro. Ningún objeto interactivo descansa sobre una superficie clara o metálica brillante. |
| AST-R13 | **Iluminación:** una única fuente de luz cálida (en torno a 3000 K) desde arriba, con el foco de luz centrado en la placa madre y caída suave hacia los bordes. Sombras suaves. Sin zonas quemadas. |
| AST-R14 | **Esquinas:** el brillo medio de la esquina superior derecha de la imagen (un cuadrado de 160×160 unidades), sobre la que se dibuja la barra fija, NO DEBE superar el 12 % (valor medio de 31 sobre 255 en escala de grises). El de las otras tres esquinas NO DEBE superar el 35 %. |
| AST-R15 | **Nada brilla:** la imagen NO DEBE contener auras, resplandores, LEDs encendidos ni pantallas encendidas. Toda la luz interactiva la pone el código. |
| AST-R16 | **Sin texto ni marcas:** la imagen NO DEBE contener texto, letras, números, logotipos, nombres de marca, adhesivos impresos, códigos de barras, códigos QR ni marcas de agua, legibles o ilegibles. |
| AST-R17 | **Sin personas ni objetos ajenos:** sin manos ni personas; sin pantallas, papeles, libretas, multímetros, teléfonos ni portátiles. |
| AST-R18 | **Atrezo:** los objetos no interactivos son propios de un banco de montaje (destornilladores, tornillos, organizadores, estaño, cables, pulsera antiestática). No hay límite de cantidad, pero ninguno toca ni tapa un objeto interactivo y ninguno se parece a un objeto interactivo. |
| AST-R47 | **Reserva para la barra fija:** ningún objeto interactivo ocupa la región del espacio de escena con `x` mayor o igual que 1240 e `y` menor o igual que 100. Es la esquina sobre la que se dibuja la barra fija (ver SET): con el escenario más pequeño admitido, la barra y su margen ocupan 94 unidades de alto. |
| AST-R19 | **Nitidez:** toda la imagen está enfocada; no hay desenfoque de profundidad de campo. |

| Zona | Rango en el máster aceptado (unidades, aproximado) | Contenido |
| --- | --- | --- |
| Izquierda | `x` de 47 a 492 | Fuente de poder y su haz de cables |
| Centro | `x` de 545 a 1072, `y` de 158 a 834 | Placa madre, en orientación vertical |
| Derecha | `x` de 1201 a 1484 | Ventilador, arriba; panel frontal, debajo |

### 4.4 Inventario de objetos

| ID | Requisito |
| --- | --- |
| AST-R20 | La imagen DEBE contener los nueve objetos interactivos de la tabla siguiente, en la cantidad exacta indicada y cumpliendo sus requisitos de aspecto y de tamaño. |
| AST-R21 | Cada objeto interactivo DEBE verse completo, sin que otro objeto, un cable o una sombra dura lo tape. |
| AST-R22 | Cada objeto interactivo DEBE ser reconocible como la pieza que representa para alguien que sepa de hardware, y distinguible de los demás para alguien que no sepa. En particular, la fuente de poder y el ventilador NO DEBEN parecerse: la fuente no muestra ninguna rejilla ni ventilador. |
| AST-R23 | La placa madre ocupa al menos 480 unidades en su lado menor y 630 en su lado mayor. |
| AST-R24 | La imagen NO DEBE contener una segunda instancia de ninguno de los objetos interactivos ni piezas que se confundan con ellos: sin disipador ni ventilador sobre el CPU, sin ventilador en el chipset, sin tarjeta gráfica, sin un segundo SSD. |

| Objeto | Identificador | Cantidad | Aspecto exigido | Tamaño mínimo visible: lado mayor × lado menor (unidades) |
| --- | --- | --- | --- | --- |
| Procesador | `cpu` | 1 | Instalado en su socket, **sin disipador**. Tapa metálica cepillada, lisa, sin grabados. Se ve el marco de retención del socket. | 88 × 88 |
| Memoria RAM | `ram` | 1 grupo | Cuatro módulos instalados en ranuras contiguas, con disipadores negros mate, de modo que formen un único bloque. | 180 × 44 |
| SSD NVMe | `ssd` | 1 | Unidad M.2 tendida en su ranura, con un disipador delgado. | 120 × 44 |
| Fuente de poder | `psu` | 1 | Caja de fuente ATX sobre el workbench, con una cara lisa hacia arriba que tiene un adhesivo rectangular claro **en blanco** (sin texto). No se ve rejilla ni ventilador. De un lado sale un haz grueso de cables mallados. | 180 × 120 |
| Panel I/O | `io` | 1 | Grupo de puertos traseros alineados en un borde de la placa (USB, Ethernet, audio), visto desde arriba. | 160 × 44 |
| Ventilador ARGB | `fan` | 1 | Ventilador de chasis de 120 mm tendido sobre el workbench, con aspas translúcidas esmeriladas y anillo difusor; LEDs apagados. Un cable fino va hacia la placa. | 150 × 150 |
| Pila CMOS | `cmos` | 1 | Pila de botón plateada en su zócalo, sobre la placa. | 36 × 36 |
| Panel frontal | `settings` | 1 | Módulo negro pequeño sobre el workbench, con dos botones redondos y un LED diminuto apagado. Sin texto. | 120 × 60 |
| Display de diagnóstico | `post-display` | 1 | Display de dos dígitos de siete segmentos sobre la placa, **apagado** (segmentos oscuros). | 44 × 30 |

Notas sobre el inventario:

- La zona interactiva `psu` abarca la caja y el tramo de su haz de cables contiguo a ella (D-04). No se exige que el cable llegue de forma visible a la placa.
- La tapa del procesador y el adhesivo de la fuente quedan lisos porque cualquier texto que deban llevar lo superpone el código; SCN decide si se usa.
- Los dígitos del display de diagnóstico los dibuja el código sobre el display apagado.

### 4.5 Herramientas y procedimiento de generación

| ID | Requisito |
| --- | --- |
| AST-R25 | La imagen se genera y se edita con **Gemini**, usando su modelo de generación y edición de imágenes más reciente al que tenga acceso el autor. El escalado se hace con **Upscayl**. El retoque manual, si hace falta, con GIMP o Krita. |
| AST-R26 | El procedimiento de generación es el de los pasos siguientes. |
| AST-R27 | Todo lo que se haga para obtener el máster DEBE quedar anotado en `design/scene/PROVENANCE.md` con los campos de AST-R28, en una sección por máster. |
| AST-R28 | `PROVENANCE.md` contiene: fecha; estado (`provisional` o `accepted`); herramienta y nombre exacto del modelo de generación tal como lo muestra la herramienta; prompt inicial y cada instrucción de edición, en orden y literales; herramienta, modelo y factor de escalado; lista de retoques manuales; versión del máster (§3); fecha de la calibración; y el resultado de cada criterio AST-AC01 a AST-AC12 con la fecha de comprobación. |

Procedimiento:

1. **Generar candidatos.** Con el prompt de §4.6, en formato 16:9 y a la mayor resolución que ofrezca la herramienta, generar al menos cuatro candidatos.
2. **Elegir.** Descartar los candidatos que incumplan AST-R06 (cámara) o AST-R10 (disposición): esos dos fallos no se corrigen bien editando. Entre los restantes, elegir el que cumpla más criterios de §5.
3. **Corregir.** Si al candidato elegido le falta algo, se prefiere volver a generar con el prompt ajustado. Como máximo se aplica **una** instrucción de edición de §4.6.2 sobre una imagen, y solo para un cambio pequeño: cada edición regenera la imagen completa y le resta nitidez.
4. **Límite de intentos.** Si tras diez generaciones algún criterio obligatorio sigue sin cumplirse, se aplica el plan alternativo de AST-R29. El prompt se usa siempre en una conversación nueva y **sin adjuntar imágenes de referencia**: con una imagen adjunta, el generador la reproduce e ignora el texto.
5. **Escalar.** Si el resultado mide menos de 3840 px de ancho, escalarlo con Upscayl por un factor que supere ese ancho, con un modelo orientado a fotografía, en PNG y sin compresión. Comprobar que no inventa textura ni hace aparecer formas parecidas a texto.
6. **Normalizar.** Recortar centrado a 16:9, redimensionar a exactamente 3840×2160 px, exportar como PNG sRGB de 8 bits sin canal alfa y guardar como `design/scene/master.png`.
7. **Revisar al 100 %.** Recorrer la imagen a tamaño real buscando texto residual, artefactos del escalado y objetos duplicados. Corregir con retoque manual lo que quede.
8. **Registrar.** Completar `PROVENANCE.md`.
9. **Derivar y calibrar.** Ejecutar `pnpm assets:build` (§4.7) y hacer la calibración (§4.8).

| ID | Requisito |
| --- | --- |
| AST-R29 | **Plan alternativo por composición.** Si el generador no logra una imagen única que cumpla la disposición, el máster PUEDE componerse a mano: se generan por separado el workbench con la placa madre y cada objeto exterior (fuente, ventilador, panel frontal) con la misma descripción de luz, y se montan en GIMP o Krita respetando la dirección de la luz y añadiendo sombras coherentes. El resultado DEBE cumplir los mismos criterios de aceptación. |
| AST-R30 | **Plan alternativo para el display de diagnóstico.** Si tras los intentos de AST-R26 no se obtiene un display apagado aceptable, la imagen PUEDE omitirlo. En ese caso el criterio AST-AC05 se da por cumplido para ese objeto, `PROVENANCE.md` lo anota y SCN dibuja el display completo en código sobre una zona libre del PCB. |

### 4.6 Prompt

| ID | Requisito |
| --- | --- |
| AST-R31 | El prompt inicial es el de §4.6.1, en inglés; es el que produjo el máster aceptado. Describe cada cosa en positivo (dónde está y cómo es), porque nombrar lo que no se quiere tiende a hacerlo aparecer, y coloca la RAM donde va en una placa real para que el generador no la duplique. Si se modifica, la versión usada se guarda literal en `PROVENANCE.md` y, si la mejora es general, se actualiza esta spec. |

#### 4.6.1 Prompt inicial

```text
Photorealistic overhead product photograph, 16:9 landscape, shot straight down
at 90 degrees (flat lay, no perspective). Crisp, sharp focus across the whole
frame, fine real-world detail and texture on every part, like a professional
macro product photo of a PC build in progress.

SURFACE: a dark walnut workbench filling the frame.

CENTER — the hero of the image: one black ATX motherboard, centered, taking
about 70% of the image height and about half of its width, with a clear margin
of bare wood above and below it. On the board:
- center: a CPU installed in its socket with no cooler, plain brushed-metal lid,
  inside its metal retention frame;
- immediately right of the CPU: four RAM modules with matte black heat
  spreaders, standing vertically side by side as one single block;
- left of the CPU: one silver coin-cell battery in its holder;
- below the CPU: one M.2 SSD lying horizontally under a slim black heatsink;
- lower part of the board: three empty expansion slots running horizontally and
  a small flat chipset heatsink;
- top edge: a row of metal rear ports (USB, Ethernet, audio);
- bottom right corner: a small two-digit seven-segment display, switched off;
- right edge: a 24-pin power connector with a black sleeved cable plugged in.

LEFT of the board, fully inside the frame: one matte black power supply box
lying flat, its top side carrying one blank pale rectangular sticker, with a
thick bundle of black sleeved cables running to the motherboard.

RIGHT of the board, upper area, fully inside the frame: one 120 mm case fan
lying flat, frosted translucent blades, lights off, thin cable to the board.

RIGHT of the board, lower area: one small black rectangular front-panel module
with two round push buttons and one tiny unlit LED, lying on the wood.

AROUND THEM, a busy real workbench: a spool of solder, an open organizer tray
full of screws, a few loose screws and small chips, a precision screwdriver, a
case of screwdriver bits, an anti-static wrist strap. These fill the corners and
edges and never cover the hardware.

LIGHT: one warm desk lamp (3000 K) from above, a soft pool of light on the
motherboard, smooth falloff to very dark edges and corners, soft deep shadows.
All lights and LEDs are off. Every surface is plain, with no writing or markings.
```

#### 4.6.2 Instrucciones de corrección

Se usan en el paso 3 del procedimiento, una por turno, sustituyendo lo que va entre corchetes angulares.

| Problema | Instrucción de edición |
| --- | --- |
| Queda texto, números o logotipos | `Keep the image exactly the same. Remove all text, letters, numbers and logos from every surface and replace them with the plain matching material.` |
| Hay algo que brilla o un LED encendido | `Keep the image exactly the same. Turn off every light and LED and remove every glow or halo. The only light is the warm lamp from above.` |
| Los bordes no son lo bastante oscuros | `Keep the image exactly the same. Darken the edges and corners so the light falls off smoothly to near black, keeping the motherboard well lit.` |
| Un objeto está tapado o tocando otro | `Keep everything else exactly the same. Move the <object> so there is a clear gap of empty wood between it and the <other object>, and nothing covers it.` |
| Un objeto es demasiado pequeño | `Keep everything else exactly the same. Make the <object> larger, about <N> percent of the image width, keeping it fully visible.` |
| Aparece un objeto duplicado o prohibido | `Keep everything else exactly the same. Remove the <object> and fill the area with the matching surface underneath.` |
| Falta un objeto | `Keep everything else exactly the same. Add <object description from the original prompt> at <position>, lit by the same lamp, with a matching soft shadow.` |
| La fuente de poder muestra una rejilla o un ventilador | `Keep everything else exactly the same. Replace the visible side of the power supply with a solid flat matte black panel carrying one blank pale rectangular sticker with nothing printed on it.` |
| La cámara está inclinada | No se corrige por edición: se descarta el candidato. |

#### 4.6.3 Prompt del boceto

Se usa adjuntando la fotografía de origen del máster `photo` (AST-R52).

```text
Redraw the attached photograph as a technical illustration. Keep the exact same
composition: same top-down camera (90 degrees, flat lay), same framing, and
every object in the same position, size and orientation as in the photo. Change
only the rendering style.

STYLE: an engineer's annotated notebook sketch. Clean navy ink linework with
soft flat color washes, drawn on cream graph paper with a fine light-blue grid
that replaces the wooden table. No photorealism, no 3D render look, no
photographic lighting or vignette; only light ink hatching for shadows. Crisp
edges, everything in focus.

KEEP FROM THE PHOTO, in the same places:
- the motherboard in the center, vertical, drawn in pale cream with thin blue
  circuit traces like a blueprint, with all its small capacitors, chips,
  heatsinks and expansion slots as plain ink line art;
- the CPU in its socket at the center of the board, tinted light steel blue;
- the four RAM modules standing vertically to the right of the CPU, tinted
  green and blue;
- the M.2 SSD lying horizontally below the CPU, tinted mint green;
- the rear I/O ports along the left edge of the board, tinted light grey;
- the round coin-cell battery left of the SSD;
- the small two-digit display at the bottom right of the board;
- the power supply box at the left with its blank label and its thick bundle of
  cables going down, tinted warm orange;
- the case fan at the upper right, tinted pale violet;
- the small front-panel module with two round buttons at the right;
- all the workbench items exactly where they are: the solder spool and the
  screw organizer at the top left, the loose screws and small chips, the
  screwdrivers, the bit cases at the right, and the blue anti-static strap at
  the bottom left. Draw them as lighter, simpler ink sketches so the hardware
  stands out.

In the empty margins, add a few faint pencil doodles (small graph diagrams,
arrows, short formulas made of symbols). No other readable text anywhere.

PALETTE: cream paper, navy ink, and soft washes of orange, green, blue, violet
and grey.
```

### 4.7 Derivados y manifiesto

| ID | Requisito |
| --- | --- |
| AST-R32 | El máster es `design/scene/master.png`: 3840×2160 px exactos, PNG, sRGB, 8 bits por canal, sin canal alfa, de 30 MB como máximo. Se versiona en el repositorio. |
| AST-R33 | `pnpm assets:build` genera a partir de cada máster los nueve derivados de la tabla siguiente en `public/scene/`, dieciocho en total, con el nombre `scene-<ancho>.<versión>.<extensión>`, donde `<versión>` es la versión de ese máster. Antes de generar, borra los derivados de versiones anteriores. |
| AST-R34 | Cada derivado DEBE respetar su peso máximo. Los ajustes de calidad iniciales son AVIF 50, WebP 74 y JPEG 78 (progresivo). Si un derivado supera su máximo, el script baja la calidad de ese formato de uno en uno hasta cumplirlo, sin bajar de AVIF 42, WebP 66 y JPEG 70. Si con la calidad mínima sigue superándolo, el script falla e informa del archivo y de su peso; el máximo solo se cambia modificando esta spec. |
| AST-R46 | Los derivados NO DEBEN contener metadatos EXIF, XMP ni de ubicación (QLT-R47). |
| AST-R35 | El script genera además un marcador de posición: una versión de 32×18 px, desenfocada, en WebP y codificada como URL de datos, de 1,5 kB como máximo; y el color medio de la imagen en hexadecimal. |
| AST-R36 | El script escribe `src/shared/assets/manifest.generated.ts`, que exporta la constante `SCENE_ASSETS`, con una entrada por variante y la forma indicada más abajo, y la constante `SITE_THEME`, con el valor del token `void` leído de `src/styles/tokens.css` para la etiqueta `theme-color` (SMP-R15). El manifiesto y los derivados se versionan en el repositorio. |
| AST-R37 | La escena sirve la imagen con un elemento `<picture>` que ofrece AVIF, WebP y JPEG, en ese orden de preferencia, con los tres anchos en `srcset` y `sizes="min(100vw, 177.78vh)"`. |
| AST-R38 | `pnpm assets:check` falla, indicando la causa, en cualquiera de estos casos: un máster no cumple AST-R32; un máster no cumple el requisito de brillo de su variante (AST-R14 para la fotografía, AST-R51 para el boceto); la versión de un máster no coincide con la de su entrada en el manifiesto; falta algún derivado listado en el manifiesto o sobra alguno en `public/scene/`; algún derivado supera su peso máximo; algún derivado contiene metadatos (AST-R46). |
| AST-R54 | Los dos scripts aceptan la opción `--root <carpeta>`, que indica el repositorio sobre el que trabajan; sin ella usan la carpeta actual. Sirve para probarlos sobre archivos de ejemplo. `assets:build` toma el estado `provisional` o `accepted` de cada máster de su sección de `PROVENANCE.md`. El manifiesto escribe cada constante en formato JSON, de modo que `assets:check` lo lee sin compilar TypeScript. |
| AST-R39 | Los scripts de este apartado generan y comprueban también los derivados de la fotografía del autor, cuyos requisitos define CPU. El manifiesto exporta para ellos una segunda constante, `PORTRAIT_ASSET`. |

| Ancho × alto (px) | AVIF, máximo | WebP, máximo | JPEG, máximo |
| --- | --- | --- | --- |
| 1920 × 1080 | 350 kB | 500 kB | 700 kB |
| 2560 × 1440 | 600 kB | 850 kB | 1200 kB |
| 3840 × 2160 | 1100 kB | 1600 kB | 2200 kB |

Forma de `SCENE_ASSETS`. Las dos entradas tienen la misma estructura; se muestra completa la de `photo`:

```ts
export const SCENE_ASSETS = {
  photo: {
    version: "a1b2c3d4e5f6",            // versión del máster
    provisional: false,                 // ver §4.9
    width: 3840,
    height: 2160,
    sceneSpace: { width: 1600, height: 900 },
    safeArea: { x: 16, y: 16, width: 1568, height: 868 },
    sources: {
      avif: [
        { width: 1920, src: "/scene/scene-1920.a1b2c3d4e5f6.avif" },
        { width: 2560, src: "/scene/scene-2560.a1b2c3d4e5f6.avif" },
        { width: 3840, src: "/scene/scene-3840.a1b2c3d4e5f6.avif" },
      ],
      webp: [/* misma estructura, extensión .webp */],
      jpeg: [/* misma estructura, extensión .jpg */],
    },
    placeholder: {
      color: "#1a140f",
      dataUrl: "data:image/webp;base64,…",
    },
  },
  sketch: {
    /* misma estructura, con los datos del máster del boceto */
  },
} as const satisfies SceneAssets;
```

Los valores de `version`, `src`, `color` y `dataUrl` del ejemplo son ilustrativos; los reales los escribe el script.

### 4.8 Calibración

La calibración es el paso que convierte una imagen aceptada en una escena interactiva: se trazan los polígonos de las zonas sobre **ese** máster.

| ID | Requisito |
| --- | --- |
| AST-R40 | Cada zona interactiva se define como un polígono en el espacio de escena que sigue la silueta visible de su objeto. La forma exacta de esos datos y su archivo los define SCN. |
| AST-R41 | Los datos de calibración DEBEN registrar la versión de cada máster con el que se comprobaron. Una prueba unitaria DEBE fallar si alguna no coincide con la `version` de su entrada en `SCENE_ASSETS`. Cualquier cambio de un máster obliga a revisar la calibración. |
| AST-R42 | El proyecto DEBE ofrecer una **superposición de calibración**, disponible solo en el servidor de desarrollo al añadir `?debug=hotspots` a la URL. Dibuja sobre la escena: cada polígono con su identificador, su caja mínima de área pulsable, el rectángulo de la zona segura y una cuadrícula cada 100 unidades con sus coordenadas. NO DEBE estar disponible en la compilación de producción. |
| AST-R43 | El procedimiento de calibración es el de los pasos siguientes. |

Procedimiento:

1. Con el máster aceptado y los derivados generados, abrir la escena en el servidor de desarrollo con `?debug=hotspots`.
2. Para cada uno de los nueve objetos interactivos, trazar un polígono de entre 4 y 24 vértices sobre su silueta visible, leyendo las coordenadas en la cuadrícula. Para `psu`, el polígono incluye la caja y el arranque de su haz de cables. Como punto de partida, `design/scene/PROVENANCE.md` recoge la caja aproximada de cada objeto en el máster aceptado.
3. Guardar los polígonos y la versión del máster en el archivo de datos que define SCN.
4. Comprobar en la superposición, a 1024×600 px, a 1280×720 px y a 1920×1080 px, los criterios AST-AC10 a AST-AC12.
5. Anotar la fecha de calibración en `PROVENANCE.md`.

### 4.9 Máster provisional

| ID | Requisito |
| --- | --- |
| AST-R44 | Para no bloquear el desarrollo, PUEDE usarse un **máster provisional**: una imagen que cumple AST-R32 pero aún no todos los criterios de composición. Se marca con `provisional` en su sección de `PROVENANCE.md`, y su entrada del manifiesto lleva `provisional: true`. |
| AST-R45 | `pnpm assets:check --release` DEBE fallar si alguna variante tiene `provisional: true` en el manifiesto. El proceso de publicación usa esa variante (ver DEP), de modo que un máster provisional nunca llega a producción. |

### 4.10 Variantes

| ID | Requisito |
| --- | --- |
| AST-R49 | La escena tiene dos variantes: `photo`, cuyo máster es `design/scene/master.png`, y `sketch`, cuyo máster es `design/scene/master-sketch.png`. `photo` es la variante de referencia y la que se muestra por defecto: sobre ella se definen la composición, el inventario y la calibración. |
| AST-R50 | El boceto es un redibujo de la fotografía. Contiene los mismos nueve objetos interactivos, en la misma posición, tamaño y orientación: la silueta de cada objeto en el boceto no se separa más de 8 unidades de la del mismo objeto en la fotografía. Por eso las dos variantes comparten una única calibración (§4.8). |
| AST-R51 | El boceto cumple todos los requisitos de §4.3 y §4.4, con estas diferencias: (1) en lugar de AST-R08, AST-R12 y AST-R13, es un dibujo a tinta sobre papel cuadriculado claro, sin iluminación fotográfica, y el aura que se dibuja sobre él es la de su variante (VIS-R44); (2) en lugar de AST-R14, el brillo medio de cada una de las cuatro esquinas (un cuadrado de 160×160 unidades) DEBE ser de al menos el 70 %; (3) en lugar de AST-R16, se admiten en los márgenes garabatos a lápiz (diagramas, flechas y fórmulas hechas de símbolos) y, sobre la placa, rótulos ilegibles, pero NO DEBE contener palabras legibles, logotipos, nombres de marca ni marcas de agua; (4) el display de diagnóstico PUEDE mostrar dibujado el contorno de sus segmentos. |
| AST-R52 | El boceto se genera con la misma herramienta y el mismo modelo que la fotografía, en una conversación nueva, adjuntando la imagen de origen del máster `photo` y con el prompt de §4.6.3. Es la única excepción a la regla de no adjuntar imágenes (§4.5, paso 4): aquí se busca precisamente que el generador reproduzca la composición. Después se escala, se recorta y se reduce con el mismo procedimiento que la fotografía (§4.5, pasos 5 y 6), para que las dos imágenes coincidan píxel a píxel en su encuadre. |
| AST-R53 | Si se regenera una de las dos variantes, la otra DEBE seguir cumpliendo AST-R50. Si la fotografía cambia de composición, el boceto se regenera a partir de ella. |

## 5. Criterios de aceptación

Los criterios AST-AC01 a AST-AC09 aceptan la **imagen**; AST-AC10 a AST-AC12, la **calibración**; AST-AC13 a AST-AC19 y AST-AC21, los **archivos y scripts**; AST-AC20 y AST-AC22, la **variante boceto**.

| ID | Criterio | Verificación |
| --- | --- | --- |
| AST-AC01 | La cámara es cenital: los cuatro bordes de la placa madre son paralelos a los bordes de la imagen con una desviación de 1° como máximo. | Medición manual con la herramienta de medida de GIMP o Krita |
| AST-AC02 | La imagen no contiene texto, letras, números, logotipos ni marcas en ninguna superficie. | Revisión manual al 100 % de tamaño, recorriendo toda la imagen |
| AST-AC03 | La imagen no contiene nada que brille (auras, LEDs o pantallas encendidas), ni personas, ni objetos de AST-R17. | Revisión manual |
| AST-AC04 | Los nueve objetos interactivos están presentes, en la cantidad exacta, completos y sin nada que los tape; no hay objetos duplicados ni prohibidos (AST-R24). | Revisión manual contra la tabla de §4.4 |
| AST-AC05 | Cada objeto cumple el aspecto exigido en la tabla de §4.4. La fuente de poder no muestra rejilla ni ventilador. | Revisión manual |
| AST-AC06 | Una persona que no conoce hardware, a la que se le muestra la imagen con las etiquetas de la escena, señala correctamente cuál es cada uno de los seis componentes primarios. | Revisión manual: prueba informal del autor con una persona; resultado anotado en `PROVENANCE.md` |
| AST-AC07 | Ningún objeto de atrezo toca, tapa ni se confunde con un objeto interactivo, y la imagen está enfocada en toda su extensión. | Revisión manual |
| AST-AC08 | El brillo medio de cada esquina de cada máster cumple el requisito de su variante (AST-R14 o AST-R51). | Ejecución de `pnpm assets:check` |
| AST-AC09 | El máster cumple AST-R32. | Ejecución de `pnpm assets:check` |
| AST-AC10 | En la superposición de calibración, cada objeto interactivo queda completo dentro de la zona segura, cumple su tamaño mínimo de la tabla de §4.4, la placa madre cumple AST-R23 y ningún polígono invade la región reservada de AST-R47. | Revisión manual con la superposición |
| AST-AC11 | En la superposición, ningún vértice de un polígono se separa de la silueta visible de su objeto más de 8 unidades, y la separación entre polígonos de objetos distintos es de 24 unidades o más. | Revisión manual con la superposición al 200 % de zoom |
| AST-AC12 | A 1024×600, 1280×720, 1920×1080, 2560×1080 y 1024×768 px, la imagen se ve completa, sin recortes, con franjas del color de fondo de la variante donde el viewport no es 16:9, y el aura de cada zona se distingue en todo su perímetro. | Prueba E2E para el encuadre; revisión manual del autor para el aura |
| AST-AC13 | Tras `pnpm assets:build`, `public/scene/` contiene exactamente dieciocho archivos, nueve por variante, con los nombres de AST-R33 y cada uno respeta su peso máximo y ninguno contiene metadatos (AST-R46). | Ejecución de `pnpm assets:check` |
| AST-AC14 | El manifiesto tiene la forma de AST-R36 y la `version` de cada entrada coincide con la de su máster. | Ejecución de `pnpm assets:check` y de `pnpm typecheck` |
| AST-AC15 | Al modificar un solo píxel de cualquiera de los dos másteres sin ejecutar `assets:build`, `pnpm assets:check` falla e indica que la versión no coincide. | Prueba de script con archivos de ejemplo |
| AST-AC16 | Con un manifiesto que tiene `provisional: true` en alguna variante, `pnpm assets:check` termina bien y `pnpm assets:check --release` falla. | Prueba de script |
| AST-AC17 | Si alguna versión registrada en los datos de calibración difiere de la de su variante en `SCENE_ASSETS`, `pnpm test` falla. | Prueba unitaria |
| AST-AC18 | La superposición de calibración aparece con `?debug=hotspots` en el servidor de desarrollo y no existe en el sitio exportado: `out/` no contiene su código. | Prueba E2E sobre el sitio exportado y revisión del paquete generado |
| AST-AC19 | `design/scene/PROVENANCE.md` existe y contiene todos los campos de AST-R28. | Revisión manual del autor |
| AST-AC20 | En la superposición de calibración, con la variante `sketch` activa, ningún vértice de un polígono se separa de la silueta visible de su objeto más de 8 unidades (AST-R50). | Revisión manual con la superposición al 200 % de zoom |
| AST-AC21 | `assets:check` rechaza un máster de `photo` con una esquina más clara que el límite de AST-R14 y un máster de `sketch` con una esquina más oscura que el de AST-R51, y acepta ambos cuando los cumplen. | Prueba de script con archivos de ejemplo |
| AST-AC22 | El boceto cumple AST-R51: contiene los nueve objetos, completos y reconocibles, y ninguna palabra legible, logotipo ni marca. | Revisión manual al 100 % de tamaño, recorriendo toda la imagen |

## 6. Decisiones y justificación

| Decisión | Justificación |
| --- | --- |
| **Vista cenital con la luz cálida de la referencia favorita** (D-01). | Lo atractivo de `Fav-TopView3` es la lámpara y la penumbra, no el ángulo. A 45° la placa ocupa cerca de un tercio del encuadre, los componentes del fondo se acortan y se tapan, y las zonas pulsables quedan pequeñas. En cenital la placa llena una pantalla horizontal, cada pieza se ve completa y los polígonos no sufren perspectiva. |
| **Las auras y cualquier texto se dibujan en código, no en la imagen** (D-02, AST-R15, AST-R16). | El color y la intensidad del aura quedan exactos y animables, los generadores de imagen producen texto defectuoso, y lo que se superpone en código se puede traducir y cambiar sin regenerar la imagen. |
| **Primero la imagen, después los polígonos** (D-03, §4.8). | Ningún generador coloca los objetos en coordenadas exactas. En lugar de exigir posiciones, la spec exige propiedades comprobables (contención, tamaños, separación) y ajusta las zonas al resultado. |
| **Espacio de escena de 1600×900 unidades.** | Desacopla las coordenadas de la resolución del archivo: el máster puede regenerarse a otra resolución sin tocar los datos, y los números son cómodos de leer en la cuadrícula. |
| **Escenario siempre en 16:9, sin recortes** (AST-R03, D-48). | El máster aceptado aprovecha todo el encuadre: la fuente y el ventilador llegan cerca de los bordes laterales y el display de diagnóstico queda muy abajo. Recortar para llenar pantallas 16:10, 4:3 o ultrapanorámicas dejaría piezas fuera. Mostrar la imagen completa, con franjas oscuras fundidas por el viñeteado, garantiza que las nueve piezas se vean en cualquier pantalla. Las versiones 1.x recortaban la imagen y exigían una zona segura central. |
| **Generar de nuevo en lugar de encadenar ediciones** (§4.5, D-49). | En la práctica, cuatro ediciones seguidas dejaron la imagen emborronada y una imagen adjunta como referencia hizo que el generador la copiara. El máster salió de un prompt solo de texto, en una conversación nueva. |
| **Fuente de poder con el adhesivo hacia arriba y sin rejilla** (D-04, AST-R22). | La rejilla es la cara más reconocible de una fuente, pero es justo lo que la confundiría con el ventilador. El haz de cables y el adhesivo la identifican sin esa ambigüedad. |
| **Procesador sin disipador y ventilador aparte** (D-05). | En un PC montado el ventilador tapa el procesador. Separarlos permite que ambos sean visibles e interactivos, y la imagen de "montaje en curso" lo justifica. |
| **Fuente, cable y conector como una sola zona** (D-04). | Dos zonas para el mismo contenido harían esperar contenidos distintos. Una zona que une la caja con la placa comunica además que la fuente alimenta al conjunto. |
| **Derivados en tres anchos y tres formatos, con máximos de peso.** | AVIF da el menor peso; WebP y JPEG cubren navegadores sin AVIF. Tres anchos cubren desde portátiles hasta pantallas 4K sin servir de más. Los máximos hacen que el rendimiento sea un requisito comprobable y no una intención. |
| **Derivados y manifiesto versionados, con `assets:check`** (D-32). | La compilación en el proveedor de hosting no necesita `sharp` y es reproducible; el nombre con la versión permite caché indefinida. `assets:check` impide el único riesgo, que es olvidar regenerar. |
| **Máster provisional con bloqueo de publicación** (§4.9). | Obtener la imagen definitiva puede llevar varias iteraciones. Permite construir y probar la escena mientras tanto, con la garantía mecánica de que no se publica por descuido. |
| **Dos variantes con una sola calibración** (§4.10, D-66). | El boceto se obtuvo pidiendo al generador que redibujara la fotografía sin mover nada. La correlación de bordes medida el 2026-10-13 da desfases de 0 a 3 unidades por objeto, dentro de las 8 que admite la calibración, así que las zonas, las etiquetas y el orden de foco son los mismos y cambiar de variante es cambiar la imagen y tres colores. |
| **Reglas propias para el boceto** (AST-R51). | Las reglas de oscuridad existen para que el aura ámbar se distinga y la barra fija se lea; en el boceto lo primero lo resuelve un aura carmesí y lo segundo, que la barra es una placa oscura. Los garabatos de los márgenes no tocan ningún objeto y son parte del carácter del dibujo; lo que sigue prohibido es el texto legible, que el generador escribe mal y que no se puede traducir. |
| **Registro de procedencia.** | Al ser una imagen generada, deja constancia de cómo se obtuvo, permite reproducirla o mejorarla y documenta que no contiene marcas de terceros. |

## 7. Preguntas abiertas

Ninguna.

## 8. Historial de cambios

| Fecha | Versión | Cambio |
| --- | --- | --- |
| 2026-10-13 | 3.2 | Estado: pasa a "Implementada" al cerrar M8, con todos sus criterios automáticos citados por una prueba (TST-R38). El autor revisó los dos másteres al 100 % el 2026-10-13 y los dio por buenos sin ajustes: AST-AC02 a AC05 y AC07 en la fotografía y AST-AC22 en el boceto. Lo único que señaló, el contraste del display de diagnóstico sobre el boceto, se resolvió en código (D-76). Con AST-AC10, AC11 y AC20 ya confirmados en la calibración y AST-AC19 hecho (A1), las dos secciones de `PROVENANCE.md` pasan a `accepted`. Aplazadas con su visto bueno (PLAN-R10): la medición con herramienta de AST-AC01 y la prueba con una persona ajena de AST-AC06. Sin cambio de requisitos. |
| 2026-10-13 | 3.2 | Durante M4, por delegación del autor. AST-R36: el manifiesto exporta además `SITE_THEME`, y `assets:check` comprueba que coincide con `tokens.css`. |
| 2026-10-13 | 3.1 | Durante M2, por delegación del autor. Nuevo AST-R54: opción `--root`, origen del estado provisional y formato del manifiesto. |
| 2026-10-13 | 3.0 | Por decisión del autor (D-66): la escena tiene dos variantes. Nuevo §4.10 (AST-R49 a AST-R53) y §4.6.3 con el prompt del boceto. El manifiesto pasa de `SCENE_ASSET` a `SCENE_ASSETS`, con una entrada por variante (AST-R36); derivados, comprobaciones, calibración y máster provisional se aplican por variante (AST-R33, R38, R41, R44, R45); el color de las franjas y del viñeteado depende de la variante (AST-R03, R48). Criterios AST-AC08 y AC12 a AC17 adaptados; nuevos AST-AC20 a AC22. |
| 2026-10-13 | 2.0 | Cabecera: se retira la marca de enmienda pendiente; el autor confirmó el 2026-10-13 que todas las enmiendas están aprobadas. Sin cambio de requisitos. |
| 2026-10-12 | 2.0 | Máster aceptado por el autor: "Tenth generation", versión `dc169b385cc7`. Confirmado por el autor el 2026-10-12: AST-R03 a AST-R05, el escenario pasa a ser siempre 16:9 sin recortes y la zona segura abarca casi toda la imagen (D-48); nuevo AST-R48 (viñeteado); AST-R11, R14, R23 y R47 ajustados al máster; la fuente ya no necesita mostrar el cable llegando a la placa; §4.5 y §4.6.1, prompt y procedimiento sustituidos por los que funcionaron (D-49); AST-AC12 reescrito. |
| 2026-10-12 | 1.0 | Versión inicial. Aprobada por el autor. |
| 2026-10-12 | 1.1 | Confirmada por el autor el 2026-10-12. Nuevo AST-R46 y ampliación de AST-R38 y AST-AC13: los derivados no contienen metadatos (QLT-R47). Verificación de AST-AC06, AC08, AC09, AC13 a AC16 reescrita con el vocabulario de README §4.5. |
| 2026-10-12 | 1.2 | AST-R18 y AST-AC07: se retira el límite de cuatro objetos de atrezo, aceptado por el autor al revisar la imagen candidata. Confirmado por el autor el 2026-10-12: nuevo AST-R47 (esquina superior derecha reservada para la barra fija), con su comprobación en AST-AC10 y su mención en el prompt. |
