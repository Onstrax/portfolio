import { SITE } from "@/shared/config/site";

import type { AboutFacts } from "../types";

export const aboutFacts = {
  stack: ["Next.js", "React", "TypeScript", "Tailwind CSS", "Zustand", "Vitest", "Playwright"],
  repository: { id: "repository", href: SITE.repositoryUrl },
} as const satisfies AboutFacts;
