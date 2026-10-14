/** Link to an external origin. HTTPS only. */
export type ExternalUrl = `https://${string}`;
/** Mail link. */
export type MailtoUrl = `mailto:${string}@${string}`;
/** Path of a file served by the site itself (for example, a PDF in `public/`). */
export type SitePath = `/${string}`;
export type Href = ExternalUrl | MailtoUrl | SitePath;

/** Content link. Its visible text lives in the texts of the section, indexed by `id`. */
export interface LinkFact<Id extends string = string> {
  readonly id: Id;
  readonly href: Href;
}

export type Month = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;

/** Date with year or month precision. */
export interface PartialDate {
  readonly year: number;
  readonly month?: Month;
}

/** Time span. `"present"` means it is still ongoing. */
export interface Period {
  readonly start: PartialDate;
  readonly end: PartialDate | "present";
}

export type RepositoryVisibility = "public" | "private";

/** Number of people in the team, the author included. 1 means individual work. */
export type TeamSize = number;

/** Text with one emphasized fragment (TSC-R58). `emphasis` appears exactly once inside `text`. */
export interface EmphasizedText {
  readonly text: string;
  readonly emphasis: string;
}

/** A content element that may emphasize one fragment: a plain string or an `EmphasizedText`. */
export type RichLine = string | EmphasizedText;
