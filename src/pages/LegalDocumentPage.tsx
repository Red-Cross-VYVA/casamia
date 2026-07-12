import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Navigate } from 'react-router-dom'

import { getLegalDocumentMeta, legalDocuments, type LegalDocumentId } from '../constants/legalDocuments'

export function LegalDocumentPage({ documentId }: { documentId: LegalDocumentId }) {
  const document = legalDocuments[documentId]

  if (!document) {
    return <Navigate to="/" replace />
  }

  const meta = getLegalDocumentMeta(document)
  const requiresReview = document.reviewStatus !== 'approved'

  return (
    <>
      <section className="legal-hero">
        <div className="site-shell">
          <p className="eyebrow">CasaMia legal information</p>
          <h1>{document.title}</h1>
          <p>{document.intro}</p>
          <dl className="legal-meta">
            <div>
              <dt>Version</dt>
              <dd>{meta.version}</dd>
            </div>
            <div>
              <dt>Effective date</dt>
              <dd>{meta.effectiveDate}</dd>
            </div>
            <div>
              <dt>Source language</dt>
              <dd>{meta.sourceLocale.toUpperCase()}</dd>
            </div>
            <div>
              <dt>Review status</dt>
              <dd>{meta.reviewStatus}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="legal-document-section section-pad">
        <div className="site-shell">
          {requiresReview ? (
            <div className="legal-review-alert" role="note">
              <AlertCircle size={22} aria-hidden="true" />
              <div>
                <strong>Final legal review required</strong>
                <p>
                  This page is structured from CasaMia's legal framework and implementation brief. It must be completed
                  with company data and validated by Spanish legal counsel before production use.
                </p>
              </div>
            </div>
          ) : null}

          <div className="legal-document-list">
            {document.sections.map((section) => (
              <article className="legal-document-card" key={section.title}>
                <h2>{section.title}</h2>
                {section.body ? <p>{section.body}</p> : null}
                {section.points ? (
                  <ul>
                    {section.points.map((point) => (
                      <li key={point}>
                        <CheckCircle2 size={17} aria-hidden="true" />
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
