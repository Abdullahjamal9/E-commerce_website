import type Lenis from 'lenis';

/**
 * Holds the page's single Lenis instance so components outside the provider
 * (the product page's pinned-panel wheel redirect) can pause/resume it —
 * Lenis's own wheel listener would otherwise fight that hand-rolled scroll
 * hijack for control of the same wheel events.
 */
export const lenisRef: { current: Lenis | null } = { current: null };
