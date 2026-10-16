import {
  CommandGroup,
  CommandItem,
  CommandPalette,
  KeyboardShortcut,
} from '@newui/ui'
import { useNavigate } from '@solidjs/router'
import { For, type JSX } from 'solid-js'
import { COMPONENTS } from '../generated/components'
import { NAV_ORDER } from './nav'
import { colorScheme, setColorScheme } from './theme'

/**
 * ⌘K, over the library's `CommandPalette`.
 *
 * Loaded on demand, so the shell never pays for it: this module is the only
 * thing that imports the palette, and `Masthead` pulls it in lazily. That is the
 * whole reason the site can use a component here while the sidebar is markup —
 * a dialog nobody has opened costs nothing until it is opened.
 *
 * The palette carries three kinds of thing, which is what makes it worth having
 * over the plain page search it replaces: **destinations** (every page, each
 * documented component and block), **actions** (the colour scheme), and
 * **shortcuts** — pressing ⌘K and typing "dark" is how you find the theme when
 * the button is not in front of you.
 */

/** Where a component's page lives, by the kind of entry it is. */
function hrefFor(entry: (typeof COMPONENTS)[number]): string {
  if (entry.kind === 'block') return `/blocks/${entry.slug}`
  if (entry.group === 'Charts') return `/charts/${entry.slug}`
  if (entry.group === 'Editors') return `/editors/${entry.slug}`
  return `/components/${entry.slug}`
}

export function PageFinder(props: { onClose: () => void }): JSX.Element {
  const navigate = useNavigate()
  const go = (href: string) => {
    props.onClose()
    navigate(href)
  }

  const components = COMPONENTS.filter((entry) => entry.shipped)

  return (
    <CommandPalette
      defaultOpen
      label="Find a page"
      placeholder="Search pages, components and actions…"
      empty="Nothing matches. Try a component name, or an action like “dark”."
      onOpenChange={(open) => {
        if (!open) props.onClose()
      }}
    >
      <CommandGroup label="Pages">
        <For each={NAV_ORDER}>
          {(entry) => (
            <CommandItem
              value={entry.href}
              icon="lucide-file-text"
              keywords={entry.description}
              onSelect={go}
            >
              {entry.title}
            </CommandItem>
          )}
        </For>
      </CommandGroup>

      <CommandGroup label="Components & blocks">
        <For each={components}>
          {(entry) => (
            <CommandItem
              value={hrefFor(entry)}
              icon={
                entry.kind === 'block'
                  ? 'lucide-layout-dashboard'
                  : 'lucide-square'
              }
              keywords={`${entry.group} ${entry.parts.join(' ')}`}
              description={entry.kind === 'block' ? 'block' : entry.group}
              onSelect={go}
            >
              {entry.name}
            </CommandItem>
          )}
        </For>
      </CommandGroup>

      <CommandGroup label="Actions">
        <CommandItem
          value="colour:light"
          icon="lucide-sun"
          keywords="theme appearance mode"
          onSelect={() => setColorScheme('light')}
        >
          Switch to light
        </CommandItem>
        <CommandItem
          value="colour:dark"
          icon="lucide-moon"
          keywords="theme appearance mode"
          onSelect={() => setColorScheme('dark')}
        >
          Switch to dark
        </CommandItem>
        <CommandItem
          value="colour:system"
          icon="lucide-monitor"
          keywords="theme appearance mode auto"
          disabled={colorScheme() === 'system'}
          onSelect={() => setColorScheme('system')}
        >
          Follow the system
        </CommandItem>
        <CommandItem
          value="/spec"
          icon="lucide-flask-conical"
          keywords="kitchen sink components in one page"
          onSelect={go}
        >
          Component spec
        </CommandItem>
        <CommandItem
          value="github"
          icon="lucide-code"
          keywords="source repository"
          onSelect={() => {
            props.onClose()
            window.open(
              'https://github.com/talelk/newui',
              '_blank',
              'noreferrer',
            )
          }}
        >
          Source on GitHub
        </CommandItem>
      </CommandGroup>

      <p class="flex items-center justify-center gap-1 px-2 py-2 text-xs text-ink-gray-5">
        <KeyboardShortcut combo="Mod+K" /> to open ·
        <KeyboardShortcut combo="ArrowUp" />
        <KeyboardShortcut combo="ArrowDown" /> to move ·
        <KeyboardShortcut combo="Enter" /> to run
      </p>
    </CommandPalette>
  )
}
