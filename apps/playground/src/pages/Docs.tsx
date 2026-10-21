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
    <pre class="whitespace-pre-wrap break-words rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-3 text-sm leading-relaxed text-ink-gray-8">
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
        { id: 'next', label: 'Next' },
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
          The site is organised by atomic design's levels, and the packages
          follow them: you install the level you are working at. The full
          mapping — including where a package ships two levels — is on{' '}
          <A
            href="/architecture"
            class="text-ink-blue-6 underline decoration-dotted"
          >
            Atomic design
          </A>
          .
        </p>
        <div class="overflow-x-auto rounded-5 border border-outline-gray-1">
          <table class="w-full border-collapse text-start text-sm">
            <thead class="bg-surface-gray-1 text-caption text-ink-gray-7">
              <tr>
                <th class="p-2 text-start font-medium">Level</th>
                <th class="p-2 text-start font-medium">Package</th>
                <th class="p-2 text-start font-medium">What you get</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/foundations"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Foundations
                  </A>
                </td>
                <td class="p-2 font-mono text-xs">
                  @talelk/newui-tailwind · @talelk/newui-tokens
                </td>
                <td class="p-2 text-ink-gray-7">
                  the tokens and the Tailwind layer — every class is spelled in
                  them
                </td>
              </tr>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/atoms"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Atoms
                  </A>{' '}
                </td>
                <td class="p-2 font-mono text-xs">
                  @talelk/newui-atoms · @talelk/newui-icons
                </td>
                <td class="p-2 text-ink-gray-7">
                  single controls and marks; Zag supplies keyboard, focus and
                  ARIA where a machine is needed
                </td>
              </tr>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/molecules"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Molecules
                  </A>
                </td>
                <td class="p-2 font-mono text-xs">@talelk/newui-molecules</td>
                <td class="p-2 text-ink-gray-7">
                  compound interactions built from atoms: fields, menus, pickers
                </td>
              </tr>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/organisms"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Organisms
                  </A>
                </td>
                <td class="p-2 font-mono text-xs">@talelk/newui-organisms</td>
                <td class="p-2 text-ink-gray-7">
                  independent sections: sidebars, toolbars, filter bars, boards
                </td>
              </tr>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/templates"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Templates
                  </A>
                </td>
                <td class="p-2 font-mono text-xs">@talelk/newui-templates</td>
                <td class="p-2 text-ink-gray-7">
                  page arrangement: the frame, navigation and page content
                </td>
              </tr>
              <tr class="border-t border-outline-gray-1">
                <td class="p-2">
                  <A
                    href="/pages"
                    class="text-ink-blue-6 underline decoration-dotted"
                  >
                    Pages
                  </A>
                </td>
                <td class="p-2 font-mono text-xs">your app</td>
                <td class="p-2 text-ink-gray-7">
                  the screens; every example on this site is one
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p class="text-base text-ink-gray-7">
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @talelk/newui-data
          </code>{' '}
          is the logic layer beside the levels — formatting, selection, undo,
          downloads, and the query/form logic under their own entries. Rendered
          tables and virtual lists are organisms, not data helpers.
        </p>
        <Code>{`pnpm add @talelk/newui-atoms @talelk/newui-molecules @talelk/newui-tailwind @talelk/newui-icons

# the composed levels and the logic layer
pnpm add @talelk/newui-organisms @talelk/newui-templates @talelk/newui-data`}</Code>
        <p class="text-base text-ink-gray-7">
          Add{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @talelk/newui-charts
          </code>
          ,{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @talelk/newui-editor
          </code>{' '}
          or{' '}
          <code class="rounded-3 bg-surface-gray-2 px-1 text-sm">
            @talelk/newui-code-editor
          </code>{' '}
          only when a screen needs them — each drags a large dependency with it
          (echarts, TipTap, CodeMirror), which is exactly why they are separate
          packages. Their widgets are filed by composition as organisms or
          molecules, not by package name.
        </p>
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
@import '@talelk/newui-tailwind/style.css';

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
        <Code>{`import { createColorScheme, UIProvider } from '@talelk/newui-atoms'
import { Toaster } from '@talelk/newui-molecules'

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
        <Code>{`import { Button } from '@talelk/newui-atoms'
import { Dialog } from '@talelk/newui-molecules'
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

      <PageSection id="next" title="Next">
        <p class="text-base text-ink-gray-7">
          Compose a page and wire data —{' '}
          <A href="/kit" class="text-ink-blue-6 underline decoration-dotted">
            Build an app
          </A>{' '}
          walks through the levels with the starter's own code.
        </p>
      </PageSection>

      <PackageGuides />
    </article>
  )
}
