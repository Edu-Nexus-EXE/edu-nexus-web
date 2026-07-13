import { customFetch } from '~/api/mutator/custom-fetch'

export type MarketRoleCategory =
  | 'backend'
  | 'frontend'
  | 'data'
  | 'ai'
  | 'devops'
  | 'mobile'
  | 'qa'
  | 'business-analyst'

export type MarketJobImportItem = {
  sourceSite?: string | null
  sourceUrl: string
  jobTitle: string
  companyName?: string | null
  location?: string | null
  salaryText?: string | null
  roleCategory: string
  rawContent: string
  postedAt?: string | null
  skills: string[]
}

export type MarketJobImportRequest = {
  sourceSite: string
  jobs: MarketJobImportItem[]
}

export type MarketCrawlerRequest = {
  sourceSite: string
  roleCategory: string
  keyword?: string | null
  limit?: number | null
  location?: string | null
}

export type MarketCrawlerSource = {
  sourceSite: string
  displayName: string
  isEnabled: boolean
  isDemoOnly: boolean
}

export type MarketCrawlResult = {
  runId: string
  sourceSite: string
  status: 'running' | 'succeeded' | 'partial' | 'no_items' | 'blocked' | 'unsupported' | 'failed' | string
  message: string
  fetchedUrls: number
  parsedJobs: number
  importedJobs: number
  importedSkills: number
  skippedDuplicates: number
  startedAt: string
  finishedAt?: string | null
  requestedLocation?: string | null
  searchPagesChecked?: number
  candidateUrlsDiscovered?: number
  detailPagesChecked?: number
  wrongRegionPages?: number
  rejectedPages?: number
}

export type MarketCrawlItemEvidence = {
  sourceUrl?: string | null
  itemStatus: string
  httpStatus?: number | null
  jobTitle?: string | null
  rawContentHash?: string | null
  message?: string | null
}

export type MarketCrawlRunDetail = {
  run: MarketCrawlResult
  items: MarketCrawlItemEvidence[]
}

export type ReadinessSnapshot = {
  score: number
  level: string
  totalGapSkills: number
  missingSkills: number
  needsUpgradeSkills: number
  haveSkills: number
  roadmapCompletionPercent: number
  marketAlignmentPercent: number
  calculatedAt: string
  jdSubmissionId?: string | null
  gapAnalysisId?: string | null
  eventType?: string
  jobTitle?: string | null
  roleCategory?: string | null
}

export type MarketSchedulerSettings = {
  enabled: boolean
  cron: string
  timeZoneId: string
  sources: string[]
  roleCategories: string[]
  keywordTemplate: string
  limitPerSource: number
  useDemoSources: boolean
  maxRunsPerExecution: number
}

export function getMarketRoleBaseline(roleCategory: string, limit = 15) {
  return customFetch<unknown>(`/market/roles/${encodeURIComponent(roleCategory)}/baseline`, {
    method: 'GET',
    params: { limit }
  })
}

export function getMarketSkillTrends(params: { roleCategory?: string; months?: number; limit?: number }) {
  return customFetch<unknown>('/market/skills/trends', {
    method: 'GET',
    params: {
      roleCategory: params.roleCategory,
      months: params.months ?? 6,
      limit: params.limit ?? 20
    }
  })
}

export function getUserReadiness() {
  return customFetch<unknown>('/users/me/readiness', { method: 'GET' })
}

export function getUserReadinessHistory(limit = 12, jdId?: string | null) {
  return customFetch<unknown>('/users/me/readiness/history', {
    method: 'GET',
    params: { limit, jdId: jdId || undefined }
  })
}

export function getUserSkillProgress() {
  return customFetch<unknown>('/users/me/skill-progress', { method: 'GET' })
}

export function getAdminUserReadinessHistory(userId: string, limit = 12) {
  return customFetch<unknown>(`/admin/users/${encodeURIComponent(userId)}/readiness/history`, {
    method: 'GET',
    params: { limit }
  })
}

export function getAdminCareerReadinessKpi(major?: string | null) {
  return customFetch<unknown>('/admin/dashboard/career-readiness', {
    method: 'GET',
    params: { major: major || undefined }
  })
}

export function postAdminMarketImport(payload: MarketJobImportRequest) {
  return customFetch<unknown>('/admin/market/import', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export function postAdminMarketCrawl(payload: MarketCrawlerRequest) {
  return customFetch<unknown>('/admin/market/crawl', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })
}

export function getAdminMarketSources() {
  return customFetch<unknown>('/admin/market/sources', { method: 'GET' })
}

export function getAdminMarketScheduler() {
  return customFetch<unknown>('/admin/market/scheduler', { method: 'GET' })
}

export function getAdminMarketCrawlRuns(params: { sourceSite?: string; limit?: number }) {
  return customFetch<unknown>('/admin/market/crawl-runs', {
    method: 'GET',
    params: {
      sourceSite: params.sourceSite || undefined,
      limit: params.limit ?? 10
    }
  })
}

export function getAdminMarketCrawlRunDetail(runId: string) {
  return customFetch<unknown>(`/admin/market/crawl-runs/${encodeURIComponent(runId)}`, { method: 'GET' })
}

export type MarketJobListItem = {
  id: string
  sourceSite: string
  sourceUrl?: string | null
  jobTitle: string
  companyName?: string | null
  location?: string | null
  salaryText?: string | null
  roleCategory: string
  postedAt?: string | null
  collectedAt: string
  skills: string[]
  rawContentPreview: string
  originalContentQuality?: string | null
  rawContentHash?: string | null
  contentLength?: number | null
}

export type MarketJobDetail = MarketJobListItem & {
  rawContent: string
  originalContent?: string | null
  originalContentQuality?: string | null
  parsedDescription?: string | null
  parsedRequirements?: string | null
  parsedResponsibilities?: string | null
  parsedBenefits?: string | null
  parsedCompanyOverview?: string | null
  parsedSeniority?: string | null
  parsedConfidence?: number | null
}

export type MarketJobPage = {
  items: MarketJobListItem[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export function getMarketJobs(params: {
  roleCategory?: string | null
  keyword?: string | null
  page?: number
  pageSize?: number
}) {
  return customFetch<unknown>('/market/jobs', {
    method: 'GET',
    params: {
      roleCategory: params.roleCategory || undefined,
      keyword: params.keyword || undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10
    }
  })
}

export function getMarketJobDetail(id: string) {
  return customFetch<unknown>(`/market/jobs/${encodeURIComponent(id)}`, { method: 'GET' })
}

export function getAdminMarketJobs(params: {
  roleCategory?: string | null
  keyword?: string | null
  page?: number
  pageSize?: number
}) {
  return customFetch<unknown>('/admin/market/jobs', {
    method: 'GET',
    params: {
      roleCategory: params.roleCategory || undefined,
      keyword: params.keyword || undefined,
      page: params.page ?? 1,
      pageSize: params.pageSize ?? 10
    }
  })
}

export function getAdminMarketJobDetail(id: string) {
  return customFetch<unknown>(`/admin/market/jobs/${encodeURIComponent(id)}`, { method: 'GET' })
}
