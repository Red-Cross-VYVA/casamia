import { Check, ChevronRight } from 'lucide-react'
import type { ReactNode } from 'react'

type WizardChoiceCardProps = {
  label: string
  description?: string
  icon: ReactNode
  selected: boolean
  multiple?: boolean
  onSelect: () => void
  detailsLabel?: string
  detailsCount?: number
  detailsAriaLabel?: string
  detailsDialogId?: string
  onDetails?: (trigger: HTMLButtonElement) => void
}

export function WizardChoiceCard({
  label,
  description,
  icon,
  selected,
  multiple = false,
  onSelect,
  detailsLabel,
  detailsCount,
  detailsAriaLabel,
  detailsDialogId,
  onDetails,
}: WizardChoiceCardProps) {
  const choiceButton = (
    <button
      aria-pressed={selected}
      className={`safety-wizard-choice${selected ? ' is-selected' : ''}`}
      onClick={onSelect}
      type="button"
    >
      <span className="safety-wizard-choice-icon" aria-hidden="true">{icon}</span>
      <span className="safety-wizard-choice-copy">
        <strong>{label}</strong>
        {description ? <small>{description}</small> : null}
      </span>
      <span className={`safety-wizard-choice-check${multiple ? ' is-square' : ''}`} aria-hidden="true">
        {selected ? <Check size={18} strokeWidth={3} /> : null}
      </span>
    </button>
  )

  if (!detailsLabel || !onDetails) {
    return choiceButton
  }

  return (
    <div className={`safety-wizard-choice-shell${selected ? ' is-selected' : ''}`}>
      {choiceButton}
      <button
        aria-controls={detailsDialogId}
        aria-haspopup="dialog"
        aria-label={detailsAriaLabel}
        className="safety-wizard-choice-details"
        onClick={(event) => onDetails(event.currentTarget)}
        type="button"
      >
        <span>{detailsLabel}</span>
        {typeof detailsCount === 'number' ? (
          <span className="safety-wizard-choice-details-count">{detailsCount}</span>
        ) : null}
        <ChevronRight size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
