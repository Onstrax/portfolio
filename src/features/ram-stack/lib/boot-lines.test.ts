import { describe, expect, it } from "vitest";

import { ramStackSection } from "../index";
import { buildStackBootLines } from "./boot-lines";

describe("stack boot lines", () => {
  it("RAM-AC06: is exactly the line of the spec", () => {
    expect(ramStackSection.bootLines).toEqual([
      { message: "Memory: 8 banks, 55 modules online", status: "ok" },
    ]);
  });

  it("counts the groups and the technologies it receives", () => {
    const lines = buildStackBootLines({
      groups: [
        { id: "languages", items: ["Python", "Java"] },
        { id: "data", items: ["PostgreSQL"] },
      ],
    });
    expect(lines[0]?.message).toBe("Memory: 2 banks, 3 modules online");
  });
});
