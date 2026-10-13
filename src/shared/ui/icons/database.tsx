import { type IconProps, SvgIcon } from "./svg-icon";

/** Shape from the Lucide icon set (ISC license). */
export function DatabaseIcon(props: IconProps) {
  return (
    <SvgIcon {...props}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14a9 3 0 0 0 18 0V5" />
      <path d="M3 12a9 3 0 0 0 18 0" />
    </SvgIcon>
  );
}
