import type { ExperienceFacts } from "../types";

export const experienceFacts = {
  jobs: [
    {
      id: "freelance",
      period: { start: { year: 2024, month: 7 }, end: "present" },
      teamSize: 1,
      stack: ["Python", "Selenium"],
      repository: "public",
      repositoryLink: {
        id: "repository",
        href: "https://github.com/PortafolioSor0/All-Inclusive",
      },
    },
    {
      id: "teaching-assistant",
      period: { start: { year: 2026, month: 1 }, end: { year: 2026, month: 12 } },
      organization: "Universidad de los Andes",
      teamSize: 1,
      stack: [],
    },
    {
      id: "tutor",
      period: { start: { year: 2022, month: 1 }, end: { year: 2026, month: 12 } },
      teamSize: 1,
      stack: [],
    },
  ],
  leadershipPeriod: { start: { year: 2022 }, end: { year: 2024 } },
} as const satisfies ExperienceFacts;
