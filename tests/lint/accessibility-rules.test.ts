import { beforeAll, describe, expect, it, vi } from "vitest";

import { HOST, lintSnippet, WARM_UP_TIMEOUT, warmUp } from "./lint";

vi.setConfig({ testTimeout: 30_000 });
beforeAll(warmUp, WARM_UP_TIMEOUT);

/** One snippet that breaks each accessibility rule required by TST-R16. */
const INVALID_JSX: Readonly<Record<string, string>> = {
  "alt-text": '<img src="/board.png" />',
  "anchor-has-content": '<a href="/es/" />',
  "anchor-is-valid": '<a href="#" aria-label="menu" />',
  "aria-activedescendant-has-tabindex": '<div aria-activedescendant="option-1" />',
  "aria-props": '<div aria-labeledby="title" />',
  "aria-proptypes": '<div aria-hidden="yes" />',
  "aria-role": '<div role="datepicker" />',
  "aria-unsupported-elements": '<meta charSet="utf-8" aria-hidden="false" />',
  "click-events-have-key-events": "<div onClick={noop} />",
  "heading-has-content": "<h1 />",
  "html-has-lang": "<html />",
  "iframe-has-title": '<iframe src="/es/" />',
  "img-redundant-alt": '<img src="/board.png" alt="Photo of a board" />',
  "interactive-supports-focus": '<div role="button" onClick={noop} onKeyDown={noop} />',
  "label-has-associated-control": "<label />",
  "mouse-events-have-key-events": "<div onMouseOver={noop} />",
  "no-access-key": '<button type="button" accessKey="s" />',
  "no-autofocus": "<input autoFocus />",
  "no-distracting-elements": "<marquee />",
  "no-interactive-element-to-noninteractive-role": '<button type="button" role="img" />',
  "no-noninteractive-element-interactions": "<li onClick={noop} onKeyDown={noop} />",
  "no-noninteractive-element-to-interactive-role": '<li role="button" />',
  "no-noninteractive-tabindex": "<div tabIndex={0} />",
  "no-redundant-roles": '<button type="button" role="button" />',
  "no-static-element-interactions": "<div onClick={noop} onKeyDown={noop} />",
  "role-has-required-aria-props": '<div role="checkbox" tabIndex={0} />',
  "role-supports-aria-props": '<a href="/es/" aria-checked="true" />',
  scope: '<div scope="col" />',
  "tabindex-no-positive": "<div tabIndex={2} />",
};

function component(jsx: string): string {
  return `function noop(): void {\n  return undefined;\n}\n\nexport default function Sample() {\n  return ${jsx};\n}\n`;
}

describe("ESLint configuration: accessibility rules", () => {
  it("covers the 29 rules of TST-R16", () => {
    expect(Object.keys(INVALID_JSX)).toHaveLength(29);
  });

  it.each(Object.entries(INVALID_JSX))("TST-AC05: reports jsx-a11y/%s", async (rule, jsx) => {
    expect(await lintSnippet(component(jsx), HOST.layout)).toContain(`jsx-a11y/${rule}`);
  });

  it("accepts an accessible equivalent", async () => {
    expect(
      await lintSnippet(component('<button type="button" onClick={noop} />'), HOST.layout),
    ).toEqual([]);
  });
});
