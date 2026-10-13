/**
 * Media query that decides the render mode: the scene is only shown in viewports of at least
 * 1024×600 px. It is the single definition that every consumer reads (SYS-R12); the
 * `scene-capable` variant of globals.css must repeat it word for word (SYS-AC18).
 */
export const RENDER_MODE_QUERY = "(min-width: 1024px) and (min-height: 600px)";
