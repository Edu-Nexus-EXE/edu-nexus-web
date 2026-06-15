import { customFetch } from '~/api/mutator/custom-fetch'

/**
 * Calls GET /assessment-sessions/:sessionId to retrieve the session result.
 */
export function getAssessmentSessionResult({ sessionId }: { sessionId: string }, options?: RequestInit) {
  return customFetch<unknown>(`/assessment-sessions/${sessionId}`, {
    ...options,
    method: 'GET',
  })
}

/**
 * Calls GET /jd-submissions/:jdId/reusable-sessions to list reusable assessment sessions.
 * Note: The parameter is named jdId but maps to pathId in the URL for backward compatibility
 * with BE which currently accepts both /jd-submissions/:jdId/reusable-sessions
 * and /assessment-paths/:pathId/reusable-sessions.
 */
export function getReusableSessions({ jdId }: { jdId: string }, options?: RequestInit) {
  return customFetch<unknown>(`/jd-submissions/${jdId}/reusable-sessions`, {
    ...options,
    method: 'GET',
  })
}

export type AutoTriggered = {
  gapAnalysisId: string
  gapAnalysisStatus: string
}

type AutoTriggeredDto = {
  gapAnalysisId?: unknown
  gapAnalysisStatus?: unknown
}

export function parseAutoTriggered(input: unknown): AutoTriggered | null {
  if (!input || typeof input !== 'object') return null

  const dto = input as AutoTriggeredDto
  const gapAnalysisId = String(dto.gapAnalysisId ?? '')
  if (!gapAnalysisId) return null

  return {
    gapAnalysisId,
    gapAnalysisStatus: String(dto.gapAnalysisStatus ?? ''),
  }
}
