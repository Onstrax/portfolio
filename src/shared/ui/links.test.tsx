import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ButtonLink } from "./button-link";
import { Chip } from "./chip";
import { ExternalLink } from "./external-link";

describe("ExternalLink", () => {
  it("opens in a new tab without leaking the opener, and says so in the language of the page", () => {
    render(
      <ExternalLink href="https://github.com/Onstrax" locale="es">
        GitHub
      </ExternalLink>,
    );
    const link = screen.getByRole("link", { name: /^GitHub\s?\(se abre en una pestaña nueva\)$/ });
    expect(link).toHaveAttribute("href", "https://github.com/Onstrax");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("adds the spoken context to tell apart links with the same visible text", () => {
    render(
      <ExternalLink
        href="https://github.com/Onstrax/AhorrApp-Backend"
        locale="en"
        context="AhorrApp"
      >
        Backend
      </ExternalLink>,
    );
    expect(
      screen.getByRole("link", { name: /^Backend, AhorrApp\s?\(opens in a new tab\)$/ }),
    ).toBeInTheDocument();
  });

  it("keeps the same behavior when it looks like a button", () => {
    render(
      <ExternalLink href="https://github.com/Onstrax/portfolio" locale="en" button="primary">
        Code
      </ExternalLink>,
    );
    const link = screen.getByRole("link", { name: /^Code\s?\(opens in a new tab\)$/ });
    expect(link).toHaveAttribute("target", "_blank");
  });
});

describe("ButtonLink", () => {
  it("downloads a file with its media type when asked to", () => {
    render(
      <ButtonLink href="/cv/juan-esteban-alvarez-garcia-cv-es.pdf" downloadType="application/pdf">
        Descargar CV (PDF)
      </ButtonLink>,
    );
    const link = screen.getByRole("link", { name: "Descargar CV (PDF)" });
    expect(link).toHaveAttribute("href", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf");
    expect(link).toHaveAttribute("download");
    expect(link).toHaveAttribute("type", "application/pdf");
  });

  it("is a plain link to an anchor otherwise", () => {
    render(<ButtonLink href="#content">Volver arriba</ButtonLink>);
    const link = screen.getByRole("link", { name: "Volver arriba" });
    expect(link).toHaveAttribute("href", "#content");
    expect(link).not.toHaveAttribute("download");
    expect(link).not.toHaveAttribute("target");
  });
});

describe("Chip", () => {
  it("shows its text and is not interactive", () => {
    render(<Chip variant="recognition">Mejor proyecto de su sección</Chip>);
    expect(screen.getByText("Mejor proyecto de su sección")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
