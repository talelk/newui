# @newui/tailwind

Import `@newui/tailwind/style.css` once in your application stylesheet. This
Tailwind v4 layer emits semantic @theme utilities and token variables. The
`@newui/tailwind/source` export exposes source paths for build integration.
There is no root JavaScript component export.

Keep package source visible to Tailwind scanning, use semantic colour utilities,
and run `pnpm css:check` against a fresh production build after recipe changes.
Reduced-motion styles and focus rings are part of the emitted contract.
