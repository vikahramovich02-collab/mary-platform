import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// VITE_BACKEND_URL=http://localhost:5678  → локальный backend (для разработки)
// VITE_BACKEND_URL=http://77.237.241.242:5678 → продовый backend (по умолчанию)
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backend = env.VITE_BACKEND_URL || 'http://77.237.241.242:5678'
  console.log(`[mary] frontend → backend: ${backend}`)

  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        '/api/mary': {
          target: backend,
          changeOrigin: true,
          rewrite: (p) => p.replace(/^\/api\/mary/, '/webhook/mary'),
        },
      },
    },
  }
})
