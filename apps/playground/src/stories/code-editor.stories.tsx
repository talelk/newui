import { Button, Switch } from '@newui/atoms'
import { CodeEditor, type CodeEditorLanguage } from '@newui/code-editor'
import { Select } from '@newui/molecules'
import { createSignal } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo() {
  const [value, setValue] = createSignal('const revenue = 24680')
  const [language, setLanguage] = createSignal<CodeEditorLanguage>('javascript')
  const [readonly, setReadonly] = createSignal(false)
  return (
    <div class="flex flex-col gap-3">
      <div class="flex flex-wrap items-end gap-3">
        <Select
          label="Code language"
          value={language()}
          options={[
            'javascript',
            'typescript',
            'json',
            'html',
            'css',
            'python',
            'sql',
            'markdown',
          ].map((value) => ({ value, label: value }))}
          onValueChange={(value) =>
            setLanguage((value ?? 'typescript') as CodeEditorLanguage)
          }
        />
        <Switch
          label="Read-only code"
          checked={readonly()}
          onCheckedChange={setReadonly}
        />
        <Button onClick={() => setValue('const revenue = 24680')}>
          Reset document
        </Button>
      </div>
      <CodeEditor
        value={value()}
        onValueChange={setValue}
        language={language()}
        readonly={readonly()}
      />
      <output aria-live="polite" class="text-caption text-ink-gray-7">
        {value().length} characters
      </output>
    </div>
  )
}

const meta = {
  title: 'Organisms/CodeEditor',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** ReadOnly: the document stays visible and selectable, never editable. */
export const ReadOnly: Story = {
  render: () => {
    const [value, setValue] = createSignal('const revenue = 24680')
    return (
      <div class="flex flex-col gap-3">
        <CodeEditor
          value={value()}
          onValueChange={setValue}
          language="javascript"
          readonly
        />
        <output aria-live="polite" class="text-caption text-ink-gray-7">
          {value().length} characters
        </output>
      </div>
    )
  },
}
