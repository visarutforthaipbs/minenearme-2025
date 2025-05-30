import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@components": path.resolve(__dirname, "./src/components"),
      "@pages": path.resolve(__dirname, "./src/pages"),
      "@assets": path.resolve(__dirname, "./src/assets"),
      "@utils": path.resolve(__dirname, "./src/utils"),
      "@hooks": path.resolve(__dirname, "./src/hooks"),
      "@theme": path.resolve(__dirname, "./src/theme"),
      "@i18n": path.resolve(__dirname, "./src/i18n"),
      "@context": path.resolve(__dirname, "./src/context"),
      "@services": path.resolve(__dirname, "./src/services"),
      "@types": path.resolve(__dirname, "./src/types"),
      "@mockData": path.resolve(__dirname, "./src/mockData"),
    },
  },
  // Add specific handling for GeoJSON files
  assetsInclude: ["**/*.geojson"],
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      "/api/kokwatch": {
        target: "https://api.redesign.csitereport.com",
        changeOrigin: true,
        rewrite: (path) =>
          path.replace(/^\/api\/kokwatch/, "/publicdata/get_kokwatch"),
        secure: true,
      },
    },
  },
});
