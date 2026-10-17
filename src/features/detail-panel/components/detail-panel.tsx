"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  type MouseEvent,
  type ReactNode,
  useEffect,
  useId,
  useLayoutEffect,
  useReducer,
  useRef,
  useState,
} from "react";

import { homePath, parsePath } from "@/shared/config/routes";
import { isPrimaryComponentId } from "@/shared/contracts/ids";
import type { SectionNavItem } from "@/shared/contracts/navigation";
import { useLocale } from "@/shared/i18n/use-locale";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { playSound } from "@/shared/lib/sound";
import { useSessionStore } from "@/shared/state/session-store";
import { Chip } from "@/shared/ui/chip";
import { ChevronLeftIcon } from "@/shared/ui/icons/chevron-left";
import { ChevronRightIcon } from "@/shared/ui/icons/chevron-right";
import { CloseIcon } from "@/shared/ui/icons/close";

import {
  initialPanelState,
  panelModality,
  type PanelPhase,
  panelReducer,
  type PanelState,
  type PanelView,
} from "../lib/panel-machine";
import { findNeighbours } from "../lib/section-neighbours";
import {
  CONTENT,
  CONTENT_BODY,
  DIALOG,
  FOOTER,
  FOOTER_LINK,
  FRAME,
  HEADER,
  ICON_BUTTON,
  POSITION,
  SCREEN,
  TITLE,
  VEIL,
} from "./detail-panel.styles";

/** Prefix of the identifiers of a section drawn inside the panel (TSC-R33). */
const PANEL_ID_SCOPE = "panel-";

/** Phases that last as long as an animation. */
const ANIMATED_PHASES: readonly PanelPhase[] = ["opening", "leaving", "entering", "closing"];

/** Effect that accompanies the start of a phase (PNL-R24). */
const PHASE_SOUNDS = { opening: "open", closing: "close", entering: "step" } as const;

type Panel = PanelState<ReactNode>;

function reduce(state: Panel, event: Parameters<typeof panelReducer<ReactNode>>[1]): Panel {
  return panelReducer(state, event);
}

/** Resolves when every animation running inside the element has finished. */
async function settleAnimations(element: HTMLElement | null): Promise<void> {
  // jsdom has no animations: there, as with reduced motion, there is nothing to wait for.
  if (element === null || typeof element.getAnimations !== "function") return;
  await Promise.allSettled(
    element.getAnimations({ subtree: true }).map((animation) => animation.finished),
  );
}

function isPlainClick(event: MouseEvent): boolean {
  return event.button === 0 && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey;
}

interface DetailPanelProps {
  /** The seven sections, in canonical order, resolved for the language of the page (PNL-R01). */
  readonly sections: readonly SectionNavItem[];
  /** Content of the section that the route names; nothing on the home page. */
  readonly children: ReactNode;
  /**
   * Controls that must stay at hand while the panel is open. A modal dialog leaves the rest of
   * the page inert, so what the visitor still needs is drawn inside it, over the veil (PNL-R25).
   */
  readonly toolbar?: ReactNode;
}

/**
 * The modal that shows a section over the scene. It is open exactly while the route names a
 * section (PNL-R07): opening, closing and moving between sections are navigations, and this
 * component only adds their animations, the focus and the history rules of PNL-R10.
 */
export function DetailPanel({ sections, children, toolbar }: DetailPanelProps) {
  const { panel } = useUiDictionary();
  const locale = useLocale();
  const router = useRouter();
  const location = parsePath(usePathname());
  const routeSlug = location?.view === "section" ? location.section : null;
  const markVisited = useSessionStore((state) => state.markVisited);
  const titleId = useId();

  const routeView: PanelView<ReactNode> | null =
    routeSlug === null ? null : { slug: routeSlug, content: children };
  const [state, dispatch] = useReducer(reduce, routeView, initialPanelState);
  const [seen, setSeen] = useState({ slug: routeSlug, content: children });
  if (seen.slug !== routeSlug || seen.content !== children) {
    setSeen({ slug: routeSlug, content: children });
    dispatch({ type: "route", view: routeView });
  }

  const dialog = useRef<HTMLDialogElement>(null);
  const veil = useRef<HTMLDivElement>(null);
  const title = useRef<HTMLHeadingElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const toolbarSlot = useRef<HTMLDivElement>(null);

  const { phase, wasOpenedInSite } = state;
  const modality = panelModality(state);
  const shownSlug = state.shown?.slug ?? null;
  const neighbours = shownSlug === null ? null : findNeighbours(sections, shownSlug);

  // The dialog is modal while a section is open. When the route left by itself (the Back button),
  // it only fades: the page must already answer, so that the focus can return to the scene.
  useLayoutEffect(() => {
    const element = dialog.current;
    if (element === null) return;
    if (element.open) element.close();
    if (modality === "modal") element.showModal();
    if (modality === "fading") element.show();
  }, [modality]);

  // Each animated phase ends when its animations do.
  useEffect(() => {
    if (!ANIMATED_PHASES.includes(phase)) return;
    let isCurrent = true;
    void settleAnimations(dialog.current).then(() => {
      if (isCurrent) dispatch({ type: "animation-ended" });
    });
    return () => {
      isCurrent = false;
    };
  }, [phase]);

  // Closing is a navigation: back to where the panel was opened from or, after a direct entry,
  // to the home of the language, without leaving the section behind in the history (PNL-R10).
  useEffect(() => {
    if (phase !== "navigating") return;
    if (wasOpenedInSite) router.back();
    else router.replace(homePath(locale));
  }, [phase, wasOpenedInSite, router, locale]);

  useEffect(() => {
    if (phase === "opening" || phase === "closing" || phase === "entering") {
      playSound(PHASE_SOUNDS[phase]);
    }
  }, [phase]);

  // A section that has just been drawn: its title takes the focus, which is what announces it
  // (PNL-R23); the content starts at the top or at the fragment of the URL (PNL-R20); and, if it
  // is a primary section, it counts as visited (PNL-R22).
  useEffect(() => {
    if (shownSlug === null) return;
    // Unless the focus was just placed on a control of the toolbar, as a change of language does
    // with its switcher (I18N-R27).
    if (toolbarSlot.current?.contains(document.activeElement) !== true) title.current?.focus();
    const zone = content.current;
    if (zone === null) return;
    zone.scrollTop = 0;
    const fragment = decodeURIComponent(window.location.hash.slice(1));
    if (fragment === "") return;
    const target = document.getElementById(`${PANEL_ID_SCOPE}${fragment}`);
    if (target === null || !zone.contains(target)) return;
    // Only the zone of content must move: scrollIntoView would also scroll the dialog itself.
    zone.scrollTop += target.getBoundingClientRect().top - zone.getBoundingClientRect().top;
    target.focus({ preventScroll: true });
  }, [shownSlug]);

  useEffect(() => {
    const shown = sections.find((section) => section.slug === shownSlug);
    if (shown !== undefined && isPrimaryComponentId(shown.componentId)) {
      markVisited(shown.componentId);
    }
  }, [shownSlug, sections, markVisited]);

  // The zone of content only takes part in the tab order when it has something to scroll, so that
  // the keyboard can scroll it (PNL-R06). That depends on the layout, so it is written here.
  useLayoutEffect(() => {
    const zone = content.current;
    if (zone === null) return;
    const measure = (): void => {
      if (zone.scrollHeight > zone.clientHeight) zone.tabIndex = 0;
      else zone.removeAttribute("tabindex");
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(zone);
    if (zone.firstElementChild !== null) observer.observe(zone.firstElementChild);
    return () => {
      observer.disconnect();
    };
  }, [shownSlug]);

  const requestClose = (): void => {
    dispatch({ type: "close-requested" });
  };

  // Runs before the handlers of the links: a click on the veil closes the panel (PNL-R09), and a
  // link of the content to another section moves inside the panel, replacing the history entry
  // like previous and next do (PNL-R21).
  const handleClick = (event: MouseEvent<HTMLDialogElement>): void => {
    if (event.target === veil.current) {
      requestClose();
      return;
    }
    if (!isPlainClick(event) || !(event.target instanceof Element)) return;
    const link = event.target.closest("a");
    if (link === null || content.current?.contains(link) !== true || link.target === "_blank")
      return;
    const url = new URL(link.href);
    if (url.origin !== window.location.origin || parsePath(url.pathname)?.view !== "section") {
      return;
    }
    event.preventDefault();
    router.replace(`${url.pathname}${url.hash}`);
  };

  // The arrows move to the previous and next section, as the links of the footer do (PNL-R19).
  // The destination comes from the address, which changes at once, and not from the section on
  // screen, which changes after its animation: a quick second press must count from the new one.
  const isModal = modality === "modal";
  useEffect(() => {
    const element = dialog.current;
    if (element === null || !isModal) return;
    const onKeyDown = (event: KeyboardEvent): void => {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
      const target = event.target;
      const isEditable =
        target instanceof HTMLElement &&
        (target.isContentEditable || target.matches("input, textarea, select"));
      if (isEditable) return;
      const location = parsePath(window.location.pathname);
      if (location?.view !== "section") return;
      const around = findNeighbours(sections, location.section);
      if (around === null) return;
      event.preventDefault();
      router.replace(event.key === "ArrowLeft" ? around.previous.href : around.next.href);
    };
    element.addEventListener("keydown", onKeyDown);
    return () => {
      element.removeEventListener("keydown", onKeyDown);
    };
  }, [isModal, sections, router]);

  return (
    <dialog
      ref={dialog}
      aria-labelledby={titleId}
      data-phase={phase}
      inert={modality === "fading"}
      className={DIALOG}
      onClickCapture={handleClick}
      onCancel={(event) => {
        // Esc must run the same exit as the close button (PNL-R12).
        event.preventDefault();
        requestClose();
      }}
      onClose={() => {
        if (modality === "modal") dispatch({ type: "dismissed" });
      }}
    >
      <div ref={veil} data-part="veil" className={VEIL} />
      {neighbours !== null && (
        <div className={FRAME}>
          <div className={SCREEN}>
            <header className={HEADER}>
              <h2 ref={title} id={titleId} tabIndex={-1} className={TITLE}>
                {neighbours.current.title}
              </h2>
              <Chip>{neighbours.current.hardwareName}</Chip>
              <button
                type="button"
                aria-label={panel.closeAriaLabel}
                className={ICON_BUTTON}
                onClick={requestClose}
              >
                <CloseIcon />
              </button>
            </header>
            <div ref={content} data-testid="panel-content" className={CONTENT}>
              <div key={neighbours.current.slug} className={CONTENT_BODY}>
                {state.shown?.content}
              </div>
            </div>
          </div>
          <footer className={FOOTER}>
            <Link
              href={neighbours.previous.href}
              replace
              aria-label={panel.previousAriaLabel({ title: neighbours.previous.title })}
              className={FOOTER_LINK}
            >
              <ChevronLeftIcon />
              {neighbours.previous.title}
            </Link>
            <span className={POSITION}>
              <span aria-hidden="true">{panel.positionLabel(neighbours)}</span>
              <span className="sr-only">{panel.positionAriaLabel(neighbours)}</span>
            </span>
            <Link
              href={neighbours.next.href}
              replace
              aria-label={panel.nextAriaLabel({ title: neighbours.next.title })}
              className={FOOTER_LINK}
            >
              {neighbours.next.title}
              <ChevronRightIcon />
            </Link>
          </footer>
        </div>
      )}
      {/* `contents`: the slot must not take a row of the grid that centers the frame. */}
      {neighbours !== null && (
        <div ref={toolbarSlot} className="contents">
          {toolbar}
        </div>
      )}
    </dialog>
  );
}
