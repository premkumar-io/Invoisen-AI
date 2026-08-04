import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    resolve: {
      tsconfigPaths: true,
      dedupe: ["react", "react-dom"],
    },
    server: {
      port: 3050,
      proxy: {
        "/api": {
          target: "http://localhost:5050",
          changeOrigin: true,
        },
      },
    },
  },
  tanstackStart: {
    server: { entry: "server" },
  },
});
