import path from "node:path";

import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

function packageChunkName(id: string) {
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
  if (id.includes("node_modules/lucide-react")) {
    return "vendor-icons";
  }
  return null;
}

function appChunkName(id: string) {
  if (id.includes("/app/features/admin/") || id.includes("/app/routes/admin/")) {
    return "admin";
  }
  if (id.includes("/app/features/dashboard/") || id.includes("/app/routes/dashboard/") || id.includes("/app/routes/analytics/")) {
    return "dashboard";
  }
  if (id.includes("/app/features/portfolio/") || id.includes("/app/routes/marketing/portfolio-public")) {
    return "portfolio";
  }
  if (id.includes("/app/features/pricing/") || id.includes("/app/routes/pricing") || id.includes("/app/routes/checkout")) {
    return "pricing";
  }
  if (id.includes("/app/features/assessment/") || id.includes("/app/features/cv/") || id.includes("/app/routes/assessment") || id.includes("/app/routes/cv")) {
    return "assessment";
  }
  if (id.includes("/app/features/jd/") || id.includes("/app/routes/dashboard/jd") || id.includes("/app/routes/jd-submissions")) {
    return "jd";
  }
  if (id.includes("/app/features/auth/") || id.includes("/app/routes/auth") || id.includes("/app/routes/login") || id.includes("/app/routes/signup")) {
    return "auth";
  }
  if (id.includes("/app/features/landing/") || id.includes("/app/routes/home") || id.includes("/app/routes/contact")) {
    return "landing";
  }
  if (id.includes("/app/shared/") || id.includes("/app/root.tsx") || id.includes("/app/routes.ts")) {
    return "shared-app";
  }
  return null;
}

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
    outDir: "dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          return packageChunkName(id) ?? appChunkName(id) ?? undefined;
        },
      },
    },
  },
});
