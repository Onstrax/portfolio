import { SITE } from "@/shared/config/site";

import type { ContactText } from "../types";

export const contactEs = {
  meta: {
    title: "Contacto",
    hardwareName: "Panel I/O",
    description: `Contacto de ${SITE.authorName}: correo, WhatsApp, LinkedIn, GitHub y descarga del currículum en español y en inglés.`,
  },
  intro: "La forma más rápida de contactarme es por correo o por WhatsApp.",
  channelsTitle: "Canales",
  channelLabels: {
    email: "Correo",
    whatsapp: "WhatsApp",
    linkedin: "LinkedIn",
    github: "GitHub",
  },
  copyEmailAriaLabel: "Copiar la dirección de correo",
  cvTitle: "Currículum",
  cvLabels: {
    es: "Descargar en español (PDF)",
    en: "Descargar en inglés (PDF)",
  },
} satisfies ContactText;
