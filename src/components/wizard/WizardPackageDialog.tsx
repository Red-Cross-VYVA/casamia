import { Check, PackageOpen, X } from 'lucide-react'
import { useEffect, useRef } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { CasaMiaService } from '../../types/serviceCatalogue'

export const wizardPackageDialogId = 'safety-wizard-package-dialog'

type WizardPackageDialogProps = {
  areaLabel: string
  copy: WizardCopy['areas']
  isAllOptions: boolean
  onClose: () => void
  returnFocusTo?: HTMLElement | null
  services: CasaMiaService[]
}

export function WizardPackageDialog({
  areaLabel,
  copy,
  isAllOptions,
  onClose,
  returnFocusTo,
  services,
}: WizardPackageDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (dialog && !dialog.open) {
      dialog.showModal()
      window.requestAnimationFrame(() => closeButtonRef.current?.focus())
    }

    return () => {
      returnFocusTo?.focus()
    }
  }, [returnFocusTo])

  const title = isAllOptions ? copy.allOptionsTitle : `${areaLabel}: ${copy.packageTitle}`

  return (
    <dialog
      aria-describedby={`${wizardPackageDialogId}-description`}
      aria-labelledby={`${wizardPackageDialogId}-title`}
      className="safety-wizard-package-dialog"
      id={wizardPackageDialogId}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
      ref={dialogRef}
    >
      <div className="safety-wizard-package-dialog-panel">
        <header className="safety-wizard-package-dialog-header">
          <span className="safety-wizard-package-dialog-icon" aria-hidden="true">
            <PackageOpen size={24} />
          </span>
          <div>
            <p>{copy.catalogueEyebrow}</p>
            <h2 id={`${wizardPackageDialogId}-title`}>{title}</h2>
          </div>
          <button
            aria-label={copy.close}
            className="safety-wizard-package-dialog-close"
            onClick={onClose}
            ref={closeButtonRef}
            type="button"
          >
            <X size={21} aria-hidden="true" />
          </button>
        </header>

        <div className="safety-wizard-package-dialog-summary">
          <p id={`${wizardPackageDialogId}-description`}>{copy.packageIntro}</p>
          <span><strong>{services.length}</strong> {copy.currentOptions}</span>
        </div>

        <div className="safety-wizard-package-dialog-list">
          {services.length ? services.map((service) => {
            const includedItems = (service.includedItems ?? []).filter((item) => item.trim())

            return (
              <article className="safety-wizard-package-service" key={service.id}>
                <div className="safety-wizard-package-service-heading">
                  <span aria-hidden="true"><Check size={16} strokeWidth={3} /></span>
                  <div>
                    <small>{service.category}</small>
                    <h3>{service.name}</h3>
                  </div>
                </div>
                <p>{service.shortDescription}</p>
                {includedItems.length ? (
                  <div className="safety-wizard-package-includes">
                    <strong>{copy.includes}</strong>
                    <ul>
                      {includedItems.map((item, index) => (
                        <li key={`${service.id}-${index}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            )
          }) : (
            <div className="safety-wizard-package-empty">
              <PackageOpen size={30} aria-hidden="true" />
              <p>{copy.emptyPackage}</p>
            </div>
          )}
        </div>

        <footer className="safety-wizard-package-dialog-footer">
          <button className="btn btn-navy" onClick={onClose} type="button">{copy.close}</button>
        </footer>
      </div>
    </dialog>
  )
}
