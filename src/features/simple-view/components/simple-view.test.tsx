import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: "es" }),
  usePathname: () => "/es/",
  useRouter: () => ({ push: vi.fn() }),
}));

import { en } from "@/shared/i18n/dictionaries/en";
import { es } from "@/shared/i18n/dictionaries/es";

import { SimpleView } from "./simple-view";

const SLUGS = ["profile", "experience", "projects", "stack", "contact", "ecosystem", "about"];
const TITLES = [
  "Perfil",
  "Experiencia",
  "Proyectos",
  "Stack tecnológico",
  "Contacto",
  "Ecosistema personal",
  "Acerca de este sitio",
];

describe("SimpleView", () => {
  it("shows the author as the only first-level heading and the résumé of the language", () => {
    render(<SimpleView locale="es" variant="base" />);
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([
      "Juan Esteban Álvarez García",
    ]);
    const banner = screen.getByRole("banner");
    expect(within(banner).getByRole("link", { name: "Descargar CV (PDF)" })).toHaveAttribute(
      "href",
      "/cv/juan-esteban-alvarez-garcia-cv-es.pdf",
    );
    expect(within(banner).getByRole("group", { name: "Idioma" })).toBeInTheDocument();
  });

  it("offers a navigation with one anchor per section, in canonical order", () => {
    render(<SimpleView locale="es" variant="base" />);
    const links = within(screen.getByRole("navigation", { name: "Secciones" })).getAllByRole(
      "link",
    );
    expect(links.map((link) => link.textContent)).toEqual(TITLES);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(SLUGS.map((slug) => `#${slug}`));
  });

  it("renders the seven sections inside the main content, each labelled by its title", () => {
    render(<SimpleView locale="es" variant="base" />);
    const main = screen.getByRole("main");
    expect(main).toHaveAttribute("id", "content");
    const sections = within(main).getAllByRole("region");
    expect(sections.map((section) => section.id)).toEqual(SLUGS);
    expect(sections.map((section) => section.getAttribute("aria-labelledby"))).toEqual(
      SLUGS.map((slug) => `${slug}-title`),
    );
    expect(
      within(main)
        .getAllByRole("heading", { level: 2 })
        .map((h) => h.textContent),
    ).toEqual(TITLES);
    for (const section of sections) {
      expect(section.textContent.length, section.id).toBeGreaterThan(200);
    }
  });

  it("does not name the hardware pieces: the simple view has no metaphor", () => {
    const { container } = render(<SimpleView locale="es" variant="standalone" />);
    for (const hardware of [
      "Procesador (CPU)",
      "Fuente de poder (PSU)",
      "SSD NVMe",
      "Memoria RAM",
      "Panel I/O",
      "Ventilador ARGB",
      "Pila CMOS",
    ]) {
      expect(container.textContent, hardware).not.toContain(hardware);
    }
  });

  it("adds the skip link and the way back to the scene only when it stands alone", () => {
    const standalone = render(<SimpleView locale="es" variant="standalone" />);
    expect(screen.getByRole("link", { name: "Saltar al contenido" })).toHaveAttribute(
      "href",
      "#content",
    );
    expect(screen.getByRole("link", { name: "Ver la versión interactiva" })).toHaveAttribute(
      "href",
      "/es/",
    );
    standalone.unmount();

    render(<SimpleView locale="es" variant="base" />);
    expect(screen.queryByRole("link", { name: "Saltar al contenido" })).not.toBeInTheDocument();
    expect(
      screen.queryByRole("link", { name: "Ver la versión interactiva" }),
    ).not.toBeInTheDocument();
  });

  it("explains where the interactive version is, and ends with a way back to the top", () => {
    render(<SimpleView locale="en" variant="base" />);
    expect(
      screen.getByText(
        "The interactive version of this portfolio is available on desktop screens.",
      ),
    ).toBeInTheDocument();
    expect(
      within(screen.getByRole("contentinfo")).getByRole("link", { name: "Back to top" }),
    ).toHaveAttribute("href", "#content");
  });
});

describe("simple view and site texts", () => {
  it("SMP-AC16: the simpleView namespace holds the texts of the spec", () => {
    expect(es.simpleView).toEqual({
      navAriaLabel: "Secciones",
      desktopHint:
        "La versión interactiva de este portfolio está disponible en pantallas de escritorio.",
      interactiveLinkLabel: "Ver la versión interactiva",
      backToTopLabel: "Volver arriba",
      caseKindTitle: "Caso de estudio",
      caseBackLabel: "Todos los proyectos",
      caseProblemTitle: "El problema",
      caseRoleTitle: "Mi rol",
      caseContributionsTitle: "Mis aportes",
      caseTeamTitle: "Aportes del equipo",
      caseProcessTitle: "El proceso",
      caseDecisionsTitle: "Decisiones",
      caseOptions: "Alternativas",
      caseChoice: "Elección",
      caseReason: "Por qué",
      caseChangesTitle: "Cambios de rumbo",
      caseOutcomeTitle: "Resultado",
      caseLearnedTitle: "Aprendizajes",
    });
    expect(en.simpleView).toEqual({
      navAriaLabel: "Sections",
      desktopHint: "The interactive version of this portfolio is available on desktop screens.",
      interactiveLinkLabel: "Open the interactive version",
      backToTopLabel: "Back to top",
      caseKindTitle: "Case study",
      caseBackLabel: "All projects",
      caseProblemTitle: "The problem",
      caseRoleTitle: "My role",
      caseContributionsTitle: "My contributions",
      caseTeamTitle: "Team contributions",
      caseProcessTitle: "The process",
      caseDecisionsTitle: "Decisions",
      caseOptions: "Options",
      caseChoice: "Choice",
      caseReason: "Why",
      caseChangesTitle: "Changes of direction",
      caseOutcomeTitle: "Outcome",
      caseLearnedTitle: "Lessons learned",
    });
  });

  it("SMP-AC16: the site namespace holds the texts of the spec", () => {
    expect(es.site).toMatchObject({
      homeTitle: "Juan Esteban Álvarez García · Portfolio interactivo",
      cvTitle: "Currículum · Juan Esteban Álvarez García",
      description:
        "Portfolio de Juan Esteban Álvarez García, estudiante de Ingeniería de Sistemas en la Universidad de los Andes: software, cloud/DevOps y seguridad aplicada.",
      cvDescription:
        "Perfil, experiencia, proyectos, stack y contacto de Juan Esteban Álvarez García en una sola página, lista para leer o imprimir.",
      ogImageAlt: "Placa madre sobre un banco de trabajo, vista desde arriba",
    });
    expect(en.site).toMatchObject({
      homeTitle: "Juan Esteban Álvarez García · Interactive portfolio",
      cvTitle: "Résumé · Juan Esteban Álvarez García",
      description:
        "Portfolio of Juan Esteban Álvarez García, Systems Engineering student at Universidad de los Andes: software, cloud/DevOps and applied security.",
      cvDescription:
        "Profile, experience, projects, stack and contact details of Juan Esteban Álvarez García on a single page, ready to read or print.",
      ogImageAlt: "Motherboard on a workbench, seen from above",
    });
    expect(es.site.sectionTitle({ title: "Perfil" })).toBe("Perfil · Juan Esteban Álvarez García");
    expect(en.site.sectionTitle({ title: "Profile" })).toBe(
      "Profile · Juan Esteban Álvarez García",
    );
  });
});
