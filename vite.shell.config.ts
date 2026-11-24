import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, loadEnv } from 'vite'

const shared = {
  react: { singleton: true },
  'react-dom': { singleton: true },
  'react-router-dom': { singleton: true },
  '@mui/material': { singleton: true },
  '@emotion/react': { singleton: true },
  '@emotion/styled': { singleton: true },
}

export default defineConfig(({ mode, command }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const remoteBase = command === 'build' ? '/auth-remote/remoteEntry.js' : '/remoteEntry.js'
  const managementRemoteBase = command === 'build' ? '/management-remote/remoteEntry.js' : '/remoteEntry.js'

  return {
    plugins: [
      react(),
      tailwindcss(),
      federation({
        name: 'veterinaria_shell',
        remotes: {
          auth: {
            type: 'module',
            name: 'veterinaria_auth',
            entry: env.VITE_AUTH_REMOTE_URL || `http://localhost:5174${remoteBase}`,
            entryGlobalName: 'veterinaria_auth',
            shareScope: 'default',
          },
          management: {
            type: 'module',
            name: 'veterinaria_management',
            entry: env.VITE_MANAGEMENT_REMOTE_URL || `http://localhost:5175${managementRemoteBase}`,
            entryGlobalName: 'veterinaria_management',
            shareScope: 'default',
          },
        },
        shared,
        dts: false,
      }),
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
    preview: {
      port: 4173,
      strictPort: true,
    },
    build: {
      outDir: 'dist/shell',
      emptyOutDir: true,
    },
  }
})
