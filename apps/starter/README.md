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
| `src/App.tsx` | the provider, the router, the toast host |
| `src/shell/Shell.tsx` | `AppLayout`: rail, navigation, brand, account, footer |
| `src/shell/theme.ts` | the single light/dark controller |
| `src/data/records.ts` | `Repository<Project, NewProject>` — four methods, in memory |
| `src/data/session.ts` | the demo session: the shape of auth, not auth |
| `src/pages/Records.tsx` | collection, filters, stats, table, create + detail |
| `src/pages/Settings.tsx` | the form surface at page scale |
| `src/pages/SignIn.tsx` | `AuthCard` + a validated sign-in |

## Using it

Copy `apps/starter` out of the repository, rename its `package.json`, point the
`@newui/*` dependencies at the published versions, and replace
`src/data/records.ts` with your API. Nothing above that file changes.

It deliberately leaves out an auth backend, an HTTP client and
internationalisation: the kit is not an app framework, and a skeleton that
guessed your answers to those would be harder to delete than to write.
