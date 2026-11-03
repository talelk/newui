/**
 * Shared navigation chrome lives in `lib/site-ui` so lazy pages and the
 * table of contents consume the same strings without importing the shell.
 * This module only re-exports them for the shell's own call sites.
 */
export { FilterInput, NAV_ROW, NothingMatches } from '../lib/site-ui'
