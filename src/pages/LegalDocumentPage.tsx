import { CheckCircle2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate } from 'react-router-dom'

import { SEO } from '../components/SEO'
import { ComplaintForm } from '../components/ComplaintForm'
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
        updated: 'Actualizado',
      }
    : {
        eyebrow: 'CasaMia legal information',
        updated: 'Updated',
      }

  return (
    <>
      <SEO title={document.title} description={document.intro} path={path} schema={schema} />
      <section className="legal-hero">
        <div className="site-shell">
          <p className="eyebrow">{copy.eyebrow}</p>
          <h1>{document.title}</h1>
          <p>{document.intro}</p>
          <p className="legal-updated">{copy.updated}: {meta.effectiveDate}</p>
        </div>
      </section>

      <section className="legal-document-section section-pad">
        <div className="site-shell">
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
                {section.links ? (
                  <nav className="legal-document-links" aria-label={section.title}>
                    {section.links.map((link) => (
                      <Link key={link.path} to={link.path}>{link.label}</Link>
                    ))}
                  </nav>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>
      {document.id === 'complaints-contact' ? <ComplaintForm /> : null}
    </>
  )
}
