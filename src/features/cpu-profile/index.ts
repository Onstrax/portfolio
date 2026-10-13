import type { SectionDefinition } from "@/shared/contracts/section";

import { ProfileSection } from "./components/profile-section";
import { profileEn } from "./content/en";
import { profileEs } from "./content/es";
import { profileFacts } from "./content/facts";
import { buildProfileBootLines } from "./lib/boot-lines";
import type { ProfileFacts, ProfileText } from "./types";

export const cpuProfileSection: SectionDefinition<"cpu", ProfileFacts, ProfileText> = {
  componentId: "cpu",
  slug: "profile",
  facts: profileFacts,
  text: { es: profileEs, en: profileEn },
  bootLines: buildProfileBootLines(profileFacts, profileEn),
  Section: ProfileSection,
};
