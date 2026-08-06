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
  | 'riskSection'
  | 'relatedServices'
  | 'faqs'
>

const spanishNeedLandingPages: Record<string, NeedLandingPageTranslation> = {
  'bathroom-safety-for-seniors': {
    title: 'Seguridad en el baño para mayores',
    seoTitle: 'Seguridad en el baño para mayores en España',
    description:
      'Seguridad práctica en el baño para personas mayores: acceso, ducha, inodoro, apoyo antideslizante, iluminación, controles de agua e instalación coordinada por CasaMia.',
    eyebrow: 'Seguridad en el baño',
    intro:
      'Haz que ducharse, usar el inodoro y acceder al baño sea más seguro sin convertirlo en una clínica. CasaMia revisa la rutina real, recomienda la solución adecuada y coordina el trabajo.',
    whoFor: [
      'Mayores inseguros en el baño',
      'Familias preocupadas por transferencias',
      'Baños pequeños o con suelo mojado',
    ],
    priorities: [
      'Apoyo en ducha e inodoro',
      'Agarre, luz y controles de agua',
      'Acceso y puntos de apoyo',
    ],
    casamiaPlan: [
      'Revisar la rutina real',
      'Confirmar medidas y fijaciones',
      'Coordinar instalación y entrega',
    ],
    riskSection: {
      eyebrow: 'Mapa de riesgos del baño',
      title: 'Dónde suele acumularse el riesgo en el baño.',
      body:
        'El riesgo en el baño casi nunca viene de una sola cosa. Agua, transferencias, espacios estrechos, poca luz y apoyos poco claros se combinan en movimientos cotidianos.',
      image: '/images/solutions/bathroom-risk-map.png',
      imageAlt: 'Mapa anotado de baño con puntos habituales de riesgo de caída y acceso',
      risks: [
        'Alfombrilla suelta',
        'Escalón alto',
        'Entrada a ducha',
        'Altura del WC',
        'Zona mojada',
        'Cable visible',
        'Puerta estrecha',
      ],
      riskDetails: [
        {
          solution: 'Fijar la superficie',
          helps: 'CasaMia retira alfombrillas sueltas o propone opciones antideslizantes fijas en la salida de ducha.',
          product: 'Alfombrilla segura o tratamiento antideslizante.',
          stat: 'Datos de CDC sobre lesiones en el baño indican que el 81,1% fueron caídas.',
        },
        {
          solution: 'Bajar la entrada',
          helps: 'Revisamos la altura del umbral y proponemos perfil bajo, transición o corte de bañera si encaja.',
          product: 'Perfil de transición, reducción de umbral o corte de bañera.',
        },
        {
          solution: 'Añadir apoyo de transferencia',
          helps: 'Una barra fija y un asiento abatible reducen tiempo de pie y dan un apoyo claro al entrar o lavarse.',
          product: 'Barra de apoyo mural y asiento abatible de ducha.',
          stat: 'CDC encontró que el 37,3% de lesiones en el baño ocurrían al bañarse, ducharse o salir.',
        },
        {
          solution: 'Estabilizar sentarse y levantarse',
          helps: 'Elevador o barras reducen la flexión profunda y crean apoyo predecible a ambos lados.',
          product: 'Elevador de WC o barras de apoyo para inodoro.',
        },
        {
          solution: 'Mejorar agarre en mojado',
          helps: 'Identificamos zonas de salpicadura y tratamos superficies compatibles para mejorar la tracción.',
          product: 'Tratamiento antideslizante para zonas húmedas compatibles.',
        },
        {
          solution: 'Despejar la ruta',
          helps: 'Los cables se reubican, fijan o sustituyen por una colocación de luz más segura fuera del paso.',
          product: 'Gestión de cableado y luz nocturna con movimiento donde sea útil.',
        },
        {
          solution: 'Comprobar anchura útil',
          helps: 'CasaMia revisa si la puerta limita ayuda, andador o acceso de emergencia antes de proponer obra.',
          product: 'Cambios de herrajes o revisión de ensanche de puerta.',
        },
      ],
      mapLabels: ['Alfombra', 'Escalón', 'Ducha', 'Altura WC', 'Zona mojada', 'Cable', 'Puerta'],
      legend: ['Riesgo alto', 'Riesgo medio'],
    },
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
      'El dormitorio debe favorecer descanso y movimiento seguro, sobre todo de noche. CasaMia se centra en entrar y salir de la cama, rutas despejadas, iluminación y ayuda al alcance.',
    whoFor: [
      'Personas mayores que se levantan de noche y necesitan una ruta más segura al baño',
      'Personas mayores que quieren que el primer paso fuera de la cama sea más estable y tranquilo',
      'Dormitorios donde la luz, los bordes del suelo o la distribución dificultan moverse con autonomía',
    ],
    priorities: [
      'Iluminación nocturna con sensor',
      'Apoyo junto a la cama',
      'Ruta despejada de la cama a la puerta',
      'Opciones de llamada de emergencia y rutinas conectadas',
    ],
    casamiaPlan: [
      'Revisar dormitorio y rutina nocturna',
      'Recomendar mejoras principales y opcionales',
      'Instalar, configurar y explicar todo con claridad',
    ],
    riskSection: {
      eyebrow: 'Mapa de riesgo del dormitorio',
      title: 'Dónde se acumula el riesgo por la noche.',
      body:
        'El riesgo en el dormitorio suele aparecer en movimientos pequeños y medio dormidos: salir de la cama, encontrar la luz, caminar al baño y rodear muebles.',
      image: '/images/solutions/bedroom-risk-map.png',
      imageAlt: 'Mapa anotado del dormitorio con rutas nocturnas, obstáculos junto a la cama y puntos de apoyo',
      risks: [
        'Poca luz nocturna',
        'Salida de cama inestable',
        'Borde de alfombra',
        'Ruta hasta la puerta',
        'Objetos junto a la cama',
        'Falta de apoyo',
        'Umbral o cambio de suelo',
      ],
      riskDetails: [
        {
          solution: 'Iluminar el primer paso',
          helps: 'Luces bajas con sensor hacen visible la ruta cama-puerta sin encender toda la habitación.',
          product: 'Iluminación nocturna con sensor junto a la cama y en la ruta.',
        },
        {
          solution: 'Dar apoyo al levantarse',
          helps: 'Un asidero de cama bien colocado ofrece un apoyo predecible al incorporarse y ponerse de pie.',
          product: 'Asidero de cama con revisión de altura y encaje.',
        },
        {
          solution: 'Asegurar el suelo',
          helps: 'Se retiran o fijan alfombras sueltas y se mejora la zona donde apoyan los pies al levantarse.',
          product: 'Retirada de alfombras, cinta antideslizante o alfombrillas de salida junto a la cama.',
        },
        {
          solution: 'Despejar la ruta nocturna',
          helps: 'Muebles, cables y objetos se apartan del paso natural hacia la puerta o el baño.',
          product: 'Reubicación de muebles y gestión de cableado.',
        },
        {
          solution: 'Facilitar el alcance',
          helps: 'La mesilla se organiza para que gafas, teléfono, agua y luz estén al alcance sin estirarse.',
          product: 'Revisión de mesilla y almacenamiento accesible.',
        },
        {
          solution: 'Añadir apoyo estable',
          helps: 'CasaMia revisa dónde se apoya la persona de forma natural y coloca ayuda solo donde aporta seguridad.',
          product: 'Asidero junto a la cama o ajuste de mobiliario.',
        },
        {
          solution: 'Suavizar cambios de suelo',
          helps: 'Umbrales y bordes se revisan para que el recorrido sea predecible al pisar.',
          product: 'Revisión de umbral o perfil de transición si encaja.',
        },
      ],
      mapLabels: ['Luz', 'Cama', 'Alfombra', 'Ruta', 'Mesilla', 'Apoyo', 'Umbral'],
      legend: ['Riesgo alto', 'Riesgo medio'],
    },
    relatedServices: [
      { label: 'Servicios de seguridad en dormitorio', to: '/services/bedroom-safety' },
      { label: 'Guía de seguridad nocturna', to: '/blog/bedroom-night-safety-older-adults' },
      { label: 'Crear mi plan', to: '/home-safety-wizard' },
    ],
    faqs: [
      {
        question: '¿Qué hace más seguro un dormitorio?',
        answer:
          'Suele empezar por entrar y salir de la cama con más seguridad, luz nocturna, rutas despejadas, suelos seguros y una forma sencilla de pedir ayuda.',
      },
      {
        question: '¿Las funciones conectadas son opcionales?',
        answer:
          'Sí. Voz, recordatorios o alertas solo deben usarse cuando aportan comodidad y confianza.',
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
