import { useTranslation } from 'react-i18next'

import { IMAGE_URLS } from '../constants/shopify'
import { SafeImage } from './SafeImage'

type GalleryItem = {
  title: string
  desc: string
}

export function SolutionGallery() {
  const { t } = useTranslation()
  const items = t('gallery.items', { returnObjects: true }) as GalleryItem[]
  const alts = t('alts.gallery', { returnObjects: true }) as string[]

  return (
    <section className="solution-section section-pad bg-pale-blue">
      <div className="site-shell">
        <div className="mx-auto max-w-3xl text-center">
          <span className="eyebrow">{t('gallery.badge')}</span>
          <h2 className="display-title mt-5">{t('gallery.title')}</h2>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-3">
          {items.map((item, index) => (
            <article className="solution-card overflow-hidden rounded-lg border border-border bg-white shadow-soft" key={item.title}>
              <SafeImage
                src={IMAGE_URLS.gallery[index]}
                alt={alts[index]}
                className="gallery-media overflow-hidden"
                imgClassName="h-full w-full object-cover"
              />
              <div className="p-6">
                <h3 className="font-display text-2xl font-bold text-text-dark">{item.title}</h3>
                <p className="mt-2 text-text-mid">{item.desc}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
