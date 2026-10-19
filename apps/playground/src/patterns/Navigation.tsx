import { BottomSheet, Button, Dialog, Menu, TextInput } from '@newui/ui'
import { A } from '@solidjs/router'
import { createSignal, For } from 'solid-js'
import { Notice } from '../examples/Notice'

export default function Navigation() {
  const [sheet, setSheet] = createSignal(false)
  const [dialog, setDialog] = createSignal(false)
  const [name, setName] = createSignal('Acme workspace')
  const [saved, setSaved] = createSignal('Acme workspace')
  const [notice, setNotice] = createSignal('')
  const action = (value: string) => {
    if (value === 'edit') setDialog(true)
    else if (value === 'copy') {
      setName(`${saved()} copy`)
      setSaved(`${saved()} copy`)
      setNotice('Workspace duplicated locally.')
    } else setNotice('All local changes are saved.')
  }
  const form = () => (
    <form
      class="mt-4 flex flex-col gap-4"
      onSubmit={(event) => {
        event.preventDefault()
        if (!name().trim()) return
        setSaved(name().trim())
        setNotice('Workspace name saved locally.')
        setDialog(false)
        setSheet(false)
      }}
    >
      <TextInput
        label="Workspace name"
        required
        value={name()}
        onInput={(event) => setName(event.currentTarget.value)}
      />
      <Button variant="solid" theme="blue" type="submit">
        Save workspace
      </Button>
    </form>
  )
  return (
    <div class="flex flex-col gap-8">
      <section>
        <h2 class="mb-4 text-section">Menu bar</h2>
        <nav
          aria-label="Workspace menu bar"
          class="flex flex-wrap gap-2 rounded-3 border border-outline-gray-1 p-2"
        >
          <For each={['File', 'Edit', 'View']}>
            {(label) => (
              <Menu.Root onSelect={action}>
                <Menu.Trigger class="h-8 rounded-3 px-3 text-interface hover:bg-surface-gray-2 focus-visible:focus-ring">
                  {label}
                </Menu.Trigger>
                <Menu.Content>
                  <Menu.Item value="edit">Edit workspace</Menu.Item>
                  <Menu.Item value="copy">Duplicate workspace</Menu.Item>
                  <Menu.Separator />
                  <Menu.Item value="save">Save changes</Menu.Item>
                </Menu.Content>
              </Menu.Root>
            )}
          </For>
        </nav>
        <p class="mt-3 text-caption text-ink-gray-7">
          Current workspace: {saved()}
        </p>
      </section>
      <section>
        <h2 class="mb-4 text-section">Grouped navigation</h2>
        <nav
          aria-label="Explore newui"
          class="flex flex-wrap items-start gap-3"
        >
          <details class="relative">
            <summary class="max-w-full cursor-pointer whitespace-normal break-words rounded-3 border border-outline-gray-2 px-3 py-2 text-interface focus-visible:focus-ring">
              Explore components
            </summary>
            <ul class="mt-2 space-y-1 rounded-5 border border-outline-gray-1 bg-surface-elevation-2 p-3 shadow-sm">
              <For
                each={[
                  ['Buttons', '/components/button'],
                  ['Forms', '/components/text-input'],
                  ['Overlays', '/components/dialog'],
                ]}
              >
                {(entry) => (
                  <li>
                    <A
                      href={entry[1] ?? '/components'}
                      class="block rounded-3 px-3 py-2 text-ink-blue-link hover:bg-surface-gray-2 focus-visible:focus-ring"
                    >
                      {entry[0]}
                    </A>
                  </li>
                )}
              </For>
            </ul>
          </details>
          <A
            href="/examples/analytics"
            class="min-w-0 max-w-full break-words rounded-3 px-3 py-2 text-ink-blue-link focus-visible:focus-ring"
          >
            Analytics dashboard
          </A>
          <A
            href="/docs"
            class="min-w-0 max-w-full break-words rounded-3 px-3 py-2 text-ink-blue-link focus-visible:focus-ring"
          >
            Documentation
          </A>
        </nav>
      </section>
      <section>
        <h2 class="mb-4 text-section">Dialog and drawer</h2>
        <div class="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => setDialog(true)}>
            Edit in a dialog
          </Button>
          <Button variant="outline" onClick={() => setSheet(true)}>
            Edit in a drawer
          </Button>
        </div>
        <Dialog.Root open={dialog()} onOpenChange={setDialog}>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Edit workspace</Dialog.Title>
              <Dialog.Description>
                Make a local change and save it.
              </Dialog.Description>
            </Dialog.Header>
            {form()}
          </Dialog.Content>
        </Dialog.Root>
        <BottomSheet
          open={sheet()}
          onOpenChange={setSheet}
          title="Edit workspace"
        >
          {form()}
        </BottomSheet>
      </section>
      <Notice text={notice()} onDismiss={() => setNotice('')} />
    </div>
  )
}
