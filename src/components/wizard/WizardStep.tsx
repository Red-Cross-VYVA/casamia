import type { ReactNode } from 'react'

type WizardStepProps = {
  title: string
  body?: string
  hint?: string
  icon?: ReactNode
  children: ReactNode
  compact?: boolean
}

export function WizardStep({ title, body, hint, icon, children, compact = false }: WizardStepProps) {
  return (
    <section className={`safety-wizard-step${compact ? ' is-compact' : ''}`} aria-labelledby="wizard-step-title">
      <header className={`safety-wizard-step-heading${icon ? ' has-icon' : ''}`}>
        {icon ? <span aria-hidden="true">{icon}</span> : null}
        <div>
          <h1 id="wizard-step-title">{title}</h1>
          {body ? <p>{body}</p> : null}
          {hint ? <small>{hint}</small> : null}
        </div>
      </header>
      {children}
    </section>
  )
}
