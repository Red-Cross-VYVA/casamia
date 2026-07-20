import type { BlogArticle } from './blogContent'

type BlogArticleTranslation = Pick<
  BlogArticle,
  | 'category'
  | 'checklist'
  | 'cta'
  | 'description'
  | 'faqs'
  | 'imageAlt'
  | 'intro'
  | 'keywords'
  | 'readTime'
  | 'sections'
  | 'takeaways'
  | 'title'
>

const spanishBlogArticles: Record<string, BlogArticleTranslation> = {
  'fall-prevention-home-checklist-spain': {
    title: 'Prevención de caídas en casa: lista práctica para familias en España',
    description:
      'Una lista estancia por estancia para reducir el riesgo de caídas en viviendas de personas mayores en España.',
    category: 'Prevención de caídas',
    readTime: '7 min de lectura',
    imageAlt: 'Lista ilustrada de seguridad del hogar para prevenir caídas',
    keywords: ['prevención de caídas en casa', 'seguridad senior en España', 'lista para adaptar vivienda'],
    intro:
      'Muchas familias detectan el riesgo después de un resbalón, una caída cercana o un cambio de movilidad. Es más tranquilo revisar la vivienda antes de la urgencia y empezar por las rutinas de cada día.',
    takeaways: [
      'Empieza por baño, escaleras, dormitorio, entrada y rutas nocturnas.',
      'Prioriza iluminación, apoyos estables, rutas despejadas y transferencias más seguras.',
      'Pide una evaluación profesional cuando la familia necesite un orden claro de actuación.',
    ],
    sections: [
      {
        title: 'Empieza por cómo se mueve la persona, no por productos',
        body: [
          'El mejor plan empieza observando cómo la persona recorre la casa: dónde se detiene, qué muebles usa como apoyo, qué zonas evita y cuándo enciende la luz demasiado tarde.',
          'Esos momentos dicen más que una lista de compra. Una barra, una luz con sensor, una rampa o un cambio de mobiliario solo ayudan si encajan con la persona y la estancia.',
        ],
      },
      {
        title: 'Revisa primero las zonas de mayor riesgo',
        body: [
          'El baño combina agua, transferencias, poco espacio y superficies duras. Las escaleras y entradas añaden desniveles. El dormitorio importa porque muchas caídas ocurren de noche o con cansancio.',
          'Una secuencia práctica es baño, escaleras, dormitorio, entrada, cocina y zonas de estar. Así la familia se centra en riesgo real, no en cambiarlo todo a la vez.',
        ],
      },
      {
        title: 'Separa cambios urgentes de mejoras futuras',
        body: [
          'Algunos cambios son urgentes: ducha insegura, escaleras oscuras o un umbral alto usado cada día. Otros pueden planificarse según presupuesto, ayudas, instalación o decisiones familiares.',
          'Las evaluaciones CasaMia están pensadas para aclarar ese orden: qué conviene cambiar ahora, qué observar y qué puede esperar.',
        ],
      },
    ],
    checklist: [
      '¿Puede llegar al baño de noche sin caminar a oscuras?',
      '¿Hay apoyo estable en escaleras o desniveles donde hace falta?',
      '¿Las alfombras, cables y felpudos están retirados o fijados?',
      '¿Puede entrar, usar y salir de la ducha sin agarrarse a muebles?',
      '¿La ayuda de emergencia está al alcance desde dormitorio y baño?',
    ],
    faqs: [
      {
        question: '¿Qué conviene arreglar primero para reducir caídas?',
        answer:
          'Empieza por la ruta o estancia que se usa más y donde la persona ya se siente insegura. En muchas viviendas es el baño, las escaleras o el camino de la cama al baño por la noche.',
      },
      {
        question: '¿Todas las personas mayores necesitan barras de apoyo?',
        answer:
          'No siempre. Ayudan cuando son necesarias, están bien colocadas y están fijadas a una superficie adecuada. Hay que revisar movilidad, transferencias, tipo de pared y hábitos.',
      },
    ],
    cta: { label: 'Reservar evaluación de seguridad', to: '/home-safety-assessment' },
  },
  'bathroom-safety-seniors-costly-mistakes': {
    title: 'Seguridad en el baño para mayores: 7 errores que conviene evitar',
    description:
      'Errores habituales al adaptar un baño para una persona mayor, desde barras de ventosa hasta accesos de ducha poco seguros.',
    category: 'Seguridad en el baño',
    readTime: '6 min de lectura',
    imageAlt: 'Ilustración de errores de seguridad en el baño',
    keywords: ['seguridad baño mayores', 'barras de apoyo España', 'baño accesible personas mayores'],
    intro:
      'El baño suele ser la primera estancia que una familia quiere adaptar, pero las decisiones rápidas pueden dar una falsa sensación de seguridad. El objetivo no es llenar el baño de productos, sino hacer más seguros los movimientos reales.',
    takeaways: [
      'No uses toalleros, barras de ventosa o muebles como apoyo principal.',
      'Planifica ducha, inodoro, iluminación y suelo como un conjunto.',
      'La instalación es tan importante como el producto elegido.',
    ],
    sections: [
      {
        title: 'Error 1: pensar que todas las barras son iguales',
        body: [
          'Una barra solo sirve si está en la posición adecuada para el movimiento que debe apoyar: entrar en la ducha, levantarse del inodoro o girar cerca del lavabo.',
          'También importan la pared y la fijación. Una barra mal instalada puede ser peor que no tener barra, porque invita a confiar en un apoyo que no resiste.',
        ],
      },
      {
        title: 'Error 2: olvidar el umbral de la ducha',
        body: [
          'A menudo se compra una silla de ducha, pero se mantiene un escalón alto. Levantar el pie sobre un borde mojado, con cansancio o poco apoyo, sigue siendo peligroso.',
          'Un buen plan revisa entrada, asiento, ducha de mano, drenaje y dónde se alcanzan toallas o ropa al salir.',
        ],
      },
      {
        title: 'Error 3: comprar antes de medir la rutina',
        body: [
          'Los productos deben seguir la rutina de la persona: si se ducha sola, necesita ayuda, usa bastón, se fatiga o se desorienta.',
          'La adaptación correcta suele combinar producto, distribución, instalación y pequeños cambios de hábito.',
        ],
      },
    ],
    checklist: [
      'Comprueba si puede sentarse, levantarse, girar y alcanzar sin tirar de elementos inseguros.',
      'Revisa suelos mojados y alfombrillas.',
      'Confirma que hay luz suficiente en la ruta nocturna y dentro del baño.',
      'Mide el umbral y la apertura de la ducha.',
      'Piensa dónde puede ayudar una persona cuidadora sin ponerse en riesgo.',
    ],
    faqs: [
      {
        question: '¿Son seguras las barras de ventosa?',
        answer:
          'No deben usarse como apoyo principal para soportar peso. Cuando la seguridad depende del apoyo, conviene usar fijaciones profesionales.',
      },
      {
        question: '¿Una ducha a ras de suelo siempre es lo mejor?',
        answer:
          'Depende de movilidad, distribución, drenaje, presupuesto y urgencia. A veces primero hacen falta apoyos, iluminación y medidas antideslizantes.',
      },
    ],
    cta: { label: 'Ver servicios para baño', to: '/services/bathroom-safety' },
  },
  'home-adaptation-grants-spain-family-guide': {
    title: 'Ayudas para adaptar viviendas en España: qué debe preparar una familia',
    description:
      'Guía práctica para preparar ayudas de adaptación del hogar en España: documentos, alcance, requisitos y expectativas realistas.',
    category: 'Ayudas y financiación',
    readTime: '8 min de lectura',
    imageAlt: 'Ilustración de documentos para preparar una solicitud de ayuda',
    keywords: ['ayudas adaptación vivienda España', 'Plan Adapta', 'subvenciones accesibilidad vivienda'],
    intro:
      'Las ayudas pueden facilitar la adaptación de una vivienda, pero conviene prepararlas con documentos y expectativas claras. Las reglas cambian según comunidad, municipio y programa.',
    takeaways: [
      'Las convocatorias varían por comunidad autónoma y municipio.',
      'Un alcance claro de trabajos mejora la preparación.',
      'Ningún proveedor debe prometer aprobación: decide la administración.',
    ],
    sections: [
      {
        title: 'Define primero la necesidad de seguridad',
        body: [
          'Una solicitud se entiende mejor cuando conecta los trabajos con una necesidad concreta de movilidad, accesibilidad o prevención.',
          'Puede tratarse de acceso seguro al baño, cambios de umbral, rampas cuando sean adecuadas, apoyo en escaleras o adaptación vinculada a dependencia o discapacidad.',
        ],
      },
      {
        title: 'Prepara documentos con antelación',
        body: [
          'Pueden pedirse DNI/NIE, residencia, propiedad o alquiler, certificados, presupuestos, facturas, fotos y descripción de trabajos.',
          'La lista exacta depende del programa. Preparar antes evita prisas cuando se abre una convocatoria.',
        ],
      },
      {
        title: 'Mantén expectativas realistas',
        body: [
          'Los fondos pueden ser limitados, competitivos, temporales o restringidos a ciertos trabajos. Algunos programas reembolsan después; otros exigen aprobación previa.',
          'CasaMia puede ayudarte a estar preparado, pero la aprobación y el pago dependen siempre de la administración.',
        ],
      },
    ],
    checklist: [
      'Confirma ubicación y programa local relevante.',
      'Reúne documentos de residente y vivienda.',
      'Fotografía acceso, baño, escaleras y zonas de riesgo.',
      'Prepara un presupuesto o propuesta con partidas claras.',
      'Comprueba si se puede empezar antes de la aprobación.',
    ],
    faqs: [
      {
        question: '¿CasaMia puede garantizar una ayuda?',
        answer:
          'No. CasaMia puede apoyar la preparación, documentación y alcance, pero la administración decide elegibilidad, aprobación y pago.',
      },
      {
        question: '¿Conviene adaptar la vivienda antes de solicitar?',
        answer:
          'Depende de las reglas del programa y de la urgencia. Algunas ayudas exigen aprobación previa; una necesidad de seguridad urgente puede requerir actuar antes.',
      },
    ],
    cta: { label: 'Comprobar preparación para ayudas', to: '/grant-check' },
  },
  'smart-home-safety-without-overcomplicating': {
    title: 'Seguridad inteligente sin complicar la casa',
    description:
      'Cómo usar tecnología en el hogar de una persona mayor sin invadir, abrumar ni depender de sistemas difíciles de mantener.',
    category: 'Tecnología sencilla',
    readTime: '6 min de lectura',
    imageAlt: 'Ilustración de tecnología doméstica sencilla para seguridad',
    keywords: ['seguridad inteligente mayores', 'tecnología hogar mayores', 'sensores seguridad casa'],
    intro:
      'La tecnología debe hacer la casa más fácil, no más difícil. En hogares con personas mayores, lo importante es elegir señales útiles, respuestas claras y controles que la familia pueda entender.',
    takeaways: [
      'Empieza por riesgos concretos: noche, baño, entrada, medicación o emergencia.',
      'Evita sistemas que requieran demasiada configuración diaria.',
      'La mejor tecnología se combina con instalación, soporte y consentimiento.',
    ],
    sections: [
      {
        title: 'Menos dispositivos, mejores señales',
        body: [
          'No hace falta convertir toda la casa en un laboratorio. A menudo basta con iluminación automática, aviso de emergencia, sensores discretos o rutinas simples.',
          'Cada dispositivo debe responder a una pregunta clara: ¿hay riesgo de caída?, ¿se ha pedido ayuda?, ¿la ruta nocturna está iluminada?',
        ],
      },
      {
        title: 'Respeta privacidad y comodidad',
        body: [
          'Muchas familias quieren seguridad sin cámaras ni vigilancia constante. Existen opciones ambientales y wearables que pueden aportar información sin invadir la vida diaria.',
          'La conversación con la persona que vive en la casa es parte de la solución: qué acepta, qué entiende y qué está dispuesta a usar.',
        ],
      },
      {
        title: 'Piensa en quién responde',
        body: [
          'Un aviso solo sirve si alguien sabe qué hacer. La tecnología debe conectarse a una respuesta familiar, profesional o de servicio.',
          'CasaMia ayuda a elegir soluciones que encajan con la vivienda y con la capacidad real de seguimiento.',
        ],
      },
    ],
    checklist: [
      'Identifica el riesgo que quieres detectar o reducir.',
      'Evita duplicar dispositivos que nadie revisará.',
      'Comprueba cobertura Wi‑Fi, batería y mantenimiento.',
      'Aclara quién recibe avisos y en qué horario.',
      'Revisa consentimiento y privacidad antes de instalar.',
    ],
    faqs: [
      {
        question: '¿Hace falta tener cámaras para mejorar la seguridad?',
        answer:
          'No. Muchas mejoras funcionan sin cámaras: iluminación, sensores ambientales, botones de ayuda, detección discreta y rutinas conectadas.',
      },
      {
        question: '¿Qué pasa si la persona no quiere llevar un dispositivo?',
        answer:
          'Hay que respetarlo y buscar alternativas ambientales o cambios físicos. La solución debe adaptarse a la persona, no al revés.',
      },
    ],
    cta: { label: 'Ver tecnología CasaMia', to: '/tech' },
  },
  'choose-home-safety-provider-spain': {
    title: 'Cómo elegir un proveedor de seguridad del hogar para una persona mayor',
    description:
      'Criterios prácticos para elegir apoyo profesional: evaluación, instalación, claridad de precios, seguimiento y responsabilidad.',
    category: 'Elegir proveedor',
    readTime: '7 min de lectura',
    imageAlt: 'Familia revisando opciones de adaptación del hogar',
    keywords: ['proveedor seguridad hogar mayores', 'adaptar vivienda España', 'empresa adaptación hogar'],
    intro:
      'Elegir proveedor no debería ser una carrera por comprar productos. La familia necesita entender riesgos, prioridades, coste, instalación y seguimiento antes de decidir.',
    takeaways: [
      'Busca evaluación clara antes de presupuesto cerrado.',
      'Pide alcance, precios, responsabilidades y seguimiento por escrito.',
      'El proveedor debe coordinar personas, productos e instalación.',
    ],
    sections: [
      {
        title: 'Pide una evaluación práctica',
        body: [
          'Un buen proveedor pregunta por movilidad, rutinas, estancias críticas, ayudas familiares y urgencia. No empieza vendiendo una lista estándar.',
          'La evaluación debe terminar en prioridades claras: qué resolver ahora, qué planificar y qué no hace falta todavía.',
        ],
      },
      {
        title: 'Comprueba instalación y soporte',
        body: [
          'La seguridad depende de cómo se instala y de quién responde si algo falla. Pregunta por profesionales, garantías, tiempos y revisión final.',
          'También importa que la familia reciba una explicación sencilla del resultado y de cómo usar los cambios.',
        ],
      },
      {
        title: 'Evita presupuestos confusos',
        body: [
          'El alcance debe estar separado por estancia o necesidad, con IVA, instalación y exclusiones claras.',
          'CasaMia está diseñado como solución llave en mano para reducir la carga de coordinar proveedores, fechas y decisiones técnicas.',
        ],
      },
    ],
    checklist: [
      '¿La evaluación se centra en rutinas reales?',
      '¿El presupuesto separa productos, instalación y soporte?',
      '¿Hay responsable único para coordinar el proyecto?',
      '¿Se explica qué es urgente y qué puede esperar?',
      '¿La familia sabe cómo pedir ayuda después?',
    ],
    faqs: [
      {
        question: '¿Es mejor contratar instaladores por separado?',
        answer:
          'Puede funcionar para trabajos simples, pero muchas familias prefieren un servicio coordinado cuando hay varias estancias, ayudas, tecnología o seguimiento.',
      },
      {
        question: '¿Qué debe incluir una propuesta seria?',
        answer:
          'Necesidad detectada, solución recomendada, alcance, precio, plazo, instalación, garantías y próximos pasos claros.',
      },
    ],
    cta: { label: 'Por qué CasaMia', to: '/why-us' },
  },
  'dementia-friendly-home-safety': {
    title: 'Seguridad del hogar para demencia: cambios sencillos que reducen confusión',
    description:
      'Ideas prácticas para hacer la vivienda más comprensible, tranquila y segura cuando hay deterioro cognitivo o desorientación.',
    category: 'Demencia y orientación',
    readTime: '6 min de lectura',
    imageAlt: 'Hogar con señales visuales sencillas para orientación',
    keywords: ['hogar amigable demencia', 'seguridad demencia casa', 'adaptar vivienda deterioro cognitivo'],
    intro:
      'Cuando hay demencia o desorientación, la seguridad no depende solo de barras o luces. También importa que la vivienda sea fácil de entender, con menos obstáculos y rutinas más previsibles.',
    takeaways: [
      'Reduce ruido visual y decisiones innecesarias.',
      'Mejora iluminación, contraste y rutas conocidas.',
      'Mantén objetos importantes visibles y siempre en el mismo lugar.',
    ],
    sections: [
      {
        title: 'Haz que las rutas importantes sean obvias',
        body: [
          'La ruta al baño, la salida y el dormitorio deben ser fáciles de reconocer. La iluminación suave, el contraste y señales discretas pueden ayudar.',
          'Evita reorganizar toda la casa de golpe. Los cambios bruscos pueden aumentar confusión.',
        ],
      },
      {
        title: 'Reduce decisiones y obstáculos',
        body: [
          'Demasiados objetos, alfombras, cables o muebles bajos pueden provocar tropiezos y frustración.',
          'La clave es despejar rutas y dejar visibles los objetos que la persona usa a diario.',
        ],
      },
      {
        title: 'Cuida seguridad sin encerrar',
        body: [
          'Puede ser necesario revisar cocina, puertas, agua caliente, medicación y salidas. La solución debe equilibrar autonomía, dignidad y protección.',
          'CasaMia puede ayudar a priorizar cambios según la rutina y el nivel de apoyo familiar.',
        ],
      },
    ],
    checklist: [
      '¿La ruta al baño está clara de día y de noche?',
      '¿Hay contraste suficiente en escalones, interruptores y puertas?',
      '¿Los objetos importantes están siempre en el mismo lugar?',
      '¿La cocina tiene medidas para reducir olvidos o riesgos?',
      '¿La familia sabe qué señales de cambio debe observar?',
    ],
    faqs: [
      {
        question: '¿Conviene poner muchas señales en casa?',
        answer:
          'Solo las necesarias. Demasiadas señales pueden saturar. Es mejor usar pocas, claras y colocadas donde realmente ayudan.',
      },
      {
        question: '¿La tecnología ayuda en demencia?',
        answer:
          'Puede ayudar si es discreta y sencilla, pero no sustituye una vivienda ordenada, rutinas previsibles y apoyo humano.',
      },
    ],
    cta: { label: 'Solicitar revisión del hogar', to: '/home-safety-assessment' },
  },
  'stair-safety-handrails-older-adults': {
    title: 'Seguridad en escaleras para personas mayores: pasamanos, luz y contraste',
    description:
      'Cómo revisar escaleras interiores y exteriores para reducir tropiezos, mejorar apoyo y hacer los desniveles más visibles.',
    category: 'Escaleras y desniveles',
    readTime: '6 min de lectura',
    imageAlt: 'Escalera con pasamanos, iluminación y contraste',
    keywords: ['seguridad escaleras mayores', 'pasamanos personas mayores', 'contraste escalones'],
    intro:
      'Las escaleras combinan esfuerzo, equilibrio y visión. Pequeñas mejoras en apoyo, iluminación y contraste pueden cambiar mucho la confianza al subir y bajar.',
    takeaways: [
      'Revisa pasamanos, iluminación, superficie y contraste juntos.',
      'Las rutas exteriores también cuentan: entrada, portal, garaje o jardín.',
      'No esperes a una caída si la persona ya evita la escalera.',
    ],
    sections: [
      {
        title: 'El apoyo debe estar donde se usa',
        body: [
          'Un pasamanos útil permite apoyar la mano antes de empezar y después de terminar el tramo. Si termina demasiado pronto, deja puntos inseguros.',
          'En algunos casos hace falta apoyo a ambos lados o continuidad en descansillos.',
        ],
      },
      {
        title: 'La luz y el contraste reducen errores',
        body: [
          'Sombras, bombillas débiles o escalones del mismo color dificultan ver el borde. El contraste visual ayuda especialmente con baja visión.',
          'También conviene revisar interruptores: deben ser alcanzables al inicio y al final del tramo.',
        ],
      },
      {
        title: 'No olvides exterior y entrada',
        body: [
          'Un solo escalón en entrada o terraza puede ser tan problemático como una escalera larga si se usa todos los días.',
          'CasaMia revisa desniveles interiores y exteriores para ordenar prioridades.',
        ],
      },
    ],
    checklist: [
      '¿Hay apoyo continuo al inicio, durante y al final?',
      '¿Los bordes de escalón se ven bien?',
      '¿La luz evita sombras fuertes?',
      '¿La superficie resbala o está desgastada?',
      '¿Hay objetos en descansillos o rutas de paso?',
    ],
    faqs: [
      {
        question: '¿Cuándo hace falta un segundo pasamanos?',
        answer:
          'Cuando la persona necesita apoyo en ambos lados, cuando el tramo es estrecho o cuando subir y bajar con una sola mano resulta inseguro.',
      },
      {
        question: '¿El contraste de escalones es realmente útil?',
        answer:
          'Sí, puede ayudar a identificar el borde del escalón, especialmente con poca luz o visión reducida.',
      },
    ],
    cta: { label: 'Ver servicios de entrada y movilidad', to: '/services/entryway-safety' },
  },
  'kitchen-safety-aging-in-place': {
    title: 'Seguridad en cocina para envejecer en casa',
    description:
      'Cómo reducir riesgos de alcance, flexión, calor, agua y electrodomésticos sin quitar independencia en la cocina.',
    category: 'Cocina y rutinas',
    readTime: '6 min de lectura',
    imageAlt: 'Cocina organizada para una persona mayor',
    keywords: ['seguridad cocina mayores', 'adaptar cocina persona mayor', 'envejecer en casa cocina'],
    intro:
      'La cocina es una zona de autonomía, pero también mezcla calor, agua, peso, alcance y movimiento. La adaptación debe proteger sin quitar control innecesariamente.',
    takeaways: [
      'Reduce alcance alto, flexión baja y transporte de objetos pesados.',
      'Revisa iluminación, suelo, agua, calor y electrodomésticos.',
      'Organizar bien puede ser tan importante como instalar productos.',
    ],
    sections: [
      {
        title: 'Acerca lo cotidiano',
        body: [
          'Los objetos usados a diario deben quedar entre la cintura y los hombros. Evita taburetes, armarios muy altos y cajones bajos para productos pesados.',
          'Una reorganización sencilla puede reducir muchas posturas inseguras.',
        ],
      },
      {
        title: 'Reduce riesgos de calor y agua',
        body: [
          'Revisa fogones, horno, hervidor, grifos, fugas y superficies mojadas. Si hay olvidos, conviene añadir rutinas o dispositivos de seguridad.',
          'La solución puede incluir detectores, corte automático o cambios de uso, según la persona.',
        ],
      },
      {
        title: 'Mantén independencia con apoyos claros',
        body: [
          'El objetivo no es prohibir la cocina, sino hacerla más previsible y fácil de usar.',
          'CasaMia separa mejoras rápidas, reorganización y trabajos que requieren instalación.',
        ],
      },
    ],
    checklist: [
      '¿Los objetos diarios están a altura cómoda?',
      '¿Hay buena luz en encimera y zona de cocción?',
      '¿El suelo se mantiene seco y despejado?',
      '¿Hay riesgo de olvidar fuego, agua o electrodomésticos?',
      '¿Puede transportar comida o bebidas sin perder equilibrio?',
    ],
    faqs: [
      {
        question: '¿Hay que reformar toda la cocina?',
        answer:
          'No necesariamente. Muchas mejoras empiezan con organización, iluminación, superficies antideslizantes y ayudas puntuales.',
      },
      {
        question: '¿Qué pasa si la persona cocina sola?',
        answer:
          'Conviene revisar rutinas reales y acordar medidas proporcionales: recordatorios, detectores, organización y respuesta si algo ocurre.',
      },
    ],
    cta: { label: 'Ver seguridad en cocina', to: '/services/kitchen-safety' },
  },
  'bedroom-night-safety-older-adults': {
    title: 'Seguridad en dormitorio y noche para personas mayores',
    description:
      'Cambios prácticos para levantarse, llegar al baño y pedir ayuda durante la noche con menos riesgo.',
    category: 'Dormitorio y noche',
    readTime: '5 min de lectura',
    imageAlt: 'Dormitorio con ruta nocturna segura e iluminación suave',
    keywords: ['seguridad nocturna mayores', 'dormitorio persona mayor', 'ruta cama baño'],
    intro:
      'La noche aumenta el riesgo: hay sueño, poca luz, urgencia para ir al baño y menos personas cerca. Por eso el dormitorio y la ruta nocturna merecen atención especial.',
    takeaways: [
      'Revisa cama, luz, ruta al baño y ayuda de emergencia juntos.',
      'Evita levantarse a oscuras o buscar objetos en el suelo.',
      'La solución debe ser fácil incluso con sueño.',
    ],
    sections: [
      {
        title: 'La ruta debe estar preparada antes de dormir',
        body: [
          'La persona no debería tener que buscar interruptores, gafas, bastón o teléfono a oscuras.',
          'Una luz de presencia, objetos al alcance y ruta despejada reducen decisiones en un momento vulnerable.',
        ],
      },
      {
        title: 'Revisa cama y transferencias',
        body: [
          'La altura de la cama, alfombras cercanas, mesilla y apoyo al levantarse influyen en la estabilidad.',
          'Si la persona se levanta varias veces, conviene revisar también fatiga y frecuencia de uso del baño.',
        ],
      },
      {
        title: 'La ayuda debe poder pedirse desde la cama',
        body: [
          'Un teléfono descargado o lejos no sirve. El sistema de aviso debe estar accesible y tener una persona o servicio que responda.',
          'CasaMia revisa la ruta completa: cama, baño, iluminación, apoyo y aviso.',
        ],
      },
    ],
    checklist: [
      '¿La luz se enciende sin caminar a oscuras?',
      '¿El camino al baño está libre de alfombras y cables?',
      '¿La cama tiene altura adecuada para levantarse?',
      '¿Gafas, bastón, agua y teléfono están al alcance?',
      '¿Hay plan si necesita ayuda de noche?',
    ],
    faqs: [
      {
        question: '¿Sirven las luces con sensor?',
        answer:
          'Sí, si iluminan la ruta sin deslumbrar y se colocan donde realmente se necesita luz.',
      },
      {
        question: '¿Qué revisar si hay muchas visitas nocturnas al baño?',
        answer:
          'Además de la ruta, conviene comentar la frecuencia con un profesional sanitario y revisar iluminación, apoyo y urgencia.',
      },
    ],
    cta: { label: 'Crear plan de seguridad', to: '/home-safety-wizard' },
  },
  'emergency-plan-aging-parents-home': {
    title: 'Plan de emergencia para padres mayores que viven en casa',
    description:
      'Cómo preparar contactos, accesos, avisos y decisiones para que una emergencia en casa tenga una respuesta clara.',
    category: 'Plan de emergencia',
    readTime: '6 min de lectura',
    imageAlt: 'Familia preparando un plan de emergencia para una persona mayor',
    keywords: ['plan emergencia padres mayores', 'seguridad personas mayores casa', 'aviso emergencia hogar'],
    intro:
      'Un plan de emergencia no tiene que ser complejo. Debe responder a tres preguntas: qué puede pasar, cómo se pide ayuda y quién responde.',
    takeaways: [
      'Define contactos, llaves, datos médicos básicos y respuesta.',
      'Pon la ayuda al alcance en dormitorio, baño y zonas de uso diario.',
      'Revisa el plan después de cambios de salud o movilidad.',
    ],
    sections: [
      {
        title: 'Empieza por escenarios realistas',
        body: [
          'Piensa en una caída, mareo, puerta cerrada, corte de luz, fuga de agua o desorientación. No hace falta imaginar todo, solo lo más probable.',
          'Cada escenario debe tener una acción simple y una persona responsable.',
        ],
      },
      {
        title: 'Haz visible la información esencial',
        body: [
          'Contactos, medicación relevante, alergias, médico, seguro y acceso a llaves deben estar ordenados y disponibles para quien responde.',
          'La información sensible debe compartirse solo con personas autorizadas.',
        ],
      },
      {
        title: 'Prueba el sistema de aviso',
        body: [
          'El botón, teléfono, wearable o llamada debe probarse antes de necesitarlo. También hay que saber quién recibe el aviso y qué hará.',
          'CasaMia ayuda a conectar seguridad física, dispositivos y respuesta familiar o profesional.',
        ],
      },
    ],
    checklist: [
      '¿Quién recibe el primer aviso?',
      '¿Cómo entra alguien si la persona no puede abrir?',
      '¿La ayuda está al alcance desde cama y baño?',
      '¿Hay lista actualizada de contactos y datos clave?',
      '¿Se ha probado el plan en los últimos meses?',
    ],
    faqs: [
      {
        question: '¿Un móvil es suficiente como plan de emergencia?',
        answer:
          'Puede ayudar, pero solo si está cargado, al alcance y la persona puede usarlo en una situación de estrés.',
      },
      {
        question: '¿Cada cuánto se revisa el plan?',
        answer:
          'Conviene revisarlo cuando cambian movilidad, medicación, personas de apoyo, llaves o dispositivos.',
      },
    ],
    cta: { label: 'Hablar con CasaMia', to: '/order' },
  },
}

export function localizeBlogArticle(article: BlogArticle, language: string): BlogArticle {
  if (!language.toLowerCase().startsWith('es')) {
    return article
  }

  const translation = spanishBlogArticles[article.id]

  return translation ? { ...article, ...translation } : article
}

export function localizeBlogArticles(articles: BlogArticle[], language: string): BlogArticle[] {
  return articles.map((article) => localizeBlogArticle(article, language))
}
