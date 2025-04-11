import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import dotenv from 'dotenv'

// Carregar variáveis de ambiente
dotenv.config()

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'crypto': 'crypto-browserify'
    },
  },
  server: {
    port: parseInt(process.env.PORT || '3000')
  },
  build: {
    sourcemap: true,
    minify: false
  }
}) 