import { Button, toast } from '@newui/ui'
export default function Demo() {
  return (
    <div class="flex flex-wrap gap-2">
      <Button
        onClick={() => toast.success({ title: 'Changes saved locally.' })}
      >
        Success toast
      </Button>
      <Button
        onClick={() => toast.error({ title: 'Could not save. Try again.' })}
      >
        Error toast
      </Button>
      <Button
        onClick={() =>
          toast.promise(Promise.resolve('Saved'), {
            loading: { title: 'Saving…' },
            success: { title: 'Saved locally.' },
            error: { title: 'Save failed.' },
          })
        }
      >
        Promise toast
      </Button>
    </div>
  )
}
