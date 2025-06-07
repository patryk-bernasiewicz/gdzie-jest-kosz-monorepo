import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3223,
  },
  resolve: {
    alias: {
      "@gjk/shared-utils": path.resolve(__dirname, "../../packages/shared-utils/src/index.ts"),
    },
  },
});
