import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { PeriodText } from "./period-text";

const NBSP = " ";

function times(container: HTMLElement): readonly (readonly [string | null, string | null])[] {
  return [...container.querySelectorAll("time")].map((element) => [
    element.getAttribute("datetime"),
    element.textContent,
  ]);
}

describe("PeriodText", () => {
  it("wraps both dates of a period in time elements", () => {
    const { container } = render(
      <PeriodText
        period={{ start: { year: 2025, month: 2 }, end: { year: 2025, month: 7 } }}
        locale="es"
      />,
    );
    expect(container.textContent).toBe(`Feb.${NBSP}– jul. 2025`);
    expect(times(container)).toEqual([
      ["2025-02", "Feb."],
      ["2025-07", "jul. 2025"],
    ]);
  });

  it("leaves the word for the present outside a time element", () => {
    const { container } = render(
      <PeriodText period={{ start: { year: 2022, month: 1 }, end: "present" }} locale="en" />,
    );
    expect(container.textContent).toBe(`Jan. 2022${NBSP}– present`);
    expect(times(container)).toEqual([["2022-01", "Jan. 2022"]]);
  });

  it("renders a single time element when both ends are the same date", () => {
    const { container } = render(
      <PeriodText period={{ start: { year: 2027 }, end: { year: 2027 } }} locale="es" />,
    );
    expect(container).toHaveTextContent("2027");
    expect(times(container)).toEqual([["2027", "2027"]]);
  });

  it("formats periods given in years", () => {
    const { container } = render(
      <PeriodText period={{ start: { year: 2014 }, end: { year: 2019 } }} locale="es" />,
    );
    expect(container.textContent).toBe(`2014${NBSP}– 2019`);
    expect(times(container)).toEqual([
      ["2014", "2014"],
      ["2019", "2019"],
    ]);
  });
});
