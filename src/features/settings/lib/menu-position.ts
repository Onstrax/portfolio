/** Rectangle in viewport pixels, as `getBoundingClientRect` gives it. */
export interface PixelRect {
  readonly left: number;
  readonly top: number;
  readonly width: number;
  readonly height: number;
}

export type MenuSide = "top" | "right" | "bottom" | "left";

/** Space between the zone and the menu, and between the menu and the border of the stage. */
export const MENU_GAP_PX = 12;
export const MENU_MARGIN_PX = 8;

export function isMenuSide(value: unknown): value is MenuSide {
  return value === "top" || value === "right" || value === "bottom" || value === "left";
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(value, max));
}

const OPPOSITE: Readonly<Record<MenuSide, MenuSide>> = {
  top: "bottom",
  bottom: "top",
  left: "right",
  right: "left",
};
const ACROSS: Readonly<Record<MenuSide, readonly MenuSide[]>> = {
  top: ["left", "right"],
  bottom: ["left", "right"],
  left: ["top", "bottom"],
  right: ["top", "bottom"],
};

/**
 * Top left corner of the settings menu, in viewport pixels: next to the zone that opens it and
 * inside the stage with its margin (SET-R10). It goes on the side where the label of the zone
 * goes; if it does not fit there, on the opposite side, and then on the other two. Along the
 * chosen side it is centered on the zone and moved as little as needed to stay inside. If no
 * side has room, it stays on the first one and is pushed inside, even over the zone.
 */
export function menuPosition(input: {
  readonly zone: PixelRect;
  readonly stage: PixelRect;
  readonly menu: { readonly width: number; readonly height: number };
  readonly side: MenuSide;
}): { readonly left: number; readonly top: number } {
  const { zone, stage, menu, side } = input;
  const minLeft = stage.left + MENU_MARGIN_PX;
  const maxLeft = stage.left + stage.width - MENU_MARGIN_PX - menu.width;
  const minTop = stage.top + MENU_MARGIN_PX;
  const maxTop = stage.top + stage.height - MENU_MARGIN_PX - menu.height;
  const centeredLeft = zone.left + zone.width / 2 - menu.width / 2;
  const centeredTop = zone.top + zone.height / 2 - menu.height / 2;
  const natural = {
    top: { left: centeredLeft, top: zone.top - MENU_GAP_PX - menu.height },
    bottom: { left: centeredLeft, top: zone.top + zone.height + MENU_GAP_PX },
    left: { left: zone.left - MENU_GAP_PX - menu.width, top: centeredTop },
    right: { left: zone.left + zone.width + MENU_GAP_PX, top: centeredTop },
  };
  const hasRoom = (candidate: MenuSide): boolean => {
    const { left, top } = natural[candidate];
    return candidate === "top" || candidate === "bottom"
      ? top >= minTop && top <= maxTop
      : left >= minLeft && left <= maxLeft;
  };
  const chosen = [side, OPPOSITE[side], ...ACROSS[side]].find(hasRoom) ?? side;

  return {
    left: Math.round(clamp(natural[chosen].left, minLeft, maxLeft)),
    top: Math.round(clamp(natural[chosen].top, minTop, maxTop)),
  };
}
