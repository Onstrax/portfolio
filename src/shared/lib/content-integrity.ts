// Content checks that the type system cannot express (TSC §4.8). Pure functions: the rules run
// over the facts, texts and boot lines of the sections, and the string rules are reused for the
// interface dictionaries (I18N-R48).
import type { SectionSlug } from "@/shared/contracts/ids";
import { LOCALES } from "@/shared/contracts/locale";
import type { AnySectionDefinition } from "@/shared/contracts/section";

export const CONTENT_RULES = [
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
  "C9",
  "C10",
  "C11",
  "C12",
  "C13",
] as const;
export type ContentRule = (typeof CONTENT_RULES)[number];

export interface StringIssue {
  readonly rule: ContentRule;
  readonly detail: string;
}

export interface ContentIssue extends StringIssue {
  readonly section: SectionSlug;
  /** Where the data is, for example `text.es.summary[0]` or `facts.projects[2].teamSize`. */
  readonly path: string;
}

const MAX_TITLE_LENGTH = 40;
const DESCRIPTION_LENGTH = { min: 50, max: 160 } as const;
const MAX_BOOT_MESSAGE_LENGTH = 96;
const YEAR_RANGE = { min: 2000, max: 2100 } as const;
const UNTRANSLATED_MIN_WORDS = 5;
const UPPERCASE_MIN_WORDS = 3;
const KEBAB_CASE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MARKUP_FRAGMENTS = ["<", ">", "`", "**", "__", "\n"] as const;

type UnknownRecord = Readonly<Record<string, unknown>>;

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** `true` for an `EmphasizedText`: an object with exactly the string fields `text` and `emphasis`. */
function isEmphasizedText(
  value: unknown,
): value is { readonly text: string; readonly emphasis: string } {
  if (!isRecord(value)) return false;
  const keys = Object.keys(value).sort();
  return (
    keys.join(",") === "emphasis,text" &&
    typeof value["text"] === "string" &&
    typeof value["emphasis"] === "string"
  );
}

/** Rule C13: the fragment exists, is not the whole text and appears exactly once in it. */
function checkEmphasis(text: string, emphasis: string, path: string, report: Report): void {
  if (emphasis === "") {
    report(path, "C13", "the emphasized fragment is empty");
    return;
  }
  if (emphasis === text) {
    report(path, "C13", "the emphasized fragment is the whole text");
    return;
  }
  const occurrences = text.split(emphasis).length - 1;
  if (occurrences !== 1) {
    report(
      path,
      "C13",
      `the emphasized fragment appears ${String(occurrences)} times in the text instead of once`,
    );
  }
}

function wordCount(value: string): number {
  return value.split(/\s+/).filter((word) => word !== "").length;
}

function digitRuns(value: string): readonly string[] {
  return [...value.matchAll(/\d+/g)].map((match) => match[0]).sort();
}

/** Rules C2, C3 and C12: clean, plain and not shouted. */
export function findStringIssues(value: string): readonly StringIssue[] {
  const issues: StringIssue[] = [];
  if (value === "") {
    issues.push({ rule: "C2", detail: "the string is empty" });
  } else if (value !== value.trim() || value.includes("  ")) {
    issues.push({ rule: "C2", detail: "leading, trailing or repeated spaces" });
  }
  const markup = MARKUP_FRAGMENTS.find((fragment) => value.includes(fragment));
  if (markup !== undefined) {
    issues.push({
      rule: "C3",
      detail: `contains ${JSON.stringify(markup)}: content strings are plain text`,
    });
  }
  const isUppercase = value === value.toUpperCase() && value !== value.toLowerCase();
  if (isUppercase && wordCount(value) >= UPPERCASE_MIN_WORDS) {
    issues.push({ rule: "C12", detail: "written in capitals: upper case is applied with CSS" });
  }
  return issues;
}

/** Rules C4 and C5: the same figures in both languages, and no text left untranslated. */
export function findTranslationIssues(first: string, second: string): readonly StringIssue[] {
  const issues: StringIssue[] = [];
  const firstDigits = digitRuns(first);
  const secondDigits = digitRuns(second);
  if (firstDigits.join(" ") !== secondDigits.join(" ")) {
    issues.push({
      rule: "C4",
      detail: `different figures: [${firstDigits.join(", ")}] and [${secondDigits.join(", ")}]`,
    });
  }
  if (first === second && wordCount(first) >= UNTRANSLATED_MIN_WORDS) {
    issues.push({ rule: "C5", detail: "identical in both languages: it looks untranslated" });
  }
  return issues;
}

type Report = (path: string, rule: ContentRule, detail: string) => void;

/** Calls `visitor` for a value and for everything nested inside it. */
function visit(
  value: unknown,
  path: string,
  visitor: (value: unknown, path: string) => void,
): void {
  visitor(value, path);
  if (Array.isArray(value)) {
    value.forEach((item: unknown, index) => {
      visit(item, `${path}[${String(index)}]`, visitor);
    });
  } else if (isRecord(value)) {
    for (const [key, item] of Object.entries(value)) {
      visit(item, `${path}.${key}`, visitor);
    }
  }
}

function describeKind(value: unknown): string {
  if (Array.isArray(value)) return "array";
  return value === null ? "null" : typeof value;
}

/** Rule C1 plus the paired string rules: walks two translations of the same text side by side. */
function compareTranslations(first: unknown, second: unknown, path: string, report: Report): void {
  if (Array.isArray(first) && Array.isArray(second)) {
    if (first.length !== second.length) {
      report(
        path,
        "C1",
        `${String(first.length)} elements in one language and ${String(second.length)} in the other`,
      );
    }
    first.slice(0, second.length).forEach((item: unknown, index) => {
      compareTranslations(item, second[index], `${path}[${String(index)}]`, report);
    });
    return;
  }
  if (isEmphasizedText(first) !== isEmphasizedText(second)) {
    report(path, "C13", "the line is emphasized in one language and plain in the other");
    return;
  }
  if (isRecord(first) && isRecord(second)) {
    for (const key of new Set([...Object.keys(first), ...Object.keys(second)])) {
      if (!(key in first) || !(key in second)) {
        report(`${path}.${key}`, "C1", "the key exists in only one language");
        continue;
      }
      compareTranslations(first[key], second[key], `${path}.${key}`, report);
    }
    return;
  }
  if (typeof first === "string" && typeof second === "string") {
    for (const issue of findTranslationIssues(first, second)) {
      report(path, issue.rule, issue.detail);
    }
    return;
  }
  if (describeKind(first) !== describeKind(second)) {
    report(
      path,
      "C1",
      `${describeKind(first)} in one language and ${describeKind(second)} in the other`,
    );
  }
}

function checkMeta(meta: unknown, path: string, report: Report): void {
  const { title, hardwareName, description } = isRecord(meta) ? meta : {};
  if (typeof title !== "string" || title === "" || title.length > MAX_TITLE_LENGTH) {
    report(
      `${path}.title`,
      "C6",
      `the title must have between 1 and ${String(MAX_TITLE_LENGTH)} characters`,
    );
  }
  if (typeof hardwareName !== "string" || hardwareName === "") {
    report(`${path}.hardwareName`, "C6", "the hardware name must not be empty");
  }
  if (
    typeof description !== "string" ||
    description.length < DESCRIPTION_LENGTH.min ||
    description.length > DESCRIPTION_LENGTH.max
  ) {
    report(
      `${path}.description`,
      "C6",
      `the description must have between ${String(DESCRIPTION_LENGTH.min)} and ${String(DESCRIPTION_LENGTH.max)} characters`,
    );
  }
}

function checkLink(value: string, path: string, report: Report): void {
  if (value.startsWith("http://")) {
    report(path, "C7", "links must use https");
  } else if (value.startsWith("https://") && !URL.canParse(value)) {
    report(path, "C7", "the URL is not valid");
  } else if (value.startsWith("mailto:") && value.split("@").length !== 2) {
    report(path, "C7", "a mail link must contain exactly one @");
  }
}

function checkIdentifiers(items: readonly unknown[], path: string, report: Report): void {
  const seen = new Set<unknown>();
  items.forEach((item, index) => {
    if (!isRecord(item) || !("id" in item)) return;
    const { id } = item;
    const itemPath = `${path}[${String(index)}].id`;
    if (typeof id !== "string" || !KEBAB_CASE.test(id)) {
      report(itemPath, "C8", "identifiers are written in kebab-case");
    }
    if (seen.has(id)) report(itemPath, "C8", `the identifier ${JSON.stringify(id)} is repeated`);
    seen.add(id);
  });
}

interface DateParts {
  readonly year: number;
  readonly month: number | undefined;
}

function readDate(value: unknown): DateParts | null {
  if (!isRecord(value)) return null;
  const { year, month } = value;
  if (typeof year !== "number" || !Number.isInteger(year)) return null;
  if (month === undefined) return { year, month: undefined };
  if (typeof month !== "number" || !Number.isInteger(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function checkPeriod(period: UnknownRecord, path: string, report: Report): void {
  const start = readDate(period["start"]);
  const end = period["end"] === "present" ? "present" : readDate(period["end"]);
  if (start === null || end === null) {
    report(
      path,
      "C9",
      "start and end must be dates with a year and an optional month from 1 to 12",
    );
    return;
  }
  const years = end === "present" ? [start.year] : [start.year, end.year];
  if (years.some((year) => year < YEAR_RANGE.min || year > YEAR_RANGE.max)) {
    report(
      path,
      "C9",
      `years must be between ${String(YEAR_RANGE.min)} and ${String(YEAR_RANGE.max)}`,
    );
  }
  if (end === "present") return;
  if ((start.month === undefined) !== (end.month === undefined)) {
    report(path, "C9", "both ends of a period must have the same precision");
  }
  const startsAfterEnd =
    start.year > end.year || (start.year === end.year && (start.month ?? 0) > (end.month ?? 0));
  if (startsAfterEnd) report(path, "C9", "the start is later than the end");
}

function checkBootLines(lines: readonly unknown[], report: Report): void {
  lines.forEach((line, index) => {
    const message: unknown = isRecord(line) ? line["message"] : undefined;
    const path = `bootLines[${String(index)}].message`;
    if (typeof message !== "string" || message === "" || message.includes("\n")) {
      report(path, "C11", "a boot message is a single non-empty line");
    } else if (message.length > MAX_BOOT_MESSAGE_LENGTH) {
      report(
        path,
        "C11",
        `${String(message.length)} characters; the limit is ${String(MAX_BOOT_MESSAGE_LENGTH)}`,
      );
    }
  });
}

/**
 * Returns one issue for every breach of rules C1 to C13 in the given sections (TSC-R44).
 * An empty list means the content is sound.
 */
export function findContentIssues(
  sections: readonly AnySectionDefinition[],
): readonly ContentIssue[] {
  const issues: ContentIssue[] = [];
  const [referenceLocale, ...otherLocales] = LOCALES;

  for (const section of sections) {
    const report: Report = (path, rule, detail) => {
      issues.push({ section: section.slug, path, rule, detail });
    };
    const checkValue = (value: unknown, path: string): void => {
      if (typeof value === "string") {
        for (const issue of findStringIssues(value)) report(path, issue.rule, issue.detail);
      }
      if (Array.isArray(value)) checkIdentifiers(value, path, report);
      if (isEmphasizedText(value)) checkEmphasis(value.text, value.emphasis, path, report);
      if (!isRecord(value)) return;
      if ("start" in value && "end" in value) checkPeriod(value, path, report);
      if ("teamSize" in value) {
        const { teamSize } = value;
        if (typeof teamSize !== "number" || !Number.isInteger(teamSize) || teamSize < 1) {
          report(`${path}.teamSize`, "C10", "the team size is an integer of 1 or more");
        }
      }
    };

    visit(section.facts, "facts", (value, path) => {
      checkValue(value, path);
      if (typeof value === "string") checkLink(value, path, report);
    });
    for (const locale of LOCALES) {
      visit(section.text[locale], `text.${locale}`, checkValue);
      checkMeta(section.text[locale].meta, `text.${locale}.meta`, report);
    }
    for (const locale of otherLocales) {
      compareTranslations(section.text[referenceLocale], section.text[locale], "text", report);
    }
    visit(section.bootLines, "bootLines", (value, path) => {
      if (typeof value !== "string" || !path.endsWith(".message")) return;
      for (const issue of findStringIssues(value)) {
        if (issue.rule !== "C2" || value !== "") report(path, issue.rule, issue.detail);
      }
    });
    checkBootLines(section.bootLines, report);
  }
  return issues;
}

export function formatContentIssues(issues: readonly ContentIssue[]): string {
  return issues
    .map((issue) => `${issue.section} ${issue.path} [${issue.rule}] ${issue.detail}`)
    .join("\n");
}
