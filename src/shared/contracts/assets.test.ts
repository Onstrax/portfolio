import { describe, expect, it } from "vitest";

import { DEFAULT_SCENE_VARIANT, isSceneVariant, SCENE_VARIANTS } from "./assets";

describe("scene variants", () => {
  it("lists the photograph first and shows it by default", () => {
    expect(SCENE_VARIANTS).toEqual(["photo", "sketch"]);
    expect(DEFAULT_SCENE_VARIANT).toBe("photo");
  });

  it("isSceneVariant accepts both variants and rejects anything else", () => {
    for (const variant of SCENE_VARIANTS) {
      expect(isSceneVariant(variant)).toBe(true);
    }
    for (const value of ["blueprint", "", null, undefined, 0]) {
      expect(isSceneVariant(value)).toBe(false);
    }
  });
});
