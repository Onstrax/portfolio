"use client";

import { useEffect, useState } from "react";

import { settleAnimations } from "@/shared/lib/settle-animations";
import { playSound } from "@/shared/lib/sound";
import { useSessionStore } from "@/shared/state/session-store";

import { bootDuration, isSkipKey } from "../lib/boot-timeline";

function findScreen(): HTMLElement | null {
  return document.querySelector<HTMLElement>('[data-testid="boot-screen"]');
}

function isMotionReduced(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * Time since the boot screen was first painted. On a first visit its lines started with that
 * paint, before this code existed. The paint timing of the browser is the clock that every engine
 * gives; the animation of the last line is the second choice.
 */
function timeSinceFirstPaint(lastLine: HTMLElement | null): number {
  const firstPaint = performance.getEntriesByName("first-contentful-paint").at(0)?.startTime;
  if (firstPaint !== undefined) return performance.now() - firstPaint;
  return Number(lastLine?.getAnimations().at(0)?.currentTime ?? 0);
}

/**
 * Time left until the boot sequence ends by itself. A replay starts now; a first visit started
 * with the first paint, and if this code arrived late nothing is left and the sequence ends at
 * once (BOOT-R17).
 */
function timeLeft(screen: HTMLElement, isReplay: boolean): number {
  const lines = screen.querySelectorAll<HTMLElement>('[data-part="line"]');
  const total = bootDuration(lines.length, isMotionReduced());
  if (isReplay) return total;
  return Math.max(0, total - timeSinceFirstPaint(lines.item(lines.length - 1)));
}

/**
 * Moves the focus to the title of the scene. The scene stops being inert a moment after
 * `data-boot` says `done`, when it renders again, so the focus may take a few frames to land.
 */
function focusSceneTitle(attemptsLeft = 10): void {
  const title = document.querySelector<HTMLElement>('[data-layer="scene"] h1');
  if (title === null) return;
  title.focus();
  if (document.activeElement === title || attemptsLeft === 0) return;
  requestAnimationFrame(() => {
    focusSceneTitle(attemptsLeft - 1);
  });
}

/**
 * Runs the boot sequence that `BootScreen` draws: ends it on time or when the visitor skips it,
 * plays the transition to the scene and replays it after a session reset (BOOT-R03, BOOT-R04,
 * BOOT-R17 to BOOT-R21). It renders nothing.
 */
export function BootController() {
  const hasSession = useSessionStore((state) => state.hasHydrated);
  const isBootSeen = useSessionStore((state) => state.bootSeen);
  const markBootSeen = useSessionStore((state) => state.markBootSeen);
  /** Number of the run in course: 0 is the one that the pre-paint script may have started. */
  const [run, setRun] = useState(0);
  const [wasBootSeen, setWasBootSeen] = useState(isBootSeen);

  // The visitor reset the session: the sequence is shown again from its start (BOOT-R04).
  if (wasBootSeen !== isBootSeen) {
    setWasBootSeen(isBootSeen);
    if (hasSession && wasBootSeen && !isBootSeen) setRun(run + 1);
  }

  useEffect(() => {
    if (!hasSession) return;
    const root = document.documentElement;
    const screen = findScreen();
    const isReplay = run > 0;
    if (isReplay) {
      root.dataset["boot"] = "play";
      playSound("boot");
    }
    if (screen === null || root.dataset["boot"] !== "play") {
      // No sequence to show: it will not appear later in this session either (BOOT-R03).
      root.dataset["boot"] = "done";
      markBootSeen();
      return;
    }

    let isCurrent = true;
    delete screen.dataset["skipped"];

    let timer: number | undefined;
    let arming: number | undefined;
    const skip = (): void => {
      finish(true);
    };
    const onKeyDown = (event: KeyboardEvent): void => {
      if (isSkipKey(event.key)) skip();
    };
    const addListeners = (): void => {
      window.addEventListener("keydown", onKeyDown);
      window.addEventListener("pointerdown", skip);
      // Assistive technology activates the button with a click and no key or pointer event.
      window.addEventListener("click", skip);
    };
    const removeListeners = (): void => {
      window.clearTimeout(arming);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("pointerdown", skip);
      window.removeEventListener("click", skip);
    };
    function finish(wasSkipped: boolean): void {
      window.clearTimeout(timer);
      removeListeners();
      if (wasSkipped && screen !== null) screen.dataset["skipped"] = "true";
      const hadFocus = screen?.contains(document.activeElement) === true;
      root.dataset["boot"] = "exit";
      // Only the fade of the screen: lines that had not appeared yet keep their own animation.
      void settleAnimations(screen, "self").then(() => {
        if (!isCurrent) return;
        root.dataset["boot"] = "done";
        markBootSeen();
        // The control that had the focus is gone: the skip button or, in a replay, the one
        // that asked for it. The focus goes to the title of the scene (BOOT-R21); left nowhere,
        // WebKit would not move it forward with Tab again.
        if (hadFocus || isReplay) focusSceneTitle();
      });
    }

    // The visitor may have asked to skip before this code arrived: the pre-paint script noted it.
    const wasSkippedEarly = !isReplay && root.dataset["bootSkip"] !== undefined;
    delete root.dataset["bootSkip"];
    if (wasSkippedEarly) {
      finish(true);
    } else {
      // A replay starts inside the click or key press that asked for it, which is still on its
      // way through the page: listening from the next turn keeps it from skipping the replay.
      if (isReplay) arming = window.setTimeout(addListeners, 0);
      else addListeners();
      timer = window.setTimeout(
        () => {
          finish(false);
        },
        timeLeft(screen, isReplay),
      );
    }

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
      removeListeners();
    };
  }, [hasSession, run, markBootSeen]);

  return null;
}
