import type { SafetyWizardState, WizardStepId } from '../types/wizard.ts'

export function buildWizardSteps(state: SafetyWizardState): WizardStepId[] {
  const steps: WizardStepId[] = ['entry', 'methods']
  const selectedMethod = state.inputMethods[0]

  if (!selectedMethod) {
    return steps
  }

  if (state.inputMethods.includes('callback')) {
    steps.push('callback', 'callback-confirmation')
    return steps
  }

  if (state.inputMethods.includes('photos')) steps.push('photos')
  if (state.inputMethods.includes('audio')) steps.push('audio')
  if (state.inputMethods.includes('voice')) steps.push('voice')
  if (state.inputMethods.includes('call') || state.inputMethods.includes('whatsapp')) steps.push('phone')
  if (state.inputMethods.includes('visit')) steps.push('visit')

  steps.push('user-type')

  if (state.userType === 'client') {
    steps.push('client-type', 'client-sites', 'client-need', 'client-location')
  } else if (state.userType) {
    steps.push('home-type', 'floors')
    if (state.floorCount !== 'one') steps.push('stairs')
    steps.push('bedrooms', 'areas', 'mobility', 'challenges', 'risks', 'urgency', 'notes')
    if (!state.inputMethods.includes('photos')) steps.push('photos')
  }

  if (state.userType) steps.push('contact', 'result')

  return steps
}
