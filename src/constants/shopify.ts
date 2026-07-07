export const PLAN_URLS = {
  essential:
    'https://casamia-seniors.myshopify.com/products/living-room-safety-ergonomics',
  advanced:
    'https://casamia-seniors.myshopify.com/products/advanced-home-protection-plan',
  premium:
    'https://casamia-seniors.myshopify.com/products/premium-home-safety-plan',
} as const

export type PlanId = keyof typeof PLAN_URLS

export const PLAN_PRICES: Record<PlanId, number> = {
  essential: 269,
  advanced: 1149,
  premium: 1449,
}

export const IMAGE_URLS = {
  logo: 'https://casamia-seniors.myshopify.com/cdn/shop/files/logo6---new---2_4db7fe7b-ee6b-4442-a58d-11aeec884400.png',
  hero:
    'https://casamia-seniors.myshopify.com/cdn/shop/files/beautiful-senior-man-woman-hugging.jpg',
  finalCta:
    'https://casamia-seniors.myshopify.com/cdn/shop/files/adorable-elderly-couple-cutting-vegetables.jpg',
  gallery: [
    '/images/solutions/bathroom-safety.jpg',
    '/images/solutions/stairs-hallways.jpg',
    '/images/solutions/entrance-access.jpg',
    'https://casamia-seniors.myshopify.com/cdn/shop/files/adorable-elderly-couple-cutting-vegetables.jpg',
    'https://casamia-seniors.myshopify.com/cdn/shop/files/AdobeStock_423763182-scaled.jpg',
    'https://casamia-seniors.myshopify.com/cdn/shop/files/beautiful-senior-man-woman-hugging.jpg',
  ],
} as const
