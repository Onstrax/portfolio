"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type FocusEvent, lazy, Suspense, useEffect, useRef, useState } from "react";

import { parsePath } from "@/shared/config/routes";
import type { SceneVariant } from "@/shared/contracts/assets";
import { SCENE_OBJECT_IDS, type SceneObjectId } from "@/shared/contracts/ids";
import type { SectionNavItem } from "@/shared/contracts/navigation";
import { useUiDictionary } from "@/shared/i18n/use-ui-dictionary";
import { useSessionStore } from "@/shared/state/session-store";
import { useUiStore } from "@/shared/state/ui-store";
import { STAGE_BOX } from "@/shared/ui/stage.styles";

import { useDocumentAttribute } from "../hooks/use-document-attribute";
import { useElementSize } from "../hooks/use-element-size";
import { useLabels } from "../hooks/use-labels";
import { useSceneVariant } from "../hooks/use-scene-variant";
import { HOTSPOTS } from "../hotspots";
import { type AuraState, auraState } from "../lib/aura";
import { computeHitArea } from "../lib/compute-hit-area";
import { boundingBox } from "../lib/geometry";
import { isLabelVisible } from "../lib/label-state";
import { SCENE_CONTENT_ID } from "../lib/scene-ids";
import { SCENE_HEIGHT, SCENE_WIDTH, toClipPath, toStageRect } from "../lib/scene-space";
import { Aura } from "./aura";
import { PostDisplay } from "./post-display";
import { HINT_STATES, SCENE_VIEWPORT, STAGE_LAYER, ZONE } from "./scene.styles";
import { SceneImages } from "./scene-images";
import { SceneLabel } from "./scene-label";
import { Vignette } from "./vignette";

const HOTSPOT_LIST = SCENE_OBJECT_IDS.map((id) => HOTSPOTS[id]);
/** Hit area of every object, computed once: the calibration never changes at runtime. */
const HIT_AREAS = new Map(
  HOTSPOT_LIST.map((hotspot) => [hotspot.id, computeHitArea(hotspot, HOTSPOT_LIST)]),
);
const DISPLAY_BOX = boundingBox(HOTSPOTS["post-display"].polygon);

// The calibration overlay only exists in the development server (SCN-R41): in a production build
// this condition is false and the bundler drops the import.
const CalibrationOverlay =
  process.env.NODE_ENV === "development"
    ? lazy(async () => {
        const overlay = await import("./calibration-overlay");
        return { default: overlay.CalibrationOverlay };
      })
    : null;

function isCalibrationRequested(): boolean {
  return new URLSearchParams(window.location.search).get("debug") === "hotspots";
}

function hitAreaOf(id: SceneObjectId) {
  return HIT_AREAS.get(id) ?? HOTSPOTS[id].polygon;
}

/** Position, size and shape of the element that answers to the pointer in a zone (SCN-R14). */
function zoneStyle(id: SceneObjectId) {
  const hitArea = hitAreaOf(id);
  const box = boundingBox(hitArea);
  return { ...toStageRect(box), clipPath: toClipPath(hitArea, box) };
}

/** `true` when the element shows a focus indicator, that is, when it was reached by keyboard. */
function hasKeyboardFocus(element: Element): boolean {
  try {
    return element.matches(":focus-visible");
  } catch {
    return true;
  }
}

interface SceneProps {
  /** The seven sections, in canonical order, resolved for the language of the page (SCN-R05). */
  readonly sections: readonly SectionNavItem[];
}

/**
 * The interactive view: the image of the board and, over it, one zone per piece of hardware with
 * its aura and its label, the diagnostic display and the initial hint (SCN-R01).
 */
export function Scene({ sections }: SceneProps) {
  const { scene, common } = useUiDictionary();
  const location = parsePath(usePathname());
  const openSlug = location?.view === "section" ? location.section : null;
  const isSettingsOpen = useUiStore((state) => state.settingsOpen);
  const toggleSettings = useUiStore((state) => state.toggleSettings);
  const visitedCount = useSessionStore((state) => state.visited.length);
  const hasSession = useSessionStore((state) => state.hasHydrated);
  const isBootDone = useDocumentAttribute("data-boot") === "done";
  const variant = useSceneVariant();
  const labels = useLabels();

  const stage = useRef<HTMLDivElement>(null);
  const stageSize = useElementSize(stage);

  const [isCalibrating] = useState(() => CalibrationOverlay !== null && isCalibrationRequested());
  const [decoded, setDecoded] = useState<readonly SceneVariant[]>([]);
  const [hasOpenedSection, setHasOpenedSection] = useState(false);
  if (openSlug !== null && !hasOpenedSection) setHasOpenedSection(true);
  // A session reset brings the hint back (SET-R25). It shows as the boot sequence being unseen.
  const isBootSeen = useSessionStore((state) => state.bootSeen);
  const [wasBootSeen, setWasBootSeen] = useState(isBootSeen);
  if (wasBootSeen !== isBootSeen) {
    setWasBootSeen(isBootSeen);
    if (wasBootSeen && openSlug === null) setHasOpenedSection(false);
  }

  const primaryTotal = sections.filter((section) => section.isPrimary).length;
  const visitedLabel = common.visitedSectionsLabel({ count: visitedCount, total: primaryTotal });
  const settingsNames = { hardwareName: scene.settingsHardwareName, title: scene.settingsTitle };

  const stateOf = (id: SceneObjectId, isActive: boolean): AuraState =>
    auraState({
      isActive,
      isHovered: labels.state.hovered === id,
      isFocused: labels.state.focused === id,
    });
  const auraStates = new Map<SceneObjectId, AuraState>([
    ...sections.map(
      (section) =>
        [section.componentId, stateOf(section.componentId, section.slug === openSlug)] as const,
    ),
    ["settings", stateOf("settings", isSettingsOpen)],
  ]);

  // An aura that has been lit once does not breathe again: the breath belongs to the moment in
  // which the scene appears (VIS-R16).
  const [touched, setTouched] = useState<readonly SceneObjectId[]>([]);
  const newlyTouched = [...auraStates]
    .filter(([id, state]) => state !== "rest" && !touched.includes(id))
    .map(([id]) => id);
  if (newlyTouched.length > 0) setTouched([...touched, ...newlyTouched]);

  // The mark that measures when the visitor can start exploring (SCN-R37, QLT-R31).
  const isImageReady = decoded.includes(variant);
  const hasMarkedReady = useRef(false);
  useEffect(() => {
    if (!isImageReady || !isBootDone || hasMarkedReady.current) return;
    hasMarkedReady.current = true;
    performance.mark("scene:ready");
  }, [isImageReady, isBootDone]);

  // When a section closes and the focus is nowhere in the scene, it goes to the piece that had
  // opened that section (SCN-R38).
  const previousSlug = useRef(openSlug);
  useEffect(() => {
    const closedSlug = previousSlug.current;
    previousSlug.current = openSlug;
    if (closedSlug === null || openSlug !== null) return;
    if (stage.current?.contains(document.activeElement) === true) return;
    const closed = sections.find((section) => section.slug === closedSlug);
    if (closed === undefined) return;
    stage.current?.querySelector<HTMLElement>(`[data-zone="${closed.componentId}"]`)?.focus();
  }, [openSlug, sections]);

  const zoneHandlers = (id: SceneObjectId) => ({
    onPointerEnter: () => {
      labels.enter(id);
    },
    onPointerLeave: labels.leave,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (hasKeyboardFocus(event.currentTarget)) labels.focus(id);
    },
    onBlur: labels.blur,
  });
  const labelOf = (id: SceneObjectId, name: string, content: string) => (
    <SceneLabel
      key={id}
      name={name}
      content={content}
      hitBox={boundingBox(hitAreaOf(id))}
      placement={HOTSPOTS[id].labelPlacement}
      shift={HOTSPOTS[id].labelShift ?? 0}
      stage={stageSize}
      isVisible={isLabelVisible(labels.state, id)}
      isPinned={id !== "post-display"}
      onPointerEnter={() => {
        labels.enter(id);
      }}
      onPointerLeave={labels.leave}
    />
  );
  const isHintVisible = hasSession && visitedCount === 0 && !hasOpenedSection;

  return (
    <main id={SCENE_CONTENT_ID} tabIndex={-1} inert={!isBootDone} className={SCENE_VIEWPORT}>
      <h1 tabIndex={-1} className="sr-only">
        {scene.pageTitle}
      </h1>
      <div ref={stage} data-testid="scene-root" className={STAGE_BOX}>
        <SceneImages
          variant={variant}
          onReady={(ready) => {
            setDecoded((current) => (current.includes(ready) ? current : [...current, ready]));
          }}
        />
        <Vignette />
        <svg
          aria-hidden="true"
          data-testid="scene-auras"
          viewBox={`0 0 ${String(SCENE_WIDTH)} ${String(SCENE_HEIGHT)}`}
          className={STAGE_LAYER}
        >
          {[...auraStates].map(([id, state]) => (
            <Aura
              key={id}
              id={id}
              polygon={HOTSPOTS[id].polygon}
              hitArea={hitAreaOf(id)}
              state={state}
              hasFocusRing={labels.state.focused === id}
              canBreathe={state === "rest" && !touched.includes(id)}
            />
          ))}
          <PostDisplay box={DISPLAY_BOX} count={visitedCount} />
        </svg>

        {sections.map((section) => (
          <Link
            key={section.componentId}
            href={section.href}
            data-zone={section.componentId}
            aria-current={section.slug === openSlug ? "page" : undefined}
            style={zoneStyle(section.componentId)}
            className={ZONE}
            {...zoneHandlers(section.componentId)}
          >
            <span className="sr-only">{scene.hotspotName(section)}</span>
          </Link>
        ))}
        <button
          type="button"
          data-zone="settings"
          data-label-placement={HOTSPOTS.settings.labelPlacement}
          aria-haspopup="dialog"
          aria-expanded={isSettingsOpen}
          style={zoneStyle("settings")}
          className={ZONE}
          onClick={toggleSettings}
          {...zoneHandlers("settings")}
        >
          <span className="sr-only">{scene.hotspotName(settingsNames)}</span>
        </button>
        <div
          data-zone="post-display"
          style={zoneStyle("post-display")}
          className="absolute z-(--z-hotspots)"
          onPointerEnter={() => {
            labels.enter("post-display");
          }}
          onPointerLeave={labels.leave}
        />

        {sections.map((section) =>
          labelOf(section.componentId, section.hardwareName, section.title),
        )}
        {labelOf("settings", settingsNames.hardwareName, settingsNames.title)}
        {labelOf("post-display", scene.postDisplayName, visitedLabel)}

        <p
          data-testid="scene-hint"
          data-visible={isHintVisible}
          className={HINT_STATES[isHintVisible ? "visible" : "hidden"]}
        >
          {scene.hintLabel}
        </p>
        <p role="status" className="sr-only">
          {visitedLabel}
        </p>
        {CalibrationOverlay !== null && isCalibrating && (
          <Suspense fallback={null}>
            <CalibrationOverlay />
          </Suspense>
        )}
      </div>
    </main>
  );
}
