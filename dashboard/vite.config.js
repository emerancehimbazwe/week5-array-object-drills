import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/week5-array-object-drills/',
  plugins: [tailwindcss()],
})