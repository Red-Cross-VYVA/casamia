import { StrictMode } from 'react'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Writable } from 'node:stream'
import './i18n'
import './index.css'
import { AppRoutes } from './App'
import { setServerSeoCollector, type SeoSnapshot } from './components/SEO'

export function render(url: string) {
  return new Promise<{ appHtml: string; seo: SeoSnapshot | null }>((resolve, reject) => {
    let appHtml = ''
    let seo: SeoSnapshot | null = null
    let shellError: unknown
    let abortRender: (() => void) | undefined
    let timeout: ReturnType<typeof setTimeout>
    function cleanup() {
      clearTimeout(timeout)
      setServerSeoCollector()
    }

    timeout = setTimeout(() => {
      abortRender?.()
      cleanup()
      reject(new Error(`SSR render timed out for ${url}`))
    }, 15_000)
    const writable = new Writable({
      write(chunk, _encoding, callback) {
        appHtml += chunk.toString()
        callback()
      },
    })
    setServerSeoCollector((snapshot) => {
      seo = snapshot
    })
    const { pipe, abort } = renderToPipeableStream(
      <StrictMode>
        <StaticRouter location={url}>
          <AppRoutes />
        </StaticRouter>
      </StrictMode>,
      {
        onAllReady() {
          pipe(writable)
        },
        onShellError(error) {
          shellError = error
          cleanup()
          reject(error)
        },
        onError(error) {
          if (!shellError) {
            console.error(error)
          }
        },
      },
    )
    abortRender = abort

    writable.on('finish', () => {
      cleanup()
      resolve({ appHtml, seo })
    })
    writable.on('error', (error) => {
      cleanup()
      reject(error)
    })
  })
}
