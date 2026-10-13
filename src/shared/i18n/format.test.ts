import { afterEach, describe, expect, it } from "vitest";

import type { Period } from "@/shared/contracts/content";

import {
  formatDecimal,
  formatPartialDate,
  formatPeriod,
  formatTeamSize,
  PERIOD_SEPARATOR,
  toIsoDate,
} from "./format";

const NBSP = " ";
const DASH = "–";

const FREELANCE: Period = { start: { year: 2024, month: 7 }, end: { year: 2025, month: 1 } };
const EXCHANGE: Period = { start: { year: 2025, month: 2 }, end: { year: 2025, month: 7 } };
const ONGOING: Period = { start: { year: 2026, month: 1 }, end: "present" };
const YEARS: Period = { start: { year: 2022 }, end: { year: 2024 } };
const SINGLE_MONTH: Period = { start: { year: 2025, month: 5 }, end: { year: 2025, month: 5 } };
const SINGLE_YEAR: Period = { start: { year: 2027 }, end: { year: 2027 } };

function formatEverything(): readonly string[] {
  return [
    formatPeriod(FREELANCE, "es"),
    formatPeriod(EXCHANGE, "en"),
    formatPeriod(ONGOING, "es"),
    formatPartialDate({ year: 2021, month: 6 }, "en"),
    toIsoDate({ year: 2024, month: 7 }),
    formatDecimal(4.2, "es", 1),
  ];
}

const originalTimeZone = process.env["TZ"];

afterEach(() => {
  process.env["TZ"] = originalTimeZone;
});

describe("formatPeriod", () => {
  it("I18N-AC04: writes both ends in full when the years differ", () => {
    expect(formatPeriod(FREELANCE, "es")).toBe(`Jul. 2024${NBSP}${DASH} ene. 2025`);
    expect(formatPeriod(FREELANCE, "en")).toBe(`Jul. 2024${NBSP}${DASH} Jan. 2025`);
  });

  it("I18N-AC04: writes the year once when both months fall in the same year", () => {
    expect(formatPeriod(EXCHANGE, "es")).toBe(`Feb.${NBSP}${DASH} jul. 2025`);
    expect(formatPeriod(EXCHANGE, "en")).toBe(`Feb.${NBSP}${DASH} Jul. 2025`);
  });

  it("I18N-AC04: uses the word for the present when the period is ongoing", () => {
    expect(formatPeriod(ONGOING, "es")).toBe(`Ene. 2026${NBSP}${DASH} actualidad`);
    expect(formatPeriod(ONGOING, "en")).toBe(`Jan. 2026${NBSP}${DASH} present`);
  });

  it("I18N-AC04: formats periods without months", () => {
    expect(formatPeriod(YEARS, "es")).toBe(`2022${NBSP}${DASH} 2024`);
    expect(formatPeriod(YEARS, "en")).toBe(`2022${NBSP}${DASH} 2024`);
  });

  it("I18N-AC04: shows a single date when both ends are equal", () => {
    expect(formatPeriod(SINGLE_MONTH, "es")).toBe("May. 2025");
    expect(formatPeriod(SINGLE_MONTH, "en")).toBe("May 2025");
    expect(formatPeriod(SINGLE_YEAR, "es")).toBe("2027");
    expect(formatPeriod(SINGLE_YEAR, "en")).toBe("2027");
  });

  it("uses a non-breaking space, an en dash and a normal space as separator", () => {
    expect(PERIOD_SEPARATOR).toBe(`${NBSP}${DASH} `);
  });
});

describe("formatPartialDate", () => {
  it("I18N-AC04: writes Spanish months in lower case unless asked to capitalize", () => {
    expect(formatPartialDate({ year: 2021, month: 6 }, "es")).toBe("jun. 2021");
    expect(formatPartialDate({ year: 2021, month: 6 }, "es", { capitalize: true })).toBe(
      "Jun. 2021",
    );
  });

  it("I18N-AC04: always capitalizes English months", () => {
    expect(formatPartialDate({ year: 2021, month: 6 }, "en")).toBe("Jun. 2021");
    expect(formatPartialDate({ year: 2021, month: 6 }, "en", { capitalize: true })).toBe(
      "Jun. 2021",
    );
  });

  it("writes only the year when there is no month", () => {
    expect(formatPartialDate({ year: 2027 }, "es")).toBe("2027");
  });
});

describe("toIsoDate", () => {
  it("I18N-AC04: gives year and month, or only the year", () => {
    expect(toIsoDate({ year: 2024, month: 7 })).toBe("2024-07");
    expect(toIsoDate({ year: 2024, month: 11 })).toBe("2024-11");
    expect(toIsoDate({ year: 2027 })).toBe("2027");
  });
});

describe("formatDecimal", () => {
  it("I18N-AC04: uses a decimal comma in Spanish and a point in English", () => {
    expect(formatDecimal(4.2, "es", 1)).toBe("4,2");
    expect(formatDecimal(4.2, "en", 1)).toBe("4.2");
    expect(formatDecimal(5, "es", 1)).toBe("5,0");
    expect(formatDecimal(5, "en", 1)).toBe("5.0");
  });
});

describe("formatTeamSize", () => {
  it("I18N-AC04: names individual work and teams", () => {
    expect(formatTeamSize(1, "es")).toBe("Trabajo individual");
    expect(formatTeamSize(1, "en")).toBe("Individual work");
    expect(formatTeamSize(6, "es")).toBe("Equipo de 6");
    expect(formatTeamSize(6, "en")).toBe("Team of 6");
  });
});

describe("time zones", () => {
  it("I18N-AC05: gives the same results in Bogotá, UTC and Tokyo", () => {
    const results = ["America/Bogota", "UTC", "Asia/Tokyo"].map((timeZone) => {
      process.env["TZ"] = timeZone;
      return formatEverything();
    });
    expect(results[1]).toEqual(results[0]);
    expect(results[2]).toEqual(results[0]);
  });
});
