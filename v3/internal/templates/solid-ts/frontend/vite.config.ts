import { defineConfig } from "vite";
import solid from "vite-plugin-solid";
import WailsTypedEvents from "@wailsio/runtime/plugins/vite";

export default defineConfig({
  plugins: [solid(), WailsTypedEvents("./bindings")],
});
