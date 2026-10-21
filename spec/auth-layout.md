# AuthLayout

A public-access frame for sign-in, sign-up and recovery screens.

## Usage

```tsx
import { AuthLayout } from '@newui/templates'
import { AuthCard } from '@newui/organisms'

<AuthLayout brand={<Brand /> }>
  <AuthCard title="Sign in" description="Welcome back">
    <SignInForm />
  </AuthCard>
</AuthLayout>
```

The auth provider, form, card and footer remain app-owned. This template supplies
the centered responsive canvas; it does not imply a backend or a session model.

## Props

| prop | type | notes |
| --- | --- | --- |
| `brand` | `JSX.Element` | optional app identity above the content |
| `aside` | `JSX.Element` | optional desktop context panel beside the auth form |
| `header` | `JSX.Element` | optional top-edge controls, such as theme and return links |
| `children` | `JSX.Element` | the auth organism and its form |

## Behavior

- Centers a bounded auth flow in a viewport-height page with safe, responsive
  padding.
- Supports an optional brand without introducing a second page heading.
- An optional context panel appears beside the form at desktop width and is
  omitted on phones, where the form keeps the available measure.
- Uses semantic surface/ink tokens and remains legible in both color schemes.
