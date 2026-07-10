export const providerPriorityCities = [
  'Madrid',
  'Barcelona',
  'Valencia',
  'Seville',
  'Malaga',
  'Alicante',
  'Bilbao',
  'Zaragoza',
  'Murcia',
  'Palma',
] as const

export const providerTrades = [
  'Accessibility adaptations',
  'Bathroom safety',
  'Stair rails and handrails',
  'Electrical and lighting',
  'Smart home and sensors',
  'General building works',
  'Occupational therapy assessment',
  'Maintenance and aftercare',
] as const

export const providerMarketSignals = [
  {
    value: 'Ageing homes',
    label: 'More families need practical adaptations that preserve independence at home.',
  },
  {
    value: 'Specialist gap',
    label: 'Many trades can install products, but fewer understand senior routines, dignity and fall-risk context.',
  },
  {
    value: 'City rollout',
    label: 'CasaMia is building reliable coverage city by city, starting where demand and logistics can scale.',
  },
] as const

export const providerExpertisePillars = [
  {
    title: 'Senior-first project design',
    body:
      'CasaMia looks at the resident, daily routines, mobility changes, family concerns and room-by-room risk before recommending work.',
  },
  {
    title: 'Practical safety, not product pushing',
    body:
      'Recommendations focus on transfers, thresholds, lighting, support points, bathroom use, night routes and safe handover.',
  },
  {
    title: 'Professional customer journey',
    body:
      'Providers work inside a structured flow: assessment, scoped plan, installation brief, acceptance record and aftercare notes.',
  },
  {
    title: 'Trust with families',
    body:
      'CasaMia remains the central point of contact so families know who is responsible and providers can focus on quality delivery.',
  },
] as const

export const providerEnablementResources = [
  {
    title: 'Structured project briefs',
    body:
      'Clear customer context, room priorities, photos where available, agreed scope, access notes and safety priorities before the visit.',
  },
  {
    title: 'Senior-safety playbooks',
    body:
      'Practical guidance for bathrooms, stairs, entrances, bedrooms, lighting, transfers and smart-safety handover.',
  },
  {
    title: 'Proposal and handover templates',
    body:
      'Reusable formats for scoped work, completion notes, product records, safety checks and customer instructions.',
  },
  {
    title: 'Quality feedback loop',
    body:
      'CasaMia captures family feedback, installation outcomes and follow-up notes so strong providers can keep improving.',
  },
  {
    title: 'Operational coordination',
    body:
      'Support with scheduling context, customer communication, change-order handling and aftercare expectations.',
  },
  {
    title: 'Training and onboarding',
    body:
      'Short onboarding modules help teams understand senior communication, no-pressure work, documentation and acceptance standards.',
  },
] as const

export const providerMarketingAssets = [
  {
    title: 'Approved collaborator seal',
    body:
      'A website and proposal badge for providers accepted into the CasaMia network after review.',
    format: 'SVG badge',
    usage: 'Website footer, quote documents, landing pages',
  },
  {
    title: 'Senior home-safety partner badge',
    body:
      'A softer online badge for partner profile pages and project galleries focused on senior-safe homes.',
    format: 'SVG badge',
    usage: 'Portfolio pages, before-and-after galleries, local service pages',
  },
  {
    title: 'Email signature block',
    body:
      'A short signature line that helps providers explain their CasaMia collaboration in everyday communication.',
    format: 'HTML signature',
    usage: 'Email signatures, invoice footers, customer follow-up',
  },
  {
    title: 'Social announcement copy',
    body:
      'Launch copy for LinkedIn, Facebook or Google Business Profile when a provider joins the programme.',
    format: 'Text snippet',
    usage: 'Social channels and local business profiles',
  },
  {
    title: 'Window and van sticker concept',
    body:
      'A simple decal concept providers can adapt for approved vehicles, offices or showrooms.',
    format: 'SVG concept',
    usage: 'Vehicle, office window, showroom counter',
  },
  {
    title: 'Website trust paragraph',
    body:
      'A paragraph providers can place on their site to explain how CasaMia projects are coordinated.',
    format: 'Text snippet',
    usage: 'About page, service pages, partner landing pages',
  },
] as const

export const providerMarketingRules = [
  'Use CasaMia partner materials only after written approval.',
  'Do not imply that the provider is owned by CasaMia or employed by CasaMia.',
  'Do not call yourself certified unless CasaMia has issued a separate certification programme.',
  'Do not imply public-authority endorsement or grant approval.',
  'Remove badges and signatures if the partnership ends or approval is paused.',
] as const

export const providerPartnerPaths = [
  {
    title: 'Accessibility installers',
    body: 'Grab rails, ramps, thresholds, support points and safer movement routes.',
  },
  {
    title: 'Bathroom specialists',
    body: 'Wet-room safety, shower entry, toilet support, transfer aids and slip reduction.',
  },
  {
    title: 'Electrical and lighting teams',
    body: 'Motion lighting, stair visibility, night routes, switches and safer access points.',
  },
  {
    title: 'Smart safety technicians',
    body: 'Sensors, alerts, emergency buttons, connectivity checks and family reassurance setup.',
  },
  {
    title: 'Occupational therapists',
    body: 'Resident-centred assessment, mobility context and practical adaptation priorities.',
  },
  {
    title: 'Aftercare providers',
    body: 'Maintenance, minor adjustments, handover support and follow-up visits.',
  },
] as const

export const providerCityOpportunities = [
  { city: 'Madrid', status: 'High priority', note: 'Large metro area and strong family decision-maker demand.' },
  { city: 'Barcelona', status: 'High priority', note: 'Dense urban homes, older buildings and broad service coverage needs.' },
  { city: 'Valencia', status: 'High priority', note: 'Major coastal city with accessibility and ageing-at-home opportunity.' },
  { city: 'Malaga', status: 'Building network', note: 'Growing senior and international-resident market along the coast.' },
  { city: 'Alicante', status: 'Building network', note: 'Strong coastal coverage potential and recurring adaptation needs.' },
  { city: 'Seville', status: 'Building network', note: 'Regional hub for home adaptation and practical safety services.' },
  { city: 'Bilbao', status: 'Opening soon', note: 'Priority northern coverage once partner depth is confirmed.' },
  { city: 'Zaragoza', status: 'Opening soon', note: 'Important connector city for wider regional rollout.' },
] as const

export const providerProgrammeBenefits = [
  {
    title: 'Qualified local demand',
    body:
      'CasaMia channels assessed home-safety projects to providers who can deliver respectfully, neatly and on schedule.',
  },
  {
    title: 'Clear scope before site visits',
    body:
      'Providers receive a structured brief, photos or assessment notes where available, and a defined customer expectation before work begins.',
  },
  {
    title: 'Central coordination',
    body:
      'CasaMia remains the customer point of contact, handles the project flow and reduces back-and-forth for the provider.',
  },
  {
    title: 'Recurring city coverage',
    body:
      'The programme is designed to build reliable coverage across Spain’s main cities and surrounding areas.',
  },
] as const

export const providerQualityStandards = [
  'Active professional registration or equivalent trading details.',
  'Insurance appropriate for the services offered.',
  'Respectful work inside homes occupied by older residents.',
  'Ability to provide clear availability, pricing inputs and completion notes.',
  'Willingness to follow CasaMia handover, safety and no-direct-payment rules.',
  'Commitment to document material defects or incomplete scope honestly.',
] as const

export const providerOnboardingSteps = [
  'Submit basic company and service details online.',
  'CasaMia reviews city coverage, trade fit, insurance and references.',
  'Short onboarding call to explain customer handling and project standards.',
  'Approved providers receive suitable project opportunities when coverage matches.',
] as const
