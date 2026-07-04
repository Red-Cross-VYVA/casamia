import { hasPublicSiteApi, postPublicSiteJson } from './publicSiteApi'

export type ContactRequestInput = {
  name: string
  email: string
  phone: string
  plan: string
  message: string
  source: string
}

type ContactRequestResponse = {
  id?: number | string
  status?: string
}

const CONTACT_STORAGE_KEY = 'casamia-contact-requests'

export async function submitContactRequest(input: ContactRequestInput) {
  const submittedAt = new Date().toISOString()
  const payload = {
    submittedAt,
    status: 'New',
    type: 'contact_request',
    customer_name: input.name,
    customer_email: input.email,
    customer_phone: input.phone,
    selected_plan: input.plan,
    ...input,
  }

  if (hasPublicSiteApi()) {
    const response = await postPublicSiteJson<ContactRequestResponse>(
      '/api/public/contact-requests',
      payload,
    )

    return {
      id: response.id ? String(response.id) : undefined,
      source: 'api' as const,
      status: response.status ?? 'New',
    }
  }

  queueLocalContactRequest(payload)

  return {
    source: 'local-demo' as const,
    status: 'New',
  }
}

function queueLocalContactRequest(payload: Record<string, unknown>) {
  const current = JSON.parse(window.localStorage.getItem(CONTACT_STORAGE_KEY) ?? '[]') as Array<
    unknown
  >

  window.localStorage.setItem(
    CONTACT_STORAGE_KEY,
    JSON.stringify([payload, ...current].slice(0, 50)),
  )
}
