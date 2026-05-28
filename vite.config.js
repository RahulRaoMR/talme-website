import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import process from 'node:process'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "")
  const backendPort =
    process.env.BACKEND_PORT || env.BACKEND_PORT || env.NEWS_API_PORT || "3001"

  return {
    plugins: [react()],
    server: {
      host: "0.0.0.0",
      port: 5173,
      proxy: {
        "/api": {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
        },
      },
    },
    preview: {
      host: "0.0.0.0",
      port: 4173,
    },
  }
})
