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
  inspectorsAria: string
  insured: string
  insuredAria: string
  installers: string
  installersAria: string
  satisfaction: string
  satisfactionAria: string
  deposit: string
  depositAria: string
}

const trustBarCopy: Record<'en' | 'es', TrustBarCopy> = {
  en: {
    inspectors: 'Experts',
    inspectorsAria: 'Qualified safety inspectors',
    insured: 'Insured',
    insuredAria: 'Insured service',
    installers: 'Verified',
    installersAria: 'Verified installers',
    satisfaction: 'Guaranteed',
    satisfactionAria: 'Satisfaction guaranteed',
    deposit: 'Pay 50/50',
    depositAria: '50 percent deposit and 50 percent after customer acceptance',
  },
  es: {
    inspectors: 'Expertos',
    inspectorsAria: 'Inspectores de seguridad cualificados',
    insured: 'Asegurado',
    insuredAria: 'Servicio asegurado',
    installers: 'Verificados',
    installersAria: 'Instaladores verificados',
    satisfaction: 'Garantía',
    satisfactionAria: 'Satisfacción garantizada',
    deposit: 'Pago 50/50',
    depositAria: '50 por ciento de reserva y 50 por ciento tras aceptación del cliente',
  },
}

function getTrustBarCopy(language: string) {
  return language.startsWith('es') ? trustBarCopy.es : trustBarCopy.en
}

export function TrustBar() {
  const { i18n } = useTranslation()
  const copy = getTrustBarCopy(i18n.language)
  const items = [
    { icon: ClipboardCheck, label: copy.inspectors, ariaLabel: copy.inspectorsAria },
    { icon: ShieldCheck, label: copy.insured, ariaLabel: copy.insuredAria },
    { icon: BadgeCheck, label: copy.installers, ariaLabel: copy.installersAria },
    { icon: Handshake, label: copy.satisfaction, ariaLabel: copy.satisfactionAria },
    { icon: WalletCards, label: copy.deposit, ariaLabel: copy.depositAria },
  ]

  return (
    <section className="trust-bar-section" aria-label="CasaMia trust signals">
      <div className="trust-bar site-shell">
        {items.map(({ icon: Icon, label, ariaLabel }) => (
          <div className="trust-bar-item" key={label} aria-label={ariaLabel} title={ariaLabel}>
            <Icon size={20} aria-hidden="true" />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
