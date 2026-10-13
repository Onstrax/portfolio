import { act, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

import { readRenderMode, useRenderMode } from "./use-render-mode";

/** Replaces `matchMedia` with a query whose result the test controls. */
function stubMatchMedia(initial: boolean) {
  const listeners = new Set<() => void>();
  const state = { matches: initial };
  const queries: string[] = [];
  vi.stubGlobal("matchMedia", (query: string) => {
    queries.push(query);
    return {
      get matches() {
        return state.matches;
      },
      addEventListener: (_type: string, listener: () => void) => listeners.add(listener),
      removeEventListener: (_type: string, listener: () => void) => listeners.delete(listener),
    };
  });
  return {
    queries,
    listeners,
    set(matches: boolean) {
      state.matches = matches;
      for (const listener of listeners) listener();
    },
  };
}

function Probe() {
  return <output>{useRenderMode()}</output>;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useRenderMode", () => {
  it("SYS-AC05: is scene when the viewport matches the query of the scene, simple otherwise", () => {
    const media = stubMatchMedia(true);
    const { unmount } = render(<Probe />);
    expect(screen.getByRole("status")).toHaveTextContent("scene");
    expect(new Set(media.queries)).toEqual(
      new Set(["(min-width: 1024px) and (min-height: 600px)"]),
    );
    unmount();

    stubMatchMedia(false);
    render(<Probe />);
    expect(screen.getByRole("status")).toHaveTextContent("simple");
  });

  it("SYS-AC07: follows the viewport when it crosses the threshold, in both directions", () => {
    const media = stubMatchMedia(true);
    render(<Probe />);

    act(() => {
      media.set(false);
    });
    expect(screen.getByRole("status")).toHaveTextContent("simple");

    act(() => {
      media.set(true);
    });
    expect(screen.getByRole("status")).toHaveTextContent("scene");
  });

  it("stops listening when the component unmounts", () => {
    const media = stubMatchMedia(true);
    const { unmount } = render(<Probe />);
    expect(media.listeners.size).toBe(1);

    unmount();
    expect(media.listeners.size).toBe(0);
  });

  it("reads the mode of the viewport at any moment, outside React", () => {
    const media = stubMatchMedia(true);
    expect(readRenderMode()).toBe("scene");
    media.set(false);
    expect(readRenderMode()).toBe("simple");
  });

  it("is simple on the server, where there is no viewport", () => {
    expect(renderToString(<Probe />)).toContain("simple");
  });
});
