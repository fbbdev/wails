import { defineConfig } from "vite";
import preact from "@preact/preset-vite";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [preact(), WailsTypedEvents("./bindings")],
});
