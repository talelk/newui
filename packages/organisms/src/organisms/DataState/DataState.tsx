import { Button, Skeleton } from '@talelk/newui-atoms'
import { EmptyState } from '@talelk/newui-molecules'
import { For, type JSX, Show } from 'solid-js'

export type DataStatus = 'ready' | 'loading' | 'empty' | 'error'
export type DataSkeleton = 'rows' | 'cards' | 'chart'

export interface DataStateProps {
  status: DataStatus
  /** Skeleton shape while loading. @default 'rows' */
  skeleton?: DataSkeleton
  /** Skeleton row count. @default 5 */
  rows?: number
  title?: JSX.Element
  description?: JSX.Element
  action?: JSX.Element
  error?: JSX.Element
  onRetry?: () => void
  children?: JSX.Element
}

function Loading(props: { skeleton: DataSkeleton; rows: number }): JSX.Element {
  return (
    <div
      data-slot="data-state-loading"
      role="status"
      aria-label="Loading"
      class="p-card-pad"
    >
      <Show when={props.skeleton === 'rows'}>
        <div class="flex flex-col gap-2">
          <For each={Array.from({ length: props.rows })}>
            {() => <Skeleton lines={1} class="h-9" />}
          </For>
        </div>
      </Show>
      <Show when={props.skeleton === 'cards'}>
        <div class="grid grid-cols-1 gap-3 min-[360px]:grid-cols-2 xl:grid-cols-4">
          <For each={Array.from({ length: 4 })}>
            {() => <Skeleton lines={3} class="h-24" />}
          </For>
        </div>
      </Show>
      <Show when={props.skeleton === 'chart'}>
        <Skeleton lines={4} class="h-64" />
      </Show>
    </div>
  )
}

/**
 * The one loading / empty / error contract for data organisms.
 *
 * It composes the existing `Skeleton` and `EmptyState` molecules, so every
 * region uses the same tone and action placement. `ready` renders its children
 * unchanged.
 */
export function DataState(props: DataStateProps): JSX.Element {
  return (
    <Show
      when={props.status === 'ready'}
      fallback={<StateFallback {...props} />}
    >
      {props.children}
    </Show>
  )
}

function StateFallback(props: DataStateProps): JSX.Element {
  return (
    <Show
      when={props.status === 'loading'}
      fallback={
        <Show
          when={props.status === 'error'}
          fallback={
            <div data-slot="data-state-empty">
              <EmptyState
                icon="lucide-inbox"
                title={props.title ?? 'Nothing here yet'}
                description={props.description}
                action={props.action}
              />
            </div>
          }
        >
          <div data-slot="data-state-error" role="alert">
            <EmptyState
              icon="lucide-triangle-alert"
              title={props.title ?? 'Could not load this'}
              description={props.error ?? props.description}
              action={
                props.onRetry ? (
                  <Button variant="outline" onClick={props.onRetry}>
                    Try again
                  </Button>
                ) : (
                  props.action
                )
              }
            />
          </div>
        </Show>
      }
    >
      <Loading skeleton={props.skeleton ?? 'rows'} rows={props.rows ?? 5} />
    </Show>
  )
}
