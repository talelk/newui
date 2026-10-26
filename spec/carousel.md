# Carousel

A scroll-snap strip of slides — scrolling is the interaction, the index follows.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `label` | `string` | — | **required** accessible name of the carousel section |
| `index` | `number` | — | controlled slide index |
| `defaultIndex` | `number` | `0` | |
| `onIndexChange` | `(index: number) => void` | — | fires on control clicks and where a scroll settles |
| `orientation` | `'horizontal' \| 'vertical'` | `horizontal` | the viewport snaps on that axis |
| `autoplay` | `boolean` | — | opt-in; pauses under the pointer or focus, off under `prefers-reduced-motion` |
| `interval` | `number` | `5000` | autoplay cadence in ms |
| `loop` | `boolean` | `true` | `false` stops at the first/last slide |
| `class` | `string` | — | merged into the section root |

## Compound parts

`Carousel.Viewport` — the scrollable strip (focusable; arrows page it).
`Carousel.Slide` — one slide; full-width with `snap-start`, width utilities
opt into peeking neighbours. `Carousel.Previous` / `Carousel.Next` — step
buttons (children replace the default label). `Carousel.Status` — the live
"Slide 2 of 5" line (`role="status"`). Every part must sit inside the
`Carousel` root; it reads the index from context (P7).

## Behavior and accessibility

The strip is native scroll (`snap-mandatory`), so touch, trackpad and
keyboard move it without JS; `scrollend` syncs the index with where the
scroll settled, including RTL. `aria-roledescription="carousel"` on the
section and `"slide"` on each slide; the `Status` line is the live region.
Styling hooks: `data-slot="carousel"` / `carousel-track` / `carousel-slide`,
`data-orientation` (P10).
