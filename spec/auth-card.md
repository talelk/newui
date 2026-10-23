# AuthCard

`AuthCard` — the card a sign-in, sign-up or reset screen sits in.

## Props

| prop | type | notes |
| --- | --- | --- |
| `title` | `JSX.Element` | rendered as the card's `h1` |
| `description` | `JSX.Element` | one line under the title |
| `children` | `JSX.Element` | the form: fields and the submit button |
| `error` | `JSX.Element` | form-level failure summary above the fields |
| `providers` | `AuthProvider[]` | social/sso buttons, in order |
| `footer` | `JSX.Element` | "Don't have an account? Sign up" |
| `logo` | `JSX.Element` | mark above the title |
| `class` | `string` | |

## Behavior

- One block rather than three screens, because sign-in, sign-up and reset are the
  same layout with different fields.
- The measure is capped at `max-w-sm` so fields do not stretch on a wide display,
  and the title is the page's only `h1`.
- The column is the card surface (`bg-surface-elevation-1`, one-step border,
  `rounded-card`, `p-card-pad-wide`) and is flat at rest. The page canvas and
  centring belong to `AuthLayout`; `AuthCard` does not add a second full-page
  surface.
- The title uses the Heading role; it is the screen's only `h1`.
- The "or" divider appears only when there are providers *and* a form.
- Lucide has no brand glyphs, so a provider's mark is passed as a component
  (`icon` takes a `lucide-*` string or a component).

## Not yet

No two-factor step and no password-strength meter; both are forms inside
`children`.
