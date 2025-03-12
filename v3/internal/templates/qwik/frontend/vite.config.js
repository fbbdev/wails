import { defineConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    qwikVite({
      csr: true,
    }),
    WailsTypedEvents("./bindings"),
  ],
});
