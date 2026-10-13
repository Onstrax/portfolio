import { describe, expect, it } from "vitest";

import { SECTION_LIST } from "@/features/registry";

import {
  BOOT_FOOTER,
  BOOT_HEADER,
  BOOT_OK_TAG,
  buildBootLog,
  formatTimestamp,
} from "./build-boot-log";

const log = buildBootLog(SECTION_LIST);

describe("buildBootLog", () => {
  it("BOOT-AC01: puts the fixed lines first and last, and the lines of the sections between them", () => {
    const messages = log.map((line) => line.message);

    expect(messages.slice(0, 2)).toEqual([
      "Booting portfolio kernel 1.0 (juan-esteban-alvarez-garcia)",
      "Detecting hardware on motherboard...",
    ]);
    expect(messages.slice(-2)).toEqual([
      "Starting graphical interface...",
      "Reached target portfolio.target",
    ]);
    expect(messages.slice(2, -2)).toEqual(
      SECTION_LIST.flatMap((section) => section.bootLines.map((line) => line.message)),
    );
    expect(log.slice(0, 2).map((line) => line.status)).toEqual(["none", "none"]);
    expect(log.slice(-2).map((line) => line.status)).toEqual(["ok", "ok"]);
  });

  it("BOOT-AC01: keeps the order in which the sections are received", () => {
    const [first, second] = SECTION_LIST;
    if (first === undefined || second === undefined) throw new Error("The registry is empty");
    const reversed = buildBootLog([second, first]).map((line) => line.message);

    expect(reversed.slice(2, -2)).toEqual(
      [second, first].flatMap((section) => section.bootLines.map((line) => line.message)),
    );
  });

  it("BOOT-AC02: gives the first eight lines their synthetic time marks", () => {
    expect(log.slice(0, 8).map((line) => line.timestamp)).toEqual([
      "[    0.000000]",
      "[    0.142512]",
      "[    0.312044]",
      "[    0.400112]",
      "[    0.589202]",
      "[    0.655321]",
      "[    0.720550]",
      "[    0.811433]",
    ]);
  });

  it("uses the steps cyclically, so the ninth line repeats the first step", () => {
    expect(log[8]?.timestamp).toBe("[    0.953945]");
  });

  it("BOOT-AC03: the real log has 11 to 18 lines, one or two per section, of 72 characters at most", () => {
    expect(log.length).toBeGreaterThanOrEqual(11);
    expect(log.length).toBeLessThanOrEqual(18);
    for (const section of SECTION_LIST) {
      expect(section.bootLines.length, section.slug).toBeGreaterThanOrEqual(1);
      expect(section.bootLines.length, section.slug).toBeLessThanOrEqual(2);
    }
    for (const line of log) expect(line.message.length, line.message).toBeLessThanOrEqual(72);
  });

  it("with no sections, the log is the header and the footer", () => {
    expect(buildBootLog([]).map((line) => line.message)).toEqual(
      [...BOOT_HEADER, ...BOOT_FOOTER].map((line) => line.message),
    );
  });
});

describe("formatTimestamp", () => {
  it("writes seconds with six decimals, right-aligned to 12 characters between brackets", () => {
    expect(formatTimestamp(0)).toBe("[    0.000000]");
    expect(formatTimestamp(312_044)).toBe("[    0.312044]");
    expect(formatTimestamp(12_000_050)).toBe("[   12.000050]");
  });
});

describe("BOOT_OK_TAG", () => {
  it("is the mark of dmesg, with its two spaces on each side", () => {
    expect(BOOT_OK_TAG).toBe("[  OK  ]");
  });
});
