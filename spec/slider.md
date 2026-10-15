# Slider

A Zag slider with a controlled `value`/`onValueChange` or an uncontrolled
`defaultValue`, expressed as a number array. Multiple values expose multiple
thumbs. `min`, `max` and `step` define the numeric range.

The existing `size="sm" | "md"` track/thumb scale is retained. Every thumb is
keyboard focusable, supports Zag's arrow/Home/End interaction and has a visible
blue focus ring. Motion respects reduced-motion preferences.

Slider exposes the shared `label`, `description`, `error`, `required` contract.
Without a visible label, provide `aria-label`. Every thumb reads the shared
description/error ids and invalid state. `id` identifies the first thumb; the
machine supplies stable identities for additional thumbs. Error text uses the
shared Field alert region. `disabled` prevents changes.

Hooks: `data-slot="slider"`, `slider-track`, `slider-range`, `slider-thumb`, and
`data-invalid` on the root. Customisation uses the existing root `class` and data
attributes. There are no part class or style-injection props.
