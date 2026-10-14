import type { RichLine } from "@/shared/contracts/content";

interface RichTextProps {
  readonly line: RichLine;
}

/**
 * A line of content. A plain string is rendered as it is; an `EmphasizedText`, with its fragment
 * in a `<strong>` that only changes the weight (TSC-R59, VIS-R45). The only place that reads a
 * `RichLine`.
 */
export function RichText({ line }: RichTextProps) {
  if (typeof line === "string") return line;
  const start = line.text.indexOf(line.emphasis);
  if (start === -1 || line.emphasis === "") return line.text;
  return (
    <>
      {line.text.slice(0, start)}
      <strong className="font-semibold">{line.emphasis}</strong>
      {line.text.slice(start + line.emphasis.length)}
    </>
  );
}
