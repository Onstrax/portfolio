import type { AboutText } from "../types";

export const aboutEn = {
  meta: {
    title: "About this site",
    hardwareName: "CMOS battery",
    description:
      "How this portfolio is built: spec-driven development, stack, accessibility and a link to the source code.",
  },
  intro:
    "This portfolio is a project in itself: a motherboard where each component opens a part of my profile.",
  methodTitle: "How it was built",
  method: [
    "With spec-driven development (SDD): every feature was first written as a specification with verifiable acceptance criteria.",
    "Every automated criterion has a test that cites it, and a traceability check prevents a feature from being marked as done without them.",
    "Built with AI assistance, with the specifications as the source of truth.",
  ],
  stackTitle: "Stack",
  qualityTitle: "What you do not see",
  quality: [
    "Static site: no application server, no database and no cookies.",
    "Fully navigable by keyboard and screen reader, conforming to WCAG 2.2 AA.",
    "Without JavaScript, or on a phone, the same content is shown as a plain page.",
  ],
  imageTitle: "The image",
  image:
    "The motherboard photograph and its sketch version were generated with AI and upscaled to high resolution; the interactive areas and the auras are drawn in code on top of them.",
  repositoryLabel: "Code and specifications on GitHub",
} satisfies AboutText;
