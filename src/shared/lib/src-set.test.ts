import { describe, expect, it } from "vitest";

import { toSrcSet } from "./src-set";

describe("toSrcSet", () => {
  it("lists every source with its width descriptor", () => {
    expect(
      toSrcSet([
        { width: 96, src: "/portrait/portrait-96.abc.avif" },
        { width: 192, src: "/portrait/portrait-192.abc.avif" },
      ]),
    ).toBe("/portrait/portrait-96.abc.avif 96w, /portrait/portrait-192.abc.avif 192w");
  });

  it("returns an empty string for no sources", () => {
    expect(toSrcSet([])).toBe("");
  });
});
