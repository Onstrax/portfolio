import { SITE } from "@/shared/config/site";

import type { ProfileFacts } from "../types";

export const profileFacts = {
  name: SITE.authorName,
  location: "Bogotá, Colombia",
  city: "Bogotá",
  countryCode: "CO",
  education: [
    {
      id: "uniandes",
      institution: "Universidad de los Andes",
      period: { start: { year: 2022, month: 1 }, end: "present" },
    },
    {
      id: "hm",
      institution: "Hochschule München",
      period: { start: { year: 2025, month: 2 }, end: { year: 2025, month: 7 } },
    },
  ],
  gpa: { value: 4.2, scale: 5 },
  graduationYear: 2027,
  exchangeCredits: "17 ECTS",
  languages: ["es", "en", "de"],
} as const satisfies ProfileFacts;
