import { faker } from "@faker-js/faker";

/**
 * TODO (sau khi Orval chạy lần đầu):
 *   Xoá `export type User` bên dưới và thay bằng:
 *     import type { User } from "~/api/model";
 *   Lý do: giữ single source of truth từ swagger BE.
 */

export type User = {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  role: "student" | "instructor" | "admin";
  createdAt: string;
};

export function createUser(overrides: Partial<User> = {}): User {
  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    fullName: faker.person.fullName(),
    avatarUrl: faker.image.avatar(),
    role: faker.helpers.arrayElement(["student", "instructor", "admin"]),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    ...overrides,
  };
}

export function createUserList(
  count = 10,
  overrides: Partial<User> = {},
): User[] {
  return Array.from({ length: count }, () => createUser(overrides));
}
