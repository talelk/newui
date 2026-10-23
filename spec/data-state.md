# DataState

The one loading, empty and error contract for data organisms.

## Props

| prop | type | default | notes |
| --- | --- | --- | --- |
| `status` | `'ready' \| 'loading' \| 'empty' \| 'error'` | required | state to render |
| `skeleton` | `'rows' \| 'cards' \| 'chart'` | `rows` | loading geometry |
| `rows` | `number` | `5` | skeleton row count |
| `title` | `JSX.Element` | state default | empty/error title |
| `description` | `JSX.Element` | — | supporting copy |
| `action` | `JSX.Element` | — | empty action |
| `error` | `JSX.Element` | — | error message |
| `onRetry` | `() => void` | — | renders “Try again” |
| `children` | `JSX.Element` | — | ready content |

## Behavior

- **Ready** renders children unchanged; it is not wrapped in another surface.
- **Loading** renders `Skeleton` shapes that preserve the final layout. It is a
  polite status region labelled “Loading”.
- **Empty** uses `EmptyState` with one action.
- **Error** uses `EmptyState` with an alert role, the error message and a
  “Try again” action when `onRetry` is provided.
- Organisms should not hand-roll state markup; they pass their data status to
  this component.
