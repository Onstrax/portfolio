import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ContactSection } from "./contact-section";

function downloads(): readonly HTMLElement[] {
  return screen.getAllByRole("link").filter((link) => link.hasAttribute("download"));
}

describe("ContactSection", () => {
  it("IO-AC03: renders the three blocks, the four channels and the two downloads in Spanish", () => {
    const { container } = render(<ContactSection locale="es" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Canales",
      "Referencias",
      "Currículum",
    ]);
    expect([...container.querySelectorAll("dl dt")].map((term) => term.textContent)).toEqual([
      "Correo",
      "WhatsApp",
      "LinkedIn",
      "GitHub",
    ]);
    expect(container.querySelectorAll("dl dd")).toHaveLength(4);
    expect(downloads().map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Descargar en español (PDF)", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf"],
      ["Descargar en inglés (PDF)", "/cv/juan-esteban-alvarez-garcia-cv-en.pdf"],
    ]);
    for (const link of downloads()) {
      expect(link).toHaveAttribute("type", "application/pdf");
    }
  });

  it("IO-AC03: puts the résumé in English first on the English page", () => {
    render(<ContactSection locale="en" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Channels",
      "References",
      "Résumé",
    ]);
    expect(downloads().map((link) => [link.textContent, link.getAttribute("href")])).toEqual([
      ["Download in English (PDF)", "/cv/juan-esteban-alvarez-garcia-cv-en.pdf"],
      ["Download in Spanish (PDF)", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf"],
    ]);
  });

  it("IO-AC04: the mail link stays in the page and the other channels open in a new tab", () => {
    render(<ContactSection locale="es" idScope="" view="simple" />);
    const mail = screen.getByRole("link", { name: "juanalvarezgcl@gmail.com" });
    expect(mail).toHaveAttribute("href", "mailto:juanalvarezgcl@gmail.com");
    expect(mail).not.toHaveAttribute("target");

    const external = [
      ["+57 300 562 8702", "https://wa.me/573005628702"],
      [
        "juan-esteban-alvarez-garcia",
        "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/",
      ],
      ["Onstrax", "https://github.com/Onstrax"],
    ] as const;
    for (const [text, href] of external) {
      const link = screen.getByText(text).closest("a");
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("offers a button that copies the mail address, hidden until the browser can copy", () => {
    render(<ContactSection locale="es" idScope="" view="simple" />);
    const button = screen.getByRole("button", { hidden: true });
    expect(button).toHaveAttribute("aria-label", "Copiar la dirección de correo");
    expect(button).toHaveTextContent("Copiar");
    expect(button).toHaveAttribute("hidden");
    expect(
      screen.getByText("La forma más rápida de contactarme es por correo o por WhatsApp."),
    ).toBeInTheDocument();
  });

  it("IO-AC11: lists the four references, between the channels and the résumé, with their role and address", () => {
    render(<ContactSection locale="es" idScope="" view="simple" />);
    const block = screen.getByRole("heading", { level: 3, name: "Referencias" }).parentElement;
    if (block === null) throw new Error("No references block");
    expect(
      within(block)
        .getAllByRole("heading", { level: 4 })
        .map((h) => h.textContent),
    ).toEqual(["Santiago Jaramillo", "Milton Quiroga", "Jorge Duitama", "Marcela Hernandez"]);
    expect(
      within(block)
        .getAllByRole("link")
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "mailto:s.jaramillo4@uniandes.edu.co",
      "mailto:mquiroga@uniandes.edu.co",
      "mailto:ja.duitama@uniandes.edu.co",
      "mailto:marc-her@uniandes.edu.co",
    ]);
    expect(block).toHaveTextContent("Fundador de Falcon");
    expect(block).not.toHaveTextContent(/\+\d/);
  });
});
