import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/management-remote/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'veterinaria_management',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './DashboardPage': './src/dashboard/remote/DashboardPage.tsx',
      },
      shared: {
        react: { singleton: true },
        'react-dom': { singleton: true },
        'react-router-dom': { singleton: true },
        '@mui/material': { singleton: true },
        '@emotion/react': { singleton: true },
        '@emotion/styled': { singleton: true },
      },
      bundleAllCSS: true,
      moduleParseIdleTimeout: 30,
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5175,
    strictPort: true,
  },
  build: {
    outDir: 'dist/management',
    emptyOutDir: true,
    rollupOptions: {
      input: 'src/dashboard/remote/DashboardPage.tsx',
    },
  },
}))
