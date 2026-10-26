# The editor packages are stable interfaces on optional engines

**Status**: accepted

## Context

`@talelk/newui-editor` (TipTap 3) and `@talelk/newui-code-editor`
(CodeMirror 6) sit at 0.1.x with less verification than the rest of the
ladder: full unit and SSR suites, specs and stories, but no browser-tier
tests, and surface breadth that lags their engines (no themes or editor
settings on the code editor; a fixed toolbar feature set on the rich-text
editor). Consumers cannot tell from the version whether these are experiments
whose props may move freely, or components with real contracts.

Leaving the ambiguity is the worst option: the specs and generated prop tables
already document these packages as contracts, and the docs must not promise
unshipped behaviour — so they cannot quietly remain "just a sketch".

## Decision

1. **The props are contracts.** From now, `spec/editor.md` and
   `spec/code-editor.md` hold for these packages exactly as for any other:
   prop changes are breaking changes recorded per P13 (clean breaks before
   1.0, documented in `spec/migrations.md`). The 0.1.x numbers mean "the
   surface is still growing", not "the surface is not binding".
2. **The engines stay optional and separate.** Chart/editor payloads remain
   forbidden from the core barrels (`scripts/size.ts` `forbid` lists), and the
   packages keep independent versioning — an app that never imports an editor
   never pays for one.
3. **The verification floor is the same.** Both packages get browser-tier
   tests for their rendered surfaces, matching the rest of the organism-level
   packages; their per-package budgets in `scripts/size.ts` stay enforced.
4. **Surface growth is additive until 1.0.** Missing capabilities (code-editor
   themes, editor settings) land as new props and sub-exports; nothing existing
   changes shape without a clean, documented break.

## Consequences

The docs may keep documenting both packages as they do today — the ambiguity
they papered over is gone. Trailing-0.1 versions still communicate honestly
that breadth is growing; they no longer communicate that the contract is
soft. The browser-test floor is a verification obligation tracked with the
packages' own work, not an exception.
