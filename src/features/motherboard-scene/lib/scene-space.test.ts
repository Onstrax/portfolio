import { describe, expect, it } from "vitest";

import { SCENE_ASSETS } from "@/shared/assets/manifest.generated";

import {
  RESERVED_AREA,
  SAFE_AREA,
  SCENE_HEIGHT,
  SCENE_WIDTH,
  toClipPath,
  toStageRect,
  toSvgPoints,
  VIGNETTE_SIZE,
} from "./scene-space";

describe("scene space", () => {
  it("has the size and the safe area that the manifest declares for both variants", () => {
    for (const asset of Object.values(SCENE_ASSETS)) {
      expect(asset.sceneSpace).toEqual({ width: SCENE_WIDTH, height: SCENE_HEIGHT });
      expect(asset.safeArea).toEqual({
        x: SAFE_AREA.left,
        y: SAFE_AREA.top,
        width: SAFE_AREA.right - SAFE_AREA.left,
        height: SAFE_AREA.bottom - SAFE_AREA.top,
      });
    }
  });

  it("reserves the top right corner for the fixed bar and 64 units for the vignette", () => {
    expect(RESERVED_AREA).toEqual({ left: 1240, top: 0, right: 1600, bottom: 100 });
    expect(VIGNETTE_SIZE).toBe(64);
  });
});

describe("conversions to the stage", () => {
  const box = { left: 400, top: 225, right: 800, bottom: 450 };

  it("writes the points of an SVG polygon", () => {
    expect(
      toSvgPoints([
        { x: 1, y: 2 },
        { x: 30.5, y: 4 },
      ]),
    ).toBe("1,2 30.5,4");
  });

  it("places a box in percentages of the stage", () => {
    expect(toStageRect(box)).toEqual({ left: "25%", top: "25%", width: "25%", height: "25%" });
    expect(toStageRect({ left: 596.5, top: 444, right: 665.5, bottom: 513 })).toEqual({
      left: "37.281%",
      top: "49.333%",
      width: "4.313%",
      height: "7.667%",
    });
  });

  it("cuts an element to a polygon, in percentages of its own box", () => {
    expect(
      toClipPath(
        [
          { x: 400, y: 225 },
          { x: 800, y: 225 },
          { x: 600, y: 450 },
        ],
        box,
      ),
    ).toBe("polygon(0% 0%, 100% 0%, 50% 100%)");
  });
});
