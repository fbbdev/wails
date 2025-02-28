import { defineConfig } from "vite";
import wailsTypedEventsPlugin from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [wailsTypedEventsPlugin("./bindings")],
  build: {
    target: "safari11"
  },
});
