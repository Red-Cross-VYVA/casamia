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
  contact: {
    name: string
    email: string
    phone: string
    deliveryEmail: boolean
    deliveryWhatsapp: boolean
    consentAt: string
  }
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

const apiBase = (import.meta.env.VITE_ESTIMATE_API_URL ?? '').replace(/\/$/, '')

export async function submitEstimateWorkflow(input: EstimateWorkflowInput) {
  if (apiBase) {
    return submitViaApi(input)
  }

  return submitLocalDemo(input)
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
      contact: input.contact,
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
  persistLocalLeadIntake(input, token, createdAt.toISOString())

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
  const hazards = buildHazards(input, rooms)
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
  const preferredChannels = [
    input.contact.deliveryEmail ? 'email' : '',
    input.contact.deliveryWhatsapp ? 'whatsapp' : '',
  ].filter(Boolean)

  return {
    token,
    createdAt,
    expiresAt,
    reportUrl: `${window.location.origin}/estimate/${token}`,
    summary: buildSummary(input, plan, hazards.length),
    recommendedPlan: plan,
    recommendedPlanId,
    estimatedCostRange,
    grantEstimateRange,
    confidence: Math.min(94, 62 + input.photos.length * 5 + highRiskCount * 6),
    hazards,
    followUpQuestions: buildFollowUpQuestions(input),
    delivery: {
      email: input.contact.deliveryEmail ? 'queued' : 'not_requested',
      whatsapp: input.contact.deliveryWhatsapp ? 'queued' : 'not_requested',
    },
    lead: {
      name: input.contact.name,
      email: input.contact.email,
      phone: input.contact.phone,
      preferredChannels,
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

  return `Based on the photos and context${location}, CasaMia found ${hazardCount} likely ${plural}. The ${plan} plan is the best starting point for a safer home assessment. Possible grants still need regional verification.`
}

function buildFollowUpQuestions(input: EstimateWorkflowInput) {
  const questions = [
    'Can CasaMia review wider photos of the entrance, bathroom, and main walking route?',
    'Is the resident already using mobility support such as a cane, walker, or wheelchair?',
  ]

  if (!input.context.region) {
    questions.push('Which autonomous community should CasaMia check for current grant calls?')
  }

  if (input.context.urgency === 'Urgent') {
    questions.push('Is there an immediate fall or access risk that should be handled before grant paperwork?')
  }

  return questions
}

function persistLocalLeadIntake(input: EstimateWorkflowInput, token: string, createdAt: string) {
  const current = JSON.parse(window.localStorage.getItem(LEAD_STORAGE_KEY) ?? '[]') as Array<unknown>
  window.localStorage.setItem(
    LEAD_STORAGE_KEY,
    JSON.stringify([
      {
        token,
        createdAt,
        status: 'intake_created',
        name: input.contact.name,
        email: input.contact.email,
        phone: input.contact.phone,
        postcode: input.context.postcode,
        photoCount: input.photos.length,
        preferredChannels: [
          input.contact.deliveryEmail ? 'email' : '',
          input.contact.deliveryWhatsapp ? 'whatsapp' : '',
        ].filter(Boolean),
      },
      ...current,
    ].slice(0, 50)),
  )
}

function persistLocalReport(report: EstimateReport) {
  window.localStorage.setItem(`${REPORT_STORAGE_PREFIX}${report.token}`, JSON.stringify(report))

  const current = JSON.parse(window.localStorage.getItem(LEAD_STORAGE_KEY) ?? '[]') as Array<unknown>
  window.localStorage.setItem(
    LEAD_STORAGE_KEY,
    JSON.stringify(
      current.map((lead) => {
        if (!lead || typeof lead !== 'object' || !('token' in lead) || lead.token !== report.token) {
          return lead
        }

        return {
          ...lead,
          status: 'estimate_ready',
          recommendedPlan: report.recommendedPlan,
        }
      }).concat(current.some((lead) => Boolean(lead && typeof lead === 'object' && 'token' in lead && lead.token === report.token)) ? [] : [{
        token: report.token,
        createdAt: report.createdAt,
        status: 'estimate_ready',
        name: report.lead.name,
        email: report.lead.email,
        phone: report.lead.phone,
        postcode: report.context.postcode,
        recommendedPlan: report.recommendedPlan,
      }]).slice(0, 50),
    ),
  )
}

function createToken() {
  if (window.crypto?.randomUUID) {
    return window.crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 12)}`
}
