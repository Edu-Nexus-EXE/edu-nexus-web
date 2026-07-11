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

export function getUserSkillProgress() {
  return customFetch<unknown>('/users/me/skill-progress', { method: 'GET' })
}

export function getAdminCareerReadinessKpi() {
  return customFetch<unknown>('/admin/dashboard/career-readiness', { method: 'GET' })
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
