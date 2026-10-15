import { Dropdown, toast } from '@newui/ui'
export default function Demo() {
  return (
    <Dropdown
      options={[
        { label: 'Edit workspace', value: 'edit', icon: 'lucide-pencil' },
        { label: 'Duplicate', value: 'duplicate', icon: 'lucide-copy' },
        { label: 'Delete', value: 'delete', danger: true },
      ]}
      onSelect={(value) => toast.info({ title: `Selected ${value}` })}
    >
      Workspace actions
    </Dropdown>
  )
}
