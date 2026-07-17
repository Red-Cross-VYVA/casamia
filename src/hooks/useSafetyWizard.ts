import { useCallback, useEffect, useMemo, useState } from 'react'

import { generateWizardResult } from '../services/wizardRecommendationEngine'
import {
  clearWizardState,
  createWizardReference,
  loadWizardState,
  saveWizardState,
} from '../services/wizardStorage'
import { buildWizardSteps } from '../services/wizardSteps'
import type { SafetyWizardState, WizardInputMethod, WizardStepId } from '../types/wizard'
import { trackEvent } from '../utils/analytics'

function createInitialState(): SafetyWizardState {
  return {
    wizardReference: createWizardReference(),
    currentStep: 'entry',
    started: false,
    inputMethods: [],
    clientLocation: '',
    areasOfConcern: [],
    challenges: [],
    currentRisks: [],
    notes: '',
    photos: [],
    inspectionBooked: false,
    inspectionFee: 89,
    inspectionCreditThreshold: 300,
    contact: {
      fullName: '',
      phone: '',
      email: '',
      city: '',
      preferredMethod: 'phone',
      consent: false,
    },
    submitted: false,
    updatedAt: new Date().toISOString(),
  }
}

export function useSafetyWizard() {
  const [state, setState] = useState<SafetyWizardState>(() => {
    const savedState = loadWizardState()
    return savedState
      ? { ...savedState, inputMethods: savedState.inputMethods.slice(0, 1) }
      : createInitialState()
  })
  const steps = useMemo(() => buildWizardSteps(state), [state])
  const progressSteps = useMemo(() => {
    const projectedUserType = state.userType ?? 'me'
    const projectedMethod: WizardInputMethod = state.inputMethods[0]
      ?? (projectedUserType === 'client' ? 'call' : 'questions')

    return buildWizardSteps({
      ...state,
      userType: projectedUserType,
      inputMethods: [projectedMethod],
    })
  }, [state])
  const currentIndex = Math.max(0, steps.indexOf(state.currentStep))

  useEffect(() => {
    saveWizardState(state)
  }, [state])

  useEffect(() => {
    const handleAbandon = () => {
      if (state.started && !state.submitted && state.currentStep !== 'result') {
        trackEvent('wizard_abandoned', {
          reference: state.wizardReference,
          step: state.currentStep,
        })
      }
    }

    window.addEventListener('pagehide', handleAbandon)
    return () => window.removeEventListener('pagehide', handleAbandon)
  }, [state.currentStep, state.started, state.submitted, state.wizardReference])

  const patchState = useCallback((patch: Partial<SafetyWizardState>) => {
    setState((current) => ({ ...current, ...patch, updatedAt: new Date().toISOString() }))
  }, [])

  const start = useCallback(() => {
    setState((current) => ({ ...current, started: true, currentStep: 'user-type', updatedAt: new Date().toISOString() }))
    trackEvent('wizard_started')
  }, [])

  const completeStep = useCallback((patch: Partial<SafetyWizardState> = {}) => {
    setState((current) => {
      let nextState = { ...current, ...patch, updatedAt: new Date().toISOString() }
      const nextSteps = buildWizardSteps(nextState)
      const index = Math.max(0, nextSteps.indexOf(current.currentStep))
      const nextStep = nextSteps[index + 1] ?? 'result'

      if (nextStep === 'result') {
        nextState = { ...nextState, result: generateWizardResult(nextState) }
        trackEvent('wizard_plan_generated', { reference: nextState.wizardReference, userType: nextState.userType })
      }

      trackEvent('wizard_step_completed', { step: current.currentStep, reference: current.wizardReference })
      return { ...nextState, currentStep: nextStep }
    })
  }, [])

  const back = useCallback(() => {
    setState((current) => {
      const currentSteps = buildWizardSteps(current)
      const index = Math.max(0, currentSteps.indexOf(current.currentStep))
      return { ...current, currentStep: currentSteps[Math.max(0, index - 1)], updatedAt: new Date().toISOString() }
    })
  }, [])

  const goTo = useCallback((step: WizardStepId) => patchState({ currentStep: step }), [patchState])

  const reset = useCallback(() => {
    clearWizardState()
    setState(createInitialState())
  }, [])

  const refreshResult = useCallback((patch: Partial<SafetyWizardState> = {}) => {
    setState((current) => {
      const next = { ...current, ...patch, updatedAt: new Date().toISOString() }
      return { ...next, result: generateWizardResult(next) }
    })
  }, [])

  return {
    state,
    steps,
    currentIndex,
    progressTotalSteps: progressSteps.length,
    progress: progressSteps.length > 1 ? currentIndex / (progressSteps.length - 1) : 0,
    patchState,
    start,
    completeStep,
    back,
    goTo,
    reset,
    refreshResult,
    hasSavedProgress: state.started,
  }
}
