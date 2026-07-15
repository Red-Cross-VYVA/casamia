import { getSubmittedConfigurationStorageKey } from '../context/ConfiguratorContext'
import type { WizardSubmission } from '../types/configurator'

export type AirtableConfiguratorAdapter = {
  saveSubmission: (submission: WizardSubmission) => Promise<{ externalId: string }>
}

export type EmailConfiguratorAdapter = {
  sendConfirmation: (submission: WizardSubmission) => Promise<{ queued: boolean }>
}

export type StripeConfiguratorAdapter = {
  createDepositCheckout: (submission: WizardSubmission) => Promise<{ checkoutUrl: string; mock: boolean }>
}

export const mockAirtableConfiguratorAdapter: AirtableConfiguratorAdapter = {
  async saveSubmission(submission) {
    window.localStorage.setItem(getSubmittedConfigurationStorageKey(), JSON.stringify(submission))

    return { externalId: submission.configurationId }
  },
}

export const mockEmailConfiguratorAdapter: EmailConfiguratorAdapter = {
  async sendConfirmation() {
    return { queued: true }
  },
}

export const mockStripeConfiguratorAdapter: StripeConfiguratorAdapter = {
  async createDepositCheckout(submission) {
    return {
      checkoutUrl: `/configure/confirmation?configuration=${submission.configurationId}&mockCheckout=1`,
      mock: true,
    }
  },
}
