---
"@newui/atoms": minor
---

New display atoms: `Heading` maps `level` (1–3) to `h1`–`h3` and the matching
type role (page title vs section title), and `Text` resolves the paragraph
scale with the default reading color. Both carry `data-slot` hooks and merge
caller classes last. See `spec/heading.md` and `spec/text.md`.
