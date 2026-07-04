import { AlertCircle, LoaderCircle } from 'lucide-react'
import { type FormEvent, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TrustBar } from '../components/TrustBar'
import { submitContactRequest } from '../services/contactRequests'

export function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const planOptions = t('pages.contact.planOptions', { returnObjects: true }) as string[]

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (isSubmitting) {
      return
    }

    const formData = new FormData(event.currentTarget)

    setIsSubmitting(true)
    setSubmitError('')
    setSubmitted(false)

    try {
      await submitContactRequest({
        name: String(formData.get('name') ?? '').trim(),
        email: String(formData.get('email') ?? '').trim(),
        phone: String(formData.get('phone') ?? '').trim(),
        plan: String(formData.get('plan') ?? '').trim(),
        message: String(formData.get('message') ?? '').trim(),
        source: 'contact-page',
      })
      event.currentTarget.reset()
      setSubmitted(true)
    } catch (error) {
      console.error('CasaMia contact request failed', error)
      setSubmitError(t('pages.contact.error'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <section className="page-hero">
        <div className="page-hero-inner">
          <h1 className="display-title">{t('pages.contact.title')}</h1>
          <p className="mt-5 max-w-3xl text-xl text-text-mid">
            {t('pages.contact.intro')}
          </p>
        </div>
      </section>

      <TrustBar />

      <section className="section-pad bg-white">
        <div className="site-shell max-w-4xl">
          <form
            className="grid gap-5 rounded-lg border border-border bg-light-blue p-6 shadow-soft md:p-8"
            onSubmit={handleSubmit}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t('pages.contact.fields.name')} name="name" required />
              <Field label={t('pages.contact.fields.email')} name="email" type="email" required />
              <Field label={t('pages.contact.fields.phone')} name="phone" type="tel" />
              <label className="grid gap-2 font-bold text-text-dark">
                {t('pages.contact.fields.plan')}
                <select
                  className="min-h-12 rounded-lg border border-border bg-white px-4 text-text-mid"
                  name="plan"
                >
                  {planOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2 font-bold text-text-dark">
              {t('pages.contact.fields.message')}
              <textarea
                className="min-h-40 rounded-lg border border-border bg-white px-4 py-3 text-text-mid"
                name="message"
                required
              />
            </label>
            <button className="btn btn-green w-fit" disabled={isSubmitting} type="submit">
              {isSubmitting ? t('pages.contact.submitting') : t('pages.contact.submit')}
              {isSubmitting ? <LoaderCircle className="animate-spin" size={20} aria-hidden="true" /> : null}
            </button>
            {submitError ? (
              <p className="flex items-start gap-3 rounded-lg bg-white p-4 font-bold text-red-700">
                <AlertCircle className="mt-0.5 shrink-0" size={20} aria-hidden="true" />
                {submitError}
              </p>
            ) : null}
            {submitted ? (
              <p className="rounded-lg bg-white p-4 font-bold text-navy">
                {t('pages.contact.success')}
              </p>
            ) : null}
          </form>
        </div>
      </section>
    </>
  )
}

function Field({
  label,
  name,
  required,
  type = 'text',
}: {
  label: string
  name: string
  required?: boolean
  type?: string
}) {
  return (
    <label className="grid gap-2 font-bold text-text-dark">
      {label}
      <input
        className="min-h-12 rounded-lg border border-border bg-white px-4 text-text-mid"
        name={name}
        required={required}
        type={type}
      />
    </label>
  )
}
