import { renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const params = vi.hoisted((): { current: Record<string, string> } => ({ current: {} }));

vi.mock("next/navigation", () => ({ useParams: () => params.current }));

import { useLocale } from "./use-locale";
import { useUiDictionary } from "./use-ui-dictionary";

beforeEach(() => {
  params.current = {};
});

describe("useLocale", () => {
  it("reads the language from the locale segment of the route", () => {
    params.current = { locale: "es" };
    expect(renderHook(() => useLocale()).result.current).toBe("es");
  });

  it("falls back to English when the segment is missing or unknown", () => {
    expect(renderHook(() => useLocale()).result.current).toBe("en");
    params.current = { locale: "de" };
    expect(renderHook(() => useLocale()).result.current).toBe("en");
  });
});

describe("useUiDictionary", () => {
  it("returns the dictionary of the language of the page", () => {
    params.current = { locale: "es" };
    expect(renderHook(() => useUiDictionary()).result.current.panel.closeAriaLabel).toBe("Cerrar");
    params.current = { locale: "en" };
    expect(renderHook(() => useUiDictionary()).result.current.panel.closeAriaLabel).toBe("Close");
  });
});
