import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const projectRoot = fileURLToPath(new URL('.', import.meta.url))
  const env = { ...loadEnv(mode, projectRoot, 'VITE_'), ...process.env }

  return {
    define: {
      'import.meta.env.VITE_ASSESSMENT_SUBMIT_URL': JSON.stringify(env.VITE_ASSESSMENT_SUBMIT_URL ?? ''),
      'import.meta.env.VITE_ESTIMATE_API_URL': JSON.stringify(env.VITE_ESTIMATE_API_URL ?? ''),
    },
    envPrefix: 'VITE_',
    plugins: [react()],
  }
})
