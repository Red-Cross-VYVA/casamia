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
  canSave?: boolean
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  onBack: () => void
  onSave: () => void | Promise<void>
}

export function WizardLayout({
  children,
  copy,
  currentIndex,
  totalSteps,
  progress,
  canGoBack,
  canSave = true,
  saveStatus = 'idle',
  onBack,
  onSave,
}: WizardLayoutProps) {
  const saveLabel = saveStatus === 'saving'
    ? copy.nav.saving
    : saveStatus === 'saved'
      ? copy.nav.saved
      : saveStatus === 'error'
        ? copy.nav.saveError
        : copy.nav.save

  return (
    <div className="safety-wizard-page">
      <div className="safety-wizard-shell">
        <header className="safety-wizard-toolbar">
          <BrandLogo />
          {canSave ? (
            <button
              aria-label={saveLabel}
              className="safety-wizard-save"
              disabled={saveStatus === 'saving'}
              title={saveLabel}
              type="button"
              onClick={onSave}
            >
              <BookmarkCheck size={19} aria-hidden="true" />
              <span>{saveLabel}</span>
            </button>
          ) : null}
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
