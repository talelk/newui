<!-- intent-skills:start -->
## Skill Loading

Use the repository’s installed Intent. If it is unavailable, report the missing dependency instead of downloading a replacement.
Before editing files for a substantial task:
- Run `pnpm exec intent list` from the workspace root to see available local skills.
- If a listed skill matches the task, run `pnpm exec intent load <package>#<skill>` before changing files.
- Use the loaded `SKILL.md` guidance while making the change.
- Monorepos: when working across packages, run the skill check from the workspace root and prefer the local skill for the package being changed.
- Multiple matches: prefer the most specific local skill for the package or concern you are changing; load additional skills only when the task spans multiple packages or concerns.
<!-- intent-skills:end -->

## Skill source policy

`intent.skills` in `package.json` is the allowlist; `intent.exclude` removes
matches after it. Discovery reads package metadata and static `skills/**/SKILL.md`
files only — it never imports, requires, runs a bin or executes lifecycle code
from a discovered package. Load the skill that matches the task (`newui` for
visual composition, `newui-data` for collections and forms), not every skill.

Editor hooks and `intent install` are conveniences, not a security boundary.
The allowlist and exclusions are the boundary, and trust does not propagate to
dependencies.
