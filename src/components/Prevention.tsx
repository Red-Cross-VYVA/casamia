import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react'
import { type CSSProperties, type FocusEvent, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import {
  getPreventionRotatorCopy,
  preventionFactSources,
  type PreventionFact,
} from '../content/preventionFacts'
import '../styles/prevention-rotator.css'

const ROTATION_INTERVAL_MS = 7000

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updatePreference = () => setPrefersReducedMotion(mediaQuery.matches)

    updatePreference()
    mediaQuery.addEventListener('change', updatePreference)

    return () => mediaQuery.removeEventListener('change', updatePreference)
  }, [])

  return prefersReducedMotion
}

export function Prevention() {
  const { i18n, t } = useTranslation()
  const copy = useMemo(() => getPreventionRotatorCopy(i18n.resolvedLanguage ?? i18n.language), [i18n.language, i18n.resolvedLanguage])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isUserPaused, setIsUserPaused] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isDocumentVisible, setIsDocumentVisible] = useState(true)
  const [hasMotionOverride, setHasMotionOverride] = useState(false)
  const [announcement, setAnnouncement] = useState('')
  const prefersReducedMotion = usePrefersReducedMotion()
  const activeFact = copy.facts[activeIndex] ?? copy.facts[0]
  const isReducedMotionPaused = prefersReducedMotion && !hasMotionOverride
  const isEffectivelyPaused = isUserPaused || isReducedMotionPaused
  const shouldAutoRotate =
    !isEffectivelyPaused && (!isInteracting || hasMotionOverride) && isDocumentVisible

  useEffect(() => {
    setActiveIndex(0)
    setAnnouncement('')
    setHasMotionOverride(false)
  }, [i18n.resolvedLanguage])

  useEffect(() => {
    const updateVisibility = () => setIsDocumentVisible(document.visibilityState === 'visible')
    updateVisibility()
    document.addEventListener('visibilitychange', updateVisibility)

    return () => document.removeEventListener('visibilitychange', updateVisibility)
  }, [])

  useEffect(() => {
    if (!shouldAutoRotate || copy.facts.length < 2) return undefined

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => (currentIndex + 1) % copy.facts.length)
    }, ROTATION_INTERVAL_MS)

    return () => window.clearInterval(interval)
  }, [copy.facts.length, shouldAutoRotate])

  function announceFact(fact: PreventionFact) {
    setAnnouncement(`${fact.value}. ${fact.label}`)
  }

  function showFact(nextIndex: number) {
    const normalizedIndex = (nextIndex + copy.facts.length) % copy.facts.length
    setActiveIndex(normalizedIndex)
    announceFact(copy.facts[normalizedIndex])
  }

  function handleBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
      setIsInteracting(false)
    }
  }

  function toggleRotation() {
    if (isEffectivelyPaused) {
      setIsUserPaused(false)
      setHasMotionOverride(true)
      return
    }

    setIsUserPaused(true)
    setHasMotionOverride(false)
  }

  const rotatorStyle = {
    '--prevention-rotation-duration': `${ROTATION_INTERVAL_MS}ms`,
  } as CSSProperties

  return (
    <section className="prevention-section section-pad bg-light-blue" id="how-it-works">
      <div className="prevention-grid site-shell items-center gap-16">
        <div
          className="prevention-rotator"
          role="region"
          aria-roledescription="carousel"
          aria-label={copy.controls.carouselLabel}
          style={rotatorStyle}
          onPointerEnter={() => setIsInteracting(true)}
          onPointerLeave={() => setIsInteracting(false)}
          onFocusCapture={() => setIsInteracting(true)}
          onBlurCapture={handleBlur}
        >
          <span className="eyebrow">{t('prevention.badge')}</span>
          <div className="prevention-fact-stage">
            <div className="prevention-fact" key={`${i18n.resolvedLanguage}-${activeIndex}`}>
              <p
                className={`prevention-fact-value ${activeFact.value.length > 13 ? 'is-compact' : ''}`}
              >
                {activeFact.value}
              </p>
              <h2 className="prevention-fact-label">{activeFact.label}</h2>
              <div className="prevention-fact-accent" aria-hidden="true" />
              <a
                className="prevention-fact-source"
                href={preventionFactSources[activeFact.source]}
                target="_blank"
                rel="noopener noreferrer"
              >
                {copy.controls.source}: {activeFact.sourceName}
                <span aria-hidden="true">↗</span>
              </a>
            </div>
          </div>

          <div className="prevention-rotator-controls">
            <button
              className="prevention-rotator-step"
              type="button"
              aria-label={copy.controls.previous}
              onClick={() => showFact(activeIndex - 1)}
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              className="prevention-rotator-toggle"
              type="button"
              aria-label={isEffectivelyPaused ? copy.controls.play : copy.controls.pause}
              onClick={toggleRotation}
            >
              {isEffectivelyPaused ? (
                <Play size={17} aria-hidden="true" fill="currentColor" />
              ) : (
                <Pause size={17} aria-hidden="true" fill="currentColor" />
              )}
            </button>
            <span className="prevention-rotator-position" aria-hidden="true">
              {String(activeIndex + 1).padStart(2, '0')} / {String(copy.facts.length).padStart(2, '0')}
            </span>
            <div className="prevention-rotator-dots" role="group" aria-label={copy.controls.carouselLabel}>
              {copy.facts.map((fact, index) => (
                <button
                  className={`prevention-rotator-dot ${index === activeIndex ? 'is-active' : ''} ${
                    index === activeIndex && shouldAutoRotate ? 'is-running' : ''
                  }`}
                  type="button"
                  key={`${fact.value}-${index}`}
                  aria-label={`${copy.controls.showFact} ${index + 1}: ${fact.value}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  onClick={() => showFact(index)}
                >
                  <span aria-hidden="true" />
                </button>
              ))}
            </div>
            <button
              className="prevention-rotator-step"
              type="button"
              aria-label={copy.controls.next}
              onClick={() => showFact(activeIndex + 1)}
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>
          <span className="sr-only" aria-live="polite" aria-atomic="true">
            {announcement}
          </span>
          <span className="sr-only">
            {copy.controls.fact} {activeIndex + 1} {copy.controls.of} {copy.facts.length}
          </span>
        </div>
        <div>
          <p className="max-w-2xl text-xl leading-relaxed text-text-mid">
            {copy.body}
          </p>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {copy.supportingStats.map((stat) => (
              <article className="prevention-stat-card soft-card" key={stat.value}>
                <p className="font-display text-4xl font-black text-navy">{stat.value}</p>
                <p className="mt-3 whitespace-pre-line text-base font-semibold leading-snug text-text-mid">
                  {stat.label}
                </p>
              </article>
            ))}
          </div>
          <div className="prevention-source-note">
            <p>
              <strong>{t('prevention.sourceLabel')}</strong>{' '}
              <a
                href="https://www.sanidad.gob.es/gabinete/notasPrensa.do?id=6883"
                target="_blank"
                rel="noopener noreferrer"
              >
                Ministerio de Sanidad
              </a>
              ,{' '}
              <a
                href="https://www.ine.es/dyngs/Prensa/es/m2ECV2024.htm"
                target="_blank"
                rel="noopener noreferrer"
              >
                INE
              </a>
              ,{' '}
              <a
                href="https://www.who.int/europe/news-room/questions-and-answers/item/long-term-care"
                target="_blank"
                rel="noopener noreferrer"
              >
                WHO Europe
              </a>
              ,{' '}
              <a
                href="https://www.census.gov/library/stories/2020/06/old-housing-new-needs.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                U.S. Census Bureau
              </a>
              .
            </p>
            <Link to="/blog/fall-prevention-home-checklist-spain">
              {t('prevention.deepDive')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
