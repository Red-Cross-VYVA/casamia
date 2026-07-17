import { BeforeAfterPreview } from '../components/BeforeAfterPreview'
import { EuroSafe } from '../components/EuroSafe'
import { FinalCTA } from '../components/FinalCTA'
import { Grants } from '../components/Grants'
import { Hero } from '../components/Hero'
import { ManufacturerMarquee } from '../components/ManufacturerMarquee'
import { Plans } from '../components/Plans'
import { Prevention } from '../components/Prevention'
import { SampleReportPreview } from '../components/SampleReportPreview'
import { SolutionGallery } from '../components/SolutionGallery'
import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'
import { WhatWeOffer } from '../components/WhatWeOffer'

export function Home2Page() {
  return (
    <>
      <Hero />
      <TrustBar />
      <Prevention />
      <BeforeAfterPreview />
      <ManufacturerMarquee />
      <WhatWeOffer />
      <SampleReportPreview />
      <TrustSection />
      <SolutionGallery />
      <Plans />
      <Grants />
      <EuroSafe />
      <FinalCTA />
    </>
  )
}
