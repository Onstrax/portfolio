import { type IconProps, SvgIcon } from "./svg-icon";

/** Shape from the Lucide icon set (ISC license). */
export function ServerIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
      <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
      <path d="M6 6h.01" />
      <path d="M6 18h.01" />
    </SvgIcon>
  );
}
