import { SECTION_LIST } from "@/features/registry";
import type { Locale } from "@/shared/contracts/locale";
import { getUiDictionary } from "@/shared/i18n/get-ui-dictionary";

import { lineDelay } from "../lib/boot-timeline";
import { BOOT_OK_TAG, buildBootLog } from "../lib/build-boot-log";

interface BootScreenProps {
  readonly locale: Locale;
}

/**
 * The boot sequence as static HTML: the whole log is in the document and CSS reveals its lines one
 * by one, so the screen is painted without waiting for JavaScript (BOOT-R12, BOOT-R14). It is only
 * shown while `data-boot` is `play` or `exit`. The log is decorative and always in English; the
 * hint and the skip button are in the language of the page, outside the log (BOOT-R11, BOOT-R15).
 */
export function BootScreen({ locale }: BootScreenProps) {
  const { boot } = getUiDictionary(locale);
  const lines = buildBootLog(SECTION_LIST);

  return (
    <div
      data-testid="boot-screen"
      className="bg-boot-bg boot-exit:boot-out boot-play:block boot-exit:block fixed inset-0 z-(--z-boot) hidden overflow-hidden data-[skipped=true]:[animation-duration:var(--duration-fast)]"
    >
      <div
        lang="en"
        aria-hidden="true"
        data-part="log"
        className="p-8 font-mono text-sm leading-[21px] tabular-nums min-[1440px]:text-base min-[1440px]:leading-6"
      >
        {lines.map((line, index) => {
          // The spaces that separate the three parts of a line belong to the log, not to the layout.
          const timestamp = `${line.timestamp} `;
          const okTag = ` ${BOOT_OK_TAG}`;
          return (
            <p
              key={line.timestamp}
              data-part="line"
              style={{ animationDelay: `${String(lineDelay(index, lines.length))}ms` }}
              className="boot-play:boot-line boot-exit:boot-line overflow-hidden whitespace-pre"
            >
              <span className="text-boot-dim">{timestamp}</span>
              <span className="text-boot-text">{line.message}</span>
              {line.status === "ok" && <span className="text-boot-ok">{okTag}</span>}
            </p>
          );
        })}
      </div>
      <p role="status" className="sr-only">
        {boot.loadingAnnouncement}
      </p>
      <div className="absolute right-8 bottom-8 flex items-center gap-4 font-mono text-sm leading-5">
        <span className="text-boot-dim">{boot.skipHint}</span>
        <button
          type="button"
          data-part="skip"
          className="rounded-control border-boot-dim text-boot-text hover:border-boot-text focus-visible:outline-boot-text inline-flex min-h-11 min-w-11 items-center justify-center border px-4 font-semibold tracking-[0.06em] uppercase"
        >
          {boot.skipLabel}
        </button>
      </div>
    </div>
  );
}
