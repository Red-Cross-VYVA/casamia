import type { ServiceRoom } from '../types/serviceCatalogue'

export type ZoneRiskArea = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'kitchen' | 'living-room' | 'entrance' | 'movement' | 'connected'>

type ZoneRiskLabelPosition = {
  x: number
  y: number
  w: number
  h: number
  detailSide?: 'opens-left' | 'opens-right' | 'opens-up' | 'opens-down-left' | 'opens-down-right' | 'opens-up-left' | 'opens-up-right'
}

type ZoneRiskDetail = {
  solution: string
  helps: string
  product?: string
  stat?: string
}

export type ZoneRiskMap = {
  image: string
  copy: Record<
    'en' | 'es',
    {
      eyebrow: string
      title: string
      body: string
      imageAlt: string
      risks: string[]
      mapLabels: string[]
      legend: string[]
      riskDetails?: ZoneRiskDetail[]
    }
  >
  labelPositions: readonly ZoneRiskLabelPosition[]
}

export const zoneRiskMaps: Record<ZoneRiskArea, ZoneRiskMap> = {
  bathroom: {
    image: '/images/solutions/bathroom-risk-map.png',
    copy: {
      en: {
        eyebrow: 'Bathroom risk map',
        title: 'Bathroom risk builds up in small movements.',
        body: 'Wet zones, transfers, thresholds and loose items can combine during bathing, toilet use and night-time access.',
        imageAlt: 'Annotated bathroom map showing common fall and access risk points',
        risks: ['Loose mat', 'High step', 'Shower entry', 'Toilet height', 'Wet zone', 'Visible cable', 'Narrow door'],
        mapLabels: ['Loose mat', 'High step', 'Shower entry', 'Toilet height', 'Wet zone', 'Visible cable', 'Narrow door'],
        legend: ['High risk', 'Medium risk'],
        riskDetails: [
          {
            solution: 'Secure the surface',
            helps: 'CasaMia removes loose mats or swaps in fixed anti-slip options at the shower exit.',
            product: 'Anti-slip mat or floor-grip treatment.',
            stat: 'CDC bathroom-injury data found falls caused 81.1% of nonfatal bathroom injuries.',
          },
          {
            solution: 'Lower the entry',
            helps: 'We check the threshold and recommend a lower profile, transition strip or tub cut-out where suitable.',
            product: 'Low-profile transition strip or bath cut-out.',
          },
          {
            solution: 'Add transfer support',
            helps: 'A fixed grab bar and folding seat reduce standing time and give a clear handhold when entering or washing.',
            product: 'Wall-mounted grab bar plus folding shower seat.',
            stat: 'CDC data found 37.3% of bathroom injuries happened while bathing, showering or exiting.',
          },
          {
            solution: 'Stabilise sit-to-stand',
            helps: 'Raised toilet support and rails reduce deep bending and create predictable support on both sides.',
            product: 'Raised toilet seat or toilet support rails.',
          },
          {
            solution: 'Improve wet-floor grip',
            helps: 'We identify splash zones and treat suitable surfaces so feet have better traction after bathing.',
            product: 'Anti-slip floor treatment for compatible wet areas.',
          },
          {
            solution: 'Clear the route',
            helps: 'Cables are moved, clipped or replaced with safer lighting placement away from walking lines.',
            product: 'Cable management plus motion-activated night lighting.',
          },
          {
            solution: 'Check access width',
            helps: 'CasaMia checks whether the door limits help, walking aids or emergency access before recommending work.',
            product: 'Door hardware changes or wider-doorway review.',
          },
        ],
      },
      es: {
        eyebrow: 'Mapa de riesgos del baño',
        title: 'El riesgo del baño se acumula en pequeños movimientos.',
        body: 'Zonas mojadas, transferencias, umbrales y objetos sueltos pueden combinarse al ducharse, usar el WC o entrar de noche.',
        imageAlt: 'Mapa anotado de baño con puntos habituales de riesgo de caída y acceso',
        risks: ['Alfombrilla suelta', 'Escalón alto', 'Entrada a ducha', 'Altura del WC', 'Zona mojada', 'Cable visible', 'Puerta estrecha'],
        mapLabels: ['Alfombra', 'Escalón', 'Ducha', 'Altura WC', 'Zona mojada', 'Cable', 'Puerta'],
        legend: ['Riesgo alto', 'Riesgo medio'],
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
            product: 'Perfil de transición o corte de bañera.',
          },
          {
            solution: 'Añadir apoyo',
            helps: 'Una barra fija y un asiento abatible reducen tiempo de pie y dan un apoyo claro al entrar o lavarse.',
            product: 'Barra de apoyo mural y asiento abatible.',
            stat: 'CDC encontró que el 37,3% de lesiones en el baño ocurrían al bañarse, ducharse o salir.',
          },
          {
            solution: 'Estabilizar el WC',
            helps: 'Elevador o barras reducen la flexión profunda y crean apoyo predecible a ambos lados.',
            product: 'Elevador de WC o barras de apoyo para inodoro.',
          },
          {
            solution: 'Mejorar el agarre',
            helps: 'Localizamos zonas de salpicadura y tratamos superficies compatibles para mejorar la tracción.',
            product: 'Tratamiento antideslizante en zonas húmedas.',
          },
          {
            solution: 'Despejar la ruta',
            helps: 'Movemos, fijamos o sustituimos cables y ubicamos la iluminación fuera de la zona de paso.',
            product: 'Gestión de cables e iluminación nocturna con sensor.',
          },
          {
            solution: 'Comprobar acceso',
            helps: 'CasaMia revisa si la puerta limita ayuda, andador o acceso de emergencia antes de proponer obra.',
            product: 'Cambio de herrajes o revisión de anchura.',
          },
        ],
      },
    },
    labelPositions: [
      { x: 35.6, y: 78.8, w: 9.8, h: 5.6, detailSide: 'opens-right' },
      { x: 87.2, y: 24.7, w: 8.8, h: 6.2, detailSide: 'opens-left' },
      { x: 87.2, y: 44.8, w: 8.8, h: 6.2, detailSide: 'opens-left' },
      { x: 41.0, y: 58.9, w: 8.4, h: 6.4, detailSide: 'opens-right' },
      { x: 7.7, y: 16.3, w: 11.0, h: 6.6, detailSide: 'opens-right' },
      { x: 89.1, y: 62.8, w: 8.5, h: 5.9, detailSide: 'opens-left' },
      { x: 76.9, y: 88.6, w: 7.4, h: 5.9, detailSide: 'opens-up-left' },
      { x: 7.7, y: 86.0, w: 12.8, h: 3.3 },
      { x: 7.7, y: 90.4, w: 12.8, h: 3.3 },
    ],
  },
  bedroom: {
    image: '/images/solutions/bedroom-risk-map.png',
    copy: {
      en: {
        eyebrow: 'Bedroom risk map',
        title: 'Night-time risk starts around the bed.',
        body: 'Low light, bedside clutter, rugs, shoes and door routes matter most when someone is tired or moving quickly at night.',
        imageAlt: 'Annotated bedroom map showing night-time movement and transfer risks',
        risks: ['Loose rug', 'Bed edge transfer', 'Shoes by bed', 'Door threshold', 'Bedside clutter', 'Wardrobe route', 'Narrow doorway'],
        mapLabels: ['Loose rug', 'Bed edge', 'Shoes', 'Threshold', 'Bedside clutter', 'Wardrobe route', 'Narrow door'],
        legend: ['High risk', 'Medium risk'],
        riskDetails: [
          {
            solution: 'Fix the floor edge',
            helps: 'CasaMia removes loose rugs or secures them so night movement starts on a stable surface.',
            product: 'Rug grip, floor transition or clear-route reset.',
          },
          {
            solution: 'Support bed access',
            helps: 'A bed rail or transfer handle gives a predictable grip when sitting, turning or standing.',
            product: 'Bed support rail or transfer handle.',
          },
          {
            solution: 'Clear the first step',
            helps: 'We move trip points away from the bed edge and define a clear night route.',
            product: 'Bedside layout reset plus low night lighting.',
          },
          {
            solution: 'Soften the threshold',
            helps: 'Door transitions are checked for height, contrast and whether a lower profile is needed.',
            product: 'Low-profile threshold strip.',
          },
          {
            solution: 'Reduce bedside clutter',
            helps: 'Essentials stay reachable without blocking the stand-up movement or emergency access.',
            product: 'Bedside organisation and cable management.',
          },
          {
            solution: 'Open the wardrobe route',
            helps: 'CasaMia checks reach, door swing and walking space before recommending storage changes.',
            product: 'Accessible wardrobe review or pull-down storage.',
          },
          {
            solution: 'Check doorway width',
            helps: 'We check whether a walking aid, helper or emergency responder can move through safely.',
            product: 'Door hardware change or wider-doorway review.',
          },
        ],
      },
      es: {
        eyebrow: 'Mapa de riesgos del dormitorio',
        title: 'El riesgo nocturno empieza alrededor de la cama.',
        body: 'Poca luz, objetos junto a la cama, alfombras, zapatos y puertas importan más cuando la persona está cansada o se mueve con prisa.',
        imageAlt: 'Mapa anotado de dormitorio con riesgos de movimiento nocturno y transferencias',
        risks: ['Alfombra suelta', 'Transferencia de cama', 'Zapatos junto a la cama', 'Umbral de puerta', 'Mesilla cargada', 'Ruta al armario', 'Puerta estrecha'],
        mapLabels: ['Alfombra', 'Borde cama', 'Zapatos', 'Umbral', 'Mesilla', 'Armario', 'Puerta'],
        legend: ['Riesgo alto', 'Riesgo medio'],
        riskDetails: [
          {
            solution: 'Fijar el borde',
            helps: 'CasaMia retira o fija alfombras para que el movimiento nocturno empiece sobre una superficie estable.',
            product: 'Fijación de alfombra, transición o ruta despejada.',
          },
          {
            solution: 'Apoyar la transferencia',
            helps: 'Una barra de cama o asidero da un punto de apoyo claro al sentarse, girar o levantarse.',
            product: 'Barra de apoyo para cama o asidero de transferencia.',
          },
          {
            solution: 'Despejar el primer paso',
            helps: 'Quitamos obstáculos junto a la cama y definimos una ruta nocturna clara.',
            product: 'Redistribución de mesilla y luz nocturna baja.',
          },
          {
            solution: 'Suavizar el umbral',
            helps: 'Revisamos altura, contraste y necesidad de un perfil más bajo en la puerta.',
            product: 'Perfil de transición bajo.',
          },
          {
            solution: 'Ordenar la mesilla',
            helps: 'Lo esencial queda al alcance sin bloquear el movimiento para levantarse ni el acceso de ayuda.',
            product: 'Organización de mesilla y gestión de cables.',
          },
          {
            solution: 'Abrir la ruta al armario',
            helps: 'CasaMia revisa alcance, apertura de puertas y espacio de paso antes de proponer cambios.',
            product: 'Revisión de armario accesible o almacenaje extraíble.',
          },
          {
            solution: 'Comprobar la puerta',
            helps: 'Verificamos si un andador, cuidador o emergencia puede pasar con seguridad.',
            product: 'Cambio de herrajes o revisión de anchura.',
          },
        ],
      },
    },
    labelPositions: [
      { x: 10.9, y: 18.7, w: 13.5, h: 7.1, detailSide: 'opens-down-right' },
      { x: 13.1, y: 36.1, w: 12.5, h: 6.6, detailSide: 'opens-right' },
      { x: 9.1, y: 62.4, w: 16.3, h: 7.1, detailSide: 'opens-right' },
      { x: 25.1, y: 76.0, w: 13.9, h: 6.5, detailSide: 'opens-up-right' },
      { x: 76.5, y: 17.5, w: 13.8, h: 7.7, detailSide: 'opens-down-left' },
      { x: 80.4, y: 43.4, w: 15.4, h: 7.2, detailSide: 'opens-left' },
      { x: 70.1, y: 82.1, w: 13.5, h: 6.6, detailSide: 'opens-up-left' },
      { x: 6.8, y: 87.2, w: 12.8, h: 3.0 },
      { x: 6.8, y: 91.6, w: 12.8, h: 3.0 },
    ],
  },
  kitchen: {
    image: '/images/solutions/kitchen-risk-map.png',
    copy: {
      en: {
        eyebrow: 'Kitchen risk map',
        title: 'Kitchen risk comes from reach, heat and movement.',
        body: 'Many kitchen incidents happen while carrying, turning, reaching, cooking or moving between wet and busy work zones.',
        imageAlt: 'Annotated kitchen map showing common reach, cooking and route risks',
        risks: ['Wet sink zone', 'Loose mat', 'High storage', 'Poor task light', 'Hot hob zone', 'Open drawer', 'Trailing cable'],
        mapLabels: ['Wet sink', 'Loose mat', 'High storage', 'Task light', 'Hot hob', 'Open drawer', 'Cable'],
        legend: ['High risk', 'Medium risk'],
        riskDetails: [
          {
            solution: 'Control the wet zone',
            helps: 'CasaMia checks splash points and surface grip around the sink before recommending changes.',
            product: 'Anti-slip treatment or safer sink-area mat.',
          },
          {
            solution: 'Secure the mat',
            helps: 'Loose kitchen mats are removed, fixed or replaced so turning and carrying do not start on a trip point.',
            product: 'Low-profile anti-slip kitchen mat.',
          },
          {
            solution: 'Bring storage down',
            helps: 'Frequently used items move into safer reach so the person avoids stretching or climbing.',
            product: 'Pull-down shelf or reachable storage reset.',
          },
          {
            solution: 'Add task lighting',
            helps: 'Focused light makes the worktop, hob and sink easier to judge without glare.',
            product: 'Under-cabinet task lighting.',
          },
          {
            solution: 'Reduce hob risk',
            helps: 'We review controls, pan reach and shut-off options around the cooking zone.',
            product: 'Stove shut-off or safer hob-control setup.',
          },
          {
            solution: 'Protect the route',
            helps: 'Drawer and cabinet routes are checked so open storage does not block turning space.',
            product: 'Storage layout review and pull-out fittings.',
          },
          {
            solution: 'Remove trailing cable',
            helps: 'Cables are rerouted or fixed away from the standing and walking line.',
            product: 'Cable management and safer appliance placement.',
          },
        ],
      },
      es: {
        eyebrow: 'Mapa de riesgos de la cocina',
        title: 'El riesgo en cocina mezcla alcance, calor y movimiento.',
        body: 'Muchos incidentes ocurren al cargar, girar, alcanzar, cocinar o moverse entre zonas húmedas y superficies de trabajo.',
        imageAlt: 'Mapa anotado de cocina con riesgos de alcance, cocción y circulación',
        risks: ['Zona húmeda del fregadero', 'Alfombrilla suelta', 'Almacenaje alto', 'Poca luz de trabajo', 'Zona de calor', 'Cajón abierto', 'Cable en el suelo'],
        mapLabels: ['Fregadero', 'Alfombrilla', 'Alto alcance', 'Luz tarea', 'Calor', 'Cajón', 'Cable'],
        legend: ['Riesgo alto', 'Riesgo medio'],
        riskDetails: [
          {
            solution: 'Controlar zona húmeda',
            helps: 'CasaMia revisa salpicaduras y agarre alrededor del fregadero antes de recomendar cambios.',
            product: 'Tratamiento antideslizante o alfombrilla segura.',
          },
          {
            solution: 'Fijar la alfombrilla',
            helps: 'La alfombrilla se retira, fija o sustituye para evitar tropiezos al girar o cargar.',
            product: 'Alfombrilla de cocina baja y antideslizante.',
          },
          {
            solution: 'Bajar el almacenaje',
            helps: 'Los objetos de uso frecuente pasan a una altura más segura para evitar estirarse o subirse.',
            product: 'Estante abatible o reorganización de almacenaje.',
          },
          {
            solution: 'Añadir luz de tarea',
            helps: 'La luz focal ayuda a ver encimera, placa y fregadero sin deslumbrar.',
            product: 'Iluminación bajo mueble.',
          },
          {
            solution: 'Reducir riesgo de calor',
            helps: 'Revisamos mandos, alcance de ollas y opciones de apagado en la zona de cocción.',
            product: 'Apagado de cocina o ajuste de mandos.',
          },
          {
            solution: 'Proteger el paso',
            helps: 'Revisamos cajones y armarios para que no bloqueen el giro ni el paso.',
            product: 'Revisión de almacenaje y herrajes extraíbles.',
          },
          {
            solution: 'Retirar el cable',
            helps: 'Los cables se recolocan o fijan fuera de la zona de paso y apoyo.',
            product: 'Gestión de cables y ubicación segura de aparatos.',
          },
        ],
      },
    },
    labelPositions: [
      { x: 3.8, y: 42.9, w: 13.7, h: 8.8, detailSide: 'opens-right' },
      { x: 4.3, y: 66.1, w: 14.6, h: 7.8, detailSide: 'opens-right' },
      { x: 4.1, y: 8.5, w: 15.9, h: 8.9, detailSide: 'opens-down-right' },
      { x: 82.4, y: 10.4, w: 14.4, h: 8.8, detailSide: 'opens-down-left' },
      { x: 85.4, y: 38.1, w: 13.7, h: 8.0, detailSide: 'opens-left' },
      { x: 84.8, y: 62.8, w: 14.0, h: 8.6, detailSide: 'opens-left' },
      { x: 82.1, y: 84.9, w: 14.4, h: 8.7, detailSide: 'opens-up-left' },
      { x: 7.8, y: 83.6, w: 12.8, h: 3.2 },
      { x: 7.8, y: 88.2, w: 12.8, h: 3.2 },
    ],
  },
  'living-room': {
    image: '/images/solutions/living-risk-map.png',
    copy: {
      en: {
        eyebrow: 'Living room risk map',
        title: 'Living rooms need clear routes, not just comfort.',
        body: 'Rugs, cables, low tables, soft seating and narrow passages can turn ordinary sitting, standing and walking into risk points.',
        imageAlt: 'Annotated living room map showing route, furniture and cable risks',
        risks: ['Rug edge', 'TV cable', 'Low table', 'Poor side light', 'Lamp cable', 'Soft sofa transfer', 'Narrow archway'],
        mapLabels: ['Rug edge', 'TV cable', 'Low table', 'Side light', 'Lamp cable', 'Sofa transfer', 'Arch'],
        legend: ['High risk', 'Medium risk'],
        riskDetails: [
          {
            solution: 'Flatten rug edges',
            helps: 'CasaMia removes, secures or replaces rugs that catch feet during normal room movement.',
            product: 'Rug grip, low-profile mat or clear-route reset.',
          },
          {
            solution: 'Route TV cables',
            helps: 'Cables move away from walking lines and are fixed where equipment needs to remain.',
            product: 'Cable management and safer device placement.',
          },
          {
            solution: 'Create turning space',
            helps: 'Low tables are repositioned so standing, turning and walking do not require sidestepping.',
            product: 'Furniture layout reset.',
          },
          {
            solution: 'Improve side lighting',
            helps: 'Soft route lighting helps the person see furniture edges without switching on harsh light.',
            product: 'Motion night lights or side lamps with safer controls.',
          },
          {
            solution: 'Tidy lamp cables',
            helps: 'Lamp cables are clipped or rerouted so they do not cross the sitting or walking route.',
            product: 'Cable clips and safer lamp placement.',
          },
          {
            solution: 'Support sit-to-stand',
            helps: 'We check chair height, firmness and arm support before recommending seating changes.',
            product: 'Stand-assist chair or safer seating setup.',
          },
          {
            solution: 'Widen the passage',
            helps: 'CasaMia checks whether the archway allows safe passage with a helper or walking aid.',
            product: 'Route clearance or doorway review.',
          },
        ],
      },
      es: {
        eyebrow: 'Mapa de riesgos del salón',
        title: 'El salón necesita rutas claras, no solo comodidad.',
        body: 'Alfombras, cables, mesas bajas, asientos blandos y pasos estrechos pueden convertir movimientos normales en puntos de riesgo.',
        imageAlt: 'Mapa anotado de salón con riesgos de ruta, muebles y cables',
        risks: ['Borde de alfombra', 'Cable de TV', 'Mesa baja', 'Poca luz lateral', 'Cable de lámpara', 'Sofá blando', 'Paso estrecho'],
        mapLabels: ['Alfombra', 'Cable TV', 'Mesa baja', 'Luz lateral', 'Cable', 'Sofá', 'Paso'],
        legend: ['Riesgo alto', 'Riesgo medio'],
        riskDetails: [
          {
            solution: 'Aplanar bordes',
            helps: 'CasaMia retira, fija o sustituye alfombras que pueden enganchar el pie en movimientos normales.',
            product: 'Fijación de alfombra, alfombrilla baja o ruta despejada.',
          },
          {
            solution: 'Guiar cables TV',
            helps: 'Los cables se apartan de la línea de paso y se fijan donde el equipo debe permanecer.',
            product: 'Gestión de cables y ubicación segura de dispositivos.',
          },
          {
            solution: 'Crear espacio de giro',
            helps: 'Las mesas bajas se recolocan para levantarse, girar y caminar sin esquivar obstáculos.',
            product: 'Reorganización de mobiliario.',
          },
          {
            solution: 'Mejorar luz lateral',
            helps: 'La iluminación suave de ruta ayuda a ver bordes sin encender una luz intensa.',
            product: 'Luces con sensor o lámparas con controles más seguros.',
          },
          {
            solution: 'Ordenar cables',
            helps: 'Los cables de lámpara se fijan o redirigen fuera de la zona de paso y asiento.',
            product: 'Clips de cable y colocación segura de lámparas.',
          },
          {
            solution: 'Apoyar levantarse',
            helps: 'Revisamos altura, firmeza y brazos del asiento antes de recomendar cambios.',
            product: 'Sillón elevador o asiento más seguro.',
          },
          {
            solution: 'Ampliar el paso',
            helps: 'CasaMia revisa si el paso permite ayuda, andador o circulación sin giros forzados.',
            product: 'Despeje de ruta o revisión de puerta.',
          },
        ],
      },
    },
    labelPositions: [
      { x: 43.6, y: 88.0, w: 10.8, h: 5.5, detailSide: 'opens-up-right' },
      { x: 86.6, y: 29.2, w: 10.8, h: 5.7, detailSide: 'opens-left' },
      { x: 70.1, y: 70.5, w: 11.3, h: 6.3, detailSide: 'opens-left' },
      { x: 4.1, y: 74.1, w: 10.3, h: 6.3, detailSide: 'opens-right' },
      { x: 6.3, y: 17.8, w: 8.4, h: 5.7, detailSide: 'opens-down-right' },
      { x: 4.9, y: 53.9, w: 9.6, h: 6.3, detailSide: 'opens-right' },
      { x: 90.8, y: 55.1, w: 7.6, h: 5.7, detailSide: 'opens-left' },
      { x: 6.2, y: 87.8, w: 12.8, h: 3.0 },
      { x: 6.2, y: 92.2, w: 12.8, h: 3.0 },
    ],
  },
  entrance: {
    image: '/images/solutions/entrance-risk-map.png',
    copy: {
      en: {
        eyebrow: 'Entrance risk map',
        title: 'Entrances concentrate route, light and threshold risks.',
        body: 'A front door route can combine low light, loose mats, clutter, high thresholds and support gaps in only a few steps.',
        imageAlt: 'Annotated entrance and hallway map showing route, lighting and threshold risks',
        risks: ['Low light', 'Loose doormat', 'Obstacle in route', 'Shoes in route', 'High threshold', 'Narrow pass', 'Step edge'],
        mapLabels: ['Low light', 'Loose mat', 'Obstacle', 'Shoes', 'Threshold', 'Narrow pass', 'Step edge'],
        legend: ['High risk', 'Medium risk'],
        riskDetails: [
          {
            solution: 'Add entrance light',
            helps: 'CasaMia improves visibility around keys, threshold and first steps into the home.',
            product: 'Motion entrance light or safer wall light.',
          },
          {
            solution: 'Secure the mat',
            helps: 'Loose doormats are removed, fixed or replaced with a low-profile option.',
            product: 'Low-profile non-slip entrance mat.',
          },
          {
            solution: 'Clear the route',
            helps: 'We remove route obstacles so the person can enter without weaving or twisting.',
            product: 'Entrance layout reset.',
          },
          {
            solution: 'Create a landing zone',
            helps: 'Shoes and daily items get a fixed place outside the walking line.',
            product: 'Entry storage or seating setup.',
          },
          {
            solution: 'Reduce the threshold',
            helps: 'Threshold height is reviewed for safe stepping, walking aids and trip risk.',
            product: 'Threshold ramp or transition strip.',
          },
          {
            solution: 'Widen the pass',
            helps: 'CasaMia checks whether the entrance works with bags, a helper or mobility aid.',
            product: 'Door-access review or route clearance.',
          },
          {
            solution: 'Mark the step edge',
            helps: 'Step edges become easier to see and use with a clear support point where needed.',
            product: 'Step contrast, handrail or grab point.',
          },
        ],
      },
      es: {
        eyebrow: 'Mapa de riesgos de la entrada',
        title: 'La entrada concentra riesgos de ruta, luz y umbrales.',
        body: 'La ruta de acceso puede mezclar poca luz, alfombrillas, obstáculos, umbrales altos y falta de apoyo en pocos pasos.',
        imageAlt: 'Mapa anotado de entrada y pasillo con riesgos de ruta, iluminación y umbrales',
        risks: ['Poca luz', 'Felpudo suelto', 'Obstáculo en ruta', 'Zapatos en ruta', 'Umbral alto', 'Paso estrecho', 'Borde de escalón'],
        mapLabels: ['Poca luz', 'Felpudo', 'Obstáculo', 'Zapatos', 'Umbral', 'Paso estrecho', 'Escalón'],
        legend: ['Riesgo alto', 'Riesgo medio'],
        riskDetails: [
          {
            solution: 'Añadir luz de entrada',
            helps: 'CasaMia mejora la visibilidad en llaves, umbral y primeros pasos dentro de casa.',
            product: 'Luz de entrada con sensor o aplique más seguro.',
          },
          {
            solution: 'Fijar el felpudo',
            helps: 'El felpudo se retira, fija o sustituye por una opción baja y estable.',
            product: 'Felpudo antideslizante de perfil bajo.',
          },
          {
            solution: 'Despejar la ruta',
            helps: 'Quitamos obstáculos para entrar sin esquivar ni girar de forma insegura.',
            product: 'Reorganización de la entrada.',
          },
          {
            solution: 'Crear zona fija',
            helps: 'Zapatos y objetos diarios quedan en un lugar definido fuera del paso.',
            product: 'Banco o almacenaje de entrada.',
          },
          {
            solution: 'Reducir el umbral',
            helps: 'Revisamos la altura para paso seguro, ayudas de movilidad y riesgo de tropiezo.',
            product: 'Rampa de umbral o perfil de transición.',
          },
          {
            solution: 'Ampliar el paso',
            helps: 'CasaMia comprueba si la entrada funciona con bolsas, ayuda o andador.',
            product: 'Revisión de acceso o despeje de ruta.',
          },
          {
            solution: 'Marcar el escalón',
            helps: 'El borde se ve mejor y se combina con apoyo claro si hace falta.',
            product: 'Contraste de escalón, pasamanos o punto de apoyo.',
          },
        ],
      },
    },
    labelPositions: [
      { x: 81.8, y: 6.0, w: 13.7, h: 8.4, detailSide: 'opens-down-left' },
      { x: 81.8, y: 27.8, w: 13.7, h: 8.4, detailSide: 'opens-left' },
      { x: 4.9, y: 32.1, w: 13.7, h: 8.4, detailSide: 'opens-right' },
      { x: 81.8, y: 51.2, w: 13.7, h: 8.4, detailSide: 'opens-left' },
      { x: 7.9, y: 16.8, w: 14.1, h: 8.4, detailSide: 'opens-down-right' },
      { x: 81.8, y: 70.2, w: 13.7, h: 8.4, detailSide: 'opens-left' },
      { x: 4.9, y: 70.9, w: 13.7, h: 8.4, detailSide: 'opens-up-right' },
      { x: 7.9, y: 84.7, w: 12.8, h: 3.0 },
      { x: 7.9, y: 89.2, w: 12.8, h: 3.0 },
    ],
  },
  movement: {
    image: '/images/solutions/stairs-hallways.jpg',
    copy: {
      en: {
        eyebrow: 'Stair and hallway risk map',
        title: 'Stairs need continuous support and clear visibility.',
        body: 'Risk builds where handrails stop, step edges are unclear, landings are dim or the route changes level without enough support.',
        imageAlt: 'Stairway and hallway with handrail and lighting for safer movement',
        risks: ['Interrupted handrail', 'Low landing light', 'Poor step contrast', 'Loose runner', 'Turn on stairs', 'No support at first step', 'Narrow hallway'],
        mapLabels: [],
        legend: [],
      },
      es: {
        eyebrow: 'Mapa de riesgos de escaleras',
        title: 'Las escaleras necesitan apoyo continuo y buena visibilidad.',
        body: 'El riesgo aumenta cuando el pasamanos se interrumpe, los bordes no se ven bien, los descansillos tienen poca luz o la ruta cambia de nivel sin apoyo suficiente.',
        imageAlt: 'Escalera y pasillo con pasamanos e iluminación para una circulación más segura',
        risks: ['Pasamanos interrumpido', 'Poca luz en descansillo', 'Poco contraste del escalón', 'Alfombra suelta', 'Giro en escalera', 'Sin apoyo al primer paso', 'Pasillo estrecho'],
        mapLabels: [],
        legend: [],
      },
    },
    labelPositions: [],
  },
  connected: {
    image: '/images/before-after/smart-after.jpg',
    copy: {
      en: {
        eyebrow: 'Connected safety map',
        title: 'Smart safety works best around real routines.',
        body: 'Useful technology supports the moments where help, light or awareness matters: night movement, doors, water, smoke and emergency contact.',
        imageAlt: 'Smart safety devices supporting safer routines at home',
        risks: ['Help out of reach', 'No night visibility', 'Hidden water leak', 'Unnoticed door activity', 'Smoke or CO risk', 'Routine change', 'Hard-to-use controls'],
        mapLabels: [],
        legend: [],
      },
      es: {
        eyebrow: 'Mapa de seguridad conectada',
        title: 'La tecnología debe apoyar rutinas reales.',
        body: 'La tecnología útil acompaña los momentos donde importan la ayuda, la luz o el aviso: movimiento nocturno, puertas, agua, humo y contacto de emergencia.',
        imageAlt: 'Dispositivos de seguridad conectada para apoyar rutinas más seguras en casa',
        risks: ['Ayuda fuera de alcance', 'Poca visibilidad nocturna', 'Fuga de agua oculta', 'Actividad de puerta sin aviso', 'Riesgo de humo o CO', 'Cambio de rutina', 'Controles difíciles'],
        mapLabels: [],
        legend: [],
      },
    },
    labelPositions: [],
  },
}
