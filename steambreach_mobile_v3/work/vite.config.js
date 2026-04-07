import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      
      // Tell the plugin to inject the crossorigin attribute
      useCredentials: true, 
      
      manifest: {
        name: 'Syntax Syndicate',
        short_name: 'Syntax',
        description: 'Cyber-noir hacking terminal',
        theme_color: '#05080c',
        icons: [
          // ... your icons ...
        ]
      }
    })
  ],
})
