import { describe, expect, it } from "vitest";

import { RENDER_MODE_QUERY } from "./render-mode";

describe("RENDER_MODE_QUERY", () => {
  it("asks for at least 1024 px of width and 600 px of height", () => {
    expect(RENDER_MODE_QUERY).toBe("(min-width: 1024px) and (min-height: 600px)");
  });
});
