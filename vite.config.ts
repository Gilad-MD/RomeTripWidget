import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// CHANGE THIS to your repo name:
const repoName = 'rome-weather'

export default defineConfig({
  plugins: [react()],
  base: `/${repoName}/`,
})
