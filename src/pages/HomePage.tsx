import { EuroSafe } from '../components/EuroSafe'
import { FinalCTA } from '../components/FinalCTA'
import { Grants } from '../components/Grants'
import { Hero } from '../components/Hero'
import { Plans } from '../components/Plans'
import { Prevention } from '../components/Prevention'
import { SolutionGallery } from '../components/SolutionGallery'
import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'
import { WhatWeOffer } from '../components/WhatWeOffer'

export function HomePage() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Prevention />
      <WhatWeOffer />
      <TrustSection />
      <SolutionGallery />
      <Plans />
      <Grants />
      <EuroSafe />
      <FinalCTA />
    </>
  )
}
