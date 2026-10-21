import { ScrollTable, ScrollTableHead } from '@talelk/newui-molecules'
import { For } from 'solid-js'
import type { Meta, StoryObj } from 'storybook-solidjs-vite'

export function Demo() {
  return (
    <ScrollTable label="Quarterly cashflow table">
      <table class="w-full min-w-[720px] border-collapse text-start">
        <ScrollTableHead>
          <tr>
            <th class="p-3">Month</th>
            <th class="p-3">Operating</th>
            <th class="p-3">Investing</th>
            <th class="p-3">Financing</th>
            <th class="p-3">Net</th>
          </tr>
        </ScrollTableHead>
        <tbody>
          <For each={['January', 'February', 'March']}>
            {(month, index) => (
              <tr class="border-b border-outline-gray-1">
                <td class="p-3">{month}</td>
                <td class="p-3 tabular-nums">${42 + index() * 7}k</td>
                <td class="p-3 tabular-nums">${8 + index() * 2}k</td>
                <td class="p-3 tabular-nums">${12 + index() * 3}k</td>
                <td class="p-3 tabular-nums">${38 + index() * 6}k</td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </ScrollTable>
  )
}

const meta = {
  title: 'Molecules/ScrollTable',
  component: Demo,
  excludeStories: ['Demo'],
} satisfies Meta<typeof Demo>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
