import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// NOTE: 'base' must match your GitHub repository name exactly.
// If your repo is: github.com/YourName/gita-bot-react → base: '/gita-bot-react/'
export default defineConfig({
  plugins: [react()],
  base: '/gita-bot-react/',
})
