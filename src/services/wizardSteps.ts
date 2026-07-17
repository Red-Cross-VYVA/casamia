import type { SafetyWizardState, WizardStepId } from '../types/wizard.ts'

export function buildWizardSteps(state: SafetyWizardState): WizardStepId[] {
  const steps: WizardStepId[] = ['entry', 'user-type']

  if (state.userType) steps.push('methods')

  if (state.userType && state.inputMethods.includes('callback')) {
    steps.push('callback', 'callback-confirmation')
    return steps
  }

  if (state.userType === 'client') {
    steps.push('client-type', 'client-sites', 'client-need', 'client-location')
  } else if (state.userType && state.inputMethods.includes('questions')) {
    steps.push('home-type', 'floors')
    if (state.floorCount !== 'one') steps.push('stairs')
    steps.push('areas', 'mobility', 'challenges', 'risks', 'urgency', 'notes', 'photos')
  }

  if (state.inputMethods.includes('photos') && !steps.includes('photos')) steps.push('photos')
  if (state.inputMethods.includes('voice')) steps.push('voice')
  if (state.inputMethods.includes('call')) steps.push('phone')
  if (state.inputMethods.includes('visit')) steps.push('visit')
  if (state.userType) steps.push('contact', 'result')

  return steps
}
