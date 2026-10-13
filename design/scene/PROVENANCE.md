# Procedencia del máster de la escena

Registro exigido por AST-R27 y AST-R28 (`specs/00-foundations/05-scene-asset.md`).

| Campo | Valor |
| --- | --- |
| Fecha | 2026-10-12 |
| Estado | `provisional` |
| Versión del máster | `dc169b385cc7` |
| Archivo | `design/scene/master.png`, 3840×2160 px, PNG sRGB de 8 bits sin canal alfa, 11,1 MB |
| Imagen de origen | `docs/Generations/Tenth generation.jpg`, 1376×768 px |

El estado es `provisional` porque faltan la calibración de las zonas interactivas y los criterios que dependen de ella (AST-AC10 a AST-AC12). Pasa a `accepted` cuando se completen.

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
| AST-AC01 (cámara cenital) | Conforme a la vista; pendiente la medición con herramienta | 2026-10-12 |
| AST-AC02 (sin texto) | Pendiente de la revisión al 100 %. Se observan marcas diminutas en dos puertos USB y en los botones del panel frontal, que no se leen como texto a tamaño de pantalla | 2026-10-12 |
| AST-AC03 (nada brilla, sin personas ni objetos ajenos) | Conforme | 2026-10-12 |
| AST-AC04 (nueve objetos, sin duplicados) | Conforme. Hay dos disipadores junto al procesador que no son el SSD | 2026-10-12 |
| AST-AC05 (aspecto de cada objeto) | Conforme | 2026-10-12 |
| AST-AC06 (reconocible por alguien ajeno al hardware) | Pendiente | — |
| AST-AC07 (atrezo y enfoque) | Conforme | 2026-10-12 |
| AST-AC08 (brillo de las esquinas) | Conforme: superior derecha 4,5 %; superior izquierda 29,5 %; inferior izquierda 7,6 %; inferior derecha 7,4 % | 2026-10-12 |
| AST-AC09 (formato del máster) | Conforme | 2026-10-12 |
| AST-AC10 a AST-AC12 (calibración) | Pendientes | — |

## Segundo máster: boceto

Añadido el 2026-10-13 por instrucción del autor, que quiere poder ver el portfolio con cualquiera de las dos imágenes. Las specs todavía no lo recogen: la enmienda de AST, SCN y STR se escribe cuando el autor decida cómo se elige la imagen.

| Campo | Valor |
| --- | --- |
| Fecha | 2026-10-13 |
| Estado | `provisional` |
| Versión del máster | `b71cba0939ff` |
| Archivo | `design/scene/master-sketch.png`, 3840×2160 px, PNG sRGB de 8 bits sin canal alfa, 12,7 MB |
| Imagen de origen | `docs/Generations/Eleventh generation.jpg`, 1376×768 px |
| Generación | Pendiente de indicar por el autor: herramienta, modelo y prompt o instrucción de edición |
| Escalado | `docs/Generations/Eleventh-Upscayled.png`, 22016×12288 px (factor 16) |
| Recorte y reducción | Los mismos del máster fotográfico: se retiran 85 px de cada lado y se remuestrea con Lanczos a 3840×2160 px (libvips 8.18.7) |
| Retoque manual | Ninguno |

El procedimiento de recorte y reducción se validó aplicándolo a `Tenth-Upscayled.png`: el resultado coincide con `master.png` sin desplazamiento (PSNR de 48 dB).

### Correspondencia con el máster fotográfico

Medida el 2026-10-13 por correlación de bordes, objeto por objeto, en el espacio de escena. El límite de AST-AC11 es de 8 unidades.

| Objeto | Desfase respecto a `master.png` (unidades) |
| --- | --- |
| Placa madre, `ram`, `psu` (caja y cables) | 0 |
| `cpu`, `fan`, `settings` | 1 |
| `io` | 2 |
| `cmos` | 3 |
| `ssd`, `post-display` | La medición automática no es fiable por su tamaño; a la vista coinciden en posición, y el disipador del SSD se dibuja algo más corto en vertical |

Los nueve objetos están en el mismo sitio, así que una sola calibración sirve para las dos imágenes. Debe revisarse con la superposición sobre ambas (AST §4.8).

### Requisitos de AST que este máster no cumple

| Requisito | Situación |
| --- | --- |
| AST-R08, AST-R12 (superficie y entorno oscuros) | Es un dibujo sobre papel cuadriculado claro: brillo medio del 84 % |
| AST-R14 (brillo de las esquinas) | Superior derecha 89,3 %; superior izquierda 87,9 %; inferior izquierda 91,7 %; inferior derecha 79,9 %. Los límites son 12 % y 35 %, así que `assets:check` lo rechazaría tal como está especificado |
| AST-R16 (sin texto ni marcas) | Tiene fórmulas y gráficas garabateadas en el papel y rótulos ilegibles sobre la placa |
| AST-R15 (display apagado) | El display de diagnóstico tiene dibujados los segmentos de "88" |
| Aura (VIS §4.4, QLT-R14) | El ámbar `#FFC53D` sobre el papel claro tiene un contraste cercano a 1,3:1: el aura apenas se distinguiría |

