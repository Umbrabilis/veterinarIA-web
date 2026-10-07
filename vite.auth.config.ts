import { federation } from '@module-federation/vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/auth-remote/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'veterinaria_auth',
      filename: 'remoteEntry.js',
      dts: false,
      exposes: {
        './LoginPage': './src/auth/remote/LoginPage.tsx',
        './RegisterPage': './src/auth/remote/RegisterPage.tsx',
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
    port: 5174,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
  build: {
    outDir: 'dist/auth',
    emptyOutDir: true,
    rollupOptions: {
      input: ['src/auth/remote/LoginPage.tsx', 'src/auth/remote/RegisterPage.tsx'],
    },
  },
}))
