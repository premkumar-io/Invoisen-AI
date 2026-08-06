import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
      dedupe: ["react", "react-dom"],
    },
    build: {
      chunkSizeWarningLimit: 1600,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("three")) return "vendor-three";
              if (id.includes("recharts") || id.includes("d3")) return "vendor-charts";
              if (id.includes("framer-motion") || id.includes("gsap")) return "vendor-animation";
              if (id.includes("lucide-react") || id.includes("@radix-ui")) return "vendor-ui";
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
