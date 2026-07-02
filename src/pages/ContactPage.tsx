import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { TrustBar } from '../components/TrustBar'

export function ContactPage() {
  const { t } = useTranslation()
  const [submitted, setSubmitted] = useState(false)
  const planOptions = t('pages.contact.planOptions', { returnObjects: true }) as string[]

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
            onSubmit={(event) => {
              event.preventDefault()
              setSubmitted(true)
            }}
          >
            <div className="grid gap-5 md:grid-cols-2">
              <Field label={t('pages.contact.fields.name')} name="name" required />
              <Field label={t('pages.contact.fields.email')} name="email" type="email" required />
              <Field label={t('pages.contact.fields.phone')} name="phone" type="tel" />
              <label className="grid gap-2 font-bold text-text-dark">
                {t('pages.contact.fields.plan')}
                <select className="min-h-12 rounded-lg border border-border bg-white px-4 text-text-mid">
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
            <button className="btn btn-green w-fit" type="submit">
              {t('pages.contact.submit')}
            </button>
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
