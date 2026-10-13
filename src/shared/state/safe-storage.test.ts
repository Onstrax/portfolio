import { afterEach, describe, expect, it, vi } from "vitest";

import { readStorage, writeStorage } from "./safe-storage";

function fakeStorage(initial: Readonly<Record<string, string>> = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      data.set(key, value);
    },
  };
}

function throwingStorage() {
  return {
    getItem: () => {
      throw new Error("denied");
    },
    setItem: () => {
      throw new Error("quota");
    },
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("safe-storage", () => {
  it("reads and writes each storage area", () => {
    const local = fakeStorage({ key: "local value" });
    const session = fakeStorage({ key: "session value" });
    vi.stubGlobal("window", { localStorage: local, sessionStorage: session });

    expect(readStorage("local", "key")).toBe("local value");
    expect(readStorage("session", "key")).toBe("session value");
    writeStorage("session", "other", "written");
    expect(session.getItem("other")).toBe("written");
    expect(local.getItem("other")).toBeNull();
  });

  it("returns null for a missing key", () => {
    vi.stubGlobal("window", { localStorage: fakeStorage(), sessionStorage: fakeStorage() });
    expect(readStorage("local", "missing")).toBeNull();
  });

  it("SYS-AC10: returns null and does nothing when there is no window", () => {
    expect(readStorage("local", "key")).toBeNull();
    expect(() => {
      writeStorage("local", "key", "value");
    }).not.toThrow();
  });

  it("SYS-AC10: swallows the exceptions of a storage that throws on every access", () => {
    vi.stubGlobal("window", { localStorage: throwingStorage(), sessionStorage: throwingStorage() });
    expect(readStorage("local", "key")).toBeNull();
    expect(() => {
      writeStorage("session", "key", "value");
    }).not.toThrow();
  });

  it("SYS-AC10: survives a window whose storage getters throw", () => {
    const hostile = {
      get localStorage(): never {
        throw new Error("SecurityError");
      },
      get sessionStorage(): never {
        throw new Error("SecurityError");
      },
    };
    vi.stubGlobal("window", hostile);
    expect(readStorage("local", "key")).toBeNull();
    expect(() => {
      writeStorage("local", "key", "value");
    }).not.toThrow();
  });
});
