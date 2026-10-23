---
'@talelk/newui-atoms': patch
---

Fix the dark-mode solid red Button foreground. `dark:text-ink-red-9` put
`red-50` text on the `red-300` surface at 2.96:1; the shared `ink-base`
foreground now matches every other solid theme and reaches 4.83:1. The
contrast contract already asserted `ink-base` on `surface-red-8`, so the
recipe now matches the pair that was being tested.
