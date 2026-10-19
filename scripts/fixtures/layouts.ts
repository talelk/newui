/**
 * The layouts barrel, for the size budget.
 *
 * Both entries: a layout is a frame, so importing one must not drag the rest of
 * the level in — the `forbid` list asserts the parts a frame never reaches for
 * stay out.
 */
export { AppLayout, PaneLayout } from '../../packages/layouts/src/index'
export { Button } from '../../packages/ui/src/index'
