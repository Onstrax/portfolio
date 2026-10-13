import { beforeAll, describe, expect, it, vi } from "vitest";

import { HOST, lintSnippet, WARM_UP_TIMEOUT, warmUp } from "./lint";

vi.setConfig({ testTimeout: 30_000 });
beforeAll(warmUp, WARM_UP_TIMEOUT);

function component(jsx: string): string {
  return `export default function Sample() {\n  return ${jsx};\n}\n`;
}

describe("ESLint configuration: interface text", () => {
  it("I18N-AC08: reports text written by hand inside a JSX element", async () => {
    expect(await lintSnippet(component("<p>Download the résumé</p>"), HOST.layout)).toContain(
      "react/jsx-no-literals",
    );
    expect(await lintSnippet(component('<p>{"Download the résumé"}</p>'), HOST.layout)).toContain(
      "react/jsx-no-literals",
    );
  });

  it.each(["·", "–", "—", "/", ":", "(", ")", ",", ".", "+"])(
    "I18N-AC08: accepts the separator %s",
    async (separator) => {
      const jsx = `<p>\n      <span />\n      ${separator}\n      <span />\n    </p>`;
      expect(await lintSnippet(component(jsx), HOST.layout)).not.toContain("react/jsx-no-literals");
    },
  );

  it("I18N-AC08: accepts text that comes from a variable and literal props", async () => {
    const code =
      'export default function Sample({ label }: { readonly label: string }) {\n  return <p className="font-mono">{label}</p>;\n}\n';
    expect(await lintSnippet(code, HOST.layout)).toEqual([]);
  });
});
