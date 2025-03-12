import { defineConfig } from "vite";
import { svelte } from "@sveltejs/vite-plugin-svelte";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [svelte(), WailsTypedEvents("./bindings")],
});
