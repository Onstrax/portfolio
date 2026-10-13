import { SITE } from "@/shared/config/site";

import type { ContactText } from "../types";

export const contactEn = {
  meta: {
    title: "Contact",
    hardwareName: "I/O panel",
    description: `Contact details of ${SITE.authorName}: email, WhatsApp, LinkedIn, GitHub and résumé download in Spanish and English.`,
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
} satisfies ContactText;
