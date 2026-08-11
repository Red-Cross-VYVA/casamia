import { fileURLToPath, URL } from 'node:url'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'

type PhotoApiResponse = ServerResponse & {
  status: (statusCode: number) => ServerResponse
}

type PhotoApiHandler = (
  request: IncomingMessage,
  response: PhotoApiResponse,
) => Promise<void>

function devApiProxy(target: string) {
  return {
    target,
    changeOrigin: true,
    secure: true,
    headers: {
      origin: new URL(target).origin,
    },
  }
}

function photoAnalysisDevApi(): Plugin {
  return {
    name: 'casamia-photo-analysis-dev-api',
    configureServer(server) {
      const mountHandler = (
        path: string,
        loadHandler: () => Promise<{ default: PhotoApiHandler }>,
      ) => server.middlewares.use(path, async (request, response, next) => {
        try {
          const responseWithStatus = response as typeof response & {
            status: (statusCode: number) => typeof response
          }
          responseWithStatus.status = (statusCode) => {
            response.statusCode = statusCode
            return response
          }

          const { default: handler } = await loadHandler()
          await handler(request, responseWithStatus)
        } catch (error) {
          next(error)
        }
      })

      mountHandler(
        '/api/public/classify-room-photo',
        () => import('./api/public/classify-room-photo.js'),
      )
      mountHandler(
        '/api/public/analyse-safety-photo',
        () => import('./api/public/analyse-safety-photo.js'),
      )
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = { ...loadEnv(mode, projectRoot, ''), ...process.env }
  const devVisionApiUrl = (env.CASAMIA_DEV_VISION_API_URL || '').toString().replace(/\/$/, '')
  const devPublicApiUrl = (
    env.CASAMIA_DEV_PUBLIC_API_URL
    || env.CASAMIA_DEV_VISION_API_URL
    || ''
  ).toString().replace(/\/$/, '')
  const useLocalVisionApi = Boolean(env.OPENAI_API_KEY)
  const proxy: Record<string, ReturnType<typeof devApiProxy>> = {}

  if (!useLocalVisionApi && devVisionApiUrl) {
    proxy['/api/public/analyse-safety-photo'] = devApiProxy(devVisionApiUrl)
    proxy['/api/public/classify-room-photo'] = devApiProxy(devVisionApiUrl)
  }

  if (devPublicApiUrl) {
    proxy['/api/public/grant-reports'] = devApiProxy(devPublicApiUrl)
    proxy['/api/public/safety-reports'] = devApiProxy(devPublicApiUrl)
  }

  if (env.OPENAI_API_KEY) process.env.OPENAI_API_KEY = env.OPENAI_API_KEY
  if (env.OPENAI_VISION_MODEL) process.env.OPENAI_VISION_MODEL = env.OPENAI_VISION_MODEL

  return {
    define: {
      'import.meta.env.VITE_ASSESSMENT_SUBMIT_URL': JSON.stringify(env.VITE_ASSESSMENT_SUBMIT_URL ?? ''),
      'import.meta.env.VITE_ESTIMATE_API_URL': JSON.stringify(env.VITE_ESTIMATE_API_URL ?? ''),
      'import.meta.env.VITE_PUBLIC_SITE_API_ENABLED': JSON.stringify(
        Boolean(env.VITE_PUBLIC_SITE_API_URL || env.VITE_WEBSITE_API_URL || env.VITE_API_BASE_URL || devPublicApiUrl),
      ),
    },
    envPrefix: 'VITE_',
    plugins: [react(), ...(useLocalVisionApi ? [photoAnalysisDevApi()] : [])],
    server: Object.keys(proxy).length > 0
      ? {
          proxy,
        }
      : undefined,
  }
})
