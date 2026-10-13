"use client";

import { Component, lazy, type ReactNode, Suspense, useLayoutEffect, useState } from "react";

import type { SectionNavItem } from "@/shared/contracts/navigation";
import { useRenderMode } from "@/shared/state/use-render-mode";

// The code of the scene is only downloaded in scene mode (QLT-R34).
const Scene = lazy(async () => {
  const feature = await import("@/features/motherboard-scene");
  return { default: feature.Scene };
});

const DetailPanel = lazy(async () => {
  const feature = await import("@/features/detail-panel");
  return { default: feature.DetailPanel };
});

interface SceneBoundaryProps {
  readonly onError: () => void;
  readonly children: ReactNode;
}

/** Stops rendering the scene layer when one of its components throws (QLT-R44). */
class SceneBoundary extends Component<SceneBoundaryProps, { readonly hasFailed: boolean }> {
  override state = { hasFailed: false };

  static getDerivedStateFromError() {
    return { hasFailed: true };
  }

  override componentDidCatch() {
    this.props.onError();
  }

  override render() {
    return this.state.hasFailed ? null : this.props.children;
  }
}

interface SceneLayerProps {
  /** The seven sections, resolved by the server layout for the language of the page (SYS-R49). */
  readonly sections: readonly SectionNavItem[];
  /** Content of the page: the section that the detail panel shows, or nothing on the home. */
  readonly children: ReactNode;
}

/**
 * The only place where the shell features of the scene are put together (SYS-R47). It keeps
 * `data-mode` in step with the viewport, tells the pre-paint script that the application started,
 * loads the scene on demand and, if the scene fails, leaves the page in the simple view. On the
 * server and in simple mode it renders nothing (SYS-R48).
 */
export function SceneLayer({ sections, children }: SceneLayerProps) {
  const viewportMode = useRenderMode();
  const [hasFailed, setFailed] = useState(false);
  const mode = hasFailed ? "simple" : viewportMode;

  useLayoutEffect(() => {
    const root = document.documentElement;
    root.dataset["app"] = "ready";
    // A navigation on the client can rebuild <html> without running the pre-paint script, and the
    // attributes it wrote are lost. Such a navigation never starts the boot sequence.
    root.dataset["boot"] ??= "done";
  }, []);

  useLayoutEffect(() => {
    document.documentElement.dataset["mode"] = mode;
  }, [mode]);

  if (mode !== "scene") return null;
  return (
    <SceneBoundary
      onError={() => {
        setFailed(true);
      }}
    >
      <Suspense fallback={null}>
        <Scene sections={sections} />
      </Suspense>
      <Suspense fallback={null}>
        <DetailPanel sections={sections}>{children}</DetailPanel>
      </Suspense>
    </SceneBoundary>
  );
}
