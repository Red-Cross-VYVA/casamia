import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

import { IMAGE_URLS } from '../constants/shopify'
import { SafeImage } from './SafeImage'

type GalleryItem = {
  title: string
  desc: string
  features?: string[]
  link?: string
}

export function SolutionGallery() {
  const { t } = useTranslation()
  const items = t('gallery.items', { returnObjects: true }) as GalleryItem[]
  const alts = t('alts.gallery', { returnObjects: true }) as string[]
  const [activeIndex, setActiveIndex] = useState(0)
  const visibleItems = useMemo(
    () => items.map((_, offset) => items[(activeIndex + offset) % items.length]).filter(Boolean).slice(0, 3),
    [activeIndex, items],
  )

  useEffect(() => {
    if (items.length < 4) {
      return
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length)
    }, 5200)

    return () => window.clearInterval(timer)
  }, [items.length])

  const goToPrevious = () => {
    setActiveIndex((current) => (current - 1 + items.length) % items.length)
  }

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % items.length)
  }

  return (
    <section className="solution-section section-pad bg-pale-blue">
      <div className="site-shell">
        <div className="solution-gallery-header">
          <div>
            <span className="eyebrow">{t('gallery.badge')}</span>
            <h2 className="display-title mt-5">{t('gallery.title')}</h2>
            <p>{t('gallery.intro')}</p>
          </div>

          <div className="solution-gallery-controls" aria-label={t('gallery.controlsLabel')}>
            <button type="button" onClick={goToPrevious} aria-label={t('gallery.previous')}>
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <button type="button" onClick={goToNext} aria-label={t('gallery.next')}>
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="solution-carousel" aria-live="polite">
          {visibleItems.map((item) => {
            const index = items.findIndex((galleryItem) => galleryItem.title === item.title)
            const isLinked = Boolean(item.link)
            const cardContent = (
              <>
                <SafeImage
                  src={IMAGE_URLS.gallery[index]}
                  alt={alts[index]}
                  className="gallery-media overflow-hidden"
                  imgClassName="h-full w-full object-cover"
                />
                <div className="p-6">
                  <h3 className="font-display text-2xl font-bold text-text-dark">{item.title}</h3>
                  <p className="mt-2 text-text-mid">{item.desc}</p>
                  {item.features?.length ? (
                    <ul className="solution-feature-list" aria-label={t('gallery.featuresLabel')}>
                      {item.features.map((feature) => (
                        <li key={feature}>{feature}</li>
                      ))}
                    </ul>
                  ) : null}
                  {isLinked ? (
                    <span className="solution-card-cta">
                      {t('common.learnMore')}
                      <ArrowRight size={17} aria-hidden="true" />
                    </span>
                  ) : null}
                </div>
              </>
            )

            return isLinked ? (
              <Link
                className="solution-card solution-card-link overflow-hidden rounded-lg border border-border bg-white shadow-soft"
                key={item.title}
                to={item.link ?? '/tech'}
              >
                {cardContent}
              </Link>
            ) : (
              <article
                className="solution-card overflow-hidden rounded-lg border border-border bg-white shadow-soft"
                key={item.title}
              >
                {cardContent}
              </article>
            )
          })}
        </div>

        <div className="solution-gallery-dots" aria-label={t('gallery.dotsLabel')}>
          {items.map((item, index) => (
            <button
              className={index === activeIndex ? 'is-active' : ''}
              key={item.title}
              type="button"
              onClick={() => setActiveIndex(index)}
              aria-label={t('gallery.showItem', { title: item.title })}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
