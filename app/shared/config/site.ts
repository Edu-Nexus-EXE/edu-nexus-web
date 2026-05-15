/**
 * Hằng số cấp ứng dụng dùng chung. Thay đổi tên thương hiệu / link
 * mạng xã hội tại đây thay vì rải rác trong component.
 */

export const SITE = {
  name: "Edu Nexus",
  shortName: "EduNexus",
  description: "Modern learning platform for FPT EXE project",
  url: "https://edu-nexus.example.com",
  defaultLocale: "vi" as const,
} as const;

/** Các key dùng cho localStorage — gom 1 chỗ để tránh typo. */
export const STORAGE_KEYS = {
  theme: "edu-nexus-theme",
  language: "edu-nexus-lang",
} as const;
