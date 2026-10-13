/** Viewport matrix of QLT §4.6. Tests refer to viewports by these names (TST-R22). */
export const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  "desktop-min": { width: 1024, height: 600 },
  "desktop-hd": { width: 1920, height: 1080 },
  ultrawide: { width: 2560, height: 1080 },
  classic: { width: 1024, height: 768 },
  short: { width: 1280, height: 500 },
  tablet: { width: 768, height: 1024 },
  mobile: { width: 390, height: 844 },
} as const;

export type ViewportName = keyof typeof VIEWPORTS;
