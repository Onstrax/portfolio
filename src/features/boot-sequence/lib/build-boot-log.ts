import type { AnySectionDefinition, BootLine } from "@/shared/contracts/section";

export interface BootLogLine extends BootLine {
  /** Time mark in the style of `dmesg`, for example `[    0.312044]`. */
  readonly timestamp: string;
}

/** Fixed lines that open and close the log (BOOT-R07). */
export const BOOT_HEADER: readonly BootLine[] = [
  { message: "Booting portfolio kernel 1.0 (juan-esteban-alvarez-garcia)", status: "none" },
  { message: "Detecting hardware on motherboard...", status: "none" },
];
export const BOOT_FOOTER: readonly BootLine[] = [
  { message: "Starting graphical interface...", status: "ok" },
  { message: "Reached target portfolio.target", status: "ok" },
];

/** Text shown after the message of a line whose status is `ok` (BOOT-R10). */
export const BOOT_OK_TAG = "[  OK  ]";

/** Time that passes before each new line, in microseconds, used cyclically (BOOT-R09). */
const STEPS_US = [142_512, 169_532, 88_068, 189_090, 66_119, 65_229, 90_883];
const TIMESTAMP_WIDTH = 12;

/** Writes a time in microseconds as seconds with six decimals, between brackets. */
export function formatTimestamp(microseconds: number): string {
  const seconds = Math.floor(microseconds / 1_000_000);
  const fraction = String(microseconds % 1_000_000).padStart(6, "0");
  return `[${`${String(seconds)}.${fraction}`.padStart(TIMESTAMP_WIDTH)}]`;
}

/**
 * The boot log: the header, the lines of every section in the order received and the footer, each
 * with a synthetic and deterministic time mark (BOOT-R06, BOOT-R09). What it says is true, because
 * the lines of the sections come from the same data as the rest of the site.
 */
export function buildBootLog(sections: readonly AnySectionDefinition[]): readonly BootLogLine[] {
  const lines = [
    ...BOOT_HEADER,
    ...sections.flatMap((section) => section.bootLines),
    ...BOOT_FOOTER,
  ];
  let elapsed = 0;
  return lines.map((line, index) => {
    if (index > 0) elapsed += STEPS_US[(index - 1) % STEPS_US.length] ?? 0;
    return { ...line, timestamp: formatTimestamp(elapsed) };
  });
}
