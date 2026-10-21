---
"@newui/tokens": minor
"@newui/tailwind": minor
"@newui/atoms": patch
"@newui/molecules": patch
"@newui/organisms": patch
"@newui/templates": patch
---

Stacking and motion become named scales from `@newui/tokens`: `z-raised`,
`z-floating`, `z-overlay`, `z-top`, `duration-fast/base/slow` and
`ease-standard` resolve `@theme` variables instead of components hard-coding
`z-50`, `z-[100]` and numeric durations. Computed values are unchanged. The
disclosure chevron keeps its literal 200ms, paired with the
`disclosure-panel` utility's timing.
