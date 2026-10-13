import { SITE } from "@/shared/config/site";

import type { EcosystemText } from "../types";

export const ecosystemEn = {
  meta: {
    title: "Personal ecosystem",
    hardwareName: "ARGB fan",
    description: `The personal ecosystem of ${SITE.authorName}: his Linux setup, side projects, homelab and interests away from the screen.`,
  },
  intro: "I like to understand my tools and tune them until they get out of the way.",
  setupTitle: "My setup",
  setup: {
    system: {
      name: "Linux as a daily driver",
      description:
        "I work on an Arch-based distribution with a tiling window manager; my configuration (ricing) lives in a private repository.",
    },
    shell: {
      name: "Desktop shell",
      description:
        "My desktop builds on the open-source caelestia project, which I adapt to the way I work.",
      linkLabel: "The caelestia project",
    },
  },
  builtTitle: "Built by me",
  built: {
    "bongo-cat": {
      name: "Bongo Cat View",
      description:
        "Obsidian plugin: a cat that drums along as you type, with idle and sleep states. Works offline.",
      linkLabel: "Repository",
    },
    "steam-library-hub": {
      name: "Steam Local Library Hub",
      description:
        "Local web app to browse, filter and sort my Steam library, with all data stored on the machine itself.",
      linkLabel: "Available on my GitHub profile",
    },
  },
  configuredTitle: "Configured and integrated",
  configured: {
    homelab: {
      name: "Containerized homelab",
      description:
        "Local text-to-speech and control of my room lights, which I drive with global keyboard shortcuts.",
    },
    sync: {
      name: "Sync across devices",
      description: "My notes vault syncs directly between PC and phone, peer to peer.",
    },
  },
  offlineTitle: "Away from the screen",
  interests: ["Calisthenics", "Parkour", "Gaming"],
  leadershipTraining: "Ignatian leadership training during school.",
} satisfies EcosystemText;
