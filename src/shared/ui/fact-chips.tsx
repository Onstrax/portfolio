import type { RepositoryVisibility, TeamSize } from "@/shared/contracts/content";
import type { Locale } from "@/shared/contracts/locale";
import { formatTeamSize } from "@/shared/i18n/format";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";

import { Chip } from "./chip";
import { LockIcon } from "./icons/lock";
import { UsersIcon } from "./icons/users";

interface FactChipsProps {
  readonly locale: Locale;
  /** Shown as "Individual work" or "Team of N". */
  readonly teamSize?: TeamSize;
  /** A private repository is named with a chip and never linked (VSN-R19). */
  readonly repository?: RepositoryVisibility;
}

/** The chips that state who did a piece of work and whether its code is public (VSN-R18). */
export function FactChips({ locale, teamSize, repository }: FactChipsProps) {
  return (
    <>
      {teamSize !== undefined && (
        <Chip icon={<UsersIcon />}>{formatTeamSize(teamSize, locale)}</Chip>
      )}
      {repository === "private" && (
        <Chip icon={<LockIcon />}>{getUiDictionary(locale).common.privateRepositoryLabel}</Chip>
      )}
    </>
  );
}
