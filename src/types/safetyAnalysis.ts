export const safetyFindingCategories = [
  'access',
  'emergency',
  'fire',
  'lighting',
  'reach',
  'slip',
  'support',
  'transfer',
  'trip',
  'other',
] as const

export type SafetyFindingCategory = (typeof safetyFindingCategories)[number]
export type SafetyFindingSeverity = 'low' | 'medium' | 'high'

export type SafetyPhotoFinding = {
  category: SafetyFindingCategory
  title: string
  evidence: string
  severity: SafetyFindingSeverity
  confidence: number
  whyItMatters: string
  action: string
  requiresConfirmation: boolean
}

export type SafetyPhotoAnalysisResult = {
  room: string
  roomConfidence: number
  headline: string
  overview: string
  strengths: string[]
  limitations: string[]
  findings: SafetyPhotoFinding[]
}
