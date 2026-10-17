/**
 * Typographic roles of the content, in steps that are clearly apart so a page can be skimmed
 * (VIS §4.2, VIS-R47). Each heading is larger than the text it heads.
 */

/** "Vista simple, nombre": the `<h1>` of a plain page. */
export const PAGE_NAME = "font-mono text-4xl leading-10 font-semibold";

/** "Vista simple, título de sección": the `<h2>` of each section of a plain page. */
export const PAGE_SECTION_TITLE =
  "font-mono text-3xl leading-9 font-semibold tracking-[0.06em] uppercase";

/** "Título de panel": the `<h2>` of the detail panel, and the name in the profile. */
export const PANEL_TITLE = "font-mono text-2xl leading-8 font-semibold tracking-[0.06em] uppercase";

/** "Encabezado de bloque": the `<h3>` of each block of a section. */
export const BLOCK_HEADING =
  "font-mono text-xl leading-7 font-semibold tracking-[0.06em] uppercase";

/** "Título de elemento": the `<h4>` of a job, an institution, a project or an item. */
export const ITEM_HEADING = "text-lg leading-7 font-semibold";

/** The data line of an element (organization, period), with the role "Cuerpo secundario". */
export const ITEM_META = "text-ink-muted text-sm leading-5";
