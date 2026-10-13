// The only point through which the rest of the code reaches the sections (STR-R15). Client code
// must never import it: server layouts resolve the data and pass it down as props (STR-R32).
import {
  type ComponentOf,
  PRIMARY_SECTION_SLUGS,
  SECTION_SLUGS,
  type SectionSlug,
} from "@/shared/contracts/ids";
import type {
  AnySectionDefinition,
  SectionDefinition,
  SectionTextBase,
} from "@/shared/contracts/section";

import { cmosAboutSection } from "./cmos-about";
import { cpuProfileSection } from "./cpu-profile";
import { fanEcosystemSection } from "./fan-ecosystem";
import { ioContactSection } from "./io-contact";
import { psuExperienceSection } from "./psu-experience";
import { ramStackSection } from "./ram-stack";
import { ssdProjectsSection } from "./ssd-projects";

type Registry = {
  readonly [S in SectionSlug]: SectionDefinition<ComponentOf<S>, unknown, SectionTextBase>;
};

export const SECTIONS = {
  profile: cpuProfileSection,
  experience: psuExperienceSection,
  projects: ssdProjectsSection,
  stack: ramStackSection,
  contact: ioContactSection,
  ecosystem: fanEcosystemSection,
  about: cmosAboutSection,
} as const satisfies Registry;

export const SECTION_LIST: readonly AnySectionDefinition[] = SECTION_SLUGS.map(
  (slug) => SECTIONS[slug],
);

export const PRIMARY_SECTION_LIST: readonly AnySectionDefinition[] = PRIMARY_SECTION_SLUGS.map(
  (slug) => SECTIONS[slug],
);

export function getSection(slug: SectionSlug): AnySectionDefinition {
  return SECTIONS[slug];
}
