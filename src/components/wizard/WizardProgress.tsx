type WizardProgressProps = {
  progress: number
  current: number
  total: number
  label: string
  stepLabel: string
  ofLabel: string
}

export function WizardProgress({ progress, current, total, label, stepLabel, ofLabel }: WizardProgressProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(progress * 100)))

  return (
    <div className="safety-wizard-progress" aria-label={label} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percentage}>
      <div className="safety-wizard-progress-copy">
        <span>{stepLabel} {Math.max(1, current)} {ofLabel} {Math.max(1, total)}</span>
        <strong>{percentage}%</strong>
      </div>
      <span className="safety-wizard-progress-track" aria-hidden="true">
        <span style={{ width: `${percentage}%` }} />
      </span>
    </div>
  )
}
