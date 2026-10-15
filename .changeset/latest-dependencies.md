---
"@newui/vite": major
"@newui/ui": patch
"@newui/editor": patch
"@newui/code-editor": patch
"@newui/charts": patch
"@newui/blocks": patch
"@newui/icons": patch
"@newui/tailwind": patch
---

Refresh workspace dependencies to current stable releases. The Vite integration
now requires Vite ^8.3.4. Consumer runtime dependencies, Solid development
versions and Tailwind tooling are updated together; application examples migrate
to TanStack Table 9. Type checking uses TypeScript 7, with Microsoft's TypeScript 6
compatibility API retained for ESLint. Tests use Vitest 5 and Playwright 1.64.1.

Keep visible labels in accessible names for calendar view controls and example
actions; treat custom navigation avatars as decorative beside their labels.
The updated axe checks stay enabled.
