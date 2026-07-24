import type { ServiceIconId } from './siteContent'

export type NeedLandingPageContent = {
  slug: string
  path: string
  servicePath: string
  resourcePath?: string
  footerVisible?: boolean
  icon: ServiceIconId
  image: string
  title: string
  seoTitle: string
  description: string
  eyebrow: string
  intro: string
  whoFor: string[]
  priorities: string[]
  casamiaPlan: string[]
  relatedServices: Array<{ label: string; to: string }>
  faqs: Array<{ question: string; answer: string }>
}

export const needLandingPages: NeedLandingPageContent[] = [
  {
    slug: 'bathroom-safety-for-seniors',
    path: '/bathroom-safety-for-seniors',
    servicePath: '/services/bathroom-safety',
    resourcePath: '/blog/bathroom-safety-seniors-costly-mistakes',
    icon: 'bath',
    image: '/images/blog/bathroom-mistakes.webp',
    title: 'Bathroom safety for seniors',
    seoTitle: 'Bathroom Safety for Seniors in Spain',
    description:
      'Practical bathroom safety for seniors: safer bathing, toilet transfers, anti-slip support, lighting, water controls and CasaMia-managed installation.',
    eyebrow: 'Bathroom safety',
    intro:
      'Make bathing, toilet use and bathroom movement safer without turning the room into a clinic. CasaMia reviews the real routine, recommends the right package and coordinates the work.',
    whoFor: ['Older adults who feel unsteady in the bathroom', 'Families worried about shower or toilet transfers', 'Homes with wet-floor, grip or night-time bathroom risks'],
    priorities: ['Safer bathing and shower seating', 'Toilet support and easier transfers', 'Slip prevention and night visibility', 'Temperature and leak-risk safeguards'],
    casamiaPlan: ['Review the bathroom layout and daily routine', 'Select the right Bathroom Home Safety Package components', 'Coordinate installation, handover and aftercare'],
    relatedServices: [
      { label: 'Bathroom safety services', to: '/services/bathroom-safety' },
      { label: 'Free safety report', to: '/home-safety-assessment' },
      { label: 'Bathroom safety guide', to: '/blog/bathroom-safety-seniors-costly-mistakes' },
    ],
    faqs: [
      {
        question: 'What should be checked first in a senior bathroom?',
        answer:
          'Start with shower access, toilet transfers, wet floors, support points, night lighting and whether taps or shower controls are easy to use.',
      },
      {
        question: 'Can CasaMia keep the bathroom looking like a normal home?',
        answer:
          'Yes. The goal is safer use with discreet, practical improvements wherever possible, not a clinical look unless specialist works are needed.',
      },
    ],
  },
  {
    slug: 'fall-prevention-at-home',
    path: '/fall-prevention-at-home',
    servicePath: '/services',
    resourcePath: '/blog/fall-prevention-home-checklist-spain',
    icon: 'shield',
    image: '/images/blog/fall-prevention-checklist.webp',
    title: 'Fall prevention at home',
    seoTitle: 'Fall Prevention at Home for Older Adults',
    description:
      'A room-by-room fall prevention route for older adults at home, covering bathrooms, bedrooms, stairs, entrances, lighting and support points.',
    eyebrow: 'Prevention first',
    intro:
      'Fall prevention is not one product. It is a practical plan across the rooms and routines where risk builds up: transfers, lighting, floor surfaces, stairs and support points.',
    whoFor: ['Families noticing slips, near misses or reduced confidence', 'Older adults recovering from a fall or mobility change', 'Homes that need a calm prevention plan before a crisis'],
    priorities: ['Bathroom and toilet transfer safety', 'Bedroom-to-bathroom night route', 'Stairs, entrances and thresholds', 'Emergency reach and simple connected support'],
    casamiaPlan: ['Identify the highest-risk routines first', 'Match improvements to the person, not just the property', 'Phase works into urgent, recommended and optional actions'],
    relatedServices: [
      { label: 'All safety services', to: '/services' },
      { label: 'How CasaMia works', to: '/how-it-works' },
      { label: 'Fall prevention checklist', to: '/blog/fall-prevention-home-checklist-spain' },
    ],
    faqs: [
      {
        question: 'Where do fall-prevention improvements usually start?',
        answer:
          'CasaMia usually starts with bathrooms, bedrooms, stairs, entrances and lighting because these areas combine movement, transfers and visibility.',
      },
      {
        question: 'Does fall prevention mean changing the whole home at once?',
        answer:
          'No. A good plan separates immediate safety priorities from later improvements so families can act in a sensible order.',
      },
    ],
  },
  {
    slug: 'aging-in-place-home-assessment',
    path: '/aging-in-place-home-assessment',
    servicePath: '/home-safety-assessment',
    resourcePath: '/blog/fall-prevention-home-checklist-spain',
    icon: 'home',
    image: '/images/assessment/casamia-inspector-tablet.jpg',
    title: 'Aging-in-place home assessment',
    seoTitle: 'Aging in Place Home Assessment in Spain',
    description:
      'Book an aging-in-place home assessment with CasaMia to understand safety priorities, adaptations, grants and practical next steps.',
    eyebrow: 'Home assessment',
    intro:
      'An aging-in-place assessment gives families a clear view of what matters now, what can wait and which changes help someone remain safer and more comfortable at home.',
    whoFor: ['Families planning before a fall or hospital discharge', 'Older adults who want to stay independent at home', 'Homes where relatives disagree on what to fix first'],
    priorities: ['Mobility and transfer routines', 'Room-by-room safety risks', 'Practical adaptation options', 'Grant-readiness and documentation where relevant'],
    casamiaPlan: ['Listen to the household and daily priorities', 'Review the home, photos or guided answers', 'Prepare a clear proposal with next steps'],
    relatedServices: [
      { label: 'Book a home assessment', to: '/home-safety-assessment' },
      { label: 'Build your plan', to: '/home-safety-wizard' },
      { label: 'Why choose CasaMia', to: '/why-us' },
    ],
    faqs: [
      {
        question: 'What is included in an aging-in-place assessment?',
        answer:
          'CasaMia reviews the home context, mobility needs, priority rooms, photos or notes where available, and recommends practical safety improvements.',
      },
      {
        question: 'Can the assessment be done before a visit?',
        answer:
          'Yes. Families can start online with guided questions, photos, videos or a voice brief. A site visit can confirm measurements and installation details later.',
      },
    ],
  },
  {
    slug: 'home-adaptations-for-elderly',
    path: '/home-adaptations-for-elderly',
    servicePath: '/services',
    resourcePath: '/blog/choose-home-safety-provider-spain',
    icon: 'check',
    image: '/images/service-gallery/04-bathroom-and-kitchen-adaptations.jpg',
    title: 'Home adaptations for elderly people',
    seoTitle: 'Home Adaptations for Elderly People in Spain',
    description:
      'CasaMia coordinates elderly home adaptations across bathrooms, bedrooms, entrances, kitchens, lighting and connected living support.',
    eyebrow: 'Home adaptations',
    intro:
      'Good home adaptation is not about adding random products. It is about preserving independence, comfort and dignity while removing everyday friction and safety risks.',
    whoFor: ['Families who need one coordinated plan', 'Older adults with changing mobility or confidence', 'Homes needing practical works, smart support or grant guidance'],
    priorities: ['Safer bathroom access', 'Bedroom and night-time movement', 'Entrance, threshold and stairs support', 'Connected routines where helpful'],
    casamiaPlan: ['Translate needs into customer-friendly outcomes', 'Coordinate products, installers and timings', 'Keep pricing, scope and handover clear'],
    relatedServices: [
      { label: 'Service catalogue', to: '/services' },
      { label: 'Process', to: '/how-it-works' },
      { label: 'Provider guide', to: '/blog/choose-home-safety-provider-spain' },
    ],
    faqs: [
      {
        question: 'Which adaptations are most common?',
        answer:
          'Common adaptations include grab bars, shower seating, night lighting, bed transfer support, threshold changes, safer flooring and easier controls.',
      },
      {
        question: 'Does CasaMia supply and install everything?',
        answer:
          'CasaMia coordinates the end-to-end process: assessment, proposal, product selection, installation partners and follow-up where required.',
      },
    ],
  },
  {
    slug: 'senior-bedroom-safety',
    path: '/senior-bedroom-safety',
    servicePath: '/services/bedroom-safety',
    resourcePath: '/blog/bedroom-night-safety-older-adults',
    icon: 'bedroom',
    image: '/images/blog/bedroom-night-safety.webp',
    title: 'Senior bedroom safety',
    seoTitle: 'Senior Bedroom Safety and Night-Time Fall Prevention',
    description:
      'Senior bedroom safety for easier bed transfers, safer walking routes, night lighting, emergency support and connected bedroom routines.',
    eyebrow: 'Bedroom safety',
    intro:
      'The bedroom should support rest and safe movement, especially at night. CasaMia focuses on bed transfers, clear walking routes, lighting and emergency reach.',
    whoFor: ['Older adults who wake at night to use the bathroom', 'Families concerned about bed transfers', 'Homes with rugs, cables, clutter or poor bedroom lighting'],
    priorities: ['Motion-activated night lighting', 'Bed transfer support', 'Clear route from bed to door', 'Emergency call options and connected routines'],
    casamiaPlan: ['Review the bedroom and night routine', 'Recommend core and optional bedroom package components', 'Install, configure and explain everything clearly'],
    relatedServices: [
      { label: 'Bedroom safety services', to: '/services/bedroom-safety' },
      { label: 'Night safety guide', to: '/blog/bedroom-night-safety-older-adults' },
      { label: 'Build my plan', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: 'What makes a bedroom safer for seniors?',
        answer:
          'Good bedroom safety usually starts with easier bed transfers, night lighting, clear walking routes, safe floor surfaces and a reachable way to ask for help.',
      },
      {
        question: 'Can connected bedroom features be optional?',
        answer:
          'Yes. Connected bedroom support such as voice routines, reminders or alerts should be used only where it adds comfort and confidence.',
      },
    ],
  },
  {
    slug: 'safe-bathroom-access',
    path: '/safe-bathroom-access',
    servicePath: '/services/bathroom-safety',
    resourcePath: '/blog/bathroom-safety-seniors-costly-mistakes',
    icon: 'door',
    image: '/images/solutions/small-bathroom-with-window-apartment.jpg',
    title: 'Safe bathroom access',
    seoTitle: 'Safe Bathroom Access for Older Adults',
    description:
      'Improve safe bathroom access with easier entry, support rails, shower seating, anti-slip surfaces, lighting and door adjustments where suitable.',
    eyebrow: 'Safer access',
    intro:
      'Bathroom access is about the whole route: entering the room, closing or opening the door, reaching the toilet or shower and getting support at the exact point it is needed.',
    whoFor: ['People who avoid showering because access feels difficult', 'Families worried about toilet or bath transfers', 'Small bathrooms where every movement matters'],
    priorities: ['Door handle and privacy-lock usability', 'Shower or bath entry support', 'Toilet transfer support', 'Night route and bathroom visibility'],
    casamiaPlan: ['Map the movement route into and inside the bathroom', 'Confirm measurements and support positions', 'Coordinate practical works and optional adaptations'],
    relatedServices: [
      { label: 'Bathroom package', to: '/services/bathroom-safety' },
      { label: 'Home assessment', to: '/home-safety-assessment' },
      { label: 'Bathroom safety guide', to: '/blog/bathroom-safety-seniors-costly-mistakes' },
    ],
    faqs: [
      {
        question: 'Is bathroom access only about the shower?',
        answer:
          'No. It includes the doorway, toilet transfer, bath or shower access, floor surfaces, controls, visibility and safe reach for support.',
      },
      {
        question: 'When is a specialist quote needed?',
        answer:
          'Door widening, bathtub step-through conversion and structural changes usually need measurement, assessment and a specialist quotation.',
      },
    ],
  },
  {
    slug: 'grants-for-home-adaptations-spain',
    path: '/grants-for-home-adaptations-spain',
    servicePath: '/grant-check',
    resourcePath: '/blog/home-adaptation-grants-spain-family-guide',
    icon: 'book',
    image: '/images/blog/grants-readiness.webp',
    title: 'Grants for home adaptations in Spain',
    seoTitle: 'Grants for Home Adaptations in Spain',
    description:
      'Check grant readiness for home adaptations in Spain, including possible requirements, documents, timing and CasaMia-managed grant support.',
    eyebrow: 'Grants and assistance',
    intro:
      'Grant routes depend on region, municipality, open calls and personal circumstances. CasaMia helps families understand what may fit and what documents are usually needed.',
    whoFor: ['Families considering accessibility or safety works', 'Older adults who may qualify for public assistance', 'Households needing help with paperwork and next steps'],
    priorities: ['Region and postcode check', 'Ownership or permission status', 'Dependency, disability or age documentation', 'Clear scope and quotation for eligible works'],
    casamiaPlan: ['Check possible routes from official sources', 'Show missing documents and timing', 'Manage the process end to end when commissioned'],
    relatedServices: [
      { label: 'Grant check', to: '/grant-check' },
      { label: 'Plan Adapta', to: '/plan-adapta' },
      { label: 'Grant guide', to: '/blog/home-adaptation-grants-spain-family-guide' },
    ],
    faqs: [
      {
        question: 'Can CasaMia guarantee a grant?',
        answer:
          'No. The relevant public authority decides eligibility, approval, amount and timing. CasaMia can help prepare and manage the process.',
      },
      {
        question: 'What information is useful for a grant check?',
        answer:
          'Region, postcode, home type, ownership or permission status, age band, mobility situation, dependency or disability status and planned adaptations are useful starting points.',
      },
    ],
  },
  {
    slug: 'home-safety-after-hospital-discharge',
    path: '/home-safety-after-hospital-discharge',
    servicePath: '/home-safety-assessment',
    resourcePath: '/blog/emergency-plan-aging-parents-home',
    icon: 'shield',
    image: '/images/blog/emergency-plan-home.webp',
    title: 'Home safety after hospital discharge',
    seoTitle: 'Home Safety After Hospital Discharge',
    description:
      'Prepare a safer return home after hospital discharge with CasaMia: bathroom access, bedroom transfers, routes, support points and urgent priorities.',
    eyebrow: 'Return home safely',
    intro:
      'After a hospital stay, the home may need to work differently. CasaMia helps families focus on the first safe days back: movement, washing, sleeping, stairs and support.',
    whoFor: ['Families preparing for discharge', 'Older adults returning home with reduced mobility', 'Homes needing fast priorities rather than a long wish list'],
    priorities: ['Bed, bathroom and toilet transfer support', 'Clear walking routes and lighting', 'Entrance or stair safety', 'Emergency contact and family visibility'],
    casamiaPlan: ['Identify what is needed before return', 'Separate urgent changes from later improvements', 'Coordinate practical installation and follow-up'],
    relatedServices: [
      { label: 'Book an assessment', to: '/home-safety-assessment' },
      { label: 'Build a quick plan', to: '/home-safety-wizard' },
      { label: 'Emergency planning guide', to: '/blog/emergency-plan-aging-parents-home' },
    ],
    faqs: [
      {
        question: 'What should families check before hospital discharge?',
        answer:
          'Check how the person will enter the home, get to bed, use the toilet, shower, move at night and call for help if something changes.',
      },
      {
        question: 'Can CasaMia prioritise urgent works?',
        answer:
          'Yes. The plan can focus on immediate safety first, then schedule recommended and optional improvements after the person is settled.',
      },
    ],
  },
  {
    slug: 'connected-home-for-seniors',
    path: '/connected-home-for-seniors',
    servicePath: '/services/smart-home-safety',
    resourcePath: '/blog/smart-home-safety-without-overcomplicating',
    icon: 'smartphone',
    image: '/images/blog/smart-safety-simple.webp',
    title: 'Connected home for seniors',
    seoTitle: 'Connected Home for Seniors Without Complication',
    description:
      'Connected home support for seniors with voice assistance, smart lighting, reminders, leak alerts, emergency options and family reassurance.',
    eyebrow: 'Connected living',
    intro:
      'CasaMia does not sell gadgets for their own sake. We configure simple connected experiences that support everyday routines, safety and reassurance.',
    whoFor: ['Older adults who benefit from voice help or reminders', 'Families who want practical reassurance without intrusive monitoring', 'Homes where lighting, alerts or routines can reduce friction'],
    priorities: ['Voice assistance and hands-free calls', 'Smart lighting and night routines', 'Medication or appointment reminders', 'Leak, emergency or family notifications where useful'],
    casamiaPlan: ['Choose technology only where it supports a routine', 'Configure compatible devices into one simple experience', 'Train the household and keep support clear'],
    relatedServices: [
      { label: 'Connected safety services', to: '/services/smart-home-safety' },
      { label: 'Technology approach', to: '/tech' },
      { label: 'Connected safety guide', to: '/blog/smart-home-safety-without-overcomplicating' },
    ],
    faqs: [
      {
        question: 'Is a connected home the same as monitoring?',
        answer:
          'No. CasaMia focuses on useful connected living: lighting, reminders, alerts and simple controls. Any response setup must be clearly agreed.',
      },
      {
        question: 'Does the person need to be technical?',
        answer:
          'No. The experience should be simple, usually centred around familiar voice commands, easy routines and clear family support.',
      },
    ],
  },
]

export const decisionGuidePages: NeedLandingPageContent[] = [
  {
    slug: 'home-safety-assessment-vs-general-contractor',
    path: '/home-safety-assessment-vs-general-contractor',
    servicePath: '/home-safety-assessment',
    footerVisible: false,
    icon: 'check',
    image: '/images/assessment/casamia-inspector-tablet.jpg',
    title: 'Home safety assessment vs general contractor',
    seoTitle: 'Home Safety Assessment vs General Contractor | CasaMia',
    description:
      'Understand when to start with a senior home safety assessment before asking a contractor to install products or quote works.',
    eyebrow: 'Decision guide',
    intro:
      'A contractor can install what you ask for. A home safety assessment helps decide what should be asked for in the first place, based on the person, the routine and the risk.',
    whoFor: ['Families unsure what to request from installers', 'Homes with several possible safety issues', 'People who want a clear scope before spending money'],
    priorities: ['The person’s exact movement and transfer needs', 'Which risks are urgent, recommended or optional', 'Measurements, fixing points and site constraints', 'A scope installers can price and deliver'],
    casamiaPlan: ['Start with the daily safety problem', 'Turn observations into a package-led scope', 'Coordinate installer requirements, handover and follow-up'],
    relatedServices: [
      { label: 'Book a safety assessment', to: '/home-safety-assessment' },
      { label: 'See how it works', to: '/how-it-works' },
      { label: 'Review services', to: '/services' },
    ],
    faqs: [
      {
        question: 'Should I call a contractor first?',
        answer:
          'If the required work is obvious and already specified, a contractor may be enough. If the family is unsure what should be changed, start with a safety assessment so the scope matches the resident.',
      },
      {
        question: 'Does CasaMia do the installation too?',
        answer:
          'CasaMia coordinates the process end to end, including assessment, practical scope, installation coordination and handover where needed.',
      },
    ],
  },
  {
    slug: 'smart-home-safety-vs-monitoring',
    path: '/smart-home-safety-vs-monitoring',
    servicePath: '/tech',
    footerVisible: false,
    icon: 'smartphone',
    image: '/images/blog/smart-safety-simple.webp',
    title: 'Smart home safety vs monitoring',
    seoTitle: 'Smart Home Safety vs Monitoring for Seniors | CasaMia',
    description:
      'Compare smart home safety, simple alerts and monitoring-style services for seniors without overcomplicating the home.',
    eyebrow: 'Decision guide',
    intro:
      'Not every connected device is monitoring, and not every family needs a monitoring service. CasaMia focuses on useful connected living: lighting, reminders, alerts and simple routines with clear consent.',
    whoFor: ['Families considering sensors, voice assistance or emergency buttons', 'Older adults who want support without feeling watched', 'Homes where simple automation could reduce daily friction'],
    priorities: ['Consent and comfort with technology', 'Night lighting, reminders and emergency reach', 'Who receives alerts and what they do next', 'Compatibility, setup and ongoing support'],
    casamiaPlan: ['Define the experience before choosing devices', 'Configure compatible tools into simple routines', 'Document response rules so the family understands what happens'],
    relatedServices: [
      { label: 'Technology approach', to: '/tech' },
      { label: 'Connected home for seniors', to: '/connected-home-for-seniors' },
      { label: 'Start a guided plan', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: 'Is smart home safety the same as surveillance?',
        answer:
          'No. CasaMia prioritises practical support such as lighting, reminders, water alerts and emergency reach. Any alert or response setup should be consented to and easy to understand.',
      },
      {
        question: 'What is the simplest connected setup?',
        answer:
          'A simple setup often starts with a configured smart speaker, night lighting, easy calls, reminders and selected alerts. The right mix depends on the resident and home.',
      },
    ],
  },
]

export const allNeedLandingPages = [...needLandingPages, ...decisionGuidePages]

export function getNeedLandingPage(slug?: string) {
  return allNeedLandingPages.find((page) => page.slug === slug)
}
