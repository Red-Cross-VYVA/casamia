import { PLAN_PRICES, type PlanId } from '../constants/shopify'

export type EstimatePlanName = 'Essential' | 'Advanced' | 'Premium'
export type EstimateSeverity = 'low' | 'medium' | 'high'
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

export type MoneyRange = {
  min: number
  max: number
}

export type EstimateReport = {
  token: string
  createdAt: string
  expiresAt: string
  reportUrl: string
  summary: string
  recommendedPlan: EstimatePlanName
  recommendedPlanId: PlanId
  estimatedCostRange: MoneyRange
  grantEstimateRange: MoneyRange
  confidence: number
  hazards: EstimateHazard[]
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
    reportTitle: report.recommendedPlan,
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

function buildLocalReport(
  input: EstimateWorkflowInput,
  token: string,
  createdAt: string,
  expiresAt: string,
): EstimateReport {
  const rooms = Array.from(new Set(input.photos.map((photo) => photo.room).filter(Boolean)))
  const hazards = buildPhotoHazards(input)
  const highRiskCount = hazards.filter((hazard) => hazard.severity === 'high').length
  const plan = choosePlan(input, hazards.length, highRiskCount)
  const recommendedPlanId = plan.toLowerCase() as PlanId
  const basePrice = PLAN_PRICES[recommendedPlanId]
  const estimatedCostRange = {
    min: Math.max(220, Math.round(basePrice * 0.82)),
    max: Math.round(basePrice * 1.22),
  }
  const grantEstimateRange = {
    min: Math.round(estimatedCostRange.min * 0.35),
    max: Math.round(estimatedCostRange.max * 0.78),
  }

  return {
    token,
    createdAt,
    expiresAt,
    reportUrl: `${window.location.origin}/estimate/${token}`,
    summary: buildReportSummary(input, plan, hazards.length),
    recommendedPlan: plan,
    recommendedPlanId,
    estimatedCostRange,
    grantEstimateRange,
    confidence: Math.min(94, 62 + input.photos.length * 5 + highRiskCount * 6),
    hazards,
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

function choosePlan(input: EstimateWorkflowInput, hazardCount: number, highRiskCount: number): EstimatePlanName {
  if (
    input.context.mainConcern.includes('Emergency') ||
    input.context.mainConcern.includes('Smart') ||
    highRiskCount >= 3
  ) {
    return 'Premium'
  }

  if (hazardCount >= 2 || input.photos.length >= 3) {
    return 'Advanced'
  }

  return 'Essential'
}

function buildSummary(input: EstimateWorkflowInput, plan: EstimatePlanName, hazardCount: number) {
  const location = input.context.postcode ? ` in ${input.context.postcode}` : ''
  const plural = hazardCount === 1 ? 'risk area' : 'risk areas'

  return `Based on the photos and context${location}, CasaMia found ${hazardCount} likely ${plural}. The ${plan} plan is the best starting point for a focused home safety review.`
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

function buildReportSummary(input: EstimateWorkflowInput, plan: EstimatePlanName, hazardCount: number) {
  if (input.locale.startsWith('es')) {
    const location = input.context.postcode ? ` en ${input.context.postcode}` : ''
    const plural = hazardCount === 1 ? 'zona de riesgo probable' : 'zonas de riesgo probables'

    return `Según las fotos y el contexto${location}, CasaMia ha detectado ${hazardCount} ${plural}. El plan ${plan} es el mejor punto de partida para una revisión enfocada en la seguridad del hogar.`
  }

  return buildSummary(input, plan, hazardCount)
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
