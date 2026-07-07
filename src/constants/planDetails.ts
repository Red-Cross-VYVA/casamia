import { PLAN_URLS, type PlanId } from './shopify'

export type PlanDetail = {
  id: PlanId
  marketingName: string
  shopifyTitle: string
  price: string
  handle: string
  url: string
  summary: string
  bestFor: string[]
  outcomes: string[]
  included: Array<{
    title: string
    items: string[]
  }>
  process: string[]
  images: string[]
  galleryImages?: Array<{
    src: string
    title: string
    description: string
  }>
  note: string
}

export const PLAN_DETAILS: Record<PlanId, PlanDetail> = {
  essential: {
    id: 'essential',
    marketingName: 'Essential',
    shopifyTitle: 'Safe Home Entry, Living, & Stairway',
    price: '€269',
    handle: 'living-room-safety-ergonomics',
    url: PLAN_URLS.essential,
    summary:
      'A focused safety package for the entryway, living room, stairs, and hallway: the places where lighting, grip, steps, and furniture layout most often create avoidable daily risks.',
    bestFor: [
      'Seniors who need the first layer of home accessibility improvements',
      'Families who want fast, practical upgrades in the main movement areas',
      'Homeowners who want safer lighting, stairs, and furniture flow without a full-home package',
    ],
    outcomes: [
      'Clearer movement through entry, living, stair, and hallway areas',
      'Reduced slip and trip hazards on stairs',
      'Better night visibility with motion-activated lighting',
      'A safer furniture layout for everyday mobility',
    ],
    included: [
      {
        title: 'Entryway safety and accessibility',
        items: [
          'Motion-activated indoor lighting to improve visibility at night',
          'Access-focused safety review for the main entrance area',
          'Recommendations for safer movement in and out of the home',
        ],
      },
      {
        title: 'Living room comfort and smart upgrades',
        items: [
          'Motion-activated and smart lighting for easier movement',
          'Furniture placement and safety adjustments',
          'Layout optimisation to improve comfort and accessibility',
        ],
      },
      {
        title: 'Stairs and hallway safety',
        items: [
          'Handrails and stairway grab bars for more secure grip',
          'Non-slip stair treads to reduce slipping hazards',
          'Smart stairway lighting to illuminate steps at night',
        ],
      },
      {
        title: 'CasaMia service included',
        items: [
          'Home safety assessment before installation',
          'Professional installation with minimal disruption',
          'Grant filing guidance included with the plan',
        ],
      },
    ],
    process: [
      'Choose the Essential plan and share the areas that need attention.',
      'CasaMia reviews your home safety needs and confirms the upgrades.',
      'The team installs the safety modifications and smart features.',
      'You use the main living areas with more confidence and less daily friction.',
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/beautiful-senior-man-woman-hugging.jpg?v=1742224196',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/81MwoW9vpiL._AC_SX679_fc4d1fa3-1448-46d8-9cc6-97b4522b8c4b.jpg?v=1742504730',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/610EPLxZzeL._AC_SL1500.jpg?v=1742252415',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/41PfEeym37L._SY445_SX342_QL70_ML2.jpg?v=1742261020',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61vA00tw6FL._AC_SX679.jpg?v=1742505191',
    ],
    galleryImages: [
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/81MwoW9vpiL._AC_SX679_fc4d1fa3-1448-46d8-9cc6-97b4522b8c4b.jpg?v=1742504730',
        title: 'Rug and mat corner grips',
        description:
          'Secure loose rug corners and mats so walkways feel flatter and less likely to catch a foot or walker.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/610EPLxZzeL._AC_SL1500.jpg?v=1742252415',
        title: 'Stairway handrail support',
        description:
          'Add a steadier handhold along stair runs so each step has more confidence and control.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/41PfEeym37L._SY445_SX342_QL70_ML2.jpg?v=1742261020',
        title: 'Non-slip stair treads',
        description:
          'Improve traction on individual steps, especially where smooth flooring or socks can make stairs risky.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61vA00tw6FL._AC_SX679.jpg?v=1742505191',
        title: 'Night lights for safer movement',
        description:
          'Add gentle automatic lighting for hallways, stairs, and living areas used after dark.',
      },
    ],
    note:
      'Details are summarised from the CasaMia Shopify product listing for Safe Home Entry, Living, & Stairway.',
  },
  advanced: {
    id: 'advanced',
    marketingName: 'Advanced',
    shopifyTitle: 'Advanced Home Protection',
    price: '€1,149',
    handle: 'advanced-home-protection-plan',
    url: PLAN_URLS.advanced,
    summary:
      'A broader home protection package that adds bathroom and staircase support, anti-slip upgrades, smart access, emergency alerting, and furniture layout optimisation.',
    bestFor: [
      'Seniors who want extra protection beyond the main living areas',
      'Families supporting children, elderly relatives, or people with mobility needs',
      'Homes that need practical safety upgrades without going fully smart-home',
    ],
    outcomes: [
      'Safer navigation through hallways, entryways, bathrooms, and living spaces',
      'Professional grip support in bathrooms and staircases',
      'Keyless access and emergency alert capability',
      'More accessible room layouts for everyday movement',
    ],
    included: [
      {
        title: 'Core safety modifications',
        items: [
          'Motion-activated lighting in hallways, entryways, and living spaces',
          'Grab bars and handrails installed in bathrooms and staircases',
          'Anti-slip flooring enhancements in critical areas such as bathrooms and entryways',
        ],
      },
      {
        title: 'Smart access and emergency support',
        items: [
          'Smart door lock for secure keyless entry',
          'Emergency call button for quick alerts to caregivers or family members',
          'Safety setup intended to improve confidence without full smart automation',
        ],
      },
      {
        title: 'Movement and stair safety',
        items: [
          'Furniture layout optimisation for easier movement and accessibility',
          'Non-slip stair treads where needed',
          'Additional railings or stair safety improvements where needed',
        ],
      },
      {
        title: 'CasaMia service included',
        items: [
          'Booking link for home safety inspection or direct installation',
          'Professional installation with care and efficiency',
          'Grant filing guidance included with the plan',
        ],
      },
    ],
    process: [
      'Securely purchase the Advanced plan online.',
      'Schedule your home safety inspection or direct installation.',
      'CasaMia installs the recommended upgrades with care and efficiency.',
      'Enjoy a safer, more accessible home tailored to your lifestyle.',
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/af67c440-c0d9-42c4-92c2-4786f89670a7.jpg?v=1742475112',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/house_-_2.jpg?v=1742505710',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_image.jpg?v=1742505710',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_image2.jpg?v=1742505710',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_imag_3.jpg?v=1742505710',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/timeline-main.png?v=1742505840',
    ],
    galleryImages: [
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/house_-_2.jpg?v=1742505710',
        title: 'Full-home safety checklist',
        description:
          'Review the main fall-risk, lighting, flooring, and access checks CasaMia uses to prioritise upgrades.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_image.jpg?v=1742505710',
        title: 'Bathroom grip and slip safety',
        description:
          'See where grab bars, anti-slip surfaces, alarms, and easier fixtures can reduce bathroom risk.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_image2.jpg?v=1742505710',
        title: 'Kitchen access and appliance safety',
        description:
          'Understand the kitchen changes that make everyday tasks safer, easier to reach, and less tiring.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_imag_3.jpg?v=1742505710',
        title: 'Bedroom mobility and bed safety',
        description:
          'Review bedroom supports for night movement, bed access, lighting, and safer daily routines.',
      },
    ],
    note:
      'Details are summarised from the CasaMia Shopify product listing for Advanced Home Protection.',
  },
  premium: {
    id: 'premium',
    marketingName: 'Premium',
    shopifyTitle: 'Premium Home Safety',
    price: '€1,449',
    handle: 'premium-home-safety-plan',
    url: PLAN_URLS.premium,
    summary:
      'The all-inclusive package for whole-home safety, accessibility, smart home control, VYVA assistant access, health monitoring, fall detection, emergency response, and ongoing support.',
    bestFor: [
      'Families who want the most complete safety coverage across the whole home',
      'Seniors who benefit from smart controls, health monitoring, and emergency response',
      'Homes that need room-by-room upgrades rather than a single-area intervention',
    ],
    outcomes: [
      'Full-room safety coverage across living areas, kitchen, bathroom, bedroom, entries, and stairs',
      'Smart home controls for lighting, appliances, locks, and everyday routines',
      'VYVA app and caregiver dashboard access with the first-year subscription included',
      'Health and vitals monitoring with caregiver alert potential',
      'Fall detection, emergency buttons, and leak/safety sensors in high-risk areas',
    ],
    included: [
      {
        title: 'Living room',
        items: [
          'Voice-activated assistant for lighting, thermostat, and appliance control',
          'Smart lighting systems that adjust by time of day or movement',
          'Motion sensors and smart plugs or outlets',
          'Health monitoring devices such as blood pressure and heart-rate trackers',
        ],
      },
      {
        title: 'Kitchen',
        items: [
          'Voice-activated assistant for hands-free control and tasks',
          'Smart appliances with remote control and safety features such as automatic shutoff',
          'Leak detectors and smart faucets',
          'Medication management systems with reminders, alerts, and custom schedules',
        ],
      },
      {
        title: 'Bathroom',
        items: [
          'Smart lighting systems with motion activation',
          'Smart thermostats or water-temperature management to reduce scalding risk',
          'Voice-activated assistance and water leak sensors',
          'Health monitoring devices and bathroom-use tracking support',
        ],
      },
      {
        title: 'Bedroom',
        items: [
          'Voice-activated assistant for lights, alarms, and communication devices',
          'Smart bed sensors for sleep patterns, movement, and fall detection',
          'Automated lighting adjusted to sleep schedules',
          'Bedside emergency call buttons or wearable emergency devices',
        ],
      },
      {
        title: 'Hallways, entries, and stairways',
        items: [
          'Motion-activated smart lighting for hallways, entries, and stairs',
          'Video doorbells and smart locks for secure visitor communication and keyless entry',
          'Handrails with integrated LED lighting',
          'Fall detection sensors on stairs with immediate alert capability',
        ],
      },
      {
        title: 'CasaMia service included',
        items: [
          'Thorough safety and comfort assessment',
          'Extensive modifications throughout the home',
          'Advanced smart home integrations',
          'VYVA app and caregiver dashboard setup with one-year subscription included',
          'Ongoing support and maintenance included in the package',
        ],
      },
    ],
    process: [
      'Review the home room by room and confirm the right Premium setup.',
      'CasaMia plans smart safety, accessibility, and monitoring upgrades together.',
      'The team installs safety modifications and smart integrations across the home.',
      'Your family gets a safer home with ongoing support and maintenance.',
    ],
    images: [
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/front-view-mature-man-woman-love.jpg?v=1742475319',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/416ZlEJOKJL._AC_SX679.jpg?v=1742505191',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/51H-dhEJCcL._AC_SX679.jpg?v=1742505588',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/51GPq-zL4uL._AC_SX679.jpg?v=1742466644',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61Qy99d2PML._SY450.jpg?v=1742505588',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61jBw2pLKdS._AC_SX679.jpg?v=1742505191',
      'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61AKwRV6LyL._AC_SL1000.jpg?v=1742505588',
    ],
    galleryImages: [
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/416ZlEJOKJL._AC_SX679.jpg?v=1742505191',
        title: 'Medication reminder support',
        description:
          'Use timed reminders to make daily medication routines easier to follow and less dependent on memory.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/51H-dhEJCcL._AC_SX679.jpg?v=1742505588',
        title: 'Wearable emergency button',
        description:
          'Keep quick help within reach with a wearable SOS button for urgent moments around the home.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/51GPq-zL4uL._AC_SX679.jpg?v=1742466644',
        title: 'Home emergency alert system',
        description:
          'Connect wall buttons or wearable alerts so family or caregivers can be notified quickly.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61Qy99d2PML._SY450.jpg?v=1742505588',
        title: 'Video door communication',
        description:
          'See and speak with visitors from a phone, helping reduce rushed movement to the front door.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61jBw2pLKdS._AC_SX679.jpg?v=1742505191',
        title: 'Smoke and CO monitoring',
        description:
          'Add early alerts for smoke and carbon monoxide risks in key rooms and sleeping areas.',
      },
      {
        src: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/61AKwRV6LyL._AC_SL1000.jpg?v=1742505588',
        title: 'Voice control for daily routines',
        description:
          'Use voice control for lighting and compatible devices, especially from the bedside or living room.',
      },
    ],
    note:
      'Details are summarised from the CasaMia Shopify product listing for Premium Home Safety.',
  },
}

export const PLAN_DETAIL_LIST = [
  PLAN_DETAILS.essential,
  PLAN_DETAILS.advanced,
  PLAN_DETAILS.premium,
]
