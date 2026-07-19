import { formatServicePrice, getDefaultServicePackageAreas } from './serviceCatalogue.ts'
import { scorePhotoFindings } from './safetyReportScoring.ts'
import type {
  SafetyFindingCategory,
  SafetyFindingSeverity,
  SafetyPhotoFinding,
} from '../types/safetyAnalysis.ts'
import type { CasaMiaService, ServicePackageArea } from '../types/serviceCatalogue.ts'
import type {
  SafetyWizardState,
  WizardPhoto,
  WizardPhotoSafetyReport,
  WizardPriceRange,
  WizardRoomFinding,
  WizardRoomSafetyReport,
  WizardSafetyPriority,
  WizardSafetyReport,
  WizardServiceRecommendation,
} from '../types/wizard.ts'

const severityRank: Record<SafetyFindingSeverity, number> = { low: 1, medium: 2, high: 3 }

const roomToServiceArea: Partial<Record<WizardPhoto['room'], ServicePackageArea>> = {
  bathroom: 'bathroom',
  bedroom: 'bedroom',
  kitchen: 'kitchen',
  'living-room': 'living-room',
  stairs: 'stairs',
  entrance: 'entrance',
  outdoor: 'outdoor',
}

const categoryTerms: Record<SafetyFindingCategory, string[]> = {
  access: ['access', 'entrance', 'door', 'threshold', 'ramp', 'step'],
  emergency: ['alert', 'emergency', 'call button', 'sensor', 'family reassurance'],
  fire: ['fire', 'smoke', 'gas', 'carbon', 'stove', 'shut-off'],
  lighting: ['light', 'lighting', 'motion', 'night'],
  reach: ['reach', 'storage', 'shelf', 'cabinet', 'faucet', 'worktop'],
  slip: ['anti-slip', 'non-slip', 'floor', 'grip', 'mat', 'wet'],
  support: ['support', 'grab bar', 'handrail', 'rail', 'anchoring'],
  transfer: ['transfer', 'toilet', 'shower chair', 'bed rail', 'bedside'],
  trip: ['trip', 'route', 'rug', 'threshold', 'cable', 'movement'],
  other: [],
}

export function buildWizardSafetyReport(
  state: SafetyWizardState,
  services: CasaMiaService[],
  locale = 'en',
): WizardSafetyReport {
  const imagePhotos = state.photos.filter((photo) => !isVideo(photo))
  const analysedPhotos = imagePhotos.filter(
    (photo): photo is WizardPhoto & { analysis: NonNullable<WizardPhoto['analysis']> } =>
      photo.analysisStatus === 'analysed' && Boolean(photo.analysis),
  )
  const roomGroups = groupPhotosByRoom(imagePhotos)
  const rooms = [...roomGroups.entries()].map(([room, photos]) => buildRoomReport(room, photos, locale))
  const scoredRooms = rooms.filter((room) => room.safetyScore !== undefined)
  const roomRiskScores = scoredRooms.map((room) => 100 - (room.safetyScore ?? 100))
  const strongestRisk = roomRiskScores.length ? Math.max(...roomRiskScores) : 0
  const averageRisk = roomRiskScores.length
    ? roomRiskScores.reduce((total, score) => total + score, 0) / roomRiskScores.length
    : 0
  const safetyScore = scoredRooms.length
    ? clampScore(100 - ((strongestRisk * 0.65) + (averageRisk * 0.35)))
    : undefined
  const coverage = imagePhotos.length ? analysedPhotos.length / imagePhotos.length : 0
  const averageRoomConfidence = analysedPhotos.length
    ? analysedPhotos.reduce((total, photo) => total + photo.analysis.roomConfidence, 0) / analysedPhotos.length
    : 0
  const allFindings = rooms.flatMap((room) => room.findings)
  const topFindings = [...allFindings]
    .sort((left, right) => findingWeight(right) - findingWeight(left))
    .slice(0, 5)
  const priority = getOverallPriority(state, rooms, safetyScore)
  const serviceRecommendations = recommendServices(allFindings, services, locale)

  return {
    status: analysedPhotos.length === 0
      ? 'questionnaire-only'
      : analysedPhotos.length === imagePhotos.length
        ? 'complete'
        : 'partial',
    safetyScore,
    priority,
    confidence: coverage === 1 && averageRoomConfidence >= 0.75
      ? 'high'
      : coverage >= 0.5 && averageRoomConfidence >= 0.5
        ? 'medium'
        : 'low',
    analysedPhotoCount: analysedPhotos.length,
    totalPhotoCount: imagePhotos.length,
    coverage,
    rooms,
    topFindings,
    positiveFeatures: uniqueStrings(rooms.flatMap((room) => room.strengths)).slice(0, 5),
    contextSignals: buildContextSignals(state, locale),
    serviceRecommendations,
  }
}

export function buildRecommendedServicesPriceRange(
  report: WizardSafetyReport,
  services: CasaMiaService[],
  locale = 'en',
): WizardPriceRange | undefined {
  const selected = report.serviceRecommendations
    .map((recommendation) => services.find((service) => service.id === recommendation.serviceId))
    .filter((service): service is CasaMiaService => Boolean(service))

  if (!selected.length) return undefined

  let minimum = 0
  let recurringMonthlyMinimum = 0
  let pricedCount = 0
  let requiresQuote = false

  selected.forEach((service) => {
    const base = service.pricingType === 'fixed'
      ? (service.productPrice ?? 0) + (service.installationPrice ?? 0)
      : service.pricingType === 'from'
        ? service.fromPrice ?? 0
        : 0

    if (service.pricingType === 'quote_only' || base <= 0) requiresQuote = true
    if (base > 0) {
      minimum += base * (1 + service.vatRate)
      pricedCount += 1
    }
    if (service.recurringMonthlyPrice) recurringMonthlyMinimum += service.recurringMonthlyPrice
  })

  if (!pricedCount && requiresQuote) {
    return {
      label: locale.startsWith('es') ? 'Presupuesto personalizado' : 'Custom quote',
      source: 'service-catalogue',
      serviceIds: selected.map((service) => service.id),
      areaCount: new Set(selected.flatMap((service) => service.wizardAreas ?? [])).size,
      requiresQuote: true,
      vatIncluded: true,
    }
  }

  const roundedMinimum = Math.ceil(minimum)
  const currency = new Intl.NumberFormat(locale.startsWith('es') ? 'es-ES' : 'en-IE', {
    currency: 'EUR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(roundedMinimum)

  return {
    minimum: roundedMinimum,
    label: `${locale.startsWith('es') ? 'Desde' : 'From'} ${currency}`,
    source: 'service-catalogue',
    serviceIds: selected.map((service) => service.id),
    areaCount: new Set(selected.flatMap((service) => service.wizardAreas ?? [])).size,
    recurringMonthlyMinimum: recurringMonthlyMinimum || undefined,
    requiresQuote,
    vatIncluded: true,
  }
}

function buildRoomReport(
  room: WizardPhoto['room'],
  photos: WizardPhoto[],
  locale: string,
): WizardRoomSafetyReport {
  const analysed = photos.filter(
    (photo): photo is WizardPhoto & { analysis: NonNullable<WizardPhoto['analysis']> } =>
      photo.analysisStatus === 'analysed' && Boolean(photo.analysis),
  )
  const findings = dedupeFindings(analysed)
  const scored = scorePhotoFindings(findings, locale)
  const safetyScore = analysed.length ? clampScore(100 - scored.riskScore) : undefined
  const isSpanish = locale.startsWith('es')
  const photoAnalyses = photos.map((photo) => buildPhotoReport(photo, locale))

  return {
    room,
    photoIds: photos.map((photo) => photo.id),
    analysedPhotoCount: analysed.length,
    unavailablePhotoCount: photos.filter((photo) => photo.analysisStatus === 'unavailable').length,
    safetyScore,
    priority: safetyScore === undefined
      ? 'routine'
      : safetyScore < 45
        ? 'urgent'
        : safetyScore < 72
          ? 'attention'
          : 'routine',
    scoreExplanation: safetyScore === undefined
      ? isSpanish
        ? 'No hay suficiente evidencia visual para puntuar esta estancia.'
        : 'There is not enough visual evidence to score this room.'
      : isSpanish
        ? `${safetyScore}/100 según ${findings.length} ${findings.length === 1 ? 'hallazgo visible' : 'hallazgos visibles'} consolidados en ${analysed.length} ${analysed.length === 1 ? 'foto' : 'fotos'}.`
        : `${safetyScore}/100 from ${findings.length} consolidated visible ${findings.length === 1 ? 'finding' : 'findings'} across ${analysed.length} ${analysed.length === 1 ? 'photo' : 'photos'}.`,
    photoAnalyses,
    findings,
    strengths: uniqueStrings(analysed.flatMap((photo) => photo.analysis.strengths)).slice(0, 4),
    limitations: uniqueStrings(analysed.flatMap((photo) => photo.analysis.limitations)).slice(0, 4),
  }
}

function buildPhotoReport(photo: WizardPhoto, locale: string): WizardPhotoSafetyReport {
  const isSpanish = locale.startsWith('es')
  const analysis = photo.analysisStatus === 'analysed' ? photo.analysis : undefined

  if (!analysis) {
    return {
      photoId: photo.id,
      fileName: photo.name,
      analysisStatus: 'unavailable',
      priority: 'routine',
      scoreExplanation: isSpanish
        ? 'Esta foto no se pudo analizar y no influye en la puntuación.'
        : 'This photo could not be analysed and does not affect the score.',
      headline: isSpanish ? 'Revisión no disponible' : 'Review unavailable',
      overview: photo.analysisError ?? (isSpanish
        ? 'Prueba a subir una imagen más clara para incluir esta zona.'
        : 'Try uploading a clearer image to include this area.'),
      findings: [],
      strengths: [],
      limitations: [],
    }
  }

  const scored = scorePhotoFindings(analysis.findings, locale)
  const safetyScore = clampScore(100 - scored.riskScore)

  return {
    photoId: photo.id,
    fileName: photo.name,
    analysisStatus: 'analysed',
    safetyScore,
    priority: safetyScore < 45 ? 'urgent' : safetyScore < 72 ? 'attention' : 'routine',
    scoreExplanation: isSpanish
      ? `${safetyScore}/100 según ${analysis.findings.length} ${analysis.findings.length === 1 ? 'hallazgo visible' : 'hallazgos visibles'} en esta foto.`
      : `${safetyScore}/100 from ${analysis.findings.length} visible ${analysis.findings.length === 1 ? 'finding' : 'findings'} in this photo.`,
    headline: analysis.headline,
    overview: analysis.overview,
    findings: analysis.findings,
    strengths: analysis.strengths,
    limitations: analysis.limitations,
  }
}

function dedupeFindings(
  photos: Array<WizardPhoto & { analysis: NonNullable<WizardPhoto['analysis']> }>,
): WizardRoomFinding[] {
  const findings = new Map<string, WizardRoomFinding>()

  photos.forEach((photo) => {
    photo.analysis.findings.forEach((finding) => {
      const key = `${finding.category}:${normalise(finding.title)}`
      const existing = findings.get(key)

      if (existing) {
        existing.photoIds.push(photo.id)
        if (findingWeight(finding) > findingWeight(existing)) {
          findings.set(key, { ...finding, id: existing.id, room: photo.room, photoIds: existing.photoIds })
        }
        return
      }

      findings.set(key, {
        ...finding,
        id: `${photo.room}-${findings.size + 1}-${slug(finding.title)}`,
        room: photo.room,
        photoIds: [photo.id],
      })
    })
  })

  return [...findings.values()].sort((left, right) => findingWeight(right) - findingWeight(left))
}

function recommendServices(
  findings: WizardRoomFinding[],
  services: CasaMiaService[],
  locale: string,
): WizardServiceRecommendation[] {
  const isSpanish = locale.startsWith('es')

  return services
    .filter((service) => service.active)
    .flatMap((service) => {
      const categories = service.evidenceCategories?.length
        ? service.evidenceCategories
        : inferEvidenceCategories(service)
      const minimumSeverity = service.minimumEvidenceSeverity ?? 'low'
      const matches = findings.filter((finding) =>
        serviceMatchesFindingRoom(service, finding)
        && categories.includes(finding.category)
        && severityRank[finding.severity] >= severityRank[minimumSeverity],
      )

      if (!matches.length) return []

      const strongest = [...matches].sort((left, right) => findingWeight(right) - findingWeight(left))[0]
      const score = matches.reduce((total, finding) => total + findingWeight(finding), 0)

      return [{
        score,
        recommendation: {
          serviceId: service.id,
          name: service.name,
          room: service.room,
          customerBenefit: service.customerBenefit,
          priceLabel: formatServicePrice(service),
          reason: service.evidenceReason
            ?? (isSpanish
              ? `Responde a “${strongest.title}”, observado en las fotos de esta estancia.`
              : `Addresses “${strongest.title}”, observed in the room photos.`),
          matchedFindingIds: matches.map((finding) => finding.id),
          findingCategories: [...new Set(matches.map((finding) => finding.category))],
          highestSeverity: strongest.severity,
          requiresSiteVisit: service.requiresSiteVisit,
        } satisfies WizardServiceRecommendation,
      }]
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 8)
    .map(({ recommendation }) => recommendation)
}

function serviceMatchesFindingRoom(service: CasaMiaService, finding: WizardRoomFinding) {
  return serviceMatchesRoom(service, finding.room)
}

function serviceMatchesRoom(service: CasaMiaService, findingRoom: string) {
  const area = roomToServiceArea[findingRoom as WizardPhoto['room']]
  const serviceAreas = service.wizardAreas ?? getDefaultServicePackageAreas(service)
  if (area && serviceAreas.includes(area)) return true

  if (findingRoom === 'bathroom') return service.room === 'bathroom'
  if (findingRoom === 'bedroom') return service.room === 'bedroom'
  if (findingRoom === 'kitchen') return service.room === 'kitchen'
  if (findingRoom === 'entrance') return service.room === 'entrance'
  if (['living-room', 'stairs', 'outdoor'].includes(findingRoom)) return service.room === 'movement'
  return false
}

export function findBestServiceForPhotoAnalysis(
  room: string,
  findings: SafetyPhotoFinding[],
  services: CasaMiaService[],
) {
  return services
    .filter((service) => service.active && serviceMatchesRoom(service, room))
    .flatMap((service) => {
      const categories = service.evidenceCategories?.length
        ? service.evidenceCategories
        : inferEvidenceCategories(service)
      const minimumSeverity = service.minimumEvidenceSeverity ?? 'low'
      const matches = findings.filter((finding) =>
        categories.includes(finding.category)
        && severityRank[finding.severity] >= severityRank[minimumSeverity],
      )

      if (!matches.length) return []

      const strongestFinding = [...matches].sort(
        (left, right) => findingWeight(right) - findingWeight(left),
      )[0]
      const roomArea = roomToServiceArea[room as WizardPhoto['room']]
      const serviceAreas = service.wizardAreas ?? getDefaultServicePackageAreas(service)
      const roomSpecificity = roomArea && serviceAreas.includes(roomArea) ? 1_000 : 0
      const score = roomSpecificity
        + matches.reduce((total, finding) => total + findingWeight(finding), 0)

      return [{ service, finding: strongestFinding, score }]
    })
    .sort((left, right) => right.score - left.score)[0]
}

export function inferEvidenceCategories(service: CasaMiaService): SafetyFindingCategory[] {
  const text = normalise([
    service.name,
    service.category,
    service.shortDescription,
    service.customerBenefit,
    ...(service.includedItems ?? []),
  ].join(' '))
  const matches = (Object.entries(categoryTerms) as Array<[SafetyFindingCategory, string[]]>)
    .filter(([, terms]) => terms.some((term) => text.includes(term)))
    .map(([category]) => category)

  return matches.length ? matches : ['other']
}

function getOverallPriority(
  state: SafetyWizardState,
  rooms: WizardRoomSafetyReport[],
  safetyScore?: number,
): WizardSafetyPriority {
  const hasHighEvidence = rooms.some((room) =>
    room.findings.some((finding) => finding.severity === 'high' && finding.confidence >= 0.7),
  )
  const personalUrgency = state.urgency === 'urgent'
    || state.challenges.includes('falls')
    || state.mobilityLevel === 'assistance'
    || state.mobilityLevel === 'wheelchair'

  if (hasHighEvidence || (personalUrgency && safetyScore !== undefined && safetyScore < 70)) return 'urgent'
  if (safetyScore !== undefined && safetyScore < 72) return 'attention'
  if (state.currentRisks.some((risk) => risk !== 'not-sure')) return 'attention'
  return 'routine'
}

function buildContextSignals(state: SafetyWizardState, locale: string) {
  const isSpanish = locale.startsWith('es')
  const signals: string[] = []
  const mobilityLabels: Partial<Record<NonNullable<SafetyWizardState['mobilityLevel']>, [string, string]>> = {
    cane: ['Walking stick used', 'Usa bastón'],
    walker: ['Walking frame used', 'Usa andador'],
    wheelchair: ['Wheelchair mobility', 'Movilidad en silla de ruedas'],
    assistance: ['Daily mobility support', 'Apoyo diario para moverse'],
  }
  const challengeLabels: Partial<Record<SafetyWizardState['challenges'][number], [string, string]>> = {
    falls: ['Falls reported', 'Caídas indicadas'],
    balance: ['Balance concerns', 'Dificultades de equilibrio'],
    vision: ['Visibility needs', 'Necesidades de visibilidad'],
    strength: ['Strength or grip needs', 'Necesidades de fuerza o agarre'],
    'night-movement': ['Night-time movement', 'Desplazamientos nocturnos'],
    'emergency-support': ['Emergency reassurance', 'Apoyo ante emergencias'],
  }

  const mobilityLabel = state.mobilityLevel ? mobilityLabels[state.mobilityLevel] : undefined
  if (mobilityLabel) {
    signals.push(mobilityLabel[isSpanish ? 1 : 0])
  }
  state.challenges.forEach((challenge) => {
    const label = challengeLabels[challenge]
    if (label) signals.push(label[isSpanish ? 1 : 0])
  })
  if (state.urgency === 'urgent') signals.push(isSpanish ? 'Atención urgente solicitada' : 'Urgent attention requested')
  if (state.urgency === 'soon') signals.push(isSpanish ? 'Quiere actuar pronto' : 'Action wanted soon')

  return uniqueStrings(signals).slice(0, 5)
}

function groupPhotosByRoom(photos: WizardPhoto[]) {
  const groups = new Map<WizardPhoto['room'], WizardPhoto[]>()
  photos.forEach((photo) => groups.set(photo.room, [...(groups.get(photo.room) ?? []), photo]))
  return groups
}

function isVideo(photo: WizardPhoto) {
  return photo.kind === 'video' || photo.type.startsWith('video/')
}

function findingWeight(finding: Pick<SafetyPhotoFinding, 'severity' | 'confidence'>) {
  return severityRank[finding.severity] * (0.55 + (finding.confidence * 0.45))
}

function uniqueStrings(values: string[]) {
  const seen = new Set<string>()
  return values.filter((value) => {
    const key = normalise(value)
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function normalise(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

function slug(value: string) {
  return normalise(value).replace(/\s+/g, '-').slice(0, 44)
}

function clampScore(value: number) {
  return Math.max(5, Math.min(100, Math.round(value)))
}
