import { useTranslation } from 'react-i18next'

import { BeforeAfterPreview } from '../components/BeforeAfterPreview'
import { EuroSafe } from '../components/EuroSafe'
import { FinalCTA } from '../components/FinalCTA'
import { Grants } from '../components/Grants'
import { Hero } from '../components/Hero'
import { ManufacturerMarquee } from '../components/ManufacturerMarquee'
import { Prevention } from '../components/Prevention'
import { SolutionGallery } from '../components/SolutionGallery'
import { TrustBar } from '../components/TrustBar'
import { WhatWeOffer } from '../components/WhatWeOffer'
import { SEO } from '../components/SEO'

const homeSeoCopy = {
  en: {
    title: 'CasaMia | Home Safety Adaptations in Spain',
    description:
      'CasaMia helps make daily movement safer at home with room-by-room assessment, agreed adaptations, coordinated installers and clear follow-up.',
  },
  es: {
    title: 'CasaMia | Adaptación y seguridad del hogar en España',
    description:
      'CasaMia ayuda a hacer más seguro el movimiento diario en casa con evaluación por estancias, adaptaciones acordadas, instaladores coordinados y seguimiento claro.',
  },
} as const

export function Home2Page() {
  const { i18n } = useTranslation()
  const seo = i18n.language.toLowerCase().startsWith('es') ? homeSeoCopy.es : homeSeoCopy.en

  return (
    <>
      <SEO title={seo.title} description={seo.description} path="/" />
      <Hero />
      <TrustBar />
      <Prevention />
      <SolutionGallery />
      <BeforeAfterPreview />
      <WhatWeOffer />
      <ManufacturerMarquee />
      <Grants />
      <EuroSafe />
      <FinalCTA />
    </>
  )
}
