import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Configuração padrão do Vite para React (Fast Refresh, JSX, etc.).
export default defineConfig({
  plugins: [react()],
})
