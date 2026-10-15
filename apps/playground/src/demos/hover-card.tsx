import { HoverCard } from '@newui/ui'
export default function Demo() {
  return (
    <HoverCard.Root>
      <HoverCard.Trigger class="rounded-3 text-ink-blue-link underline decoration-dotted focus-visible:focus-ring">
        @rhea
      </HoverCard.Trigger>
      <HoverCard.Content>
        <p class="font-medium">Rhea Kapoor</p>
        <p class="mt-2 text-caption text-ink-gray-6">
          Product designer · Acme workspace
        </p>
      </HoverCard.Content>
    </HoverCard.Root>
  )
}
