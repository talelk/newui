/** Inert catalog glyphs never mount demos or fetch their machines. */
export function CatalogIcon(props: { group?: string; icon?: string }) {
  return (
    <span
      aria-hidden="true"
      class={`size-4 shrink-0 text-ink-gray-7 ${props.icon ?? (props.group === 'Charts' ? 'lucide-chart-no-axes-combined' : props.group === 'Editors' ? 'lucide-square-pen' : props.group === 'Actions' ? 'lucide-mouse-pointer-2' : props.group === 'Forms' ? 'lucide-text-cursor-input' : 'lucide-component')}`}
    />
  )
}
