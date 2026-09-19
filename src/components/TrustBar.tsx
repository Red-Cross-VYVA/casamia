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
    inspectors: 'Safety-led review',
    inspectorsAria: 'Review focused on home safety and daily routines',
    insured: 'Insured work',
    insuredAria: 'Insured fitting where work is carried out',
    installers: 'Fitting checked',
    installersAria: 'Fitting details and completion checks are reviewed',
    satisfaction: 'Follow-up if needed',
    satisfactionAria: 'Follow-up support is available after fitting if needed',
    deposit: 'Pay in two steps',
    depositAria: '50 percent deposit and 50 percent after your final review',
  },
  es: {
    sectionLabel: 'Señales de confianza CasaMia',
    inspectors: 'Revisión de seguridad',
    inspectorsAria: 'Revisión centrada en seguridad del hogar y rutinas diarias',
    insured: 'Trabajo asegurado',
    insuredAria: 'Trabajo asegurado cuando se realiza instalación',
    installers: 'Encaje comprobado',
    installersAria: 'Se revisan los detalles de encaje y la comprobación final',
    satisfaction: 'Seguimiento si hace falta',
    satisfactionAria: 'Seguimiento disponible tras la instalación si hace falta',
    deposit: 'Pago en dos pasos',
    depositAria: '50 por ciento de reserva y 50 por ciento tras tu revisión final',
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
