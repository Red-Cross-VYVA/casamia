import { getSubmittedConfigurationStorageKey } from '../context/ConfiguratorContext'
import type { WizardSubmission } from '../types/configurator'

export type AirtableConfiguratorAdapter = {
  saveSubmission: (submission: WizardSubmission) => Promise<{ externalId: string }>
}

export type EmailConfiguratorAdapter = {
  sendConfirmation: (submission: WizardSubmission) => Promise<{ queued: boolean }>
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
