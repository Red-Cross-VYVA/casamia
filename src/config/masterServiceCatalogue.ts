import type { MasterServiceCatalogue } from '../types/serviceCatalogue.ts'

const now = '2026-07-23T00:00:00.000Z'

export const masterServiceCatalogue: MasterServiceCatalogue = {
  version: '1.0.0',
  updatedAt: now,
  rooms: [
    { id: 'bathroom', slug: 'bathroom', name: { en: 'Bathroom', es: 'Baño' }, active: true, sortOrder: 10 },
    { id: 'bedroom', slug: 'bedroom', name: { en: 'Bedroom', es: 'Dormitorio' }, active: true, sortOrder: 20 },
  ],
  sections: [
    {
      id: 'home-safety-package',
      slug: 'home-safety-package',
      name: { en: 'Home Safety Package', es: 'Paquete de seguridad del hogar' },
      description: {
        en: 'Physical improvements that make daily routines safer and easier.',
        es: 'Mejoras físicas para que las rutinas diarias sean más seguras y sencillas.',
      },
      active: true,
      sortOrder: 10,
    },
    {
      id: 'connected-room',
      slug: 'connected-room',
      name: { en: 'Connected Room', es: 'Estancia conectada' },
      description: {
        en: 'Configured technology experiences, not loose devices.',
        es: 'Experiencias tecnológicas configuradas, no dispositivos sueltos.',
      },
      active: true,
      sortOrder: 20,
    },
    {
      id: 'optional-adaptations',
      slug: 'optional-adaptations',
      name: { en: 'Optional Adaptations', es: 'Adaptaciones opcionales' },
      description: {
        en: 'Bespoke works requiring assessment, measurements, or quotation.',
        es: 'Trabajos a medida que requieren evaluación, medición o presupuesto.',
      },
      active: true,
      sortOrder: 30,
    },
  ],
  packages: [
    packageRecord('bathroom-home-safety-package', 'bathroom', 'home-safety-package', {
      en: 'Bathroom Home Safety Package',
      es: 'Paquete de seguridad para baño',
    }, 'Bathroom Home Safety Package', 10),
    packageRecord('bathroom-connected-room', 'bathroom', 'connected-room', {
      en: 'Casamia Connected Bathroom',
      es: 'Baño conectado Casamia',
    }, 'Casamia Connected Bathroom', 20),
    packageRecord('bathroom-optional-adaptations', 'bathroom', 'optional-adaptations', {
      en: 'Bathroom Optional Adaptations',
      es: 'Adaptaciones opcionales de baño',
    }, 'Bathroom Optional Adaptations', 30, true),
    packageRecord('bedroom-home-safety-package', 'bedroom', 'home-safety-package', {
      en: 'Bedroom Home Safety Package',
      es: 'Paquete de seguridad para dormitorio',
    }, 'Bedroom Home Safety Package', 40),
    packageRecord('bedroom-connected-room', 'bedroom', 'connected-room', {
      en: 'Casamia Connected Bedroom',
      es: 'Dormitorio conectado Casamia',
    }, 'Casamia Connected Bedroom', 50),
    packageRecord('bedroom-optional-adaptations', 'bedroom', 'optional-adaptations', {
      en: 'Bedroom Optional Adaptations',
      es: 'Adaptaciones opcionales de dormitorio',
    }, 'Bedroom Optional Adaptations', 60, true),
  ],
  outcomes: [
    outcome('bathroom-safer-bathing', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Safer Bathing', 'Baño y ducha más seguros', 'Bathing safety', 'Showering and bathing with better support, seating and grip.', 'Ducha y baño con mejor apoyo, asiento y agarre.', 'Make bathing feel steadier and less stressful.', 'Ayuda a ducharse o bañarse con más estabilidad y menos preocupación.', 'essential', ['bathroom'], 10, { legacyId: 'bathroom-folding-shower-seat', grantEligible: true }),
    outcome('bathroom-safer-toilet-transfers', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Safer Toilet Transfers', 'Transferencias al inodoro más seguras', 'Toilet transfers', 'Support around the toilet for sitting, standing and turning.', 'Apoyo alrededor del inodoro para sentarse, levantarse y girar.', 'Reduce effort and improve confidence during toilet transfers.', 'Reduce esfuerzo y mejora la confianza al usar el inodoro.', 'essential', ['bathroom'], 20, { legacyId: 'bathroom-raised-toilet-seat', grantEligible: true }),
    outcome('bathroom-slip-prevention', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Slip Prevention', 'Prevención de resbalones', 'Wet-floor safety', 'Improve grip on wet surfaces and reduce common slip points.', 'Mejora el agarre en superficies mojadas y reduce puntos habituales de resbalón.', 'Lower the risk of slips in the highest-risk wet areas.', 'Reduce el riesgo de resbalones en las zonas húmedas de mayor riesgo.', 'essential', ['bathroom'], 30, { legacyId: 'bathroom-anti-slip-floor-treatment', grantEligible: true }),
    outcome('bathroom-improved-visibility', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Improved Bathroom Visibility', 'Mejor visibilidad en el baño', 'Bathroom lighting', 'Brighter, clearer lighting for washing, toileting and night-time use.', 'Iluminación más clara para asearse, usar el inodoro y moverse de noche.', 'Make edges, water and support points easier to see.', 'Hace más visibles los bordes, el agua y los puntos de apoyo.', 'essential', ['bathroom', 'lighting'], 40, { legacyId: 'bathroom-improved-lighting', grantEligible: true }),
    outcome('bathroom-easier-tap-control', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Easier Tap Control', 'Grifos más fáciles de usar', 'Water control', 'Controls that are easier to reach, turn and understand.', 'Controles más fáciles de alcanzar, girar y entender.', 'Make washing easier for hands with less strength or dexterity.', 'Facilita el aseo cuando hay menos fuerza o destreza en las manos.', 'essential', ['bathroom'], 50, { legacyId: 'bathroom-lever-mixer-tap' }),
    outcome('bathroom-temperature-safety', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Temperature Safety', 'Seguridad de temperatura', 'Water safety', 'Reduce accidental scalding risk with safer temperature control.', 'Reduce el riesgo de quemaduras con control de temperatura más seguro.', 'Help keep shower and tap water within a safer range.', 'Ayuda a mantener el agua de ducha y grifo en un rango más seguro.', 'essential', ['bathroom'], 60, { legacyId: 'bathroom-thermostatic-valve' }),
    outcome('bathroom-safer-access', 'bathroom', 'home-safety-package', 'bathroom-home-safety-package', 'Safer Bathroom Access', 'Acceso al baño más seguro', 'Access', 'Smooth the entry route into the bathroom where thresholds or steps create risk.', 'Mejora el acceso cuando umbrales o escalones crean riesgo.', 'Make entering and leaving the bathroom easier.', 'Hace más fácil entrar y salir del baño.', 'essential', ['bathroom', 'entrance'], 70, { legacyId: 'bathroom-threshold-removal', grantEligible: true }),
    outcome('bathroom-connected-guidance', 'bathroom', 'connected-room', 'bathroom-connected-room', 'Automatic Bathroom Guidance', 'Guía automática en el baño', 'Connected bathroom', 'Motion-triggered guidance for safer low-light bathroom routines.', 'Guía activada por movimiento para rutinas de baño con poca luz.', 'Help the bathroom respond quietly when someone enters at night.', 'Ayuda a que el baño responda discretamente por la noche.', 'recommended', ['bathroom', 'lighting', 'smart-safety'], 80, { legacyId: 'bathroom-motion-lighting', technologyEnabled: true }),
    outcome('bathroom-bathtub-step-through', 'bathroom', 'optional-adaptations', 'bathroom-optional-adaptations', 'Bathtub Step-through Conversion', 'Conversión de bañera con acceso bajo', 'Bath adaptation', 'A specialist conversion to reduce the step over the bath edge.', 'Conversión especializada para reducir el paso sobre el borde de la bañera.', 'Make bath access easier without replacing the whole room.', 'Facilita el acceso a la bañera sin sustituir todo el baño.', 'optional', ['bathroom'], 90, { legacyId: 'bathroom-tub-cutout', quoteOnly: true, grantEligible: true }),
    outcome('bathroom-wider-doorway', 'bathroom', 'optional-adaptations', 'bathroom-optional-adaptations', 'Wider Bathroom Doorway', 'Puerta de baño más ancha', 'Door access', 'A measured doorway adaptation where walking aids or wheelchairs need more clearance.', 'Adaptación medida de puerta cuando ayudas de movilidad o sillas necesitan más espacio.', 'Improve access when the current doorway is too tight.', 'Mejora el acceso cuando la puerta actual resulta estrecha.', 'optional', ['bathroom', 'entrance'], 100, { legacyId: 'bathroom-wider-doorway', quoteOnly: true, grantEligible: true }),
    outcome('bathroom-vertical-support', 'bathroom', 'optional-adaptations', 'bathroom-optional-adaptations', 'Vertical Support Solution', 'Solución de apoyo vertical', 'Transfer support', 'Additional vertical support where transfers need a stronger plan.', 'Apoyo vertical adicional cuando las transferencias requieren una solución más robusta.', 'Add support where standard rails are not enough.', 'Añade apoyo donde las barras estándar no bastan.', 'optional', ['bathroom'], 110, { legacyId: 'bathroom-vertical-support-rail', quoteOnly: true, grantEligible: true }),
    outcome('bedroom-safer-lighting', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Safer Bedroom Lighting', 'Iluminación de dormitorio más segura', 'Bedroom lighting', 'Bedside, low-level and easy-reach lighting for safer nights.', 'Iluminación de cabecera, baja altura y fácil alcance para noches más seguras.', 'Make it easier to see before getting out of bed.', 'Facilita ver antes de levantarse de la cama.', 'essential', ['bedroom', 'lighting'], 120, { legacyId: 'bedroom-underbed-lighting', grantEligible: true }),
    outcome('bedroom-easier-bed-transfers', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Easier Bed Transfers', 'Transferencias de cama más fáciles', 'Bed transfers', 'Support, clearance and furniture position for getting in and out of bed.', 'Apoyo, espacio y posición del mobiliario para entrar y salir de la cama.', 'Reduce effort at one of the most important daily transfer points.', 'Reduce esfuerzo en una de las transferencias más importantes del día.', 'essential', ['bedroom'], 130, { legacyId: 'bedroom-bed-support', grantEligible: true }),
    outcome('bedroom-safer-walking-routes', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Safer Walking Routes', 'Rutas de paso más seguras', 'Bedroom routes', 'Clearer routes to the door, bathroom and bedside essentials.', 'Rutas más despejadas hacia la puerta, baño y objetos esenciales.', 'Reduce night-time trip points and improve everyday movement.', 'Reduce tropiezos nocturnos y mejora el movimiento diario.', 'essential', ['bedroom', 'living-room'], 140, { legacyId: 'bedroom-night-route', grantEligible: true }),
    outcome('bedroom-accessible-storage', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Accessible Everyday Storage', 'Almacenaje diario accesible', 'Storage', 'Move daily items into easier reach with less bending and stretching.', 'Coloca objetos diarios a mejor alcance, con menos flexión y estiramiento.', 'Make getting dressed and prepared simpler.', 'Hace más sencillo vestirse y prepararse.', 'recommended', ['bedroom'], 150),
    outcome('bedroom-slip-resistance', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Slip-Resistance Improvements', 'Mejoras antideslizantes', 'Floor safety', 'Improve bedroom floor and floor-covering safety where needed.', 'Mejora la seguridad del suelo y revestimientos cuando haga falta.', 'Make walking routes steadier underfoot.', 'Hace que las rutas de paso sean más estables.', 'recommended', ['bedroom'], 160),
    outcome('bedroom-emergency-support', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Emergency Support', 'Apoyo de emergencia', 'Emergency access', 'Make it easier to call for help from the bedroom.', 'Facilita pedir ayuda desde el dormitorio.', 'Give the resident and family a clearer help route.', 'Da al residente y la familia una vía de ayuda más clara.', 'recommended', ['bedroom', 'smart-safety'], 170, { grantEligible: true }),
    outcome('bedroom-fire-safety', 'bedroom', 'home-safety-package', 'bedroom-home-safety-package', 'Fire Safety', 'Seguridad contra incendios', 'Fire safety', 'Appropriate smoke detection and alerting for the bedroom area.', 'Detección y aviso de humo adecuados para el dormitorio.', 'Support faster awareness if smoke is detected.', 'Favorece una alerta más rápida si se detecta humo.', 'recommended', ['bedroom', 'smart-safety'], 180),
    outcome('bedroom-voice-assistance', 'bedroom', 'connected-room', 'bedroom-connected-room', 'Voice Assistance', 'Asistencia por voz', 'Connected bedroom', 'Voice support for reminders, lights and simple help requests.', 'Apoyo por voz para recordatorios, luces y peticiones sencillas.', 'Make daily routines easier without needing a complex interface.', 'Facilita rutinas sin interfaces complicadas.', 'recommended', ['bedroom', 'smart-safety'], 190, { technologyEnabled: true, voiceEnabled: true, requiresSmartSpeaker: true }),
    outcome('bedroom-smart-lighting', 'bedroom', 'connected-room', 'bedroom-connected-room', 'Smart Lighting', 'Iluminación inteligente', 'Connected bedroom', 'Configured lighting scenes and automatic night guidance.', 'Escenas de luz y guía nocturna automática configuradas.', 'Let the room adapt to night-time movement.', 'Permite que la estancia se adapte al movimiento nocturno.', 'recommended', ['bedroom', 'lighting', 'smart-safety'], 200, { technologyEnabled: true, requiresSmartSpeaker: true }),
    outcome('bedroom-family-reassurance', 'bedroom', 'connected-room', 'bedroom-connected-room', 'Family Reassurance', 'Tranquilidad familiar', 'Connected bedroom', 'Carefully configured updates where appropriate and consented.', 'Actualizaciones configuradas cuidadosamente cuando proceda y haya consentimiento.', 'Help family understand routines without intrusive monitoring.', 'Ayuda a la familia a entender rutinas sin vigilancia invasiva.', 'recommended', ['bedroom', 'smart-safety'], 210, { legacyId: 'bedroom-bed-exit-sensor', technologyEnabled: true, requiresSmartSpeaker: true }),
    outcome('bedroom-daily-living-support', 'bedroom', 'connected-room', 'bedroom-connected-room', 'Daily Living Support', 'Apoyo a rutinas diarias', 'Connected bedroom', 'Medication, appointment and morning/evening routine prompts.', 'Recordatorios de medicación, citas y rutinas de mañana/noche.', 'Support independence with gentle prompts.', 'Apoya la independencia con avisos amables.', 'recommended', ['bedroom', 'smart-safety'], 220, { technologyEnabled: true, voiceEnabled: true, requiresSmartSpeaker: true }),
    outcome('bedroom-connected-safety', 'bedroom', 'connected-room', 'bedroom-connected-room', 'Connected Safety', 'Seguridad conectada', 'Connected bedroom', 'Compatible connected alerts selected for the resident and home.', 'Alertas conectadas compatibles seleccionadas para la persona y la vivienda.', 'Keep safety technology simple and coordinated.', 'Mantiene la tecnología de seguridad sencilla y coordinada.', 'recommended', ['bedroom', 'smart-safety'], 230, { technologyEnabled: true, requiresSmartSpeaker: true }),
    ...[
      ['bedroom-accessible-wardrobe', 'Accessible Wardrobe Adaptation', 'Armario más accesible'],
      ['bedroom-advanced-bed-transfer', 'Advanced Bed Transfer Solution', 'Solución avanzada de transferencia de cama'],
      ['bedroom-electric-adjustable-bed', 'Electric Adjustable Bed', 'Cama eléctrica ajustable'],
      ['bedroom-bed-exit-safety-system', 'Bed Exit Safety System', 'Sistema de seguridad al salir de la cama'],
      ['bedroom-automated-curtains', 'Automated Curtains or Blinds', 'Cortinas o persianas automatizadas'],
      ['bedroom-bathroom-safety-route', 'Bedroom-to-Bathroom Safety Route', 'Ruta segura del dormitorio al baño'],
      ['bedroom-specialist-layout', 'Specialist Bedroom Layout Adaptation', 'Adaptación especializada del dormitorio'],
      ['bedroom-door-accessibility', 'Bedroom Door Accessibility Adaptation', 'Adaptación de accesibilidad de puerta'],
      ['bedroom-dementia-support', 'Dementia-Support Bedroom Adaptation', 'Dormitorio adaptado para apoyo cognitivo'],
    ].map(([id, en, es], index) =>
      outcome(id, 'bedroom', 'optional-adaptations', 'bedroom-optional-adaptations', en, es, 'Optional bedroom adaptation', 'A bespoke bedroom adaptation reviewed after assessment.', 'Adaptación de dormitorio a medida revisada tras evaluación.', 'Tailor the bedroom around a specific need.', 'Adapta el dormitorio a una necesidad concreta.', 'optional', ['bedroom'], 240 + index, {
        legacyId: id === 'bedroom-electric-adjustable-bed' ? 'bedroom-adjustable-bed' : undefined,
        quoteOnly: true,
        grantEligible: true,
        requiresCompatibilityCheck: id.includes('automated') || id.includes('system'),
        technologyEnabled: id.includes('automated') || id.includes('system'),
      }),
    ),
  ],
  capabilities: [
    capability('bedside-lighting', 'Bedside lighting', true),
    capability('low-level-night-lighting', 'Low-level night lighting', true),
    capability('motion-activated-lighting', 'Motion-activated lighting', true, true),
    capability('easy-reach-light-controls', 'Easy-reach lighting controls', true),
    capability('bed-height-optimisation', 'Bed height optimisation'),
    capability('transfer-clearance', 'Transfer clearance'),
    capability('discreet-transfer-support', 'Discreet transfer support'),
    capability('furniture-repositioning', 'Furniture repositioning'),
    capability('loose-rug-securing', 'Loose rug removal or securing'),
    capability('cable-management', 'Cable management'),
    capability('accessible-storage-arrangement', 'Accessible storage arrangement'),
    capability('emergency-call-access', 'Emergency call access', true, true),
    capability('smoke-alerting', 'Smoke detection and alerting', true, true),
    capability('smart-speaker-setup', 'Smart speaker setup', true, true),
    capability('voice-controlled-lighting', 'Voice-controlled lighting', true, true),
    capability('routine-reminders', 'Medication and routine reminders', true, true),
    capability('movement-reassurance', 'Movement reassurance', true, true),
    capability('bath-transfer-support', 'Bath and shower transfer support'),
    capability('toilet-transfer-support', 'Toilet transfer support'),
    capability('wet-floor-grip', 'Wet-floor grip'),
    capability('bathroom-task-lighting', 'Bathroom task lighting'),
    capability('lever-water-control', 'Lever water control'),
    capability('anti-scald-control', 'Anti-scald control'),
    capability('threshold-reduction', 'Threshold reduction'),
    capability('specialist-measurement', 'Specialist measurement'),
  ],
  products: [
    product('grab-bar', 'Grab bar', 'hardware', 0.1, true),
    product('folding-shower-seat', 'Folding shower seat', 'hardware', 0.1, true),
    product('raised-toilet-seat', 'Raised toilet seat', 'hardware', 0.1, true),
    product('toilet-support-rail', 'Toilet support rail', 'hardware', 0.1, true),
    product('anti-slip-treatment', 'Anti-slip floor treatment', 'material', 0.21, true),
    product('anti-slip-mat', 'Secure anti-slip bath mat', 'hardware', 0.21, false),
    product('bathroom-led-light', 'Bathroom LED light', 'hardware', 0.21, false),
    product('motion-sensor', 'Motion sensor', 'device', 0.21, false, true),
    product('lever-mixer-tap', 'Lever mixer tap', 'hardware', 0.21, false),
    product('thermostatic-valve', 'Thermostatic anti-scald valve', 'hardware', 0.21, false),
    product('low-threshold-transition', 'Low-threshold transition strip', 'material', 0.21, true),
    product('smart-speaker', 'Smart speaker', 'device', 0.21, false, true),
    product('bedside-light', 'Bedside light', 'hardware', 0.21, false),
    product('low-level-floor-light', 'Low-level floor light', 'hardware', 0.21, false),
    product('bed-support-handle', 'Bed support handle', 'hardware', 0.1, true),
    product('cable-management-kit', 'Cable management kit', 'material', 0.21, false),
    product('storage-reach-kit', 'Storage reach and labelling kit', 'material', 0.21, false),
    product('smoke-detector', 'Smoke detector', 'device', 0.21, false, true),
  ],
  installationTasks: [
    task('inspect-fixing-surface', 'Inspect fixing surface', 25, 'assessment', true, false),
    task('install-support-rail', 'Install support rail', 45, 'general', true, true),
    task('fit-shower-seat', 'Fit shower seat', 50, 'general', true, true),
    task('apply-anti-slip-treatment', 'Apply anti-slip treatment', 60, 'general', true, false),
    task('fit-water-control', 'Fit safer water control', 55, 'plumbing', true, true),
    task('reduce-threshold', 'Reduce or mark threshold', 45, 'general', true, true),
    task('configure-motion-lighting', 'Configure motion lighting', 35, 'smart_home', false, false),
    task('pair-smart-speaker', 'Pair and configure smart speaker', 45, 'smart_home', false, false),
    task('test-emergency-contact', 'Test emergency contact flow', 20, 'smart_home', false, false),
    task('reposition-furniture', 'Reposition furniture', 30, 'general', false, false),
    task('measure-specialist-adaptation', 'Measure specialist adaptation', 45, 'assessment', true, true),
  ],
  relations: [
    ...packageOutcomeRelations(),
    ...outcomeCapabilityRelations(),
    ...capabilityProductRelations(),
    ...capabilityTaskRelations(),
  ],
}

function packageRecord(
  id: string,
  roomId: string,
  section: MasterServiceCatalogue['sections'][number]['id'],
  customerName: { en: string; es: string },
  internalName: string,
  sortOrder: number,
  quote = false,
): MasterServiceCatalogue['packages'][number] {
  return {
    id,
    slug: id,
    roomId,
    section,
    customerName,
    internalName,
    shortDescription: { en: 'A coordinated package of customer outcomes.', es: 'Un paquete coordinado de resultados para el cliente.' },
    customerBenefit: { en: 'One clear plan instead of disconnected products.', es: 'Un plan claro en lugar de productos sueltos.' },
    active: true,
    sortOrder,
    pricingType: quote ? 'quote' : 'from',
    fromPrice: quote ? undefined : 0,
    vatRate: 0.21,
    requiresAssessment: true,
    requiresSiteVisit: quote,
    requiresQuote: quote,
    wizardVisible: true,
    websiteVisible: true,
    proposalVisible: true,
    inspectorVisible: true,
    adminVisible: true,
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  }
}

function outcome(
  id: string,
  roomId: 'bathroom' | 'bedroom',
  section: MasterServiceCatalogue['sections'][number]['id'],
  packageId: string,
  en: string,
  es: string,
  category: string,
  descEn: string,
  descEs: string,
  benefitEn: string,
  benefitEs: string,
  priority: 'essential' | 'recommended' | 'optional',
  wizardAreas: MasterServiceCatalogue['outcomes'][number]['wizardAreas'],
  sortOrder: number,
  options: {
    grantEligible?: boolean
    legacyId?: string
    quoteOnly?: boolean
    requiresCompatibilityCheck?: boolean
    requiresSmartSpeaker?: boolean
    technologyEnabled?: boolean
    voiceEnabled?: boolean
  } = {},
): MasterServiceCatalogue['outcomes'][number] {
  return {
    id,
    legacyId: options.legacyId,
    slug: id,
    roomId,
    section,
    packageId,
    customerName: { en, es },
    internalName: en,
    category,
    shortDescription: { en: descEn, es: descEs },
    detailedDescription: { en: descEn, es: descEs },
    customerBenefit: { en: benefitEn, es: benefitEs },
    active: true,
    sortOrder,
    priority,
    pricingType: options.quoteOnly ? 'quote' : 'included-in-package',
    vatRate: 0.21,
    requiresAssessment: true,
    requiresMeasurement: options.quoteOnly ?? false,
    requiresSiteVisit: options.quoteOnly ?? false,
    requiresCompatibilityCheck: options.requiresCompatibilityCheck ?? options.requiresSmartSpeaker ?? false,
    requiresQuote: options.quoteOnly ?? false,
    grantEligible: options.grantEligible ?? false,
    technologyEnabled: options.technologyEnabled ?? false,
    voiceEnabled: options.voiceEnabled ?? false,
    requiresSmartSpeaker: options.requiresSmartSpeaker ?? false,
    wizardAreas,
    wizardTags: [roomId, section, priority],
    websiteVisible: true,
    wizardVisible: true,
    proposalVisible: true,
    inspectorVisible: true,
    adminVisible: true,
    version: '1.0.0',
    createdAt: now,
    updatedAt: now,
  }
}

function capability(
  id: string,
  name: string,
  technologyEnabled = false,
  requiresCompatibilityCheck = false,
): MasterServiceCatalogue['capabilities'][number] {
  return {
    id,
    slug: id,
    name,
    description: name,
    active: true,
    technologyEnabled,
    requiresCompatibilityCheck,
    implementationNotes: technologyEnabled ? 'Configure only with compatible devices and consent.' : undefined,
  }
}

function product(
  id: string,
  name: string,
  productType: MasterServiceCatalogue['products'][number]['productType'],
  vatRate: number,
  grantEligible: boolean,
  requiresCompatibilityCheck = false,
): MasterServiceCatalogue['products'][number] {
  return {
    id,
    slug: id,
    name,
    productType,
    internalDescription: name,
    active: true,
    vatRate,
    currency: 'EUR',
    quantityType: 'per_unit',
    stockTracked: productType !== 'service',
    grantEligible,
    installationRequired: true,
    requiresCompatibilityCheck,
    version: '1.0.0',
  }
}

function task(
  id: string,
  name: string,
  estimatedMinutes: number,
  skillType: MasterServiceCatalogue['installationTasks'][number]['skillType'],
  requiresSiteVisit: boolean,
  requiresMeasurement: boolean,
): MasterServiceCatalogue['installationTasks'][number] {
  return {
    id,
    slug: id,
    name,
    description: name,
    active: true,
    estimatedMinutes,
    skillType,
    installerType: skillType === 'assessment' ? 'casamia' : 'partner',
    labourRate: 50,
    requiresSiteVisit,
    requiresMeasurement,
    safetyChecklist: ['Confirm resident needs', 'Check surface and route safety'],
    completionChecklist: ['Test installation', 'Explain use to customer'],
    version: '1.0.0',
  }
}

function relation(type: MasterServiceCatalogue['relations'][number]['type'], fromId: string, toId: string, sortOrder: number, required = true) {
  return {
    id: `${type}-${fromId}-${toId}`,
    type,
    fromId,
    toId,
    required,
    defaultIncluded: required,
    optionalUpgrade: !required,
    minimumQuantity: required ? 1 : 0,
    sortOrder,
  }
}

function packageOutcomeRelations() {
  return getMasterServiceCatalogueSeedOutcomeIds().map(([packageId, outcomeId], index) =>
    relation('packageOutcome', packageId, outcomeId, index + 1),
  )
}

function getMasterServiceCatalogueSeedOutcomeIds() {
  return [
  ['bathroom-home-safety-package', 'bathroom-safer-bathing'],
  ['bathroom-home-safety-package', 'bathroom-safer-toilet-transfers'],
  ['bathroom-home-safety-package', 'bathroom-slip-prevention'],
  ['bathroom-home-safety-package', 'bathroom-improved-visibility'],
  ['bathroom-home-safety-package', 'bathroom-easier-tap-control'],
  ['bathroom-home-safety-package', 'bathroom-temperature-safety'],
  ['bathroom-home-safety-package', 'bathroom-safer-access'],
  ['bathroom-connected-room', 'bathroom-connected-guidance'],
  ['bathroom-optional-adaptations', 'bathroom-bathtub-step-through'],
  ['bathroom-optional-adaptations', 'bathroom-wider-doorway'],
  ['bathroom-optional-adaptations', 'bathroom-vertical-support'],
  ['bedroom-home-safety-package', 'bedroom-safer-lighting'],
  ['bedroom-home-safety-package', 'bedroom-easier-bed-transfers'],
  ['bedroom-home-safety-package', 'bedroom-safer-walking-routes'],
  ['bedroom-home-safety-package', 'bedroom-accessible-storage'],
  ['bedroom-home-safety-package', 'bedroom-slip-resistance'],
  ['bedroom-home-safety-package', 'bedroom-emergency-support'],
  ['bedroom-home-safety-package', 'bedroom-fire-safety'],
  ['bedroom-connected-room', 'bedroom-voice-assistance'],
  ['bedroom-connected-room', 'bedroom-smart-lighting'],
  ['bedroom-connected-room', 'bedroom-family-reassurance'],
  ['bedroom-connected-room', 'bedroom-daily-living-support'],
  ['bedroom-connected-room', 'bedroom-connected-safety'],
  ['bedroom-optional-adaptations', 'bedroom-accessible-wardrobe'],
  ['bedroom-optional-adaptations', 'bedroom-advanced-bed-transfer'],
  ['bedroom-optional-adaptations', 'bedroom-electric-adjustable-bed'],
  ['bedroom-optional-adaptations', 'bedroom-bed-exit-safety-system'],
  ['bedroom-optional-adaptations', 'bedroom-automated-curtains'],
  ['bedroom-optional-adaptations', 'bedroom-bathroom-safety-route'],
  ['bedroom-optional-adaptations', 'bedroom-specialist-layout'],
  ['bedroom-optional-adaptations', 'bedroom-door-accessibility'],
  ['bedroom-optional-adaptations', 'bedroom-dementia-support'],
  ]
}

function outcomeCapabilityRelations() {
  const map: Record<string, string[]> = {
    'bathroom-safer-bathing': ['bath-transfer-support', 'wet-floor-grip'],
    'bathroom-safer-toilet-transfers': ['toilet-transfer-support'],
    'bathroom-slip-prevention': ['wet-floor-grip'],
    'bathroom-improved-visibility': ['bathroom-task-lighting'],
    'bathroom-easier-tap-control': ['lever-water-control'],
    'bathroom-temperature-safety': ['anti-scald-control'],
    'bathroom-safer-access': ['threshold-reduction'],
    'bathroom-connected-guidance': ['motion-activated-lighting', 'bathroom-task-lighting'],
    'bathroom-bathtub-step-through': ['specialist-measurement', 'bath-transfer-support'],
    'bathroom-wider-doorway': ['specialist-measurement'],
    'bathroom-vertical-support': ['specialist-measurement', 'toilet-transfer-support'],
    'bedroom-safer-lighting': ['bedside-lighting', 'low-level-night-lighting', 'motion-activated-lighting', 'easy-reach-light-controls'],
    'bedroom-easier-bed-transfers': ['bed-height-optimisation', 'transfer-clearance', 'discreet-transfer-support', 'furniture-repositioning'],
    'bedroom-safer-walking-routes': ['loose-rug-securing', 'cable-management', 'furniture-repositioning'],
    'bedroom-accessible-storage': ['accessible-storage-arrangement'],
    'bedroom-slip-resistance': ['loose-rug-securing'],
    'bedroom-emergency-support': ['emergency-call-access'],
    'bedroom-fire-safety': ['smoke-alerting'],
    'bedroom-voice-assistance': ['smart-speaker-setup', 'routine-reminders'],
    'bedroom-smart-lighting': ['smart-speaker-setup', 'voice-controlled-lighting', 'motion-activated-lighting'],
    'bedroom-family-reassurance': ['movement-reassurance'],
    'bedroom-daily-living-support': ['routine-reminders', 'smart-speaker-setup'],
    'bedroom-connected-safety': ['smoke-alerting', 'emergency-call-access'],
  }

  const optionalBedroomOutcomeIds = [
    'bedroom-accessible-wardrobe',
    'bedroom-advanced-bed-transfer',
    'bedroom-electric-adjustable-bed',
    'bedroom-bed-exit-safety-system',
    'bedroom-automated-curtains',
    'bedroom-bathroom-safety-route',
    'bedroom-specialist-layout',
    'bedroom-door-accessibility',
    'bedroom-dementia-support',
  ]

  optionalBedroomOutcomeIds.forEach((outcomeId) => {
    map[outcomeId] = ['specialist-measurement']
  })

  return Object.entries(map).flatMap(([outcomeId, capabilityIds]) =>
    capabilityIds.map((capabilityId, index) => relation('outcomeCapability', outcomeId, capabilityId, index + 1)),
  )
}

function capabilityProductRelations() {
  const map: Record<string, string[]> = {
    'bath-transfer-support': ['grab-bar', 'folding-shower-seat'],
    'toilet-transfer-support': ['raised-toilet-seat', 'toilet-support-rail'],
    'wet-floor-grip': ['anti-slip-treatment', 'anti-slip-mat'],
    'bathroom-task-lighting': ['bathroom-led-light'],
    'motion-activated-lighting': ['motion-sensor', 'low-level-floor-light'],
    'lever-water-control': ['lever-mixer-tap'],
    'anti-scald-control': ['thermostatic-valve'],
    'threshold-reduction': ['low-threshold-transition'],
    'bedside-lighting': ['bedside-light'],
    'low-level-night-lighting': ['low-level-floor-light'],
    'loose-rug-securing': ['anti-slip-mat'],
    'cable-management': ['cable-management-kit'],
    'accessible-storage-arrangement': ['storage-reach-kit'],
    'discreet-transfer-support': ['bed-support-handle'],
    'smart-speaker-setup': ['smart-speaker'],
    'voice-controlled-lighting': ['smart-speaker', 'low-level-floor-light'],
    'routine-reminders': ['smart-speaker'],
    'movement-reassurance': ['motion-sensor'],
    'emergency-call-access': ['smart-speaker'],
    'smoke-alerting': ['smoke-detector'],
  }

  return Object.entries(map).flatMap(([capabilityId, productIds]) =>
    productIds.map((productId, index) => relation('capabilityProduct', capabilityId, productId, index + 1)),
  )
}

function capabilityTaskRelations() {
  const map: Record<string, string[]> = {
    'bath-transfer-support': ['inspect-fixing-surface', 'install-support-rail', 'fit-shower-seat'],
    'toilet-transfer-support': ['inspect-fixing-surface', 'install-support-rail'],
    'wet-floor-grip': ['apply-anti-slip-treatment'],
    'lever-water-control': ['fit-water-control'],
    'anti-scald-control': ['fit-water-control'],
    'threshold-reduction': ['reduce-threshold'],
    'bathroom-task-lighting': ['inspect-fixing-surface'],
    'motion-activated-lighting': ['configure-motion-lighting'],
    'smart-speaker-setup': ['pair-smart-speaker'],
    'emergency-call-access': ['test-emergency-contact'],
    'smoke-alerting': ['test-emergency-contact'],
    'loose-rug-securing': ['reposition-furniture'],
    'cable-management': ['reposition-furniture'],
    'accessible-storage-arrangement': ['reposition-furniture'],
    'movement-reassurance': ['configure-motion-lighting'],
    'furniture-repositioning': ['reposition-furniture'],
    'specialist-measurement': ['measure-specialist-adaptation'],
  }

  return Object.entries(map).flatMap(([capabilityId, taskIds]) =>
    taskIds.map((taskId, index) => relation('capabilityInstallationTask', capabilityId, taskId, index + 1)),
  )
}
