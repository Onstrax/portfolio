/** Joins class names, skipping the values that a condition turned off. */
export function cn(...classes: readonly (string | false | undefined)[]): string {
  return classes.filter((value) => typeof value === "string" && value !== "").join(" ");
}
