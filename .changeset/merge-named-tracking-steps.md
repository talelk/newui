---
'@newui/ui': patch
---

Recognise Tailwind's named `tracking-*` steps in the merge config.

`cn()` resolved `tracking-<length>` (our recipes' vocabulary) but not
`tracking-wide`, `tracking-tight` and the other named steps Tailwind ships.
A class the config does not recognise is kept unconditionally, so a consumer
writing `className="tracking-wide"` alongside a recipe's `tracking-[0.02em]`
got **both** declarations and the cascade decided — the recipe's value silently
lost.

The all-pairs equivalence sweep caught it the moment the site used
`tracking-wide`; it now agrees with the extended default across 382,542 cases.
