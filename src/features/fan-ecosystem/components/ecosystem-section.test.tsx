import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EcosystemSection } from "./ecosystem-section";

const NBSP = " ";

describe("EcosystemSection", () => {
  it("FAN-AC04: renders the four blocks, the six items and the three links in Spanish", () => {
    render(<EcosystemSection locale="es" idScope="" view="simple" />);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "Mi entorno",
      "Desarrollado por mí",
      "Configurado e integrado",
      "Fuera de la pantalla",
    ]);
    expect(screen.getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual([
      "Linux a diario",
      "Interfaz de escritorio",
      "Bongo Cat View",
      "Steam Local Library Hub",
      "Homelab en contenedores",
      "Sincronización entre dispositivos",
    ]);
    const links = screen.getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual([
      "https://github.com/caelestia-dots/caelestia",
      "https://github.com/Onstrax/bongo-cat",
      "https://github.com/Onstrax",
    ]);
    for (const link of links) {
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("FAN-AC04: marks the system configuration as a private repository", () => {
    const spanish = render(<EcosystemSection locale="es" idScope="" view="simple" />);
    const system = screen.getByRole("heading", { name: "Linux a diario" }).parentElement;
    expect(system).not.toBeNull();
    if (system !== null) {
      expect(within(system).getByText("Repositorio privado")).toBeInTheDocument();
    }
    expect(screen.getAllByText("Repositorio privado")).toHaveLength(1);
    spanish.unmount();

    render(<EcosystemSection locale="en" idScope="" view="simple" />);
    expect(screen.getAllByText("Private repository")).toHaveLength(1);
    expect(screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent)).toEqual([
      "My setup",
      "Built by me",
      "Configured and integrated",
      "Away from the screen",
    ]);
  });

  it("FAN-AC05: shows the period of the leadership training", () => {
    const { container } = render(<EcosystemSection locale="es" idScope="" view="simple" />);
    expect(container.textContent).toContain(`2014${NBSP}– 2019`);
  });

  it("keeps configured items out of the block of what the author built", () => {
    render(<EcosystemSection locale="es" idScope="" view="simple" />);
    const built = screen.getByRole("heading", { name: "Desarrollado por mí" }).parentElement;
    expect(built).not.toBeNull();
    if (built === null) return;
    expect(
      within(built)
        .getAllByRole("heading", { level: 4 })
        .map((h) => h.textContent),
    ).toEqual(["Bongo Cat View", "Steam Local Library Hub"]);
  });
});
