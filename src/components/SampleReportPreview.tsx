import { AlertTriangle, ArrowRight, ClipboardCheck, Home, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { trackEvent } from '../utils/analytics'

type ReportPoint = {
  label: string
  value: string
}

export function SampleReportPreview() {
  const { t } = useTranslation()
  const points = t('sampleReport.points', { returnObjects: true }) as ReportPoint[]

  return (
    <section className="sample-report-section section-pad bg-white">
      <div className="site-shell sample-report-grid">
        <div className="sample-report-copy">
          <p className="section-kicker">{t('sampleReport.kicker')}</p>
          <h2 className="display-title">{t('sampleReport.title')}</h2>
          <p className="mt-5 max-w-2xl text-xl leading-relaxed text-text-mid">
            {t('sampleReport.body')}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              className="btn btn-green"
              to="/#top"
              onClick={() => trackEvent('cta_click', { location: 'sample_report', target: 'free_report' })}
            >
              {t('sampleReport.primaryCta')}
              <ArrowRight size={20} aria-hidden="true" />
            </Link>
            <Link
              className="btn btn-white"
              to="/grant-check"
              onClick={() => trackEvent('cta_click', { location: 'sample_report', target: 'grant_check' })}
            >
              {t('sampleReport.secondaryCta')}
            </Link>
          </div>
        </div>

        <div className="sample-report-card" aria-label={t('sampleReport.previewLabel')}>
          <div className="sample-report-card-header">
            <span>
              <ClipboardCheck size={22} aria-hidden="true" />
            </span>
            <div>
              <p>{t('sampleReport.card.kicker')}</p>
              <h3>{t('sampleReport.card.title')}</h3>
            </div>
          </div>
          <div className="sample-report-risk">
            <strong>{t('sampleReport.card.score')}</strong>
            <span>{t('sampleReport.card.scoreLabel')}</span>
          </div>
          <div className="sample-report-list">
            <article>
              <AlertTriangle size={18} aria-hidden="true" />
              <div>
                <h4>{t('sampleReport.card.riskTitle')}</h4>
                <p>{t('sampleReport.card.riskBody')}</p>
              </div>
            </article>
            <article>
              <ShieldCheck size={18} aria-hidden="true" />
              <div>
                <h4>{t('sampleReport.card.actionTitle')}</h4>
                <p>{t('sampleReport.card.actionBody')}</p>
              </div>
            </article>
            <article>
              <Home size={18} aria-hidden="true" />
              <div>
                <h4>{t('sampleReport.card.nextTitle')}</h4>
                <p>{t('sampleReport.card.nextBody')}</p>
              </div>
            </article>
          </div>
          <div className="sample-report-points">
            {points.map((point) => (
              <div key={point.label}>
                <strong>{point.value}</strong>
                <span>{point.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
