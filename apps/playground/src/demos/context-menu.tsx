import { ContextMenu, toast } from '@newui/ui'
export default function Demo() {
  return (
    <ContextMenu.Root
      onSelect={(value) => toast.info({ title: `Selected ${value}` })}
    >
      <ContextMenu.Trigger class="grid min-h-32 place-content-center rounded-5 border border-dashed border-outline-gray-3 p-6 text-interface text-ink-gray-6 focus-visible:focus-ring">
        Right-click, or press Shift+F10
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item value="copy">Copy</ContextMenu.Item>
        <ContextMenu.Item value="rename">Rename</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  )
}
