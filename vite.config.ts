import path from "node:path";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    {
      name: "ignore-chrome-devtools-request",
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url === "/.well-known/appspecific/com.chrome.devtools.json") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.end("{}");
            return;
          }

          next();
        });
      },
    },
    tailwindcss(),
    reactRouter(),
  ],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
    },
  },
  css: {
    devSourcemap: true,
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/react") && !id.includes("node_modules/react-router")) {
            return "vendor-react";
          }
          if (id.includes("node_modules/react-router")) {
            return "vendor-router";
          }
          if (
            id.includes("node_modules/i18next") ||
            id.includes("node_modules/react-i18next") ||
            id.includes("node_modules/i18next-browser-languagedetector")
          ) {
            return "vendor-i18n";
          }
          if (id.includes("node_modules/tailwindcss") || id.includes("@tailwindcss")) {
            return "vendor-tailwind";
          }
          if (id.includes("node_modules/clsx") || id.includes("node_modules/tailwind-merge") || id.includes("node_modules/class-variance-authority")) {
            return "vendor-utils";
          }
        },
      },
    },
  },
});
