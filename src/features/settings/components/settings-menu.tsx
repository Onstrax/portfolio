"use client";

import { usePathname, useRouter } from "next/navigation";
import { type MouseEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react";

import { homePath, parsePath } from "@/shared/config/routes";
import { SCENE_VARIANTS } from "@/shared/contracts/assets";
import type { SectionNavItem } from "@/shared/contracts/navigation";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { settleAnimations } from "@/shared/lib/settle-animations";
import { playSound } from "@/shared/lib/sound";
import { usePrefsStore } from "@/shared/state/prefs-store";
import { useSessionStore } from "@/shared/state/session-store";
import { useUiStore } from "@/shared/state/ui-store";
import { CloseIcon } from "@/shared/ui/icons/close";
import { ResetIcon } from "@/shared/ui/icons/reset";
import { LanguageSwitcher } from "@/shared/ui/language-switcher";

import { isMenuSide, menuPosition } from "../lib/menu-position";
import {
  MENU_DESCRIPTION,
  MENU_DIALOG,
  MENU_ICON_BUTTON,
  MENU_LABEL,
  MENU_PLATE,
  MENU_PLATE_STATES,
  MENU_ROW_BUTTON,
  MENU_TITLE,
  RADIO_INPUT,
  RADIO_LABEL,
  SWITCH_THUMB,
  SWITCH_TRACK,
} from "./settings.styles";

/** The zone of the scene that opens the menu, and the stage it must stay inside (SET-R10). */
function findZone(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-zone="settings"]');
}
function findStage(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="scene-root"]');
}

interface SettingsMenuProps {
  /** The seven sections, to tell how many count for the progress (SET-R11). */
  readonly sections: readonly SectionNavItem[];
  /** Tells the language switcher of the menu from the others on the page. */
  readonly focusKey: string;
}

/**
 * The small dialog that the control panel of the scene opens: sound, scene image, language,
 * progress and session reset (SET-R08 to SET-R14). Whether it is open lives in the interface
 * store, which the control panel toggles.
 */
export function SettingsMenu({ sections, focusKey }: SettingsMenuProps) {
  const { common, settings } = useUiDictionary();
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const isOpen = useUiStore((state) => state.settingsOpen);
  const closeSettings = useUiStore((state) => state.closeSettings);
  const isSoundEnabled = usePrefsStore((state) => state.soundEnabled);
  const setSoundEnabled = usePrefsStore((state) => state.setSoundEnabled);
  const sceneVariant = usePrefsStore((state) => state.sceneVariant);
  const setSceneVariant = usePrefsStore((state) => state.setSceneVariant);
  const visitedCount = useSessionStore((state) => state.visited.length);
  const resetSession = useSessionStore((state) => state.reset);

  const titleId = useId();
  const descriptionId = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const plate = useRef<HTMLDivElement>(null);
  const soundSwitch = useRef<HTMLButtonElement>(null);
  /** The plate stays drawn while its closing animation plays. */
  const [isClosing, setClosing] = useState(false);
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (wasOpen !== isOpen) {
    setWasOpen(isOpen);
    setClosing(!isOpen);
  }
  const isShown = isOpen || isClosing;

  // Opens next to the control panel, with the focus on the sound switch (SET-R10, SET-R12).
  useLayoutEffect(() => {
    const element = dialog.current;
    if (element === null || !isOpen) return;
    if (!element.open) element.showModal();
    const zone = findZone();
    const stage = findStage();
    const menu = plate.current;
    if (zone !== null && stage !== null && menu !== null) {
      const side = zone.dataset["labelPlacement"];
      const { left, top } = menuPosition({
        zone: zone.getBoundingClientRect(),
        stage: stage.getBoundingClientRect(),
        menu: { width: menu.offsetWidth, height: menu.offsetHeight },
        side: isMenuSide(side) ? side : "bottom",
      });
      menu.style.left = `${String(left)}px`;
      menu.style.top = `${String(top)}px`;
    }
    soundSwitch.current?.focus();
  }, [isOpen]);

  // Closes once its animation has played, and returns the focus to the control panel (SET-R12).
  useEffect(() => {
    if (!isClosing) return;
    let isCurrent = true;
    void settleAnimations(dialog.current).then(() => {
      if (!isCurrent) return;
      dialog.current?.close();
      setClosing(false);
      if (document.activeElement === document.body) findZone()?.focus();
    });
    return () => {
      isCurrent = false;
    };
  }, [isClosing]);

  // Opening and closing sound alike (SET-R14); the first render is neither.
  const hasRendered = useRef(false);
  useEffect(() => {
    if (hasRendered.current) playSound("toggle");
    hasRendered.current = true;
  }, [isOpen]);

  // The menu does not survive a change of page or the end of the scene (SET-R13).
  useEffect(() => closeSettings, [pathname, closeSettings]);

  const total = sections.filter((section) => section.isPrimary).length;
  const isSectionOpen = parsePath(pathname)?.view === "section";

  const toggleSound = (): void => {
    setSoundEnabled(!isSoundEnabled);
    // Only turning it on confirms with a sound, which by then is already allowed (SET-R16).
    playSound("toggle");
  };
  const reset = (): void => {
    closeSettings();
    if (isSectionOpen) router.replace(homePath(locale));
    resetSession();
  };
  // A click outside the plate closes the menu. So does choosing a language: the page is about to
  // change, and the focus must end on a language switcher that is still there (I18N-R27).
  const handleClick = (event: MouseEvent<HTMLDialogElement>): void => {
    const isOutside = event.target === dialog.current;
    const isLanguageLink =
      event.target instanceof Element && event.target.closest("a[hreflang]") !== null;
    if (isOutside || isLanguageLink) closeSettings();
  };

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      className={MENU_DIALOG}
      onClickCapture={handleClick}
      onCancel={(event) => {
        event.preventDefault();
        closeSettings();
      }}
      onClose={closeSettings}
    >
      {isShown && (
        <div
          ref={plate}
          data-testid="settings-menu"
          className={`${MENU_PLATE} ${MENU_PLATE_STATES[isOpen ? "open" : "closing"]}`}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id={titleId} className={MENU_TITLE}>
              {settings.menuTitle}
            </h2>
            <button
              type="button"
              aria-label={settings.closeAriaLabel}
              className={MENU_ICON_BUTTON}
              onClick={closeSettings}
            >
              <CloseIcon />
            </button>
          </div>

          <div className="space-y-1">
            <button
              ref={soundSwitch}
              type="button"
              role="switch"
              aria-checked={isSoundEnabled}
              aria-describedby={descriptionId}
              className={MENU_ROW_BUTTON}
              onClick={toggleSound}
            >
              <span className={MENU_LABEL}>{settings.soundLabel}</span>
              <span aria-hidden="true" className={SWITCH_TRACK[isSoundEnabled ? "on" : "off"]}>
                <span className={SWITCH_THUMB[isSoundEnabled ? "on" : "off"]} />
              </span>
            </button>
            <p id={descriptionId} className={MENU_DESCRIPTION}>
              {settings.soundDescription}
            </p>
          </div>

          <fieldset>
            <legend className={MENU_LABEL}>{settings.sceneImageLabel}</legend>
            {SCENE_VARIANTS.map((variant) => (
              <label key={variant} className={RADIO_LABEL}>
                <input
                  type="radio"
                  name="scene-variant"
                  value={variant}
                  checked={sceneVariant === variant}
                  className={RADIO_INPUT}
                  onChange={() => {
                    setSceneVariant(variant);
                    playSound("toggle");
                  }}
                />
                {variant === "photo" ? settings.scenePhotoLabel : settings.sceneSketchLabel}
              </label>
            ))}
          </fieldset>

          <div className="flex items-center justify-between gap-3">
            <span className={MENU_LABEL}>{common.languageLabel}</span>
            <LanguageSwitcher label={common.languageLabel} focusKey={focusKey} surface="dark" />
          </div>

          <p className={MENU_DESCRIPTION}>
            {common.visitedSectionsLabel({ count: visitedCount, total })}
          </p>

          <div className="space-y-1">
            <button type="button" className={MENU_ROW_BUTTON} onClick={reset}>
              <span className={MENU_LABEL}>{settings.resetLabel}</span>
              <ResetIcon />
            </button>
            <p className={MENU_DESCRIPTION}>{settings.resetDescription}</p>
          </div>
        </div>
      )}
    </dialog>
  );
}
