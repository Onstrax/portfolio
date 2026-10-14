import type { SceneIdentity } from "@/shared/contracts/navigation";

import { LABEL_CONTENT, LABEL_NAME, PLATE, PLATE_FOCUS_AREAS } from "./scene.styles";

interface IdentityPlateProps {
  readonly identity: SceneIdentity;
}

/**
 * Who the site belongs to, always in sight over the scene: name, degree and focus areas
 * (SCN-R46). It is plain text, neither a control nor a heading (SCN-R47).
 */
export function IdentityPlate({ identity }: IdentityPlateProps) {
  return (
    <div data-testid="scene-plate" className={PLATE}>
      <p className={LABEL_NAME}>{identity.name}</p>
      <p className={LABEL_CONTENT}>{identity.degree}</p>
      <p className={PLATE_FOCUS_AREAS}>{identity.focusAreas.join(" · ")}</p>
    </div>
  );
}
