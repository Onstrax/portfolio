import { describe, expect, it } from "vitest";

import {
  initialPanelState,
  type PanelEvent,
  panelModality,
  panelReducer,
  type PanelState,
  type PanelView,
} from "./panel-machine";

type View = PanelView<string>;
type State = PanelState<string>;
type Event = PanelEvent<string>;

const profile: View = { slug: "profile", content: "profile content" };
const projects: View = { slug: "projects", content: "projects content" };
const stack: View = { slug: "stack", content: "stack content" };

const ended: Event = { type: "animation-ended" };
const closeRequested: Event = { type: "close-requested" };
function route(view: View | null): Event {
  return { type: "route", view };
}

function run(initial: View | null, ...events: readonly Event[]): State {
  return events.reduce<State>(panelReducer, initialPanelState(initial));
}

describe("initialPanelState", () => {
  it("is closed when the route names no section", () => {
    expect(initialPanelState(null)).toMatchObject({ phase: "closed", shown: null });
  });

  it("PNL-AC04: a direct entry is open at once, without animation, and was not opened in the site", () => {
    expect(initialPanelState(projects)).toEqual({
      phase: "open",
      shown: projects,
      pending: null,
      isCloseRequested: false,
      wasOpenedInSite: false,
    });
  });
});

describe("panelReducer: opening", () => {
  it("PNL-AC01: opens with its animation when the route names a section", () => {
    const opening = run(null, route(projects));
    expect(opening).toMatchObject({ phase: "opening", shown: projects, wasOpenedInSite: true });
    expect(panelReducer(opening, ended).phase).toBe("open");
  });

  it("stays closed while the route names no section", () => {
    expect(run(null, route(null), ended, closeRequested)).toEqual(initialPanelState(null));
  });

  it("takes a newer render of the same section without animating", () => {
    const refreshed: View = { slug: "projects", content: "newer content" };
    expect(run(projects, route(refreshed))).toMatchObject({ phase: "open", shown: refreshed });
    expect(run(null, route(projects), route(refreshed))).toMatchObject({
      phase: "opening",
      shown: refreshed,
    });
  });
});

describe("panelReducer: changing section", () => {
  it("PNL-AC06: lets the previous section leave before the next one enters", () => {
    const leaving = run(profile, route(projects));
    expect(leaving).toMatchObject({ phase: "leaving", shown: profile, pending: projects });

    const entering = panelReducer(leaving, ended);
    expect(entering).toMatchObject({ phase: "entering", shown: projects, pending: null });
    expect(panelReducer(entering, ended)).toMatchObject({ phase: "open", shown: projects });
  });

  it("goes to the last section named when the route changes again while leaving", () => {
    const state = run(profile, route(projects), route(stack), ended);
    expect(state).toMatchObject({ phase: "entering", shown: stack });
  });

  it("calls the change off when the route returns to the section still shown", () => {
    expect(run(profile, route(projects), route(profile))).toMatchObject({
      phase: "open",
      shown: profile,
      pending: null,
    });
  });

  it("keeps whether the panel was opened in the site through the changes", () => {
    expect(run(profile, route(projects), ended, ended).wasOpenedInSite).toBe(false);
    expect(run(null, route(profile), ended, route(projects), ended, ended).wasOpenedInSite).toBe(
      true,
    );
  });
});

describe("panelReducer: closing", () => {
  it("PNL-AC02: when the visitor closes, plays the exit and only then asks to navigate", () => {
    const closing = run(projects, closeRequested);
    expect(closing).toMatchObject({ phase: "closing", shown: projects, isCloseRequested: true });

    const navigating = panelReducer(closing, ended);
    expect(navigating.phase).toBe("navigating");
    expect(panelReducer(navigating, route(null))).toEqual(initialPanelState(null));
  });

  it("drops a change of section that was waiting when the visitor closes", () => {
    expect(run(profile, route(projects), closeRequested)).toMatchObject({
      phase: "closing",
      shown: profile,
      pending: null,
    });
  });

  it("SYS-AC09: when the route leaves by itself, plays the exit and ends closed", () => {
    const closing = run(null, route(projects), ended, route(null));
    expect(closing).toMatchObject({ phase: "closing", shown: projects, isCloseRequested: false });
    expect(panelReducer(closing, ended)).toEqual(initialPanelState(null));
  });

  it("does not navigate if the route already left while the exit was playing", () => {
    expect(run(projects, closeRequested, route(null), ended)).toEqual(initialPanelState(null));
  });

  it("navigates at once when the browser closes the dialog by itself", () => {
    const dismissed: Event = { type: "dismissed" };
    expect(run(projects, dismissed)).toMatchObject({ phase: "navigating", isCloseRequested: true });
    expect(run(projects, closeRequested, dismissed).phase).toBe("navigating");
    expect(run(null, dismissed)).toEqual(initialPanelState(null));
  });

  it("ignores a request to close when no section is shown, and a stray end of animation", () => {
    expect(run(projects, closeRequested, closeRequested).phase).toBe("closing");
    expect(run(projects, closeRequested, ended, closeRequested).phase).toBe("navigating");
    expect(run(projects, ended)).toEqual(initialPanelState(projects));
  });

  it("opens again if the route names a section while the panel was closing", () => {
    expect(run(projects, closeRequested, route(stack))).toMatchObject({
      phase: "opening",
      shown: stack,
      isCloseRequested: false,
    });
    expect(run(projects, closeRequested, ended, route(stack))).toMatchObject({
      phase: "opening",
      shown: stack,
    });
  });
});

describe("panelModality", () => {
  it("is modal while a section is shown or the visitor is closing it", () => {
    expect(panelModality(run(projects))).toBe("modal");
    expect(panelModality(run(null, route(projects)))).toBe("modal");
    expect(panelModality(run(profile, route(projects)))).toBe("modal");
    expect(panelModality(run(profile, route(projects), ended))).toBe("modal");
    expect(panelModality(run(projects, closeRequested))).toBe("modal");
  });

  it("only fades, without holding the page, once the route has already left", () => {
    expect(panelModality(run(projects, route(null)))).toBe("fading");
  });

  it("is hidden when closed and while the navigation that closes it is on its way", () => {
    expect(panelModality(run(null))).toBe("hidden");
    expect(panelModality(run(projects, closeRequested, ended))).toBe("hidden");
  });
});
