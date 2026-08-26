import { PassThrough } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router'

import { AppRoutes } from './App'
import './i18n'
import { SEOCollectorContext, type ResolvedSEO } from './seo-context'

const fallbackSEO: ResolvedSEO = {
  title: 'CasaMia | Home Safety Adaptations for Seniors in Spain',
  description:
    'CasaMia helps families in Spain make homes safer for seniors with in-home safety visits, practical adaptations, smart safety technology, and grant support.',
  canonicalUrl: 'https://casamia.com.es/',
  socialImageUrl: 'https://casamia.com.es/images/solutions/portrait-lovely-couple-together.jpg',
  noindex: false,
  language: 'en',
  schema: [],
}

export function render(url: string) {
  return new Promise<{ html: string; seo: ResolvedSEO }>((resolve, reject) => {
    let seo = { ...fallbackSEO, canonicalUrl: new URL(url, fallbackSEO.canonicalUrl).toString() }
    let settled = false

    const stream = renderToPipeableStream(
      <SEOCollectorContext.Provider value={(nextSEO) => { seo = nextSEO }}>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </SEOCollectorContext.Provider>,
      {
        onAllReady() {
          const output = new PassThrough()
          const chunks: Buffer[] = []

          output.on('data', (chunk: Buffer) => chunks.push(chunk))
          output.on('error', reject)
          output.on('end', () => {
            settled = true
            resolve({ html: Buffer.concat(chunks).toString('utf8'), seo })
          })
          stream.pipe(output)
        },
        onShellError(error) {
          settled = true
          reject(error)
        },
        onError(error) {
          if (!settled) {
            console.error(error)
          }
        },
      },
    )

    setTimeout(() => {
      if (!settled) {
        stream.abort()
        reject(new Error(`Timed out while rendering ${url}`))
      }
    }, 30_000).unref()
  })
}
