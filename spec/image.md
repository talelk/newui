# Image

A framed image: a painted surface that holds its box while the source loads or
fails, so a page's layout never jumps.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `src` | `string` | — | the source |
| `alt` | `string` | — | **required** text alternative; pass `''` only for a purely decorative image |
| `ratio` | `'1/1' \| '4/3' \| '3/2' \| '16/9' \| '21/9'` | — | fixed aspect box; omit and the image keeps its intrinsic ratio |
| `fit` | `'cover' \| 'contain'` | `cover` | how the source fills the box |
| `fallback` | `JSX.Element` | — | replaces the broken image when the source fails |
| `class` | `string` | — | merged into the root (e.g. rounding) |

## Behavior and accessibility

Lazy (`loading="lazy"`, `decoding="async"`) so galleries do not fight the
viewport for bandwidth. A failed source swaps to `fallback` inside the same
box; without one the painted surface remains, still holding the layout.
Styling hooks: `data-slot="image"`, `data-ratio` (P10).

## Styling and responsive behavior

The frame is a block that fills its container's width; constrain it with the
caller's layout. `ratio` holds the box before the source arrives, preventing
layout shift (CLS). Text on top of an image stays out of scope — compose with
a `Card` or an overlay instead.
