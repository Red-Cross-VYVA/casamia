import { ArrowLeft, BookmarkCheck } from 'lucide-react'
import type { ReactNode } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import { BrandLogo } from '../BrandLogo'
import { WizardProgress } from './WizardProgress'

type WizardLayoutProps = {
  children: ReactNode
  copy: WizardCopy
  currentIndex: number
  totalSteps: number
  progress: number
  canGoBack: boolean
  saved: boolean
  onBack: () => void
  onSave: () => void
}

export function WizardLayout({
  children,
  copy,
  currentIndex,
  totalSteps,
  progress,
  canGoBack,
  saved,
  onBack,
  onSave,
}: WizardLayoutProps) {
  return (
    <div className="safety-wizard-page">
      <div className="safety-wizard-shell">
        <header className="safety-wizard-toolbar">
          <BrandLogo />
          <button
            aria-label={saved ? copy.nav.saved : copy.nav.save}
            className="safety-wizard-save"
            title={saved ? copy.nav.saved : copy.nav.save}
            type="button"
            onClick={onSave}
          >
            <BookmarkCheck size={19} aria-hidden="true" />
            <span>{saved ? copy.nav.saved : copy.nav.save}</span>
          </button>
        </header>

        {currentIndex > 0 ? (
          <div className="safety-wizard-navigation">
            <button className="safety-wizard-back" disabled={!canGoBack} onClick={onBack} type="button">
              <ArrowLeft size={20} aria-hidden="true" />
              {copy.nav.back}
            </button>
            <WizardProgress
              progress={progress}
              current={currentIndex}
              total={Math.max(1, totalSteps - 1)}
              label={copy.progress.label}
              stepLabel={copy.progress.step}
              ofLabel={copy.progress.of}
            />
          </div>
        ) : null}

        <div className="safety-wizard-stage">{children}</div>
      </div>
    </div>
  )
}
