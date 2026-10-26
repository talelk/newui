---
"@talelk/newui-molecules": minor
---

New `Carousel` molecule, promoted from the `/kit/recipes` carousel example
through the kit's recipes-to-API gate. A scroll-snap strip: native scrolling
stays the interaction (touch, trackpad, arrow keys, RTL), the index follows
where the scroll settles, and `Carousel.Viewport`/`Slide`/`Previous`/`Next`/
`Status` compose the controls. Autoplay is opt-in, pauses under the pointer
or focus, and never runs under `prefers-reduced-motion`. The recipe remains
in the gallery as the themed composition.
