/**
 * The instrument-panel layer: the hand-authored retune that sits on top of the
 * Figma export (`colors.js`, `radius.js`, `typography.js` stay generated and
 * untouched — see ADR-0016).
 *
 * The kit is for people who spend the day inside records: dense tables,
 * filters, forms. This layer encodes that brief as data:
 *
 * - a cool gray family (Mist frame, white Sheet for data, Graphite ink, Pewter
 *   secondary ink, Rule hairlines) instead of the export's near-neutral gray;
 * - the `blue` theme retuned to Petrol — the kit's one accent: primary
 *   actions, focus, the active row;
 * - IBM Plex Sans (one variable family; its condensed width serves narrow
 *   columns, its default figures are tabular, so numbers align in columns);
 * - a type scale one step tighter (13px interface text) with no positive
 *   tracking, which suited Inter and only loosens Plex;
 * - radius by role: 4px controls, 6px sheets, 8px overlays.
 *
 * Every value is a replacement for a name that already exists, except
 * `surface.canvas` (the frame behind sheets) — the token surface stays
 * additive-only (ADR-0010).
 */

/** Ramp steps replaced in the exported palettes, per theme. */
export const ramps = {
  lightMode: {
    gray: {
      50: 'oklch(0.976 0.003 264.5)', // #F6F7F9
      100: 'oklch(0.954 0.005 247.9)', // #EDF0F3 Mist
      200: 'oklch(0.923 0.008 253.9)', // #E2E6EB
      300: 'oklch(0.883 0.012 252.1)', // #D3D9E0 Rule
      400: 'oklch(0.791 0.017 250.9)', // #B3BCC6
      500: 'oklch(0.665 0.023 252.6)', // #8A95A2
      600: 'oklch(0.612 0.025 254.5)', // #7A8593 muted tier, kept under AA
      700: 'oklch(0.489 0.028 256.2)', // #566170 Pewter
      800: 'oklch(0.364 0.024 255.7)', // #363F4B
      900: 'oklch(0.241 0.024 256.4)', // #18202B Graphite
      950: 'oklch(0.189 0.019 255.8)', // #0E141C
    },
    blue: {
      50: 'oklch(0.968 0.009 214.3)', // #EEF6F8
      100: 'oklch(0.933 0.018 218.4)', // #DCECF1
      200: 'oklch(0.869 0.034 217.8)', // #BCDAE3
      300: 'oklch(0.778 0.056 218.7)', // #8FC0CF
      400: 'oklch(0.668 0.076 219.7)', // #5BA0B5
      500: 'oklch(0.558 0.087 221.8)', // #2C7F98
      600: 'oklch(0.492 0.085 223.3)', // #176B84
      700: 'oklch(0.443 0.079 224.9)', // #0E5C74 Petrol
      800: 'oklch(0.389 0.069 224.6)', // #0B4C60
      900: 'oklch(0.333 0.057 224.7)', // #0A3C4C
      950: 'oklch(0.267 0.044 225.3)', // #072A36
    },
  },
  darkMode: {
    gray: {
      50: 'oklch(0.966 0.005 247.9)', // #F1F4F7
      100: 'oklch(0.926 0.009 247.9)', // #E2E7EC
      200: 'oklch(0.848 0.015 251.2)', // #C6CED7
      300: 'oklch(0.744 0.021 252.9)', // #A3ADB9
      400: 'oklch(0.589 0.026 256.2)', // #737E8D muted tier, kept under AA
      450: 'oklch(0.562 0.025 254.5)', // #6B7684
      500: 'oklch(0.459 0.025 252.7)', // #4E5966
      600: 'oklch(0.375 0.025 253.1)', // #38424E
      700: 'oklch(0.317 0.023 253.6)', // #2A333E
      800: 'oklch(0.266 0.021 257.3)', // #1F2630
      900: 'oklch(0.233 0.020 258.4)', // #181E27
      950: 'oklch(0.203 0.016 256.8)', // #12171E sheet
    },
    blue: {
      50: 'oklch(0.953 0.018 214.4)', // #E3F3F7
      100: 'oklch(0.897 0.038 215.5)', // #C2E4ED
      200: 'oklch(0.819 0.065 216.2)', // #93CFDF
      300: 'oklch(0.732 0.087 216.9)', // #62B6CC Petrol, lit
      400: 'oklch(0.642 0.093 219.1)', // #3F9AB3
      500: 'oklch(0.557 0.087 220.5)', // #2A7F97
      600: 'oklch(0.476 0.077 221.3)', // #1D667B
      700: 'oklch(0.410 0.066 222.2)', // #165264
      800: 'oklch(0.344 0.054 222.1)', // #113F4D
      900: 'oklch(0.290 0.044 222.4)', // #0D303B
      950: 'oklch(0.241 0.034 222.0)', // #0A232B
    },
  },
}

/**
 * Semantic entries set after the ramps resolve. `canvas` is the Mist frame the
 * app shell paints behind its sheets; the sidebar shares it so the frame reads
 * as one continuous surface.
 */
export const semantic = {
  light: {
    surface: {
      canvas: 'oklch(0.954 0.005 247.9)', // Mist
      sidebar: 'oklch(0.954 0.005 247.9)',
    },
  },
  dark: {
    surface: {
      canvas: 'oklch(0.171 0.012 254.2)', // #0C1015, below the sheet
      sidebar: 'oklch(0.171 0.012 254.2)',
    },
  },
}

/** The interface family. Declared by `@talelk/newui-tailwind`'s font CSS. */
export const fontFamily = { text: 'IBM Plex Sans' }

/**
 * Type sizes replaced in the exported scale: 13px interface text, quieter
 * headings that lean on weight rather than size.
 */
export const fontSize = {
  interface: { fontSize: '13px', lineHeight: '18px', letterSpacing: '0em' },
  caption: { fontSize: '12px', lineHeight: '16px', letterSpacing: '0em' },
  section: { fontSize: '15px', lineHeight: '20px', letterSpacing: '-0.005em' },
  heading: { fontSize: '20px', lineHeight: '26px', letterSpacing: '-0.015em' },
  metric: { fontSize: '22px', lineHeight: '28px', letterSpacing: '-0.02em' },
  hero: { fontSize: '32px', lineHeight: '38px', letterSpacing: '-0.025em' },
  base: { fontSize: '13px', lineHeight: '18px', letterSpacing: '0em' },
  sm: { fontSize: '12px', lineHeight: '16px', letterSpacing: '0em' },
  xs: { fontSize: '11px', lineHeight: '14px', letterSpacing: '0.005em' },
  '2xs': { fontSize: '10.5px', lineHeight: '13px', letterSpacing: '0.01em' },
  md: { fontSize: '14px', lineHeight: '20px', letterSpacing: '0em' },
  lg: { fontSize: '15px', lineHeight: '20px', letterSpacing: '0em' },
  'p-base': { fontSize: '13px', lineHeight: '20px', letterSpacing: '0em' },
  'p-sm': { fontSize: '12px', lineHeight: '18px', letterSpacing: '0em' },
}

/** Plex needs no positive tracking at text sizes; weights share the size's. */
export function trackingFor(size) {
  return fontSize[size]?.letterSpacing
}

/** Radius by role: 4px controls, 6px sheets and cards, 8px overlays. */
export const radiusRoles = {
  control: '4px',
  card: '6px',
  overlay: '8px',
}

/**
 * Focus rings, as the export's `0 0 0 <spread> <color>` shapes. The export's
 * default ring is light gray (about 1.6:1 on white); here focus is the accent,
 * solid, 3:1 or better against both the sheet and the frame.
 */
export const focus = {
  light: {
    default: '0px 0px 0px 2px #0E5C74',
    blue: '0px 0px 0px 2px #0E5C74',
  },
  dark: {
    default: '0px 0px 0px 2px #62B6CC',
    blue: '0px 0px 0px 2px #62B6CC',
  },
}
