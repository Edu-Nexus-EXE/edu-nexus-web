import { http, HttpResponse } from "msw";

import { env } from "~/shared/config/env";
import { createCourse, createCourseList } from "../factories/course.factory";
import { createUser } from "../factories/user.factory";

const BASE = env.API_URL || "";

/**
 * Handler mẫu — minh hoạ cách viết mock cho 1 feature.
 *
 * Quy ước đặt tên file: <feature>.handler.ts
 * Khi orval generate được handler thật → xoá file này và import handler của orval.
 */
export const exampleHandlers = [
  // GET /api/courses — danh sách khoá học
  http.get(`${BASE}/api/courses`, ({ request }) => {
    const url = new URL(request.url);
    const page = Number(url.searchParams.get("page") ?? 1);
    const limit = Number(url.searchParams.get("limit") ?? 10);

    return HttpResponse.json({
      items: createCourseList(limit),
      total: 50,
      page,
      limit,
    });
  }),

  // GET /api/courses/:id — chi tiết 1 khoá học
  http.get(`${BASE}/api/courses/:id`, ({ params }) => {
    return HttpResponse.json(createCourse({ id: params.id as string }));
  }),

  // GET /api/users/me — profile người dùng hiện tại
  http.get(`${BASE}/api/users/me`, () => {
    return HttpResponse.json(createUser());
  }),
];
