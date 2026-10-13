import { describe, expect, it } from "vitest";

import { typedEntries, typedKeys } from "./typed-object";

const SAMPLE = { cpu: "profile", ssd: "projects" } as const;

describe("typed-object", () => {
  it("typedKeys returns the keys of the object in insertion order", () => {
    const keys: readonly ("cpu" | "ssd")[] = typedKeys(SAMPLE);
    expect(keys).toEqual(["cpu", "ssd"]);
  });

  it("typedEntries returns key and value pairs in insertion order", () => {
    const entries: readonly (readonly ["cpu" | "ssd", "profile" | "projects"])[] =
      typedEntries(SAMPLE);
    expect(entries).toEqual([
      ["cpu", "profile"],
      ["ssd", "projects"],
    ]);
  });

  it("returns empty lists for an empty object", () => {
    expect(typedKeys({})).toEqual([]);
    expect(typedEntries({})).toEqual([]);
  });
});
