import { EuroSafe } from '../components/EuroSafe'
import { FinalCTA } from '../components/FinalCTA'
import { Grants } from '../components/Grants'
import { Hero } from '../components/Hero'
import { Plans } from '../components/Plans'
import { Prevention } from '../components/Prevention'
import { SEO } from '../components/SEO'
import { ServicesPreview } from '../components/ServicesPreview'
import { TrustBar } from '../components/TrustBar'
import { TrustSection } from '../components/TrustSection'

export function HomePage() {
  return (
    <>
      <SEO
        title="Senior Home Safety and Aging-in-Place Services in Spain"
        description="CasaMia helps families in Spain make homes safer for seniors with in-home safety visits, room-by-room recommendations, practical adaptations, smart safety technology, and grant support."
        path="/"
        schema={{
          '@context': 'https://schema.org',
          '@type': 'LocalBusiness',
          name: 'CasaMia',
          description:
            'Senior home safety assessments, aging-in-place adaptations, smart safety technology, and grant support in Spain.',
          areaServed: 'Spain',
          telephone: '+34 900 000 000',
          url: 'https://casamia.es',
        }}
      />
      <Hero />
      <TrustBar />
      <Prevention />
      <ServicesPreview />
      <Plans />
      <Grants />
      <TrustSection />
      <EuroSafe />
      <FinalCTA />
    </>
  )
}
