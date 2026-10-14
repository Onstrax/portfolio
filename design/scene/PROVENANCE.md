# Procedencia de los másteres de la escena

Registro exigido por AST-R27 y AST-R28 (`specs/00-foundations/05-scene-asset.md`), con una sección por máster.

## Máster de la variante fotografía (`photo`)

| Campo | Valor |
| --- | --- |
| Fecha | 2026-10-12 |
| Estado | `accepted` |
| Versión del máster | `dc169b385cc7` |
| Archivo | `design/scene/master.png`, 3840×2160 px, PNG sRGB de 8 bits sin canal alfa, 11,1 MB |
| Imagen de origen | `docs/Generations/Tenth generation.jpg`, 1376×768 px |

El estado pasó a `accepted` el 2026-10-13: el autor revisó la imagen al 100 % de tamaño y la dio por buena sin ajustes, y la calibración ya estaba revisada (SCN-AC17). Queda aplazada con su visto bueno (PLAN-R10), para los días siguientes a la publicación, la prueba con una persona ajena de AST-AC06. La medición con herramienta de AST-AC01 la hizo el autor tras la publicación, con resultado conforme.

Calibración: las nueve zonas se trazaron el 2026-10-13 sobre este máster (`src/features/motherboard-scene/hotspots.ts`, versión `dc169b385cc7`).

## Generación

| Campo | Valor |
| --- | --- |
| Herramienta | Gemini |
| Modelo | Nano Banana, según indicó el autor |
| Modo | Conversación nueva, solo texto, sin imágenes adjuntas. Formato 16:9. Una sola generación, sin ediciones posteriores |
| Prompt | El de AST §4.6.1, literal |

Las nueve generaciones anteriores (`docs/Generations/`) se descartaron: las ediciones encadenadas restaban nitidez y una imagen adjunta como referencia hacía que el generador la reprodujera.

## Escalado y normalización

| Paso | Detalle |
| --- | --- |
| Escalado | Upscayl 2.15.0 (AppImage para Linux), salida PNG sin compresión, 22016×12288 px (factor 16). Modelo: High Fidelity |
| Recorte | Centrado a 16:9: se retiran 85 px de cada lado de la imagen escalada (21845×12288 px) |
| Reducción | Remuestreo Lanczos a 3840×2160 px |
| Retoque manual | Ninguno |

## Disposición aproximada de los objetos

Cajas estimadas a ojo en el espacio de escena (1600×900 unidades). Sirven como punto de partida para la calibración (AST §4.8); no la sustituyen.

| Objeto | `x` | `y` |
| --- | --- | --- |
| Placa madre | 545 a 1072 | 158 a 834 |
| `cpu` | 758 a 875 | 293 a 459 |
| `ram` | 929 a 1016 | 211 a 530 |
| `ssd` | 700 a 890 | 498 a 553 |
| `io` | 530 a 594 | 158 a 512 |
| `cmos` | 608 a 656 | 455 a 506 |
| `post-display` | 920 a 969 | 797 a 827 |
| `psu` (caja) | 47 a 386 | 313 a 647 |
| `psu` (haz de cables) | 316 a 492 | 480 a 900 |
| `fan` | 1207 a 1484 | 117 a 393 |
| `settings` | 1201 a 1367 | 502 a 621 |

## Criterios de aceptación de la imagen

| Criterio | Resultado | Fecha |
| --- | --- | --- |
| AST-AC01 (cámara cenital) | Conforme. Medido por el autor con herramienta: los bordes de la placa son paralelos a los de la imagen dentro de 1° | 2026-10-13 |
| AST-AC02 (sin texto) | Conforme. Revisada al 100 % por el autor, que la dio por buena sin ajustes. Hay marcas diminutas en dos puertos USB y en los botones del panel frontal, que no se leen como texto | 2026-10-13 |
| AST-AC03 (nada brilla, sin personas ni objetos ajenos) | Conforme | 2026-10-12 |
| AST-AC04 (nueve objetos, sin duplicados) | Conforme. Hay dos disipadores junto al procesador que no son el SSD | 2026-10-12 |
| AST-AC05 (aspecto de cada objeto) | Conforme | 2026-10-12 |
| AST-AC06 (reconocible por alguien ajeno al hardware) | Aplazada con el visto bueno del autor (PLAN-R10) | 2026-10-13 |
| AST-AC07 (atrezo y enfoque) | Conforme | 2026-10-12 |
| AST-AC08 (brillo de las esquinas) | Conforme: superior derecha 4,5 %; superior izquierda 29,5 %; inferior izquierda 7,6 %; inferior derecha 7,4 % | 2026-10-12 |
| AST-AC09 (formato del máster) | Conforme | 2026-10-12 |
| AST-AC10 a AST-AC12 (calibración) | Zonas trazadas y comprobadas a la vista con la superposición. `validateHotspots` no encuentra incumplimientos (zona segura, tamaños mínimos, separación, esquina reservada) y una prueba E2E comprueba el encuadre de AST-AC12 en los cinco viewports. Revisado y aprobado por el autor con la superposición | 2026-10-13 |

## Máster de la variante boceto (`sketch`)

Añadido el 2026-10-13 por decisión del autor (D-66, AST §4.10).

| Campo | Valor |
| --- | --- |
| Fecha | 2026-10-13 |
| Estado | `accepted` |
| Versión del máster | `b71cba0939ff` |
| Archivo | `design/scene/master-sketch.png`, 3840×2160 px, PNG sRGB de 8 bits sin canal alfa, 12,7 MB |
| Imagen de origen | `docs/Generations/Eleventh generation.jpg`, 1376×768 px |

El estado pasó a `accepted` el 2026-10-13: el autor revisó la imagen al 100 % de tamaño y la dio por buena sin ajustes (AST-AC22), y la calibración sobre esta variante ya estaba revisada (AST-AC20).

Calibración: los polígonos de la fotografía se comprobaron sobre este máster el 2026-10-13 (versión `b71cba0939ff`); no necesitaron ningún ajuste.

### Generación

| Campo | Valor |
| --- | --- |
| Herramienta | Gemini |
| Modelo | Nano Banana, el mismo que la fotografía, según indicó el autor |
| Modo | Conversación nueva, con la imagen de origen de la fotografía (`Tenth generation.jpg`) adjunta. Una sola generación, sin ediciones posteriores |
| Prompt | El de AST §4.6.3, literal |

### Escalado y normalización

| Paso | Detalle |
| --- | --- |
| Escalado | Upscayl, salida PNG sin compresión, 22016×12288 px (factor 16): `docs/Generations/Eleventh-Upscayled.png` |
| Recorte | El mismo de la fotografía: se retiran 85 px de cada lado de la imagen escalada |
| Reducción | Remuestreo Lanczos a 3840×2160 px, con libvips 8.18.7 |
| Retoque manual | Ninguno |

El procedimiento de recorte y reducción se validó aplicándolo a `Tenth-Upscayled.png`: el resultado coincide con `master.png` sin desplazamiento (PSNR de 48 dB).

### Correspondencia con la fotografía (AST-R50)

Medida el 2026-10-13 por correlación de bordes, objeto por objeto, en el espacio de escena. El límite es de 8 unidades.

| Objeto | Desfase respecto a `master.png` (unidades) |
| --- | --- |
| Placa madre, `ram`, `psu` (caja y cables) | 0 |
| `cpu`, `fan`, `settings` | 1 |
| `io` | 2 |
| `cmos` | 3 |
| `ssd`, `post-display` | La medición automática no es fiable por su tamaño; a la vista coinciden en posición, y el disipador del SSD se dibuja algo más corto en vertical. Se revisan en la calibración (AST-AC20) |

### Criterios de aceptación del boceto

| Criterio | Resultado | Fecha |
| --- | --- | --- |
| AST-AC08 (brillo de las esquinas, AST-R51: al menos 70 %) | Conforme: superior derecha 89,3 %; superior izquierda 87,9 %; inferior izquierda 91,7 %; inferior derecha 79,9 % | 2026-10-13 |
| AST-AC09 (formato del máster) | Conforme | 2026-10-13 |
| AST-AC20 (los polígonos siguen las siluetas del boceto) | Comprobado a la vista con la superposición: los nueve polígonos siguen las siluetas. Revisado y aprobado por el autor con la superposición | 2026-10-13 |
| AST-AC22 (nueve objetos reconocibles y ninguna palabra legible) | Conforme. Revisado al 100 % por el autor. Hay fórmulas y gráficas garabateadas en los márgenes y rótulos ilegibles sobre la placa, que AST-R51 admite. Lo único que señaló fue que el display de diagnóstico no se leía sobre los segmentos dibujados; se resolvió en código, sin tocar la imagen (D-76) | 2026-10-13 |
