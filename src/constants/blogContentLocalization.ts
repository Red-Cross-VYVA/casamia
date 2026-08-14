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
  | 'resources'
  | 'sections'
  | 'takeaways'
  | 'title'
>

const spanishBlogArticles: Record<string, BlogArticleTranslation> = {
  'fall-prevention-home-checklist-spain': {
    title: 'Prevención de caídas en casa: lista práctica para familias en España',
    description:
      'Lista práctica para reducir el riesgo de caídas en casa: rutinas, señales de alarma, prioridades y recursos fiables para familias.',
    category: 'Prevención de caídas',
    readTime: '10 min de lectura',
    imageAlt: 'Lista ilustrada de seguridad del hogar para prevenir caídas',
    keywords: ['prevención de caídas en casa', 'seguridad senior en España', 'lista para adaptar vivienda'],
    intro:
      'La mayoría de caídas no se explican por un único problema. El riesgo aumenta cuando cambios de salud, medicación, visión, calzado, iluminación, suelos, muebles y prisas se juntan en el mismo momento. Una buena lista ayuda a detectar esas combinaciones antes de que ocurra una caída.',
    takeaways: [
      'Recorre la vivienda por rutina: levantarse, asearse, vestirse, cocinar, salir de casa e ir al baño por la noche.',
      'Prioriza alfombras sueltas, mala iluminación, transferencias sin apoyo, escaleras, baño y ayuda de emergencia.',
      'Una caída reciente, casi caída, mareos, cambio de medicación u hospitalización justifican revisar la vivienda cuanto antes.',
      'Combina cambios en casa con revisión de salud: vista, calzado, fuerza, equilibrio y medicación también importan.',
    ],
    sections: [
      {
        title: 'Empieza por los momentos donde ocurren las caídas',
        body: [
          'Recorre el día con la persona: levantarse de la cama, llegar al baño, entrar en la ducha, preparar comida, llevar ropa, abrir la puerta y levantarse de noche. Anota dónde se detiene, corre, se apoya en muebles o evita pasar.',
          'Esos detalles valen más que una lista de compra. Una barra, pasamanos, luz con sensor, cambio de umbral o ajuste de muebles solo ayuda si apoya el movimiento real que la persona ya intenta hacer.',
        ],
      },
      {
        title: 'Retira tropiezos, pero no te quedes ahí',
        body: [
          'Alfombras sueltas, felpudos levantados, cables, rutas con objetos y muebles inestables deben resolverse rápido. Pero muchas familias se quedan ahí y no revisan lo importante: falta de apoyo en transferencias, interruptores lejos, calzado que resbala o una ruta nocturna al baño mal iluminada.',
          'Una secuencia útil es baño, ruta dormitorio-baño, escaleras, entrada, cocina y zonas de estar. Así la familia se centra en riesgo diario, no en reformar todo a la vez.',
        ],
      },
      {
        title: 'Separa arreglos urgentes de adaptaciones planificadas',
        body: [
          'Los cambios urgentes son los que pueden causar daño esta semana: ducha mojada sin apoyo, escalera oscura, umbral alto usado cada día, transferencia difícil al inodoro o teléfono fuera de alcance. Las adaptaciones planificadas también importan, pero pueden requerir medición, presupuesto, permisos o ayudas.',
          'CasaMia ayuda a ordenar ese mapa: qué retirar hoy, qué adaptar primero, qué necesita propuesta y qué puede observar la familia con calma.',
        ],
      },
      {
        title: 'Conecta la revisión de casa con la salud',
        body: [
          'Una vivienda puede hacerse más segura, pero prevenir caídas no es solo obra. Pregunta si hay mareos, dolor, cambios de visión, problemas de pies, medicación nueva, urgencia para ir al baño, confusión, debilidad o miedo a caer.',
          'El plan familiar debe repartir responsabilidades: despejar rutas, instalar apoyos, mejorar iluminación, consultar medicación con un profesional, probar la ayuda de emergencia y revisar si los cambios funcionan.',
        ],
      },
    ],
    checklist: [
      'Recorre cada ruta diaria y marca dónde la persona busca pared, mueble o marco de puerta.',
      'Retira o fija alfombras, felpudos, cables, muebles bajos y objetos de paso.',
      'Comprueba cama, inodoro y sillón favorito: deben permitir levantarse sin tirar de muebles inestables.',
      'Haz visible la ruta de cama a baño por la noche, sin deslumbrar.',
      'Confirma apoyo estable en escaleras, escalones y umbrales donde realmente hace falta.',
      'Revisa ducha, suelo mojado, toallas y entrada al baño como un conjunto.',
      'Deja teléfono, botón o sistema de ayuda al alcance desde cama y baño.',
      'Consulta con un profesional si hay mareos, cambios de medicación, visión, dolor de pies o casi caídas repetidas.',
    ],
    resources: [
      {
        title: 'Lista Check for Safety',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'Lista estancia por estancia para revisar suelos, escaleras, cocina, baño, dormitorio e iluminación.',
      },
      {
        title: 'Prevención de caídas y fracturas',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/falls-and-falls-prevention/prevent-falls-and-fractures',
        description:
          'Guía sobre ejercicio, visión, medicación, salud y cambios en casa que conviene combinar.',
      },
      {
        title: 'Prevenir caídas en casa',
        source: 'MedlinePlus',
        href: 'https://medlineplus.gov/ency/patientinstructions/000052.htm',
        description:
          'Consejos claros para baño, dormitorio, escaleras, iluminación, calzado y movimiento diario.',
      },
    ],
    faqs: [
      {
        question: '¿Qué conviene arreglar primero para reducir caídas?',
        answer:
          'Empieza por la ruta o movimiento que sea frecuente y ya resulte inseguro. En muchas viviendas es el baño, las escaleras, la entrada o el camino de la cama al baño por la noche.',
      },
      {
        question: '¿Todas las personas mayores necesitan barras de apoyo?',
        answer:
          'No siempre. Ayudan cuando son necesarias, están bien colocadas y están fijadas a una superficie adecuada. Hay que revisar movilidad, transferencias, tipo de pared y hábitos.',
      },
      {
        question: '¿Cuándo conviene pedir ayuda profesional?',
        answer:
          'Cuando ya hubo una caída o casi caída, la persona cambia su forma de moverse, hay varias estancias implicadas o la familia no sabe qué obra debe ir primero.',
      },
    ],
    cta: { label: 'Reservar evaluación de seguridad', to: '/home-safety-assessment' },
  },
  'bathroom-safety-seniors-costly-mistakes': {
    title: 'Seguridad en el baño para mayores: 7 errores que conviene evitar',
    description:
      'Errores habituales al adaptar un baño para una persona mayor: apoyos inseguros, ducha, inodoro, suelo mojado y controles de agua.',
    category: 'Seguridad en el baño',
    readTime: '9 min de lectura',
    imageAlt: 'Ilustración de errores de seguridad en el baño',
    keywords: ['seguridad baño mayores', 'barras de apoyo España', 'baño accesible personas mayores'],
    intro:
      'El baño combina agua, superficies duras, urgencia, poco espacio y transferencias. Por eso una compra rápida puede dar falsa seguridad: el baño parece más seguro, pero la persona sigue teniendo que entrar, girar, alcanzar o levantarse sin el apoyo correcto.',
    takeaways: [
      'Planifica el movimiento, no solo el producto: entrar, lavarse, girar, secarse, usar el inodoro y salir.',
      'No uses toalleros, barras de ventosa o muebles como apoyo para soportar peso.',
      'Revisa ducha, inodoro, agarre del suelo, iluminación, controles de agua y ayuda de emergencia como un conjunto.',
      'La colocación e instalación importan tanto como el equipo elegido.',
    ],
    sections: [
      {
        title: 'Error 1: pensar que cualquier apoyo es seguro',
        body: [
          'Toalleros, bordes del lavabo, mamparas y barras de ventosa se usan a menudo como pasamanos, pero no son apoyos fiables para soportar peso. Si la persona confía en el objeto equivocado, el riesgo aumenta.',
          'Una barra solo ayuda si está colocada para el movimiento que debe apoyar. Entrar en la ducha, levantarse del inodoro, girar cerca del lavabo y secarse al salir pueden necesitar puntos de apoyo distintos.',
        ],
      },
      {
        title: 'Error 2: arreglar el asiento y olvidar la entrada',
        body: [
          'A menudo se compra un taburete o asiento abatible, pero se mantiene una bañera alta, una puerta estrecha o una entrada resbaladiza. Si la persona todavía debe levantar el pie sobre un borde mojado o sin apoyo, el riesgo principal sigue ahí.',
          'Un buen plan revisa altura de entrada, superficie antideslizante, asiento, alcance de los mandos de agua, drenaje, mampara o cortina, toallas y dónde puede colocarse una persona que ayuda.',
        ],
      },
      {
        title: 'Error 3: olvidar el inodoro y el uso nocturno',
        body: [
          'Muchas caídas tienen que ver con urgencia, cansancio o ir al baño de noche. La zona del inodoro necesita espacio, apoyo lateral cuando haga falta, papel al alcance, buena luz y una ruta sin giros difíciles.',
          'Comprueba cómo llega la persona desde la cama, si usa bastón o andador, si la puerta abre de forma segura y si la ayuda de emergencia está al alcance.',
        ],
      },
      {
        title: 'Error 4: separar temperatura, agarre y alcance',
        body: [
          'Los mandos de agua pueden ser difíciles cuando cambian la fuerza de mano, la vista o la reacción. Si la persona no puede regular temperatura, accionar los controles o cerrar el agua sentada, el baño puede seguir siendo inseguro.',
          'Mandos termostáticos, controles claros y almacenaje alcanzable pueden ayudar, pero deben encajar con la instalación, paredes y hábitos reales.',
        ],
      },
    ],
    checklist: [
      'Observa entrada, lavado, giro, secado, inodoro y salida si la persona acepta ser acompañada.',
      'Retira o cambia alfombrillas y objetos que se deslicen con el suelo mojado.',
      'Confirma apoyo antes, durante y después de entrar en ducha o bañera.',
      'Revisa si altura del inodoro y apoyo lateral permiten levantarse sin tirar de lavabo o toallero.',
      'Haz alcanzables mandos, jabón, toallas y ropa sin girar ni agacharse.',
      'Añade iluminación nocturna sin deslumbrar desde dormitorio hasta baño y dentro del baño.',
      'Deja una forma de pedir ayuda al alcance desde el baño.',
      'Planifica dónde puede colocarse una persona cuidadora sin bloquear ni resbalar.',
    ],
    resources: [
      {
        title: 'Lista Check for Safety para baño',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'Incluye puntos concretos sobre alfombrillas, suelo de ducha, barras y entrada/salida de bañera o ducha.',
      },
      {
        title: 'Prevenir caídas en casa',
        source: 'MedlinePlus',
        href: 'https://medlineplus.gov/ency/patientinstructions/000052.htm',
        description:
          'Consejos sencillos sobre baño, dormitorio, calzado, escaleras e iluminación.',
      },
      {
        title: 'Catálogo de productos de apoyo',
        source: 'CEAPAT / Imserso',
        href: 'https://ceapat.imserso.es/catalogo-productos-apoyo',
        description:
          'Catálogo público español para comparar ayudas de baño, inodoro, barras y movilidad.',
      },
    ],
    faqs: [
      {
        question: '¿Son seguras las barras de ventosa?',
        answer:
          'No deben usarse como apoyo principal para soportar peso. Si la seguridad depende del apoyo, conviene usar barras fijadas profesionalmente u otro equipo adecuado.',
      },
      {
        question: '¿Una ducha a ras de suelo siempre es lo mejor?',
        answer:
          'Depende de movilidad, distribución, drenaje, presupuesto y urgencia. A veces primero hacen falta apoyos, iluminación y medidas antideslizantes.',
      },
      {
        question: '¿Conviene que la puerta del baño abra hacia fuera?',
        answer:
          'Puede ayudar en algunas viviendas, porque una caída detrás de una puerta que abre hacia dentro puede bloquear el acceso. Depende de la puerta, pasillo, privacidad y alternativas posibles.',
      },
    ],
    cta: { label: 'Ver servicios para baño', to: '/services/bathroom-safety' },
  },
  'home-adaptation-grants-spain-family-guide': {
    title: 'Ayudas para adaptar viviendas en España: guía práctica para familias',
    description:
      'Cómo preparar ayudas de accesibilidad y adaptación del hogar en España: requisitos, documentos, tiempos, errores habituales y enlaces oficiales.',
    category: 'Ayudas y financiación',
    readTime: '11 min de lectura',
    imageAlt: 'Símbolo del euro que representa ayudas públicas para adaptar viviendas',
    keywords: [
      'ayudas adaptación vivienda España',
      'Plan Estatal de Vivienda 2026 2030',
      'Plan Adapta Madrid',
      'subvenciones accesibilidad vivienda',
    ],
    intro:
      'En España no existe una única ayuda que todas las familias soliciten de la misma forma. El plan estatal marca un marco general, pero la solicitud real suele tramitarse a través de la comunidad autónoma, el ayuntamiento, la oficina de vivienda o servicios sociales. Lo más seguro es preparar primero las pruebas de la vivienda y después encajarlas con la convocatoria abierta.',
    takeaways: [
      'Comprueba la convocatoria para la dirección exacta de la vivienda; las reglas cambian por comunidad autónoma y municipio.',
      'Prepara necesidad, fotos, certificados, permisos y presupuestos desglosados antes de que aparezca una fecha límite.',
      'No empieces obras pagadas hasta confirmar si la convocatoria permite trabajos previos.',
      'Ningún proveedor puede garantizar aprobación: la administración decide elegibilidad, importe y pago.',
    ],
    sections: [
      {
        title: 'Empieza por la administración correcta, no por una promesa genérica',
        body: [
          'Para una familia, la primera pregunta no es “cuánto nos darán”, sino “qué administración cubre esta dirección y este tipo de obra”. Una vivienda en Madrid capital puede tener una vía municipal como Plan Adapta. Una vivienda en Girona, Tarragona, Lleida o Terres de l’Ebre puede encajar en una convocatoria de la Agència de l’Habitatge de Catalunya. En otros territorios puede haber ayudas autonómicas de rehabilitación, servicios sociales municipales, discapacidad, dependencia o programas de accesibilidad del edificio.',
          'Usa la base nacional de subvenciones para buscar convocatorias abiertas y confirma los detalles con la oficina local de vivienda o servicios sociales. Si el problema está en portal, escaleras, ascensor o zonas comunes, también puede intervenir la comunidad de propietarios y el administrador de la finca.',
        ],
      },
      {
        title: 'Entiende qué puede cubrir el marco estatal',
        body: [
          'El Plan Estatal de Vivienda 2026-2030 incluye actuaciones de accesibilidad como rampas, ascensores, salvaescaleras, itinerarios accesibles, sistemas de comunicación y alarma, domótica de apoyo a la autonomía personal y mejoras de seguridad de uso y accesibilidad. El BOE fija importes máximos y porcentajes, pero el acceso llega mediante convocatorias de comunidades autónomas y Ceuta o Melilla.',
          'Esa diferencia es clave. Un importe máximo anunciado no equivale a una ayuda aprobada para una vivienda concreta. Cada convocatoria puede limitar quién solicita, qué vivienda entra, qué ingresos cuentan, si la persona debe tener más de 65 años o discapacidad reconocida, si los presupuestos deben presentarse antes de iniciar obra y cuándo se paga.',
        ],
      },
      {
        title: 'Convierte el problema de casa en obras subvencionables',
        body: [
          'Una solicitud se entiende mejor cuando las obras responden a un riesgo diario concreto: entrada insegura a la ducha, suelo mojado, umbrales altos, falta de apoyos, poca luz nocturna, puertas estrechas, alcance difícil en cocina o una ruta que no se puede usar con andador o silla.',
          'Evita expresiones vagas como “modernizar el baño”. Usa lenguaje práctico: sustituir bañera por ducha accesible, rebajar un umbral, colocar barras fijadas, mejorar suelo antideslizante, ensanchar un paso, añadir iluminación con sensor, instalar videoportero accesible o adaptar una cocina para preparar comida con seguridad.',
        ],
      },
      {
        title: 'Monta el expediente antes de ir con prisa',
        body: [
          'La mayoría de expedientes combinan documentos personales, documentos de la vivienda y pruebas técnicas. Empieza por DNI/NIE, padrón o residencia habitual, propiedad o permiso de alquiler, certificado de discapacidad o dependencia si existe, información de ingresos si la piden, fotos del riesgo actual y una propuesta desglosada.',
          'Pregunta si el programa necesita informe técnico, visita de arquitecto o técnico, licencia o declaración responsable, acuerdo de comunidad, autorización del propietario, facturas registradas, justificantes bancarios o documentación final tras la obra. Guarda presupuestos, fotos, facturas y autorizaciones en una misma carpeta.',
        ],
      },
      {
        title: 'Cuida los plazos, el pago y las reglas de reembolso',
        body: [
          'Algunas ayudas son por orden de llegada, otras son competitivas, otras cierran al agotarse fondos y algunas se pagan después de que la familia haya pagado y justificado la obra. Otras exigen aprobación o inspección previa. Por ejemplo, la convocatoria catalana de 2026 para arreglos interiores indica que las obras no pueden haberse iniciado antes de la publicación de la convocatoria ni antes de la inspección técnica de la Agencia.',
          'Antes de firmar o pagar, confirma por escrito tres cosas: si se puede empezar la obra, si el formato del presupuesto sirve y cuándo se espera cobrar la ayuda. Así la familia no depende de una ayuda que quizá llegue después de necesitar el dinero.',
        ],
      },
      {
        title: 'Si el problema está en una zona común',
        body: [
          'Ascensores, rampas de entrada, puertas de portal, escaleras y otros elementos comunes pueden implicar a la comunidad de propietarios. La Ley de Propiedad Horizontal recoge reglas sobre obras de accesibilidad necesarias y ajustes razonables, especialmente cuando hay personas con discapacidad o mayores de 70 años, pero la tramitación práctica depende del edificio, el presupuesto y el administrador.',
          'En estos casos prepara una nota breve para el administrador: necesidad de la persona, ruta afectada, fotos, solución propuesta, si existe convocatoria de ayuda y qué decisión debe tomar la comunidad. Una buena documentación reduce conflictos antes de la junta.',
        ],
      },
    ],
    checklist: [
      'Confirma municipio, comunidad autónoma y si la vivienda es propia, alquilada o parte de una comunidad.',
      'Busca convocatorias abiertas en la base nacional de subvenciones y en vivienda o servicios sociales locales.',
      'Comprueba requisitos: edad, discapacidad, dependencia, ingresos, residencia habitual, propiedad o permiso de alquiler.',
      'Fotografía barreras actuales: baño, entrada, escaleras, umbrales, cocina, ruta nocturna y acceso común.',
      'Prepara presupuestos desglosados que separen accesibilidad y seguridad de una reforma estética.',
      'Pregunta si se puede iniciar la obra antes de aprobación, inspección o publicación de la convocatoria.',
      'Reúne certificados, padrón, datos bancarios, permisos de comunidad o propietario e informes técnicos si hacen falta.',
      'Guarda facturas, justificantes de pago y fotos finales para la justificación.',
    ],
    resources: [
      {
        title: 'Plan Estatal de Vivienda 2026-2030',
        source: 'BOE',
        href: 'https://www.boe.es/diario_boe/txt.php?id=BOE-A-2026-8872',
        description:
          'Marco estatal de ayudas de vivienda y accesibilidad. Útil para entender actuaciones, límites y que la tramitación se abre mediante convocatorias autonómicas.',
      },
      {
        title: 'Buscador nacional de subvenciones',
        source: 'Sistema Nacional de Publicidad de Subvenciones',
        href: 'https://www.infosubvenciones.es/bdnstrans/GE/es/convocatorias',
        description:
          'Base oficial para buscar convocatorias públicas. Prueba por municipio, comunidad autónoma, accesibilidad, rehabilitación de vivienda o discapacidad.',
      },
      {
        title: 'Plan Adapta Madrid 2026',
        source: 'Ayuntamiento de Madrid',
        href: 'https://sede.madrid.es/portal/site/tramites/menuitem.62876cb64654a55e2dbd7003a8a409a0/?vgnextchannel=2a8ca38813180210VgnVCM100000c90da8c0RCRD&vgnextfmt=default&vgnextoid=3bfbfc190117d910VgnVCM200000f921e388RCRD',
        description:
          'Ejemplo municipal para accesibilidad en vivienda, edificio y locales. El plazo 2026 ya cerró, pero la página sirve para ver líneas, documentos y futuras convocatorias.',
      },
      {
        title: 'Arreglos interiores para personas mayores en Cataluña',
        source: 'Agència de l’Habitatge de Catalunya',
        href: 'https://habitatge.gencat.cat/ca/ajuts/ajuts-rehabilitacio/interior-persones-grans/',
        description:
          'Ejemplo autonómico activo en 2026 para viviendas con personas de 65 años o más en Girona, Tarragona, Lleida y Terres de l’Ebre.',
      },
      {
        title: 'Catálogo de productos de apoyo',
        source: 'CEAPAT / Imserso',
        href: 'https://ceapat.imserso.es/catalogo-productos-apoyo',
        description:
          'Catálogo público para comparar productos de apoyo disponibles en España. Sirve como referencia, siempre adaptando la solución a la persona y la vivienda.',
      },
      {
        title: 'Ley de Propiedad Horizontal',
        source: 'BOE',
        href: 'https://www.boe.es/buscar/act.php?id=BOE-A-1960-10906',
        description:
          'Referencia útil cuando las obras de accesibilidad afectan a portal, ascensor, rampas, escaleras o recorridos comunes del edificio.',
      },
    ],
    faqs: [
      {
        question: '¿Qué ayuda conviene mirar primero?',
        answer:
          'Empieza por la dirección de la vivienda. Revisa comunidad autónoma, ayuntamiento y servicios sociales del municipio, y compara la convocatoria abierta con la situación de la persona y las obras necesarias.',
      },
      {
        question: '¿CasaMia puede garantizar una ayuda?',
        answer:
          'No. CasaMia puede ayudarte a definir la necesidad, preparar pruebas y ordenar una propuesta lista para solicitar, pero la administración decide elegibilidad, aprobación, importe y pago.',
      },
      {
        question: '¿Conviene adaptar la vivienda antes de solicitar?',
        answer:
          'Solo después de revisar la convocatoria concreta. Algunos programas rechazan obras iniciadas demasiado pronto o exigen inspección previa. Si hay un riesgo urgente, separa la decisión de seguridad inmediata de la decisión de ayuda.',
      },
      {
        question: '¿Puede solicitar una ayuda una persona que vive de alquiler?',
        answer:
          'A veces sí, pero la convocatoria puede exigir permiso del propietario, residencia habitual y derecho claro a ejecutar la obra. Conviene confirmarlo antes de pagar planos o instalación.',
      },
      {
        question: '¿Se cubren reformas estéticas?',
        answer:
          'Normalmente la parte subvencionable es la mejora de accesibilidad, seguridad o autonomía, no una reforma estética general. Por eso conviene que el presupuesto separe partidas elegibles de acabados opcionales.',
      },
    ],
    cta: { label: 'Comprobar preparación para ayudas', to: '/grant-check' },
  },
  'family-conversation-before-home-safety-visit': {
    title: 'Antes de una visita de seguridad: preguntas que conviene acordar en familia',
    description:
      'Guía práctica para hablar en familia antes de pedir una evaluación de seguridad del hogar: movilidad, rutinas, dignidad, presupuesto, ayudas y decisión.',
    category: 'Planificación familiar',
    readTime: '6 min de lectura',
    imageAlt: 'Lista familiar para preparar una conversación sobre seguridad del hogar',
    keywords: [
      'preguntas evaluación seguridad hogar mayores',
      'conversación familia padres mayores',
      'preparar visita seguridad hogar',
    ],
    intro:
      'Muchas familias saben que algo debe cambiar, pero no siempre nombran la misma preocupación. Una conversación breve antes de la visita ayuda a CasaMia a entender a la persona, la vivienda y la decisión que la familia necesita tomar.',
    takeaways: [
      'Acordad primero los momentos diarios que resultan más difíciles, antes de hablar de productos.',
      'Separad necesidades urgentes de seguridad, comodidad, confianza y planificación futura.',
      'Decidid quién debe participar en la propuesta, presupuesto, ayudas y aprobación final.',
    ],
    sections: [
      {
        title: 'Empieza por la persona, no por la estancia',
        body: [
          'Pregunta qué ha cambiado últimamente: una caída, un susto, hospitalización, medicación nueva, cansancio, miedo a ducharse, idas nocturnas al baño o menos confianza para salir.',
          'El mismo baño, dormitorio o tramo de escaleras puede significar cosas distintas según fuerza, equilibrio, memoria, visión, dolor y si la persona vive sola.',
        ],
      },
      {
        title: 'Nombra las rutinas que generan tensión',
        body: [
          'En vez de decir “el baño es inseguro”, describe el momento exacto: entrar en la ducha, levantarse del inodoro, secarse al salir, ir al baño de noche, llevar ropa o abrir la puerta principal.',
          'Así una preocupación general se convierte en un encargo práctico. CasaMia puede priorizar transferencias más seguras, rutas claras, iluminación, apoyos, ayuda de emergencia o una visita profesional.',
        ],
      },
      {
        title: 'Acordad qué debe seguir siendo familiar',
        body: [
          'La seguridad no debería hacer que la vivienda parezca clínica. Hablad de lo que importa emocionalmente: privacidad, independencia, rutinas, muebles favoritos, aspecto del baño o si un equipo visible generaría rechazo.',
          'Un buen plan protege la dignidad además del movimiento. A veces la mejor mejora es la que la persona acepta y usa cada día.',
        ],
      },
      {
        title: 'Clarificad quién decide y qué paso viene después',
        body: [
          'Antes de la evaluación, decidid quién recibe el informe, quién habla de presupuesto, quién puede aprobar trabajos y si conviene explorar ayudas.',
          'La familia no necesita tener todas las respuestas. El resultado útil es un punto de partida compartido: qué preocupa más, qué queremos preservar y qué decisión queremos que CasaMia nos ayude a tomar.',
        ],
      },
    ],
    checklist: [
      '¿Qué ha cambiado últimamente para que la vivienda parezca menos segura?',
      '¿Qué rutina preocupa más esta semana?',
      '¿Qué estancias, rutas o transferencias conviene revisar primero?',
      '¿Qué debería seguir siendo discreto, familiar o sin cambios si es posible?',
      '¿Quién debe recibir el informe y aprobar los próximos pasos?',
      '¿Queréis que CasaMia revise ayudas o coordine una visita?',
    ],
    faqs: [
      {
        question: '¿Debe participar la persona mayor en la conversación?',
        answer:
          'Sí, siempre que sea posible. La persona que vive en la casa debe explicar qué le cuesta, qué aceptaría y qué rutinas quiere mantener. La familia ayuda, pero la dignidad y el consentimiento siguen siendo importantes.',
      },
      {
        question: '¿Tenemos que saber qué productos necesitamos antes de pedir una visita?',
        answer:
          'No. Es mejor describir el problema diario y el resultado deseado. CasaMia puede traducirlo después en mejoras físicas, apoyo conectado, trabajos opcionales o una propuesta clara.',
      },
    ],
    cta: { label: 'Empezar revisión guiada', to: '/home-safety-assessment?open=self-inspection#self-inspection-tool' },
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
      'Cómo hacer más seguros dormitorio y rutas nocturnas: levantarse de la cama, iluminación sin deslumbrar, baño, alcance y ayuda de emergencia.',
    category: 'Dormitorio y noche',
    readTime: '9 min de lectura',
    imageAlt: 'Ilustración editorial de una ruta nocturna segura en dormitorio',
    keywords: ['seguridad nocturna mayores', 'dormitorio persona mayor', 'ruta cama baño'],
    intro:
      'El riesgo nocturno se subestima porque la vivienda parece conocida durante el día. Por la noche la persona puede estar medio dormida, tener más urgencia, ver peor, notar más los efectos de la medicación y recorrer una ruta al baño que se vuelve la más difícil de la casa.',
    takeaways: [
      'Revisa toda la rutina nocturna: incorporarse, ponerse en pie, calzarse, coger el apoyo, salir y usar el baño.',
      'Usa luz suave de ruta que reduzca sombras sin deslumbrar ni desorientar.',
      'Comprueba altura de cama, alcance desde la mesilla, obstáculos, puertas, umbrales y acceso al baño juntos.',
      'La ayuda de emergencia debe estar al alcance desde cama y baño, con una respuesta familiar acordada.',
    ],
    sections: [
      {
        title: 'Empieza junto a la cama, antes de ponerse en pie',
        body: [
          'El primer movimiento nocturno suele ser incorporarse, apoyar los pies, alcanzar gafas o andador, ponerse de pie y girar. Altura de cama, firmeza del colchón, calzado, mesilla y apoyos influyen mucho.',
          'Si la persona empuja una mesilla ligera, busca el teléfono lejos o debe ponerse de pie antes de alcanzar el andador, la habitación está pidiendo demasiado a alguien cansado.',
        ],
      },
      {
        title: 'Ilumina la ruta, no solo la habitación',
        body: [
          'Una luz de techo fuerte puede desorientar, pero la oscuridad oculta cambios de suelo y bordes de muebles. La iluminación baja con sensor puede hacer visible el camino sin buscar interruptores.',
          'Revisa la ruta real de cama a baño: lado de la cama, primer paso, puerta, pasillo, umbrales, alfombras, entrada al baño e inodoro. Las sombras y reflejos importan tanto como la cantidad de luz.',
        ],
      },
      {
        title: 'Reduce urgencia y prisas cuando sea posible',
        body: [
          'La urgencia para ir al baño convierte la ruta nocturna en un riesgo. Pregunta si la persona evita beber, corre, se despierta confundida, se marea al levantarse o toma medicación que afecta equilibrio o sueño.',
          'La casa puede reducir tropiezos, pero si hay urgencia repetida, mareos o confusión, conviene hablar con un profesional sanitario. Luz y apoyos no sustituyen revisar la causa.',
        ],
      },
      {
        title: 'Deja la ayuda al alcance en los dos puntos críticos',
        body: [
          'Botones, teléfonos o avisos acordados deben estar al alcance desde cama y baño. Cargar el móvil lejos de la cama puede cuidar la batería, pero dejar la ayuda fuera de alcance.',
          'La familia debe acordar quién responde, cómo entra si la puerta está cerrada y qué hacer si se activa una alerta de noche.',
        ],
      },
    ],
    checklist: [
      '¿Puede incorporarse y ponerse de pie sin tirar de muebles inestables?',
      '¿Gafas, teléfono, agua, medicación y andador están al alcance antes de levantarse?',
      '¿El calzado es estable, fácil de poner y siempre está en el mismo sitio?',
      '¿La ruta cama-baño tiene luz suave y poco deslumbramiento?',
      '¿No hay alfombras, cables, cajas o muebles bajos en la ruta nocturna?',
      '¿La puerta, inodoro y luz del baño se usan sin giros o alcances forzados?',
      '¿La ayuda de emergencia se alcanza desde cama y baño?',
      '¿La familia sabe quién responde y cómo entra si hace falta?',
    ],
    resources: [
      {
        title: 'Prevención de caídas y fracturas',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/falls-and-falls-prevention/prevent-falls-and-fractures',
        description:
          'Guía útil sobre medicación, visión, ejercicio y cambios en casa que influyen en la seguridad nocturna.',
      },
      {
        title: 'Lista Check for Safety',
        source: 'CDC STEADI',
        href: 'https://www.cdc.gov/steadi/media/pdfs/STEADI-Brochure-CheckForSafety-508.pdf',
        description:
          'Puntos prácticos sobre dormitorio, baño, suelos, escaleras e iluminación.',
      },
      {
        title: 'Envejecer en casa',
        source: 'National Institute on Aging',
        href: 'https://www.nia.nih.gov/health/aging-place/aging-place-growing-older-home',
        description:
          'Orientación oficial sobre apoyos, cambios en casa y ayuda a medida que cambian las necesidades.',
      },
    ],
    faqs: [
      {
        question: '¿Qué luz es mejor por la noche?',
        answer:
          'Suele funcionar bien una luz baja con sensor, porque ayuda sin el golpe de una luz de techo fuerte. Depende de la estancia, la vista, las sombras y si la luz despierta o desorienta.',
      },
      {
        question: '¿Importa la altura de la cama?',
        answer:
          'Sí. Una cama demasiado baja o alta dificulta la transferencia. Debe adaptarse a fuerza, equilibrio y apoyos de la persona.',
      },
      {
        question: '¿Qué pasa si la persona se levanta muchas veces?',
        answer:
          'Revisa la ruta cuanto antes, pero consulta también con un profesional sanitario. Urgencia, mareos, medicación, dolor o confusión pueden requerir algo más que cambios en casa.',
      },
    ],
    cta: { label: 'Crear plan de seguridad', to: '/home-safety-wizard' },
  },
  'hospital-discharge-home-safety-checklist': {
    title: 'Lista de seguridad en casa tras el alta hospitalaria',
    description:
      'Una guía práctica para preparar la vivienda antes de que una persona mayor vuelva a casa tras un ingreso, cirugía o cambio de movilidad.',
    category: 'Tras el alta hospitalaria',
    readTime: '8 min de lectura',
    imageAlt: 'Familia preparando la vivienda antes de la vuelta a casa tras el hospital',
    keywords: ['alta hospitalaria seguridad en casa', 'vuelta a casa persona mayor', 'lista seguridad tras cirugía'],
    intro:
      'Los primeros días después del alta son el momento en que pequeños obstáculos de la vivienda pueden convertirse en problemas importantes. Usa esta lista para revisar entrada, dormitorio, baño, medicación, ayuda y rutinas de la primera semana.',
    takeaways: [
      'Prepara entrada, cama, baño y rutas nocturnas antes de la vuelta a casa.',
      'Aclara quién ayuda, cómo se pide ayuda y qué ocurre si el primer plan falla.',
      'Separa acciones urgentes de seguridad de obras que pueden esperar una propuesta medida.',
    ],
    sections: [
      {
        title: 'Confirma la primera ruta de vuelta',
        body: [
          'Antes del alta, recorre el camino desde la entrada del edificio hasta el lugar principal de descanso. Observa escalones, umbrales, giros estrechos, alfombras sueltas, mala iluminación y puntos donde la persona puede necesitar parar.',
          'Si hay dudas con escaleras, ascensor, aparcamiento o acceso al edificio, planifica la llegada con quien acompañará a la persona en vez de improvisar en la puerta.',
        ],
      },
      {
        title: 'Haz que dormitorio y baño funcionen primero',
        body: [
          'Las estancias prioritarias suelen ser dormitorio y baño. Revisa altura de cama, espacio para transferencias, iluminación nocturna, acceso al inodoro, ducha o bañera y puntos de apoyo donde realmente se mueve la persona.',
          'No esperes a tener un plan perfecto para resolver riesgos urgentes: ruta nocturna poco clara, suelo mojado, transferencias sin apoyo o ayuda difícil de alcanzar.',
        ],
      },
      {
        title: 'Acordad el apoyo de la primera semana',
        body: [
          'Anota quién visita, quién llama, cómo se revisa la medicación, quién gestiona citas de seguimiento y qué hacer si aumentan dolor, mareos, confusión o dificultad para moverse.',
          'CasaMia puede convertirlo en una ruta práctica: revisión remota, visita experta, trabajos urgentes, propuesta, notas para ayudas o instalación por fases.',
        ],
      },
    ],
    checklist: [
      '¿Puede entrar en casa de forma segura el día del alta?',
      '¿La cama es fácil de alcanzar, sentarse y levantarse?',
      '¿Puede llegar al baño y al inodoro de noche con seguridad?',
      '¿Medicación, informe de alta y contactos están fáciles de encontrar?',
      '¿Quién revisa la situación en 24 horas, tres días y una semana?',
      '¿Qué trabajos urgentes conviene revisar antes de planificar obras mayores?',
    ],
    faqs: [
      {
        question: '¿Qué preparar antes de que una persona mayor vuelva del hospital?',
        answer:
          'Empieza por entrada, entrar y salir de la cama, baño e inodoro, iluminación nocturna, notas de medicación, contactos de emergencia y apoyo de la primera semana.',
      },
      {
        question: '¿Hay que adaptar toda la vivienda antes del alta?',
        answer:
          'Normalmente no. Primero hay que asegurar entrada, dormir, ir al baño, asearse y pedir ayuda. Las obras mayores pueden medirse y planificarse después.',
      },
    ],
    cta: { label: 'Empezar revisión de vuelta a casa', to: '/home-safety-after-hospital-discharge' },
  },
  'when-home-adaptations-are-not-enough': {
    title: 'Cuando adaptar la vivienda no es suficiente: guía familiar de decisión',
    description:
      'Una guía práctica para decidir si conviene adaptar la vivienda, añadir apoyo, planificar por fases o valorar una residencia u otra opción de cuidado.',
    category: 'Decisiones familiares',
    readTime: '8 min de lectura',
    imageAlt: 'Familia comparando opciones de seguridad y cuidado en casa',
    keywords: ['envejecer en casa decisión', 'adaptar vivienda o residencia', 'cuando la casa ya no es segura'],
    intro:
      'Envejecer en casa debe ser seguro, familiar y realista. La pregunta no es si casa siempre es mejor, sino si el apoyo adecuado puede hacer la vida diaria más segura sin agotar a la persona ni a la familia.',
    takeaways: [
      'Las adaptaciones funcionan mejor cuando la persona aún puede usar la vivienda con rutas claras, apoyos y rutinas sencillas.',
      'Una residencia o un mayor nivel de apoyo puede ser más seguro cuando supervisión, transferencias, confusión o riesgo nocturno no se gestionan de forma fiable en casa.',
      'La mejor decisión compara seguridad, dignidad, capacidad familiar, coste, plazos y deseos de la persona.',
    ],
    sections: [
      {
        title: 'Empieza por la rutina diaria, no por la vivienda',
        body: [
          'Una casa puede parecer adecuada en una visita rápida y fallar justo en los momentos importantes: levantarse de la cama, llegar al baño de noche, ducharse, cocinar, usar escaleras o pedir ayuda.',
          'Si esos momentos pueden hacerse más seguros con adaptaciones, rutinas y apoyo, seguir en casa puede ser realista. Si dependen de improvisar cada día, la familia necesita una conversación más amplia.',
        ],
      },
      {
        title: 'Señales de que adaptar la casa aún puede ser la vía correcta',
        body: [
          'Casa suele seguir siendo una buena opción cuando la persona quiere quedarse, reconoce el espacio, puede seguir rutinas sencillas y los principales riesgos son físicos o del entorno: baño, iluminación, escaleras, umbrales, cama o ayuda al alcance.',
          'En ese caso, un plan por fases suele funcionar: resolver primero el riesgo urgente y después añadir confort, apoyo conectado o adaptaciones mayores cuando aportan valor claro.',
        ],
      },
      {
        title: 'Señales de que conviene valorar más apoyo',
        body: [
          'Puede hacer falta hablar de más apoyo cuando la persona no puede pedir ayuda de forma fiable, las caídas se repiten, la noche se vuelve insegura, las transferencias no pueden hacerse con una sola persona o la confusión crea riesgos frecuentes.',
          'Esto no significa automáticamente residencia. Puede significar más ayuda en casa, respiro, rutinas con tecnología, una visita profesional o un plan de transición. Lo importante es decidir antes de que una crisis decida por todos.',
        ],
      },
      {
        title: 'Usa un marco de decisión claro',
        body: [
          'Una conversación útil compara cinco cosas: qué quiere la persona, qué es inseguro ahora, qué se puede cambiar de forma realista, quién ayuda en el día a día y cuánto cuesta cada ruta en 6 a 24 meses.',
          'CasaMia puede ayudar con la parte de vivienda: revisión de seguridad, propuesta práctica, trabajos por fases, preparación para ayudas y una explicación clara de lo que la adaptación puede y no puede resolver.',
        ],
      },
    ],
    checklist: [
      '¿Puede llegar con seguridad al baño, cama, cocina y entrada en un día normal?',
      '¿Puede pedir ayuda desde las estancias donde hay más riesgo?',
      '¿Las caídas, sustos o incidentes nocturnos son más frecuentes?',
      '¿La familia o cuidadores pueden sostener la rutina sin agotarse?',
      '¿Un plan por fases resolvería los principales riesgos o solo retrasaría una decisión mayor?',
      '¿La familia ha comparado coste y plazos de adaptar casa frente a residencia o más apoyo?',
    ],
    faqs: [
      {
        question: '¿Cómo sabemos si seguir en casa es realista?',
        answer:
          'Mirad las rutinas diarias, no solo la idea de la casa. Si baño, noche, transferencias, comidas y petición de ayuda pueden hacerse fiables, casa puede seguir siendo realista. Si varias siguen siendo inseguras, conviene valorar un plan de cuidado más amplio.',
      },
      {
        question: '¿Hay que adaptar la casa antes de pensar en una residencia?',
        answer:
          'No siempre. Algunas familias deben comparar ambas rutas pronto. Una revisión de seguridad puede mostrar qué se resuelve en casa, qué necesita apoyo profesional y qué quizá conviene tratar con una opción de mayor cuidado.',
      },
    ],
    cta: { label: 'Empezar revisión de seguridad', to: '/home-safety-assessment?open=self-inspection#self-inspection-tool' },
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
