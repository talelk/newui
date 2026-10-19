# @newui/layouts

The template level: a page's *shape*.

A component answers "what is this control"; a block answers "how does this
section open"; a layout answers "how does the page open" — the frame, where the
title and the actions live, whether the filters are in a toolbar or a row, and
what a phone does with the navigation.

```tsx
<AppLayout
  eyebrow="Workspace / Deals"
  title="Build a healthier pipeline"
  description="Every opportunity, a clear next step."
  actions={<Button>New deal</Button>}
  sidebar={<WorkspaceNav … />}
>
  <DealsBoard />
</AppLayout>
```

Layouts depend on `@newui/ui` and `@newui/blocks`, in that direction only. An
app brings its own brand, its own header controls and its own footer; the
layout owns the arrangement.
