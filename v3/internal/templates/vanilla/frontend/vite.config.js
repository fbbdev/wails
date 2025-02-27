import { fileURLToPath, URL } from "url";
import { defineConfig } from "vite";
import wailsTypedEventsPlugin from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wailsTypedEventsPlugin()],
  build: {
    target: "safari11"
  },
  resolve: {
    alias: [
      { find: "@bindings", replacement: fileURLToPath(new URL("bindings", import.meta.url)) },
    ]
  }
})
