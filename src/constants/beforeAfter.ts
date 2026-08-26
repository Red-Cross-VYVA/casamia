export type BeforeAfterTransformation = {
  title: string
  benefits: string[]
}

export type BeforeAfterVisual = {
  before: string
  after?: string
  mode: 'compare' | 'focus'
}

export const beforeAfterVisuals: BeforeAfterVisual[] = [
  {
    before: '/images/before-after/bathroom-before.webp',
    after: '/images/before-after/bathroom-after.webp',
    mode: 'compare',
  },
  {
    before: '/images/before-after/stairs-before.webp',
    after: '/images/before-after/stairs-after.webp',
    mode: 'compare',
  },
  {
    before: '/images/before-after/entry-before.webp',
    after: '/images/before-after/entry-after.webp',
    mode: 'compare',
  },
  {
    before: '/images/before-after/kitchen-before.webp',
    after: '/images/before-after/kitchen-after.webp',
    mode: 'compare',
  },
  {
    before: '/images/before-after/bedroom-before.webp',
    after: '/images/before-after/bedroom-after.webp',
    mode: 'compare',
  },
  {
    before: '/images/before-after/living-before.webp',
    after: '/images/before-after/living-after.webp',
    mode: 'compare',
  },
]
