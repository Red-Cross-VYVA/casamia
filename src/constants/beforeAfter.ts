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
    before: '/images/before-after/stairs-before.jpg',
    after: '/images/before-after/stairs-after.jpg',
    mode: 'compare',
  },
  {
    before: '/images/before-after/entry-before.jpg',
    after: '/images/before-after/entry-after.jpg',
    mode: 'compare',
  },
  {
    before: '/images/solutions/front-view-adorable-couple-kitchen.jpg',
    mode: 'focus',
  },
  {
    before: '/images/solutions/close-up-senior-couple-together-love.jpg',
    mode: 'focus',
  },
  {
    before: '/images/solutions/portrait-lovely-couple-together.jpg',
    mode: 'focus',
  },
]
