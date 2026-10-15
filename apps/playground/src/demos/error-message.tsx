import { ErrorMessage } from '@newui/ui'
export default function Demo() {
  return (
    <ErrorMessage
      message={[
        'The workspace name is already taken.',
        'Choose another name to continue.',
      ]}
    />
  )
}
