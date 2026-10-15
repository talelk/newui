import { Button, DatePicker, Dialog, Select, TextInput } from '@newui/ui'
import { createSignal } from 'solid-js'
import {
  CATEGORIES,
  type Employee,
  type Transaction,
} from '../../examples/accounting-data'

export default function AccountingDialogs(props: {
  open: boolean
  employeeOpen: boolean
  onOpenChange: (open: boolean) => void
  onEmployeeOpenChange: (open: boolean) => void
  onTransaction: (row: Transaction) => void
  onEmployee: (row: Employee) => void
  onNotice: (message: string) => void
  nextId: () => number
}) {
  const [description, setDescription] = createSignal('')
  const [amount, setAmount] = createSignal('')
  const [category, setCategory] = createSignal('Revenue')
  const [date, setDate] = createSignal('2026-09-30')
  const [attempted, setAttempted] = createSignal(false)
  const [employeeName, setEmployeeName] = createSignal('')
  const [role, setRole] = createSignal('')
  const [salary, setSalary] = createSignal('')

  return (
    <>
      {' '}
      <Dialog.Root open={props.open} onOpenChange={props.onOpenChange}>
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add a transaction</Dialog.Title>
            <Dialog.Description>
              Record an income or expense in the local ledger.
            </Dialog.Description>
          </Dialog.Header>
          <form
            noValidate
            class="mt-5 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setAttempted(true)
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
          >
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
              value={[category()]}
              options={CATEGORIES.map((value) => ({ label: value, value }))}
              onValueChange={(value) => setCategory(value[0] ?? 'Revenue')}
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
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => props.onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Record transaction
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
      <Dialog.Root
        open={props.employeeOpen}
        onOpenChange={props.onEmployeeOpenChange}
      >
        <Dialog.Content>
          <Dialog.Header>
            <Dialog.Title>Add an employee</Dialog.Title>
            <Dialog.Description>
              Add a team member to September payroll.
            </Dialog.Description>
          </Dialog.Header>
          <form
            noValidate
            class="mt-5 flex flex-col gap-4"
            onSubmit={(event) => {
              event.preventDefault()
              setAttempted(true)
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
          >
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
            <Dialog.Footer>
              <Button
                variant="outline"
                onClick={() => props.onEmployeeOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="solid" theme="blue">
                Create employee
              </Button>
            </Dialog.Footer>
          </form>
        </Dialog.Content>
      </Dialog.Root>
    </>
  )
}
