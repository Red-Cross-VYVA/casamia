import {
  BadgeCheck,
  ClipboardCheck,
  Handshake,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

type TrustBarCopy = {
  inspectors: string
  insured: string
  installers: string
  satisfaction: string
  deposit: string
}

const trustBarCopy: Record<'en' | 'es', TrustBarCopy> = {
  en: {
    inspectors: 'Qualified Safety Inspectors',
    insured: 'Fully Insured',
    installers: 'Background-Checked Installers',
    satisfaction: 'Satisfaction Guaranteed',
    deposit: '50% Deposit • 50% Upon Customer Acceptance',
  },
  es: {
    inspectors: 'Inspectores de seguridad cualificados',
    insured: 'Servicio asegurado',
    installers: 'Instaladores verificados',
    satisfaction: 'Satisfacción garantizada',
    deposit: '50% reserva • 50% tras aceptación del cliente',
  },
}

function getTrustBarCopy(language: string) {
  return language.startsWith('es') ? trustBarCopy.es : trustBarCopy.en
}

export function TrustBar() {
  const { i18n } = useTranslation()
  const copy = getTrustBarCopy(i18n.language)
  const items = [
    { icon: ClipboardCheck, label: copy.inspectors },
    { icon: ShieldCheck, label: copy.insured },
    { icon: BadgeCheck, label: copy.installers },
    { icon: Handshake, label: copy.satisfaction },
    { icon: WalletCards, label: copy.deposit },
  ]

  return (
    <section className="trust-bar-section" aria-label="CasaMia trust signals">
      <div className="trust-bar site-shell">
        {items.map(({ icon: Icon, label }) => (
          <div className="trust-bar-item" key={label}>
            <Icon size={19} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
