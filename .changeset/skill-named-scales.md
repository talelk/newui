---
'@talelk/newui-atoms': patch
---

Skills: the `newui` non-negotiables now name the stacking and speed scales
(`z-raised` … `z-top`, `duration-fast|base|slow`), matching the principle that
a component hard-coding `z-50` or `duration-150` is a bug. The bullet previously
covered colour tokens only, so an agent following the skill could still emit a
numeric layer.
