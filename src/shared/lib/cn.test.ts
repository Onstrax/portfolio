import { describe, expect, it } from "vitest";

import { cn } from "./cn";

describe("cn", () => {
  it("joins class names with a space", () => {
    expect(cn("flex", "gap-2")).toBe("flex gap-2");
  });

  it("skips false, undefined and empty values", () => {
    const isActive = (value: number): boolean => value > 1;
    expect(cn("flex", isActive(0) && "font-semibold", undefined, "", "gap-2")).toBe("flex gap-2");
    expect(cn("flex", isActive(2) && "font-semibold")).toBe("flex font-semibold");
  });

  it("returns an empty string when nothing is left", () => {
    expect(cn(undefined, false)).toBe("");
  });
});
