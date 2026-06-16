import { faker } from '@faker-js/faker'

/**
 * Factory cho Course entity.
 *
 * Quy ước:
 *   - create<Entity>(overrides?)  → 1 object
 *   - create<Entity>List(n, overrides?) → mảng n objects
 *
 * TODO (sau khi Orval chạy lần đầu):
 *   Xoá `export type Course` bên dưới và thay bằng:
 *     import type { Course } from "~/api/model";
 *   Lý do: giữ single source of truth — types do BE/swagger định nghĩa,
 *   factory chỉ chịu trách nhiệm sinh data fake khớp với type đó.
 */

export type Course = {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  instructor: string
  price: number
  currency: string
  level: 'beginner' | 'intermediate' | 'advanced'
  durationHours: number
  enrolledCount: number
  rating: number
  createdAt: string
}

export function createCourse(overrides: Partial<Course> = {}): Course {
  return {
    id: faker.string.uuid(),
    title: faker.lorem.words({ min: 3, max: 7 }),
    description: faker.lorem.paragraph(),
    thumbnailUrl: faker.image.url({ width: 640, height: 360 }),
    instructor: faker.person.fullName(),
    price: faker.number.float({ min: 0, max: 500, fractionDigits: 2 }),
    currency: 'VND',
    level: faker.helpers.arrayElement(['beginner', 'intermediate', 'advanced']),
    durationHours: faker.number.int({ min: 1, max: 80 }),
    enrolledCount: faker.number.int({ min: 0, max: 10000 }),
    rating: faker.number.float({ min: 3, max: 5, fractionDigits: 1 }),
    createdAt: faker.date.past({ years: 2 }).toISOString(),
    ...overrides
  }
}

export function createCourseList(count = 10, overrides: Partial<Course> = {}): Course[] {
  return Array.from({ length: count }, () => createCourse(overrides))
}
