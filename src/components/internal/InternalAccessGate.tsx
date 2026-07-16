import { LockKeyhole, ShieldCheck } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'

import {
  hasInternalAuthSession,
  isLocalInternalDemoAvailable,
  loginInternalAdmin,
  startLocalInternalDemoSession,
} from '../../services/internalAuth'

export function InternalAccessGate({ children }: { children: ReactNode }) {
  const [hasAccess, setHasAccess] = useState(() => hasInternalAuthSession())
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    setError('')

    try {
      await loginInternalAdmin(password)
      setHasAccess(true)
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : 'Unable to verify admin access.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleLocalDemo() {
    startLocalInternalDemoSession()
    setHasAccess(true)
  }

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <section className="min-h-screen bg-pale-blue px-6 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-2xl border border-border bg-white shadow-soft lg:grid-cols-[0.95fr_1.05fr]">
          <div className="bg-navy p-8 text-white md:p-10">
            <span className="font-display text-4xl font-bold leading-none text-white" aria-hidden="true">
              Casa<span className="text-blue">Mia</span>
            </span>
            <div className="mt-16 inline-grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-blue">
              <ShieldCheck size={34} aria-hidden="true" />
            </div>
            <h1 className="mt-8 font-display text-5xl font-bold leading-none">
              CasaMia internal access
            </h1>
            <p className="mt-5 max-w-md text-lg font-bold leading-relaxed text-white/80">
              Manage visits, proposals and service catalogue content from the protected operations area.
            </p>
          </div>

          <form className="p-8 md:p-10" onSubmit={handleSubmit}>
            <div className="inline-flex items-center gap-2 rounded-full bg-pale-blue px-4 py-2 text-sm font-black uppercase tracking-wide text-blue">
              <LockKeyhole size={17} aria-hidden="true" />
              Admin only
            </div>
            <h2 className="mt-8 font-display text-4xl font-bold text-text-dark">Enter the admin password.</h2>
            <p className="mt-3 text-base font-bold leading-relaxed text-text-muted">
              This keeps the internal tools separate from the public CasaMia site.
            </p>

            <label className="mt-8 grid gap-2">
              <span className="text-xs font-black uppercase tracking-wide text-text-muted">Admin password</span>
              <input
                className="min-h-14 rounded-lg border border-border bg-light-blue/40 px-4 text-lg font-bold text-text-dark outline-none transition focus:border-blue focus:bg-white"
                autoComplete="current-password"
                autoFocus
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </label>

            {error ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700" role="alert">
                {error}
              </p>
            ) : null}

            <div className="mt-8 flex flex-wrap gap-3">
              <button className="btn btn-navy" type="submit" disabled={isSubmitting || password.trim().length === 0}>
                {isSubmitting ? 'Checking...' : 'Enter internal panel'}
              </button>
              {isLocalInternalDemoAvailable() ? (
                <button className="btn btn-white" type="button" onClick={handleLocalDemo}>
                  Local demo mode
                </button>
              ) : null}
            </div>
          </form>
        </div>
      </div>
    </section>
  )
}
