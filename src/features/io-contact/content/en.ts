import { SITE } from "@/shared/config/site";

import type { ContactText } from "../types";

export const contactEn = {
  meta: {
    title: "Contact",
    hardwareName: "I/O panel",
    description: `Contact details of ${SITE.authorName}: email, WhatsApp, LinkedIn, GitHub, references and résumé download in Spanish and English.`,
  },
  intro: "The fastest way to reach me is by email or WhatsApp.",
  channelsTitle: "Channels",
  channelLabels: {
    email: "Email",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    github: "GitHub",
  },
  copyEmailAriaLabel: "Copy the email address",
  cvTitle: "Résumé",
  cvLabels: {
    es: "Download in Spanish (PDF)",
    en: "Download in English (PDF)",
  },
  referencesTitle: "References",
  referencesIntro: "People who know my work and whom you can write to ask about me.",
  referenceRoles: {
    jaramillo:
      "Entrepreneur and investor. Founder of Falcon; co-founder and former CEO of Bunny Studio.",
    quiroga:
      "Cryptographer, entrepreneur and inventor. Post-quantum cryptography and quantum computing.",
    duitama:
      "Associate Professor of Systems and Computing Engineering, Universidad de los Andes. Bioinformatics and algorithms.",
    hernandez: "Professor, researcher and academic leader at Universidad de los Andes.",
  },
} satisfies ContactText;
