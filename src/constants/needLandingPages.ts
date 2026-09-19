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
  riskSection?: {
    eyebrow: string
    title: string
    body: string
    image: string
    imageAlt: string
    risks: string[]
    riskDetails?: Array<{
      solution: string
      helps: string
      product?: string
      stat?: string
    }>
    mapLabels?: string[]
    legend?: string[]
  }
  relatedServices: Array<{ label: string; to: string }>
  faqs: Array<{ question: string; answer: string }>
}

export const needLandingPages: NeedLandingPageContent[] = [
  {
    slug: 'bathroom-safety-for-seniors',
    path: '/services/bathroom-safety',
    servicePath: '/services/bathroom-safety',
    resourcePath: '/blog/bathroom-safety-seniors-costly-mistakes',
    icon: 'bath',
    image: '/images/blog/bathroom-mistakes.webp',
    title: 'Bathroom safety at home',
    seoTitle: 'Bathroom Safety at Home in Spain',
    description:
      'Practical bathroom safety: safer access, bathing, toilet transfers, anti-slip support, lighting, water controls and checked fitting.',
    eyebrow: 'Bathroom safety',
    intro:
      'Make bathing, toilet use and bathroom access safer without turning the room into a clinic. We review the real routine, recommend what fits and check the fitting details before work starts.',
    whoFor: [
      'People who feel unsteady in the bathroom',
      'Anyone worried about transfers',
      'Small or wet bathrooms',
    ],
    priorities: [
      'Shower and toilet support',
      'Grip, light and water controls',
      'Door access and usable supports',
    ],
    casamiaPlan: [
      'Review the real routine',
      'Confirm fit and fixing points',
      'Check fitting and explain safe use',
    ],
    riskSection: {
      eyebrow: 'Bathroom risk map',
      title: 'Where bathroom risk usually builds up.',
      body:
        'Bathroom risk rarely comes from one thing. Water, transfers, tight spaces, low light and unclear support points can combine in a few everyday movements.',
      image: '/images/solutions/bathroom-risk-map-numbered.png',
      imageAlt: 'Annotated bathroom map showing common fall and access risk points',
      risks: ['Loose mat', 'High step', 'Shower entry', 'Toilet height', 'Wet zone', 'Visible cable', 'Narrow door'],
      riskDetails: [
        {
          solution: 'Secure the surface',
          helps: 'Loose mats are removed or replaced with fixed anti-slip options at the shower exit.',
          product: 'Anti-slip bath or shower mat, or floor-grip treatment.',
          stat: 'CDC bathroom-injury data found falls caused 81.1% of nonfatal bathroom injuries.',
        },
        {
          solution: 'Lower the entry',
          helps: 'We check the threshold and recommend a lower profile, transition strip or tub cut-out when it fits the room.',
          product: 'Low-profile transition strip, threshold reduction or bath cut-out.',
        },
        {
          solution: 'Add transfer support',
          helps: 'A fixed grab bar and folding seat reduce standing time and give a clear handhold when entering or washing.',
          product: 'Wall-mounted grab bar plus folding shower seat.',
          stat: 'CDC data found 37.3% of bathroom injuries happened while bathing, showering or exiting.',
        },
        {
          solution: 'Stabilise sit-to-stand',
          helps: 'Raised toilet support and rails reduce deep bending and create predictable support on both sides.',
          product: 'Raised toilet seat or toilet support rails.',
        },
        {
          solution: 'Improve wet-floor grip',
          helps: 'We identify splash zones and treat suitable surfaces so feet have better traction after bathing.',
          product: 'Anti-slip floor treatment for compatible wet areas.',
        },
        {
          solution: 'Clear the route',
          helps: 'Cables are moved, clipped or replaced with safer lighting placement away from walking lines.',
          product: 'Cable management plus motion-activated night lighting when it improves the route.',
        },
        {
          solution: 'Check access width',
          helps: 'We check whether the door limits help, walking aids or emergency access before recommending an adaptation.',
          product: 'Door hardware changes or wider-doorway review.',
        },
      ],
      legend: ['High risk', 'Medium risk'],
    },
    relatedServices: [
      { label: 'Bathroom safety services', to: '/services/bathroom-safety' },
      { label: 'Free safety report', to: '/home-safety-assessment' },
      { label: 'Bathroom safety guide', to: '/blog/bathroom-safety-seniors-costly-mistakes' },
    ],
    faqs: [
      {
        question: 'What should be checked first in a bathroom?',
        answer:
          'Start with shower access, toilet transfers, wet floors, support points, night lighting and whether taps or shower controls are easy to use.',
      },
      {
        question: 'Can CasaMia keep the bathroom looking like a normal home?',
        answer:
          'Yes. The goal is safer use with discreet, practical improvements wherever possible, not a clinical look unless specialist adaptations are needed.',
      },
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
    slug: 'fall-prevention-at-home',
    path: '/fall-prevention-at-home',
    servicePath: '/services',
    resourcePath: '/blog/fall-prevention-home-checklist-spain',
    icon: 'shield',
    image: '/images/blog/fall-prevention-checklist.webp',
    title: 'Fall prevention at home',
    seoTitle: 'Fall Prevention at Home for Older Adults',
    description:
      'Room-by-room fall prevention for older adults at home, covering bathrooms, bedrooms, stairs, entrances, lighting and support points.',
    eyebrow: 'Prevention first',
    intro:
      'Fall prevention is not one product. It is a practical plan across the rooms and routines where risk builds up: transfers, lighting, floor surfaces, stairs and support points.',
    whoFor: ['People noticing slips, near misses or new hesitation at home', 'Anyone recovering from a fall or mobility change', 'Homes that need prevention priorities before a crisis'],
    priorities: ['Bathroom and toilet transfer safety', 'Bedroom-to-bathroom night movement', 'Stairs, entrances and thresholds', 'Emergency reach and agreed connected support'],
    casamiaPlan: ['Identify the highest-risk routines first', 'Match improvements to the person, not just the property', 'Phase adaptations into urgent, recommended and optional actions'],
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
          'No. A good plan separates immediate safety priorities from later improvements so the household can act in a sensible order.',
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
    title: 'Home safety assessment',
    seoTitle: 'Home Safety Assessment in Spain',
    description:
      'Book a CasaMia home safety assessment to understand safety priorities, adaptations, grants and practical next steps.',
    eyebrow: 'Home assessment',
    intro:
      'A home safety assessment identifies what should change first, what can wait and which checks are needed before final pricing.',
    whoFor: ['Households planning before a fall or hospital discharge', 'People who want to stay independent at home', 'Homes where people disagree on what to fix first'],
    priorities: ['Mobility and transfer routines', 'Room-by-room safety risks', 'Practical adaptation options', 'Grant-readiness and documentation where relevant'],
    casamiaPlan: ['Listen to the person at home and daily priorities', 'Review the home, photos or guided answers', 'Prepare clear priorities, review items and next steps'],
    relatedServices: [
      { label: 'Book a home assessment', to: '/home-safety-assessment' },
      { label: 'Build your plan', to: '/home-safety-wizard' },
      { label: 'Why choose CasaMia', to: '/why-us' },
    ],
    faqs: [
      {
        question: 'What is included in an aging-in-place assessment?',
        answer:
          'We review the home context, mobility needs, priority rooms, photos or notes where available, and recommend practical safety improvements.',
      },
      {
        question: 'Can the assessment be done before a visit?',
        answer:
          'Yes. You can start online with guided questions, photos, videos or a voice brief. A site visit can check measurements and installation details later.',
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
    title: 'Home adaptations for safer daily living',
    seoTitle: 'Home Adaptations for Safer Daily Living in Spain',
    description:
      'Practical home adaptations: safer bathrooms, bedrooms, entrances, kitchens, lighting and help within reach.',
    eyebrow: 'Home adaptations',
    intro:
      'Good home adaptation starts with the daily task that has become harder: bathing, stairs, bed transfers, cooking, entering the home or asking for help.',
    whoFor: ['People who want to stay comfortable at home', 'Homes where movement, bathing, stairs or night routines now feel less safe', 'Households that need practical changes, connected support or grant guidance'],
    priorities: ['Safer bathroom access', 'Bedroom and night-time movement', 'Entrance, threshold and stairs support', 'Connected routines where helpful'],
    casamiaPlan: ['Turn daily problems into room-by-room actions', 'Check measurements, fitting details and practical timing', 'Confirm what is included and explain safe use before work is closed'],
    relatedServices: [
      { label: 'Service catalogue', to: '/services' },
      { label: 'Process', to: '/how-it-works' },
      { label: 'Choosing help guide', to: '/blog/choose-home-safety-provider-spain' },
    ],
    faqs: [
      {
        question: 'Which adaptations are most common?',
        answer:
          'Common adaptations include grab bars, shower seating, night lighting, bedside support, threshold changes, safer flooring and easier controls.',
      },
      {
        question: 'Does CasaMia supply and install everything?',
        answer:
          'CasaMia helps define the plan, select suitable items, check fitting details, explain safe use and arrange follow-up where required.',
      },
    ],
  },
  {
    slug: 'senior-bedroom-safety',
    path: '/services/bedroom-safety',
    servicePath: '/services/bedroom-safety',
    resourcePath: '/blog/bedroom-night-safety-older-adults',
    icon: 'bedroom',
    image: '/images/blog/bedroom-night-safety-hero.png',
    title: 'Bedroom safety at night',
    seoTitle: 'Bedroom Safety and Night-Time Fall Prevention',
    description:
      'Bedroom safety for getting in and out of bed, safer walking routes, night lighting, emergency support and connected bedroom routines.',
    eyebrow: 'Bedroom safety',
    intro:
      'The bedroom should support rest and safe movement, especially at night. CasaMia focuses on getting in and out of bed, clear walking routes, lighting and emergency reach.',
    whoFor: [
      'People who wake at night and need a safer route to the bathroom',
      'Anyone who wants the first step out of bed to feel steadier and calmer',
      'Bedrooms where lighting, floor edges or furniture layout make independent movement harder than it should be',
    ],
    priorities: ['Motion-activated night lighting', 'Bedside support', 'Clear route from bed to door', 'Emergency call options and connected routines'],
    casamiaPlan: ['Review the bedroom and night routine', 'Recommend core and optional bedroom package components', 'Install, configure and explain what changed'],
    riskSection: {
      eyebrow: 'Bedroom risk map',
      title: 'Where night-time risk builds up.',
      body:
        'Bedroom risk often appears in small, half-awake movements: getting out of bed, finding the light, walking to the bathroom and moving around furniture.',
      image: '/images/solutions/bedroom-risk-map-numbered.png',
      imageAlt: 'Annotated bedroom risk map showing night-time routes, bedside hazards and support points',
      risks: [
        'Poor night lighting',
        'Unsteady bed exit',
        'Loose rug edge',
        'Trip route to door',
        'Bedside clutter',
        'No support point',
        'Floor edge or threshold',
      ],
      riskDetails: [
        {
          solution: 'Light the first step',
          helps: 'Low-level motion lights make the bed-to-door route visible without waking the room fully.',
          product: 'Motion-activated bedside and route lighting.',
        },
        {
          solution: 'Stabilise getting up',
          helps: 'A correctly positioned bed assist handle gives a predictable handhold for sitting up and standing.',
          product: 'Bed assist handle with fit and height check.',
        },
        {
          solution: 'Secure the floor',
          helps: 'Loose rugs are removed or fixed, and the bedside landing area is made calmer underfoot.',
          product: 'Rug removal, anti-slip rug tape or matched bedside exit mats.',
        },
        {
          solution: 'Clear the night path',
          helps: 'Furniture, cables and stored items are moved away from the natural path to the door or bathroom.',
          product: 'Furniture repositioning and cable management.',
        },
        {
          solution: 'Simplify reach',
          helps: 'The bedside area is arranged so glasses, phone, water and light controls are easy to reach.',
          product: 'Accessible bedside layout and storage review.',
        },
        {
          solution: 'Add steady support',
          helps: 'We check where the person naturally reaches and add support only where it can be used safely.',
          product: 'Bedside support handle or furniture positioning.',
        },
        {
          solution: 'Smooth transitions',
          helps: 'Door thresholds and floor edges are checked so the route remains predictable underfoot.',
          product: 'Threshold review or safer transition strip when it fits the route.',
        },
      ],
      legend: ['Higher risk', 'Medium risk'],
    },
    relatedServices: [
      { label: 'Bedroom safety services', to: '/services/bedroom-safety' },
      { label: 'Night safety guide', to: '/blog/bedroom-night-safety-older-adults' },
      { label: 'Build my plan', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: 'What makes a bedroom safer at night?',
        answer:
          'Good bedroom safety usually starts with easier bed access, night lighting, clear walking routes, safe floor surfaces and a reachable way to ask for help.',
      },
      {
        question: 'Can connected bedroom features be optional?',
        answer:
          'Yes. Connected bedroom support such as voice routines, reminders or alerts should be used only when the person understands it, accepts it and someone is ready to respond.',
      },
    ],
  },
  {
    slug: 'grants-for-home-adaptations-spain',
    path: '/grants',
    servicePath: '/grant-check',
    resourcePath: '/blog/home-adaptation-grants-spain-family-guide',
    icon: 'book',
    image: '/images/blog/grants-euro-symbol.webp',
    title: 'Grants for home adaptations in Spain',
    seoTitle: 'Grants for Home Adaptations in Spain',
    description:
      'Check grant readiness for home adaptations in Spain, including possible requirements, documents, timing and what may still be missing.',
    eyebrow: 'Grants and assistance',
    intro:
      'Grant eligibility depends on region, municipality, open calls and personal circumstances. CasaMia helps you understand what may fit and what documents are usually needed.',
    whoFor: ['People considering accessibility or safety works', 'Anyone who may qualify for public assistance', 'Households needing help with documents and next steps'],
    priorities: ['Region and postcode check', 'Ownership or permission status', 'Dependency, disability or age documentation', 'Clear plan and quotation for works that may qualify'],
    casamiaPlan: ['Check possible options from official sources', 'Show missing documents and timing', 'Prepare next steps without promising approval'],
    relatedServices: [
      { label: 'Grant check', to: '/grant-check' },
      { label: 'Plan Adapta', to: '/plan-adapta' },
      { label: 'Grant guide', to: '/blog/home-adaptation-grants-spain-family-guide' },
    ],
    faqs: [
      {
        question: 'Can CasaMia guarantee a grant?',
        answer:
          'No. The relevant public authority decides eligibility, approval, amount and timing. CasaMia can help organise the information and prepare a stronger file.',
      },
      {
        question: 'What information do I need for a grant check?',
        answer:
          'Region, postcode, home type, ownership or permission status, age band, mobility situation, dependency or disability status and planned adaptations are the starting points.',
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
      'After a hospital stay, the home may need to work differently. CasaMia helps focus on the first safe days back: movement, washing, sleeping, stairs and support.',
    whoFor: ['Households preparing for discharge', 'People returning home with reduced mobility', 'Homes needing fast priorities rather than a long wish list'],
    priorities: ['Bed, bathroom and toilet transfer support', 'Clear walking routes and lighting', 'Entrance or stair safety', 'Emergency contact and approved-contact visibility'],
    casamiaPlan: ['Identify what is needed before return', 'Separate urgent changes from later improvements', 'Coordinate practical installation and follow-up'],
    relatedServices: [
      { label: 'Book an assessment', to: '/home-safety-assessment' },
      { label: 'Build a quick plan', to: '/home-safety-wizard' },
      { label: 'Emergency planning guide', to: '/blog/emergency-plan-aging-parents-home' },
    ],
    faqs: [
      {
        question: 'What should be checked before hospital discharge?',
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
    path: '/services/smart-home-safety',
    servicePath: '/services/smart-home-safety',
    resourcePath: '/blog/smart-home-safety-without-overcomplicating',
    icon: 'smartphone',
    image: '/images/blog/smart-safety-simple.webp',
    title: 'Connected home support',
    seoTitle: 'Connected Home Support Without Complication',
    description:
      'Connected home support with voice assistance, smart lighting, reminders, leak alerts, emergency options and approved-contact notifications.',
    eyebrow: 'Connected living',
    intro:
      'CasaMia only adds connected devices when they solve a specific problem: lighting, reminders, water alerts, emergency reach or agreed contact notifications.',
    whoFor: ['People who benefit from voice help or reminders', 'People who want practical alerts without intrusive monitoring', 'Homes where lighting, alerts or routines can reduce daily friction'],
    priorities: ['Voice assistance and hands-free calls', 'Smart lighting and night routines', 'Medication or appointment reminders', 'Leak, emergency or approved-contact notifications when agreed'],
    casamiaPlan: ['Choose technology only where it supports a routine', 'Configure compatible devices around agreed responders', 'Train the household and document who receives alerts'],
    relatedServices: [
      { label: 'Connected safety services', to: '/services/smart-home-safety' },
      { label: 'Technology approach', to: '/tech' },
      { label: 'Connected safety guide', to: '/blog/smart-home-safety-without-overcomplicating' },
    ],
    faqs: [
      {
        question: 'Is a connected home the same as monitoring?',
        answer:
          'No. CasaMia focuses on practical connected living: lighting, reminders, alerts and usable controls. Any response setup must name who is notified and what they should do.',
      },
      {
        question: 'Does the person need to be technical?',
        answer:
          'No. The setup should use familiar actions such as voice commands, scheduled lights or one-tap help, with support from approved contacts.',
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
      'Know when to start with a home safety assessment before asking a contractor to quote or install work.',
    eyebrow: 'Decision guide',
    intro:
      'A contractor is the right call once the adaptation is clear. A safety assessment helps when you are still deciding what should change, where risk is highest, and which changes will actually support the person using the home.',
    whoFor: [
      'People who know something is unsafe but do not know what to ask an installer for',
      'Homes where several rooms, transfers or routes are involved',
      'People whose mobility, hesitation or support needs have recently changed',
      'Households that need a clear adaptation plan before quotes, grants, landlord permission or community approval',
    ],
    priorities: [
      'The daily routine: bathing, toileting, bed transfers, stairs, cooking, entrance and night movement',
      'Which risks are urgent, recommended or optional',
      'Measurements, wall types, fixing points, thresholds, door swings and site constraints',
      'Whether the right answer is a product, minor adaptation, larger installation or connected support',
      'A written plan that can be priced without guessing',
    ],
    casamiaPlan: [
      'Start with the daily movement problem, not a product catalogue',
      'Map each risk to the relevant room package and optional add-ons',
      'Prepare a practical plan with photos, priorities and fitting notes',
      'Set out fitting requirements, completion checks and follow-up support',
    ],
    relatedServices: [
      { label: 'Book a safety assessment', to: '/home-safety-assessment' },
      { label: 'Read the fall checklist', to: '/blog/fall-prevention-home-checklist-spain' },
      { label: 'See how it works', to: '/how-it-works' },
    ],
    faqs: [
      {
        question: 'Should I call a contractor first?',
        answer:
          'If the exact work is obvious, measured and already specified, a contractor may be enough. If you are unsure what should change, start with a safety assessment so the quote matches the person at home.',
      },
      {
        question: 'Does CasaMia do the installation too?',
        answer:
          'CasaMia helps carry the plan through the key steps: assessment, practical planning, checked fitting and safe-use explanation when needed.',
      },
      {
        question: 'Why not ask for three contractor quotes immediately?',
        answer:
          'Three quotes only help when they price the same work. If each person guesses a different fix, the cheapest quote may not solve the real safety problem.',
      },
      {
        question: 'When is a contractor enough?',
        answer:
          'A contractor can be enough for clearly defined installation such as fitting a specified handrail, changing a threshold or adding equipment where the product, location and fixing method are already known.',
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
    seoTitle: 'Smart Home Safety vs Monitoring | CasaMia',
    description:
      'Compare practical smart home safety, simple alerts and monitoring-style services without overcomplicating the home.',
    eyebrow: 'Decision guide',
    intro:
      'Not every connected device is monitoring, and not every home needs a monitoring service. The right choice depends on what problem you are solving: safer movement, easier reminders, emergency reach, approved-contact awareness or formal response.',
    whoFor: [
      'People considering sensors, voice assistance, water alerts, smart lighting or emergency buttons',
      'People who want support without feeling watched',
      'Homes where simple automation could reduce daily friction',
      'Households that need to agree who receives alerts and what happens next',
    ],
    priorities: [
      'Consent, privacy and comfort with every device',
      'The practical risk: night movement, water leaks, medication reminders, calls, door access or emergency reach',
      'Who receives alerts, how quickly they respond and what they can do',
      'Reliability: Wi-Fi, power, batteries, fallbacks and ongoing support',
      'Whether passive safety is enough or a monitored response service is genuinely needed',
    ],
    casamiaPlan: [
      'Define the daily problem before choosing devices',
      'Prioritise familiar routines such as night lighting, easy calls, reminders and selected alerts',
      'Configure compatible tools so the experience stays familiar',
      'Document consent, alert recipients, response rules and maintenance checks',
    ],
    relatedServices: [
      { label: 'Technology approach', to: '/tech' },
      { label: 'Read the smart safety guide', to: '/blog/smart-home-safety-without-overcomplicating' },
      { label: 'Connected safety services', to: '/services/smart-home-safety' },
    ],
    faqs: [
      {
        question: 'Is smart home safety the same as surveillance?',
        answer:
          'No. Smart safety can mean practical support such as lighting, reminders, water alerts and emergency reach. Cameras or intrusive monitoring should not be the default and any alert setup should be consented to and easy to understand.',
      },
      {
        question: 'What is the simplest connected setup?',
        answer:
          'A first setup often starts with night lighting, easy calls, reminders and selected alerts. The right mix depends on the person at home, the layout, Wi-Fi reliability and who can respond.',
      },
      {
        question: 'When is monitoring better than smart safety?',
        answer:
          'Monitoring may be worth considering when nobody can reliably respond to alerts, the person has repeated emergencies, or the household needs a formal response protocol rather than household support.',
      },
      {
        question: 'What should be avoided?',
        answer:
          'Avoid devices the person at home does not understand, alerts nobody responds to, hidden monitoring, cameras without clear consent, and systems that fail quietly when Wi-Fi or batteries stop working.',
      },
    ],
  },
]

export const allNeedLandingPages = [...needLandingPages, ...decisionGuidePages]

export function getNeedLandingPage(slug?: string) {
  return allNeedLandingPages.find((page) => page.slug === slug)
}
