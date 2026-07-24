import type { NeedLandingPageContent } from './needLandingPages'

type NeedLandingPageTranslation = Pick<
  NeedLandingPageContent,
  | 'title'
  | 'seoTitle'
  | 'description'
  | 'eyebrow'
  | 'intro'
  | 'whoFor'
  | 'priorities'
  | 'casamiaPlan'
  | 'relatedServices'
  | 'faqs'
>

const spanishNeedLandingPages: Record<string, NeedLandingPageTranslation> = {
  'bathroom-safety-for-seniors': {
    title: 'Seguridad en el baño para mayores',
    seoTitle: 'Seguridad en el baño para mayores en España',
    description:
      'Seguridad práctica en el baño para personas mayores: ducha, inodoro, apoyo antideslizante, iluminación, controles de agua e instalación coordinada por CasaMia.',
    eyebrow: 'Seguridad en el baño',
    intro:
      'Haz que ducharse, usar el inodoro y moverse por el baño sea más seguro sin convertir la estancia en una clínica. CasaMia revisa la rutina real, recomienda la ruta adecuada y coordina el trabajo.',
    whoFor: [
      'Personas mayores que se sienten inseguras en el baño',
      'Familias preocupadas por la ducha o el inodoro',
      'Viviendas con riesgos de suelo mojado, agarre o uso nocturno del baño',
    ],
    priorities: [
      'Ducha y baño con más apoyo',
      'Ayuda para sentarse y levantarse del inodoro',
      'Prevención de resbalones y mejor visibilidad nocturna',
      'Controles de agua y prevención de fugas',
    ],
    casamiaPlan: [
      'Revisar la distribución y la rutina diaria del baño',
      'Elegir mejoras que encajen con la persona y la vivienda',
      'Coordinar instalación, explicación y seguimiento',
    ],
    relatedServices: [
      { label: 'Servicios de seguridad en el baño', to: '/services/bathroom-safety' },
      { label: 'Informe gratuito de seguridad', to: '/home-safety-assessment' },
      { label: 'Guía de seguridad en el baño', to: '/blog/bathroom-safety-seniors-costly-mistakes' },
    ],
    faqs: [
      {
        question: '¿Qué conviene revisar primero en un baño para mayores?',
        answer:
          'Empieza por acceso a la ducha, transferencias al inodoro, suelos mojados, puntos de apoyo, luz nocturna y facilidad de uso de grifos y controles.',
      },
      {
        question: '¿CasaMia puede mantener el baño con aspecto de hogar?',
        answer:
          'Sí. El objetivo es mejorar la seguridad con soluciones discretas y prácticas siempre que sea posible, no dar un aspecto clínico salvo que sea necesario.',
      },
    ],
  },
  'fall-prevention-at-home': {
    title: 'Prevención de caídas en casa',
    seoTitle: 'Prevención de caídas en casa para personas mayores',
    description:
      'Una ruta estancia por estancia para prevenir caídas en casa: baño, dormitorio, escaleras, entrada, iluminación y puntos de apoyo.',
    eyebrow: 'Prevenir primero',
    intro:
      'Prevenir caídas no es comprar un producto. Es ordenar las estancias y rutinas donde se acumula el riesgo: transferencias, luz, suelos, escaleras y apoyos.',
    whoFor: [
      'Familias que han notado resbalones, sustos o pérdida de confianza',
      'Personas mayores tras una caída o un cambio de movilidad',
      'Viviendas que necesitan un plan tranquilo antes de una urgencia',
    ],
    priorities: [
      'Seguridad en baño e inodoro',
      'Ruta nocturna del dormitorio al baño',
      'Escaleras, entradas y umbrales',
      'Ayuda de emergencia y apoyo conectado sencillo',
    ],
    casamiaPlan: [
      'Identificar primero las rutinas de mayor riesgo',
      'Adaptar las mejoras a la persona, no solo a la vivienda',
      'Ordenar acciones urgentes, recomendadas y opcionales',
    ],
    relatedServices: [
      { label: 'Todos los servicios de seguridad', to: '/services' },
      { label: 'Cómo funciona CasaMia', to: '/how-it-works' },
      { label: 'Lista de prevención de caídas', to: '/blog/fall-prevention-home-checklist-spain' },
    ],
    faqs: [
      {
        question: '¿Dónde suelen empezar las mejoras para prevenir caídas?',
        answer:
          'CasaMia suele empezar por baño, dormitorio, escaleras, entrada e iluminación porque combinan movimiento, transferencias y visibilidad.',
      },
      {
        question: '¿Prevenir caídas significa cambiar toda la casa de golpe?',
        answer:
          'No. Un buen plan separa prioridades inmediatas de mejoras posteriores para que la familia pueda avanzar con orden.',
      },
    ],
  },
  'aging-in-place-home-assessment': {
    title: 'Evaluación del hogar para seguir viviendo en casa',
    seoTitle: 'Evaluación del hogar para envejecer en casa en España',
    description:
      'Reserva una evaluación CasaMia para entender prioridades de seguridad, adaptaciones, ayudas y próximos pasos prácticos.',
    eyebrow: 'Evaluación del hogar',
    intro:
      'Una evaluación del hogar ayuda a ver qué importa ahora, qué puede esperar y qué cambios facilitan seguir viviendo en casa con más seguridad y comodidad.',
    whoFor: [
      'Familias que quieren planificar antes de una caída o alta hospitalaria',
      'Personas mayores que quieren mantener independencia en casa',
      'Hogares donde la familia no sabe qué arreglar primero',
    ],
    priorities: [
      'Movilidad y transferencias diarias',
      'Riesgos de seguridad estancia por estancia',
      'Opciones prácticas de adaptación',
      'Preparación de ayudas y documentación cuando proceda',
    ],
    casamiaPlan: [
      'Escuchar prioridades de la familia y la persona',
      'Revisar vivienda, fotos o respuestas guiadas',
      'Preparar una propuesta clara con próximos pasos',
    ],
    relatedServices: [
      { label: 'Reservar evaluación', to: '/home-safety-assessment' },
      { label: 'Crear mi plan', to: '/home-safety-wizard' },
      { label: 'Por qué elegir CasaMia', to: '/why-us' },
    ],
    faqs: [
      {
        question: '¿Qué incluye una evaluación del hogar?',
        answer:
          'CasaMia revisa contexto de la vivienda, movilidad, estancias prioritarias, fotos o notas disponibles y recomienda mejoras prácticas.',
      },
      {
        question: '¿Se puede empezar antes de una visita?',
        answer:
          'Sí. La familia puede empezar online con preguntas guiadas, fotos, vídeos o una nota de voz. La visita confirma medidas e instalación si hace falta.',
      },
    ],
  },
  'home-adaptations-for-elderly': {
    title: 'Adaptaciones del hogar para personas mayores',
    seoTitle: 'Adaptaciones del hogar para personas mayores en España',
    description:
      'CasaMia coordina adaptaciones para personas mayores en baño, dormitorio, entrada, cocina, iluminación y apoyo conectado.',
    eyebrow: 'Adaptaciones del hogar',
    intro:
      'Una buena adaptación no consiste en añadir productos al azar. Consiste en preservar independencia, comodidad y dignidad eliminando riesgos y fricciones diarias.',
    whoFor: [
      'Familias que necesitan un plan coordinado',
      'Personas mayores con cambios de movilidad o confianza',
      'Viviendas que combinan obras prácticas, apoyo conectado o ayudas',
    ],
    priorities: [
      'Acceso más seguro al baño',
      'Dormitorio y movimiento nocturno',
      'Entrada, umbrales y escaleras',
      'Rutinas conectadas cuando aportan valor',
    ],
    casamiaPlan: [
      'Traducir necesidades en resultados fáciles de entender',
      'Coordinar productos, instaladores y tiempos',
      'Mantener claro alcance, precio y entrega',
    ],
    relatedServices: [
      { label: 'Catálogo de servicios', to: '/services' },
      { label: 'Proceso', to: '/how-it-works' },
      { label: 'Guía para elegir proveedor', to: '/blog/choose-home-safety-provider-spain' },
    ],
    faqs: [
      {
        question: '¿Qué adaptaciones son más habituales?',
        answer:
          'Suelen incluir apoyos, asiento de ducha, iluminación nocturna, ayuda para levantarse de la cama, umbrales, suelos más seguros y controles fáciles.',
      },
      {
        question: '¿CasaMia suministra e instala todo?',
        answer:
          'CasaMia coordina el proceso de principio a fin: evaluación, propuesta, selección, instalación y seguimiento cuando corresponde.',
      },
    ],
  },
  'senior-bedroom-safety': {
    title: 'Seguridad en el dormitorio para mayores',
    seoTitle: 'Seguridad en el dormitorio y prevención nocturna de caídas',
    description:
      'Seguridad en el dormitorio para levantarse mejor de la cama, caminar con más seguridad, mejorar la luz nocturna y tener ayuda al alcance.',
    eyebrow: 'Seguridad en el dormitorio',
    intro:
      'El dormitorio debe favorecer descanso y movimiento seguro, sobre todo de noche. CasaMia se centra en transferencias, rutas despejadas, iluminación y ayuda al alcance.',
    whoFor: [
      'Personas mayores que se levantan de noche para ir al baño',
      'Familias preocupadas por entrar o salir de la cama',
      'Viviendas con alfombras, cables, desorden o poca luz en el dormitorio',
    ],
    priorities: [
      'Iluminación nocturna con sensor',
      'Apoyo para transferencias de cama',
      'Ruta despejada de la cama a la puerta',
      'Opciones de llamada de emergencia y rutinas conectadas',
    ],
    casamiaPlan: [
      'Revisar dormitorio y rutina nocturna',
      'Recomendar mejoras principales y opcionales',
      'Instalar, configurar y explicar todo con claridad',
    ],
    relatedServices: [
      { label: 'Servicios de seguridad en dormitorio', to: '/services/bedroom-safety' },
      { label: 'Guía de seguridad nocturna', to: '/blog/bedroom-night-safety-older-adults' },
      { label: 'Crear mi plan', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: '¿Qué hace más seguro un dormitorio?',
        answer:
          'Suele empezar por transferencias de cama, luz nocturna, rutas despejadas, suelos seguros y una forma sencilla de pedir ayuda.',
      },
      {
        question: '¿Las funciones conectadas son opcionales?',
        answer:
          'Sí. Voz, recordatorios o alertas solo deben usarse cuando aportan comodidad y confianza.',
      },
    ],
  },
  'safe-bathroom-access': {
    title: 'Acceso seguro al baño',
    seoTitle: 'Acceso seguro al baño para personas mayores',
    description:
      'Mejora el acceso al baño con entrada más fácil, apoyos, asiento de ducha, superficies antideslizantes, iluminación y ajustes de puerta cuando proceda.',
    eyebrow: 'Acceso más seguro',
    intro:
      'El acceso al baño es toda la ruta: entrar, abrir o cerrar la puerta, llegar al inodoro o ducha y tener apoyo justo donde hace falta.',
    whoFor: [
      'Personas que evitan ducharse porque acceder resulta difícil',
      'Familias preocupadas por transferencias al baño o inodoro',
      'Baños pequeños donde cada movimiento cuenta',
    ],
    priorities: [
      'Manilla y cierre fáciles de usar',
      'Apoyo para entrar a ducha o bañera',
      'Apoyo para sentarse y levantarse del inodoro',
      'Ruta nocturna y visibilidad en el baño',
    ],
    casamiaPlan: [
      'Mapear la ruta dentro y hacia el baño',
      'Confirmar medidas y posiciones de apoyo',
      'Coordinar mejoras prácticas y adaptaciones opcionales',
    ],
    relatedServices: [
      { label: 'Solución para baño', to: '/services/bathroom-safety' },
      { label: 'Evaluación del hogar', to: '/home-safety-assessment' },
      { label: 'Guía de seguridad en el baño', to: '/blog/bathroom-safety-seniors-costly-mistakes' },
    ],
    faqs: [
      {
        question: '¿El acceso al baño solo trata de la ducha?',
        answer:
          'No. Incluye puerta, inodoro, bañera o ducha, suelos, controles, visibilidad y apoyos seguros.',
      },
      {
        question: '¿Cuándo hace falta presupuesto especialista?',
        answer:
          'Ampliar puertas, convertir bañeras o hacer cambios estructurales suele requerir medición, evaluación y presupuesto específico.',
      },
    ],
  },
  'grants-for-home-adaptations-spain': {
    title: 'Ayudas para adaptar viviendas en España',
    seoTitle: 'Ayudas para adaptar viviendas en España',
    description:
      'Revisa la preparación para ayudas de adaptación del hogar en España: requisitos, documentos, plazos y apoyo gestionado por CasaMia.',
    eyebrow: 'Ayudas y asistencia',
    intro:
      'Las ayudas dependen de la región, municipio, convocatorias y situación personal. CasaMia ayuda a entender qué puede encajar y qué documentos suelen hacer falta.',
    whoFor: [
      'Familias que valoran obras de accesibilidad o seguridad',
      'Personas mayores que podrían optar a ayuda pública',
      'Hogares que necesitan apoyo con documentación y próximos pasos',
    ],
    priorities: [
      'Región y código postal',
      'Propiedad o permiso de la vivienda',
      'Documentos de dependencia, discapacidad o edad',
      'Alcance claro y presupuesto de trabajos elegibles',
    ],
    casamiaPlan: [
      'Revisar posibles rutas con fuentes oficiales',
      'Mostrar documentos pendientes y tiempos',
      'Gestionar el proceso de principio a fin cuando se contrate',
    ],
    relatedServices: [
      { label: 'Revisar ayudas', to: '/grant-check' },
      { label: 'Plan Adapta', to: '/plan-adapta' },
      { label: 'Guía de ayudas', to: '/blog/home-adaptation-grants-spain-family-guide' },
    ],
    faqs: [
      {
        question: '¿CasaMia puede garantizar una ayuda?',
        answer:
          'No. La autoridad pública decide requisitos, aprobación, importe y plazos. CasaMia ayuda a preparar y gestionar el proceso.',
      },
      {
        question: '¿Qué información ayuda para revisar una ayuda?',
        answer:
          'Región, código postal, tipo de vivienda, propiedad o permiso, edad, movilidad, dependencia o discapacidad y adaptaciones previstas.',
      },
    ],
  },
  'home-safety-after-hospital-discharge': {
    title: 'Seguridad en casa tras el alta hospitalaria',
    seoTitle: 'Seguridad en casa después del alta hospitalaria',
    description:
      'Prepara una vuelta a casa más segura tras el alta: baño, dormitorio, rutas, apoyos y prioridades urgentes.',
    eyebrow: 'Volver a casa con seguridad',
    intro:
      'Después de una estancia hospitalaria, la vivienda puede necesitar funcionar de otra manera. CasaMia ayuda a priorizar los primeros días: moverse, lavarse, dormir, escaleras y apoyos.',
    whoFor: [
      'Familias que preparan un alta hospitalaria',
      'Personas mayores que vuelven con movilidad reducida',
      'Viviendas que necesitan prioridades rápidas, no una lista interminable',
    ],
    priorities: [
      'Cama, baño e inodoro',
      'Rutas despejadas e iluminación',
      'Entrada o escaleras',
      'Contacto de emergencia y visibilidad familiar',
    ],
    casamiaPlan: [
      'Identificar qué hace falta antes de volver',
      'Separar cambios urgentes de mejoras posteriores',
      'Coordinar instalación práctica y seguimiento',
    ],
    relatedServices: [
      { label: 'Reservar evaluación', to: '/home-safety-assessment' },
      { label: 'Crear plan rápido', to: '/home-safety-wizard' },
      { label: 'Guía de emergencias', to: '/blog/emergency-plan-aging-parents-home' },
    ],
    faqs: [
      {
        question: '¿Qué revisar antes del alta hospitalaria?',
        answer:
          'Cómo entrará en casa, llegará a la cama, usará el baño, se duchará, se moverá de noche y pedirá ayuda si algo cambia.',
      },
      {
        question: '¿CasaMia puede priorizar trabajos urgentes?',
        answer:
          'Sí. El plan puede centrarse primero en seguridad inmediata y dejar mejoras recomendadas u opcionales para después.',
      },
    ],
  },
  'connected-home-for-seniors': {
    title: 'Hogar conectado para personas mayores',
    seoTitle: 'Hogar conectado para mayores sin complicaciones',
    description:
      'Apoyo conectado para mayores con voz, iluminación inteligente, recordatorios, alertas de fuga, emergencia y tranquilidad familiar.',
    eyebrow: 'Vida conectada',
    intro:
      'CasaMia no vende tecnología porque sí. Configuramos experiencias sencillas que apoyan rutinas, seguridad y tranquilidad.',
    whoFor: [
      'Personas mayores que se benefician de ayuda por voz o recordatorios',
      'Familias que quieren tranquilidad práctica sin vigilancia intrusiva',
      'Hogares donde luz, avisos o rutinas reducen fricción diaria',
    ],
    priorities: [
      'Asistencia por voz y llamadas manos libres',
      'Iluminación inteligente y rutinas nocturnas',
      'Recordatorios de medicación o citas',
      'Avisos de fuga, emergencia o familia cuando aportan valor',
    ],
    casamiaPlan: [
      'Elegir tecnología solo cuando ayuda a una rutina',
      'Configurar dispositivos compatibles en una experiencia sencilla',
      'Formar a la vivienda y mantener soporte claro',
    ],
    relatedServices: [
      { label: 'Servicios de seguridad conectada', to: '/services/smart-home-safety' },
      { label: 'Enfoque tecnológico', to: '/tech' },
      { label: 'Guía de seguridad conectada', to: '/blog/smart-home-safety-without-overcomplicating' },
    ],
    faqs: [
      {
        question: '¿Un hogar conectado es lo mismo que monitorización?',
        answer:
          'No. CasaMia se centra en vida conectada útil: iluminación, recordatorios, avisos y controles sencillos. La respuesta debe estar acordada.',
      },
      {
        question: '¿La persona tiene que saber de tecnología?',
        answer:
          'No. La experiencia debe ser simple, normalmente con voz, rutinas fáciles y apoyo familiar claro.',
      },
    ],
  },
  'home-adaptations-vs-assisted-living': {
    title: 'Adaptar la vivienda o considerar una residencia',
    seoTitle: 'Adaptar la vivienda o considerar una residencia | CasaMia',
    description:
      'Una guía práctica para comparar adaptar la vivienda con una residencia o assisted living: seguridad, comodidad, coste, tiempos y apoyo familiar.',
    eyebrow: 'Guía de decisión',
    intro:
      'Cuando la vida diaria empieza a ser más difícil, la familia suele preguntarse si conviene adaptar la casa, añadir apoyo o valorar una residencia. CasaMia ayuda a aclarar qué puede resolverse en casa primero.',
    whoFor: [
      'Familias que comparan adaptar la vivienda con una mudanza',
      'Personas mayores que quieren seguir en casa si puede ser más seguro',
      'Familiares que necesitan una forma tranquila de comparar opciones',
    ],
    priorities: [
      'Riesgo actual y apoyo diario necesario',
      'Baño, dormitorio, entrada y ruta nocturna',
      'Si las mejoras son urgentes, por fases o especialistas',
      'Disponibilidad de la familia y apoyo continuado',
    ],
    casamiaPlan: [
      'Revisar la vivienda y las rutinas antes de decisiones grandes',
      'Separar mejoras rápidas de adaptaciones mayores',
      'Explicar qué puede gestionarse en casa y qué necesita planificación de cuidados',
    ],
    relatedServices: [
      { label: 'Crear plan de seguridad', to: '/home-safety-wizard' },
      { label: 'Reservar evaluación', to: '/home-safety-assessment' },
      { label: 'Soluciones para organizaciones', to: '/assisted-living-solutions' },
    ],
    faqs: [
      {
        question: '¿Las adaptaciones pueden sustituir una residencia?',
        answer:
          'A veces pueden hacer la vida en casa más segura y cómoda, pero no sustituyen cuidados personales, médicos o supervisión continuada cuando son necesarios.',
      },
      {
        question: '¿Qué debe comparar primero la familia?',
        answer:
          'Conviene comparar las rutinas que generan presión: ducha, inodoro, cama, cocina, escaleras, movimiento nocturno y respuesta ante emergencias.',
      },
    ],
  },
  'home-safety-assessment-vs-general-contractor': {
    title: 'Evaluación de seguridad o contratista general',
    seoTitle: 'Evaluación de seguridad o contratista general | CasaMia',
    description:
      'Entiende cuándo conviene empezar con una evaluación de seguridad antes de pedir a un contratista que instale productos o presupueste trabajos.',
    eyebrow: 'Guía de decisión',
    intro:
      'Un contratista puede instalar lo que se le pide. Una evaluación de seguridad ayuda a decidir qué conviene pedir, según la persona, la rutina y el riesgo.',
    whoFor: [
      'Familias que no saben qué solicitar a instaladores',
      'Viviendas con varios posibles riesgos',
      'Personas que quieren un alcance claro antes de gastar',
    ],
    priorities: [
      'Movimiento exacto y transferencias de la persona',
      'Riesgos urgentes, recomendados u opcionales',
      'Medidas, puntos de fijación y limitaciones del espacio',
      'Un alcance que el instalador pueda presupuestar y entregar',
    ],
    casamiaPlan: [
      'Empezar por el problema diario de seguridad',
      'Convertir observaciones en un alcance orientado a paquetes',
      'Coordinar requisitos de instalación, explicación y seguimiento',
    ],
    relatedServices: [
      { label: 'Reservar evaluación', to: '/home-safety-assessment' },
      { label: 'Ver el proceso', to: '/how-it-works' },
      { label: 'Ver servicios', to: '/services' },
    ],
    faqs: [
      {
        question: '¿Debo llamar primero a un contratista?',
        answer:
          'Si el trabajo está claro y definido, puede bastar. Si la familia no sabe qué cambiar, es mejor empezar con una evaluación para que el alcance encaje con la persona.',
      },
      {
        question: '¿CasaMia también coordina la instalación?',
        answer:
          'Sí. CasaMia coordina evaluación, alcance práctico, instalación y explicación final cuando hace falta.',
      },
    ],
  },
  'smart-home-safety-vs-monitoring': {
    title: 'Seguridad conectada o monitorización',
    seoTitle: 'Seguridad conectada o monitorización para mayores | CasaMia',
    description:
      'Compara seguridad conectada, alertas sencillas y servicios de monitorización para personas mayores sin complicar la vivienda.',
    eyebrow: 'Guía de decisión',
    intro:
      'No todo dispositivo conectado es monitorización, y no toda familia necesita un servicio de vigilancia. CasaMia prioriza vida conectada útil: luz, recordatorios, avisos y rutinas simples con consentimiento claro.',
    whoFor: [
      'Familias que valoran sensores, voz o botones de emergencia',
      'Personas mayores que quieren apoyo sin sentirse vigiladas',
      'Viviendas donde la automatización sencilla reduce fricción diaria',
    ],
    priorities: [
      'Consentimiento y comodidad con la tecnología',
      'Luz nocturna, recordatorios y ayuda al alcance',
      'Quién recibe avisos y qué hace después',
      'Compatibilidad, configuración y soporte',
    ],
    casamiaPlan: [
      'Definir la experiencia antes de elegir dispositivos',
      'Configurar herramientas compatibles en rutinas sencillas',
      'Documentar reglas de respuesta para que la familia entienda qué ocurre',
    ],
    relatedServices: [
      { label: 'Enfoque tecnológico', to: '/tech' },
      { label: 'Hogar conectado para mayores', to: '/connected-home-for-seniors' },
      { label: 'Empezar plan guiado', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: '¿Seguridad conectada significa vigilancia?',
        answer:
          'No. CasaMia prioriza apoyo práctico como iluminación, recordatorios, avisos de agua y ayuda al alcance. Cualquier aviso debe acordarse y entenderse bien.',
      },
      {
        question: '¿Cuál es la configuración conectada más sencilla?',
        answer:
          'Suele empezar con un altavoz configurado, luz nocturna, llamadas fáciles, recordatorios y avisos seleccionados según la persona y la vivienda.',
      },
    ],
  },
}

export function localizeNeedLandingPage(page: NeedLandingPageContent, language: string) {
  if (!language.toLowerCase().startsWith('es')) {
    return page
  }

  const translation = spanishNeedLandingPages[page.slug]
  return translation ? { ...page, ...translation } : page
}

export function localizeNeedLandingPages(pages: NeedLandingPageContent[], language: string) {
  return pages.map((page) => localizeNeedLandingPage(page, language))
}
