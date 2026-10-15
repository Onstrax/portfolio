import { describe, expect, it } from "vitest";

import { isMenuSide, MENU_GAP_PX, MENU_MARGIN_PX, menuPosition } from "./menu-position";

const stage = { left: 0, top: 72, width: 1024, height: 576 };
const menu = { width: 320, height: 300 };

describe("menuPosition", () => {
  it("leaves 12 px to the zone and 8 px to the border of the stage", () => {
    expect([MENU_GAP_PX, MENU_MARGIN_PX]).toEqual([12, 8]);
  });

  it("places the menu on each side of the zone, centered on it", () => {
    const wide = { left: 0, top: 0, width: 2000, height: 2000 };
    const center = { left: 900, top: 900, width: 100, height: 60 };
    const at = (side: "top" | "right" | "bottom" | "left") =>
      menuPosition({ zone: center, stage: wide, menu, side });

    expect(at("bottom")).toEqual({ left: 790, top: 972 });
    expect(at("top")).toEqual({ left: 790, top: 588 });
    expect(at("right")).toEqual({ left: 1012, top: 780 });
    expect(at("left")).toEqual({ left: 568, top: 780 });
  });

  it("goes to the opposite side when the side of the label has no room", () => {
    const low = { left: 400, top: 560, width: 100, height: 60 };
    expect(menuPosition({ zone: low, stage, menu, side: "bottom" })).toEqual({
      left: 290,
      top: 248,
    });
    const high = { left: 400, top: 100, width: 100, height: 60 };
    expect(menuPosition({ zone: high, stage, menu, side: "top" })).toEqual({ left: 290, top: 172 });
  });

  it("SET-AC05: goes beside the zone when there is no room above nor below it", () => {
    // The control panel on the smallest stage: the menu is taller than the space over and under it.
    const frontPanel = { left: 770, top: 333, width: 105, height: 77 };
    const position = menuPosition({ zone: frontPanel, stage, menu, side: "bottom" });

    expect(position).toEqual({ left: 438, top: 222 });
    expect(position.left + menu.width).toBeLessThanOrEqual(frontPanel.left - 12);
  });

  it("goes to the right when the left has no room either", () => {
    const leftEdge = { left: 40, top: 333, width: 105, height: 77 };
    expect(menuPosition({ zone: leftEdge, stage, menu, side: "bottom" })).toEqual({
      left: 157,
      top: 222,
    });
  });

  it("SET-AC05: moves the menu along its side to stay 8 px inside the stage", () => {
    const corner = { left: 980, top: 80, width: 40, height: 40 };
    expect(menuPosition({ zone: corner, stage, menu, side: "bottom" })).toEqual({
      left: 696,
      top: 132,
    });
    const origin = { left: 4, top: 600, width: 40, height: 40 };
    expect(menuPosition({ zone: origin, stage, menu, side: "top" })).toEqual({ left: 8, top: 288 });
  });

  it("stays on the side of the label, pushed inside, when no side has room", () => {
    const small = { left: 0, top: 0, width: 340, height: 320 };
    const middle = { left: 120, top: 130, width: 100, height: 60 };
    expect(menuPosition({ zone: middle, stage: small, menu, side: "bottom" })).toEqual({
      left: 10,
      top: 12,
    });
  });
});

describe("isMenuSide", () => {
  it("accepts the four sides and nothing else", () => {
    expect(["top", "right", "bottom", "left"].every(isMenuSide)).toBe(true);
    expect([undefined, "", "center", 3].some(isMenuSide)).toBe(false);
  });
});
