import { useEffect, useState } from "react";
import { I18nextProvider } from "react-i18next";

import i18n from "~/shared/lib/i18n";

/**
 * Wrap app trong I18nextProvider. Vì react-i18next dùng detector phía
 * client (localStorage / navigator), provider chỉ active sau khi mount
 * để tránh hydration mismatch (server render với fallback language,
 * client có thể detect language khác).
 *
 * Khi cần render đúng ngôn ngữ ngay từ HTML server, chuyển sang lưu
 * language trong cookie và đọc trong loader của route.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  // Hydration gate: server render `ready=false` (children không bọc provider),
  // client mount xong set `true` để remount với I18nextProvider thực. Đây là
  // pattern SSR chuẩn — setState trong effect là CHỦ Ý, không phải lỗi.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setReady(true), []);

  if (!ready) return <>{children}</>;
  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
