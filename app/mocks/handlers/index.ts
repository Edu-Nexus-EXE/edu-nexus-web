import type { RequestHandler } from "msw";

/**
 * Tổng hợp TẤT CẢ mock handlers.
 *
 * Cấu trúc:
 *   - mocks/handlers/           ← folder này (handler viết tay)
 *   │   ├── index.ts            ← barrel (file này)
 *   │   └── example.handler.ts  ← handler viết tay (placeholder trước khi có swagger)
 *   - api/operations/**\/*.msw.ts ← handler do `npm run orval` generate (KHÔNG viết tay)
 *
 * Khi Orval đã chạy được:
 *   1. Import generated handlers từ `~/api/operations/index.msw` vào đây.
 *   2. Xoá / comment handler viết tay tương ứng.
 */

// Handler viết tay (placeholder — xoá khi orval generate được)
import { exampleHandlers } from "./example.handler";

// Domain mocks used by dashboard routes
import { jdHandlers } from './jd.handler'

// Orval generated handlers
import {
  getAssessmentPathsMock,
  getAssessmentSessionsMock,
  getAuthMock,
  getCareerTracksMock,
  getCvSubmissionsMock,
  getGapAnalysisMock,
  getJdSubmissionsMock,
  getOnboardingMock,
  getRoadmapsMock,
  getUsersMock,
} from "~/api/operations/index.msw";

export const handlers: RequestHandler[] = [
  ...exampleHandlers,

  // Stateful mocks (to support polling UIs)
  ...jdHandlers,

  ...getAuthMock(),
  ...getUsersMock(),
  ...getOnboardingMock(),
  ...getJdSubmissionsMock(),
  ...getAssessmentPathsMock(),
  ...getCvSubmissionsMock(),
  ...getAssessmentSessionsMock(),
  ...getGapAnalysisMock(),
  ...getRoadmapsMock(),
  ...getCareerTracksMock(),
];
