import {
  Avatar,
  Badge,
  Button,
  Icon,
  Switch,
  Textarea,
  TextInput,
} from '@talelk/newui-atoms'
import { isEmail } from '@talelk/newui-data'
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  RadioGroup,
  Select,
} from '@talelk/newui-molecules'
import { Section } from '@talelk/newui-organisms'
import { createSignal, For, type JSX, Show } from 'solid-js'
import { AppPage } from '../examples/AppPage'
import { sitePath } from '../lib/base'

/** Move focus to the first field the form marked invalid after submit. */
function focusFirstInvalid(form: HTMLFormElement) {
  queueMicrotask(() => {
    form.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
  })
}

function CreateAccount(): JSX.Element {
  const [name, setName] = createSignal('')
  const [email, setEmail] = createSignal('')
  const [attempted, setAttempted] = createSignal(false)
  const [saved, setSaved] = createSignal(false)
  const [savedName, setSavedName] = createSignal('')
  return (
    <Card class="gap-card-gap">
      <CardHeader>
        <CardTitle>Create an account</CardTitle>
        <CardDescription>Your next workspace starts here.</CardDescription>
      </CardHeader>
      <form
        noValidate
        class="flex flex-col gap-field-gap"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const valid = name().trim().length > 1 && isEmail(email())
          setAttempted(true)
          if (!valid) {
            setSaved(false)
            focusFirstInvalid(form)
            return
          }
          setAttempted(false)
          setSavedName(name().trim())
          setSaved(true)
        }}
      >
        <TextInput
          label="Account name"
          required
          value={name()}
          onInput={(event) => {
            setName(event.currentTarget.value)
            setSaved(false)
          }}
          error={
            attempted() && name().trim().length < 2
              ? 'Enter your name.'
              : undefined
          }
        />
        <TextInput
          label="Account email"
          type="email"
          required
          value={email()}
          onInput={(event) => {
            setEmail(event.currentTarget.value)
            setSaved(false)
          }}
          error={
            attempted() && !isEmail(email())
              ? 'Enter a valid email.'
              : undefined
          }
        />
        <Button
          type="submit"
          variant="solid"
          theme="blue"
          class="w-full sm:w-auto sm:self-start"
        >
          Create demo account
        </Button>
      </form>
      <Show when={saved()}>
        <p role="status" class="text-caption text-ink-green-7">
          Demo account created for {savedName()}.
        </p>
      </Show>
    </Card>
  )
}

function PaymentMethod(): JSX.Element {
  const [method, setMethod] = createSignal('card')
  const [number, setNumber] = createSignal('4242 4242 4242 4242')
  const [name, setName] = createSignal('Rhea Kapoor')
  const [attempted, setAttempted] = createSignal(false)
  const [savedMessage, setSavedMessage] = createSignal('')
  const numberDigits = () => number().replace(/\s/g, '')
  const cardNameInvalid = () =>
    attempted() && method() === 'card' && name().trim().length < 2
  const cardNumberInvalid = () =>
    attempted() && method() === 'card' && !/^\d{16}$/.test(numberDigits())
  return (
    <Card class="gap-card-gap">
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
          setAttempted(false)
          setSavedMessage('')
        }}
        orientation="horizontal"
        items={[
          { label: 'Card', value: 'card' },
          { label: 'PayPal', value: 'paypal' },
        ]}
      />
      <form
        noValidate
        class="flex flex-col gap-field-gap"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          setAttempted(true)
          if (method() === 'paypal') {
            setAttempted(false)
            setSavedMessage('Demo PayPal preference saved.')
            return
          }
          if (/^\d{16}$/.test(numberDigits()) && name().trim().length > 1) {
            setAttempted(false)
            setSavedMessage(
              `Demo card ending ${numberDigits().slice(-4)} saved.`,
            )
            return
          }
          setSavedMessage('')
          focusFirstInvalid(form)
        }}
      >
        <Show when={method() === 'card'}>
          <TextInput
            label="Cardholder name"
            value={name()}
            onInput={(event) => {
              setName(event.currentTarget.value)
              setSavedMessage('')
            }}
            error={cardNameInvalid() ? 'Enter the cardholder name.' : undefined}
          />
          <TextInput
            label="Card number"
            value={number()}
            prefix={<Icon icon="lucide-credit-card" class="size-4" />}
            onInput={(event) => {
              setNumber(event.currentTarget.value)
              setSavedMessage('')
            }}
            error={
              cardNumberInvalid()
                ? 'Use a 16-digit demo card number.'
                : undefined
            }
          />
        </Show>
        <Show when={method() === 'paypal'}>
          <p class="text-interface text-ink-gray-7">
            Save PayPal as the preferred provider for this local demo.
          </p>
        </Show>
        <Button
          type="submit"
          variant="outline"
          class="w-full sm:w-auto sm:self-start"
        >
          Save payment method
        </Button>
      </form>
      <Show when={savedMessage()}>
        <p role="status" class="text-caption text-ink-green-7">
          {savedMessage()}
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
    <Card class="gap-card-gap">
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
            <Show
              when={member.role === 'Owner'}
              fallback={
                <div class="w-24 shrink-0">
                  <Select
                    aria-label={`Role for ${member.name}`}
                    options={['Admin', 'Member'].map((value) => ({
                      value,
                      label: value,
                    }))}
                    value={member.role}
                    onValueChange={(value) =>
                      setMembers((rows) =>
                        rows.map((row, i) =>
                          i === index()
                            ? { ...row, role: value ?? 'Member' }
                            : row,
                        ),
                      )
                    }
                  />
                </div>
              }
            >
              <div class="flex w-24 shrink-0 justify-end">
                <Badge theme="gray" variant="subtle">
                  <span class="sr-only">Role: </span>Owner
                </Badge>
              </div>
            </Show>
          </div>
        )}
      </For>
      <form
        noValidate
        class="flex flex-col gap-control-gap border-t border-outline-gray-1 pt-3"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          if (!isEmail(invite())) {
            setError('Enter a valid email.')
            focusFirstInvalid(form)
            return
          }
          if (members().some((member) => member.email === invite())) {
            setError('This person is already on the team.')
            focusFirstInvalid(form)
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
          onInput={(event) => {
            setInvite(event.currentTarget.value)
            setError('')
          }}
          error={error() || undefined}
        />
        <Button
          type="submit"
          variant="outline"
          iconLeft="lucide-user-plus"
          class="w-full sm:w-auto sm:self-start"
        >
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
    <Card class="gap-card-gap">
      <CardHeader>
        <CardTitle>Share this document</CardTitle>
        <CardDescription>Keep the right people in the loop.</CardDescription>
      </CardHeader>
      <TextInput label="Document link" value={url} readonly />
      <Select
        label="Anyone with the link"
        value={access()}
        options={[
          { label: 'Can view', value: 'view' },
          { label: 'Can comment', value: 'comment' },
          { label: 'Can edit', value: 'edit' },
        ]}
        onValueChange={(value) => {
          setAccess(value ?? 'view')
          setCopied('')
        }}
      />
      <Button
        variant="outline"
        iconLeft="lucide-copy"
        onClick={copy}
        class="w-full sm:w-auto sm:self-start"
      >
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
    <Card class="gap-card-gap">
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
  const [summary, setSummary] = createSignal('')
  const [error, setError] = createSignal('')
  const resetFeedback = () => {
    setSummary('')
    setError('')
  }
  return (
    <Card class="gap-card-gap">
      <CardHeader>
        <CardTitle>Report an issue</CardTitle>
        <CardDescription>Tell us what happened so we can help.</CardDescription>
      </CardHeader>
      <form
        noValidate
        class="flex flex-col gap-field-gap"
        onSubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          if (description().trim().length < 10) {
            setSummary('')
            setError('Describe the issue in at least 10 characters.')
            focusFirstInvalid(form)
            return
          }
          setError('')
          setSummary(
            `Your ${priority()} priority ${area()} report is saved in this demo.`,
          )
        }}
      >
        <div class="grid grid-cols-2 gap-field-gap">
          <Select
            label="Area"
            value={area()}
            options={['billing', 'account', 'reports'].map((value) => ({
              value,
              label: value[0]?.toUpperCase() + value.slice(1),
            }))}
            onValueChange={(value) => {
              setArea(value ?? 'billing')
              resetFeedback()
            }}
          />
          <Select
            label="Issue priority"
            value={priority()}
            options={['low', 'medium', 'high'].map((value) => ({
              value,
              label: value[0]?.toUpperCase() + value.slice(1),
            }))}
            onValueChange={(value) => {
              setPriority(value ?? 'medium')
              resetFeedback()
            }}
          />
        </div>
        <Textarea
          label="What happened?"
          rows={3}
          value={description()}
          onInput={(event) => {
            setDescription(event.currentTarget.value)
            resetFeedback()
          }}
          error={error() || undefined}
        />
        <Button
          type="submit"
          variant="solid"
          theme="blue"
          class="w-full sm:w-auto sm:self-start"
        >
          Submit demo report
        </Button>
      </form>
      <Show when={summary()}>
        <p role="status" class="text-caption text-ink-green-7">
          {summary()}
        </p>
      </Show>
    </Card>
  )
}

function WorkspaceCard(): JSX.Element {
  const [starred, setStarred] = createSignal(false)
  return (
    <Card class="gap-card-gap">
      <div class="flex items-start justify-between">
        <span class="grid size-10 place-items-center rounded-card bg-surface-blue-2 text-ink-blue-8">
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
      <div class="flex flex-wrap gap-control-gap">
        <Button
          route={sitePath('/pages/analytics/fullscreen')}
          variant="outline"
        >
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
    <Card class="gap-card-gap">
      <CardHeader>
        <CardTitle>Cookie settings</CardTitle>
        <CardDescription>Keep control of your preferences.</CardDescription>
      </CardHeader>
      <div class="flex items-start gap-control-gap">
        <span
          aria-hidden="true"
          class="mt-0.5 grid size-3.5 shrink-0 place-items-center rounded-1 bg-ink-gray-9 text-surface-base"
        >
          <Icon icon="lucide-check" class="size-2.5" />
        </span>
        <div class="flex min-w-0 flex-col gap-1">
          <div class="flex flex-wrap items-center gap-control-gap">
            <span class="text-interface text-ink-gray-8">
              Essential cookies
            </span>
            <Badge theme="gray" variant="subtle">
              Always on
            </Badge>
          </div>
          <p class="text-caption text-ink-gray-7">
            Required for the workspace to work.
          </p>
        </div>
      </div>
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
      <Button
        variant="outline"
        onClick={() => setSaved(true)}
        class="w-full sm:w-auto sm:self-start"
      >
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
    <AppPage
      section="Cards"
      title="Small surfaces. Useful patterns."
      description="Eight everyday compositions, built from the same compact controls and semantic surfaces."
    >
      <Section
        id="card-patterns"
        title="Everyday workspace patterns"
        headingLevel={2}
        class="gap-card-gap"
      >
        <div class="grid items-start gap-card-gap md:grid-cols-2 xl:grid-cols-3">
          <CreateAccount />
          <TeamMembers />
          <Notifications />
          <PaymentMethod />
          <ShareDocument />
          <ReportIssue />
          <WorkspaceCard />
          <CookieSettings />
        </div>
      </Section>
    </AppPage>
  )
}
