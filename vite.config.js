import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    allowedHosts: ["localhost", ".local"],
    proxy: {
      "/api": {
        target: "http://localhost:3008",
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxying if needed
      },
    },
  },
});
