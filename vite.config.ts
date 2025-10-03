import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/<RomeTripWidget>/', // ← replace with your repo (e.g., /rome-weather/)
})
