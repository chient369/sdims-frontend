import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@features': '/src/features',
      '@hooks': '/src/hooks',
      '@context': '/src/context',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@types': '/src/types',
      '@config': '/src/config',
      '@routes': '/src/routes',
      '@assets': '/src/assets'
    }
  },
  server: {
    port: 3000,
    open: true,
    allowedHosts: [
      "3aa5-182-169-68-52.ngrok-free.app"
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
