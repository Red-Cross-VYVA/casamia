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

  if (env.ANTHROPIC_API_KEY) process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY
  if (env.ANTHROPIC_VISION_MODEL) process.env.ANTHROPIC_VISION_MODEL = env.ANTHROPIC_VISION_MODEL

  return {
    define: {
      'import.meta.env.VITE_ASSESSMENT_SUBMIT_URL': JSON.stringify(env.VITE_ASSESSMENT_SUBMIT_URL ?? ''),
      'import.meta.env.VITE_ESTIMATE_API_URL': JSON.stringify(env.VITE_ESTIMATE_API_URL ?? ''),
    },
    envPrefix: 'VITE_',
    plugins: [react(), photoAnalysisDevApi()],
  }
})
