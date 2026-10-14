import plugin from 'tailwindcss/plugin'

/**
 * Base layer for the design system.
 *
 * In the v3 layer (frappe-ui's `plugin.js`) this also minted the color theme,
 * text styles and focus-ring components. In v4 all of those come from
 * `@theme` (generated) and `@utility` (utilities.css), so this plugin only
 * carries what genuinely has to live in the base layer.
 */
export default plugin(({ addBase }) => {
  addBase({
    // `@tailwindcss/forms` is loaded before this plugin and resets every native
    // text control: a 1px `gray-500` border, a white fill, `padding: 0.5rem
    // 0.75rem`, a 16px font and a blue focus ring. Our recipes own all of that,
    // so the reset only ever leaks into the controls that deliberately want
    // none of it — the bare `<input>` inside Combobox / MultiSelect /
    // DatePicker / TimePicker / DateRangePicker / DateTimePicker, which
    // otherwise renders as a bordered 16px box inside the field's own 14px
    // surface. Neutralised once, here, rather than restated in every recipe;
    // utilities still win, so a recipe that asks for a border, padding or a
    // size gets it. Checkboxes, radios and file inputs are left to the plugin —
    // those *are* its widgets.
    "input:not([type='checkbox'], [type='radio'], [type='file']), textarea, select":
      {
        'border-width': '0',
        'border-radius': '0',
        'background-color': 'transparent',
        padding: '0',
        'font-size': 'inherit',
        'line-height': 'inherit',
      },
    // The plugin's `:focus` rule paints a 1px blue ring on the control itself.
    // Focus indication belongs to the field (`focus-within:focus-ring`), so the
    // inner control must not draw a second, clipped ring.
    "input:not([type='checkbox'], [type='radio'], [type='file']):focus, textarea:focus, select:focus":
      {
        'box-shadow': 'none',
      },
    html: {
      'font-family': 'InterVar, ui-sans-serif, system-ui, sans-serif',
      'font-optical-sizing': 'auto',
    },
    'html, body, button, p, span, div': {
      fontVariationSettings: "'opsz' 24, 'cv11' 1",
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
    },
    // A bare <p> reads as body copy. At element specificity (0,0,1) with
    // :where() so any explicit text-* / text-p-* line-height wins.
    ':where(p)': {
      'line-height': '1.6',
    },
    // The baseline focus ring, keyboard-only. `:where()` gives it zero
    // specificity, so a component's own `focus-ring` utility (or an explicit
    // `outline-none`) still wins — but every interactive element that forgot
    // to opt in gets a visible ring instead of the browser default.
    ':where(:focus-visible)': {
      outline: 'var(--focus-outline-default)',
      'outline-offset': '0px',
    },
    // Tell the browser which scheme native UI (scrollbars, form controls,
    // autofill) should render. Without this, a dark page keeps light
    // scrollbars and light form widgets.
    ':root': {
      'color-scheme': 'light',
    },
    '[data-theme="dark"]': {
      'color-scheme': 'dark',
    },
    // Selection reads as a tinted brand highlight rather than the OS default.
    '::selection': {
      'background-color':
        'color-mix(in oklab, var(--surface-blue-6) 28%, transparent)',
    },
    // `useColorScheme` stamps this for the two frames around a light/dark swap
    // so every transitioning surface does not cross-fade at once (a flash).
    '.no-transition, .no-transition *': {
      transition: 'none !important',
    },
    '.no-transition *::before, .no-transition *::after': {
      transition: 'none !important',
    },
  })
})
