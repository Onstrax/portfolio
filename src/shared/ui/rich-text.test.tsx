import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RichText } from "./rich-text";

describe("RichText", () => {
  it("TSC-AC21: renders a plain string without emphasis", () => {
    const { container } = render(
      <p>
        <RichText line="Mantenimiento continuo desde su publicación." />
      </p>,
    );
    expect(container.textContent).toBe("Mantenimiento continuo desde su publicación.");
    expect(container.querySelectorAll("strong")).toHaveLength(0);
  });

  it("TSC-AC21: wraps the emphasized fragment, and only it, in a strong element", () => {
    const { container } = render(
      <p>
        <RichText
          line={{
            text: "Acompaño a ~30 estudiantes de Diseño de Productos.",
            emphasis: "~30 estudiantes",
          }}
        />
      </p>,
    );
    const strong = container.querySelectorAll("strong");
    expect(strong).toHaveLength(1);
    expect(strong[0]?.textContent).toBe("~30 estudiantes");
    expect(container.textContent).toBe("Acompaño a ~30 estudiantes de Diseño de Productos.");
  });

  it("TSC-AC21: places the fragment at the start or the end without adding spaces", () => {
    const { container } = render(
      <ul>
        <li>
          <RichText line={{ text: "Best Project in its section.", emphasis: "Best Project" }} />
        </li>
        <li>
          <RichText
            line={{ text: "Runtime fell to under half a second", emphasis: "under half a second" }}
          />
        </li>
      </ul>,
    );
    const items = [...container.querySelectorAll("li")];
    // Classes do not matter here: only where the element starts and ends.
    expect(items.map((item) => item.innerHTML.replaceAll(/ class="[^"]*"/g, ""))).toEqual([
      "<strong>Best Project</strong> in its section.",
      "Runtime fell to <strong>under half a second</strong>",
    ]);
  });
});
