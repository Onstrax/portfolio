import { describe, expect, it } from "vitest";

import { parsePrefs, parseSession, serializePrefs, serializeSession } from "./persistence";

const INVALID_RAW = [null, "", "not json", "[1,2]", "42", '"text"', "null"];

describe("parsePrefs", () => {
  it("TSC-AC11: returns the defaults for missing, malformed or wrongly shaped values", () => {
    for (const raw of INVALID_RAW) {
      expect(parsePrefs(raw), String(raw)).toEqual({ soundEnabled: false, sceneVariant: "photo" });
    }
    expect(parsePrefs('{"soundEnabled":"yes","locale":7,"sceneVariant":3}')).toEqual({
      soundEnabled: false,
      sceneVariant: "photo",
    });
  });

  it("TSC-AC11: keeps the valid fields of a partially invalid object", () => {
    expect(parsePrefs('{"soundEnabled":true,"locale":"de","sceneVariant":"sketch"}')).toEqual({
      soundEnabled: true,
      sceneVariant: "sketch",
    });
    expect(parsePrefs('{"soundEnabled":1,"locale":"es"}')).toEqual({
      soundEnabled: false,
      sceneVariant: "photo",
      locale: "es",
    });
  });

  it("TSC-AC11: replaces an unknown scene variant with the photograph", () => {
    expect(parsePrefs('{"soundEnabled":true,"sceneVariant":"blueprint"}')).toEqual({
      soundEnabled: true,
      sceneVariant: "photo",
    });
  });
});

describe("parseSession", () => {
  it("TSC-AC11: returns the defaults for missing, malformed or wrongly shaped values", () => {
    for (const raw of INVALID_RAW) {
      expect(parseSession(raw), String(raw)).toEqual({ bootSeen: false, visited: [] });
    }
    expect(parseSession('{"bootSeen":"true","visited":"cpu"}')).toEqual({
      bootSeen: false,
      visited: [],
    });
  });

  it("TSC-AC11: drops repeated values and values that are not primary components", () => {
    expect(parseSession('{"bootSeen":true,"visited":["cpu","ssd","cpu","cmos","gpu",3]}')).toEqual({
      bootSeen: true,
      visited: ["cpu", "ssd"],
    });
  });
});

describe("serialization", () => {
  it("writes exactly the persisted fields, without wrappers", () => {
    expect(serializePrefs({ soundEnabled: false, sceneVariant: "photo", locale: "es" })).toBe(
      '{"soundEnabled":false,"sceneVariant":"photo","locale":"es"}',
    );
    expect(serializePrefs({ soundEnabled: true, sceneVariant: "sketch" })).toBe(
      '{"soundEnabled":true,"sceneVariant":"sketch"}',
    );
    expect(serializeSession({ bootSeen: true, visited: ["cpu"] })).toBe(
      '{"bootSeen":true,"visited":["cpu"]}',
    );
  });

  it("ignores fields that are not part of the persisted value", () => {
    const store = { soundEnabled: true, sceneVariant: "photo" as const, hasHydrated: true };
    expect(serializePrefs(store)).toBe('{"soundEnabled":true,"sceneVariant":"photo"}');
  });

  it("round-trips through the parsers", () => {
    const prefs = { soundEnabled: true, sceneVariant: "sketch" as const, locale: "en" as const };
    expect(parsePrefs(serializePrefs(prefs))).toEqual(prefs);
    const session = { bootSeen: true, visited: ["ram", "io"] as const };
    expect(parseSession(serializeSession(session))).toEqual(session);
  });
});
