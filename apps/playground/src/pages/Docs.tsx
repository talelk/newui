import { A } from '@solidjs/router'
import type { JSX } from 'solid-js'
import { PackageGuides } from '../lib/PackageGuides'
import { PageSection } from '../lib/PageSection'
import { TableOfContents } from '../lib/TableOfContents'
import { PageIntro } from '../shell/PageIntro'
import { usePageToc } from '../shell/SiteLayout'

/**
 * Installation.
 *
 * Written to be copy-pasteable and true rather than aspirational: it names the
 * three packages an app actually installs, the one stylesheet it imports, and
 * the two providers it mounts. Anything not yet shipped is labelled as such
 * instead of being silently promised.
 */

function Code(props: { children: string }): JSX.Element {
  return (
    <pre class="overflow-x-auto rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-3 text-sm leading-relaxed text-ink-gray-8">
      <code>{props.children}</code>
    </pre>
  )
}

export function Docs(): JSX.Element {
  usePageToc(() => (
    <TableOfContents
      entries={[
        { id: 'packages', label: 'Packages' },
        { id: 'stylesheet', label: 'Stylesheet' },
        { id: 'provider', label: 'Provider' },
        { id: 'first-component', label: 'A first component' },
      ]}
    />
  ))
  return (
    <article class="flex max-w-3xl flex-col gap-8">
      <PageIntro
        title="Installation"
        description="One stylesheet, one provider, and only the packages a screen needs."
      />

      <PageSection id="packages" title="1 · Packages">
        <p class="text-base text-ink-gray-7">
          Install only what you use.{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/ui
          </code>{' '}
          carries the components and the Zag machines;{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/tailwind
          </code>{' '}
          carries the tokens and the Tailwind layer;{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/icons
          </code>{' '}
          carries the glyph components;{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/blocks
          </code>{' '}
          and{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/layouts
          </code>{' '}
          carry the composed sections and the page templates (
          <A
            href="/architecture"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            the ladder
          </A>
          );{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/data
          </code>{' '}
          carries the logic layer — formatting, selection, undo, downloads —
          headless, so it costs no component. Add{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/charts
          </code>
          ,{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/editor
          </code>{' '}
          or{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @newui/code-editor
          </code>{' '}
          only when a screen needs them — each drags a large dependency with it
          (echarts, TipTap, CodeMirror), which is exactly why they are separate
          packages.
        </p>
        <Code>{`pnpm add @newui/ui @newui/tailwind @newui/icons

# the composed layers and the logic layer
pnpm add @newui/blocks @newui/layouts @newui/data`}</Code>
        <p class="text-base text-ink-gray-7">
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">solid-js</code>{' '}
          is a peer dependency, so your app owns its version.
        </p>
      </PageSection>

      <PageSection id="stylesheet" title="2 · Stylesheet">
        <p class="text-base text-ink-gray-7">
          One import, once, in your entry stylesheet. It brings Tailwind, the
          fonts, the generated{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">@theme</code>{' '}
          tokens and the utilities. Then tell Tailwind where your markup lives —
          the library scans its own source, your app scans yours.
        </p>
        <Code>{`/* app.css */
@import '@newui/tailwind/style.css';

@source "../index.html";
@source "./**/*.{ts,tsx}";`}</Code>
        <p class="text-base text-ink-gray-7">
          No Tailwind config file is needed: v4 reads the theme from the
          stylesheet, and the preset is a plugin inside it.
        </p>
      </PageSection>

      <PageSection id="provider" title="3 · Provider">
        <p class="text-base text-ink-gray-7">
          Mount{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            UIProvider
          </code>{' '}
          once, near the root. It carries the writing direction and the portal
          mount point every overlay reads. Add{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            createColorScheme
          </code>{' '}
          for light/dark: it flips a document attribute, persists the choice and
          follows the OS when you pick <em>system</em>.
        </p>
        <Code>{`import { createColorScheme, Toaster, UIProvider } from '@newui/ui'

export function App() {
  createColorScheme() // optional: light/dark, system-aware

  return (
    <UIProvider dir="ltr">
      <YourApp />
      <Toaster />
    </UIProvider>
  )
}`}</Code>
      </PageSection>

      <PageSection id="first-component" title="4 · A first component">
        <p class="text-base text-ink-gray-7">
          Components are compound: the parts you see are subcomponents, and
          their state is a signal you own, never a string you set from outside.
        </p>
        <Code>{`import { Button, Dialog } from '@newui/ui'
import { createSignal } from 'solid-js'

function DeleteProject() {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <Button variant="solid" theme="red" onClick={() => setOpen(true)}>
        Delete
      </Button>
      <Dialog.Root open={open()} onOpenChange={setOpen}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Delete this project?</Dialog.Title>
            <Dialog.Description>This cannot be undone.</Dialog.Description>
          </Dialog.Header>
          <Dialog.Footer>
            <Dialog.Close>Cancel</Dialog.Close>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}`}</Code>
      </PageSection>

      <PackageGuides />
    </article>
  )
}
