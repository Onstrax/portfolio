import { Chip } from "./chip";

interface ChipListProps {
  readonly items: readonly string[];
}

/** A list of neutral chips that wraps onto as many lines as it needs. */
export function ChipList({ items }: ChipListProps) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item) => (
        <li key={item}>
          <Chip>{item}</Chip>
        </li>
      ))}
    </ul>
  );
}
