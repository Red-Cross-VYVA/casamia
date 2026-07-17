import { CalendarCheck, Check, Home } from 'lucide-react'

import type { WizardCopy } from '../../config/wizardCopy'
import { WizardStep } from './WizardStep'

type VisitBookingStepProps = {
  copy: WizardCopy
  selected: boolean
  onSelect: (selected: boolean) => void
}

export function VisitBookingStep({ copy, selected, onSelect }: VisitBookingStepProps) {
  return (
    <WizardStep title={copy.visit.title} body={copy.visit.body} hint={copy.micro.optional} icon={<Home size={28} />}>
      <div className={`safety-wizard-visit-card${selected ? ' is-selected' : ''}`}>
        <div className="safety-wizard-visit-price">
          <span><CalendarCheck size={22} aria-hidden="true" /></span>
          <strong>{copy.visit.price}</strong>
        </div>
        <ul>
          <li><Check size={19} aria-hidden="true" /> {copy.visit.credit}</li>
          <li><Check size={19} aria-hidden="true" /> {copy.visit.example}</li>
        </ul>
        <div className="safety-wizard-visit-actions">
          <button className="btn btn-navy" onClick={() => onSelect(true)} type="button">
            <CalendarCheck size={20} aria-hidden="true" /> {selected ? copy.visit.selected : copy.visit.book}
          </button>
          <button className="safety-wizard-text-button" onClick={() => onSelect(false)} type="button">{copy.visit.without}</button>
        </div>
      </div>
    </WizardStep>
  )
}
