// WCAG 2.2 contrast between two sRGB colors, used to verify the pairs of VIS §4.1.4.

function channel(value: number): number {
  const normalized = value / 255;
  return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
}

/** Reads `#RRGGBB` into its three channels. */
export function parseHexColor(hex: string): readonly [number, number, number] {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  if (match === null) throw new Error(`Not a six-digit hex color: "${hex}"`);
  return [
    Number.parseInt(match[1] ?? "", 16),
    Number.parseInt(match[2] ?? "", 16),
    Number.parseInt(match[3] ?? "", 16),
  ];
}

export function relativeLuminance(color: readonly [number, number, number]): number {
  const [red, green, blue] = color;
  return 0.2126 * channel(red) + 0.7152 * channel(green) + 0.0722 * channel(blue);
}

/** `foreground` painted with `opacity` over `background`. */
export function blend(
  foreground: readonly [number, number, number],
  background: readonly [number, number, number],
  opacity: number,
): readonly [number, number, number] {
  const mix = (index: 0 | 1 | 2): number =>
    foreground[index] * opacity + background[index] * (1 - opacity);
  return [mix(0), mix(1), mix(2)];
}

export function contrastRatio(
  first: readonly [number, number, number],
  second: readonly [number, number, number],
): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}
