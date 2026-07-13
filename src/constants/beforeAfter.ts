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
    before: '/images/before-after/bathroom-before.jpg',
    after: '/images/before-after/bathroom-after.jpg',
    mode: 'compare',
  },
  {
    before: '/images/before-after/stairs-before.png',
    after: '/images/before-after/stairs-after.png',
    mode: 'compare',
  },
  {
    before: '/images/before-after/entry-before.jpg',
    after: '/images/before-after/entry-after.jpg',
    mode: 'compare',
  },
  {
    before: '/images/before-after/kitchen-before.png',
    after: '/images/before-after/kitchen-after.png',
    mode: 'compare',
  },
  {
    before: '/images/before-after/bedroom-before.png',
    after: '/images/before-after/bedroom-after.png',
    mode: 'compare',
  },
  {
    before: '/images/before-after/living-before.png',
    after: '/images/before-after/living-after.png',
    mode: 'compare',
  },
]
