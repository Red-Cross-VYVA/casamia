import { getWizardPriceRange } from '../config/wizardPricing.ts'
import type { CasaMiaService } from '../types/serviceCatalogue.ts'
import type {
  SafetyWizardState,
  WizardChallenge,
  WizardImprovement,
  WizardResult,
  WizardRisk,
  WizardRoom,
} from '../types/wizard.ts'

const highRiskChallenges = new Set<WizardChallenge>(['falls', 'balance', 'strength', 'night-movement'])
const highRiskHazards = new Set<WizardRisk>([
  'slippery-floors',
  'difficult-stairs',
  'high-thresholds',
  'unsafe-bathroom',
])

const improvementsByRisk: Partial<Record<WizardRisk, Omit<WizardImprovement, 'priority'>>> = {
  'slippery-floors': { id: 'secure-flooring', label: 'Secure loose rugs and slippery surfaces' },
  'poor-lighting': { id: 'improve-lighting', label: 'Improve lighting on daily routes' },
  'loose-rugs': { id: 'secure-rugs', label: 'Remove or secure loose rugs' },
  'difficult-stairs': { id: 'stair-support', label: 'Add stair grip, lighting and handrail support' },
  'high-thresholds': { id: 'threshold-access', label: 'Reduce or mark difficult thresholds' },
  'hard-to-reach-storage': { id: 'storage-reach', label: 'Move everyday storage into easy reach' },
  'unsafe-bathroom': { id: 'bathroom-support', label: 'Improve shower access and bathroom support' },
  'no-emergency-alert': { id: 'emergency-alert', label: 'Add an emergency alert option' },
}

const improvementsByRoom: Partial<Record<WizardRoom, Omit<WizardImprovement, 'priority'>>> = {
  bathroom: { id: 'bathroom-review', label: 'Review bathroom transfers and support points' },
  bedroom: { id: 'bedroom-route', label: 'Make the bedside and night route safer' },
  kitchen: { id: 'kitchen-reach', label: 'Improve kitchen reach, lighting and floor grip' },
  'living-room': { id: 'living-route', label: 'Create a clear living-room movement route' },
  stairs: { id: 'stairs-review', label: 'Review handrails, contrast and stair lighting' },
  entrance: { id: 'entrance-support', label: 'Improve entrance access and support' },
  outdoor: { id: 'outdoor-route', label: 'Improve exterior paths, steps and lighting' },
  lighting: { id: 'motion-lighting', label: 'Add motion lighting where it reduces night risk' },
  'smart-safety': { id: 'smart-safety', label: 'Review alerts, sensors and smart safety options' },
}

type WizardResultOptions = {
  services?: CasaMiaService[]
  language?: string
}

export function generateWizardResult(
  state: SafetyWizardState,
  options: WizardResultOptions = {},
): WizardResult {
  if (state.userType === 'client') {
    return {
      safetyProfile: 'business',
      riskScore: 0,
      recommendedPlan: 'business-consultation',
      selectedPlan: state.result?.selectedPlan ?? 'business-consultation',
      improvements: [],
      confidence: state.photos.length || state.voiceRecording ? 'supported' : 'early',
      nextAction: 'business-consultation',
    }
  }

  const riskScore = calculateRiskScore(state)
  const improvements = buildImprovements(state)
  const wantsSmartSafety =
    state.areasOfConcern.includes('smart-safety') ||
    state.challenges.includes('emergency-support') ||
    state.currentRisks.includes('no-emergency-alert')

  const recommendedPlan = wantsSmartSafety
    ? 'smart-safety'
    : riskScore >= 6 || improvements.length >= 3
      ? 'home-safety'
      : 'assessment'

  const safetyProfile = wantsSmartSafety
    ? 'smart-safety'
    : riskScore >= 12 || state.urgency === 'urgent'
      ? 'high-priority'
      : riskScore >= 5
        ? 'moderate'
        : 'prevention'

  return {
    safetyProfile,
    riskScore,
    recommendedPlan,
    selectedPlan: state.result?.selectedPlan ?? recommendedPlan,
    improvements,
    priceRange: options.services
      ? getWizardPriceRange(state, options.services, options.language)
      : undefined,
    confidence: state.inspectionBooked
      ? 'inspection'
      : state.photos.length || state.voiceRecording
        ? 'supported'
        : 'early',
    nextAction: state.inspectionBooked ? 'request-proposal' : 'book-visit',
  }
}

export function calculateRiskScore(state: SafetyWizardState) {
  let score = 0
  score += state.currentRisks.reduce((total, risk) => total + (highRiskHazards.has(risk) ? 2 : risk === 'not-sure' ? 0 : 1), 0)
  score += state.challenges.reduce((total, challenge) => total + (highRiskChallenges.has(challenge) ? 2 : 1), 0)
  score += state.areasOfConcern.filter((area) => area !== 'not-sure').length
  if (state.mobilityLevel && !['independent', 'prefer-not'].includes(state.mobilityLevel)) score += 2
  if (state.floorCount !== 'one' && state.stairsType && state.stairsType !== 'none') score += 2
  if (state.urgency === 'soon') score += 1
  if (state.urgency === 'urgent') score += 3
  return score
}

function buildImprovements(state: SafetyWizardState) {
  const deduped = new Map<string, WizardImprovement>()

  state.currentRisks.forEach((risk) => {
    const improvement = improvementsByRisk[risk]
    if (!improvement) return
    deduped.set(improvement.id, {
      ...improvement,
      priority: highRiskHazards.has(risk) || state.urgency === 'urgent' ? 'immediate' : 'recommended',
    })
  })

  state.areasOfConcern.forEach((room) => {
    const improvement = improvementsByRoom[room]
    if (!improvement || deduped.has(improvement.id)) return
    deduped.set(improvement.id, { ...improvement, priority: 'recommended' })
  })

  if (deduped.size === 0) {
    deduped.set('professional-review', {
      id: 'professional-review',
      label: 'Complete a guided room-by-room safety review',
      priority: 'recommended',
    })
  }

  if (state.challenges.includes('night-movement') && !deduped.has('motion-lighting')) {
    deduped.set('motion-lighting', {
      id: 'motion-lighting',
      label: 'Add motion lighting on the night route',
      priority: 'recommended',
    })
  }

  return [...deduped.values()].slice(0, 7)
}
