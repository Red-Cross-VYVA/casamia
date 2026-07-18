import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ChevronDown,
  CircleHelp,
  Eye,
  House,
  ShieldCheck,
  Sparkles,
  Wrench,
} from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

import type {
  SafetyWizardState,
  WizardPhoto,
  WizardRoomSafetyReport,
  WizardSafetyReport,
} from '../../types/wizard'

type WizardVisualSafetyReportProps = {
  language: string
  report: WizardSafetyReport
  state: SafetyWizardState
}

export function WizardVisualSafetyReport({ language, report, state }: WizardVisualSafetyReportProps) {
  const isSpanish = language.toLowerCase().startsWith('es')
  const [openRoom, setOpenRoom] = useState<WizardPhoto['room'] | undefined>(report.rooms[0]?.room)
  const previewUrls = usePhotoPreviewUrls(state.photos)
  const score = report.safetyScore

  return (
    <div className="wizard-visual-report">
      <section className="wizard-safety-summary" aria-labelledby="wizard-safety-summary-title">
        <div className={`wizard-safety-score is-${scoreBand(score)}`}>
          <span>{score ?? '--'}{score !== undefined ? <small>/100</small> : null}</span>
          <strong>{isSpanish ? 'Seguridad del hogar' : 'Home safety'}</strong>
          <small>{isSpanish ? '100 significa más seguro' : '100 means safer'}</small>
        </div>

        <div className="wizard-safety-summary-copy">
          <p>{isSpanish ? 'INFORME VISUAL PERSONALIZADO' : 'PERSONALISED VISUAL REPORT'}</p>
          <h2 id="wizard-safety-summary-title">
            {summaryHeading(report, isSpanish)}
          </h2>
          <span>{summaryBody(report, isSpanish)}</span>
          <div className="wizard-safety-summary-facts">
            <span><Camera size={16} />{report.analysedPhotoCount}/{report.totalPhotoCount} {isSpanish ? 'fotos analizadas' : 'photos analysed'}</span>
            <span><House size={16} />{report.rooms.length} {isSpanish ? 'estancias revisadas' : 'rooms reviewed'}</span>
            <span><ShieldCheck size={16} />{confidenceLabel(report.confidence, isSpanish)}</span>
          </div>
        </div>
      </section>

      {report.status !== 'complete' ? (
        <div className="wizard-analysis-coverage-note" role="status">
          <CircleHelp size={21} aria-hidden="true" />
          <div>
            <strong>{isSpanish ? 'Informe visual incompleto' : 'Visual report incomplete'}</strong>
            <span>{report.status === 'questionnaire-only'
              ? isSpanish
                ? 'No hemos podido analizar las fotos. El resultado se basa solo en tus respuestas y no confirma riesgos visibles.'
                : 'The photos could not be analysed. The result uses questionnaire answers only and does not confirm visible concerns.'
              : isSpanish
                ? 'Algunas fotos no se pudieron analizar. No las tratamos como estancias seguras.'
                : 'Some photos could not be analysed. We do not treat them as safe rooms.'}
            </span>
          </div>
        </div>
      ) : null}

      {report.contextSignals.length ? (
        <section className="wizard-personal-context" aria-label={isSpanish ? 'Contexto personal considerado' : 'Personal context considered'}>
          <strong>{isSpanish ? 'Tu contexto también cuenta' : 'Your context matters too'}</strong>
          <div>{report.contextSignals.map((signal) => <span key={signal}>{signal}</span>)}</div>
        </section>
      ) : null}

      {report.topFindings.length ? (
        <section className="wizard-top-evidence" aria-labelledby="wizard-top-evidence-title">
          <header>
            <div>
              <p>{isSpanish ? 'PRIORIDADES' : 'PRIORITIES'}</p>
              <h3 id="wizard-top-evidence-title">{isSpanish ? 'Lo que revisaríamos primero' : 'What we would address first'}</h3>
            </div>
            <span>{report.topFindings.length}</span>
          </header>
          <div className="wizard-top-evidence-grid">
            {report.topFindings.slice(0, 3).map((finding, index) => (
              <article key={finding.id}>
                <b>{String(index + 1).padStart(2, '0')}</b>
                <div>
                  <span className={`is-${finding.severity}`}>{severityLabel(finding.severity, isSpanish)}</span>
                  <strong>{finding.title}</strong>
                  <p>{finding.evidence}</p>
                </div>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="wizard-room-report" aria-labelledby="wizard-room-report-title">
        <header>
          <div>
            <p>{isSpanish ? 'ESTANCIA POR ESTANCIA' : 'ROOM BY ROOM'}</p>
            <h3 id="wizard-room-report-title">{isSpanish ? 'Tu revisión visual' : 'Your visual review'}</h3>
          </div>
          <small>{isSpanish ? 'Abre una estancia para ver la evidencia y las acciones.' : 'Open a room to see the evidence and actions.'}</small>
        </header>

        <div className="wizard-room-report-list">
          {report.rooms.map((room) => (
            <RoomReportCard
              isOpen={openRoom === room.room}
              isSpanish={isSpanish}
              key={room.room}
              onToggle={() => setOpenRoom(openRoom === room.room ? undefined : room.room)}
              previewUrls={previewUrls}
              room={room}
              photos={state.photos.filter((photo) => room.photoIds.includes(photo.id))}
            />
          ))}
        </div>
      </section>

      {report.positiveFeatures.length ? (
        <section className="wizard-positive-features">
          <div>
            <CheckCircle2 size={22} aria-hidden="true" />
            <h3>{isSpanish ? 'Lo que ya ayuda' : 'What already helps'}</h3>
          </div>
          <ul>{report.positiveFeatures.map((feature) => <li key={feature}>{feature}</li>)}</ul>
        </section>
      ) : null}

      <section className="wizard-score-method">
        <CircleHelp size={20} aria-hidden="true" />
        <div>
          <strong>{isSpanish ? 'Cómo se calcula' : 'How the score is calculated'}</strong>
          <p>{isSpanish
            ? 'Combinamos la estancia con mayor riesgo visible y el promedio de las estancias analizadas. Los riesgos repetidos no se cuentan dos veces. El contexto personal ajusta la prioridad, no inventa evidencia.'
            : 'We combine the room with the strongest visible risk and the average of analysed rooms. Repeated concerns are not counted twice. Personal context adjusts priority, not the visible evidence.'}
          </p>
        </div>
      </section>

      {report.serviceRecommendations.length ? (
        <section className="wizard-service-matches" aria-labelledby="wizard-service-matches-title">
          <header>
            <div>
              <p>{isSpanish ? 'SIGUIENTE PASO' : 'NEXT STEP'}</p>
              <h3 id="wizard-service-matches-title">{isSpanish ? 'Mejoras CasaMia relacionadas' : 'Relevant CasaMia improvements'}</h3>
            </div>
            <span>{isSpanish ? 'Basadas en la evidencia visible' : 'Based on visible evidence'}</span>
          </header>
          <div className="wizard-service-match-grid">
            {report.serviceRecommendations.slice(0, 6).map((service) => (
              <article key={service.serviceId}>
                <div className="wizard-service-match-icon"><Wrench size={20} aria-hidden="true" /></div>
                <div>
                  <span>{service.highestSeverity === 'high' ? (isSpanish ? 'Prioridad' : 'Priority') : (isSpanish ? 'Recomendado' : 'Recommended')}</span>
                  <h4>{service.name}</h4>
                  <p>{service.customerBenefit}</p>
                  <small><Eye size={14} />{service.reason}</small>
                </div>
                <strong>{service.priceLabel}</strong>
                {service.requiresSiteVisit ? <em>{isSpanish ? 'Requiere comprobación en vivienda' : 'Home check required'}</em> : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}

function RoomReportCard({
  isOpen,
  isSpanish,
  onToggle,
  photos,
  previewUrls,
  room,
}: {
  isOpen: boolean
  isSpanish: boolean
  onToggle: () => void
  photos: WizardPhoto[]
  previewUrls: Record<string, string>
  room: WizardRoomSafetyReport
}) {
  const detailsId = `wizard-room-${room.room}`

  return (
    <article className={`wizard-room-card${isOpen ? ' is-open' : ''}`}>
      <button aria-controls={detailsId} aria-expanded={isOpen} onClick={onToggle} type="button">
        <span className="wizard-room-card-icon"><House size={21} aria-hidden="true" /></span>
        <span className="wizard-room-card-title">
          <strong>{roomLabel(room.room, isSpanish)}</strong>
          <small>{room.findings.length} {isSpanish ? 'hallazgos' : 'findings'} - {room.analysedPhotoCount}/{photos.length} {isSpanish ? 'fotos' : 'photos'}</small>
        </span>
        <span className={`wizard-room-card-score is-${scoreBand(room.safetyScore)}`}>
          <b>{room.safetyScore ?? '--'}</b><small>{room.safetyScore !== undefined ? '/100' : ''}</small>
        </span>
        <ChevronDown className={isOpen ? 'is-open' : ''} size={20} aria-hidden="true" />
      </button>

      {isOpen ? (
        <div className="wizard-room-card-details" id={detailsId}>
          <div className="wizard-room-photo-review">
            <strong>{isSpanish ? 'Análisis foto por foto' : 'Photo-by-photo analysis'}</strong>
            <div className="wizard-room-photos">
              {photos.map((photo, index) => {
                const photoReport = room.photoAnalyses.find((item) => item.photoId === photo.id)

                return (
                  <article className="wizard-room-photo-card" key={photo.id}>
                    <figure>
                      {previewUrls[photo.id] ? <img src={previewUrls[photo.id]} alt={`${roomLabel(room.room, isSpanish)} ${index + 1}`} /> : <span><Camera size={24} /></span>}
                      <figcaption>{String(index + 1).padStart(2, '0')}</figcaption>
                      <b className={`is-${scoreBand(photoReport?.safetyScore)}`}>
                        {photoReport?.safetyScore ?? '--'}{photoReport?.safetyScore !== undefined ? '/100' : ''}
                      </b>
                    </figure>
                    <div>
                      <strong>{photoReport?.headline ?? photo.name}</strong>
                      <span>{photoReport?.analysisStatus === 'analysed'
                        ? `${photoReport.findings.length} ${isSpanish ? 'hallazgos visibles' : 'visible findings'}`
                        : isSpanish ? 'Sin analizar' : 'Not analysed'}
                      </span>
                      <p>{photoReport?.scoreExplanation}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>

          <div className="wizard-room-score-reason">
            <ShieldCheck size={18} aria-hidden="true" />
            <span>{room.scoreExplanation}</span>
          </div>

          {room.findings.length ? (
            <div className="wizard-room-findings">
              {room.findings.map((finding) => (
                <article key={finding.id}>
                  <header>
                    <span className={`is-${finding.severity}`}>{severityLabel(finding.severity, isSpanish)}</span>
                    <strong>{finding.title}</strong>
                    <small>{Math.round(finding.confidence * 100)}% {isSpanish ? 'confianza' : 'confidence'}</small>
                  </header>
                  <dl>
                    <div><dt><Eye size={15} />{isSpanish ? 'Evidencia' : 'Evidence'}</dt><dd>{finding.evidence}</dd></div>
                    <div><dt><AlertTriangle size={15} />{isSpanish ? 'Por qué importa' : 'Why it matters'}</dt><dd>{finding.whyItMatters}</dd></div>
                    <div className="is-action"><dt><Sparkles size={15} />{isSpanish ? 'Acción' : 'Action'}</dt><dd>{finding.action}</dd></div>
                  </dl>
                </article>
              ))}
            </div>
          ) : room.analysedPhotoCount ? (
            <p className="wizard-room-no-findings"><CheckCircle2 size={17} />{isSpanish ? 'No se detectó un riesgo concreto con evidencia suficiente en estas fotos.' : 'No specific concern had enough visible evidence in these photos.'}</p>
          ) : null}

          {room.limitations.length ? (
            <div className="wizard-room-limitations">
              <strong><CircleHelp size={16} />{isSpanish ? 'Por confirmar' : 'Still to confirm'}</strong>
              <ul>{room.limitations.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </article>
  )
}

function usePhotoPreviewUrls(photos: WizardPhoto[]) {
  const files = useMemo(
    () => photos.flatMap((photo) => photo.file ? [[photo.id, photo.file] as const] : []),
    [photos],
  )
  const [urls, setUrls] = useState<Record<string, string>>({})

  useEffect(() => {
    const next = Object.fromEntries(files.map(([id, file]) => [id, URL.createObjectURL(file)]))
    setUrls(next)
    return () => Object.values(next).forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  return urls
}

function scoreBand(score?: number) {
  if (score === undefined) return 'unknown'
  if (score < 45) return 'urgent'
  if (score < 72) return 'attention'
  return 'safer'
}

function summaryHeading(report: WizardSafetyReport, isSpanish: boolean) {
  if (report.status === 'questionnaire-only') return isSpanish ? 'Necesitamos revisar mejor las fotos' : 'We need a clearer visual review'
  if (report.priority === 'urgent') return isSpanish ? 'Hay mejoras que conviene priorizar' : 'Some improvements should be prioritised'
  if (report.priority === 'attention') return isSpanish ? 'Hay puntos concretos que mejorar' : 'There are clear areas to improve'
  return isSpanish ? 'Una buena base, con algunos puntos por confirmar' : 'A good base, with a few points to confirm'
}

function summaryBody(report: WizardSafetyReport, isSpanish: boolean) {
  if (!report.topFindings.length) {
    return isSpanish
      ? 'No inventamos riesgos: mostramos solo lo que las fotos permiten respaldar y señalamos lo que falta confirmar.'
      : 'We do not invent risks: only photo-supported evidence is shown, with anything uncertain marked for confirmation.'
  }

  return isSpanish
    ? `Hemos consolidado ${report.topFindings.length} prioridades principales y relacionado las necesidades visibles con mejoras concretas.`
    : `We consolidated ${report.topFindings.length} main priorities and linked the visible needs to practical improvements.`
}

function confidenceLabel(confidence: WizardSafetyReport['confidence'], isSpanish: boolean) {
  const labels = {
    high: isSpanish ? 'Confianza visual alta' : 'High visual confidence',
    medium: isSpanish ? 'Confianza visual media' : 'Medium visual confidence',
    low: isSpanish ? 'Confianza visual limitada' : 'Limited visual confidence',
  }
  return labels[confidence]
}

function severityLabel(severity: string, isSpanish: boolean) {
  if (severity === 'high') return isSpanish ? 'Alta' : 'High'
  if (severity === 'medium') return isSpanish ? 'Media' : 'Medium'
  return isSpanish ? 'Menor' : 'Lower'
}

function roomLabel(room: WizardPhoto['room'], isSpanish: boolean) {
  const labels: Record<WizardPhoto['room'], [string, string]> = {
    bathroom: ['Bathroom', 'Baño'],
    bedroom: ['Bedroom', 'Dormitorio'],
    kitchen: ['Kitchen', 'Cocina'],
    'living-room': ['Living room', 'Salón'],
    stairs: ['Stairs', 'Escaleras'],
    entrance: ['Entrance', 'Entrada'],
    outdoor: ['Outdoor', 'Exterior'],
    other: ['Other area', 'Otra zona'],
  }
  return labels[room][isSpanish ? 1 : 0]
}
