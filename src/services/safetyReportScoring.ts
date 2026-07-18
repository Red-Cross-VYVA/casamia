import type { EstimateRiskLevel, EstimateSeverity } from './estimateWorkflow.ts'
import type { SafetyPhotoFinding } from './safetyPhotoAnalysis.ts'

export type EstimatePhotoAnalysis = {
  photoId: string
  fileName: string
  assignedRoom: string
  detectedRoom: string
  roomConfidence: number
  headline: string
  overview: string
  strengths: string[]
  limitations: string[]
  findings: SafetyPhotoFinding[]
  riskScore: number
  riskLevel: EstimateRiskLevel
  scoreExplanation: string
  analysisStatus: 'analysed' | 'unavailable'
}

export type EstimateScoreBreakdown = {
  id: 'visible-evidence' | 'personal-context' | 'timing'
  label: string
  points: number
  maxPoints: number
  explanation: string
}

export type SafetyScoringContext = {
  mainConcern: string
  mobilityProfile: string
  urgency: string
}

const severityPoints: Record<EstimateSeverity, number> = {
  low: 7,
  medium: 16,
  high: 28,
}

export function scorePhotoFindings(
  findings: SafetyPhotoFinding[],
  locale: string,
): Pick<EstimatePhotoAnalysis, 'riskScore' | 'riskLevel' | 'scoreExplanation'> {
  const weightedPoints = findings.reduce((total, finding) => {
    const confidenceWeight = 0.55 + (clamp(finding.confidence, 0, 1) * 0.45)
    return total + (severityPoints[finding.severity] * confidenceWeight)
  }, 0)
  const riskScore = clampScore(findings.length > 0 ? 8 + weightedPoints : 0)
  const counts = countSeverities(findings)
  const averageConfidence = findings.length > 0
    ? findings.reduce((total, finding) => total + finding.confidence, 0) / findings.length
    : 0
  const scoreExplanation = locale.startsWith('es')
    ? buildSpanishPhotoExplanation(counts, findings.length, riskScore, averageConfidence)
    : buildEnglishPhotoExplanation(counts, findings.length, riskScore, averageConfidence)

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    scoreExplanation,
  }
}

export function buildOverallSafetyScore(
  analyses: EstimatePhotoAnalysis[],
  context: SafetyScoringContext,
  locale: string,
) {
  const analysed = analyses.filter((analysis) => analysis.analysisStatus === 'analysed')
  const photoScores = analysed.map((analysis) => analysis.riskScore)
  const maximumPhotoScore = photoScores.length > 0 ? Math.max(...photoScores) : 0
  const averagePhotoScore = photoScores.length > 0
    ? photoScores.reduce((total, value) => total + value, 0) / photoScores.length
    : 0
  const visibleEvidencePoints = Math.round(
    ((maximumPhotoScore * 0.6) + (averagePhotoScore * 0.4)) * 0.65,
  )
  const personalContext = scorePersonalContext(context, locale)
  const timing = scoreTiming(context.urgency, locale)
  const riskScore = clampScore(visibleEvidencePoints + personalContext.points + timing.points)
  const isSpanish = locale.startsWith('es')
  const coverage = analyses.length > 0 ? `${analysed.length}/${analyses.length}` : '0/0'
  const breakdown: EstimateScoreBreakdown[] = [
    {
      id: 'visible-evidence',
      label: isSpanish ? 'Evidencia visible' : 'Visible evidence',
      points: visibleEvidencePoints,
      maxPoints: 65,
      explanation: isSpanish
        ? `${coverage} fotos analizadas. Se combinan el hallazgo más importante y el promedio, sin contar dos veces el mismo riesgo.`
        : `${coverage} photos analysed. The strongest finding and the average are combined without counting the same risk twice.`,
    },
    {
      id: 'personal-context',
      label: isSpanish ? 'Contexto personal' : 'Personal context',
      points: personalContext.points,
      maxPoints: 25,
      explanation: personalContext.explanation,
    },
    {
      id: 'timing',
      label: isSpanish ? 'Prioridad indicada' : 'Stated priority',
      points: timing.points,
      maxPoints: 10,
      explanation: timing.explanation,
    },
  ]

  return {
    riskScore,
    riskLevel: getRiskLevel(riskScore),
    scoreBreakdown: breakdown,
    analysisCoverage: analyses.length > 0 ? analysed.length / analyses.length : 0,
  }
}

function scorePersonalContext(context: SafetyScoringContext, locale: string) {
  const mobility = normalise(context.mobilityProfile)
  const concern = normalise(context.mainConcern)
  let points = 0
  const reasons: string[] = []
  const isSpanish = locale.startsWith('es')

  if (includesAny(mobility, ['recent fall', 'caida reciente'])) {
    points += 22
    reasons.push(isSpanish ? 'se indicó una caída reciente' : 'a recent fall was reported')
  } else if (includesAny(mobility, ['wheelchair', 'reduced mobility', 'silla', 'movilidad reducida'])) {
    points += 17
    reasons.push(isSpanish ? 'se indicó movilidad reducida' : 'reduced mobility was reported')
  } else if (includesAny(mobility, ['cane', 'walker', 'baston', 'andador'])) {
    points += 14
    reasons.push(isSpanish ? 'se utiliza apoyo para caminar' : 'a walking aid is used')
  } else if (includesAny(mobility, ['balance', 'equilibrio'])) {
    points += 9
    reasons.push(isSpanish ? 'se señalaron problemas de equilibrio' : 'balance concerns were reported')
  } else if (includesAny(mobility, ['not sure', 'no lo se'])) {
    points += 3
    reasons.push(isSpanish ? 'la movilidad no está confirmada' : 'mobility is not yet confirmed')
  }

  if (includesAny(concern, ['fall', 'slip', 'caida', 'resbal'])) {
    points += 5
    reasons.push(isSpanish ? 'preocupan las caídas o resbalones' : 'falls or slipping are a concern')
  } else if (includesAny(concern, ['bath', 'stair', 'access', 'bano', 'escalera', 'acceso'])) {
    points += 3
    reasons.push(isSpanish ? 'se marcó una zona de riesgo prioritario' : 'a higher-risk area was selected')
  }

  points = Math.min(25, points)

  return {
    points,
    explanation: reasons.length > 0
      ? sentence(reasons.join(isSpanish ? '; ' : '; '))
      : isSpanish
        ? 'No se indicó ningún factor personal que aumente la prioridad.'
        : 'No personal factor was reported that increases priority.',
  }
}

function scoreTiming(urgencyValue: string, locale: string) {
  const urgency = normalise(urgencyValue)
  const isSpanish = locale.startsWith('es')

  if (includesAny(urgency, ['urgent', 'urgente'])) {
    return {
      points: 10,
      explanation: isSpanish
        ? 'Se pidió atención urgente.'
        : 'Urgent attention was requested.',
    }
  }

  if (includesAny(urgency, ['1 month', '1 mes'])) {
    return {
      points: 6,
      explanation: isSpanish
        ? 'Se quiere actuar durante el próximo mes.'
        : 'Action is wanted within the next month.',
    }
  }

  if (includesAny(urgency, ['3 month', '3 meses'])) {
    return {
      points: 3,
      explanation: isSpanish
        ? 'Se está planificando actuar durante los próximos tres meses.'
        : 'Action is being planned within three months.',
    }
  }

  return {
    points: 0,
    explanation: isSpanish
      ? 'Se está planificando con antelación.'
      : 'The user is planning ahead.',
  }
}

function countSeverities(findings: SafetyPhotoFinding[]) {
  return findings.reduce(
    (counts, finding) => ({ ...counts, [finding.severity]: counts[finding.severity] + 1 }),
    { low: 0, medium: 0, high: 0 },
  )
}

function buildEnglishPhotoExplanation(
  counts: Record<EstimateSeverity, number>,
  total: number,
  score: number,
  averageConfidence: number,
) {
  if (total === 0) return '0/100 because no visible concern had enough evidence to score from this photo.'

  const parts = severityParts(counts, {
    high: 'high-priority',
    medium: 'medium-priority',
    low: 'lower-priority',
  })
  return `${score}/100 from ${parts.join(', ')} visible ${total === 1 ? 'finding' : 'findings'} at ${Math.round(averageConfidence * 100)}% average confidence. Clearer and more serious evidence raises the score.`
}

function buildSpanishPhotoExplanation(
  counts: Record<EstimateSeverity, number>,
  total: number,
  score: number,
  averageConfidence: number,
) {
  if (total === 0) return '0/100 porque no se ha visto ningún riesgo con evidencia suficiente para puntuar esta foto.'

  const parts = severityParts(counts, {
    high: 'de prioridad alta',
    medium: 'de prioridad media',
    low: 'de prioridad menor',
  })
  return `${score}/100 por ${parts.join(', ')} ${total === 1 ? 'hallazgo visible' : 'hallazgos visibles'}, con ${Math.round(averageConfidence * 100)}% de confianza media. La evidencia más clara y grave aumenta la puntuación.`
}

function severityParts(
  counts: Record<EstimateSeverity, number>,
  labels: Record<EstimateSeverity, string>,
) {
  return (['high', 'medium', 'low'] as EstimateSeverity[])
    .filter((severity) => counts[severity] > 0)
    .map((severity) => `${counts[severity]} ${labels[severity]}`)
}

function getRiskLevel(score: number): EstimateRiskLevel {
  if (score >= 75) return 'high'
  if (score >= 55) return 'elevated'
  if (score >= 30) return 'moderate'
  return 'low'
}

function clampScore(value: number) {
  return Math.max(0, Math.min(95, Math.round(value)))
}

function clamp(value: number, minimum: number, maximum: number) {
  return Math.max(minimum, Math.min(maximum, value))
}

function normalise(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function sentence(value: string) {
  return value ? `${value.charAt(0).toUpperCase()}${value.slice(1)}.` : value
}
