import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { StackSection } from "./stack-section";

function blocks(): readonly (readonly [string | null, number])[] {
  return screen
    .getAllByRole("heading", { level: 3 })
    .map((heading) => [
      heading.textContent,
      heading.parentElement?.querySelectorAll("li").length ?? 0,
    ]);
}

describe("StackSection", () => {
  it("RAM-AC04: renders ten blocks in order, each with its list, in Spanish", () => {
    render(<StackSection locale="es" idScope="" />);
    expect(blocks()).toEqual([
      ["Lenguajes", 5],
      ["Frontend y móvil", 6],
      ["Backend y APIs", 4],
      ["Cloud: Google Cloud", 7],
      ["Cloud: AWS", 10],
      ["DevOps y herramientas", 10],
      ["Datos e inteligencia artificial", 6],
      ["Seguridad y criptografía", 9],
      ["Ingeniería y metodologías", 9],
      ["Desarrollo asistido por IA", 15],
    ]);
    expect(screen.getByText("Python")).toBeInTheDocument();
    expect(screen.getByText("Diseño e integración de APIs REST.")).toBeInTheDocument();
  });

  it("RAM-AC04: renders the same structure in English", () => {
    render(<StackSection locale="en" idScope="" />);
    expect(blocks().map(([title]) => title)).toEqual([
      "Languages",
      "Frontend and mobile",
      "Backend and APIs",
      "Cloud: Google Cloud",
      "Cloud: AWS",
      "DevOps and tooling",
      "Data and AI",
      "Security and cryptography",
      "Engineering and methods",
      "AI-assisted development",
    ]);
    expect(blocks().map(([, count]) => count)).toEqual([5, 6, 4, 7, 10, 10, 6, 9, 9, 15]);
  });

  it("RAM-AC05: shows no level indicator of any kind", () => {
    const { container } = render(<StackSection locale="es" idScope="" />);
    expect(container.querySelector("progress, meter, [aria-valuenow]")).toBeNull();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });

  for (const [locale, title, groups, link, href] of [
    [
      "es",
      "Desarrollo asistido por IA",
      ["Entornos de agentes", "Herramientas", "Modelos"],
      "Cómo construí este portfolio",
      "/es/about/",
    ],
    [
      "en",
      "AI-assisted development",
      ["Agent harnesses", "Tools", "Models"],
      "How I built this portfolio",
      "/en/about/",
    ],
  ] as const) {
    it(`RAM-AC10: shows how the author works with AI, the tools by group and a link to the about section (${locale})`, () => {
      render(<StackSection locale={locale} idScope="" />);
      const block = screen.getByRole("heading", { level: 3, name: title }).parentElement;
      if (block === null) throw new Error("No AI block");
      expect(block).toHaveTextContent(
        locale === "es" ? "las decisiones las tomo yo" : "the decisions are mine",
      );
      const names = within(block).getAllByRole("heading", { level: 4 });
      expect(names.map((name) => name.textContent)).toEqual([...groups]);
      expect(names.map((name) => name.nextElementSibling?.querySelectorAll("li").length)).toEqual([
        3, 4, 8,
      ]);
      expect(within(block).getByText("Nano Banana")).toBeInTheDocument();
      expect(within(block).getByRole("link", { name: link })).toHaveAttribute("href", href);
    });
  }
});
