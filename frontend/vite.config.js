import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist', // Carpeta de salida (puedes cambiarla a 'build' si lo prefieres)
    assetsDir: 'static', // Cambia 'assets' por 'static'
  },
})
