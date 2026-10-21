# Agent Skills

The library ships versioned [Agent Skills](https://agentskills.io) through
[TanStack Intent](https://tanstack.com/intent). The guidance travels with the
npm package, so an agent loads the same instructions for the installed version
instead of a stale copy in a prompt or a community rules file.

## Where the files live

A skill belongs to the package whose source and documentation it describes:

```text
packages/atoms/
  skills/newui/SKILL.md
  src/...
packages/data/
  skills/newui-data/SKILL.md
  src/...
_artifacts/
  domain_map.yaml
  skill_spec.md
  skill_tree.yaml
```

`intent maintainer setup` created the root `_artifacts` record for the
monorepo; `intent maintainer sync` keeps its tree, the package `files` and the
`tanstack-intent` keyword aligned with each `SKILL.md`. Optional packages
without their own skill are listed under `coverage.ignored_packages` with a
reason, so a new public package still surfaces a coverage warning.

## Versioning and publishing

- `metadata.library_version` in `SKILL.md` must match the owning package
  version. `pnpm skills:version` sets it from each package manifest; the
  repository `version` script runs it after `changeset version`.
- The package `files` array includes `skills`, so the skill and its references
  are in the npm tarball.
- `intent validate` is blocking in CI. `intent stale` is advisory: it reports
  version drift, missing source review state and workspace coverage without
  claiming that the guidance is semantically wrong.
- The checks run in the repository's existing pipeline (`pnpm skills:check`,
  mirrored in `.github/workflows/tests.yml`). Keep them in `pnpm verify` rather
  than adding a second CI system.

## Consumers

The starter is a consumer example. Its `package.json` declares the allowlist
and exclusions:

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
pnpm --filter starter skills                 # list permitted skills
pnpm --filter starter skills:load @talelk/newui-atoms#newui
```

`skills:load` prints the matching `SKILL.md`; an agent loads only the skill that
matches the task. `@talelk/newui-atoms` covers visual composition; `@talelk/newui-data` covers
collections, mutations and forms.

Discovery reads `package.json` and static `skills/**/SKILL.md` files. It never
imports, requires, runs a bin or executes lifecycle code from a discovered
package. The allowlist and `intent.exclude` decide what may surface; trust is
explicit and does not propagate to dependencies. Editor integrations, hooks and
`intent install` only make loading convenient — they are not a security
boundary.

## Staleness

Every skill lists its source documentation in `sources`. When those files
change, treat it as a review signal, not proof that the guidance is wrong.
`intent stale` is deliberately conservative; a maintainer decides whether the
skill needs an edit and records the outcome with `intent maintainer review`.
