import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { LOCALES } from "@/shared/contracts/locale";

import { SECTION_LIST } from "./registry";

const PANEL_SCOPE = "panel-";
const REGION_ELEMENTS = ["MAIN", "SECTION", "HEADER", "FOOTER", "NAV"];
/** Attributes that hold or reference an `id` (TSC-R31). */
const ID_ATTRIBUTES = /\b(id|aria-labelledby|aria-describedby|for)="panel-/g;

/** Renders the seven sections twice in one document: once per scope, as a section page does. */
function renderBothScopes(locale: (typeof LOCALES)[number]) {
  return render(
    <>
      {["", PANEL_SCOPE].map((idScope) =>
        SECTION_LIST.map(({ slug, Section }) => (
          <div key={`${idScope}${slug}`} data-scope={idScope} data-slug={slug}>
            <Section locale={locale} idScope={idScope} />
          </div>
        )),
      )}
    </>,
  );
}

describe.each(LOCALES)("sections rendered in one document (%s)", (locale) => {
  it("TSC-AC16: no id is repeated, and every id starts with the slug of its section", () => {
    const { container } = renderBothScopes(locale);
    const ids = [...container.querySelectorAll("[id]")].map((element) => element.id);
    expect(ids.length).toBeGreaterThan(0);
    expect(new Set(ids).size).toBe(ids.length);

    for (const wrapper of container.querySelectorAll<HTMLElement>('[data-scope=""]')) {
      const slug = wrapper.dataset["slug"] ?? "";
      for (const element of wrapper.querySelectorAll("[id]")) {
        expect(element.id.startsWith(`${slug}-`), element.id).toBe(true);
      }
    }
    for (const wrapper of container.querySelectorAll<HTMLElement>(
      `[data-scope="${PANEL_SCOPE}"]`,
    )) {
      const slug = wrapper.dataset["slug"] ?? "";
      for (const element of wrapper.querySelectorAll("[id]")) {
        expect(element.id.startsWith(`${PANEL_SCOPE}${slug}-`), element.id).toBe(true);
      }
    }
  });

  it("TSC-AC16: no section renders the section title or a region element as its root", () => {
    const { container } = renderBothScopes(locale);
    expect(container.querySelectorAll("h1, h2")).toHaveLength(0);
    const wrappers = [...container.querySelectorAll("[data-scope]")];
    expect(wrappers).toHaveLength(14);
    for (const wrapper of wrappers) {
      expect(wrapper.children).toHaveLength(1);
      expect(REGION_ELEMENTS).not.toContain(wrapper.firstElementChild?.tagName);
    }
  });

  it("TSC-AC17: a section renders the same HTML in both scopes, apart from the id prefix", () => {
    const { container } = renderBothScopes(locale);
    for (const { slug } of SECTION_LIST) {
      const base = container.querySelector(`[data-scope=""][data-slug="${slug}"]`);
      const panel = container.querySelector(`[data-scope="${PANEL_SCOPE}"][data-slug="${slug}"]`);
      expect(base?.innerHTML.length, slug).toBeGreaterThan(100);
      expect(panel?.innerHTML.replace(ID_ATTRIBUTES, '$1="'), slug).toBe(base?.innerHTML);
    }
  });
});
