import type { ContactFacts } from "../types";

const EMAIL = "juanalvarezgcl@gmail.com";

export const contactFacts = {
  email: EMAIL,
  channels: [
    { id: "email", href: `mailto:${EMAIL}`, display: EMAIL },
    { id: "whatsapp", href: "https://wa.me/573005628702", display: "+57 300 562 8702" },
    {
      id: "linkedin",
      href: "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/",
      display: "juan-esteban-alvarez-garcia",
    },
    { id: "github", href: "https://github.com/Onstrax", display: "Onstrax" },
  ],
  // Published with the consent of each person: name, role and address only (F-34).
  references: [
    { id: "jaramillo", name: "Santiago Jaramillo", email: "s.jaramillo4@uniandes.edu.co" },
    { id: "quiroga", name: "Milton Quiroga", email: "mquiroga@uniandes.edu.co" },
    { id: "duitama", name: "Jorge Duitama", email: "ja.duitama@uniandes.edu.co" },
    { id: "hernandez", name: "Marcela Hernandez", email: "marc-her@uniandes.edu.co" },
  ],
} as const satisfies ContactFacts;
