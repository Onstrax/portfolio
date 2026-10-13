import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const navigation = vi.hoisted(() => ({
  locale: "es",
  pathname: "/es/projects/",
  push: vi.fn<(href: string) => void>(),
}));

vi.mock("next/navigation", () => ({
  useParams: () => ({ locale: navigation.locale }),
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: navigation.push }),
}));

import { usePrefsStore } from "@/shared/state/prefs-store";

import { LanguageSwitcher } from "./language-switcher";

beforeEach(() => {
  navigation.locale = "es";
  navigation.pathname = "/es/projects/";
  navigation.push.mockReset();
  window.location.hash = "";
});

afterEach(() => {
  window.localStorage.clear();
});

describe("LanguageSwitcher", () => {
  it("offers one option per language, in order, inside a named group", () => {
    render(<LanguageSwitcher label="Idioma" focusKey="bar" />);
    const group = screen.getByRole("group", { name: "Idioma" });
    expect(group).toHaveTextContent("ESEspañol/ENEnglish");
    expect(within(group).getAllByRole("link")).toHaveLength(1);
  });

  it("marks the active language and links the other to the same section", () => {
    render(<LanguageSwitcher label="Idioma" focusKey="bar" />);

    const current = screen.getByText("Español").parentElement;
    expect(current).toHaveAttribute("aria-current", "true");
    expect(current).toHaveAttribute("lang", "es");
    expect(current?.tagName).toBe("SPAN");

    const link = screen.getByRole("link", { name: "English" });
    expect(link).toHaveAttribute("href", "/en/projects/");
    expect(link).toHaveAttribute("hreflang", "en");
    expect(link).toHaveAttribute("lang", "en");
  });

  it("stores the preference and navigates keeping the fragment", async () => {
    window.location.hash = "#projects-habicapital";
    render(<LanguageSwitcher label="Idioma" focusKey="bar" />);

    await userEvent.click(screen.getByRole("link", { name: "English" }));

    expect(usePrefsStore.getState().locale).toBe("en");
    expect(navigation.push).toHaveBeenCalledWith("/en/projects/#projects-habicapital");
  });

  it("returns focus to the active option of the switcher that started the change", async () => {
    const { unmount } = render(<LanguageSwitcher label="Idioma" focusKey="settings" />);
    await userEvent.click(screen.getByRole("link", { name: "English" }));
    unmount();

    navigation.locale = "en";
    navigation.pathname = "/en/projects/";
    render(
      <>
        <LanguageSwitcher label="Language" focusKey="bar" />
        <LanguageSwitcher label="Language" focusKey="settings" />
      </>,
    );

    const [, settingsSwitcher] = screen.getAllByRole("group", { name: "Language" });
    expect(settingsSwitcher).toBeDefined();
    if (settingsSwitcher === undefined) return;
    expect(within(settingsSwitcher).getByText("English").parentElement).toHaveFocus();
  });

  it("does not take focus when the page simply loads", () => {
    render(<LanguageSwitcher label="Idioma" focusKey="fresh" />);
    expect(document.body).toHaveFocus();
  });

  it("leads an unknown path to the home of the other language", () => {
    navigation.pathname = "/es/unknown/";
    render(<LanguageSwitcher label="Idioma" focusKey="bar" />);
    expect(screen.getByRole("link", { name: "English" })).toHaveAttribute("href", "/en/");
  });
});
