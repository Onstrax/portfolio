import { SITE } from "@/shared/config/site";

/** Interface dictionary in English. It is the type reference for every other language (I18N-R08). */
export const en = {
  common: {
    skipToContentLabel: "Skip to content",
    opensInNewTabHint: "opens in a new tab",
    privateRepositoryLabel: "Private repository",
    present: "present",
    individualWorkLabel: "Individual work",
    teamOfLabel: ({ count }: { readonly count: number }): string => `Team of ${String(count)}`,
    languageLabel: "Language",
    viewLabel: "View",
    interactiveViewLabel: "Interactive",
    simpleViewLabel: "Simple",
    visitedSectionsLabel: ({
      count,
      total,
    }: {
      readonly count: number;
      readonly total: number;
    }): string => `${String(count)} of ${String(total)} sections visited`,
    downloadCvLabel: "Download résumé (PDF)",
    copyLabel: "Copy",
    copiedAnnouncement: "Copied",
  },
  site: {
    homeTitle: `${SITE.authorName} · Interactive portfolio`,
    sectionTitle: ({ title }: { readonly title: string }): string =>
      `${title} · ${SITE.authorName}`,
    cvTitle: `Résumé · ${SITE.authorName}`,
    caseTitle: ({ title }: { readonly title: string }): string => `${title} · Case study`,
    description: `Portfolio of ${SITE.authorName}, Systems Engineering student at Universidad de los Andes: software, cloud/DevOps and applied security.`,
    cvDescription: `Profile, experience, projects, stack and contact details of ${SITE.authorName} on a single page, ready to read or print.`,
    ogImageAlt: "Motherboard on a workbench, seen from above",
  },
  languageGate: {
    title: `${SITE.authorName} — Portfolio`,
    continueLabel: "Continue in English",
  },
  notFound: {
    title: "Page not found",
    description: "The address you opened does not exist on this site.",
    homeLabel: "Go to the portfolio",
  },
  boot: {
    skipLabel: "Skip",
    skipHint: "Any key skips the boot sequence",
    loadingAnnouncement: `Loading ${SITE.authorName}’s portfolio`,
  },
  scene: {
    pageTitle: `${SITE.authorName}: interactive portfolio`,
    hotspotName: ({
      hardwareName,
      title,
    }: {
      readonly hardwareName: string;
      readonly title: string;
    }): string => `${hardwareName}: ${title}`,
    settingsHardwareName: "Control panel",
    settingsTitle: "Settings",
    postDisplayName: "Diagnostic display",
    welcomeTitle: "System ready",
    welcomeDescription:
      "Welcome to my portfolio. Explore the components on the board to learn about me and what I can do for you.",
    exploreLabel: "Explore",
    profileLinkLabel: "See my profile",
    closeWelcomeAriaLabel: "Close welcome",
    simpleViewLinkLabel: "Simple view",
    hintLabel: "Each glowing component opens a section.",
  },
  panel: {
    closeAriaLabel: "Close",
    previousAriaLabel: ({ title }: { readonly title: string }): string =>
      `Previous section: ${title}`,
    nextAriaLabel: ({ title }: { readonly title: string }): string => `Next section: ${title}`,
    positionLabel: ({
      position,
      total,
    }: {
      readonly position: number;
      readonly total: number;
    }): string => `${String(position)} / ${String(total)}`,
    positionAriaLabel: ({
      position,
      total,
    }: {
      readonly position: number;
      readonly total: number;
    }): string => `Section ${String(position)} of ${String(total)}`,
  },
  settings: {
    barAriaLabel: "Site controls",
    cvShortLabel: "CV",
    emailAriaLabel: "Send an email",
    linkedinAriaLabel: "LinkedIn",
    githubAriaLabel: "GitHub",
    menuTitle: "Settings",
    closeAriaLabel: "Close settings",
    soundLabel: "Sound",
    soundDescription: "Short effects when opening and closing sections.",
    resetLabel: "Reset session",
    resetDescription: "Replays the boot sequence and clears progress.",
    sceneImageLabel: "Scene image",
    scenePhotoLabel: "Photo",
    sceneSketchLabel: "Sketch",
  },
  simpleView: {
    navAriaLabel: "Sections",
    desktopHint: "The interactive version of this portfolio is available on desktop screens.",
    backToTopLabel: "Back to top",
    caseKindTitle: "Case study",
    caseBackLabel: "All projects",
    caseProblemTitle: "The problem",
    caseRoleTitle: "My role",
    caseContributionsTitle: "My contributions",
    caseTeamTitle: "Team contributions",
    caseProcessTitle: "The process",
    caseDecisionsTitle: "Decisions",
    caseOptions: "Options",
    caseChoice: "Choice",
    caseReason: "Why",
    caseChangesTitle: "Changes of direction",
    caseOutcomeTitle: "Outcome",
    caseLearnedTitle: "Lessons learned",
  },
};

export type UiDictionary = typeof en;
