import { defineConfig } from "vite";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [WailsTypedEvents("./bindings")],
  build: {
    // Wails supports deployment on macOS 10.13 High Sierra,
    // whose webview is based on the same runtime as Safari 11.
    // If you are targeting later macOS versions, you can change or remove this option.
    target: "safari11"
  }
});
