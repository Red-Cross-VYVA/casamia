export type GrantProgramme = {
  id: string
  name: string
  authorityLevel: 'state' | 'autonomous-community' | 'province' | 'municipality' | 'social-services'
  autonomousCommunity?: string
  province?: string
  municipality?: string
  status: 'open' | 'expected' | 'temporarily-closed' | 'closed' | 'continuous' | 'unknown'
  applicationStart?: string
  applicationEnd?: string
  minimumAge?: number
  seniorPriorityAge?: number
  disabilityThreshold?: number
  dependencyAccepted?: boolean
  habitualResidenceRequired?: boolean
  padrónRequired?: boolean
  incomeRule?: string
  eligibleApplicantTypes: string[]
  eligiblePropertyTypes: string[]
  eligibleWorks: string[]
  fundingPercentage?: number
  enhancedFundingPercentage?: number
  maximumAmount?: number
  paymentTiming?: 'advance' | 'after-justification' | 'mixed' | 'unknown'
  workCanStartBeforeApplication: boolean | 'unknown'
  otherAidCompatibility?: string
  officialSourceUrl?: string
  sourceLastVerified?: string
  notes: string[]
}

export type GrantAnswers = {
  location?: {
    autonomousCommunity?: string
    province?: string
    municipality?: string
    postalCode?: string
  }
  applicantFor?: string
  age?: string
  disability?: string
  dependency?: string
  difficulties: string[]
  habitualResidence?: string
  padron?: string
  propertyRelation?: string
  housingType?: string
  income?: string
  adaptations: string[]
  propertyArea?: string
  documents: string[]
  workStatus?: string
  otherAid?: string
  timing?: string
}

export type GrantEligibilityResult = {
  level: 'high-likelihood' | 'good-possibility' | 'review-required' | 'alternative-support'
  favourableFactors: string[]
  availableFundingRoutes: string[]
  informationToVerify: string[]
  likelyEligibleAdaptations: string[]
  recommendedDocuments: string[]
  recommendedNextAction: string
}

export const spanishAutonomousCommunities = [
  'Andalucía',
  'Aragón',
  'Asturias',
  'Baleares',
  'Canarias',
  'Cantabria',
  'Castilla y León',
  'Castilla-La Mancha',
  'Cataluña',
  'Comunidad Valenciana',
  'Comunidad de Madrid',
  'Extremadura',
  'Galicia',
  'La Rioja',
  'Murcia',
  'Navarra',
  'País Vasco',
  'Ceuta',
  'Melilla',
]

export const sampleGrantProgrammes: GrantProgramme[] = [
  {
    id: 'spain-rehabilitation-accessibility-configurable',
    name: 'Programas estatales de rehabilitación y accesibilidad',
    authorityLevel: 'state',
    status: 'expected',
    minimumAge: 60,
    seniorPriorityAge: 65,
    disabilityThreshold: 33,
    dependencyAccepted: true,
    habitualResidenceRequired: true,
    padrónRequired: true,
    incomeRule: 'Priorización habitual por IPREM, composición familiar y vulnerabilidad.',
    eligibleApplicantTypes: ['propietario', 'inquilino con permiso', 'comunidad de propietarios'],
    eligiblePropertyTypes: ['vivienda habitual', 'edificio residencial', 'zonas comunes'],
    eligibleWorks: ['baño accesible', 'rampas', 'ascensor', 'salvaescaleras', 'eliminación de barreras'],
    maximumAmount: 18000,
    paymentTiming: 'mixed',
    workCanStartBeforeApplication: 'unknown',
    otherAidCompatibility: 'Debe revisarse por convocatoria.',
    notes: ['Contenido configurable. Confirmar bases vigentes antes de solicitar.'],
  },
  {
    id: 'andalucia-accessibility-configurable',
    name: 'Ayudas de accesibilidad de Andalucía',
    authorityLevel: 'autonomous-community',
    autonomousCommunity: 'Andalucía',
    status: 'unknown',
    seniorPriorityAge: 65,
    disabilityThreshold: 33,
    dependencyAccepted: true,
    habitualResidenceRequired: true,
    padrónRequired: true,
    eligibleApplicantTypes: ['propietario', 'inquilino con permiso'],
    eligiblePropertyTypes: ['piso', 'vivienda unifamiliar', 'edificio residencial'],
    eligibleWorks: ['adaptación de baño', 'eliminación de barreras', 'mejora de accesibilidad'],
    maximumAmount: 12000,
    paymentTiming: 'after-justification',
    workCanStartBeforeApplication: 'unknown',
    notes: ['Dato de ejemplo para catálogo configurable.'],
  },
  {
    id: 'madrid-accessibility-configurable',
    name: 'Programas de accesibilidad de la Comunidad de Madrid',
    authorityLevel: 'autonomous-community',
    autonomousCommunity: 'Comunidad de Madrid',
    status: 'unknown',
    minimumAge: 60,
    seniorPriorityAge: 65,
    disabilityThreshold: 33,
    dependencyAccepted: true,
    habitualResidenceRequired: true,
    padrónRequired: true,
    eligibleApplicantTypes: ['propietario', 'inquilino con permiso', 'comunidad de propietarios'],
    eligiblePropertyTypes: ['vivienda habitual', 'zonas comunes'],
    eligibleWorks: ['ascensores', 'rampas', 'plataformas', 'adaptación funcional'],
    maximumAmount: 12500,
    paymentTiming: 'mixed',
    workCanStartBeforeApplication: 'unknown',
    notes: ['Contenido configurable. Añadir fuente oficial y fechas vigentes.'],
  },
  {
    id: 'valencia-accessibility-configurable',
    name: 'Ayudas de accesibilidad de la Comunidad Valenciana',
    authorityLevel: 'autonomous-community',
    autonomousCommunity: 'Comunidad Valenciana',
    status: 'unknown',
    seniorPriorityAge: 65,
    disabilityThreshold: 33,
    dependencyAccepted: true,
    habitualResidenceRequired: true,
    padrónRequired: true,
    eligibleApplicantTypes: ['propietario', 'inquilino con permiso', 'comunidad de propietarios'],
    eligiblePropertyTypes: ['vivienda habitual', 'edificio residencial'],
    eligibleWorks: ['baño accesible', 'itinerarios accesibles', 'rampas', 'ascensores'],
    maximumAmount: 10000,
    paymentTiming: 'after-justification',
    workCanStartBeforeApplication: 'unknown',
    notes: ['Dato de ejemplo para mantener y verificar.'],
  },
]

export const emptyGrantAnswers: GrantAnswers = {
  difficulties: [],
  adaptations: [],
  documents: [],
}

export function evaluateGrantEligibility(answers: GrantAnswers): GrantEligibilityResult {
  const favourableFactors: string[] = []
  const informationToVerify = new Set<string>()
  const routes = new Set<string>(['Programas estatales de rehabilitación y accesibilidad'])
  const recommendedDocuments = new Set<string>(['DNI o NIE', 'Padrón', 'Fotografías de la vivienda'])

  if (answers.location?.autonomousCommunity) {
    routes.add(`Ayudas autonómicas en ${answers.location.autonomousCommunity}`)
  } else {
    informationToVerify.add('Comunidad autónoma de la vivienda')
  }

  if (answers.location?.municipality) {
    routes.add('Programas municipales y de diputación')
  } else {
    informationToVerify.add('Municipio y código postal')
  }

  if (['De 60 a 64', 'De 65 a 74', 'De 75 a 84', '85 o más'].includes(answers.age ?? '')) {
    favourableFactors.push('Persona mayor de 60 años')
  }

  if (['De 65 a 74', 'De 75 a 84', '85 o más'].includes(answers.age ?? '')) {
    favourableFactors.push('Persona mayor de 65 años')
  }

  if (['De 75 a 84', '85 o más'].includes(answers.age ?? '')) favourableFactors.push('Edad prioritaria en muchos programas')

  if ((answers.disability ?? '').includes('33') || (answers.disability ?? '').includes('65')) {
    favourableFactors.push('Discapacidad reconocida')
    routes.add('Ayudas vinculadas a discapacidad')
    recommendedDocuments.add('Resolución de discapacidad')
  } else if (answers.disability === 'Solicitud en trámite') {
    favourableFactors.push('Solicitud de discapacidad en trámite')
    informationToVerify.add('Estado del reconocimiento de discapacidad')
  }

  if (['Grado I', 'Grado II', 'Grado III'].includes(answers.dependency ?? '')) {
    favourableFactors.push('Dependencia reconocida')
    routes.add('Apoyos vinculados a dependencia')
    recommendedDocuments.add('Resolución de dependencia')
  } else if (answers.dependency === 'Solicitud en trámite') {
    favourableFactors.push('Solicitud de dependencia en trámite')
    informationToVerify.add('Estado del reconocimiento de dependencia')
  }

  if (answers.difficulties.some((item) => ['Riesgo de caídas', 'Utiliza bastón o andador', 'Utiliza silla de ruedas', 'Dificultad para utilizar escaleras'].includes(item))) {
    favourableFactors.push('Movilidad reducida o riesgo de caídas')
    recommendedDocuments.add('Informe médico, social o técnico si existe')
  }

  if (answers.habitualResidence === 'Sí' || answers.habitualResidence === 'Será su vivienda habitual') {
    favourableFactors.push('Vivienda habitual')
  } else {
    informationToVerify.add('Uso como vivienda habitual')
  }

  if (answers.padron === 'Sí') favourableFactors.push('Empadronamiento en la vivienda')
  else informationToVerify.add('Padrón municipal')

  if (['Propietario', 'Copropietario', 'Usufructuario', 'Inquilino con permiso del propietario', 'Comunidad de propietarios'].includes(answers.propertyRelation ?? '')) {
    favourableFactors.push('Relación con la vivienda compatible')
  } else {
    informationToVerify.add('Permiso del propietario o acuerdo de comunidad')
  }

  if (['La obra no ha comenzado', 'Solo estoy buscando información', 'Necesito una valoración profesional', 'Ya tengo un presupuesto', 'Ya tengo un informe técnico'].includes(answers.workStatus ?? '')) {
    favourableFactors.push('Obra todavía no iniciada o en fase preparatoria')
  } else if (answers.workStatus) {
    informationToVerify.add('Compatibilidad si la obra ya empezó o terminó')
  }

  if (answers.income?.includes('bajo') || answers.income?.includes('medio')) favourableFactors.push('Ingresos potencialmente priorizables')
  else informationToVerify.add('Ingresos e IPREM aplicable')

  const likelyEligibleAdaptations = answers.adaptations.length > 0 ? answers.adaptations : ['Evaluación completa de accesibilidad']
  if (likelyEligibleAdaptations.length > 0) favourableFactors.push('Obra relacionada con accesibilidad o seguridad')
  if (likelyEligibleAdaptations.length > 2) favourableFactors.push('Varias adaptaciones necesarias')

  if (answers.propertyArea === 'En las zonas comunes del edificio') routes.add('Ayudas para edificios y zonas comunes')
  routes.add('Programas de rehabilitación de vivienda')
  routes.add('Ayudas para adaptación funcional')
  routes.add('Posibles deducciones fiscales o financiación complementaria')

  answers.documents.forEach((document) => {
    if (document !== 'Ninguno todavía') recommendedDocuments.add(document)
  })

  const strongCount = favourableFactors.length
  const level =
    strongCount >= 8
      ? 'high-likelihood'
      : strongCount >= 5
        ? 'good-possibility'
        : strongCount >= 2
          ? 'review-required'
          : 'alternative-support'

  return {
    level,
    favourableFactors,
    availableFundingRoutes: [...routes],
    informationToVerify: [...informationToVerify],
    likelyEligibleAdaptations,
    recommendedDocuments: [...recommendedDocuments],
    recommendedNextAction:
      level === 'high-likelihood'
        ? 'Programar una valoración Casamia y preparar el expediente.'
        : level === 'good-possibility'
          ? 'Solicitar una verificación gratuita de convocatoria y documentos.'
          : level === 'review-required'
            ? 'Enviar los datos pendientes para que Casamia revise la vía aplicable.'
            : 'Solicitar una búsqueda personalizada de ayudas municipales, sociales o complementarias.',
  }
}
