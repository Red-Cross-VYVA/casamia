import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { trackEvent } from '../utils/analytics'

const languages = [
  { code: 'en', shortLabel: 'EN', label: 'English' },
  { code: 'es', shortLabel: 'ES', label: 'Espa\u00f1ol' },
  { code: 'de', shortLabel: 'DE', label: 'Deutsch' },
  { code: 'fr', shortLabel: 'FR', label: 'Fran\u00e7ais' },
  { code: 'nl', shortLabel: 'NL', label: 'Nederlands' },
] as const

type LanguageSwitcherProps = {
  compact?: boolean
  inverted?: boolean
}

export function LanguageSwitcher({
  compact = false,
  inverted = false,
}: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)
  const currentLanguage =
    languages.find((language) => language.code === i18n.language) ?? languages[0]

  useEffect(() => {
    function closeOnOutsideClick(event: MouseEvent) {
      if (!wrapperRef.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', closeOnOutsideClick)
    }

    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [open])

  return (
    <div
      className="relative inline-flex"
      aria-label={t('languageSwitcher.aria')}
      ref={wrapperRef}
    >
      <button
        type="button"
        className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-full border px-4 text-sm font-extrabold transition ${
          inverted
            ? 'border-white/20 bg-white/10 text-white hover:bg-white/20'
            : 'border-border bg-white text-navy shadow-sm hover:bg-light-blue'
        } ${compact ? 'px-3' : ''}`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={t('languageSwitcher.aria')}
        onClick={() => setOpen((isOpen) => !isOpen)}
      >
        <span>{compact ? currentLanguage.shortLabel : currentLanguage.label}</span>
        <ChevronDown size={15} aria-hidden="true" />
      </button>

      {open ? (
        <div
          className={`absolute right-0 top-full z-50 mt-2 min-w-40 overflow-hidden rounded-lg border shadow-soft ${
            inverted ? 'border-white/20 bg-ink text-white' : 'border-border bg-white text-text-dark'
          }`}
          role="listbox"
        >
          {languages.map((language) => {
            const isActive = i18n.language === language.code

            return (
              <button
                key={language.code}
                type="button"
                className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-bold transition ${
                  isActive
                    ? 'bg-green text-white'
                    : inverted
                      ? 'hover:bg-white/10'
                      : 'hover:bg-light-blue'
                }`}
                aria-label={t('languageSwitcher.changeTo', { language: language.label })}
                aria-selected={isActive}
                role="option"
                onClick={() => {
                  trackEvent('language_change', {
                    from: i18n.language,
                    to: language.code,
                  })
                  void i18n.changeLanguage(language.code)
                  setOpen(false)
                }}
              >
                <span>{language.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}
