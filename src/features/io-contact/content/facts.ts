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
} as const satisfies ContactFacts;
