import { AtSign, LoaderCircle, LocateFixed, MapPin, Phone, UserRound } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import type { WizardCopy } from '../../config/wizardCopy'
import type { WizardContact } from '../../types/wizard'
import { WizardStep } from './WizardStep'

type ContactDetailsStepProps = {
  copy: WizardCopy
  contact: WizardContact
  onChange: (contact: WizardContact) => void
  onContinue: () => void
}

type Errors = Partial<Record<'name' | 'contact' | 'email' | 'city' | 'consent', string>>
type LocationStatus = 'idle' | 'detecting' | 'detected' | 'error'

type ReverseGeocodeAddress = {
  city?: string
  town?: string
  village?: string
  municipality?: string
  county?: string
  state?: string
}

type ReverseGeocodeResult = {
  address?: ReverseGeocodeAddress
  display_name?: string
}

export function ContactDetailsStep({ copy, contact, onChange, onContinue }: ContactDetailsStepProps) {
  const [errors, setErrors] = useState<Errors>({})
  const [locationStatus, setLocationStatus] = useState<LocationStatus>('idle')

  const update = <K extends keyof WizardContact>(key: K, value: WizardContact[K]) => {
    onChange({ ...contact, [key]: value })
    setErrors((current) => ({
      ...current,
      [key === 'fullName' ? 'name' : key === 'phone' ? 'contact' : key]: undefined,
      ...(key === 'email' ? { contact: undefined } : {}),
    }))
  }

  const validate = () => {
    const next: Errors = {}
    if (!contact.fullName.trim()) next.name = copy.contact.required
    const emailValid = !contact.email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email)
    if (!contact.phone.trim() && !contact.email.trim()) next.contact = copy.contact.phoneOrEmail
    else if (!emailValid) next.email = copy.contact.invalidEmail
    if (!contact.city.trim()) next.city = copy.contact.required
    if (!contact.consent) next.consent = copy.contact.required
    setErrors(next)
    if (!Object.keys(next).length) onContinue()
  }

  const detectLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus('error')
      return
    }

    setLocationStatus('detecting')
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            format: 'jsonv2',
            addressdetails: '1',
            zoom: '10',
            lat: String(coords.latitude),
            lon: String(coords.longitude),
            'accept-language': document.documentElement.lang || navigator.language || 'es',
          })
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?${params.toString()}`)
          if (!response.ok) throw new Error('Reverse geocoding failed')

          const result = await response.json() as ReverseGeocodeResult
          const address = result.address ?? {}
          const locality = address.city ?? address.town ?? address.village ?? address.municipality ?? address.county
          const location = [locality, address.state]
            .filter((part, index, parts): part is string => Boolean(part) && parts.indexOf(part) === index)
            .join(', ')
            || result.display_name?.split(',').slice(0, 2).join(', ').trim()

          if (!location) throw new Error('No locality returned')
          update('city', location)
          setLocationStatus('detected')
        } catch {
          setLocationStatus('error')
        }
      },
      () => setLocationStatus('error'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    )
  }

  return (
    <WizardStep title={copy.contact.title} body={copy.contact.body} icon={<UserRound size={28} />} compact>
      <div className="safety-wizard-contact-grid">
        <Field icon={<UserRound size={19} />} label={copy.contact.name} error={errors.name}>
          <input autoComplete="name" value={contact.fullName} onChange={(event) => update('fullName', event.target.value)} />
        </Field>
        <div className={`safety-wizard-field${errors.city ? ' has-error' : ''}`}>
          <label htmlFor="safety-wizard-city"><span><MapPin size={19} />{copy.contact.city}</span></label>
          <div className="safety-wizard-location-input">
            <input
              id="safety-wizard-city"
              autoComplete="address-level2"
              value={contact.city}
              onChange={(event) => {
                setLocationStatus('idle')
                update('city', event.target.value)
              }}
            />
            <button
              className="safety-wizard-detect-location"
              type="button"
              disabled={locationStatus === 'detecting'}
              onClick={detectLocation}
            >
              {locationStatus === 'detecting'
                ? <LoaderCircle className="is-spinning" size={18} aria-hidden="true" />
                : <LocateFixed size={18} aria-hidden="true" />}
              <span>{locationStatus === 'detecting' ? copy.contact.detecting : copy.contact.detect}</span>
            </button>
          </div>
          {errors.city ? <small role="alert">{errors.city}</small> : null}
          {locationStatus === 'detected' ? (
            <small className="safety-wizard-location-status" aria-live="polite">
              {copy.contact.detected} · <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">OpenStreetMap</a>
            </small>
          ) : null}
          {locationStatus === 'error' ? <small className="safety-wizard-location-status is-error" role="alert">{copy.contact.detectError}</small> : null}
        </div>
        <Field icon={<Phone size={19} />} label={copy.contact.phone} error={errors.contact}>
          <div className="safety-wizard-phone-input"><span>+34</span><input inputMode="tel" autoComplete="tel-national" placeholder="600 000 000" value={contact.phone} onChange={(event) => update('phone', event.target.value.replace(/[^0-9 ]/g, ''))} /></div>
        </Field>
        <Field icon={<AtSign size={19} />} label={copy.contact.email} error={errors.email ?? errors.contact}>
          <input type="email" autoComplete="email" value={contact.email} onChange={(event) => update('email', event.target.value)} />
        </Field>
        <label className="safety-wizard-field is-wide">
          <span>{copy.contact.method}</span>
          <select value={contact.preferredMethod} onChange={(event) => update('preferredMethod', event.target.value as WizardContact['preferredMethod'])}>
            <option value="phone">{copy.contact.phone}</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">{copy.contact.email}</option>
          </select>
        </label>
      </div>
      <label className={`safety-wizard-consent${errors.consent ? ' has-error' : ''}`}>
        <input type="checkbox" checked={contact.consent} onChange={(event) => update('consent', event.target.checked)} />
        <span>{copy.contact.consent}</span>
      </label>
      <p className="safety-wizard-privacy">{copy.contact.privacy}</p>
      <div className="safety-wizard-primary-action">
        <button className="btn btn-navy" type="button" onClick={validate}>{copy.nav.continue}</button>
      </div>
    </WizardStep>
  )
}

function Field({ icon, label, error, children }: { icon: ReactNode; label: string; error?: string; children: ReactNode }) {
  return (
    <label className={`safety-wizard-field${error ? ' has-error' : ''}`}>
      <span>{icon}{label}</span>
      {children}
      {error ? <small role="alert">{error}</small> : null}
    </label>
  )
}
