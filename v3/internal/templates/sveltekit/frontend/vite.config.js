import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, searchForWorkspaceRoot } from 'vite';
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    sveltekit(),
    WailsTypedEvents("./bindings"),
  ],
  server: {
        fs: {
          allow: [
            // search up for workspace root
            searchForWorkspaceRoot(process.cwd()),
            // your custom rules
            './bindings/*',
          ],
        },
    },
  build: {
    // Wails supports deployment on macOS 10.13 High Sierra,
    // whose webview is based on the same runtime as Safari 11.
    // If the project targets later macOS versions, this option may be changed or removed.
    target: "safari11"
  }
})
