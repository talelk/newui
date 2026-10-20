import { createSignal } from 'solid-js'

/**
 * A demo session.
 *
 * The kit ships no auth backend (spec/kit.md, "Not an app framework"), so the
 * starter keeps the *shape* of one: who is signed in, a way in, a way out. An
 * app replaces this module with its own provider and nothing above it changes.
 */
export interface Session {
  name: string
  email: string
}

const [session, setSession] = createSignal<Session | null>(null)

export { session }

export function signIn(input: Session): void {
  setSession(input)
}

export function signOut(): void {
  setSession(null)
}
