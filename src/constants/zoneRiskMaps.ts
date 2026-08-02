import type { ServiceRoom } from '../types/serviceCatalogue'

export type ZoneRiskArea = Extract<ServiceRoom, 'bathroom' | 'bedroom' | 'kitchen' | 'living-room' | 'entrance' | 'movement' | 'connected'>

type ZoneRiskLabelPosition = {
  x: number
  y: number
  w: number
  h: number
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
      },
      es: {
        eyebrow: 'Mapa de riesgos del baño',
        title: 'El riesgo del baño se acumula en pequeños movimientos.',
        body: 'Zonas mojadas, transferencias, umbrales y objetos sueltos pueden combinarse al ducharse, usar el WC o entrar de noche.',
        imageAlt: 'Mapa anotado de baño con puntos habituales de riesgo de caída y acceso',
        risks: ['Alfombrilla suelta', 'Escalón alto', 'Entrada a ducha', 'Altura del WC', 'Zona mojada', 'Cable visible', 'Puerta estrecha'],
        mapLabels: ['Alfombra', 'Escalón', 'Ducha', 'Altura WC', 'Zona mojada', 'Cable', 'Puerta'],
        legend: ['Riesgo alto', 'Riesgo medio'],
      },
    },
    labelPositions: [
      { x: 35.6, y: 78.8, w: 9.8, h: 5.6 },
      { x: 87.2, y: 24.7, w: 8.8, h: 6.2 },
      { x: 87.2, y: 44.8, w: 8.8, h: 6.2 },
      { x: 41.0, y: 58.9, w: 8.4, h: 6.4 },
      { x: 7.7, y: 16.3, w: 11.0, h: 6.6 },
      { x: 89.1, y: 62.8, w: 8.5, h: 5.9 },
      { x: 76.9, y: 88.6, w: 7.4, h: 5.9 },
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
      },
      es: {
        eyebrow: 'Mapa de riesgos del dormitorio',
        title: 'El riesgo nocturno empieza alrededor de la cama.',
        body: 'Poca luz, objetos junto a la cama, alfombras, zapatos y puertas importan más cuando la persona está cansada o se mueve con prisa.',
        imageAlt: 'Mapa anotado de dormitorio con riesgos de movimiento nocturno y transferencias',
        risks: ['Alfombra suelta', 'Transferencia de cama', 'Zapatos junto a la cama', 'Umbral de puerta', 'Mesilla cargada', 'Ruta al armario', 'Puerta estrecha'],
        mapLabels: ['Alfombra', 'Borde cama', 'Zapatos', 'Umbral', 'Mesilla', 'Armario', 'Puerta'],
        legend: ['Riesgo alto', 'Riesgo medio'],
      },
    },
    labelPositions: [
      { x: 10.9, y: 18.7, w: 13.5, h: 7.1 },
      { x: 13.1, y: 36.1, w: 12.5, h: 6.6 },
      { x: 9.1, y: 62.4, w: 16.3, h: 7.1 },
      { x: 25.1, y: 76.0, w: 13.9, h: 6.5 },
      { x: 76.5, y: 17.5, w: 13.8, h: 7.7 },
      { x: 80.4, y: 43.4, w: 15.4, h: 7.2 },
      { x: 70.1, y: 82.1, w: 13.5, h: 6.6 },
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
      },
      es: {
        eyebrow: 'Mapa de riesgos de la cocina',
        title: 'El riesgo en cocina mezcla alcance, calor y movimiento.',
        body: 'Muchos incidentes ocurren al cargar, girar, alcanzar, cocinar o moverse entre zonas húmedas y superficies de trabajo.',
        imageAlt: 'Mapa anotado de cocina con riesgos de alcance, cocción y circulación',
        risks: ['Zona húmeda del fregadero', 'Alfombrilla suelta', 'Almacenaje alto', 'Poca luz de trabajo', 'Zona de calor', 'Cajón abierto', 'Cable en el suelo'],
        mapLabels: ['Fregadero', 'Alfombrilla', 'Alto alcance', 'Luz tarea', 'Calor', 'Cajón', 'Cable'],
        legend: ['Riesgo alto', 'Riesgo medio'],
      },
    },
    labelPositions: [
      { x: 3.8, y: 42.9, w: 13.7, h: 8.8 },
      { x: 4.3, y: 66.1, w: 14.6, h: 7.8 },
      { x: 4.1, y: 8.5, w: 15.9, h: 8.9 },
      { x: 82.4, y: 10.4, w: 14.4, h: 8.8 },
      { x: 85.4, y: 38.1, w: 13.7, h: 8.0 },
      { x: 84.8, y: 62.8, w: 14.0, h: 8.6 },
      { x: 82.1, y: 84.9, w: 14.4, h: 8.7 },
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
      },
      es: {
        eyebrow: 'Mapa de riesgos del salón',
        title: 'El salón necesita rutas claras, no solo comodidad.',
        body: 'Alfombras, cables, mesas bajas, asientos blandos y pasos estrechos pueden convertir movimientos normales en puntos de riesgo.',
        imageAlt: 'Mapa anotado de salón con riesgos de ruta, muebles y cables',
        risks: ['Borde de alfombra', 'Cable de TV', 'Mesa baja', 'Poca luz lateral', 'Cable de lámpara', 'Sofá blando', 'Paso estrecho'],
        mapLabels: ['Alfombra', 'Cable TV', 'Mesa baja', 'Luz lateral', 'Cable', 'Sofá', 'Paso'],
        legend: ['Riesgo alto', 'Riesgo medio'],
      },
    },
    labelPositions: [
      { x: 43.6, y: 88.0, w: 10.8, h: 5.5 },
      { x: 86.6, y: 29.2, w: 10.8, h: 5.7 },
      { x: 70.1, y: 70.5, w: 11.3, h: 6.3 },
      { x: 4.1, y: 74.1, w: 10.3, h: 6.3 },
      { x: 6.3, y: 17.8, w: 8.4, h: 5.7 },
      { x: 4.9, y: 53.9, w: 9.6, h: 6.3 },
      { x: 90.8, y: 55.1, w: 7.6, h: 5.7 },
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
      },
      es: {
        eyebrow: 'Mapa de riesgos de la entrada',
        title: 'La entrada concentra riesgos de ruta, luz y umbrales.',
        body: 'La ruta de acceso puede mezclar poca luz, alfombrillas, obstáculos, umbrales altos y falta de apoyo en pocos pasos.',
        imageAlt: 'Mapa anotado de entrada y pasillo con riesgos de ruta, iluminación y umbrales',
        risks: ['Poca luz', 'Felpudo suelto', 'Obstáculo en ruta', 'Zapatos en ruta', 'Umbral alto', 'Paso estrecho', 'Borde de escalón'],
        mapLabels: ['Poca luz', 'Felpudo', 'Obstáculo', 'Zapatos', 'Umbral', 'Paso estrecho', 'Escalón'],
        legend: ['Riesgo alto', 'Riesgo medio'],
      },
    },
    labelPositions: [
      { x: 81.8, y: 6.0, w: 13.7, h: 8.4 },
      { x: 81.8, y: 27.8, w: 13.7, h: 8.4 },
      { x: 4.9, y: 32.1, w: 13.7, h: 8.4 },
      { x: 81.8, y: 51.2, w: 13.7, h: 8.4 },
      { x: 7.9, y: 16.8, w: 14.1, h: 8.4 },
      { x: 81.8, y: 70.2, w: 13.7, h: 8.4 },
      { x: 4.9, y: 70.9, w: 13.7, h: 8.4 },
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
