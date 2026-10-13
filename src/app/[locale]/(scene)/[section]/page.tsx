import { SECTION_SLUGS } from "@/shared/contracts/ids";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTION_SLUGS.map((section) => ({ section }));
}

export default function SectionPage() {
  return null;
}
