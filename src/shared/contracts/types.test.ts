import { describe, expect, it } from "vitest";

import type { Href, Period } from "./content";
import type { ComponentOf, SectionSlug } from "./ids";
import type { Locale } from "./locale";
import type { SectionDefinition, SectionTextBase } from "./section";

const META = { title: "Projects", hardwareName: "NVMe SSD", description: "A summary." };
const TEXT = { es: { meta: META }, en: { meta: META } };

function definition<D extends SectionDefinition<"ssd", null, SectionTextBase>>(value: D): D {
  return value;
}

describe("contracts reject invalid content at compile time", () => {
  it("TSC-AC05: a definition cannot use the slug of another component", () => {
    const valid = definition({
      componentId: "ssd",
      slug: "projects",
      facts: null,
      text: TEXT,
      bootLines: [],
      Section: () => null,
    });
    definition({
      componentId: "ssd",
      // @ts-expect-error -- "stack" is the slug of the ram component, not of ssd
      slug: "stack",
      facts: null,
      text: TEXT,
      bootLines: [],
      Section: () => null,
    });
    expect(valid.slug).toBe("projects");
  });

  it("TSC-AC05: a registry cannot hold a section under the slug of another component", () => {
    type Registry = {
      readonly [S in SectionSlug]?: { readonly componentId: ComponentOf<S> };
    };
    const valid: Registry = { projects: { componentId: "ssd" } };
    const invalid: Registry = {
      // @ts-expect-error -- the stack section is opened by ram, not by ssd
      stack: { componentId: "ssd" },
    };
    expect(Object.keys(valid)).toEqual(["projects"]);
    expect(Object.keys(invalid)).toEqual(["stack"]);
  });

  it("TSC-AC05: texts indexed by identifier need every element in every language", () => {
    type ProjectId = "thesis" | "andespace";
    type ProjectNames = Readonly<Record<Locale, Readonly<Record<ProjectId, string>>>>;
    const valid: ProjectNames = {
      es: { thesis: "Tesis", andespace: "AndeSpace" },
      en: { thesis: "Thesis", andespace: "AndeSpace" },
    };
    const invalid: ProjectNames = {
      es: { thesis: "Tesis", andespace: "AndeSpace" },
      // @ts-expect-error -- the English text of "andespace" is missing
      en: { thesis: "Thesis" },
    };
    expect(Object.keys(valid.en)).toHaveLength(2);
    expect(Object.keys(invalid.en)).toHaveLength(1);
  });

  it("TSC-AC05: a link cannot use plain http", () => {
    const valid: Href = "https://github.com/Onstrax";
    // @ts-expect-error -- only https, mailto and site paths are links
    const invalid: Href = "http://github.com/Onstrax";
    expect(valid.startsWith("https://")).toBe(true);
    expect(invalid.startsWith("https://")).toBe(false);
  });

  it("TSC-AC05: a period cannot have month 13", () => {
    const valid: Period = { start: { year: 2024, month: 7 }, end: "present" };
    const invalid: Period = {
      // @ts-expect-error -- months go from 1 to 12
      start: { year: 2024, month: 13 },
      end: "present",
    };
    expect(valid.start.month).toBe(7);
    expect(invalid.start.month).toBe(13);
  });
});
