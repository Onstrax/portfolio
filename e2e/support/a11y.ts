import { AxeBuilder } from "@axe-core/playwright";
import type { Page } from "@playwright/test";

/** Rule sets that every auditable state must pass without violations (QLT-R26). */
export const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export interface AccessibilityViolation {
  readonly rule: string;
  readonly elements: readonly string[];
}

/**
 * The only way the E2E tests run axe (TST-R28): the whole page, with the rule sets of QLT-R26,
 * no disabled rule and no excluded element.
 */
export async function findAccessibilityViolations(
  page: Page,
): Promise<readonly AccessibilityViolation[]> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  return results.violations.map((violation) => ({
    rule: violation.id,
    elements: violation.nodes.map((node) => node.target.join(" ")),
  }));
}
