import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
      dedupe: ["react", "react-dom"],
    },
    build: {
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules/three") || id.includes("node_modules/vanta")) {
              return "three-vendor";
            }
            if (id.includes("node_modules/recharts") || id.includes("node_modules/d3")) {
              return "charts-vendor";
            }
            if (
              id.includes("node_modules/framer-motion") ||
              id.includes("node_modules/gsap") ||
              id.includes("node_modules/motion")
            ) {
              return "motion-vendor";
            }
            if (
              id.includes("node_modules/@radix-ui") ||
              id.includes("node_modules/lucide-react")
            ) {
              return "ui-vendor";
            }
          },
        },
      },
    },
    server: {
      port: 3050,
      proxy: {
        "/api": {
          target: process.env.VITE_API_BASE_URL || "https://invoisen-api.onrender.com",
          changeOrigin: true,
          secure: false,
        },
      },
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
