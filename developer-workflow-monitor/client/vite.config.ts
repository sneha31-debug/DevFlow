import { defineConfig } from 'vite'
// Config updated to trigger restart
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})
