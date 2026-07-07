import { IMAGE_URLS } from './shopify'

export const serviceVisuals: Record<
  string,
  {
    badge: string
    image: string
    note: string
  }
> = {
  'bathroom-safety': {
    badge: 'Highest fall-risk room',
    image: '/images/solutions/bathroom-safety.jpg',
    note: 'Transfers, water, support points',
  },
  'stair-safety': {
    badge: 'Daily movement route',
    image: '/images/solutions/stairs-hallways.jpg',
    note: 'Handrails, contrast, lighting',
  },
  'entrance-accessibility': {
    badge: 'Access starts outside',
    image: '/images/solutions/entrance-access.jpg',
    note: 'Thresholds, ramps, visitor access',
  },
  'kitchen-safety': {
    badge: 'Routine and reach',
    image: IMAGE_URLS.finalCta,
    note: 'Storage, lighting, appliance safety',
  },
  'bedroom-safety': {
    badge: 'Rest and night routines',
    image: 'https://cdn.shopify.com/s/files/1/0941/8502/9896/files/big_imag_3.jpg?v=1742505710',
    note: 'Bed transfers, night routes, help within reach',
  },
  'smart-home-safety': {
    badge: 'Connected reassurance',
    image: IMAGE_URLS.techHero,
    note: 'Sensors, VYVA, family alerts',
  },
}
