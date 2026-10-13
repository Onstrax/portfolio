import type { ReactNode } from "react";

interface BulletListProps {
  readonly items: readonly ReactNode[];
}

/** Text list with the square bullet of the visual system (VIS-R27). */
export function BulletList({ items }: BulletListProps) {
  return (
    <ul className="marker:text-ink list-[square] space-y-1.5 pl-5">
      {items.map((item, index) => (
        // The lists come from static content and never reorder, so the index is a stable key.
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
