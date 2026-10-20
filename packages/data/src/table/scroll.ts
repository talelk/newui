/**
 * `ScrollTable` + `TABLE_HEAD_CLASS` on their own entry.
 *
 * The accounting ledger needs the scroll shell for a semantic table it renders
 * itself; importing the package's `./table` entry for it would pull the TanStack
 * Table composition into a route that never renders one. One module, one entry,
 * one chunk.
 */
export * from './ScrollTable'
