export type ServiceIconId =
  | 'bath'
  | 'bedroom'
  | 'book'
  | 'check'
  | 'door'
  | 'home'
  | 'kitchen'
  | 'light'
  | 'shield'
  | 'smartphone'
  | 'stairs'

export type ServicePageContent = {
  id: string
  path: string
  title: string
  shortTitle: string
  description: string
  intro: string
  icon: ServiceIconId
  risks: string[]
  improvements: string[]
  ctaPlan: 'home-assessment' | 'home-safety' | 'smart-safety'
}

export type ResourcePageContent = {
  id: string
  path: string
  title: string
  description: string
  intro: string
  sections: Array<{
    title: string
    body: string
  }>
}

export type ServiceHubHighlight = {
  icon: ServiceIconId
  title: string
  body: string
}

export const primaryServices: ServicePageContent[] = [
  {
    id: 'bathroom-safety',
    path: '/services/bathroom-safety',
    title: 'Bathroom Safety for Seniors',
    shortTitle: 'Bathroom Safety',
    description:
      'Make bathrooms safer for older adults with grab bars, anti-slip surfaces, safer transfers, lighting, and accessibility improvements.',
    intro:
      'Bathrooms are one of the most important rooms to review because water, transfers, and limited support can quickly increase fall risk.',
    icon: 'bath',
    risks: ['Slippery wet floors', 'Low or difficult toilet transfers', 'Unsafe shower access'],
    improvements: ['Grab bars and support points', 'Anti-slip flooring and mats', 'Safer shower and toilet access'],
    ctaPlan: 'home-safety',
  },
  {
    id: 'stair-safety',
    path: '/services/stair-safety',
    title: 'Stair Safety and Handrails',
    shortTitle: 'Stair Safety',
    description:
      'Reduce stair and hallway risks with continuous handrails, better lighting, contrast strips, and safer movement routes.',
    intro:
      'Stairs and hallways should be easy to understand at a glance, with reliable support from the first step to the last.',
    icon: 'stairs',
    risks: ['Missing or interrupted handrails', 'Poor step contrast', 'Low lighting on landings'],
    improvements: ['Continuous handrail support', 'Step-edge visibility', 'Motion lighting and safer routes'],
    ctaPlan: 'home-safety',
  },
  {
    id: 'entrance-accessibility',
    path: '/services/entrance-accessibility',
    title: 'Entrance Accessibility Improvements',
    shortTitle: 'Safe Entrances',
    description:
      'Improve home entrances with safer thresholds, ramps where suitable, lighting, support points, and clearer access routes.',
    intro:
      'The entrance is where daily independence begins. Small changes can make arriving, leaving, and receiving visitors safer.',
    icon: 'door',
    risks: ['Raised thresholds', 'Poor exterior lighting', 'Limited support near the door'],
    improvements: ['Threshold and ramp guidance', 'Entrance lighting', 'Support points for balance'],
    ctaPlan: 'home-safety',
  },
  {
    id: 'kitchen-safety',
    path: '/services/kitchen-safety',
    title: 'Kitchen Safety for Aging in Place',
    shortTitle: 'Kitchen Safety',
    description:
      'Make kitchens easier and safer with better reach, clearer movement routes, lighting, storage changes, and appliance safety measures.',
    intro:
      'A safer kitchen keeps daily routines manageable by reducing unnecessary reaching, bending, clutter, and appliance risk.',
    icon: 'kitchen',
    risks: ['Hard-to-reach daily items', 'Cluttered movement routes', 'Poor task lighting'],
    improvements: ['Safer storage and reach', 'Clearer circulation', 'Lighting and appliance safeguards'],
    ctaPlan: 'home-safety',
  },
  {
    id: 'bedroom-safety',
    path: '/services/bedroom-safety',
    title: 'Bedroom Safety for Seniors',
    shortTitle: 'Bedroom Safety',
    description:
      'Make bedrooms safer for older adults with easier bed access, night lighting, clear walking routes, bedside support, and emergency reach points.',
    intro:
      'Bedrooms need to support safe rest and safe movement, especially at night when low light, fatigue, and urgent routines can increase fall risk.',
    icon: 'bedroom',
    risks: ['Difficulty getting in and out of bed', 'Dark night-time routes', 'Emergency help out of reach'],
    improvements: ['Bedside support and transfer aids', 'Motion night lighting', 'Clear routes and emergency reach points'],
    ctaPlan: 'home-safety',
  },
  {
    id: 'smart-home-safety',
    path: '/services/smart-home-safety',
    title: 'Connected Care and Smart Home Technology for Seniors',
    shortTitle: 'Connected Care',
    description:
      'Configure AI assistance, health and vitals monitoring, symptom check-ins, family dashboards, remote patient follow-up and smart-home integrations that help seniors enjoy life at home.',
    intro:
      'CasaMia designs and configures the connected layer around the person: simple voice support, useful readings, symptom context, missed-measurement visibility, family permissions and privacy-aware escalation rules.',
    icon: 'smartphone',
    risks: ['Technology feels fragmented', 'Families lack a clear view', 'Readings, symptoms and safety signals stay disconnected'],
    improvements: ['AI assistant and voice support', 'Vitals, symptoms and family dashboard', 'Remote follow-up and smart-home integration'],
    ctaPlan: 'smart-safety',
  },
]

export const resourcePages: ResourcePageContent[] = [
  {
    id: 'preventing-falls-at-home',
    path: '/blog/fall-prevention-home-checklist-spain',
    title: 'Preventing Falls at Home for Older Adults',
    description:
      'A practical guide for families who want to reduce fall risks at home with room-by-room prevention steps.',
    intro:
      'Fall prevention starts with noticing the small details that make daily movement harder: lighting, support, surfaces, furniture, and emergency access.',
    sections: [
      {
        title: 'Start with the rooms used every day',
        body:
          'Bathrooms, stairways, bedrooms, kitchens, and entrances should be reviewed first because these areas combine movement, transfers, lighting, and surfaces.',
      },
      {
        title: 'Prioritise support and visibility',
        body:
          'Handrails, grab bars, motion lighting, step contrast, and clearer walking routes can make a home easier to use without changing how it feels.',
      },
      {
        title: 'Get a professional review before works begin',
        body:
          'A structured assessment helps families decide which changes matter most, what can wait, and whether a practical installation plan is needed.',
      },
    ],
  },
  {
    id: 'bathroom-safety-for-seniors',
    path: '/blog/bathroom-safety-seniors-costly-mistakes',
    title: 'Bathroom Safety for Seniors: What Families Should Check',
    description:
      'Learn what to check in a senior bathroom, from wet floors and shower transfers to grab bars and anti-slip surfaces.',
    intro:
      'Bathrooms deserve special attention because slips, transfers, and limited support often happen in a small space.',
    sections: [
      {
        title: 'Look at transfers first',
        body:
          'Check whether the person can safely enter the shower, sit or stand, use the toilet, and reach towels or support without twisting.',
      },
      {
        title: 'Avoid improvised support',
        body:
          'Towel rails, sinks, and furniture are not designed to support body weight. Properly fixed grab bars are safer and more reliable.',
      },
      {
        title: 'Combine products with installation quality',
        body:
          'The right product only works if it is positioned and installed correctly for the person using the bathroom.',
      },
    ],
  },
  {
    id: 'home-adaptation-grants-spain',
    path: '/blog/home-adaptation-grants-spain-family-guide',
    title: 'Home Adaptation Grants in Spain',
    description:
      'Prepare a grant-ready file with the right authority, eligibility checks, documents, timing rules and official resources.',
    intro:
      'Spain has national accessibility frameworks, but families usually apply through regional or municipal calls. This guide shows what to verify before paying for works.',
    sections: [
      {
        title: 'Where to check first',
        body:
          'Start with the home address, then check the autonomous community, municipality, social services route and national subsidy database for open calls.',
      },
      {
        title: 'What families should prepare',
        body:
          'Useful documents may include ID, padrón, proof of ownership or permission, disability or dependency documents, photos, technical reports and itemised quotes.',
      },
      {
        title: 'How CasaMia helps',
        body:
          'CasaMia can help connect the safety need to practical works and organise a proposal. Approval, amount and payment timing remain with the authority.',
      },
    ],
  },
  {
    id: 'aging-in-place-spain',
    path: '/blog/fall-prevention-home-checklist-spain',
    title: 'Aging in Place in Spain: A Practical Family Guide',
    description:
      'A practical guide to helping older adults live safely and comfortably at home in Spain.',
    intro:
      'Aging in place works best when families combine prevention, practical home improvements, technology where useful, and clear support.',
    sections: [
      {
        title: 'Make the home easier before a crisis',
        body:
          'Prevention is calmer and more effective than waiting for a fall or urgent mobility change before adapting the home.',
      },
      {
        title: 'Use technology only where it helps',
        body:
          'Smart lighting, sensors, and alerts can support independence, but they should remain simple for the person living at home.',
      },
      {
        title: 'Create a phased plan',
        body:
          'Many homes do not need everything at once. A good assessment separates urgent safety changes from future improvements.',
      },
    ],
  },
]

export const serviceHubHighlights: ServiceHubHighlight[] = [
  {
    icon: 'shield',
    title: 'Room-by-room safety',
    body: 'We identify risks in the places seniors use every day.',
  },
  {
    icon: 'check',
    title: 'Practical improvements',
    body: 'Recommendations focus on changes families can understand and act on.',
  },
  {
    icon: 'light',
    title: 'Prevention first',
    body: 'The goal is to reduce avoidable risk before an accident happens.',
  },
  {
    icon: 'home',
    title: 'Aging in place',
    body: 'Every recommendation supports safer, more comfortable living at home.',
  },
  {
    icon: 'book',
    title: 'Clear next steps',
    body: 'Reports and proposals explain what to do now, later, or only if needed.',
  },
]
