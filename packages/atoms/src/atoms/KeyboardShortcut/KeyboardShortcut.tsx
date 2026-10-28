import { createMemo, For, type JSX, Show, splitProps } from 'solid-js'
import { cn, tv, type VariantProps } from '../../lib/tv'

/**
 * The combo grammar, display half.
 *
 * A combo is `Mod+Ctrl+Meta+Shift+Alt+<Key>`. `Mod` is ⌘ on macOS and Ctrl
 * elsewhere. The key names mirror what a `keydown` event reports: letters and
 * named keys by name (`K`, `Escape`, `ArrowUp`), digits and punctuation by the
 * physical key (`Digit1`, `Slash`, `BracketLeft`), so `Digit1` draws `1` and
 * `Slash` draws `/`.
 */

/** What a parsed part is: a modifier or the key itself. */
export type ShortcutPartType = 'mod' | 'ctrl' | 'meta' | 'shift' | 'alt' | 'key'

/** One glyph of a parsed combo. */
export interface ShortcutPart {
  /** The token as written in the combo, e.g. `Mod`. */
  raw: string
  /** The modifier or key this token names. */
  type: ShortcutPartType
  /** The glyph or word drawn for the token, e.g. `⌘`, `Ctrl`, `K`. */
  display: string
}

export type KeyboardShortcutSize = 'sm' | 'md' | 'lg'

type ModifierType = Exclude<ShortcutPartType, 'key'>

const MODIFIER_TYPES: Record<string, ModifierType> = {
  mod: 'mod',
  ctrl: 'ctrl',
  meta: 'meta',
  shift: 'shift',
  alt: 'alt',
}

/** Every key name whose display differs from the name as written. */
const KEY_DISPLAY: Record<string, string> = {
  escape: 'Esc',
  enter: '↵',
  space: 'Space',
  tab: 'Tab',
  insert: 'Insert',
  backspace: '⌫',
  delete: '⌦',
  arrowup: '↑',
  arrowdown: '↓',
  arrowleft: '←',
  arrowright: '→',
  pageup: 'PgUp',
  pagedown: 'PgDn',
  home: 'Home',
  end: 'End',
  digit0: '0',
  digit1: '1',
  digit2: '2',
  digit3: '3',
  digit4: '4',
  digit5: '5',
  digit6: '6',
  digit7: '7',
  digit8: '8',
  digit9: '9',
  plus: '+',
  minus: '-',
  equal: '=',
  slash: '/',
  backslash: '\\',
  backtick: '`',
  comma: ',',
  period: '.',
  semicolon: ';',
  quote: "'",
  bracketleft: '[',
  bracketright: ']',
}

/** Spoken names for the glyphs and shortened names a part can display. */
const WORD_BY_DISPLAY: Record<string, string> = {
  '⌘': 'Command',
  '⇧': 'Shift',
  '⌥': 'Option',
  Ctrl: 'Control',
  Alt: 'Alt',
  Esc: 'Escape',
  PgUp: 'Page Up',
  PgDn: 'Page Down',
  '↵': 'Enter',
  '⌫': 'Backspace',
  '⌦': 'Delete',
  '↑': 'Up Arrow',
  '↓': 'Down Arrow',
  '←': 'Left Arrow',
  '→': 'Right Arrow',
  '+': 'Plus',
  '-': 'Minus',
  '=': 'Equal',
  '/': 'Slash',
  '\\': 'Backslash',
  '`': 'Backtick',
  ',': 'Comma',
  '.': 'Period',
  ';': 'Semicolon',
  "'": 'Quote',
  '[': 'Bracket Left',
  ']': 'Bracket Right',
}

/** True on an Apple platform, where `Mod` draws ⌘ rather than Ctrl. */
export function isMacPlatform(): boolean {
  if (typeof navigator === 'undefined') return false
  const source = `${navigator.platform ?? ''} ${navigator.userAgent ?? ''}`
  return /Mac|iPod|iPhone|iPad/i.test(source)
}

function modifierDisplay(type: ModifierType, isMac: boolean): string {
  const table: Record<ModifierType, string> = {
    mod: isMac ? '⌘' : 'Ctrl',
    ctrl: 'Ctrl',
    meta: '⌘',
    shift: '⇧',
    alt: isMac ? '⌥' : 'Alt',
  }
  return table[type]
}

/**
 * Non-modifier keys frappe draws as icons rather than glyphs, keyed by the
 * displayed character. Gated by `useIcons` (default on).
 */
const KEY_ICON: Record<string, string> = {
  '↑': 'lucide-arrow-up',
  '↓': 'lucide-arrow-down',
  '←': 'lucide-arrow-left',
  '→': 'lucide-arrow-right',
  '↵': 'lucide-corner-down-left',
  '⌫': 'lucide-delete',
  '⌦': 'lucide-arrow-big-right-dash',
}

/**
 * In plain mode frappe draws the ⌘/⇧/⌥ glyphs as lucide icons; `Ctrl` and a
 * non-Apple `Alt` stay as text (no icon stands in for them). Modifier icons are
 * unconditional — `useIcons` only covers the other keys.
 */
function modifierIcon(part: ShortcutPart): string | undefined {
  if (part.type === 'mod' || part.type === 'meta') {
    return part.display === '⌘' ? 'lucide-command' : undefined
  }
  if (part.type === 'shift') return 'lucide-arrow-big-up'
  if (part.type === 'alt') {
    return part.display === '⌥' ? 'lucide-option' : undefined
  }
  return undefined
}

/** A key icon, when `useIcons` is on and the glyph has one. */
function keyIcon(part: ShortcutPart, useIcons: boolean): string | undefined {
  if (!useIcons) return undefined
  return Object.hasOwn(KEY_ICON, part.display)
    ? KEY_ICON[part.display]
    : undefined
}

/** Plain mode: modifier icons always, other key icons only with `useIcons`. */
function plainIcon(part: ShortcutPart, useIcons: boolean): string | undefined {
  return modifierIcon(part) ?? keyIcon(part, useIcons)
}

/**
 * Chip mode: ⌘ is an icon, but ⇧/⌥ are not (frappe keeps them as text in a
 * chip). Other keys follow `useIcons`.
 */
function chipIcon(part: ShortcutPart, useIcons: boolean): string | undefined {
  if (part.type === 'mod' || part.type === 'meta') {
    return part.display === '⌘' ? 'lucide-command' : undefined
  }
  return keyIcon(part, useIcons)
}

function keyDisplay(token: string): string {
  const lower = token.toLowerCase()
  if (Object.hasOwn(KEY_DISPLAY, lower)) return KEY_DISPLAY[lower] as string
  if (/^[a-z]$/.test(lower)) return lower.toUpperCase()
  if (/^f([1-9]|1[0-2])$/.test(lower)) return lower.toUpperCase()
  return token
}

/**
 * Split a combo into its parts. Modifiers come first, the key last; any token
 * outside the grammar renders as written, so a malformed combo still shows
 * something. `Mod` and `Ctrl` collapse into one chip off macOS, where they name
 * the same key.
 *
 * @param combo e.g. `"Mod+Shift+K"`. `Mod` is Cmd on macOS, Ctrl elsewhere.
 * @param isMac override the platform check (tests); defaults to the browser.
 */
export function parseCombo(
  combo: string | undefined,
  isMac: boolean = isMacPlatform(),
): ShortcutPart[] {
  if (!combo) return []

  const tokens = combo.split('+').map((part) => part.trim())
  const lastIndex = tokens.length - 1
  const parts: ShortcutPart[] = []
  const seen = new Set<string>()

  for (let index = 0; index < tokens.length; index++) {
    const token = tokens[index] ?? ''
    const lower = token.toLowerCase()
    const isKey = index === lastIndex

    if (!isKey && Object.hasOwn(MODIFIER_TYPES, lower)) {
      const type = MODIFIER_TYPES[lower] as ModifierType
      // `Mod` and `Ctrl` name the same physical key off macOS; one chip.
      const dedupe = type === 'mod' && !isMac ? 'ctrl' : type
      if (seen.has(dedupe)) continue
      seen.add(dedupe)
      parts.push({ raw: token, type, display: modifierDisplay(type, isMac) })
      continue
    }

    parts.push({ raw: token, type: 'key', display: keyDisplay(token) })
  }

  return parts
}

/** The text a parsed combo draws, e.g. `Ctrl K`. */
export function displayText(parts: ShortcutPart[]): string {
  return parts.map((part) => part.display).join(' ')
}

/** Spells a parsed combo for an `aria-label`, e.g. `Command + Shift + K`. */
export function spellOut(parts: ShortcutPart[]): string {
  return parts
    .map((part) => WORD_BY_DISPLAY[part.display] ?? part.display)
    .join(' + ')
}

function uniqueAltCombos(
  parts: ShortcutPart[],
  altCombos: string[] | undefined,
  isMac: boolean,
): string[] {
  if (!altCombos?.length) return []
  const seen = new Set<string>([displayText(parts)])
  const result: string[] = []
  for (const combo of altCombos) {
    const key = displayText(parseCombo(combo, isMac))
    if (seen.has(key)) continue
    seen.add(key)
    result.push(combo)
  }
  return result
}

function ariaLabelFor(
  parts: ShortcutPart[],
  alternatives: string[],
  isMac: boolean,
): string | undefined {
  if (!parts.length) return undefined
  const sequences = [
    spellOut(parts),
    ...alternatives.map((combo) => spellOut(parseCombo(combo, isMac))),
  ]
  return `Shortcut ${sequences.join(', or ')}`
}

export const keyboardShortcut = tv({
  base: 'inline-flex items-center gap-0.5',
  variants: {
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: { size: 'md' },
})

export const keyboardShortcutKey = tv({
  base: 'inline-flex items-center justify-center',
  variants: {
    bg: {
      true: '',
      false: 'uppercase',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  compoundVariants: [
    {
      bg: true,
      class:
        'h-6 min-w-6 rounded-4 bg-surface-gray-2 px-1.5 text-xs-medium text-ink-gray-7',
    },
    {
      bg: false,
      // `leading-none` after the size class, so the merge keeps both.
      class: 'leading-none text-ink-gray-6',
    },
  ],
  defaultVariants: { bg: false, size: 'md' },
})

export interface KeyboardShortcutProps
  extends VariantProps<typeof keyboardShortcut> {
  /** Shortcut combo, e.g. `"Mod+Shift+K"`. */
  combo?: string
  /** Draw each part as a filled chip instead of plain glyphs. */
  bg?: boolean
  /**
   * Draw arrow, Enter, Backspace and Delete keys as icons. Modifier glyphs
   * (⌘/⇧/⌥) are always icons in plain mode. Default `true`.
   */
  useIcons?: boolean
  /**
   * Draw `+` between keys. `'auto'` (default) draws it only between two text
   * keys — `Ctrl+K`, but `⌘K` and `⇧F2`. Plain mode only.
   */
  showPlus?: boolean | 'auto'
  /** Alternative equivalent combos, drawn after a `/` (display only). */
  altCombos?: string[]
  class?: string
  /** Fallback shown when no `combo` is given. */
  children?: JSX.Element
}

/**
 * A key combination drawn as `<kbd>` glyphs. `Mod+K` shows `⌘K` on macOS and
 * `Ctrl + K` elsewhere. Without a `combo` it renders its children.
 */
export function KeyboardShortcut(props: KeyboardShortcutProps): JSX.Element {
  const [local] = splitProps(props, [
    'combo',
    'bg',
    'useIcons',
    'showPlus',
    'altCombos',
    'size',
    'class',
    'children',
  ])

  const isMac = isMacPlatform()
  const useIcons = () => local.useIcons ?? true
  const parts = createMemo(() => parseCombo(local.combo, isMac))
  const alternatives = createMemo(() =>
    uniqueAltCombos(parts(), local.altCombos, isMac),
  )
  const label = createMemo(() => ariaLabelFor(parts(), alternatives(), isMac))

  const iconFor = (part: ShortcutPart) =>
    local.bg ? chipIcon(part, useIcons()) : plainIcon(part, useIcons())

  // One flag per gap between parts. `auto` omits the `+` whenever either side
  // is drawn as an icon, so `⌘K` and `⇧F2` read as one chord while `Ctrl+K`
  // stays separated. Only consulted in plain mode.
  const plusAfter = createMemo(() => {
    const list = parts()
    const mode = local.showPlus ?? 'auto'
    return list.slice(0, -1).map((part, index) => {
      if (mode !== 'auto') return mode
      const next = list[index + 1]
      if (!next) return false
      return !(plainIcon(part, useIcons()) || plainIcon(next, useIcons()))
    })
  })

  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: role="img" is set whenever a combo is present, which is when aria-label is too; without a combo there is no label and the fallback content stays readable.
    <span
      data-slot="keyboard-shortcut"
      data-bg={local.bg ? 'true' : undefined}
      role={label() ? 'img' : undefined}
      aria-label={label()}
      class={cn(keyboardShortcut({ size: local.size }), local.class)}
    >
      <Show when={parts().length > 0} fallback={local.children}>
        <For each={parts()}>
          {(part, index) => (
            <>
              <kbd
                data-slot="key"
                data-key-type={part.type}
                class={keyboardShortcutKey({ bg: local.bg, size: local.size })}
              >
                <Show when={iconFor(part)} fallback={part.display}>
                  {(icon) => <span class={cn(icon(), 'size-3')} />}
                </Show>
              </kbd>
              <Show when={!local.bg && plusAfter()[index()]}>
                <span
                  data-slot="separator"
                  aria-hidden="true"
                  class="font-mono text-xs leading-none opacity-60"
                >
                  +
                </span>
              </Show>
            </>
          )}
        </For>
        <Show when={alternatives().length > 0}>
          <span
            data-slot="alt-combos"
            class="ms-1 inline-flex items-center gap-1.5"
          >
            <For each={alternatives()}>
              {(alt) => (
                <>
                  <span class="text-xs text-ink-gray-4" aria-hidden="true">
                    /
                  </span>
                  <KeyboardShortcut
                    combo={alt}
                    bg={local.bg}
                    size={local.size}
                    useIcons={local.useIcons}
                    showPlus={local.showPlus}
                  />
                </>
              )}
            </For>
          </span>
        </Show>
      </Show>
    </span>
  )
}
