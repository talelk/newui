/**
 * The pruned `tailwind-merge` config.
 *
 * Scope: every utility family this library emits. `tw-merge.test.ts` derives
 * that list from the source and checks this config against the *extended*
 * default for every pair, so a missing group or a wrong conflict edge fails a
 * test instead of silently dropping a class at runtime.
 *
 * Two rules the shape follows:
 *
 * 1. **Keywords are literals; only value families use validators.** A catch-all
 *    `{ text: [any] }` in `text-align` would claim `text-ink-gray-8` too, and
 *    then the two would "conflict" and one would be dropped.
 * 2. **Specific groups come first.** tailwind-merge takes the first matching
 *    validator, so `font-size` precedes `text-color`, and `border-w` precedes
 *    `border-color`.
 */

const isArbitrary = (value: string) =>
  value.startsWith('[') && value.endsWith(']')

/** Our type scale: `2xs`…`11xl` and `p-…`, each with an optional weight. */
const SIZE =
  /^(p-)?(interface|caption|heading|section|metric|hero|2xs|xs|sm|base|md|lg|xl|1?\dxl)(-(medium|semibold|bold))?$/
const isFontSize = (value: string) => SIZE.test(value) || isArbitrary(value)

const WEIGHTS = [
  'thin',
  'extralight',
  'light',
  'normal',
  'medium',
  'semibold',
  'bold',
  'extrabold',
  'black',
]
const isFontWeight = (value: string) =>
  WEIGHTS.includes(value) || isArbitrary(value)

const isLength = (value: string) =>
  /^-?(\d+(\.\d+)?|px|full|auto|min|max|fit|screen|svw|lvw|dvw|svh|lvh|dvh)$/.test(
    value,
  ) ||
  /^(3xs|2xs|xs|sm|md|lg|xl|[2-9]xl)$/.test(value) ||
  isArbitrary(value)

// `min-w`/`max-w`/`min-h`/`max-h` also accept `none` (Tailwind's `isMaxSize`);
// `w`/`h`/`size` do not.
const isMaxSize = (value: string) => value === 'none' || isLength(value)

const isOverflow = (value: string) =>
  /^(auto|hidden|clip|visible|scroll)$/.test(value)

const isOverscroll = (value: string) => /^(auto|contain|none)$/.test(value)

const isResize = (value: string) => /^(none|x|y|both)$/.test(value)

const isBorderWidth = (value: string) =>
  value === '' || /^\d+$/.test(value) || isArbitrary(value)

const isRadius = (value: string) =>
  /^(\d+|none|full|s|e|t|r|b|l|ss|se|ee|es|tl|tr|br|bl)$/.test(value) ||
  isArbitrary(value)

const isShadow = (value: string) =>
  value === '' ||
  ['sm', 'base', 'md', 'lg', 'xl', '2xl', 'none'].includes(value) ||
  isArbitrary(value)

const isLeading = (value: string) =>
  /^(none|tighter|tight|snug|normal|relaxed|loose|\d+)$/.test(value) ||
  isArbitrary(value)

const isNumber = (value: string) => /^\d+$/.test(value) || isArbitrary(value)

const isFraction = (value: string) =>
  /^\d{1,3}$/.test(value) || isArbitrary(value)

const isOrder = (value: string) =>
  /^(first|last|none|-?\d+)$/.test(value) || isArbitrary(value)

const isColSpan = (value: string) =>
  /^(auto|full|\d+)$/.test(value) || isArbitrary(value)

const isGridTemplate = (value: string) =>
  /^(none|subgrid|\d+)$/.test(value) || isArbitrary(value)

const isGrowShrink = (value: string) => value === '' || isNumber(value)

const isBlur = (value: string) =>
  value === '' ||
  /^(none|sm|md|lg|xl|2xl|3xl)$/.test(value) ||
  isArbitrary(value)

const isBackdropBlur = isBlur

const isInvertGrayscaleSepia = (value: string) =>
  value === '' || value === '0' || isArbitrary(value)

const isBreak = (value: string) =>
  /^(auto|avoid|all|avoid-page|page|left|right|column)$/.test(value) ||
  isArbitrary(value)

const isObjectPosition = (value: string) =>
  /^(bottom|center|left|left-bottom|left-top|right|right-bottom|right-top|top)$/.test(
    value,
  ) || isArbitrary(value)

const isTouch = (value: string) =>
  /^(auto|none|pan-x|pan-left|pan-right|pan-y|pan-up|pan-down|pinch-zoom|manipulation)$/.test(
    value,
  ) || isArbitrary(value)

const isListStyle = (value: string) =>
  /^(none|disc|decimal)$/.test(value) || isArbitrary(value)

const isTextDecorationStyle = (value: string) =>
  /^(solid|double|dotted|dashed|wavy)$/.test(value)

const isBoxDecorationBreak = (value: string) => /^(slice|clone)$/.test(value)

export const twMergeConfig = {
  cacheSize: 500,
  prefix: '',
  theme: {},
  classGroups: {
    // ---- layout ----
    display: [
      'block',
      'inline-block',
      'inline',
      'flex',
      'inline-flex',
      'table',
      'inline-table',
      'table-caption',
      'table-cell',
      'table-column',
      'table-column-group',
      'table-footer-group',
      'table-header-group',
      'table-row-group',
      'table-row',
      'flow-root',
      'grid',
      'inline-grid',
      'contents',
      'list-item',
      'hidden',
    ],
    position: ['static', 'fixed', 'absolute', 'relative', 'sticky'],
    isolation: ['isolate', 'isolation-auto'],
    visibility: ['visible', 'invisible', 'collapse'],
    'box-sizing': ['box-border', 'box-content'],
    'box-decoration': [
      { 'decoration-': [isBoxDecorationBreak] },
      'decoration-slice',
      'decoration-clone',
    ],
    overflow: [{ overflow: [isOverflow] }],
    'overflow-x': [{ 'overflow-x': [isOverflow] }],
    'overflow-y': [{ 'overflow-y': [isOverflow] }],
    overscroll: [{ overscroll: [isOverscroll] }],
    'overscroll-x': [{ 'overscroll-x': [isOverscroll] }],
    'overscroll-y': [{ 'overscroll-y': [isOverscroll] }],
    inset: [{ inset: [isLength] }],
    'inset-x': [{ 'inset-x': [isLength] }],
    'inset-y': [{ 'inset-y': [isLength] }],
    start: [{ start: [isLength] }],
    end: [{ end: [isLength] }],
    top: [{ top: [isLength] }],
    right: [{ right: [isLength] }],
    bottom: [{ bottom: [isLength] }],
    left: [{ left: [isLength] }],
    z: [{ z: [isNumber] }, 'z-auto'],
    order: [{ order: [isOrder] }],
    'grid-cols': [{ 'grid-cols': [isGridTemplate] }],
    'grid-rows': [{ 'grid-rows': [isGridTemplate] }],
    col: [{ col: [isColSpan] }],
    'col-start': [{ 'col-start': [isNumber] }],
    'col-end': [{ 'col-end': [isNumber] }],
    row: [{ row: [isColSpan] }],
    'row-start': [{ 'row-start': [isNumber] }],
    'row-end': [{ 'row-end': [isNumber] }],
    'grid-flow': [
      'grid-flow-row',
      'grid-flow-col',
      'grid-flow-dense',
      'grid-flow-row-dense',
      'grid-flow-col-dense',
    ],
    'auto-cols': [{ 'auto-cols': [isGridTemplate] }],
    'auto-rows': [{ 'auto-rows': [isGridTemplate] }],

    // ---- flex / alignment ----
    'flex-direction': [
      'flex-row',
      'flex-row-reverse',
      'flex-col',
      'flex-col-reverse',
    ],
    'flex-wrap': ['flex-wrap', 'flex-wrap-reverse', 'flex-nowrap'],
    flex: [
      { flex: [isLength] },
      'flex-1',
      'flex-auto',
      'flex-initial',
      'flex-none',
    ],
    grow: [{ grow: [isGrowShrink] }, 'grow'],
    shrink: [{ shrink: [isGrowShrink] }, 'shrink'],
    basis: [{ basis: [isLength] }],
    'justify-content': [{ justify: [() => true] }],
    'justify-items': [{ 'justify-items': [() => true] }],
    'justify-self': [{ 'justify-self': [() => true] }],
    'align-content': [{ content: [() => true] }],
    items: [{ items: [() => true] }],
    'align-self': [{ self: [() => true] }],
    'place-content': [{ 'place-content': [() => true] }],
    'place-items': [{ 'place-items': [() => true] }],
    'place-self': [{ 'place-self': [() => true] }],

    // ---- spacing ----
    gap: [{ gap: [isLength] }],
    'gap-x': [{ 'gap-x': [isLength] }],
    'gap-y': [{ 'gap-y': [isLength] }],
    p: [{ p: [isLength] }],
    px: [{ px: [isLength] }],
    py: [{ py: [isLength] }],
    ps: [{ ps: [isLength] }],
    pe: [{ pe: [isLength] }],
    pt: [{ pt: [isLength] }],
    pr: [{ pr: [isLength] }],
    pb: [{ pb: [isLength] }],
    pl: [{ pl: [isLength] }],
    m: [{ m: [isLength] }],
    mx: [{ mx: [isLength] }],
    my: [{ my: [isLength] }],
    ms: [{ ms: [isLength] }],
    me: [{ me: [isLength] }],
    mt: [{ mt: [isLength] }],
    mr: [{ mr: [isLength] }],
    mb: [{ mb: [isLength] }],
    ml: [{ ml: [isLength] }],
    'space-x': [{ 'space-x': [isLength] }],
    'space-y': [{ 'space-y': [isLength] }],

    // ---- sizing ----
    w: [{ w: [isLength] }],
    'min-w': [{ 'min-w': [isMaxSize] }],
    'max-w': [{ 'max-w': [isMaxSize] }],
    h: [{ h: [isLength] }],
    'min-h': [{ 'min-h': [isMaxSize] }],
    'max-h': [{ 'max-h': [isMaxSize] }],
    size: [{ size: [isLength] }],
    aspect: [{ aspect: [isLength] }, 'aspect-auto', 'aspect-square'],

    // ---- typography ----
    'font-size': [{ text: [isFontSize] }],
    'font-weight': [{ font: [isFontWeight] }],
    'font-family': [{ font: [() => true] }],
    leading: [{ leading: [isLeading] }],
    // `tracking-<length>` is our vocabulary, but Tailwind's *named* steps
    // (`tracking-wide`, …) are what a consumer writes. Without them here the
    // config does not recognise the class at all, so `cn('tracking-wide',
    // 'tracking-[0.02em]')` keeps both and the recipe's value loses.
    tracking: [
      { tracking: [isLength] },
      {
        tracking: ['tighter', 'tight', 'normal', 'wide', 'wider', 'widest'],
      },
    ],
    'text-align': [
      'text-left',
      'text-center',
      'text-right',
      'text-justify',
      'text-start',
      'text-end',
    ],
    'text-transform': ['uppercase', 'lowercase', 'capitalize', 'normal-case'],
    'text-overflow': ['truncate', 'text-ellipsis', 'text-clip'],
    'text-wrap': ['text-wrap', 'text-nowrap', 'text-balance', 'text-pretty'],
    'text-color': [{ text: [() => true] }],
    'vertical-align': [
      { align: [() => true] },
      'align-baseline',
      'align-top',
      'align-middle',
      'align-bottom',
      'align-text-top',
      'align-text-bottom',
      'align-sub',
      'align-super',
    ],
    whitespace: [
      'whitespace-normal',
      'whitespace-nowrap',
      'whitespace-pre',
      'whitespace-pre-line',
      'whitespace-pre-wrap',
      'whitespace-break-spaces',
    ],
    'word-break': ['break-normal', 'break-words', 'break-all', 'break-keep'],
    'list-style-type': [{ list: [isListStyle] }],
    'list-style-position': ['list-inside', 'list-outside'],
    'line-clamp': [{ 'line-clamp': [isNumber] }, 'line-clamp-none'],
    indent: [{ indent: [isLength] }],
    'text-decoration': [
      'underline',
      'overline',
      'line-through',
      'no-underline',
    ],
    'text-decoration-style': [
      { decoration: [isTextDecorationStyle] },
      'decoration-solid',
      'decoration-double',
      'decoration-dotted',
      'decoration-dashed',
      'decoration-wavy',
    ],
    'text-decoration-color': [{ decoration: [() => true] }],
    'text-underline-offset': [{ 'underline-offset': [isLength] }],
    'font-variant-numeric': [
      'normal-nums',
      'ordinal',
      'slashed-zero',
      'lining-nums',
      'oldstyle-nums',
      'proportional-nums',
      'tabular-nums',
      'diagonal-fractions',
      'stacked-fractions',
    ],

    // ---- background (keyword groups first, colour last) ----
    'bg-attachment': ['bg-fixed', 'bg-local', 'bg-scroll'],
    'bg-clip': [
      'bg-clip-border',
      'bg-clip-padding',
      'bg-clip-content',
      'bg-clip-text',
    ],
    'bg-origin': ['bg-origin-border', 'bg-origin-padding', 'bg-origin-content'],
    'bg-repeat': [
      'bg-repeat',
      'bg-no-repeat',
      'bg-repeat-x',
      'bg-repeat-y',
      'bg-repeat-round',
      'bg-repeat-space',
    ],
    'bg-size': ['bg-auto', 'bg-cover', 'bg-contain'],
    'bg-position': [
      'bg-bottom',
      'bg-center',
      'bg-left',
      'bg-left-bottom',
      'bg-left-top',
      'bg-right',
      'bg-right-bottom',
      'bg-right-top',
      'bg-top',
    ],
    'bg-blend': [{ 'bg-blend': [() => true] }],
    'bg-image': [{ bg: [isArbitrary] }],
    'bg-color': [{ bg: [() => true] }],
    from: [{ from: [() => true] }],
    via: [{ via: [() => true] }],
    to: [{ to: [() => true] }],

    // ---- borders (width before colour) ----
    'border-w': ['border', { border: [isBorderWidth] }],
    'border-x': ['border-x', { 'border-x': [isBorderWidth] }],
    'border-y': ['border-y', { 'border-y': [isBorderWidth] }],
    'border-s': ['border-s', { 'border-s': [isBorderWidth] }],
    'border-e': ['border-e', { 'border-e': [isBorderWidth] }],
    'border-t': ['border-t', { 'border-t': [isBorderWidth] }],
    'border-r': ['border-r', { 'border-r': [isBorderWidth] }],
    'border-b': ['border-b', { 'border-b': [isBorderWidth] }],
    'border-l': ['border-l', { 'border-l': [isBorderWidth] }],
    'border-style': [
      'border-solid',
      'border-dashed',
      'border-dotted',
      'border-double',
      'border-hidden',
      'border-none',
    ],
    // `border-collapse` / `border-separate` are the table-layout pair, not a
    // border colour — but `border-<anything>` matches the colour validator
    // below, so without these declared as literals `cn('border-outline-gray-2',
    // 'border-collapse')` classifies the second as a colour and drops the first.
    'border-collapse': [{ border: ['collapse', 'separate'] }],
    'border-color': [{ border: [() => true] }],
    'border-x-color': [{ 'border-x': [() => true] }],
    'border-y-color': [{ 'border-y': [() => true] }],
    'border-s-color': [{ 'border-s': [() => true] }],
    'border-e-color': [{ 'border-e': [() => true] }],
    'border-t-color': [{ 'border-t': [() => true] }],
    'border-r-color': [{ 'border-r': [() => true] }],
    'border-b-color': [{ 'border-b': [() => true] }],
    'border-l-color': [{ 'border-l': [() => true] }],
    rounded: ['rounded', { rounded: [isRadius] }],
    'rounded-s': [{ 'rounded-s': [isRadius] }],
    'rounded-e': [{ 'rounded-e': [isRadius] }],
    'rounded-t': [{ 'rounded-t': [isRadius] }],
    'rounded-r': [{ 'rounded-r': [isRadius] }],
    'rounded-b': [{ 'rounded-b': [isRadius] }],
    'rounded-l': [{ 'rounded-l': [isRadius] }],
    'rounded-ss': [{ 'rounded-ss': [isRadius] }],
    'rounded-se': [{ 'rounded-se': [isRadius] }],
    'rounded-ee': [{ 'rounded-ee': [isRadius] }],
    'rounded-es': [{ 'rounded-es': [isRadius] }],
    'rounded-tl': [{ 'rounded-tl': [isRadius] }],
    'rounded-tr': [{ 'rounded-tr': [isRadius] }],
    'rounded-br': [{ 'rounded-br': [isRadius] }],
    'rounded-bl': [{ 'rounded-bl': [isRadius] }],
    'divide-x': ['divide-x', { 'divide-x': [isBorderWidth] }],
    'divide-y': ['divide-y', { 'divide-y': [isBorderWidth] }],
    'divide-style': [
      'divide-solid',
      'divide-dashed',
      'divide-dotted',
      'divide-double',
      'divide-none',
    ],
    'divide-color': [{ divide: [() => true] }],

    // ---- effects / outline / ring ----
    shadow: ['shadow', { shadow: [isShadow] }],
    opacity: [{ opacity: [isFraction] }],
    'mix-blend': [{ 'mix-blend': [() => true] }],
    'outline-w': ['outline', { outline: [isBorderWidth] }],
    'outline-style': [
      'outline-none',
      'outline-hidden',
      'outline-solid',
      'outline-dashed',
      'outline-dotted',
      'outline-double',
    ],
    'outline-offset': ['outline-offset', { 'outline-offset': [isLength] }],
    'outline-color': [{ outline: [() => true] }],
    'ring-w': ['ring', 'ring-inset', { ring: [isBorderWidth] }],
    'ring-offset-w': ['ring-offset', { 'ring-offset': [isBorderWidth] }],
    'ring-color': [{ ring: [() => true] }],
    'ring-offset-color': [{ 'ring-offset': [() => true] }],

    // ---- filters ----
    blur: [{ blur: [isBlur] }, 'blur'],
    brightness: [{ brightness: [isFraction] }],
    contrast: [{ contrast: [isFraction] }],
    grayscale: [{ grayscale: [isInvertGrayscaleSepia] }, 'grayscale'],
    'hue-rotate': [{ 'hue-rotate': [isLength] }],
    invert: [{ invert: [isInvertGrayscaleSepia] }, 'invert'],
    saturate: [{ saturate: [isFraction] }],
    sepia: [{ sepia: [isInvertGrayscaleSepia] }, 'sepia'],
    'drop-shadow': [{ 'drop-shadow': [() => true] }],
    'backdrop-blur': [{ 'backdrop-blur': [isBackdropBlur] }, 'backdrop-blur'],
    'backdrop-brightness': [{ 'backdrop-brightness': [isFraction] }],
    'backdrop-contrast': [{ 'backdrop-contrast': [isFraction] }],
    'backdrop-grayscale': [
      { 'backdrop-grayscale': [isInvertGrayscaleSepia] },
      'backdrop-grayscale',
    ],
    'backdrop-hue-rotate': [{ 'backdrop-hue-rotate': [isLength] }],
    'backdrop-invert': [
      { 'backdrop-invert': [isInvertGrayscaleSepia] },
      'backdrop-invert',
    ],
    'backdrop-opacity': [{ 'backdrop-opacity': [isFraction] }],
    'backdrop-saturate': [{ 'backdrop-saturate': [isFraction] }],
    'backdrop-sepia': [
      { 'backdrop-sepia': [isInvertGrayscaleSepia] },
      'backdrop-sepia',
    ],

    // ---- transforms ----
    transform: ['transform', 'transform-gpu', 'transform-none'],
    translate: [{ translate: [isLength] }],
    'translate-x': [{ 'translate-x': [isLength] }],
    'translate-y': [{ 'translate-y': [isLength] }],
    rotate: [{ rotate: [isLength] }],
    scale: [{ scale: [isFraction] }],
    'scale-x': [{ 'scale-x': [isFraction] }],
    'scale-y': [{ 'scale-y': [isFraction] }],
    skew: [{ skew: [isLength] }],
    'skew-x': [{ 'skew-x': [isLength] }],
    'skew-y': [{ 'skew-y': [isLength] }],
    origin: [{ origin: [() => true] }],

    // ---- transition / animation ----
    transition: ['transition', 'transition-none', { transition: [() => true] }],
    duration: [{ duration: [isLength] }],
    ease: [{ ease: [() => true] }],
    delay: [{ delay: [isLength] }],
    animate: [{ animate: [() => true] }],

    // ---- interactivity ----
    cursor: [{ cursor: [() => true] }],
    'pointer-events': ['pointer-events-none', 'pointer-events-auto'],
    resize: [{ resize: [isResize] }, 'resize'],
    'user-select': [{ select: [() => true] }],
    touch: [{ touch: [isTouch] }],
    'touch-x': [{ 'touch-x': [isTouch] }],
    'touch-y': [{ 'touch-y': [isTouch] }],
    'touch-pz': [{ 'touch-pz': [isTouch] }],
    'scroll-behavior': ['scroll-auto', 'scroll-smooth'],
    'snap-type': [{ snap: ['none', 'x', 'y', 'both'] }],
    'snap-strictness': [{ snap: ['mandatory', 'proximity'] }],
    'snap-align': [{ snap: ['start', 'end', 'center', 'align-none'] }],
    'snap-stop': [{ snap: ['normal', 'always'] }],
    'scroll-margin': [{ 'scroll-m': [isLength] }],
    'scroll-padding': [{ 'scroll-p': [isLength] }],
    'accent-color': [{ accent: [() => true] }],
    'caret-color': [{ caret: [() => true] }],
    appearance: ['appearance-none', 'appearance-auto'],
    'will-change': [{ 'will-change': [() => true] }],
    'field-sizing': [{ 'field-sizing': [() => true] }],

    // ---- svg ----
    fill: [{ fill: [() => true] }],
    stroke: [{ stroke: [() => true] }],
    'stroke-w': [{ stroke: [isBorderWidth] }],
    'forced-color-adjust': [{ 'forced-color-adjust': [() => true] }],

    // ---- misc ----
    'object-fit': [{ object: [() => true] }],
    'object-position': [{ 'object-': [isObjectPosition] }],
    content: [{ content: [() => true] }],
    sr: ['sr-only', 'not-sr-only'],
    columns: [{ columns: [isFraction] }],
    'break-after': [{ 'break-after': [isBreak] }],
    'break-before': [{ 'break-before': [isBreak] }],
    'break-inside': [{ 'break-inside': [isBreak] }],
  },
  conflictingClassGroups: {
    // Clamping also sets display and overflow; the later clamp owns both.
    'line-clamp': ['display', 'overflow'],
    overflow: ['overflow-x', 'overflow-y'],
    overscroll: ['overscroll-x', 'overscroll-y'],
    inset: [
      'inset-x',
      'inset-y',
      'start',
      'end',
      'top',
      'right',
      'bottom',
      'left',
    ],
    // `inset-x` sets both inline edges, so it subsumes the logical `start`/`end`
    // as well as the physical `left`/`right` — a `start-4` after it must win.
    // The stock config keeps them in one group; this one lists them per-property
    // for the bundle, so the relation has to be stated.
    'inset-x': ['right', 'left', 'start', 'end'],
    'inset-y': ['top', 'bottom'],
    p: ['px', 'py', 'ps', 'pe', 'pt', 'pr', 'pb', 'pl'],
    px: ['ps', 'pe', 'pr', 'pl'],
    py: ['pt', 'pb'],
    m: ['mx', 'my', 'ms', 'me', 'mt', 'mr', 'mb', 'ml'],
    mx: ['ms', 'me', 'mr', 'ml'],
    my: ['mt', 'mb'],
    gap: ['gap-x', 'gap-y'],
    'border-w': [
      'border-x',
      'border-y',
      'border-s',
      'border-e',
      'border-t',
      'border-r',
      'border-b',
      'border-l',
    ],
    'border-color': [
      'border-x-color',
      'border-y-color',
      'border-s-color',
      'border-e-color',
      'border-t-color',
      'border-r-color',
      'border-b-color',
      'border-l-color',
    ],
    'border-x': ['border-r', 'border-l'],
    'border-y': ['border-t', 'border-b'],
    rounded: [
      'rounded-s',
      'rounded-e',
      'rounded-t',
      'rounded-r',
      'rounded-b',
      'rounded-l',
      'rounded-ss',
      'rounded-se',
      'rounded-ee',
      'rounded-es',
      'rounded-tl',
      'rounded-tr',
      'rounded-br',
      'rounded-bl',
    ],
    'rounded-s': ['rounded-ss', 'rounded-es'],
    'rounded-t': ['rounded-ss', 'rounded-se', 'rounded-tl', 'rounded-tr'],
    'rounded-b': ['rounded-es', 'rounded-ee', 'rounded-bl', 'rounded-br'],
    'col-start-end': ['col-start', 'col-end'],
    col: ['col-start', 'col-end'],
    row: ['row-start', 'row-end'],
    flex: ['basis', 'grow', 'shrink'],
    size: ['w', 'h'],
    translate: ['translate-x', 'translate-y'],
    scale: ['scale-x', 'scale-y'],
    skew: ['skew-x', 'skew-y'],
    'outline-w': ['outline-offset'],
    'ring-w': ['ring-offset'],
    touch: ['touch-x', 'touch-y', 'touch-pz'],
    // A font-size class overrides a preceding leading class (the default puts
    // this in *both* maps; it was only in the modifiers one here, so a
    // `leading-*` + `text-<size>` pair never collapsed).
    'font-size': ['leading'],
  },
  conflictingClassGroupModifiers: {
    'font-size': ['leading'],
  },
  orderSensitiveModifiers: [
    '*',
    '**',
    'after',
    'backdrop',
    'before',
    'details-content',
    'file',
    'first-letter',
    'first-line',
    'marker',
    'placeholder',
    'selection',
  ],
} as const
