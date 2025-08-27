import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      hmr: {
        overlay: false
      },
      // Only use proxy in development
      ...(command === 'serve' && {
        proxy: {
          '/api': {
            target: 'https://vireworkplace-backend-hpca.onrender.com',
            changeOrigin: true,
            secure: true,
            rewrite: (path) => path.replace(/^\/api/, '/api')
          }
        }
      })
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
      minify: 'esbuild',
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            ui: ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-dropdown-menu'],
            icons: ['@tabler/icons-react', 'lucide-react']
          }
        }
      },
      esbuild: {
        drop: isProduction ? ['console', 'debugger'] : []
      }
    },
    define: {
      __APP_ENV__: JSON.stringify(mode)
    }
  }
})