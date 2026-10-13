import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({ locale: "es", pathname: "/es/" }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

import { FixedBar } from "./fixed-bar";

beforeEach(() => {
  navigation.locale = "es";
  navigation.pathname = "/es/";
});

describe("FixedBar", () => {
  it("SET-AC01: is a named navigation with the languages and the link to the simple view", () => {
    render(<FixedBar focusKey="bar" />);
    const bar = screen.getByRole("navigation", { name: "Controles del sitio" });

    const languages = within(bar).getByRole("group", { name: "Idioma" });
    expect(languages).toHaveTextContent("ESEspañol/ENEnglish");
    expect(within(bar).getByRole("link", { name: "Vista simple" })).toHaveAttribute(
      "href",
      "/es/cv/",
    );
  });

  it("keeps the open section when it offers the other language", () => {
    navigation.pathname = "/es/projects/";
    render(<FixedBar focusKey="bar" />);

    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/projects/");
  });

  it("uses the language of the page", () => {
    navigation.locale = "en";
    navigation.pathname = "/en/";
    render(<FixedBar focusKey="bar" />);

    const bar = screen.getByRole("navigation", { name: "Site controls" });
    expect(within(bar).getByRole("link", { name: "Simple view" })).toHaveAttribute(
      "href",
      "/en/cv/",
    );
    expect(within(bar).getByRole("link", { name: "Español" })).toHaveAttribute("href", "/es/");
  });
});
