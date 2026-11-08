---
'@talelk/newui-tailwind': patch
---

The base `html` font stack named `InterVar`, a face the kit no longer ships —
every page silently rendered on the host machine's `system-ui`, so pixels
drifted between machines. The stack now names the self-hosted
**IBM Plex Sans** first (ADR-0016), which is what the type tokens already
declare, so the kit renders identically everywhere.
