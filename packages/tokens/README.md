# @newui/tokens

Framework-neutral token data defines colour, typography, spacing, radii, focus,
motion and elevation. `radiusRoles` maps control/card/overlay/pill onto the
primitive radius scale, and `layoutSpacing` names the page, section, card,
field and control rhythm used by components. The root export supplies token
values; `@newui/tokens/css` provides CSS generation helpers. These functions do
not own DOM or application state. Semantic surfaces, inks and outlines are the
component vocabulary.

Run `pnpm css` after modifying token data, then inspect light and dark rendered
surfaces and run contrast, CSS emission and generated-token checks. Applications
retune runtime custom properties rather than changing component recipes.
