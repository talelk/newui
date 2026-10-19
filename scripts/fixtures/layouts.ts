/**
 * The layouts barrel, for the size budget.
 *
 * One entry: a layout is a frame, so importing it must not drag in the page
 * templates that sit beside it — the `forbid` list asserts the parts a frame
 * never reaches for stay out.
 */
export { AppLayout } from '../../packages/layouts/src/index'
export { Button } from '../../packages/ui/src/index'
