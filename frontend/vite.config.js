import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: {
        "@tailwindcss/postcss": {},
      },
    },
    transformerOptions: {
      exclude: [/node_modules/],
    },
  },
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://localhost:4000",
        changeOrigin: true,
        secure: false,
        ws: true,
      },
    },
  },
});