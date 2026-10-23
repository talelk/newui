import { Button, TextInput } from '@talelk/newui-atoms'
import { usd as currency } from '@talelk/newui-data'
import { DatePicker, Dialog, Select } from '@talelk/newui-molecules'
import { createSignal, Show } from 'solid-js'
import {
  CATEGORIES,
  type Employee,
  type Transaction,
} from '../../examples/accounting-data'
import { CreateDialog } from '../../examples/CreateDialog'

export default function AccountingDialogs(props: {
  open: boolean
  employeeOpen: boolean
  confirm: {
    kind: 'expenses' | 'payroll'
    count: number
    total: number
    skipped: number
  } | null
  onOpenChange: (open: boolean) => void
  onEmployeeOpenChange: (open: boolean) => void
  onConfirmOpenChange: (open: boolean) => void
  onConfirm: () => void
  onTransaction: (row: Transaction) => void
  onEmployee: (row: Employee) => void
  onNotice: (message: string) => void
  nextId: () => number
}) {
  const [description, setDescription] = createSignal('')
  const [amount, setAmount] = createSignal('')
  const [category, setCategory] = createSignal('Revenue')
  const [date, setDate] = createSignal('2026-09-30')
  const [employeeName, setEmployeeName] = createSignal('')
  const [role, setRole] = createSignal('')
  const [salary, setSalary] = createSignal('')

  return (
    <>
      <CreateDialog
        open={props.open}
        onOpenChange={props.onOpenChange}
        title="Add a transaction"
        description="Record an income or expense in the local ledger."
        submitLabel="Record transaction"
        onSubmit={() => {
          if (
            !description().trim() ||
            !Number.isFinite(Number(amount())) ||
            Number(amount()) <= 0 ||
            !date()
          )
            return
          props.onTransaction({
            id: `TXN-${props.nextId()}`,
            description: description().trim(),
            category: category(),
            amount: Number(amount()),
            date: date(),
            status: 'Posted',
          })
          props.onOpenChange(false)
          props.onNotice('Transaction posted to the local ledger.')
          setDescription('')
          setAmount('')
        }}
        fields={(attempted) => (
          <>
            <TextInput
              label="Transaction description"
              required
              value={description()}
              onInput={(event) => setDescription(event.currentTarget.value)}
              error={
                attempted() && !description().trim()
                  ? 'Describe the transaction.'
                  : undefined
              }
            />
            <TextInput
              label="Amount in USD"
              type="number"
              required
              value={amount()}
              onInput={(event) => setAmount(event.currentTarget.value)}
              error={
                attempted() &&
                (!Number.isFinite(Number(amount())) || Number(amount()) <= 0)
                  ? 'Enter an amount greater than zero.'
                  : undefined
              }
            />
            <Select
              label="Transaction category"
              value={category()}
              options={CATEGORIES.map((value) => ({ label: value, value }))}
              onValueChange={(value) => setCategory(value ?? 'Revenue')}
            />
            <DatePicker
              label="Transaction date"
              value={date()}
              onValueChange={setDate}
              required
              error={
                attempted() && !date()
                  ? 'Choose a transaction date.'
                  : undefined
              }
            />
          </>
        )}
      />
      <CreateDialog
        open={props.employeeOpen}
        onOpenChange={props.onEmployeeOpenChange}
        title="Add an employee"
        description="Add a team member to September payroll."
        submitLabel="Create employee"
        onSubmit={() => {
          if (
            !employeeName().trim() ||
            !role().trim() ||
            !Number.isFinite(Number(salary())) ||
            Number(salary()) <= 0
          )
            return
          props.onEmployee({
            id: `EMP-${props.nextId()}`,
            name: employeeName().trim(),
            role: role().trim(),
            salary: Number(salary()),
            status: 'Pending',
          })
          props.onEmployeeOpenChange(false)
          props.onNotice('Employee added to local payroll.')
          setEmployeeName('')
          setRole('')
          setSalary('')
        }}
        fields={(attempted) => (
          <>
            <TextInput
              label="Employee name"
              required
              value={employeeName()}
              onInput={(event) => setEmployeeName(event.currentTarget.value)}
              error={
                attempted() && !employeeName().trim()
                  ? 'Enter a name.'
                  : undefined
              }
            />
            <TextInput
              label="Employee role"
              required
              value={role()}
              onInput={(event) => setRole(event.currentTarget.value)}
              error={
                attempted() && !role().trim() ? 'Enter a role.' : undefined
              }
            />
            <TextInput
              label="Monthly salary in USD"
              type="number"
              required
              value={salary()}
              onInput={(event) => setSalary(event.currentTarget.value)}
              error={
                attempted() &&
                (!Number.isFinite(Number(salary())) || Number(salary()) <= 0)
                  ? 'Enter a salary greater than zero.'
                  : undefined
              }
            />
          </>
        )}
      />
      <Show when={props.confirm}>
        {(request) => (
          <Dialog.Root
            open={Boolean(props.confirm)}
            onOpenChange={props.onConfirmOpenChange}
          >
            <Dialog.Content>
              <Dialog.Header>
                <Dialog.Title>
                  {request().kind === 'expenses'
                    ? 'Approve expenses?'
                    : 'Record payroll payments?'}
                </Dialog.Title>
                <Dialog.Description>
                  This updates the local ledger. You can undo immediately
                  afterwards.
                </Dialog.Description>
              </Dialog.Header>
              <p class="mt-4 text-interface text-ink-gray-8">
                {request().count}{' '}
                {request().kind === 'expenses'
                  ? request().count === 1
                    ? 'expense'
                    : 'expenses'
                  : request().count === 1
                    ? 'payment'
                    : 'payments'}{' '}
                · {currency(request().total)}
              </p>
              <Show when={request().skipped > 0}>
                <p class="mt-1 text-caption text-ink-gray-7">
                  {request().skipped}{' '}
                  {request().kind === 'expenses'
                    ? 'already posted'
                    : 'already paid'}{' '}
                  and will be skipped.
                </p>
              </Show>
              <Dialog.Footer>
                <Button
                  variant="outline"
                  onClick={() => props.onConfirmOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="solid"
                  theme="blue"
                  onClick={() => {
                    props.onConfirm()
                    props.onConfirmOpenChange(false)
                  }}
                >
                  {request().kind === 'expenses'
                    ? 'Approve expenses'
                    : 'Record payments'}
                </Button>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Root>
        )}
      </Show>
    </>
  )
}
