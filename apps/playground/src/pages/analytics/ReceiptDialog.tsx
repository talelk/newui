import { Badge, Button } from '@newui/atoms'
import { usd as money } from '@newui/data'
import { Dialog } from '@newui/molecules'
import { type JSX, Show } from 'solid-js'
import type { Transaction } from './data'

export default function ReceiptDialog(props: {
  transaction: Transaction
  onClose: () => void
  onStatusChange: (id: string, status: Transaction['status']) => void
}): JSX.Element {
  return (
    <Dialog.Root
      open
      onOpenChange={(open) => {
        if (!open) props.onClose()
      }}
    >
      <Dialog.Content>
        <Dialog.Header>
          <Dialog.Title>Transaction {props.transaction.id}</Dialog.Title>
          <Dialog.Description>
            Review this local demo receipt and update its payment state.
          </Dialog.Description>
        </Dialog.Header>
        <div class="my-5 rounded-5 border border-outline-gray-1 bg-surface-gray-1 p-4">
          <p class="text-caption text-ink-gray-7">Amount</p>
          <p class="mt-1 text-metric tabular-nums">
            {money(props.transaction.amount)}
          </p>
          <Badge
            theme={
              props.transaction.status === 'Paid'
                ? 'green'
                : props.transaction.status === 'Pending'
                  ? 'amber'
                  : 'gray'
            }
          >
            {props.transaction.status}
          </Badge>
        </div>
        <dl class="grid grid-cols-2 gap-x-4 gap-y-3 text-interface">
          <dt class="text-ink-gray-7">Customer</dt>
          <dd class="text-end font-medium">{props.transaction.customer}</dd>
          <dt class="text-ink-gray-7">Region</dt>
          <dd class="text-end">{props.transaction.region}</dd>
          <dt class="text-ink-gray-7">Channel</dt>
          <dd class="text-end">{props.transaction.channel}</dd>
          <dt class="text-ink-gray-7">Date</dt>
          <dd class="text-end">Sep {props.transaction.day}, 2026</dd>
        </dl>
        <Dialog.Footer>
          <Button variant="outline" onClick={props.onClose}>
            Close receipt
          </Button>
          <Show
            when={props.transaction.status === 'Paid'}
            fallback={
              <Button
                variant="solid"
                theme="blue"
                onClick={() =>
                  props.onStatusChange(props.transaction.id, 'Paid')
                }
              >
                {props.transaction.status === 'Pending'
                  ? 'Mark paid'
                  : 'Restore payment'}
              </Button>
            }
          >
            <Button
              variant="solid"
              theme="red"
              onClick={() =>
                props.onStatusChange(props.transaction.id, 'Refunded')
              }
            >
              Refund demo transaction
            </Button>
          </Show>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog.Root>
  )
}
