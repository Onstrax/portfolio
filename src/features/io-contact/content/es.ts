import { SITE } from "@/shared/config/site";

import type { ContactText } from "../types";

export const contactEs = {
  meta: {
    title: "Contacto",
    hardwareName: "Panel I/O",
    description: `Contacto de ${SITE.authorName}: correo, WhatsApp, LinkedIn, GitHub, referencias y descarga del currículum en español y en inglés.`,
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
  referencesTitle: "Referencias",
  referencesIntro:
    "Personas que conocen mi trabajo y a las que puedes escribir para preguntar por mí.",
  referenceRoles: {
    jaramillo:
      "Emprendedor e inversionista. Fundador de Falcon; cofundador y ex-CEO de Bunny Studio.",
    quiroga: "Criptógrafo, empresario e inventor. Criptografía poscuántica y computación cuántica.",
    duitama:
      "Profesor asociado de Ingeniería de Sistemas y Computación, Universidad de los Andes. Bioinformática y algoritmos.",
    hernandez: "Profesora, investigadora y líder académica de la Universidad de los Andes.",
  },
} satisfies ContactText;
