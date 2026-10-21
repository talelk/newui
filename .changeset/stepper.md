---
"@newui/molecules": minor
---

New `Stepper` molecule: an ordered wizard-progress list in a named navigation
landmark. Markers read done/current/upcoming; `linear` (the default) keeps
future steps unreachable, `linear={false}` turns it into a free progress
overview. Clicking a reachable step reports its `value`. See
`spec/stepper.md`.
