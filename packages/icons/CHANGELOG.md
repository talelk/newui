# @talelk/newui-icons

## 0.0.2

### Patch Changes

- 80fcde4: Design-system polish sweep: exhaustive, tokenized foundations (motion, radius roles, density, z-layer scale, dark elevation) now consumed consistently across atoms, molecules, organisms, templates, charts and editors via shared `control-styles` recipes instead of per-component one-offs. New props in existing vocabulary: `NumberInput`/`PinInput` gain `size`/`variant`, `Dropdown` gains `disabled`, `IconButton` gains `loading`. `Button` loading no longer sets the native `disabled` attribute. Renames/removals: the `data-color` hook becomes `data-theme`, and `KanbanTone` drops the unused `violet` value. The playground and starter screens adopt the same foundations.

## 0.0.1

### Patch Changes

- 6fda044: Refresh workspace dependencies to current stable releases. The Vite integration
  now requires Vite ^8.3.4. Consumer runtime dependencies, Solid development
  versions and Tailwind tooling are updated together; application examples migrate
  to TanStack Table 9. Type checking uses TypeScript 7, with Microsoft's TypeScript 6
  compatibility API retained for ESLint. Tests use Vitest 5 and Playwright 1.64.1.
  
  Keep visible labels in accessible names for calendar view controls and example
  actions; treat custom navigation avatars as decorative beside their labels.
  The updated axe checks stay enabled.
