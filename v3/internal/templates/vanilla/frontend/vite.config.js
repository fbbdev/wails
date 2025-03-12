import { defineConfig } from "vite";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [WailsTypedEvents("./bindings")],
});
