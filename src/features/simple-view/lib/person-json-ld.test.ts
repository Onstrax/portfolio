import { describe, expect, it } from "vitest";

import { buildPersonJsonLd, serializeJsonLd } from "./person-json-ld";

describe("buildPersonJsonLd", () => {
  it("describes the author with data taken from the profile and contact sections", () => {
    expect(buildPersonJsonLd("es")).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: "Juan Esteban Álvarez García",
      url: "http://localhost:4173/es/",
      image: expect.stringMatching(
        /^http:\/\/localhost:4173\/portrait\/portrait-384\.[0-9a-f]{12}\.jpg$/,
      ) as unknown,
      description:
        "Portfolio de Juan Esteban Álvarez García, Ingeniero de Sistemas y Computación de la Universidad de los Andes: software, cloud/DevOps y seguridad aplicada.",
      email: "juanalvarezgcl@gmail.com",
      sameAs: [
        "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/",
        "https://github.com/Onstrax",
      ],
      alumniOf: { "@type": "CollegeOrUniversity", name: "Universidad de los Andes" },
      knowsLanguage: ["es", "en", "de"],
      address: { "@type": "PostalAddress", addressLocality: "Bogotá", addressCountry: "CO" },
    });
  });

  it("IO-AC11: never mentions the references of the contact section", () => {
    for (const locale of ["es", "en"] as const) {
      const json = JSON.stringify(buildPersonJsonLd(locale));
      for (const name of ["Jaramillo", "Quiroga", "Duitama", "Hernandez", "@uniandes.edu.co"]) {
        expect(json, name).not.toContain(name);
      }
    }
  });

  it("uses the home and the description of the language of the page", () => {
    const person = buildPersonJsonLd("en");
    expect(person["url"]).toBe("http://localhost:4173/en/");
    expect(String(person["description"]).startsWith("Portfolio of Juan Esteban")).toBe(true);
  });
});

describe("serializeJsonLd", () => {
  it("writes JSON that cannot close the script element that holds it", () => {
    const text = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    expect(text).not.toContain("<");
    expect(JSON.parse(text)).toEqual({ name: "</script><script>alert(1)</script>" });
  });
});
