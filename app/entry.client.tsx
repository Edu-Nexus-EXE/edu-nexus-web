import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { env } from "~/shared/config/env";

/**
 * Khởi động MSW browser worker TRƯỚC khi hydrate React.
 * Chỉ chạy khi VITE_ENABLE_MOCK=true (dev only).
 * Dynamic import để MSW code bị tree-shake hoàn toàn trong production build.
 */
async function prepare() {
  if (env.ENABLE_MOCK) {
    const { worker } = await import("~/mocks/browser");
    await worker.start({
      onUnhandledRequest: "bypass", // request không có handler → pass through bình thường
      serviceWorker: { url: "/mockServiceWorker.js" },
    });
    console.info("[MSW] Mock server started");
  }
}

prepare().then(() => {
  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
    );
  });
});
