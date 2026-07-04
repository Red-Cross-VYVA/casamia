import {
  getPublicSiteApiBaseUrl,
  getPublicSiteJson,
  hasPublicSiteApi,
  postPublicSiteJson,
} from './publicSiteApi'

export type EstimateSeverity = 'low' | 'medium' | 'high'
export type EstimateRiskLevel = 'low' | 'moderate' | 'elevated' | 'high'
export type DeliveryChannelStatus = 'queued' | 'sent' | 'not_requested' | 'failed'

export type EstimatePhotoInput = {
  id: string
  file: File
  room: string
}

export type EstimateWorkflowInput = {
  locale: string
  context: {
    region: string
    postcode: string
    homeType: string
    mainConcern: string
    urgency: string
    mobilityProfile: string
    description: string
  }
  photos: EstimatePhotoInput[]
}

export type ReportDeliveryContact = {
  name: string
  email: string
  phone: string
  deliveryEmail: boolean
  deliveryWhatsapp: boolean
  consentAt: string
}

export type ReportDeliveryInput = {
  reportType: 'safety' | 'grant'
  token: string
  contact: ReportDeliveryContact
  reportTitle: string
  reportUrl?: string
  report?: EstimateReport
  grantReport?: Record<string, unknown>
}

type LegacyEstimateWorkflowInput = EstimateWorkflowInput & {
  contact: ReportDeliveryContact
}

export type EstimateHazard = {
  room: string
  issue: string
  severity: EstimateSeverity
  recommendation: string
}

export type EstimatePreventionStat = {
  value: string
  label: string
  source: string
}

export type EstimateReport = {
  token: string
  createdAt: string
  expiresAt: string
  reportUrl: string
  summary: string
  confidence?: number
  riskScore: number
  riskLevel: EstimateRiskLevel
  riskFactors: string[]
  hazards: EstimateHazard[]
  preventionStats?: EstimatePreventionStat[]
  followUpQuestions: string[]
  delivery: {
    email: DeliveryChannelStatus
    whatsapp: DeliveryChannelStatus
  }
  lead: {
    name: string
    email: string
    phone: string
    preferredChannels: string[]
  }
  context: EstimateWorkflowInput['context'] & {
    photoCount: number
    rooms: string[]
  }
  backendMode: 'api' | 'local-demo'
}

export type EstimateRiskAssessment = {
  riskScore: number
  riskLevel: EstimateRiskLevel
  riskFactors: string[]
}

type IntakeResponse = {
  requestId: string
  reportToken: string
  uploadUrls: Array<{
    photoId: string
    url: string
    method?: string
    headers?: Record<string, string>
  }>
}

const REPORT_STORAGE_PREFIX = 'casamia-estimate-report-'
const LEAD_STORAGE_KEY = 'casamia-estimate-leads'
const DELIVERY_STORAGE_KEY = 'casamia-report-deliveries'

const apiBase = (import.meta.env.VITE_ESTIMATE_API_URL ?? '').replace(/\/$/, '')
const publicApiBase = getPublicSiteApiBaseUrl()

export async function generateSafetyReport(input: EstimateWorkflowInput) {
  if (apiBase) {
    return submitViaApi(input)
  }

  return submitLocalDemo(input)
}

export async function sendReportDelivery(input: ReportDeliveryInput) {
  if (apiBase) {
    const response = await fetch(`${apiBase}/api/report-delivery`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(input),
    })

    if (!response.ok) {
      throw new Error('Could not queue report delivery.')
    }

    return (await response.json()) as {
      email: DeliveryChannelStatus
      whatsapp: DeliveryChannelStatus
    }
  }

  if (hasPublicSiteApi()) {
    await saveReportToPublicApi(input)

    return {
      email: input.contact.deliveryEmail ? 'queued' : 'not_requested',
      whatsapp: input.contact.deliveryWhatsapp ? 'queued' : 'not_requested',
    } satisfies {
      email: DeliveryChannelStatus
      whatsapp: DeliveryChannelStatus
    }
  }

  return queueLocalReportDelivery(input)
}

export async function submitEstimateWorkflow(input: LegacyEstimateWorkflowInput) {
  if (apiBase) {
    return submitViaApi(input)
  }

  const report = await submitLocalDemo(input)

  await sendReportDelivery({
    reportType: 'safety',
    token: report.token,
    reportTitle: 'Safety Report',
    reportUrl: report.reportUrl,
    contact: input.contact,
  })

  return loadEstimateReport(report.token)
}

export async function loadEstimateReport(token: string) {
  if (apiBase) {
    const response = await fetch(`${apiBase}/api/estimate/report/${encodeURIComponent(token)}`)

    if (!response.ok) {
      throw new Error('Estimate report not found.')
    }

    return (await response.json()) as EstimateReport
  }

  if (publicApiBase) {
    try {
      return await loadPublicSafetyReport(token)
    } catch {
      // Fall through to the local demo report below.
    }
  }

  const raw = window.localStorage.getItem(`${REPORT_STORAGE_PREFIX}${token}`)

  if (!raw) {
    throw new Error('Estimate report not found.')
  }

  return JSON.parse(raw) as EstimateReport
}

async function submitViaApi(input: EstimateWorkflowInput) {
  const intakeResponse = await fetch(`${apiBase}/api/estimate/intake`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      context: input.context,
      photos: input.photos.map(({ file, id, room }) => ({
        id,
        room,
        fileName: file.name,
        fileSize: file.size,
        mediaType: file.type,
      })),
    }),
  })

  if (!intakeResponse.ok) {
    throw new Error('Could not create the estimate request.')
  }

  const intake = (await intakeResponse.json()) as IntakeResponse
  const photoById = new Map(input.photos.map((photo) => [photo.id, photo]))

  await Promise.all(
    intake.uploadUrls.map(async (upload) => {
      const photo = photoById.get(upload.photoId)

      if (!photo) {
        throw new Error('Upload URL did not match a selected photo.')
      }

      const uploadResponse = await fetch(upload.url, {
        method: upload.method ?? 'PUT',
        headers: upload.headers,
        body: photo.file,
      })

      if (!uploadResponse.ok) {
        throw new Error(`Could not upload ${photo.file.name}.`)
      }
    }),
  )

  const analyseResponse = await fetch(`${apiBase}/api/estimate/analyse`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      requestId: intake.requestId,
      reportToken: intake.reportToken,
      locale: input.locale,
    }),
  })

  if (!analyseResponse.ok) {
    throw new Error('Could not analyse the home photos.')
  }

  return (await analyseResponse.json()) as EstimateReport
}

async function submitLocalDemo(input: EstimateWorkflowInput) {
  const token = createToken()
  const createdAt = new Date()
  const expiresAt = new Date(createdAt)
  expiresAt.setDate(createdAt.getDate() + 30)

  await new Promise((resolve) => window.setTimeout(resolve, 900))

  const report = buildLocalReport(input, token, createdAt.toISOString(), expiresAt.toISOString())
  persistLocalReport(report)

  return report
}

async function saveReportToPublicApi(input: ReportDeliveryInput) {
  const path =
    input.reportType === 'safety'
      ? '/api/public/safety-reports'
      : '/api/public/grant-reports'

  await postPublicSiteJson(path, buildPublicReportPayload(input))
}

function buildPublicReportPayload(input: ReportDeliveryInput) {
  const preferredChannels = [
    input.contact.deliveryEmail ? 'email' : '',
    input.contact.deliveryWhatsapp ? 'whatsapp' : '',
  ].filter(Boolean)
  const basePayload = {
    public_token: input.token,
    token: input.token,
    report_url: input.reportUrl,
    report_title: input.reportTitle,
    customer_name: input.contact.name,
    customer_email: input.contact.email,
    customer_phone: input.contact.phone,
    delivery_email: input.contact.deliveryEmail,
    delivery_whatsapp: input.contact.deliveryWhatsapp,
    preferred_channels: preferredChannels,
    consent_at: input.contact.consentAt,
    submitted_at: new Date().toISOString(),
    status: 'New',
  }

  if (input.reportType === 'safety') {
    const report = input.report

    return {
      ...basePayload,
      type: 'safety_report',
      context: report?.context,
      risk_score: report?.riskScore,
      risk_level: report?.riskLevel,
      summary: report?.summary,
      recommendations: {
        summary: report?.summary,
        riskScore: report?.riskScore,
        riskLevel: report?.riskLevel,
        riskFactors: report?.riskFactors ?? [],
        hazards: report?.hazards ?? [],
        preventionStats: report?.preventionStats ?? [],
        followUpQuestions: report?.followUpQuestions ?? [],
      },
    }
  }

  return {
    ...basePayload,
    type: 'grant_report',
    recommendations: input.grantReport ?? {
      title: input.reportTitle,
      reportUrl: input.reportUrl,
    },
  }
}

async function loadPublicSafetyReport(token: string) {
  const raw = await getPublicSiteJson<Record<string, unknown>>(
    `/api/public/safety-reports/${encodeURIComponent(token)}`,
  )

  return normalisePublicSafetyReport(raw, token)
}

function normalisePublicSafetyReport(raw: Record<string, unknown>, token: string): EstimateReport {
  const recommendations = getRecord(raw.recommendations) ?? getRecord(raw.report) ?? raw
  const context = getRecord(raw.context) ?? getRecord(recommendations.context)
  const hazards = getArray(recommendations.hazards).filter(isEstimateHazard)
  const preventionStats = getArray(recommendations.preventionStats ?? recommendations.prevention_stats)
    .filter(isEstimatePreventionStat)
  const riskScore = clampRiskScore(
    safeNumber(
      recommendations.riskScore ??
        recommendations.risk_score ??
        raw.risk_score ??
        raw.riskScore ??
        0,
    ),
  )
  const riskLevel = isEstimateRiskLevel(recommendations.riskLevel ?? recommendations.risk_level)
    ? (recommendations.riskLevel ?? recommendations.risk_level) as EstimateRiskLevel
    : getRiskLevel(riskScore)
  const reportToken = safeString(raw.public_token ?? raw.token, token)
  const createdAt = safeString(raw.created_at ?? raw.createdAt, new Date().toISOString())
  const expiresAt = safeString(raw.expires_at ?? raw.expiresAt, getDefaultExpiry(createdAt))

  return {
    token: reportToken,
    createdAt,
    expiresAt,
    reportUrl: `${window.location.origin}/estimate/${reportToken}`,
    summary: safeString(
      recommendations.summary ?? raw.summary,
      'CasaMia prepared this room-by-room safety report from the submitted home context.',
    ),
    riskScore,
    riskLevel,
    riskFactors: getArray(recommendations.riskFactors ?? recommendations.risk_factors)
      .map((item) => safeString(item))
      .filter(Boolean),
    hazards,
    preventionStats,
    followUpQuestions: getArray(
      recommendations.followUpQuestions ?? recommendations.follow_up_questions,
    )
      .map((item) => safeString(item))
      .filter(Boolean),
    delivery: {
      email: 'sent',
      whatsapp: 'not_requested',
    },
    lead: {
      name: safeString(raw.customer_name ?? raw.name),
      email: '',
      phone: safeString(raw.customer_phone ?? raw.phone),
      preferredChannels: [],
    },
    context: {
      region: safeString(context?.region),
      postcode: safeString(context?.postcode),
      homeType: safeString(context?.homeType ?? context?.home_type),
      mainConcern: safeString(context?.mainConcern ?? context?.main_concern),
      urgency: safeString(context?.urgency),
      mobilityProfile: safeString(context?.mobilityProfile ?? context?.mobility_profile),
      description: safeString(context?.description),
      photoCount: safeNumber(context?.photoCount ?? context?.photo_count),
      rooms: getArray(context?.rooms).map((item) => safeString(item)).filter(Boolean),
    },
    backendMode: 'api',
  }
}

function getRecord(value: unknown) {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function getArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function isEstimateHazard(value: unknown): value is EstimateHazard {
  const hazard = getRecord(value)

  return Boolean(
    hazard &&
      typeof hazard.room === 'string' &&
      typeof hazard.issue === 'string' &&
      isEstimateSeverity(hazard.severity) &&
      typeof hazard.recommendation === 'string',
  )
}

function isEstimatePreventionStat(value: unknown): value is EstimatePreventionStat {
  const stat = getRecord(value)

  return Boolean(
    stat &&
      typeof stat.value === 'string' &&
      typeof stat.label === 'string' &&
      typeof stat.source === 'string',
  )
}

function isEstimateSeverity(value: unknown): value is EstimateSeverity {
  return value === 'low' || value === 'medium' || value === 'high'
}

function safeString(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function safeNumber(value: unknown) {
  const parsed = typeof value === 'number' ? value : Number.parseFloat(String(value ?? '0'))

  return Number.isFinite(parsed) ? parsed : 0
}

function getDefaultExpiry(createdAt: string) {
  const expiresAt = new Date(createdAt)
  expiresAt.setDate(expiresAt.getDate() + 30)

  return expiresAt.toISOString()
}

function buildLocalReport(
  input: EstimateWorkflowInput,
  token: string,
  createdAt: string,
  expiresAt: string,
): EstimateReport {
  const rooms = Array.from(new Set(input.photos.map((photo) => photo.room).filter(Boolean)))
  const hazards = buildPhotoHazards(input)
  const riskAssessment = buildRiskAssessment(input, hazards)

  return {
    token,
    createdAt,
    expiresAt,
    reportUrl: `${window.location.origin}/estimate/${token}`,
    summary: buildReportSummary(input, hazards.length),
    riskScore: riskAssessment.riskScore,
    riskLevel: riskAssessment.riskLevel,
    riskFactors: riskAssessment.riskFactors,
    hazards,
    preventionStats: buildPreventionStats(input.locale),
    followUpQuestions: buildReportFollowUpQuestions(input),
    delivery: {
      email: 'not_requested',
      whatsapp: 'not_requested',
    },
    lead: {
      name: '',
      email: '',
      phone: '',
      preferredChannels: [],
    },
    context: {
      ...input.context,
      photoCount: input.photos.length,
      rooms,
    },
    backendMode: 'local-demo',
  }
}

export function getEstimateRiskAssessment(
  report: EstimateReport,
  locale = 'en',
): EstimateRiskAssessment {
  const score =
    typeof report.riskScore === 'number'
      ? report.riskScore
      : typeof report.confidence === 'number'
        ? report.confidence
        : deriveRiskScoreFromReport(report)
  const riskScore = clampRiskScore(score)
  const riskLevel = isEstimateRiskLevel(report.riskLevel)
    ? report.riskLevel
    : getRiskLevel(riskScore)
  const baseRiskFactors =
    Array.isArray(report.riskFactors) && report.riskFactors.length > 0
      ? report.riskFactors
      : buildFallbackRiskFactors(report, locale)
  const riskFactors = augmentRiskFactors(report, baseRiskFactors, riskLevel, locale)

  return {
    riskScore,
    riskLevel,
    riskFactors,
  }
}

function augmentRiskFactors(
  report: EstimateReport,
  factors: string[],
  riskLevel: EstimateRiskLevel,
  locale: string,
) {
  if (riskLevel !== 'high' && riskLevel !== 'elevated') {
    return factors
  }

  const hazardCount = report.hazards.length

  if (hazardCount > 2) {
    return factors
  }

  const alreadyExplainsCount = factors.some((factor) =>
    includesAny(normaliseText(factor), ['possible issue', 'posible riesgo']),
  )

  if (alreadyExplainsCount) {
    return factors
  }

  return prioritiseRiskFactors(
    [
      ...factors,
      localiseReportText(locale, {
        en: `${hazardCount} possible ${hazardCount === 1 ? 'issue was' : 'issues were'} found, but the level is ${riskLevel === 'high' ? 'high' : 'elevated'} because severity, room type, mobility profile, urgency, and notes are weighted together.`,
        es: `Se ${hazardCount === 1 ? 'ha detectado' : 'han detectado'} ${hazardCount} posible${hazardCount === 1 ? '' : 's'} riesgo${hazardCount === 1 ? '' : 's'}, pero el nivel es ${riskLevel === 'high' ? 'alto' : 'elevado'} porque se ponderan juntos gravedad, estancia, movilidad, prioridad y notas.`,
      }),
    ],
    riskLevel,
  ).slice(0, 5)
}

function buildRiskAssessment(
  input: EstimateWorkflowInput,
  hazards: EstimateHazard[],
): EstimateRiskAssessment {
  const factors = new Set<string>()
  const roomText = normaliseText(input.photos.map((photo) => photo.room).join(' '))
  const concernText = normaliseText(input.context.mainConcern)
  const urgencyText = normaliseText(input.context.urgency)
  const mobilityText = normaliseText(input.context.mobilityProfile)
  const notesText = normaliseText(input.context.description)
  let score = 12 + Math.min(20, input.photos.length * 4)

  const add = (points: number, factor?: string) => {
    score += points

    if (factor) {
      factors.add(factor)
    }
  }

  const highSeverityCount = hazards.filter((hazard) => hazard.severity === 'high').length
  const mediumSeverityCount = hazards.filter((hazard) => hazard.severity === 'medium').length

  if (highSeverityCount > 0) {
    add(
      Math.min(36, highSeverityCount * 18),
      localiseReportText(input.locale, {
        en: 'High-priority room findings increase the overall home safety risk.',
        es: 'Los hallazgos de alta prioridad elevan el nivel de riesgo de seguridad del hogar.',
      }),
    )
  }

  if (mediumSeverityCount > 0) {
    add(Math.min(18, mediumSeverityCount * 9))
  }

  if (roomText.includes('bath') || roomText.includes('bano')) {
    add(
      12,
      localiseReportText(input.locale, {
        en: 'Bathroom photos suggest wet-floor or transfer risks should be reviewed first.',
        es: 'Las fotos del baño sugieren revisar primero riesgos de suelo mojado o transferencias.',
      }),
    )
  }

  if (roomText.includes('stair') || roomText.includes('escalera')) {
    add(
      12,
      localiseReportText(input.locale, {
        en: 'Stairs or level changes increase fall-prevention priority.',
        es: 'Escaleras o desniveles aumentan la prioridad preventiva frente a caídas.',
      }),
    )
  }

  if (roomText.includes('entrance') || roomText.includes('entrada') || roomText.includes('access')) {
    add(
      8,
      localiseReportText(input.locale, {
        en: 'Entrance or access photos indicate the main route into the home should be checked.',
        es: 'Las fotos de entrada o acceso indican que conviene revisar el recorrido principal.',
      }),
    )
  }

  if (includesAny(concernText, ['fall', 'slip', 'caida', 'resbal'])) {
    add(
      16,
      localiseReportText(input.locale, {
        en: 'Fall or slipping concerns raise the risk level.',
        es: 'La preocupación por caídas o resbalones sube el nivel de riesgo.',
      }),
    )
  }

  if (includesAny(concernText, ['bath', 'bano'])) {
    add(
      10,
      localiseReportText(input.locale, {
        en: 'Bathroom safety was selected as a priority concern.',
        es: 'La seguridad en el baño se ha seleccionado como preocupación prioritaria.',
      }),
    )
  }

  if (includesAny(concernText, ['stair', 'access', 'escalera', 'acceso'])) {
    add(
      10,
      localiseReportText(input.locale, {
        en: 'Stairs or access were selected as priority concerns.',
        es: 'Escaleras o acceso se han seleccionado como preocupaciones prioritarias.',
      }),
    )
  }

  if (includesAny(concernText, ['emergency', 'alert', 'emergencia', 'alerta'])) {
    add(
      8,
      localiseReportText(input.locale, {
        en: 'Emergency alert concerns suggest response time should be reviewed.',
        es: 'Las alertas de emergencia sugieren revisar tiempos de respuesta y aviso.',
      }),
    )
  }

  if (urgencyText.includes('urgent')) {
    add(
      12,
      localiseReportText(input.locale, {
        en: 'The requested priority indicates an immediate safety concern.',
        es: 'La prioridad indicada señala una preocupación de seguridad inmediata.',
      }),
    )
  } else if (urgencyText.includes('month')) {
    add(8)
  }

  if (mobilityText.includes('recent fall')) {
    add(
      34,
      localiseReportText(input.locale, {
        en: 'Recent falls make preventive action more urgent.',
        es: 'Las caídas recientes hacen más urgente la acción preventiva.',
      }),
    )
  } else if (includesAny(mobilityText, ['wheelchair', 'reduced'])) {
    add(
      18,
      localiseReportText(input.locale, {
        en: 'Reduced mobility increases the need for safer access and support points.',
        es: 'La movilidad reducida aumenta la necesidad de accesos y puntos de apoyo seguros.',
      }),
    )
  } else if (includesAny(mobilityText, ['cane', 'walker'])) {
    add(
      16,
      localiseReportText(input.locale, {
        en: 'Use of a cane or walker increases fall-prevention priority.',
        es: 'El uso de bastón o andador aumenta la prioridad preventiva frente a caídas.',
      }),
    )
  } else if (mobilityText.includes('occasional')) {
    add(
      10,
      localiseReportText(input.locale, {
        en: 'Balance concerns increase the preventive risk level.',
        es: 'Los problemas de equilibrio aumentan el nivel de riesgo preventivo.',
      }),
    )
  } else if (mobilityText.includes('not sure')) {
    add(4)
  }

  if (includesAny(notesText, ['fall', 'caida'])) {
    add(
      10,
      localiseReportText(input.locale, {
        en: 'The notes mention fall concerns.',
        es: 'Las notas mencionan preocupación por caídas.',
      }),
    )
  }

  if (includesAny(notesText, ['walker', 'andador', 'cane', 'baston', 'wheelchair', 'silla'])) {
    add(
      8,
      localiseReportText(input.locale, {
        en: 'The notes mention mobility support needs.',
        es: 'Las notas mencionan necesidades de apoyo a la movilidad.',
      }),
    )
  }

  if (includesAny(notesText, ['slippery', 'slip', 'resbala', 'resbal'])) {
    add(
      8,
      localiseReportText(input.locale, {
        en: 'The notes mention slippery surfaces.',
        es: 'Las notas mencionan superficies resbaladizas.',
      }),
    )
  }

  if (includesAny(notesText, ['poor lighting', 'dark', 'poca luz', 'iluminacion'])) {
    add(
      8,
      localiseReportText(input.locale, {
        en: 'The notes mention poor lighting or visibility.',
        es: 'Las notas mencionan poca luz o falta de visibilidad.',
      }),
    )
  }

  if (includesAny(notesText, ['difficult access', 'hard to access', 'acceso dificil'])) {
    add(
      6,
      localiseReportText(input.locale, {
        en: 'The notes mention difficult access.',
        es: 'Las notas mencionan dificultad de acceso.',
      }),
    )
  }

  if (factors.size === 0) {
    factors.add(
      localiseReportText(input.locale, {
        en: 'Room photos and home context create the starting safety risk level.',
        es: 'Las fotos y el contexto del hogar crean el nivel inicial de riesgo.',
      }),
    )
  }

  const riskScore = clampRiskScore(score)
  const riskLevel = getRiskLevel(riskScore)

  if ((riskLevel === 'high' || riskLevel === 'elevated') && hazards.length <= 2) {
    factors.add(
      localiseReportText(input.locale, {
        en: `${hazards.length} possible ${hazards.length === 1 ? 'issue was' : 'issues were'} found, but the level is ${riskLevel === 'high' ? 'high' : 'elevated'} because severity, room type, mobility profile, urgency, and notes are weighted together.`,
        es: `Se ${hazards.length === 1 ? 'ha detectado' : 'han detectado'} ${hazards.length} posible${hazards.length === 1 ? '' : 's'} riesgo${hazards.length === 1 ? '' : 's'}, pero el nivel es ${riskLevel === 'high' ? 'alto' : 'elevado'} porque se ponderan juntos gravedad, estancia, movilidad, prioridad y notas.`,
      }),
    )
  }

  return {
    riskScore,
    riskLevel,
    riskFactors: prioritiseRiskFactors(Array.from(factors), riskLevel).slice(0, 5),
  }
}

function prioritiseRiskFactors(factors: string[], riskLevel: EstimateRiskLevel) {
  if (riskLevel !== 'high' && riskLevel !== 'elevated') {
    return factors
  }

  return [...factors].sort((left, right) => {
    const leftIsCountExplanation = includesAny(normaliseText(left), [
      'possible issue',
      'posible riesgo',
    ])
    const rightIsCountExplanation = includesAny(normaliseText(right), [
      'possible issue',
      'posible riesgo',
    ])

    if (leftIsCountExplanation === rightIsCountExplanation) {
      return 0
    }

    return leftIsCountExplanation ? -1 : 1
  })
}

function deriveRiskScoreFromReport(report: EstimateReport) {
  const photoCount = report.context?.photoCount ?? 0
  const highSeverityCount = report.hazards.filter((hazard) => hazard.severity === 'high').length
  const mediumSeverityCount = report.hazards.filter((hazard) => hazard.severity === 'medium').length
  const roomText = normaliseText(report.hazards.map((hazard) => hazard.room).join(' '))
  const contextText = normaliseText(
    [
      report.context?.mainConcern,
      report.context?.urgency,
      report.context?.mobilityProfile,
      report.context?.description,
    ].join(' '),
  )
  let score = 12 + Math.min(20, photoCount * 4)

  score += Math.min(36, highSeverityCount * 18)
  score += Math.min(18, mediumSeverityCount * 9)

  if (includesAny(roomText, ['bath', 'bano'])) {
    score += 12
  }

  if (includesAny(roomText, ['stair', 'escalera'])) {
    score += 12
  }

  if (includesAny(roomText, ['entrance', 'entrada', 'access'])) {
    score += 8
  }

  if (includesAny(contextText, ['fall', 'slip', 'caida', 'resbal'])) {
    score += 14
  }

  if (includesAny(contextText, ['walker', 'andador', 'cane', 'baston', 'wheelchair', 'silla'])) {
    score += 14
  }

  return score
}

function buildFallbackRiskFactors(report: EstimateReport, locale: string) {
  const sourceHazards = [
    ...report.hazards.filter((hazard) => hazard.severity === 'high'),
    ...report.hazards.filter((hazard) => hazard.severity !== 'high'),
  ]
  const factors = sourceHazards
    .slice(0, 3)
    .map((hazard) => `${hazard.room}: ${hazard.issue}`)

  if (factors.length > 0) {
    return factors
  }

  return [
    localiseReportText(locale, {
      en: 'Room photos and home context create the starting safety risk level.',
      es: 'Las fotos y el contexto del hogar crean el nivel inicial de riesgo.',
    }),
  ]
}

function clampRiskScore(score: number) {
  return Math.max(0, Math.min(96, Math.round(score)))
}

function getRiskLevel(score: number): EstimateRiskLevel {
  if (score >= 80) {
    return 'high'
  }

  if (score >= 60) {
    return 'elevated'
  }

  if (score >= 40) {
    return 'moderate'
  }

  return 'low'
}

function isEstimateRiskLevel(value: unknown): value is EstimateRiskLevel {
  return value === 'low' || value === 'moderate' || value === 'elevated' || value === 'high'
}

function includesAny(value: string, terms: string[]) {
  return terms.some((term) => value.includes(term))
}

function buildHazards(input: EstimateWorkflowInput, rooms: string[]) {
  const hazards: EstimateHazard[] = []
  const roomList = rooms.length > 0 ? rooms : ['General']
  const description = input.context.description.toLowerCase()
  const concern = input.context.mainConcern.toLowerCase()

  if (roomList.some((room) => room.toLowerCase().includes('bath'))) {
    hazards.push({
      room: 'Bathroom',
      issue: 'Wet floor and transfer points may create a fall risk.',
      severity: 'high',
      recommendation: 'Add grab bars, non-slip flooring, and an accessible shower review.',
    })
  }

  if (roomList.some((room) => room.toLowerCase().includes('stair')) || concern.includes('stair')) {
    hazards.push({
      room: 'Stairs',
      issue: 'Stairs or level changes may need stronger hand support and visibility.',
      severity: 'high',
      recommendation: 'Fit handrails, stair tread contrast, and motion lighting.',
    })
  }

  if (roomList.some((room) => room.toLowerCase().includes('kitchen'))) {
    hazards.push({
      room: 'Kitchen',
      issue: 'Reach, heat, and floor-slip risks should be checked before installation.',
      severity: 'medium',
      recommendation: 'Review pull-out storage, anti-fatigue mats, stove alarms, and task lighting.',
    })
  }

  if (concern.includes('fall') || description.includes('fall') || description.includes('caída')) {
    hazards.push({
      room: 'Whole home',
      issue: 'The description mentions fall concerns, so emergency response should be part of the plan.',
      severity: 'high',
      recommendation: 'Add emergency call buttons, fall detection, and family alerts.',
    })
  }

  if (hazards.length === 0) {
    hazards.push({
      room: roomList[0],
      issue: 'Potential trip, lighting, or access risks need a room-by-room review.',
      severity: 'medium',
      recommendation: 'Start with grab support, clearer pathways, and motion lighting where needed.',
    })
  }

  return hazards
}

function buildSummary(hazardCount: number) {
  const plural = hazardCount === 1 ? 'risk area' : 'risk areas'

  return `Based on the photos and home context, CasaMia found ${hazardCount} possible ${plural}. This report highlights what to review first and how CasaMia can help reduce the risk.`
}

function buildFollowUpQuestions(input: EstimateWorkflowInput) {
  const questions = [
    'Can CasaMia review wider photos of the entrance, bathroom, and main walking route?',
    'Is the resident already using mobility support such as a cane, walker, or wheelchair?',
  ]

  if (input.context.urgency === 'Urgent') {
    questions.push('Is there an immediate fall or access risk that should be handled first?')
  }

  return questions
}

function buildPhotoHazards(input: EstimateWorkflowInput) {
  if (input.photos.length === 0) {
    return buildHazards(input, [])
  }

  const photos = input.photos
  const description = normaliseText(input.context.description)
  const concern = normaliseText(input.context.mainConcern)
  const isFallConcern =
    concern.includes('fall') ||
    concern.includes('caida') ||
    description.includes('fall') ||
    description.includes('caida')

  const hazards = photos.map((photo, index): EstimateHazard => {
    const room = photo.room || 'General'
    const roomKey = normaliseText(room)
    const roomLabel = formatPhotoRoom(input.locale, room, index)

    if (roomKey.includes('bath') || roomKey.includes('bano')) {
      return {
        room: roomLabel,
        issue: localiseReportText(input.locale, {
          en: 'Wet floors, shower transfers, and toilet access may create a high fall risk.',
          es: 'El suelo mojado, la entrada a la ducha y el acceso al inodoro pueden crear alto riesgo de caída.',
        }),
        severity: 'high',
        recommendation: localiseReportText(input.locale, {
          en: 'Prioritise grab bars, non-slip flooring, better lighting, and an accessible shower review.',
          es: 'Priorizar barras de apoyo, suelo antideslizante, mejor iluminación y revisión de ducha accesible.',
        }),
      }
    }

    if (roomKey.includes('stair') || roomKey.includes('escalera') || concern.includes('stair')) {
      return {
        room: roomLabel,
        issue: localiseReportText(input.locale, {
          en: 'Steps and level changes may need stronger hand support, contrast, and visibility.',
          es: 'Los escalones y desniveles pueden necesitar más apoyo, contraste visual y visibilidad.',
        }),
        severity: 'high',
        recommendation: localiseReportText(input.locale, {
          en: 'Fit handrails, anti-slip stair treads, contrast strips, and motion-activated lighting.',
          es: 'Instalar pasamanos, huellas antideslizantes, bandas de contraste e iluminación con sensor.',
        }),
      }
    }

    if (roomKey.includes('kitchen') || roomKey.includes('cocina')) {
      return {
        room: roomLabel,
        issue: localiseReportText(input.locale, {
          en: 'Reach, heat, appliance use, and floor-slip risks should be checked in this area.',
          es: 'Conviene revisar alcance, calor, uso de electrodomésticos y riesgo de resbalones en esta zona.',
        }),
        severity: isFallConcern ? 'high' : 'medium',
        recommendation: localiseReportText(input.locale, {
          en: 'Review pull-out storage, anti-fatigue mats, stove alarms, clearer pathways, and task lighting.',
          es: 'Revisar almacenamiento extraíble, alfombrillas seguras, alarmas de cocina, pasos despejados e iluminación de trabajo.',
        }),
      }
    }

    return {
      room: roomLabel,
      issue: localiseReportText(input.locale, {
        en: 'This room may contain trip, lighting, furniture-clearance, or emergency-access risks.',
        es: 'Esta estancia puede tener riesgos de tropiezo, poca iluminación, falta de espacio o acceso difícil en emergencia.',
      }),
      severity: isFallConcern ? 'high' : 'medium',
      recommendation: localiseReportText(input.locale, {
        en: 'Check clear walking routes, remove loose rugs, add motion lighting, and improve reachable support points.',
        es: 'Revisar pasos despejados, retirar alfombras sueltas, añadir iluminación con sensor y mejorar puntos de apoyo.',
      }),
    }
  })

  if ((concern.includes('emergency') || concern.includes('urgencia') || description.includes('caida')) && hazards.length > 0) {
    hazards[0] = {
      ...hazards[0],
      severity: 'high',
      recommendation: `${hazards[0].recommendation} ${localiseReportText(input.locale, {
        en: 'Include emergency call buttons or family alerts in the next review.',
        es: 'Incluir botones de emergencia o avisos familiares en la siguiente revisión.',
      })}`,
    }
  }

  return hazards
}

function buildReportSummary(input: EstimateWorkflowInput, hazardCount: number) {
  if (input.locale.startsWith('es')) {
    const plural = hazardCount === 1 ? 'posible zona de riesgo' : 'posibles zonas de riesgo'

    return `Según las fotos y el contexto del hogar, CasaMia ha detectado ${hazardCount} ${plural}. Este informe señala qué revisar primero y cómo CasaMia puede ayudar a reducir el riesgo.`
  }

  return buildSummary(hazardCount)
}

function buildPreventionStats(locale: string): EstimatePreventionStat[] {
  if (locale.startsWith('es')) {
    return [
      {
        value: '26%',
        label: 'menos caídas cuando se revisan y reducen los riesgos del hogar en personas mayores con riesgo.',
        source: 'Cochrane, 2023',
      },
      {
        value: 'Hogar',
        label: 'la mayoría de las caídas en personas mayores ocurren en casa, por eso conviene revisar cada estancia.',
        source: 'Cochrane, 2023',
      },
      {
        value: '37,3M',
        label: 'caídas al año requieren atención médica en todo el mundo.',
        source: 'OMS',
      },
    ]
  }

  return [
    {
      value: '26%',
      label: 'fewer falls when home hazards are assessed and reduced for older people at risk.',
      source: 'Cochrane, 2023',
    },
    {
      value: 'Home',
      label: 'is where most older-adult falls happen, which makes room-by-room prevention valuable.',
      source: 'Cochrane, 2023',
    },
    {
      value: '37.3M',
      label: 'falls worldwide require medical attention each year.',
      source: 'WHO',
    },
  ]
}

function buildReportFollowUpQuestions(input: EstimateWorkflowInput) {
  if (input.locale.startsWith('es')) {
    const questions = [
      '¿Puede CasaMia revisar fotos más amplias de la entrada, el baño y el recorrido principal?',
      '¿La persona usa bastón, andador, silla de ruedas u otro apoyo de movilidad?',
    ]

    if (input.context.urgency === 'Urgent') {
      questions.push('¿Existe un riesgo inmediato de caída o acceso que convenga resolver primero?')
    }

    return questions
  }

  return buildFollowUpQuestions(input)
}

function localiseReportText(locale: string, text: { en: string; es: string }) {
  return locale.startsWith('es') ? text.es : text.en
}

function formatPhotoRoom(locale: string, room: string, index: number) {
  const prefix = locale.startsWith('es') ? 'Foto' : 'Photo'
  return `${prefix} ${index + 1} · ${localiseRoom(locale, room || 'General')}`
}

function localiseRoom(locale: string, room: string) {
  if (!locale.startsWith('es')) {
    return room || 'General'
  }

  const roomKey = normaliseText(room)
  const rooms: Record<string, string> = {
    bath: 'Baño',
    bathroom: 'Baño',
    kitchen: 'Cocina',
    stair: 'Escalera',
    stairs: 'Escalera',
    bedroom: 'Dormitorio',
    entrance: 'Entrada',
    'living room': 'Salón',
    other: 'Otra estancia',
    general: 'General',
  }

  return rooms[roomKey] ?? room
}

function normaliseText(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

function persistLocalReport(report: EstimateReport) {
  window.localStorage.setItem(`${REPORT_STORAGE_PREFIX}${report.token}`, JSON.stringify(report))
}

function queueLocalReportDelivery(input: ReportDeliveryInput) {
  const delivery = {
    email: input.contact.deliveryEmail ? 'queued' : 'not_requested',
    whatsapp: input.contact.deliveryWhatsapp ? 'queued' : 'not_requested',
  } satisfies {
    email: DeliveryChannelStatus
    whatsapp: DeliveryChannelStatus
  }
  const preferredChannels = [
    input.contact.deliveryEmail ? 'email' : '',
    input.contact.deliveryWhatsapp ? 'whatsapp' : '',
  ].filter(Boolean)
  const currentDeliveries = JSON.parse(window.localStorage.getItem(DELIVERY_STORAGE_KEY) ?? '[]') as Array<unknown>
  const currentLeads = JSON.parse(window.localStorage.getItem(LEAD_STORAGE_KEY) ?? '[]') as Array<unknown>

  window.localStorage.setItem(
    DELIVERY_STORAGE_KEY,
    JSON.stringify([
      {
        token: input.token,
        reportType: input.reportType,
        reportTitle: input.reportTitle,
        reportUrl: input.reportUrl,
        queuedAt: new Date().toISOString(),
        name: input.contact.name,
        email: input.contact.email,
        phone: input.contact.phone,
        preferredChannels,
        delivery,
      },
      ...currentDeliveries,
    ].slice(0, 50)),
  )

  window.localStorage.setItem(
    LEAD_STORAGE_KEY,
    JSON.stringify([
      {
        token: input.token,
        reportType: input.reportType,
        status: 'delivery_queued',
        createdAt: new Date().toISOString(),
        name: input.contact.name,
        email: input.contact.email,
        phone: input.contact.phone,
        preferredChannels,
      },
      ...currentLeads,
    ].slice(0, 50)),
  )

  if (input.reportType === 'safety') {
    const raw = window.localStorage.getItem(`${REPORT_STORAGE_PREFIX}${input.token}`)

    if (raw) {
      const report = JSON.parse(raw) as EstimateReport
      persistLocalReport({
        ...report,
        delivery,
        lead: {
          name: input.contact.name,
          email: input.contact.email,
          phone: input.contact.phone,
          preferredChannels,
        },
      })
    }
  }

  return delivery
}

function createToken() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}
