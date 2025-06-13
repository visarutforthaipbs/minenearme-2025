import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/",
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@components": "/src/components",
      "@pages": "/src/pages",
      "@assets": "/src/assets",
      "@utils": "/src/utils",
      "@hooks": "/src/hooks",
      "@theme": "/src/theme",
      "@i18n": "/src/i18n",
      "@context": "/src/context",
      "@services": "/src/services",
      "@types": "/src/types",
      "@mockData": "/src/mockData",
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
