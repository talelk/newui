import { createAppForm } from '@talelk/newui-data/form'
import { FormControl, Repeater } from '@talelk/newui-molecules'
import type { JSX } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

interface Row {
  title: string
}

function useItems(defaults: Row[]) {
  return createAppForm<{ items: Row[] }>({
    defaultValues: { items: defaults },
    onSubmit: () => {},
  })
}

/**
 * The demo the stories render, and the site's inline embed
 * (`excludeStories` keeps it out of the story index).
 */
export function Demo(): JSX.Element {
  const app = useItems([{ title: 'First row' }])
  return (
    <div class="flex max-w-md flex-col gap-4">
      <Repeater form={app.form} name="items" copyable>
        {(row) => (
          <row.Field
            name={`${row.name()}.title`}
            children={(field) => (
              <FormControl
                label="Title"
                value={(field().state.value as string) ?? ''}
                onInput={(event) =>
                  field().handleChange(
                    (event.currentTarget as HTMLInputElement).value,
                  )
                }
                onBlur={() => field().handleBlur()}
              />
            )}
          />
        )}
      </Repeater>
    </div>
  )
}

const meta = {
  title: 'Molecules/Inputs/Repeater',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

/** The live demo, exactly as the reference page embeds it. */
export const Default: Story = {}

/** Collapsed rows keep a long array scannable. */
export const Collapsible: Story = {
  render: () => {
    const app = useItems([{ title: 'First row' }, { title: 'Second row' }])
    return (
      <div class="flex max-w-md flex-col">
        <Repeater form={app.form} name="items" collapsible>
          {(row) => (
            <row.Field
              name={`${row.name()}.title`}
              children={(field) => (
                <FormControl
                  label="Title"
                  value={(field().state.value as string) ?? ''}
                  onInput={(event) =>
                    field().handleChange(
                      (event.currentTarget as HTMLInputElement).value,
                    )
                  }
                />
              )}
            />
          )}
        </Repeater>
      </div>
    )
  },
}

/** At `maxItems` the add button disappears — the ceiling is visible. */
export const Maxed: Story = {
  render: () => {
    const app = useItems([{ title: 'Only row' }])
    return (
      <div class="flex max-w-md flex-col">
        <Repeater form={app.form} name="items" maxItems={1}>
          {(row) => (
            <row.Field
              name={`${row.name()}.title`}
              children={(field) => (
                <FormControl
                  label="Title"
                  value={(field().state.value as string) ?? ''}
                  onInput={(event) =>
                    field().handleChange(
                      (event.currentTarget as HTMLInputElement).value,
                    )
                  }
                />
              )}
            />
          )}
        </Repeater>
      </div>
    )
  },
}
