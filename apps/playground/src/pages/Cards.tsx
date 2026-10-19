import {
  Avatar,
  Badge,
  Button,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Checkbox,
  Icon,
  RadioGroup,
  Select,
  Switch,
  Textarea,
  TextInput,
} from '@newui/ui'
import { createSignal, For, type JSX, Show } from 'solid-js'
import { ExampleFrame } from '../examples/ExampleFrame'
import { isEmail } from '../examples/format'

function CreateAccount(): JSX.Element {
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [error, setError] = createSignal(false)
  const [saved, setSaved] = createSignal(false)
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Your next workspace starts here.</CardDescription>
      </CardHeader>
      <form
        noValidate
        class="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const valid = name().trim().length > 1 && isEmail(email())
          setError(!valid)
          setSaved(valid)
        }}
      >
        <TextInput
          label="Account name"
          required
          value={name()}
          onInput={(event) => setName(event.currentTarget.value)}
          error={
            error() && name().trim().length < 2 ? 'Enter your name.' : undefined
          }
        />
        <TextInput
          label="Account email"
          type="email"
          required
          value={email()}
          onInput={(event) => setEmail(event.currentTarget.value)}
          error={
            error() && !isEmail(email()) ? 'Enter a valid email.' : undefined
          }
        />
        <Button type="submit" variant="solid" theme="blue">
          Create demo account
        </Button>
      </form>
      <Show when={saved()}>
        <p role="status" class="text-caption text-ink-green-7">
          Demo account created for {name()}.
        </p>
      </Show>
    </Card>
  )
}

function PaymentMethod(): JSX.Element {
  const [method, setMethod] = createSignal('card')
  const [number, setNumber] = createSignal('4242 4242 4242 4242')
  const [name, setName] = createSignal('Rhea Kapoor')
  const [saved, setSaved] = createSignal(false)
  const [invalid, setInvalid] = createSignal(false)
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Payment method</CardTitle>
        <CardDescription>
          Add a demo payment method to the workspace.
        </CardDescription>
      </CardHeader>
      <RadioGroup
        label="Payment provider"
        value={method()}
        onValueChange={(value) => {
          setMethod(value)
          setSaved(false)
        }}
        orientation="horizontal"
        items={[
          { label: 'Card', value: 'card' },
          { label: 'PayPal', value: 'paypal' },
        ]}
      />
      <form
        noValidate
        class="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          const valid =
            method() === 'paypal' ||
            (/^\d{16}$/.test(number().replace(/\s/g, '')) &&
              name().trim().length > 1)
          setInvalid(!valid)
          setSaved(valid)
        }}
      >
        <Show when={method() === 'card'}>
          <TextInput
            label="Cardholder name"
            value={name()}
            onInput={(event) => setName(event.currentTarget.value)}
          />
          <TextInput
            label="Card number"
            value={number()}
            prefix={<Icon icon="lucide-credit-card" class="size-4" />}
            onInput={(event) => setNumber(event.currentTarget.value)}
            error={
              invalid()
                ? 'Use a 16-digit demo card number and a cardholder name.'
                : undefined
            }
          />
        </Show>
        <Show when={method() === 'paypal'}>
          <p class="text-interface text-ink-gray-7">
            Save PayPal as the preferred provider for this local demo.
          </p>
        </Show>
        <Button type="submit" variant="outline">
          Save payment method
        </Button>
      </form>
      <Show when={saved()}>
        <p role="status" class="text-caption text-ink-green-7">
          {method() === 'card'
            ? `Demo card ending ${number().replace(/\s/g, '').slice(-4)}`
            : 'Demo PayPal preference'}{' '}
          saved.
        </p>
      </Show>
    </Card>
  )
}

function TeamMembers(): JSX.Element {
  const [members, setMembers] = createSignal([
    { name: 'Rhea Kapoor', email: 'rhea@acme.example', role: 'Owner' },
    { name: 'Sam Rivera', email: 'sam@acme.example', role: 'Member' },
  ])
  const [invite, setInvite] = createSignal('')
  const [error, setError] = createSignal('')
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Team members</CardTitle>
        <CardDescription>
          Invite your team and decide who can do what.
        </CardDescription>
      </CardHeader>
      <For each={members()}>
        {(member, index) => (
          <div class="flex min-w-0 items-center gap-3">
            <Avatar label={member.name} size="md" />
            <div class="min-w-0 flex-1">
              <p class="truncate text-interface font-medium">{member.name}</p>
              <p class="truncate text-caption text-ink-gray-7">
                {member.email}
              </p>
            </div>
            <div class="w-24 shrink-0">
              <Select
                aria-label={`Role for ${member.name}`}
                disabled={member.role === 'Owner'}
                options={['Owner', 'Admin', 'Member'].map((value) => ({
                  value,
                  label: value,
                }))}
                value={[member.role]}
                onValueChange={(value) =>
                  setMembers((rows) =>
                    rows.map((row, i) =>
                      i === index()
                        ? { ...row, role: value[0] ?? 'Member' }
                        : row,
                    ),
                  )
                }
              />
            </div>
          </div>
        )}
      </For>
      <form
        noValidate
        class="flex flex-col gap-2 border-t border-outline-gray-1 pt-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (!isEmail(invite())) {
            setError('Enter a valid email.')
            return
          }
          if (members().some((member) => member.email === invite())) {
            setError('This person is already on the team.')
            return
          }
          setMembers((rows) => [
            ...rows,
            {
              name: invite().split('@')[0] ?? 'New member',
              email: invite(),
              role: 'Member',
            },
          ])
          setInvite('')
          setError('')
        }}
      >
        <TextInput
          label="Invite email"
          type="email"
          value={invite()}
          onInput={(event) => setInvite(event.currentTarget.value)}
          error={error() || undefined}
        />
        <Button type="submit" variant="outline" iconLeft="lucide-user-plus">
          Add demo member
        </Button>
      </form>
      <p role="status" class="text-caption text-ink-gray-7">
        {members().length} members in this workspace.
      </p>
    </Card>
  )
}

function ShareDocument(): JSX.Element {
  const [access, setAccess] = createSignal('view')
  const [copied, setCopied] = createSignal('')
  const url = 'https://acme.example/reports/september'
  const copy = () => {
    if (!navigator.clipboard) {
      setCopied('Select and copy the link above.')
      return
    }
    void navigator.clipboard
      .writeText(url)
      .then(() => setCopied('Link copied.'))
      .catch(() => setCopied('Select and copy the link above.'))
  }
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Share this document</CardTitle>
        <CardDescription>Keep the right people in the loop.</CardDescription>
      </CardHeader>
      <TextInput label="Document link" value={url} readonly />
      <Select
        label="Anyone with the link"
        value={[access()]}
        options={[
          { label: 'Can view', value: 'view' },
          { label: 'Can comment', value: 'comment' },
          { label: 'Can edit', value: 'edit' },
        ]}
        onValueChange={(value) => setAccess(value[0] ?? 'view')}
      />
      <Button variant="outline" iconLeft="lucide-copy" onClick={copy}>
        Copy link
      </Button>
      <p class="text-caption text-ink-gray-7" role="status">
        {copied() || `People with this link can ${access()}.`}
      </p>
    </Card>
  )
}

function Notifications(): JSX.Element {
  const [push, setPush] = createSignal(true)
  const [email, setEmail] = createSignal(true)
  const [digest, setDigest] = createSignal(false)
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
        <CardDescription>
          Choose the updates that matter to you.
        </CardDescription>
      </CardHeader>
      <Switch
        label="Push notifications"
        description="Updates about your assigned work."
        checked={push()}
        onCheckedChange={setPush}
      />
      <Switch
        label="Email notifications"
        checked={email()}
        onCheckedChange={setEmail}
      />
      <Switch
        label="Weekly digest"
        checked={digest()}
        onCheckedChange={setDigest}
      />
      <p class="text-caption text-ink-gray-7" role="status">
        {[push(), email(), digest()].filter(Boolean).length} notification
        channels enabled.
      </p>
    </Card>
  )
}

function ReportIssue(): JSX.Element {
  const [area, setArea] = createSignal('billing')
  const [priority, setPriority] = createSignal('medium')
  const [description, setDescription] = createSignal('')
  const [submitted, setSubmitted] = createSignal(false)
  const [error, setError] = createSignal('')
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Report an issue</CardTitle>
        <CardDescription>Tell us what happened so we can help.</CardDescription>
      </CardHeader>
      <form
        noValidate
        class="flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault()
          if (description().trim().length < 10) {
            setError('Describe the issue in at least 10 characters.')
            return
          }
          setError('')
          setSubmitted(true)
        }}
      >
        <div class="grid grid-cols-2 gap-3">
          <Select
            label="Area"
            value={[area()]}
            options={['billing', 'account', 'reports'].map((value) => ({
              value,
              label: value[0]?.toUpperCase() + value.slice(1),
            }))}
            onValueChange={(value) => setArea(value[0] ?? 'billing')}
          />
          <Select
            label="Issue priority"
            value={[priority()]}
            options={['low', 'medium', 'high'].map((value) => ({
              value,
              label: value[0]?.toUpperCase() + value.slice(1),
            }))}
            onValueChange={(value) => setPriority(value[0] ?? 'medium')}
          />
        </div>
        <Textarea
          label="What happened?"
          rows={3}
          value={description()}
          onInput={(event) => setDescription(event.currentTarget.value)}
          error={error() || undefined}
        />
        <Button type="submit" variant="solid" theme="blue">
          Submit demo report
        </Button>
      </form>
      <Show when={submitted()}>
        <p role="status" class="text-caption text-ink-green-7">
          Your {priority()} priority {area()} report is saved in this demo.
        </p>
      </Show>
    </Card>
  )
}

function WorkspaceCard(): JSX.Element {
  const [starred, setStarred] = createSignal(false)
  return (
    <Card class="gap-4">
      <div class="flex items-start justify-between">
        <span class="grid size-10 place-items-center rounded-5 bg-surface-blue-2 text-ink-blue-8">
          <Icon icon="lucide-chart-no-axes-combined" class="size-5" />
        </span>
        <Badge theme="green">Live demo</Badge>
      </div>
      <CardHeader>
        <CardTitle>Analytics workspace</CardTitle>
        <CardDescription>
          A clear view of revenue, channels, and the next opportunity.
        </CardDescription>
      </CardHeader>
      <div class="flex flex-wrap gap-2">
        <Button route="/examples/analytics/fullscreen" variant="outline">
          Open workspace
        </Button>
        <Button
          iconLeft="lucide-star"
          variant={starred() ? 'subtle' : 'ghost'}
          aria-pressed={starred()}
          onClick={() => setStarred(!starred())}
        >
          {starred() ? 'Starred' : 'Star project'}
        </Button>
      </div>
    </Card>
  )
}

function CookieSettings(): JSX.Element {
  const [analytics, setAnalytics] = createSignal(false)
  const [marketing, setMarketing] = createSignal(false)
  const [saved, setSaved] = createSignal(false)
  return (
    <Card class="gap-4">
      <CardHeader>
        <CardTitle>Cookie settings</CardTitle>
        <CardDescription>Keep control of your preferences.</CardDescription>
      </CardHeader>
      <Checkbox
        label="Essential cookies"
        description="Required for the workspace to work."
        checked
        disabled
      />
      <Switch
        label="Analytics cookies"
        checked={analytics()}
        onCheckedChange={(value) => {
          setAnalytics(value)
          setSaved(false)
        }}
      />
      <Switch
        label="Marketing cookies"
        checked={marketing()}
        onCheckedChange={(value) => {
          setMarketing(value)
          setSaved(false)
        }}
      />
      <Button variant="outline" onClick={() => setSaved(true)}>
        Save preferences
      </Button>
      <Show when={saved()}>
        <p role="status" class="text-caption text-ink-green-7">
          Your demo preferences are saved for this page.
        </p>
      </Show>
    </Card>
  )
}

export function Cards(): JSX.Element {
  return (
    <ExampleFrame
      section="Cards"
      title="Small surfaces. Useful patterns."
      description="Eight everyday compositions, built from the same compact controls and semantic surfaces."
    >
      <section aria-labelledby="card-patterns-title">
        <h2 id="card-patterns-title" class="mb-4 text-section">
          Everyday workspace patterns
        </h2>
        <div class="grid items-start gap-4 md:grid-cols-2 xl:grid-cols-3">
          <CreateAccount />
          <TeamMembers />
          <Notifications />
          <PaymentMethod />
          <ShareDocument />
          <ReportIssue />
          <WorkspaceCard />
          <CookieSettings />
        </div>
      </section>
    </ExampleFrame>
  )
}
