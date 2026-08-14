import {
  BadgeCheck,
  ClipboardCheck,
  Handshake,
  ShieldCheck,
  WalletCards,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'

type TrustBarCopy = {
  sectionLabel: string
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
    sectionLabel: 'CasaMia trust signals',
    inspectors: 'Safety specialists',
    inspectorsAria: 'Qualified safety inspectors',
    insured: 'Insured work',
    insuredAria: 'Insured service',
    installers: 'Checked providers',
    installersAria: 'Verified installers',
    satisfaction: 'Aftercare promise',
    satisfactionAria: 'Satisfaction guaranteed',
    deposit: 'Pay in two steps',
    depositAria: '50 percent deposit and 50 percent after customer acceptance',
  },
  es: {
    sectionLabel: 'Garantias CasaMia',
    inspectors: 'Especialistas en seguridad',
    inspectorsAria: 'Inspectores de seguridad cualificados',
    insured: 'Trabajo asegurado',
    insuredAria: 'Servicio asegurado',
    installers: 'Proveedores revisados',
    installersAria: 'Instaladores verificados',
    satisfaction: 'Compromiso posventa',
    satisfactionAria: 'Satisfaccion garantizada',
    deposit: 'Pago en dos pasos',
    depositAria: '50 por ciento de reserva y 50 por ciento tras aceptacion del cliente',
  },
}

function getTrustBarCopy(language: string) {
  return language.startsWith('es') ? trustBarCopy.es : trustBarCopy.en
}

export function TrustBar() {
  const { i18n } = useTranslation()
  const copy = getTrustBarCopy(i18n.language)
  const items = [
    { icon: ClipboardCheck, label: copy.inspectors, ariaLabel: copy.inspectorsAria, theme: 'blue' },
    { icon: ShieldCheck, label: copy.insured, ariaLabel: copy.insuredAria, theme: 'green' },
    { icon: BadgeCheck, label: copy.installers, ariaLabel: copy.installersAria, theme: 'cyan' },
    { icon: Handshake, label: copy.satisfaction, ariaLabel: copy.satisfactionAria, theme: 'navy' },
    { icon: WalletCards, label: copy.deposit, ariaLabel: copy.depositAria, theme: 'gold' },
  ]

  return (
    <section className="trust-bar-section" aria-label={copy.sectionLabel}>
      <div className="trust-bar site-shell">
        {items.map(({ icon: Icon, label, ariaLabel, theme }) => (
          <div className={`trust-bar-item is-${theme}`} key={label} aria-label={ariaLabel} title={ariaLabel}>
            <span className="trust-bar-icon" aria-hidden="true">
              <Icon size={20} />
            </span>
            <span className="trust-bar-title">{label}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
