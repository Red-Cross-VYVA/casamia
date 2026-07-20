import { AlertTriangle, ArrowRight, Check, Eye, HelpCircle, House, ShieldCheck } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import type { EstimateReport, EstimateRiskAssessment } from '../services/estimateWorkflow'
import type { EstimatePhotoAnalysis } from '../services/safetyReportScoring'
import { formatCurrency, useServiceCatalogue } from '../services/serviceCatalogue'
import { findBestServiceForPhotoAnalysis } from '../services/wizardSafetyReport'
import type { CasaMiaService } from '../types/serviceCatalogue'

export function PhotoAnalysisCards({
  analyses,
  previewByPhotoId = {},
}: {
  analyses: EstimatePhotoAnalysis[]
  previewByPhotoId?: Record<string, string>
}) {
  const { i18n, t } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const serviceCatalogue = useServiceCatalogue()

  if (analyses.length === 0) return null

  return (
    <section className="estimate-photo-analysis-section">
      <div className="estimate-section-heading">
        <div>
          <p className="estimate-wizard-kicker">
            {t('estimator.workflow.result.photoReviewKicker', { defaultValue: isSpanish ? 'Revisión visual' : 'Visual review' })}
          </p>
          <h4>
            {t('estimator.workflow.result.photoReviewTitle', { defaultValue: isSpanish ? 'Foto por foto' : 'Photo by photo' })}
          </h4>
        </div>
        <p>
          {t('estimator.workflow.result.photoReviewBody', {
            defaultValue: isSpanish
              ? 'Solo mostramos riesgos apoyados por algo visible. Lo que no se puede confirmar queda señalado.'
              : 'Only concerns supported by visible evidence are shown. Anything that cannot be confirmed is clearly marked.',
          })}
        </p>
      </div>

      <div className="estimate-photo-analysis-list">
        {analyses.map((analysis, index) => (
          <PhotoAnalysisCard
            key={analysis.photoId}
            analysis={analysis}
            index={index}
            previewUrl={previewByPhotoId[analysis.photoId]}
            services={serviceCatalogue.services}
          />
        ))}
      </div>
    </section>
  )
}

function PhotoAnalysisCard({
  analysis,
  index,
  previewUrl,
  services,
}: {
  analysis: EstimatePhotoAnalysis
  index: number
  previewUrl?: string
  services: CasaMiaService[]
}) {
  const { i18n, t } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const analysed = analysis.analysisStatus === 'analysed'
  const confidence = Math.round(analysis.roomConfidence * 100)
  const recommendation = analysed
    ? findBestServiceForPhotoAnalysis(
        analysis.detectedRoom || analysis.assignedRoom,
        analysis.findings,
        services,
      )
    : undefined

  return (
    <article className={`estimate-photo-analysis-card ${analysed ? '' : 'is-unavailable'}`}>
      <header className="estimate-photo-analysis-header">
        <div className="estimate-photo-analysis-media">
          {previewUrl ? <img src={previewUrl} alt={analysis.fileName} /> : (
            <span aria-hidden="true"><Eye size={24} /></span>
          )}
          <b>{String(index + 1).padStart(2, '0')}</b>
        </div>
        <div className="estimate-photo-analysis-title">
          <p>{analysis.fileName}</p>
          <h5>{analysis.headline}</h5>
          <span>
            {formatRoom(analysis.detectedRoom || analysis.assignedRoom, isSpanish)}
            {analysed && confidence > 0 ? ` · ${confidence}% ${isSpanish ? 'confianza de estancia' : 'room confidence'}` : ''}
          </span>
        </div>
        <div className={`estimate-photo-score risk-${analysis.riskLevel}`}>
          {analysed ? <strong>{analysis.riskScore}<small>/100</small></strong> : <strong>—</strong>}
          <span>{analysed
            ? t(`estimator.workflow.result.riskLevels.${analysis.riskLevel}`)
            : (isSpanish ? 'Sin analizar' : 'Not analysed')}
          </span>
        </div>
      </header>

      <div className="estimate-photo-analysis-content">

        <p className="estimate-photo-overview">{analysis.overview}</p>
        <p className="estimate-photo-score-reason">
          <HelpCircle size={16} aria-hidden="true" />
          {analysis.scoreExplanation}
        </p>

        {analysis.findings.length > 0 ? (
          <div className="estimate-photo-findings">
            {analysis.findings.map((finding, findingIndex) => (
              <article key={`${finding.title}-${findingIndex}`}>
                <div className="estimate-finding-heading">
                  <span className={`estimate-severity is-${finding.severity}`}>
                    {severityLabel(finding.severity, isSpanish)}
                  </span>
                  <strong>{finding.title}</strong>
                  <small>{Math.round(finding.confidence * 100)}% {isSpanish ? 'confianza' : 'confidence'}</small>
                </div>
                <dl>
                  <div>
                    <dt><Eye size={15} />{isSpanish ? 'Evidencia visible' : 'Visible evidence'}</dt>
                    <dd>{finding.evidence}</dd>
                  </div>
                  <div>
                    <dt><AlertTriangle size={15} />{isSpanish ? 'Por qué importa' : 'Why it matters'}</dt>
                    <dd>{finding.whyItMatters}</dd>
                  </div>
                  <div className="is-action">
                    <dt><ShieldCheck size={15} />{isSpanish ? 'Qué hacer' : 'What to do'}</dt>
                    <dd>{finding.action}</dd>
                  </div>
                </dl>
                {finding.requiresConfirmation ? (
                  <p className="estimate-confirmation-note">
                    {isSpanish ? 'Confirmar medidas y condiciones antes de instalar.' : 'Confirm measurements and conditions before installation.'}
                  </p>
                ) : null}
              </article>
            ))}
          </div>
        ) : analysed ? (
          <div className="estimate-no-visible-risk">
            <Check size={18} aria-hidden="true" />
            <span>{isSpanish
              ? 'No se ha visto un riesgo concreto con evidencia suficiente en esta foto.'
              : 'No specific concern had enough visible evidence in this photo.'}
            </span>
          </div>
        ) : null}

        {(analysis.strengths.length > 0 || analysis.limitations.length > 0) ? (
          <div className="estimate-photo-context-grid">
            {analysis.strengths.length > 0 ? (
              <div className="is-positive">
                <strong><Check size={16} />{isSpanish ? 'Lo que ayuda' : 'What helps'}</strong>
                <ul>{analysis.strengths.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ) : null}
            {analysis.limitations.length > 0 ? (
              <div>
                <strong><HelpCircle size={16} />{isSpanish ? 'Por confirmar' : 'Still to confirm'}</strong>
                <ul>{analysis.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
              </div>
            ) : null}
          </div>
        ) : null}

        {recommendation ? (
          <div className="estimate-photo-solution">
            <span className="estimate-photo-solution-icon" aria-hidden="true"><House size={19} /></span>
            <div>
              <span>{isSpanish ? 'Siguiente paso CasaMia' : 'A practical CasaMia next step'}</span>
              <strong>{isSpanish ? recommendation.finding.action : recommendation.service.name}</strong>
              <p>{isSpanish
                ? 'Seleccionamos la solución adecuada, coordinamos la instalación y comprobamos el resultado.'
                : 'We select the right solution, coordinate installation and check the result.'}
              </p>
            </div>
            <div className="estimate-photo-solution-action">
              <small>{formatRecommendationPrice(recommendation.service, isSpanish)}</small>
              <Link
                to="/home-safety-wizard"
              >
                {isSpanish ? 'Ver solución' : 'See solution'}
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        ) : null}
      </div>
    </article>
  )
}

function formatRecommendationPrice(service: CasaMiaService, isSpanish: boolean) {
  if (service.pricingType === 'quote_only') {
    return isSpanish ? 'Precio tras revisión' : 'Price after review'
  }

  const amount = service.pricingType === 'from'
    ? service.fromPrice
    : (service.productPrice ?? 0) + (service.installationPrice ?? 0)

  if (!amount) {
    return isSpanish ? 'Incluido tras revisión' : 'Confirmed after review'
  }

  const prefix = service.pricingType === 'from'
    ? (isSpanish ? 'Desde ' : 'From ')
    : ''

  return `${prefix}${formatCurrency(amount)}`
}

export function ScoreExplanation({
  report,
  risk,
}: {
  report: EstimateReport
  risk: EstimateRiskAssessment
}) {
  const { i18n, t } = useTranslation()
  const isSpanish = i18n.language.startsWith('es')
  const breakdown = report.scoreBreakdown ?? []
  const analysedCount = report.photoAnalyses?.filter(
    (analysis) => analysis.analysisStatus === 'analysed',
  ).length ?? 0

  return (
    <div className="estimate-score-explanation">
      <div className={`estimate-risk-score risk-${risk.riskLevel}`}>
        <span>{risk.riskScore}<small>/100</small></span>
        <strong>{t(`estimator.workflow.result.riskLevels.${risk.riskLevel}`)}</strong>
      </div>
      <div className="estimate-score-intro">
        <h4>{isSpanish ? 'Cómo se calcula' : 'How this is calculated'}</h4>
        <p>{isSpanish
          ? 'Es una prioridad preventiva, no la probabilidad de sufrir una caída.'
          : 'This is a prevention-priority score, not the probability of a fall.'}
        </p>
        <span>{isSpanish
          ? `${analysedCount} de ${report.context.photoCount} fotos analizadas visualmente`
          : `${analysedCount} of ${report.context.photoCount} photos visually analysed`}
        </span>
      </div>

      {breakdown.length > 0 ? (
        <div className="estimate-score-breakdown">
          {breakdown.map((item) => (
            <article key={item.id}>
              <div>
                <strong>{item.label}</strong>
                <b>{item.points}/{item.maxPoints}</b>
              </div>
              <span><i style={{ width: `${Math.min(100, (item.points / item.maxPoints) * 100)}%` }} /></span>
              <p>{item.explanation}</p>
            </article>
          ))}
        </div>
      ) : (
        <ul className="estimate-legacy-score-reasons">
          {risk.riskFactors.map((factor) => <li key={factor}>{factor}</li>)}
        </ul>
      )}
    </div>
  )
}

function severityLabel(severity: string, isSpanish: boolean) {
  if (severity === 'high') return isSpanish ? 'Alta' : 'High'
  if (severity === 'medium') return isSpanish ? 'Media' : 'Medium'
  return isSpanish ? 'Menor' : 'Lower'
}

function formatRoom(room: string, isSpanish: boolean) {
  const labels: Record<string, [string, string]> = {
    bathroom: ['Bathroom', 'Baño'],
    bedroom: ['Bedroom', 'Dormitorio'],
    kitchen: ['Kitchen', 'Cocina'],
    'living-room': ['Living room', 'Salón'],
    stairs: ['Stairs', 'Escaleras'],
    entrance: ['Entrance', 'Entrada'],
    outdoor: ['Outdoor', 'Exterior'],
    other: ['Other area', 'Otra zona'],
  }

  return labels[room]?.[isSpanish ? 1 : 0] ?? room
}
