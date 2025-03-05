import { defineConfig } from "vite";
import react from '@vitejs/plugin-react-swc'
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    WailsTypedEvents("./bindings"),
  ],
  build: {
    // Wails supports deployment on macOS 10.13 High Sierra,
    // whose webview is based on the same runtime as Safari 11.
    // If the project targets later macOS versions, this option may be changed or removed.
    target: "safari11"
  }
})
