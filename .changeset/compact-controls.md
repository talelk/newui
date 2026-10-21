---
"@newui/atoms": minor
"@newui/molecules": minor
"@newui/editor": minor
"@newui/organisms": minor
"@newui/charts": minor
"@newui/tokens": minor
"@newui/tailwind": minor
---

Default control sizing is now sm (28px), including buttons, text entry, selectors,
date/time triggers, tabs, toggle groups and pagination. Explicit md remains 32px;
checkboxes, radios and avatars retain their geometry. Consumers that require the
previous default should pass size="md". Cards default to 12px padding; pass
padding="md" for the previous 16px. Chart cards, editor toolbar commands and blocks use compact spacing.
Page, section, metric and hero typography now follow 24/30, 18/24, 28/32 and
36/40px respectively. Existing semantic colors and dialog padding are retained.
