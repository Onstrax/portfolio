import { render, screen } from "@testing-library/react";
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
  it("RAM-AC04: renders nine blocks in order, each with its list, in Spanish", () => {
    render(<StackSection locale="es" idScope="" />);
    expect(blocks()).toEqual([
      ["Lenguajes", 5],
      ["Frontend y móvil", 6],
      ["Backend y APIs", 4],
      ["Cloud: Google Cloud", 7],
      ["Cloud: AWS", 10],
      ["DevOps y herramientas", 10],
      ["Datos e inteligencia artificial", 4],
      ["Seguridad y criptografía", 9],
      ["Ingeniería y metodologías", 9],
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
    ]);
    expect(blocks().map(([, count]) => count)).toEqual([5, 6, 4, 7, 10, 10, 4, 9, 9]);
  });

  it("RAM-AC05: shows no level indicator of any kind", () => {
    const { container } = render(<StackSection locale="es" idScope="" />);
    expect(container.querySelector("progress, meter, [aria-valuenow]")).toBeNull();
    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.queryByRole("meter")).not.toBeInTheDocument();
  });
});
