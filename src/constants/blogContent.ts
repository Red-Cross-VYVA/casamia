export type BlogArticle = {
  id: string
  path: string
  title: string
  description: string
  category: string
  readTime: string
  date: string
  image: string
  imageAlt: string
  keywords: string[]
  intro: string
  takeaways: string[]
  sections: Array<{
    title: string
    body: string[]
  }>
  checklist: string[]
  faqs: Array<{
    question: string
    answer: string
  }>
  resources?: Array<{
    title: string
    description: string
    href: string
    source: string
  }>
  cta: {
    label: string
    to: string
  }
}

export const blogArticles: BlogArticle[] = [
  {
    id: 'fall-prevention-home-checklist-spain',
    path: '/blog/fall-prevention-home-checklist-spain',
    title: 'Fall Prevention at Home: A Practical Checklist for Spain',
    description:
      'A practical fall prevention checklist for making daily movement safer at home, with room-by-room checks, warning signs and credible resources.',
    category: 'Fall prevention',
    readTime: '10 min read',
    date: '2026-08-10',
    image: '/images/blog/fall-prevention-checklist.webp',
    imageAlt: 'Illustrated home safety checklist for fall prevention',
    keywords: ['fall prevention at home', 'senior home safety Spain', 'aging in place checklist'],
    intro:
      'Most falls are not caused by one single problem. Risk builds when health changes, medication, vision, footwear, lighting, floors, furniture and rushed routines all meet in the same moment. A good home checklist helps spot those combinations before a fall happens.',
    takeaways: [
      'Walk the home by routine: getting up, washing, dressing, cooking, leaving the home and going to the bathroom at night.',
      'Prioritise loose rugs, poor lighting, unsupported transfers, stairs, bathroom access and emergency reach.',
      'Treat a recent fall, near fall, new dizziness, medication change or hospital stay as a reason to review the home quickly.',
      'Combine home changes with health checks; eyesight, footwear, strength, balance and medication review matter too.',
    ],
    sections: [
      {
        title: 'Start with the moments where falls actually happen',
        body: [
          'Walk through the day with the person at home: standing from bed, reaching the bathroom, entering the shower, preparing food, carrying laundry, answering the door and getting up at night. Note where they pause, rush, hold furniture or avoid a space.',
          'Those details matter more than a generic shopping list. A grab bar, rail, motion light, threshold change or furniture move only helps when it supports the movement the person is already trying to make.',
        ],
      },
      {
        title: 'Remove trip hazards, but do not stop there',
        body: [
          'Loose rugs, curling mats, cables, cluttered walking space and unstable furniture should be fixed immediately. But the bigger pattern matters too: no support where the person transfers, light switches too far away, shoes that slip, or a bathroom trip that becomes risky at night.',
          'A useful review sequence is bathroom, bedroom-to-bathroom movement, stairs, entrance, kitchen and living areas. This keeps the review focused on daily risk rather than trying to redesign every room at once.',
        ],
      },
      {
        title: 'Separate urgent fixes from planned adaptations',
        body: [
          'Urgent fixes are the issues most likely to cause harm this week: a wet transfer with no support, a dark stair, a high threshold used daily, an unstable toilet transfer, or a phone left out of reach. Planned adaptations are still important, but may need measuring, quotes, landlord or community permission, or grant checks.',
          'CasaMia assessments separate those decisions: what to remove today, what to adapt first, what needs measuring or a priced plan, and what can be watched over time.',
        ],
      },
      {
        title: 'Connect the home review with health and daily support',
        body: [
          'A home can be made safer, but falls prevention is not only construction. Ask whether the person has new dizziness, pain, vision changes, foot problems, medication changes, urinary urgency, confusion, weakness or fear of falling. Those signals may need a clinician, physiotherapist, pharmacist or optician alongside home changes.',
          'A strong action plan names who will handle each part: open walking space, install support, organise lighting, review medication questions with a professional, test emergency reach and check back after the first changes are in place.',
        ],
      },
    ],
    checklist: [
      'Walk through every daily movement and mark where the person reaches for walls, furniture or doorframes.',
      'Remove or fix loose rugs, curled mats, cables, low furniture and clutter from walking space.',
      'Check that bed, toilet and favourite chair heights allow the person to stand without pulling unstable furniture.',
      'Make the path from bed to bathroom visible at night without glare.',
      'Confirm stairs, steps and thresholds have stable support where the person actually needs it.',
      'Review bathroom transfers, wet surfaces, towel reach and shower entry together.',
      'Keep phone, emergency button or agreed help method reachable from bed and bathroom.',
      'Ask a health professional about dizziness, medication changes, vision, foot pain or repeated near falls.',
    ],
    resources: [
      {
        title: 'Check for Safety fall prevention checklist',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'A room-by-room home safety checklist covering floors, stairs, kitchen, bathroom and bedroom.',
      },
      {
        title: 'Prevent falls and fractures',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/falls-and-falls-prevention/prevent-falls-and-fractures',
        description:
          'Clear health guidance on fall risks, exercise, vision, medicine review and home changes to combine with home adaptation.',
      },
      {
        title: 'Preventing falls at home',
        source: 'MedlinePlus',
        href: 'https://medlineplus.gov/ency/patientinstructions/000052.htm',
        description:
          'Patient-friendly guidance on reducing fall risk at home, including bathroom, stairs, lighting, footwear and daily movement.',
      },
    ],
    faqs: [
      {
        question: 'What is the first thing to fix to reduce fall risk at home?',
        answer:
          'Start with the movement that is both frequent and already unsafe. For many homes that is bathroom use, stairs, the entrance, or getting from bed to toilet at night.',
      },
      {
        question: 'Does every bathroom need grab bars?',
        answer:
          'No. Grab bars help when they are needed, positioned correctly, and fixed to suitable surfaces. A review should consider mobility, transfers, wall type and daily habits.',
      },
      {
        question: 'When should you ask for professional help?',
        answer:
          'Ask for help when there has been a fall or near fall, the person is changing how they move, multiple rooms are involved, or it is unclear which works should happen first.',
      },
    ],
    cta: {
      label: 'Book a home safety assessment',
      to: '/home-safety-assessment',
    },
  },
  {
    id: 'bathroom-safety-seniors-costly-mistakes',
    path: '/blog/bathroom-safety-seniors-costly-mistakes',
    title: 'Bathroom Safety: 7 Mistakes to Avoid',
    description:
      'Avoid common bathroom safety mistakes, from unsafe supports to shower entry, toilet transfers, wet floors and water controls.',
    category: 'Bathroom safety',
    readTime: '9 min read',
    date: '2026-08-10',
    image: '/images/blog/bathroom-mistakes.webp',
    imageAlt: 'Illustration of bathroom safety mistakes to avoid',
    keywords: ['bathroom safety for seniors', 'grab bars Spain', 'accessible bathroom older adults'],
    intro:
      'Bathrooms combine water, hard surfaces, urgency, small spaces and transfers. A quick purchase can hide the real issue: the person may still need to step, twist, reach or stand without the right support.',
    takeaways: [
      'Plan the movement, not just the product: entering, washing, turning, drying, toileting and leaving.',
      'Avoid towel rails, suction handles and furniture as body-weight support.',
      'Review shower entry, toilet transfers, floor grip, lighting, water controls and emergency reach together.',
      'Installation quality and placement matter as much as the equipment selected.',
    ],
    sections: [
      {
        title: 'Mistake 1: Treating every support as safe support',
        body: [
          'Towel rails, sink edges, shower screens and suction handles are often used like handrails, but they are not reliable body-weight support. If the person trusts the wrong object, the risk can increase rather than decrease.',
          'A grab bar only helps when it is in the right position for the movement being supported. Shower entry, standing from the toilet, turning near the sink and drying after a shower can require different support points.',
        ],
      },
      {
        title: 'Mistake 2: Fixing the shower seat but ignoring the entry',
        body: [
          'A shower stool or folding seat can help, but it does not solve a high bath edge, narrow door or slippery entry. If the person still has to lift a foot over an edge while wet, tired or unsupported, the main risk remains.',
          'A safer plan considers entry height, anti-slip surface, seating, hand-held shower reach, drainage, screen or curtain clearance, towel reach and where a helper can stand if assistance is needed.',
        ],
      },
      {
        title: 'Mistake 3: Forgetting toilet transfers and night use',
        body: [
          'Many falls are linked to urgency, fatigue or getting to the bathroom at night. The toilet area needs enough space, stable side support where useful, reachable paper, good light and a path that does not require turning sharply around clutter.',
          'Check how the person reaches the bathroom from bed, whether they use a walking aid, whether the door opens safely, and whether emergency help is reachable if they sit or fall.',
        ],
      },
      {
        title: 'Mistake 4: Mixing hot water risk with reach problems',
        body: [
          'Water controls can be difficult when grip, vision or reaction speed changes. If the person cannot easily set temperature, reach a hand shower, or turn water off while seated, the bathroom may still feel unsafe even after bars are installed.',
          'Thermostatic controls, visible handles, reachable storage and a hand-held shower can reduce strain, but they should be matched to the existing plumbing, wall surfaces and user habits.',
        ],
      },
    ],
    checklist: [
      'If the person is comfortable being observed, watch how they enter, wash, turn, dry, use the toilet and leave.',
      'Remove or replace loose bath mats and any object that slides when wet.',
      'Confirm the shower or bath entry has support before, during and after the step or transfer.',
      'Check whether toilet height and side support allow sit-to-stand without pulling a towel rail or sink.',
      'Make water controls, soap, towels and clothing reachable without twisting or bending.',
      'Add low-glare night lighting from bedroom to bathroom and inside the bathroom.',
      'Keep an emergency call option reachable from the bathroom.',
      'Plan where a helper can stand without blocking movement or slipping.',
    ],
    resources: [
      {
        title: 'Check for Safety bathroom checklist',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'Includes specific bathroom prompts on mats, shower floors, grab bars and getting in and out of the tub or shower.',
      },
      {
        title: 'Preventing falls at home',
        source: 'MedlinePlus',
        href: 'https://medlineplus.gov/ency/patientinstructions/000052.htm',
        description:
          'Plain-language advice on bathroom, bedroom, footwear, stairs and lighting changes that reduce everyday fall risk.',
      },
      {
        title: 'Assistive products catalogue',
        source: 'CEAPAT / Imserso',
        href: 'https://ceapat.imserso.es/catalogo-productos-apoyo',
        description:
          'Spanish public catalogue for comparing support products such as bathing aids, toilet aids, rails and mobility supports.',
      },
    ],
    faqs: [
      {
        question: 'Are suction grab bars safe?',
        answer:
          'They should not be used as primary body-weight support. If balance or transfers depend on the support, use professionally fixed bars or other appropriate equipment.',
      },
      {
        question: 'Is a walk-in shower always the right first option?',
        answer:
          'Not always. It depends on mobility, bathroom layout, drainage, budget, and urgency. Sometimes immediate support and anti-slip changes come first.',
      },
      {
        question: 'Should the bathroom door open outwards?',
        answer:
          'It can help in some layouts because a fall behind an inward-opening door may block access. The right answer depends on the door, hallway, privacy needs and whether a safer alternative is possible.',
      },
    ],
    cta: {
      label: 'See bathroom safety services',
      to: '/services/bathroom-safety',
    },
  },
  {
    id: 'home-adaptation-grants-spain-family-guide',
    path: '/blog/home-adaptation-grants-spain-family-guide',
    title: 'Home Adaptation Grants in Spain: How to Prepare the File',
    description:
      'How people in Spain can prepare for accessibility and home adaptation grants, with eligibility checks, document lists, timing risks and official resources.',
    category: 'Grants and funding',
    readTime: '11 min read',
    date: '2026-08-10',
    image: '/images/solutions/euro-grant-support-retouched.jpg',
    imageAlt: 'Euro symbol representing public grant support for home adaptations',
    keywords: [
      'home adaptation grants Spain',
      'Plan Estatal de Vivienda 2026 2030',
      'Plan Adapta Madrid',
      'accessibility grants Spain',
    ],
    intro:
      'Spain does not have one single grant that every household applies for in the same way. National housing plans set a framework, but the real application usually happens through your autonomous community, city council, housing office or social services team. The safest approach is to prepare the home evidence first, then match it to the open call.',
    takeaways: [
      'Check the live call for the exact home address; rules change by autonomous community and municipality.',
      'Prepare a clear safety need, photos, certificates, permissions and itemised quotes before a deadline appears.',
      'Do not start paid works until the call confirms whether prior works are allowed.',
      'No company can guarantee approval; the public authority decides eligibility, grant amount and payment timing.',
    ],
    sections: [
      {
        title: 'Start with the right authority, not a generic promise',
        body: [
          'The first question is not "how much can we get?" but "which authority covers this address and this type of work?" A home in Madrid city may have a municipal Plan Adapta route. A home in Girona, Tarragona, Lleida or Terres de l\'Ebre may fall under an Agència de l\'Habitatge de Catalunya call. Other areas may use autonomous-community rehabilitation grants, municipal social services, disability support, dependency support or building-accessibility programmes.',
          'Use the national subsidy database to search open calls, then confirm details with the local housing office or social services. If the home is in a building with shared entrances, stairs, lifts or portals, the community of owners and building administrator may also need to be involved.',
        ],
      },
      {
        title: 'Know what the national framework can support',
        body: [
          'The Plan Estatal de Vivienda 2026-2030 includes accessibility works such as ramps, lifts, stair lifts, accessible routes, communication and alarm systems, domotics that support personal autonomy, and interventions that improve safety of use and accessibility. The BOE framework sets maximum amounts and percentages, but access is through public calls from autonomous communities and Ceuta or Melilla.',
          'That distinction matters. A headline maximum is not the same as an approved grant for one home. Each call can restrict who may apply, which homes qualify, what income thresholds apply, whether the person must be over 65 or have a recognised disability, whether quotes must be submitted before works start, and how payment is made.',
        ],
      },
      {
        title: 'Translate the home problem into eligible works',
        body: [
          'Applications are stronger when the proposed works are connected to a concrete daily risk: unsafe shower entry, wet transfers, high thresholds, lack of hand support, poor night lighting, narrow doorways, difficult kitchen reach, or a passage that cannot be used with a walker or wheelchair.',
          'Avoid vague language such as "modernise the bathroom". Use specific wording: replace bathtub with accessible shower, lower a threshold, add fixed support bars, improve non-slip flooring, widen a passage, add motion lighting, install an accessible intercom, or adapt a kitchen so the person can prepare food safely.',
        ],
      },
      {
        title: 'Build the file before the call forces a rush',
        body: [
          'Most grant files need a mix of personal documents, home documents and technical evidence. Start with DNI/NIE, padrón or proof of habitual residence, ownership or rental permission, disability or dependency certificates where relevant, income or household documents if required, photos of the existing risk, and a clear itemised quote.',
          'Ask each programme whether it needs a technical report, architect or technician visit, licence or declaración responsable, community-of-owners agreement, landlord authorisation, registered invoices, bank proof of payment, or justification documents after the works. Keep every quote, photo, invoice and approval in one folder.',
        ],
      },
      {
        title: 'Watch timing, cash flow and reimbursement rules',
        body: [
          'Some calls are first-come-first-served, some are competitive, some close when funds run out and some reimburse only after the work has been paid and justified. Others require approval or inspection before work begins. For example, Catalonia\'s 2026 interior-arrangement call says works must not have started before the call publication or before the technical inspection by the housing agency.',
          'Before signing or paying, confirm three things in writing: whether the works may start now, whether the quote format is acceptable, and when money is expected to be paid. This avoids assuming a grant will arrive before cash is needed.',
        ],
      },
      {
        title: 'If the problem is in a shared building area',
        body: [
          'Lifts, entrance ramps, portal doors, stair routes and other common elements can involve the community of owners. Spain\'s Horizontal Property Law includes rules for necessary accessibility works and reasonable adjustments, especially when residents with disability or people over 70 are involved, but the practical process still depends on the building, budget and administrator.',
          'For these cases, prepare a short note for the administrator: the daily need, the affected route, photos, the proposed works, whether a grant call exists, and what decision the community must take. Good paperwork reduces friction before a community meeting.',
        ],
      },
    ],
    checklist: [
      'Confirm the municipality, autonomous community and whether the home is owner-occupied, rented or in a community building.',
      'Search the national subsidy database and the local housing/social-services pages for open calls.',
      'Check eligibility: age, disability, dependency, income, habitual residence, ownership or rental permission.',
      'Photograph the current barriers: bathroom, entrance, stairs, thresholds, kitchen reach, night-time movement and shared access.',
      'Prepare itemised quotes that separate accessibility/safety works from cosmetic renovation.',
      'Ask whether works can start before approval, inspection or publication of the call.',
      'Collect certificates, padrón, bank details, community/landlord permissions and technical reports where required.',
      'Keep invoices, payment proof and final photos for the justification stage.',
    ],
    resources: [
      {
        title: 'Plan Estatal de Vivienda 2026-2030',
        source: 'BOE',
        href: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8872',
        description:
          'National framework for housing and accessibility aid. Use it to understand eligible accessibility works, ceilings and the fact that access is through autonomous-community calls.',
      },
      {
        title: 'National subsidy call finder',
        source: 'Sistema Nacional de Publicidad de Subvenciones',
        href: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias',
        description:
          'Official database for searching public grant calls. Search by municipality, autonomous community, accessibility, housing rehabilitation or disability terms.',
      },
      {
        title: 'Plan Adapta Madrid 2026',
        source: 'Ayuntamiento de Madrid',
        href: 'https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=2a8ca38813180210VgnVCM100000c90da8c0RCRD&vgnextfmt=default&vgnextoid=3bfbfc190117d910VgnVCM200000f921e388RCRD',
        description:
          'Madrid city example covering home, building and premises accessibility lines. The 2026 submission window has closed, but the page is useful for documents, lines and future calls.',
      },
      {
        title: 'Catalonia interior works for older people',
        source: 'Agència de l’Habitatge de Catalunya',
        href: 'https://habitatge.gencat.cat/ca/ajuts/ajuts-rehabilitacio/interior-persones-grans/',
        description:
          'Active 2026 example for interior arrangements in homes with residents aged 65 or more in Girona, Tarragona, Lleida and Terres de l’Ebre.',
      },
      {
        title: 'Assistive products catalogue',
        source: 'CEAPAT / Imserso',
        href: 'https://ceapat.imserso.es/catalogo-productos-apoyo',
        description:
          'Public catalogue for support products available in Spain. Helpful when comparing aids, but still match products to the person and home layout.',
      },
      {
        title: 'Horizontal Property Law',
        source: 'BOE',
        href: 'https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906',
        description:
          'Useful when accessibility works affect common areas such as entrances, lifts, ramps, stairs or shared building routes.',
      },
    ],
    faqs: [
      {
        question: 'Which grant should you check first?',
        answer:
          'Start with the home address. Check the autonomous community, city council and social-services routes for that municipality, then compare the open call with the person’s situation and the works needed.',
      },
      {
        question: 'Can CasaMia guarantee a home adaptation grant?',
        answer:
          'No. CasaMia can help define the safety need, prepare evidence and organise grant-ready quote information, but the public authority decides eligibility, approval, amount and payment.',
      },
      {
        question: 'Should work start before applying?',
        answer:
          'Only after checking the specific call. Some programmes reject works started too early or require a prior inspection. If there is an urgent safety risk, separate the immediate safety decision from the grant decision.',
      },
      {
        question: 'Can renters apply for adaptation grants?',
        answer:
          'Sometimes, but the call may require owner consent, proof of habitual residence and a clear right to carry out the works. Renters should confirm the rule before paying for plans or installation.',
      },
      {
        question: 'Are cosmetic renovations covered?',
        answer:
          'Usually the eligible part is the accessibility, safety or autonomy improvement, not a general aesthetic renovation. Keep itemised quotes so eligible works are separated from optional finishes.',
      },
    ],
    cta: {
      label: 'Check grant readiness',
      to: '/grant-check',
    },
  },
  {
    id: 'smart-home-safety-without-overcomplicating',
    path: '/blog/smart-home-safety-without-overcomplicating',
    title: 'Smart Home Safety Without Making the Home Complicated',
    description:
      'How smart lighting, sensors, emergency alerts and agreed routines can reduce specific home risks without overwhelming the home.',
    category: 'Smart safety',
    readTime: '6 min read',
    date: '2026-07-11',
    image: '/images/blog/smart-safety-simple.webp',
    imageAlt: 'Illustration of smart home safety support',
    keywords: ['smart home safety seniors', 'elderly emergency alerts', 'aging in place technology'],
    intro:
      'Smart safety works when it fits daily life. The aim is not to turn the home into a gadget showroom, but to add support where it reduces a named risk or gives agreed contacts usable information.',
    takeaways: [
      'Start with named risks: night lighting, emergency reach, leak detection or smoke alerts.',
      'Avoid cameras by default unless there is a clear, consent-based reason.',
      'Testing and clear explanation are essential so the person using the setup trusts it.',
    ],
    sections: [
      {
        title: 'Choose technology for a specific risk',
        body: [
          'Motion lighting can reduce night-time hesitation. Door alerts can support agreed routines. Emergency buttons can put help within reach. Sensors can detect hidden water or smoke risks.',
          'Each device should answer a clear question: what risk does this reduce, and who responds if it triggers?',
        ],
      },
      {
        title: 'Design around the person, not the app',
        body: [
          'The person at home should not need to manage complex settings or remember new steps during a stressful moment. Dashboards are useful only when the daily experience remains understandable.',
          'Good setup includes testing, labels, household training, and agreement on who receives alerts.',
        ],
      },
      {
        title: 'Combine smart support with physical safety',
        body: [
          'Technology cannot replace a stable handrail, safer shower access, or open walking space. The strongest plans combine physical adaptations with smart support where it adds value.',
          'We review both the home environment and the support routine before recommending smart safety options.',
        ],
      },
    ],
    checklist: [
      'Identify the risk before choosing a device.',
      'Confirm Wi-Fi, power, and signal reliability.',
      'Decide who receives alerts and what they should do.',
      'Avoid intrusive monitoring unless consent and need are clear.',
      'Test the system with the person present.',
    ],
    faqs: [
      {
        question: 'What smart safety device is best to start with?',
        answer:
          'For many homes, motion lighting and an emergency contact option are useful first checks. The right choice depends on daily routine and risk points.',
      },
      {
        question: 'Are cameras needed for home safety?',
        answer:
          'Usually no. Cameras should not be the default. Less intrusive options such as lighting, sensors, and agreed alerts are often more respectful and targeted.',
      },
    ],
    cta: {
      label: 'Explore smart safety',
      to: '/tech',
    },
  },
  {
    id: 'choose-home-safety-provider-spain',
    path: '/blog/choose-home-safety-provider-spain',
    title: 'How to Choose Home Safety Help in Spain',
    description:
      'What to check before choosing home safety help, from the first review to fitting quality and follow-up.',
    category: 'Choosing help',
    readTime: '7 min read',
    date: '2026-07-11',
    image: '/images/blog/provider-choice.webp',
    imageAlt: 'Illustration of a trusted home safety checklist',
    keywords: ['home safety provider Spain', 'senior home adaptation service', 'aging in place provider'],
    intro:
      'Choosing help for home safety is not just buying equipment. The right service should understand the person, the daily routine, the home, the fitting details and what support is needed after installation.',
    takeaways: [
      'Expect a safety review before product recommendations.',
      'Ask for a clear written plan with urgent, recommended and optional steps separated.',
      'Make sure fitting, handover and follow-up are included.',
    ],
    sections: [
      {
        title: 'Assessment should come before recommendations',
        body: [
          'A trustworthy service asks about the person at home, mobility, recent falls, daily routines, approved helpers, and main concerns before recommending products.',
          'If the conversation jumps straight to equipment, the recommendation may miss the real risk.',
        ],
      },
      {
        title: 'The written plan should separate what is included and what still needs a decision',
        body: [
          'You should receive a clear explanation of what is included, why it matters, what is optional, what depends on measurements or site conditions, and what happens next.',
          'This protects both the person at home and the budget, especially when more than one room or trade is involved.',
        ],
      },
      {
        title: 'Fitting and follow-up matter',
        body: [
          'Home safety work often involves different trades: accessibility installers, bathroom specialists, electricians, smart safety technicians, and sometimes therapists.',
          'A good service checks the finished work in the real room, explains how to use it safely, and remains available if something needs adjustment.',
        ],
      },
    ],
    checklist: [
      'Do they assess the daily routine and not just the room?',
      'Do they explain urgent, recommended, and optional works separately?',
      'Can they bring in the right local professional when needed?',
      'Do they provide a written plan, approval steps, and follow-up details?',
      'Do they avoid promising grant approval or unrealistic outcomes?',
    ],
    faqs: [
      {
        question: 'Should you hire one installer directly or use a guided service?',
        answer:
          'For one defined job, one installer may be enough. For room-by-room safety, grant paperwork, several trades, or several decision-makers, a guided service can reduce confusion.',
      },
      {
        question: 'What makes CasaMia different from a product shop?',
        answer:
          'CasaMia starts with a safety review, prioritises daily routines, brings in the right local professional when needed, and supports the process through fitting, checks and safe-use explanation.',
      },
    ],
    cta: {
      label: 'Why choose CasaMia',
      to: '/why-us',
    },
  },
  {
    id: 'family-conversation-before-home-safety-visit',
    path: '/blog/family-conversation-before-home-safety-visit',
    title: 'Before a Home Safety Visit: Questions to Agree First',
    description:
      'A home-safety conversation guide before booking an assessment, with prompts for mobility, routines, preferences, budget, grants and decision-making.',
    category: 'Planning',
    readTime: '6 min read',
    date: '2026-07-24',
    image: '/images/blog/provider-choice.webp',
    imageAlt: 'Planning checklist for a home safety conversation',
    keywords: [
      'senior home safety assessment questions',
      'aging parents family conversation',
      'prepare for home safety visit',
    ],
    intro:
      'People often know something needs to change, but not everyone names the same worry. A short conversation before a visit helps CasaMia understand the person, the home, and the decision that needs to be made.',
    takeaways: [
      'Agree the daily moments that feel hardest before discussing products.',
      'Separate urgent safety needs from preferences, future planning and work that can wait.',
      'Decide who must be involved in pricing, grant paperwork, and final approval.',
    ],
    sections: [
      {
        title: 'Start with the person, not the room',
        body: [
          'Ask what has changed recently: a fall, near miss, hospital stay, new medication, fatigue, fear of bathing, night-time bathroom trips, or hesitation leaving the home.',
          'The same bathroom, bedroom, or staircase can mean very different things depending on strength, balance, memory, vision, pain, and whether the person lives alone.',
        ],
      },
      {
        title: 'Name the routines that create stress',
        body: [
          'Instead of saying “the bathroom is unsafe”, describe the exact moment: stepping into the shower, standing from the toilet, drying after bathing, walking to the bathroom at night, carrying laundry, or opening the front door.',
          'This turns a broad concern into a usable brief. CasaMia can then prioritise safer transfers, visible walking space, lighting, support points, emergency help, or a professional visit where needed.',
        ],
      },
      {
        title: 'Agree what must stay familiar',
        body: [
          'Safety should not make the home feel clinical. Talk about what matters personally: privacy, preferred routines, favourite furniture, the look of the bathroom, or whether visible equipment would be upsetting.',
          'A good plan protects consent and daily movement. Sometimes the right improvement is the one the person will actually accept and use every day.',
        ],
      },
      {
        title: 'Clarify decision roles and next steps',
        body: [
          'Before the assessment, decide who receives the report, who discusses budget, who can approve work, and whether grant support should be explored.',
          'You do not need every answer immediately. The useful outcome is a shared starting point: what worries us most, what we want to preserve, and what decision we need CasaMia to help us make next.',
        ],
      },
    ],
    checklist: [
      'What changed recently that made the home feel less safe?',
      'Which routine creates the most worry this week?',
      'Which rooms, walking spaces, or transfers should be reviewed first?',
      'What should remain discreet, familiar, or unchanged if possible?',
      'Who needs to receive the report and approve next steps?',
      'Should CasaMia check grant readiness or organise a visit?',
    ],
    faqs: [
      {
        question: 'Should the person living at home be part of the safety conversation?',
        answer:
          'Yes, wherever possible. The person living in the home should help explain what feels difficult, what they would accept, and what routines matter most. Input from relatives or helpers is useful, but consent still matters.',
      },
      {
        question: 'Do we need to know the exact products before requesting a visit?',
        answer:
          'No. It is better to describe the daily problem and the outcome you want. CasaMia can then translate that into suitable physical improvements, connected support, optional works, or a clear plan.',
      },
    ],
    cta: {
      label: 'Start the guided review',
      to: '/tools/senior-friendly-home-check',
    },
  },
  {
    id: 'dementia-friendly-home-safety',
    path: '/blog/dementia-friendly-home-safety',
    title: 'Dementia-Friendly Home Safety: Changes That Reduce Confusion',
    description:
      'Dementia-friendly home safety ideas, including lighting, visual cues, safer routines, exits, bathrooms, and trusted-contact alerts.',
    category: 'Memory support',
    readTime: '7 min read',
    date: '2026-07-11',
    image: '/images/blog/dementia-friendly-home.webp',
    imageAlt: 'Editorial illustration of a calm dementia-friendly home layout',
    keywords: ['dementia home safety', 'memory friendly home', 'senior safety dementia'],
    intro:
      'When memory or confusion becomes part of daily life, home safety needs to do more than prevent falls. The home should make key spaces, objects and responses easier to recognise for the person living there.',
    takeaways: [
      'Use visible lighting, contrast, labels, and uncluttered walking space.',
      'Reduce confusing hazards around bathrooms, kitchens, exits, and night routines.',
      'Agree trusted-contact alerts and support routines without making the person at home feel watched.',
    ],
    sections: [
      {
        title: 'Make important spaces obvious',
        body: [
          'A dementia-friendly home should make the next step easier to recognise. Bathroom, bedroom, kitchen, and front-door access should be visible, well lit, and free from visual clutter.',
          'Contrast can help: a visible toilet seat, clear door markings, direct labels, and lighting that removes shadows can reduce hesitation.',
        ],
      },
      {
        title: 'Reduce hidden risk in familiar routines',
        body: [
          'Confusion often appears during ordinary tasks: cooking, bathing, taking medication, opening doors, or waking at night. Review these routines before buying products.',
          'Useful changes can include automatic night lights, safer appliance habits, removing trip hazards, and placing important items where they are visible.',
        ],
      },
      {
        title: 'Balance safety, consent and privacy',
        body: [
          'Alerts, door awareness, or emergency support may be useful, but the least intrusive option should come first. The person at home should stay involved wherever possible.',
          'A good plan protects privacy, reduces stress, and gives approved helpers a defined response routine.',
        ],
      },
    ],
    checklist: [
      'Are bathroom and bedroom spaces recognisable at night?',
      'Are mirrors, shadows, or dark corners causing confusion?',
      'Can cooking routines stay familiar while reducing reach, heat, slip and appliance risks?',
      'Can agreed contacts respond if the person leaves unexpectedly?',
      'Are labels, colours, and lighting consistent across the home?',
    ],
    faqs: [
      {
        question: 'Should dementia home safety include cameras?',
        answer:
          'Usually not as a first step. Consider less intrusive options first, such as lighting, door alerts, agreed check-ins, and emergency call support.',
      },
      {
        question: 'What dementia-friendly home improvement should come first?',
        answer:
          'Visible night lighting and uncluttered walking space are often strong first improvements because they support daily movement without requiring the person to learn something new.',
      },
    ],
    cta: {
      label: 'Book a home safety assessment',
      to: '/home-safety-assessment',
    },
  },
  {
    id: 'stair-safety-handrails-older-adults',
    path: '/blog/stair-safety-handrails-older-adults',
    title: 'Stair Safety: Handrails, Lighting, and Step Contrast',
    description:
      'How to improve stair safety with continuous handrails, better lighting, visible step edges, and safer routines.',
    category: 'Stair safety',
    readTime: '6 min read',
    date: '2026-07-11',
    image: '/images/blog/stair-safety-handrails.webp',
    imageAlt: 'Editorial illustration of safer stairs with clear rail and step rhythm',
    keywords: ['stair safety seniors', 'handrails older adults', 'stair fall prevention'],
    intro:
      'Stairs become safer when support, visibility and step rhythm work together. A single handrail may help, but the full stair movement needs to be reviewed from first step to landing.',
    takeaways: [
      'Continuous handrails matter more than decorative rails.',
      'Lighting and step contrast help the brain read each step clearly.',
      'Landings, turns, and the first and last steps deserve special attention.',
    ],
    sections: [
      {
        title: 'Look for interruptions in support',
        body: [
          'Many staircases have rails that stop too early, start too late, or disappear at a turn. These gaps are exactly where someone may reach for a wall or furniture.',
          'Safer stairs give reliable support before the first step and after the last step, with special care at landings.',
        ],
      },
      {
        title: 'Improve how each step is seen',
        body: [
          'Poor lighting, shiny surfaces, patterned flooring, and low contrast can make steps harder to judge, especially when vision, confidence or energy has changed.',
          'Motion lighting, step-edge contrast, and reducing glare can make the staircase easier to understand at a glance.',
        ],
      },
      {
        title: 'Plan around daily use',
        body: [
          'Ask when the stairs are used, whether the person carries laundry or shopping, whether they pause halfway, and whether they avoid the stairs when tired.',
          'The recommendation may include rails, lighting, contrast, storage changes, or changing routines.',
        ],
      },
    ],
    checklist: [
      'Is there reliable support before the first step and after the last?',
      'Are landings and turns clearly lit?',
      'Can the person see each step edge?',
      'Are objects stored on or near the stairs?',
      'Does the person carry items that block one hand from using the rail?',
    ],
    faqs: [
      {
        question: 'Is one handrail enough?',
        answer:
          'Sometimes, but not always. It depends on the staircase, mobility, direction of travel, turns, and whether two-sided support is needed.',
      },
      {
        question: 'Do stair treads help prevent falls?',
        answer:
          'They can help when correctly selected and installed, but loose or poorly fitted treads can become hazards. Lighting and handrail support should also be reviewed.',
      },
    ],
    cta: {
      label: 'See stair safety services',
      to: '/services/stair-safety',
    },
  },
  {
    id: 'kitchen-safety-aging-in-place',
    path: '/blog/kitchen-safety-aging-in-place',
    title: 'Kitchen Safety: Reduce Reaching, Bending, and Appliance Risk',
    description:
      'A kitchen safety guide covering storage, lighting, walking space, appliances, seating, and support routines.',
    category: 'Kitchen safety',
    readTime: '6 min read',
    date: '2026-07-11',
    image: '/images/blog/kitchen-safety-aging.webp',
    imageAlt: 'Editorial illustration of a safer kitchen workflow',
    keywords: ['kitchen safety seniors', 'aging in place kitchen', 'safe kitchen older adults'],
    intro:
      'The kitchen is not just a room; it is a sequence of movements. Safer kitchens reduce unnecessary reaching, bending, carrying, turning, and rushing around hot surfaces or sharp tools.',
    takeaways: [
      'Store daily items between shoulder and waist height.',
      'Keep walking space open and task lighting strong.',
      'Review appliance habits, not just appliance features.',
    ],
    sections: [
      {
        title: 'Start with the daily items',
        body: [
          'Plates, cups, medication, kettle, pans, cleaning products, and breakfast items should be reviewed first. If the person climbs, bends deeply, or stretches daily, risk builds quietly.',
          'Moving items is often faster and cheaper than buying new furniture, and it can reduce daily reach and bending immediately.',
        ],
      },
      {
        title: 'Reduce carrying and turning',
        body: [
          'Many kitchen incidents happen when someone carries a hot drink, turns quickly, or navigates a narrow space with both hands full.',
          'A safer setup may include defined work zones, a stable place to rest items, better lighting, and reduced floor clutter.',
        ],
      },
      {
        title: 'Review appliance routines',
        body: [
          'Induction, automatic shut-off devices, smoke and heat alerts, and visible controls can help, but the right recommendation depends on how the person cooks.',
          'For some homes, the safest first step is a routine change supported by reminders or agreed check-ins.',
        ],
      },
    ],
    checklist: [
      'Are daily items stored between shoulder and waist height?',
      'Can the person prepare food without crossing the room repeatedly?',
      'Is task lighting strong at counters, sink, and cooker?',
      'Are floor mats secure and edges flat?',
      'Are appliance controls visible, readable and familiar?',
    ],
    faqs: [
      {
        question: 'Should someone stop cooking alone?',
        answer:
          'Not automatically. The decision depends on mobility, memory, vision, appliance use and recent incidents. Many kitchens can be made safer while keeping familiar meal routines.',
      },
      {
        question: 'What kitchen change helps most first?',
        answer:
          'Reducing reach and bend for daily items is often the highest-value first change, followed by better task lighting and visible walking space.',
      },
    ],
    cta: {
      label: 'See kitchen safety services',
      to: '/services/kitchen-safety',
    },
  },
  {
    id: 'bedroom-night-safety-older-adults',
    path: '/blog/bedroom-night-safety-older-adults',
    title: 'Bedroom and Night-Time Safety',
    description:
      'How to make bedrooms and night-time movement safer with bed transfers, low-glare lighting, bathroom access, bedside reach and emergency support.',
    category: 'Night safety',
    readTime: '9 min read',
    date: '2026-08-10',
    image: '/images/blog/bedroom-night-safety.webp',
    imageAlt: 'Editorial illustration of bedroom night safety lighting',
    keywords: ['bedroom safety seniors', 'night fall prevention', 'older adult night safety'],
    intro:
      'Night-time risk is easy to underestimate because the home looks familiar in daylight. At night the person may be half asleep, urgency is higher, lighting is lower, medication effects may be stronger and getting to the bathroom can become the hardest movement in the home.',
    takeaways: [
      'Review the whole night routine: sitting up, standing, finding footwear, reaching a walking aid, leaving the room and using the bathroom.',
      'Use low-level lighting that reduces shadows without causing glare or disorientation.',
      'Check bed height, bedside reach, floor hazards, doorways, thresholds and bathroom access together.',
      'Make emergency help reachable from bed and bathroom, and agree who responds.',
    ],
    sections: [
      {
        title: 'Start at the bedside, before the person stands',
        body: [
          'The first movement of the night is usually sitting up, placing feet, reaching for glasses or walking aid, standing and turning. Bed height, mattress softness, footwear, bedside furniture and support points all affect that moment.',
          'If the person pushes on a light bedside table, reaches behind them for a phone, or has to stand before finding a walking aid, the layout is asking too much of a tired person.',
        ],
      },
      {
        title: 'Light the path, not just the room',
        body: [
          'Strong overhead light can be disorienting, while darkness hides floor changes and furniture edges. Low-level motion lighting can make the path visible without forcing the person to search for switches.',
          'Check the actual path from bed to bathroom: the side of the bed used, the first step, doorway, hallway, thresholds, rugs, bathroom entrance and toilet position. Shadows and glare matter as much as brightness.',
        ],
      },
      {
        title: 'Reduce urgency and rushing where possible',
        body: [
          'Bathroom urgency is one reason night-time movement becomes risky. Ask whether the person avoids drinking, rushes, wakes confused, has dizziness on standing, or takes medication that affects balance or sleep.',
          'The home plan can reduce trip risk, but repeated night urgency or dizziness should also be discussed with a clinician. Safer lighting and support are not a substitute for checking health causes.',
        ],
      },
      {
        title: 'Keep help reachable from the two riskiest places',
        body: [
          'Emergency buttons, phones or agreed alert systems should be reachable from the bed and bathroom. Charging the phone across the room may keep the battery full but leave help out of reach.',
          'Agreed contacts should know who responds, how they enter if the door is locked, and what happens if help is triggered at night.',
        ],
      },
    ],
    checklist: [
      'Can the person sit up and stand without pulling unstable furniture?',
      'Are glasses, phone, water, medication and walking aid reachable before standing?',
      'Is footwear stable, easy to put on and kept in the same place?',
      'Is the bed-to-bathroom path visible with low light and minimal glare?',
      'Are rugs, cables, storage boxes and low furniture removed from the night-time walking space?',
      'Can the bathroom door, toilet and light be used without awkward reaching or turning?',
      'Is emergency help reachable from both bed and bathroom?',
      'Have agreed contacts confirmed who responds and how they can enter if needed?',
    ],
    resources: [
      {
        title: 'Prevent falls and fractures',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/falls-and-falls-prevention/prevent-falls-and-fractures',
        description:
          'Useful guidance on fall risk factors such as medicines, vision, exercise and home changes that affect night-time safety.',
      },
      {
        title: 'Check for Safety home checklist',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'Prompts for floors, stairs, bedroom, bathroom and lighting to use during a night-safety review.',
      },
      {
        title: 'Aging in place: growing older at home',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/aging-place/aging-place-growing-older-home',
        description:
          'Broader official guidance on planning support, home changes and help at home as needs change.',
      },
    ],
    faqs: [
      {
        question: 'What light is best for night safety?',
        answer:
          'Low-level motion lighting often works well because it supports movement without the shock of bright overhead light. The best setup depends on the room, eyesight, shadows and whether light wakes or disorients the person.',
      },
      {
        question: 'Does bed height matter for fall prevention?',
        answer:
          'Yes. A bed that is too low or too high can make transfers harder. Bed height should suit leg strength, balance, and support needs.',
      },
      {
        question: 'What if the person gets up many times each night?',
        answer:
          'Review the bedroom-to-bathroom movement immediately, but also raise the pattern with a health professional. Urgency, dizziness, medication timing, pain or confusion may need medical advice as well as home changes.',
      },
    ],
    cta: {
      label: 'See bedroom safety services',
      to: '/services/bedroom-safety',
    },
  },
  {
    id: 'hospital-discharge-home-safety-checklist',
    path: '/blog/hospital-discharge-home-safety-checklist',
    title: 'Hospital Discharge Home Safety Checklist',
    description:
      'A practical home safety checklist before returning home after hospital discharge, surgery or a mobility change.',
    category: 'After hospital discharge',
    readTime: '8 min read',
    date: '2026-07-24',
    image: '/images/blog/emergency-plan-home.webp',
    imageAlt: 'Preparing the home before someone returns from hospital',
    keywords: ['hospital discharge home safety', 'senior home safety after hospital', 'home checklist after surgery'],
    intro:
      'The first days after hospital discharge are often when small home barriers become big problems. Use this checklist to focus on entering the home, the bedroom, the bathroom, medication, help and the first week of daily routines.',
    takeaways: [
      'Prepare entry, bed, bathroom and night-time movement before the person returns home.',
      'Confirm who helps, how help is requested and what should happen if the first plan fails.',
      'Separate urgent safety actions from works that can wait for measurement or a priced plan.',
    ],
    sections: [
      {
        title: 'Confirm the first arrival home',
        body: [
          'Before discharge, walk from the building entrance to the main resting place. Look for steps, thresholds, narrow turns, loose mats, poor lighting and places where the person may need to pause.',
          'If stairs, lifts, parking or building access are uncertain, plan the arrival with the person who will bring them home rather than improvising at the door.',
        ],
      },
      {
        title: 'Make the bedroom and bathroom work first',
        body: [
          'The priority rooms are usually the bedroom and bathroom. Check bed height, transfer space, night lighting, toilet access, shower/bath access and whether support points are available exactly where movement happens.',
          'Do not wait for a perfect long-term plan before solving urgent risks such as dark night-time walking space, wet floors, unsupported toilet transfers or hard-to-reach help.',
        ],
      },
      {
        title: 'Agree the first-week support plan',
        body: [
          'Write down who visits, who calls, how medication is checked, who handles follow-up appointments and what happens if pain, dizziness, confusion or mobility becomes worse.',
          'CasaMia can help turn this into a practical home safety plan: remote review, expert visit, urgent fixes, clear pricing, grant-readiness notes or staged installation.',
        ],
      },
    ],
    checklist: [
      'Can the person enter the home safely on the discharge day?',
      'Is the bed easy to reach, sit on and get out of?',
      'Can the person reach the toilet and bathroom safely at night?',
      'Are medication, discharge notes and emergency contacts easy to find?',
      'Who checks in during the first 24 hours, first three days and first week?',
      'What urgent works need review before larger adaptations are planned?',
    ],
    faqs: [
      {
        question: 'What should be prepared before returning home from hospital?',
        answer:
          'Start with entry access, bedroom transfers, bathroom and toilet use, night lighting, medication notes, emergency contacts and who will help during the first week.',
      },
      {
        question: 'Should the whole home be adapted before discharge?',
        answer:
          'Usually no. Focus first on entry, sleeping, toileting, washing and asking for help. Larger works can be measured and planned after the urgent risks are understood.',
      },
    ],
    cta: {
      label: 'Start a discharge safety review',
      to: '/home-safety-after-hospital-discharge',
    },
  },
  {
    id: 'when-home-adaptations-are-not-enough',
    path: '/blog/when-home-adaptations-are-not-enough',
    title: 'When Home Adaptations Are Not Enough: A Decision Guide',
    description:
      'A practical guide for deciding whether home adaptations, extra support, a staged plan or residential care is the safer next step.',
    category: 'Care decisions',
    readTime: '8 min read',
    date: '2026-07-24',
    image: '/images/blog/provider-choice.webp',
    imageAlt: 'People comparing home safety and care options around a table',
    keywords: ['aging in place decision', 'home adaptations vs care home', 'when home is no longer safe'],
    intro:
      'Staying at home should feel safe, familiar and realistic. The question is not whether home is always better; it is whether the right support can make daily life safer without exhausting the person or their helpers.',
    takeaways: [
      'Home adaptations work best when the person can still use the home with open walking space, support points and sensible routines.',
      'Residential or higher-care support may be safer when supervision, transfers, confusion or night-time risk cannot be managed reliably at home.',
      'The best decision compares safety, dignity, helper capacity, cost, timing and the person’s wishes together.',
    ],
    sections: [
      {
        title: 'Start with the daily routine, not the building',
        body: [
          'A home can look suitable during a quick visit and still fail at the exact moments that matter: getting out of bed, reaching the toilet at night, showering, cooking, using stairs or calling for help.',
          'If those moments can be made safer with practical adaptations, routines and support, staying at home may remain realistic. If they depend on constant improvisation, a wider support conversation is needed.',
        ],
      },
      {
        title: 'Signals that home adaptation may still be realistic',
        body: [
          'Home usually remains a strong option when the person wants to stay, recognises the space, can follow familiar routines and the main risks are physical or environmental: bathroom access, lighting, stairs, thresholds, getting in and out of bed or emergency reach.',
          'In that case, a staged plan often works well: fix urgent risk first, then add comfort, connected support or larger adaptations where they clearly improve daily life.',
        ],
      },
      {
        title: 'Signals that more support should be considered',
        body: [
          'More support may need to be discussed when the person cannot request help reliably, falls repeatedly despite changes, becomes unsafe at night, needs transfers that one person cannot manage, or has confusion that creates frequent risk.',
          'This does not automatically mean a residence. It may mean more home care, respite, technology-supported routines, a professional visit, or a transition plan. The point is to be honest before a crisis decides for everyone.',
        ],
      },
      {
        title: 'Use a decision frame everyone can understand',
        body: [
          'A useful decision compares five things: what the person wants, what is currently unsafe, what can realistically be changed, who will help day to day, and what each option costs over the next 6 to 24 months.',
          'CasaMia can help with the home side of that decision: safety review, practical plan, staged works, grant-readiness notes and a direct explanation of what home adaptation can and cannot solve.',
        ],
      },
    ],
    checklist: [
      'Can the person reach the toilet, bed, kitchen and entrance safely on a normal day?',
      'Can help be requested from the rooms where risk is highest?',
      'Are falls, near misses or night-time incidents becoming more frequent?',
      'Can approved helpers realistically support the routine without burning out?',
      'Would a staged home plan solve the main risks, or only delay a bigger decision?',
      'Have the cost and timing of adapting home been compared with residential or higher-care support?',
    ],
    faqs: [
      {
        question: 'How do we know if staying at home is still realistic?',
        answer:
          'Look at daily routines, not the idea of the home. If bathroom use, night movement, transfers, meals and help requests can be made reliable, home may still be realistic. If several of those remain unsafe despite support, consider a wider care plan.',
      },
      {
        question: 'Should we adapt the home before considering a residence?',
        answer:
          'Not always. Some situations should compare both options early. A focused home safety review can show what can be solved at home, what needs professional support and what may be better handled through a higher-care option.',
      },
    ],
    cta: {
      label: 'Start a home safety review',
      to: '/tools/senior-friendly-home-check',
    },
  },
  {
    id: 'emergency-plan-aging-parents-home',
    path: '/blog/emergency-plan-aging-parents-home',
    title: 'Emergency Planning for Safer Living at Home',
    description:
      'A practical emergency plan for alerts, access, contacts, medication, responders, and home information.',
    category: 'Emergency planning',
    readTime: '7 min read',
    date: '2026-07-11',
    image: '/images/blog/emergency-plan-home.webp',
    imageAlt: 'Editorial illustration of an emergency plan connecting home and trusted response',
    keywords: ['emergency plan aging parents', 'senior emergency response home', 'family safety plan elderly'],
    intro:
      'A safer home also needs a response plan. Agreed contacts should know how help is requested, who responds, how they enter the home, and what information is needed in the first few minutes.',
    takeaways: [
      'Emergency support should be reachable from the rooms where risk is highest.',
      'Response roles should be clear before an incident happens.',
      'Access, medication, contacts, and home notes should be easy to find.',
    ],
    sections: [
      {
        title: 'Decide how help is requested',
        body: [
          'A phone on the kitchen counter is not enough if the fall risk is in the bathroom or bedroom. Help needs to be reachable from likely risk points.',
          'Options may include a wearable button, phone routine, smart alert, neighbour protocol, or professional emergency response service.',
        ],
      },
      {
        title: 'Make access practical',
        body: [
          'If an approved contact or responder cannot enter, response is delayed. Consider keys, trusted contacts, building access, door communication, and any alarm codes.',
          'Access planning should be secure and agreed with the person at home, not improvised after a crisis.',
        ],
      },
      {
        title: 'Create a short home information sheet',
        body: [
          'Keep essential information easy to find: medication list, allergies, doctor contact, approved contacts, preferred hospital, mobility notes, and where important documents are kept.',
          'This is especially useful when more than one approved contact or helper may respond.',
        ],
      },
    ],
    checklist: [
      'Who is contacted first in an emergency?',
      'Can help be requested from bathroom, bedroom, and living areas?',
      'How does a trusted responder enter the home?',
      'Where are medication and medical notes kept?',
      'What should neighbours, helpers, or approved contacts do first?',
    ],
    faqs: [
      {
        question: 'Is an emergency button needed?',
        answer:
          'It depends on mobility, fall history, living situation, and response time. Emergency buttons are most useful when the person will wear or use them consistently.',
      },
      {
        question: 'What should be included in an emergency plan?',
        answer:
          'Include contact order, home access, medication information, known risks, preferred responders, and how alerts are handled overnight or when usual contacts are away.',
      },
    ],
    cta: {
      label: 'Explore smart safety support',
      to: '/tech',
    },
  },
]

export const featuredBlogArticle = blogArticles[0]
