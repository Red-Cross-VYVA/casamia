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
      en: 'Quick help for apartments, everyday homes and safer returns from hospital.',
      es: 'Ayuda rápida para pisos, viviendas habituales y vueltas a casa tras el hospital.',
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
      en: 'Practical changes for older apartments, narrow entrances and daily bathroom use.',
      es: 'Cambios prácticos para pisos antiguos, entradas estrechas y uso diario del baño.',
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
      en: 'Clear room-by-room reviews when you want to improve the home in sensible stages.',
      es: 'Revisiones claras por estancias para mejorar la vivienda por fases.',
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
      en: 'Support for coastal homes, international households and safer daily living.',
      es: 'Apoyo para viviendas de costa, hogares internacionales y vida diaria más segura.',
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
      en: 'Help making coastal homes easier to use safely every day.',
      es: 'Ayuda para que las viviendas de costa sean más fáciles y seguras a diario.',
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
      en: 'Plans that protect comfort and independence without making the home feel clinical.',
      es: 'Planes que cuidan la comodidad y la independencia sin convertir la casa en algo clínico.',
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
      en: 'Northern coverage is opening as reliable local visit options become available.',
      es: 'La cobertura en el norte se abre a medida que haya visitas locales fiables.',
    },
    focus: {
      en: ['right professional', 'home assessment', 'follow-up steps'],
      es: ['profesional adecuado', 'revisión de vivienda', 'pasos de seguimiento'],
    },
  },
  {
    city: 'Zaragoza',
    region: 'Aragon',
    status: 'planned',
    headline: {
      en: 'Practical guidance for choosing which home changes matter first.',
      es: 'Orientación práctica para decidir qué cambios de la vivienda importan primero.',
    },
    focus: {
      en: ['safety plan', 'visit options', 'grant questions'],
      es: ['plan de seguridad', 'opciones de visita', 'dudas sobre ayudas'],
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
