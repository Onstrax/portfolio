import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ViewSwitcher } from "./view-switcher";

describe("ViewSwitcher", () => {
  for (const surface of ["dark", "light"] as const) {
    it(`SET-AC15: marks the interactive view as current and links the simple one (${surface})`, () => {
      render(<ViewSwitcher locale="es" current="interactive" surface={surface} />);
      const group = screen.getByRole("group", { name: "Vista" });

      const current = within(group).getByText("Interactiva");
      expect(current.tagName).toBe("SPAN");
      expect(current).toHaveAttribute("aria-current", "true");
      expect(within(group).getByRole("link", { name: "Simple" })).toHaveAttribute(
        "href",
        "/es/cv/",
      );
      expect(within(group).getAllByRole("link")).toHaveLength(1);
    });

    it(`SET-AC15: marks the simple view as current and links the scene (${surface})`, () => {
      render(<ViewSwitcher locale="es" current="simple" surface={surface} />);
      const group = screen.getByRole("group", { name: "Vista" });

      expect(within(group).getByText("Simple")).toHaveAttribute("aria-current", "true");
      expect(within(group).getByRole("link", { name: "Interactiva" })).toHaveAttribute(
        "href",
        "/es/",
      );
    });
  }

  it("SET-AC15: puts the interactive view first, and speaks the language of the page", () => {
    render(<ViewSwitcher locale="en" current="simple" surface="light" />);
    const group = screen.getByRole("group", { name: "View" });
    expect(group).toHaveTextContent(/^InteractiveSimple$/);
    expect(within(group).getByRole("link", { name: "Interactive" })).toHaveAttribute(
      "href",
      "/en/",
    );
  });

  it("separates the options with a decorative slash only on a dark surface", () => {
    const { unmount } = render(<ViewSwitcher locale="es" current="interactive" surface="dark" />);
    expect(screen.getByText("/")).toHaveAttribute("aria-hidden", "true");
    unmount();

    render(<ViewSwitcher locale="es" current="interactive" surface="light" />);
    expect(screen.queryByText("/")).toBeNull();
  });
});
