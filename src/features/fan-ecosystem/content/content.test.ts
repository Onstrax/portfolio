import { describe, expect, it } from "vitest";

import { BUILT_IDS, CONFIGURED_IDS, SETUP_IDS } from "../types";
import { ecosystemEn } from "./en";
import { ecosystemEs } from "./es";
import { ecosystemFacts } from "./facts";

describe("ecosystem facts", () => {
  it("FAN-AC01: holds the six items in their groups with their tools, repository and link", () => {
    expect(ecosystemFacts.setup).toEqual([
      { id: "system", tools: ["CachyOS", "Hyprland"], repository: "private" },
      {
        id: "shell",
        tools: ["caelestia", "Quickshell"],
        link: { id: "caelestia", href: "https://github.com/caelestia-dots/caelestia" },
      },
    ]);
    expect(ecosystemFacts.built).toEqual([
      {
        id: "bongo-cat",
        tools: ["Obsidian", "TypeScript"],
        repository: "public",
        link: { id: "bongo-cat", href: "https://github.com/Onstrax/bongo-cat" },
      },
      {
        id: "steam-library-hub",
        tools: ["Next.js", "SQLite", "Docker"],
        repository: "public",
        link: { id: "github-profile", href: "https://github.com/Onstrax" },
      },
    ]);
    expect(ecosystemFacts.configured).toEqual([
      { id: "homelab", tools: ["Docker", "Kokoro", "Home Assistant"] },
      { id: "sync", tools: ["Syncthing", "Obsidian"] },
    ]);
    expect(ecosystemFacts.leadershipTrainingPeriod).toEqual({
      start: { year: 2014 },
      end: { year: 2019 },
    });
  });

  it("FAN-AC02: keeps what was built apart from what was configured", () => {
    const built = ecosystemFacts.built.map((item): string => item.id);
    const configured = ecosystemFacts.configured.map((item): string => item.id);
    expect(built.filter((id) => configured.includes(id))).toEqual([]);
    expect(built).toEqual([...BUILT_IDS]);
    expect(configured).toEqual([...CONFIGURED_IDS]);
    for (const item of ecosystemFacts.configured) {
      expect("repository" in item, item.id).toBe(false);
      expect("link" in item, item.id).toBe(false);
    }
  });
});

describe("ecosystem texts", () => {
  it("FAN-AC03: each language has a text per item and three interests", () => {
    for (const text of [ecosystemEs, ecosystemEn]) {
      expect(Object.keys(text.setup)).toEqual([...SETUP_IDS]);
      expect(Object.keys(text.built)).toEqual([...BUILT_IDS]);
      expect(Object.keys(text.configured)).toEqual([...CONFIGURED_IDS]);
      expect(text.interests).toHaveLength(3);
    }
  });

  it("FAN-AC03: uses the section and hardware names of VSN §4", () => {
    expect([ecosystemEs.meta.title, ecosystemEs.meta.hardwareName]).toEqual([
      "Ecosistema personal",
      "Ventilador ARGB",
    ]);
    expect([ecosystemEn.meta.title, ecosystemEn.meta.hardwareName]).toEqual([
      "Personal ecosystem",
      "ARGB fan",
    ]);
  });
});
