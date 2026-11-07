/**
 * The ledger tables, behind Accounting's lazy boundary.
 *
 * A named import keeps the barrel tree-shakeable: `import('@talelk/newui-
 * organisms')` asks for the whole namespace, which made the bundler emit every
 * organism as one chunk that every other route then shared — pages with no
 * table paid for DataTable (about 16 kB gzip each).
 */
export { DataTable as default } from '@talelk/newui-organisms'
