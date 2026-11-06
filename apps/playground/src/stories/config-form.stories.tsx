import { Button } from '@talelk/newui-atoms'
import { createAppForm, type FieldConfig } from '@talelk/newui-data/form'
import { ConfigForm } from '@talelk/newui-organisms'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

interface Settings {
  mode: string
  host: string
  port: number
  notify: boolean
}

const ui: Record<string, FieldConfig<Settings>> = {
  mode: {
    type: 'select',
    label: 'Mode',
    options: [
      { label: 'Simple', value: 'simple' },
      { label: 'Advanced', value: 'advanced' },
    ],
  },
  host: {
    type: 'text',
    label: 'Host',
    description: 'Shown only in advanced mode.',
    when: (values) => values.mode === 'advanced',
  },
  port: {
    type: 'number',
    label: 'Port',
    when: (values) => values.mode === 'advanced',
  },
  notify: { type: 'checkbox', label: 'Notify on change' },
}

function useSettings(defaults: Settings) {
  return createAppForm<Settings>({
    defaultValues: defaults,
    ui,
    onSubmit: () => {},
  })
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  const app = useSettings({
    mode: 'simple',
    host: '',
    port: 8080,
    notify: false,
  })
  return (
    <div class="max-w-sm">
      <ConfigForm form={app.form} fields={ui}>
        <Button type="submit">Save</Button>
      </ConfigForm>
    </div>
  )
}

const meta = {
  title: 'Organisms/ConfigForm',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** A field hidden by `when` is absent from the document until its condition holds. */
export const Hidden: Story = {
  render: () => {
    const app = useSettings({
      mode: 'simple',
      host: '',
      port: 8080,
      notify: false,
    })
    return (
      <div class="max-w-sm">
        <ConfigForm form={app.form} fields={ui} />
      </div>
    )
  },
}
