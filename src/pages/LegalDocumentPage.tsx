import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Navigate } from 'react-router-dom'

import { SEO } from '../components/SEO'
import {
  getLegalDocumentMeta,
  getLocalizedLegalDocument,
  legalRouteLabels,
  type LegalDocumentId,
} from '../constants/legalDocuments'

export function LegalDocumentPage({ documentId }: { documentId: LegalDocumentId }) {
  const { i18n } = useTranslation()
  const isSpanish = i18n.language.toLowerCase().startsWith('es')
  const document = getLocalizedLegalDocument(documentId, i18n.language)

  if (!document) {
    return <Navigate to="/" replace />
  }

  const siteUrl = 'https://www.casamia.com.es'
  const path = legalRouteLabels.find((link) => link.id === document.id)?.path ?? `/${document.id}`
  const meta = getLegalDocumentMeta(document, i18n.language)
  const requiresReview = document.reviewStatus !== 'approved'
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    '@id': `${siteUrl}${path}#page`,
    name: document.title,
    description: document.intro,
    url: `${siteUrl}${path}`,
    inLanguage: isSpanish ? 'es' : 'en',
    isPartOf: {
      '@id': `${siteUrl}/#website`,
    },
    publisher: {
      '@id': `${siteUrl}/#organization`,
    },
  }
  const copy = isSpanish
    ? {
        eyebrow: 'Información legal de CasaMia',
        version: 'Versión',
        effectiveDate: 'Fecha de entrada en vigor',
        sourceLanguage: 'Idioma fuente',
        reviewStatus: 'Estado de revisión',
        reviewTitle: 'Revisión legal final requerida',
        reviewBody:
          'Esta página está estructurada a partir del marco legal y el briefing de implementación de CasaMia. Debe completarse con los datos de la empresa y validarse por asesoría legal española antes de su uso en producción.',
      }
    : {
        eyebrow: 'CasaMia legal information',
        version: 'Version',
        effectiveDate: 'Effective date',
        sourceLanguage: 'Source language',
        reviewStatus: 'Review status',
        reviewTitle: 'Final legal review required',
        reviewBody:
          "This page is structured from CasaMia's legal framework and implementation brief. It must be completed with company data and validated by Spanish legal counsel before production use.",
      }

  return (
    <>
      <SEO title={document.title} description={document.intro} path={path} schema={schema} />
      <section className="legal-hero">
        <div className="site-shell">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{document.title}</h1>
          <p>{document.intro}</p>
          <dl className="legal-meta">
            <div>
              <dt>{copy.version}</dt>
              <dd>{meta.version}</dd>
            </div>
            <div>
              <dt>{copy.effectiveDate}</dt>
              <dd>{meta.effectiveDate}</dd>
            </div>
            <div>
              <dt>{copy.sourceLanguage}</dt>
              <dd>{meta.sourceLocale.toUpperCase()}</dd>
            </div>
            <div>
              <dt>{copy.reviewStatus}</dt>
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
                <strong>{copy.reviewTitle}</strong>
                <p>{copy.reviewBody}</p>
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
