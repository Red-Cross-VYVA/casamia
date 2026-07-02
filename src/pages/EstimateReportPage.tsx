import { useEffect, useState } from 'react'
import { ArrowRight, Check, FileText, LoaderCircle, ShieldCheck } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

import {
  loadEstimateReport,
  type EstimatePreventionStat,
  type EstimateReport,
} from '../services/estimateWorkflow'

type ReportStatus = 'loading' | 'success' | 'error'

export function EstimateReportPage() {
  const { i18n, t } = useTranslation()
  const { token = '' } = useParams()
  const [status, setStatus] = useState<ReportStatus>('loading')
  const [report, setReport] = useState<EstimateReport | null>(null)

  useEffect(() => {
    let active = true

    async function loadReport() {
      try {
        setStatus('loading')
        const loadedReport = await loadEstimateReport(token)

        if (!active) {
          return
        }

        setReport(loadedReport)
        setStatus('success')
      } catch {
        if (active) {
          setStatus('error')
        }
      }
    }

    void loadReport()

    return () => {
      active = false
    }
  }, [token])

  return (
    <>
      <section className="page-hero estimate-report-hero">
        <div className="page-hero-inner">
          <Link className="inline-flex items-center gap-2 text-sm font-bold uppercase text-navy" to="/#estimate-upload">
            <FileText size={18} aria-hidden="true" />
            {t('estimator.report.back')}
          </Link>
          <h1 className="display-title mt-8">{t('estimator.report.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">{t('estimator.report.intro')}</p>
        </div>
      </section>

      <section className="section-pad bg-white">
        <div className="site-shell">
          {status === 'loading' ? (
            <div className="estimate-report-state">
              <LoaderCircle className="animate-spin text-navy" size={44} aria-hidden="true" />
              <p>{t('estimator.report.loading')}</p>
            </div>
          ) : null}

          {status === 'error' ? (
            <div className="estimate-report-state">
              <ShieldCheck className="text-navy" size={44} aria-hidden="true" />
              <h2>{t('estimator.report.notFoundTitle')}</h2>
              <p>{t('estimator.report.notFoundBody')}</p>
              <Link className="btn btn-green" to="/#estimate-upload">
                {t('finalCta.cta')}
                <ArrowRight size={20} aria-hidden="true" />
              </Link>
            </div>
          ) : null}

          {status === 'success' && report ? (
            <div className="estimate-report-grid">
              <article className="estimate-report-card">
                <p className="estimate-wizard-kicker">{t('estimator.report.summaryLabel')}</p>
                <h2>{t('estimator.report.findingsTitle')}</h2>
                <p>{report.summary}</p>
                <div className="estimate-result-metrics">
                  <div>
                    <p>{t('estimator.workflow.result.photosReviewed')}</p>
                    <strong>{report.context.photoCount}</strong>
                  </div>
                  <div>
                    <p>{t('estimator.workflow.result.risksFound')}</p>
                    <strong>{report.hazards.length}</strong>
                  </div>
                  <div className="is-accent">
                    <p>{t('estimator.workflow.result.preventionPriority')}</p>
                    <strong>
                      {t(
                        report.hazards.some((hazard) => hazard.severity === 'high')
                          ? 'estimator.workflow.result.priorityHigh'
                          : 'estimator.workflow.result.priorityMedium',
                      )}
                    </strong>
                  </div>
                </div>
                <div className="estimate-result-section">
                  <h4>{t('estimator.hazardsLabel')}</h4>
                  <ul>
                    {report.hazards.map((hazard) => (
                      <li key={`${hazard.room}-${hazard.issue}`}>
                        <Check size={17} aria-hidden="true" />
                        <span>
                          <strong>{hazard.room}:</strong> {hazard.issue}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="estimate-result-section">
                  <h4>{t('estimator.workflow.result.mitigationTitle')}</h4>
                  <ul>
                    {report.hazards.map((hazard) => (
                      <li key={`${hazard.room}-${hazard.recommendation}`}>
                        <ShieldCheck size={17} aria-hidden="true" />
                        <span>
                          <strong>{hazard.room}:</strong> {hazard.recommendation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="estimate-result-section">
                  <h4>{t('estimator.workflow.result.preventionStats.title')}</h4>
                  <div className="estimate-evidence-grid">
                    {getPreventionStats(
                      report,
                      t('estimator.workflow.result.preventionStats.items', { returnObjects: true }),
                    ).map((stat) => (
                      <article key={`${stat.value}-${stat.source}`}>
                        <strong>{stat.value}</strong>
                        <p>{stat.label}</p>
                        <small>{stat.source}</small>
                      </article>
                    ))}
                  </div>
                </div>
              </article>

              <aside className="estimate-report-side">
                <p className="font-bold uppercase text-green">{t('estimator.report.privateLabel')}</p>
                <p className="mt-3 text-text-mid">{t('estimator.report.privateBody')}</p>
                <dl>
                  <div>
                    <dt>{t('estimator.report.photoCount')}</dt>
                    <dd>{report.context.photoCount}</dd>
                  </div>
                  <div>
                    <dt>{t('estimator.report.postcode')}</dt>
                    <dd>{report.context.postcode || '-'}</dd>
                  </div>
                  <div>
                    <dt>{t('estimator.report.expires')}</dt>
                    <dd>{new Date(report.expiresAt).toLocaleDateString(i18n.language)}</dd>
                  </div>
                </dl>
                <Link className="btn btn-green w-full" to="/free-home-safety-assessment">
                  {t('estimator.workflow.result.bookAssessment')}
                  <ArrowRight size={20} aria-hidden="true" />
                </Link>
              </aside>
            </div>
          ) : null}
        </div>
      </section>
    </>
  )
}

function getPreventionStats(report: EstimateReport, translatedStats: unknown) {
  if (report.preventionStats?.length) {
    return report.preventionStats
  }

  if (Array.isArray(translatedStats)) {
    return translatedStats.filter(isPreventionStat)
  }

  return []
}

function isPreventionStat(value: unknown): value is EstimatePreventionStat {
  if (!value || typeof value !== 'object') {
    return false
  }

  const stat = value as Record<string, unknown>

  return (
    typeof stat.value === 'string' &&
    typeof stat.label === 'string' &&
    typeof stat.source === 'string'
  )
}
