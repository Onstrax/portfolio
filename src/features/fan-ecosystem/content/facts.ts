import type { EcosystemFacts } from "../types";

export const ecosystemFacts = {
  setup: [
    { id: "system", tools: ["CachyOS", "Hyprland"], repository: "private" },
    {
      id: "shell",
      tools: ["caelestia", "Quickshell"],
      link: { id: "caelestia", href: "https://github.com/caelestia-dots/caelestia" },
    },
  ],
  built: [
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
  ],
  configured: [
    { id: "homelab", tools: ["Docker", "Kokoro", "Home Assistant"] },
    { id: "sync", tools: ["Syncthing", "Obsidian"] },
  ],
  leadershipTrainingPeriod: { start: { year: 2014 }, end: { year: 2019 } },
} as const satisfies EcosystemFacts;
