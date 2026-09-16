export type ServiceAreaCity = {
  city: string
  region: string
  status: 'active' | 'building' | 'planned'
  headline: {
    en: string
    es: string
  }
  focus: {
    en: string[]
    es: string[]
  }
}

export const serviceAreaCities: ServiceAreaCity[] = [
  {
    city: 'Madrid',
    region: 'Comunidad de Madrid',
    status: 'active',
    headline: {
      en: 'Fast coordination for apartments, family homes and return-home plans.',
      es: 'Coordinación ágil para pisos, viviendas familiares y vueltas a casa.',
    },
    focus: {
      en: ['bathroom safety', 'night movement', 'post-hospital priorities'],
      es: ['seguridad en baño', 'movimiento nocturno', 'prioridades tras hospital'],
    },
  },
  {
    city: 'Barcelona',
    region: 'Catalonia',
    status: 'active',
    headline: {
      en: 'Senior-friendly adaptation support for dense urban homes and older buildings.',
      es: 'Apoyo en adaptaciones senior para pisos urbanos y edificios antiguos.',
    },
    focus: {
      en: ['entrance access', 'bathroom access', 'connected support'],
      es: ['acceso de entrada', 'acceso al baño', 'apoyo conectado'],
    },
  },
  {
    city: 'Valencia',
    region: 'Comunitat Valenciana',
    status: 'active',
    headline: {
      en: 'Practical home-safety reviews for families planning calm, staged improvements.',
      es: 'Revisiones prácticas para familias que quieren mejorar por fases.',
    },
    focus: {
      en: ['fall prevention', 'bathroom transfers', 'grant preparation'],
      es: ['prevención de caídas', 'transferencias en baño', 'preparación de ayudas'],
    },
  },
  {
    city: 'Malaga',
    region: 'Andalusia',
    status: 'building',
    headline: {
      en: 'Growing support for coastal homes, international families and assisted living operators.',
      es: 'Cobertura en crecimiento para costa, familias internacionales y operadores senior.',
    },
    focus: {
      en: ['home access', 'bathroom safety', 'trusted-contact alerts'],
      es: ['acceso a vivienda', 'seguridad en baño', 'avisos a contactos de confianza'],
    },
  },
  {
    city: 'Alicante',
    region: 'Comunitat Valenciana',
    status: 'building',
    headline: {
      en: 'Coastal coverage for ageing-at-home adaptations and safer everyday routines.',
      es: 'Cobertura de costa para adaptar la vivienda y hacer más segura la rutina diaria.',
    },
    focus: {
      en: ['bathroom access', 'bedroom safety', 'connected living'],
      es: ['acceso al baño', 'seguridad en dormitorio', 'vida conectada'],
    },
  },
  {
    city: 'Seville',
    region: 'Andalusia',
    status: 'building',
    headline: {
      en: 'Home-safety planning for families balancing comfort, independence and local delivery.',
      es: 'Planificación de seguridad para familias que buscan comodidad, independencia y ejecución local.',
    },
    focus: {
      en: ['entry safety', 'lighting', 'room-by-room planning'],
      es: ['seguridad de entrada', 'iluminación', 'plan por estancias'],
    },
  },
  {
    city: 'Bilbao',
    region: 'Basque Country',
    status: 'planned',
    headline: {
      en: 'Priority northern rollout as vetted provider coverage is confirmed.',
      es: 'Despliegue prioritario en el norte según se confirme la red de profesionales.',
    },
    focus: {
      en: ['provider matching', 'home assessment', 'aftercare steps'],
      es: ['asignación profesional', 'revisión de vivienda', 'pasos de seguimiento'],
    },
  },
  {
    city: 'Zaragoza',
    region: 'Aragon',
    status: 'planned',
    headline: {
      en: 'Central coverage for practical adaptations and household decision support.',
      es: 'Cobertura central para adaptaciones prácticas y apoyo en decisiones del hogar.',
    },
    focus: {
      en: ['safety plan', 'visit coordination', 'grant criteria'],
      es: ['plan de seguridad', 'coordinación de visita', 'criterios de ayuda'],
    },
  },
]

export function getServiceAreaCitySlug(city: string) {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}
