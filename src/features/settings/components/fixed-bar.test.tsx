import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ locale: "es", pathname: "/es/" }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

import { SECTIONS } from "@/features/registry";
import { CV_FILES } from "@/shared/config/site";
import { buildQuickContacts } from "@/shared/lib/section-nav";

import { FixedBar } from "./fixed-bar";

const CONTACTS = buildQuickContacts(SECTIONS.contact.facts.channels, CV_FILES.es);

beforeEach(() => {
  navigation.locale = "es";
  navigation.pathname = "/es/";
});

describe("FixedBar", () => {
  it("SET-AC01: is a named navigation with the languages, the simple view and the contacts", () => {
    render(<FixedBar focusKey="bar" contacts={CONTACTS} />);
    const bar = screen.getByRole("navigation", { name: "Controles del sitio" });

    const languages = within(bar).getByRole("group", { name: "Idioma" });
    expect(languages).toHaveTextContent("ESEspañol/ENEnglish");
    expect(within(bar).getByRole("link", { name: "Vista simple" })).toHaveAttribute(
      "href",
      "/es/cv/",
    );
    // After the other language, in this order.
    expect(
      within(bar)
        .getAllByRole("link")
        .slice(1)
        .map((link) => link.getAttribute("aria-label") ?? link.textContent),
    ).toEqual([
      "Vista simple",
      "Descargar CV (PDF)",
      "Escribir un correo",
      "LinkedIn (se abre en una pestaña nueva)",
      "GitHub (se abre en una pestaña nueva)",
    ]);
  });

  it("SET-AC14: links the résumé, the mail, LinkedIn and GitHub, the last two in a new tab", () => {
    render(<FixedBar focusKey="bar" contacts={CONTACTS} />);
    const contacts = within(screen.getByRole("list")).getAllByRole("link");

    const [cv, email, linkedin, github] = contacts;
    expect(contacts).toHaveLength(4);
    expect(cv).toHaveAccessibleName("Descargar CV (PDF)");
    expect(cv).toHaveTextContent(/^CV$/);
    expect(cv).toHaveAttribute("href", "/cv/juan-esteban-alvarez-garcia-cv-es.pdf");
    expect(cv).toHaveAttribute("download");
    expect(cv).toHaveAttribute("type", "application/pdf");
    expect(email).toHaveAccessibleName("Escribir un correo");
    expect(email).toHaveAttribute("href", "mailto:juanalvarezgcl@gmail.com");
    for (const [link, name, href] of [
      [linkedin, "LinkedIn", "https://www.linkedin.com/in/juan-esteban-alvarez-garcia-21bb70364/"],
      [github, "GitHub", "https://github.com/Onstrax"],
    ] as const) {
      expect(link).toHaveAccessibleName(`${name} (se abre en una pestaña nueva)`);
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
    // The icons are decorative: the accessible name says what each link is (VIS-R40).
    for (const icon of screen.getByRole("list").querySelectorAll("svg")) {
      expect(icon).toHaveAttribute("aria-hidden", "true");
    }
  });

  it("names the contacts in the language of the page", () => {
    navigation.locale = "en";
    navigation.pathname = "/en/";
    render(
      <FixedBar
        focusKey="bar"
        contacts={buildQuickContacts(SECTIONS.contact.facts.channels, CV_FILES.en)}
      />,
    );
    const [cv, email, linkedin] = within(screen.getByRole("list")).getAllByRole("link");
    expect(cv).toHaveAccessibleName("Download résumé (PDF)");
    expect(cv).toHaveAttribute("href", "/cv/juan-esteban-alvarez-garcia-cv-en.pdf");
    expect(email).toHaveAccessibleName("Send an email");
    expect(linkedin).toHaveAccessibleName("LinkedIn (opens in a new tab)");
  });

  it("keeps the open section when it offers the other language", () => {
    navigation.pathname = "/es/projects/";
    render(<FixedBar focusKey="bar" contacts={CONTACTS} />);

    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/projects/");
  });

  it("uses the language of the page", () => {
    navigation.locale = "en";
    navigation.pathname = "/en/";
    render(<FixedBar focusKey="bar" contacts={CONTACTS} />);

    const bar = screen.getByRole("navigation", { name: "Site controls" });
    expect(within(bar).getByRole("link", { name: "Simple view" })).toHaveAttribute(
      "href",
      "/en/cv/",
    );
    expect(within(bar).getByRole("link", { name: "Español" })).toHaveAttribute("href", "/es/");
  });
});
