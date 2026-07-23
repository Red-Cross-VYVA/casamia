import { useTranslation } from 'react-i18next'

import { BeforeAfterPreview } from '../components/BeforeAfterPreview'
import { EuroSafe } from '../components/EuroSafe'
import { FinalCTA } from '../components/FinalCTA'
import { Grants } from '../components/Grants'
import { HomeDecisionSupport } from '../components/HomeDecisionSupport'
import { Hero } from '../components/Hero'
import { ManufacturerMarquee } from '../components/ManufacturerMarquee'
import { Prevention } from '../components/Prevention'
import { SolutionGallery } from '../components/SolutionGallery'
import { TrustBar } from '../components/TrustBar'
import { WhatWeOffer } from '../components/WhatWeOffer'
import { SEO } from '../components/SEO'

const homeSeoCopy = {
  en: {
    title: 'CasaMia | Home Safety Adaptations for Seniors in Spain',
    description:
      'CasaMia helps families make homes safer for older adults with room-by-room assessment, practical adaptations, trusted installers and clear follow-up.',
  },
  es: {
    title: 'CasaMia | Adaptación y seguridad del hogar para mayores en España',
    description:
      'CasaMia ayuda a las familias a hacer la vivienda más segura para personas mayores con evaluación por estancias, adaptaciones prácticas, instaladores coordinados y seguimiento claro.',
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
      <HomeDecisionSupport />
      <SolutionGallery />
      <BeforeAfterPreview />
      <ManufacturerMarquee />
      <WhatWeOffer />
      <Grants />
      <EuroSafe />
      <FinalCTA />
    </>
  )
}
