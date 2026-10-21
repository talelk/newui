# Starter

An application skeleton assembled only from public `newui` surfaces: the app
frame, a collection, a typed table, two forms, a demo session and settings.

```sh
pnpm dev:starter     # http://localhost:4183
pnpm build:starter
```

It is a real app in this repository, not a template zip: type-check, CSS
emission, accessibility (axe) and a smoke suite in a real browser run against it
(`e2e/starter.spec.ts`), and its route budget is measured beside the site's.

## The shape

| file | what it shows |
| --- | --- |
| `src/App.tsx` | the provider, the router, the toast host and one devtools mount |
| `src/shell/Shell.tsx` | `AppShell`: one responsive sidebar with brand, tenant, grouped navigation, settings and account |
| `src/shell/theme.ts` | the single light/dark controller |
| `src/data/records.ts` | `Repository<Project, NewProject>` — four methods, in memory |
| `src/data/session.ts` | the demo session: the shape of auth, not auth |
| `src/devtools/events.ts` | typed product events and the in-app event log |
| `src/devtools/StarterDevtoolsPanel.tsx` | the product panel beside the TanStack Query panel |
| `AGENTS.md` | consumer skill-loading guidance and the source policy |
| `scripts/intent.mjs` | stable Intent CLI invocation (avoids the duplicate `intent` bin) |
| `src/pages/Records.tsx` | collection, filters, stats, table, create + detail |
| `src/pages/Settings.tsx` | the form surface at page scale |
| `src/pages/SignIn.tsx` | `AuthCard` + a validated sign-in |

## Devtools

Development mounts one `TanStackDevtools` adapter in `App.tsx`, inside the
data provider so the TanStack Query panel can read the app's cache. Two panels
are registered through the plugin API: the library's query cache and the
starter's **Acme runtime** log. Product code calls
`emitStarterEvent(name, payload)` from `src/devtools/events.ts`; the event map
types every payload, and a mistyped field fails the build rather than the
panel.

`@tanstack/devtools-vite` is the first Vite plugin. It enables source
inspection (`data-tsd-source`, `Shift` + `Alt` + `Ctrl/Cmd` over the app), pipes
console output between the browser and the terminal, and keeps the typed event
bus connected to the dev server. Its defaults are stated explicitly in
`vite.config.ts`: `injectSource`, `consolePiping` and `removeDevtoolsOnBuild`.
The last one matters for shipping — a production build removes the devtools
imports, the adapter element and the panel imports, so none of those modules
reach the bundle. The event helper also guards on `import.meta.env.DEV`, so the
production call site is a no-op.

## Agent skills

The starter is also the consumer example for the library's versioned Agent
Skills. Its `package.json` permits only the workspace packages it already
depends on and excludes future experimental skills:

```json
{
  "intent": {
    "skills": ["workspace:@talelk/newui-*", "@talelk/newui-*"],
    "exclude": [
      "workspace:@talelk/newui-*#experimental-*",
      "@talelk/newui-*#experimental-*"
    ]
  }
}
```

```sh
pnpm --filter starter skills
pnpm --filter starter skills:load @talelk/newui-atoms#newui
```

`skills` scans installed dependencies as static files — it never imports or runs
package code. The allowlist and exclusions decide what can surface. An agent
loads only the skill that matches the task: `newui` for visual composition or
`newui-data` for collections and forms. Editor hooks and `intent install` are
conveniences, not a security boundary; the policy in `package.json` is.

See [`skills/README.md`](../../skills/README.md) for the maintainer side,
versioning and the conservative stale checks.

## Using it

Copy `apps/starter` out of the repository, rename its `package.json`, point the
`@talelk/newui-*` dependencies at the published versions, and replace
`src/data/records.ts` with your API. Nothing above that file changes.

It deliberately leaves out an auth backend, an HTTP client and
internationalisation: the kit is not an app framework, and a skeleton that
guessed your answers to those would be harder to delete than to write.
