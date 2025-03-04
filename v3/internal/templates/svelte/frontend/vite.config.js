import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    svelte(),
    WailsTypedEvents("./bindings"),
  ],
  build: {
    // Wails supports deployment on macOS 10.13 High Sierra,
    // whose webview is based on the same runtime as Safari 11.
    // If the project targets later macOS versions, this option may be changed or removed.
    target: "safari11"
  }
})
