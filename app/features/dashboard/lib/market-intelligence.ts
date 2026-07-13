import {
  getMarketJobDetail,
  getMarketJobs,
  getMarketRoleBaseline,
  getMarketSkillTrends,
  getUserReadiness,
  getUserReadinessHistory,
  getUserSkillProgress,
  type MarketJobDetail,
  type MarketJobListItem,
  type MarketRoleCategory
} from '~/shared/lib/market-intelligence-api'

import type { LoadState } from './sprint2-api'

export const MARKET_ROLE_OPTIONS: MarketRoleCategory[] = [
  'backend',
  'frontend',
  'data',
  'ai',
  'devops',
  'mobile',
  'qa',
  'business-analyst'
]

export type { MarketRoleCategory }

export type MarketTopSkillView = {
  skillName: string
  jobCount: number
  demandPercent: number
}

export type MarketBaselineView = {
  roleCategory: string
  totalJobs: number
  lastUpdatedAt: string | null
  topSkills: MarketTopSkillView[]
}

export type MarketSkillTrendView = {
  roleCategory: string
  skillName: string
  periodStart: string
  jobCount: number
  demandPercent: number
}

export type UserReadinessView = {
  score: number
  level: string
  totalGapSkills: number
  missingSkills: number
  needsUpgradeSkills: number
  haveSkills: number
  roadmapCompletionPercent: number
  marketAlignmentPercent: number
  prioritySkills: string[]
  calculatedAt: string | null
}

export type UserSkillProgressView = {
  skillName: string
  currentStatus: string
  urgencyScore: number
  isMandatory: boolean
  isInMarketTopSkills: boolean
}

export type UserReadinessSnapshotView = {
  score: number
  level: string
  totalGapSkills: number
  missingSkills: number
  needsUpgradeSkills: number
  haveSkills: number
  roadmapCompletionPercent: number
  marketAlignmentPercent: number
  calculatedAt: string
}

function unwrapData<T>(response: unknown): T | null {
  const data = (response as { data?: unknown })?.data
  return (data ?? null) as T | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function collection(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (isObject(value) && Array.isArray(value.data)) return value.data
  if (isObject(value) && Array.isArray(value.items)) return value.items
  return []
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toStringValue(item)).filter(Boolean) : []
}

function mapTopSkill(item: unknown): MarketTopSkillView {
  const raw = isObject(item) ? item : {}
  return {
    skillName: toStringValue(raw.skillName ?? raw.normalizedSkill ?? raw.name, 'Unknown skill'),
    jobCount: toNumberValue(raw.jobCount ?? raw.demandCount, 0),
    demandPercent: toNumberValue(raw.demandPercent ?? raw.percent, 0)
  }
}

function mapBaseline(data: unknown, fallbackRole: string): MarketBaselineView {
  const raw = isObject(data) ? data : {}
  return {
    roleCategory: toStringValue(raw.roleCategory, fallbackRole),
    totalJobs: toNumberValue(raw.totalJobs, 0),
    lastUpdatedAt: typeof raw.lastUpdatedAt === 'string' ? raw.lastUpdatedAt : null,
    topSkills: collection(raw.topSkills).map(mapTopSkill)
  }
}

function mapTrend(item: unknown, fallbackRole: string): MarketSkillTrendView {
  const raw = isObject(item) ? item : {}
  return {
    roleCategory: toStringValue(raw.roleCategory, fallbackRole),
    skillName: toStringValue(raw.skillName ?? raw.normalizedSkill ?? raw.name, 'Unknown skill'),
    periodStart: toStringValue(raw.periodStart ?? raw.month, ''),
    jobCount: toNumberValue(raw.jobCount ?? raw.demandCount, 0),
    demandPercent: toNumberValue(raw.demandPercent ?? raw.percent, 0)
  }
}

function mapReadiness(data: unknown): UserReadinessView {
  const raw = isObject(data) ? data : {}
  return {
    score: toNumberValue(raw.score, 0),
    level: toStringValue(raw.level, 'unknown'),
    totalGapSkills: toNumberValue(raw.totalGapSkills, 0),
    missingSkills: toNumberValue(raw.missingSkills, 0),
    needsUpgradeSkills: toNumberValue(raw.needsUpgradeSkills, 0),
    haveSkills: toNumberValue(raw.haveSkills, 0),
    roadmapCompletionPercent: toNumberValue(raw.roadmapCompletionPercent, 0),
    marketAlignmentPercent: toNumberValue(raw.marketAlignmentPercent, 0),
    prioritySkills: toStringArray(raw.prioritySkills),
    calculatedAt: typeof raw.calculatedAt === 'string' ? raw.calculatedAt : null
  }
}

function mapSkillProgress(item: unknown): UserSkillProgressView {
  const raw = isObject(item) ? item : {}
  return {
    skillName: toStringValue(raw.skillName ?? raw.name, 'Unknown skill'),
    currentStatus: toStringValue(raw.currentStatus ?? raw.status, 'unknown'),
    urgencyScore: toNumberValue(raw.urgencyScore ?? raw.priorityScore, 0),
    isMandatory: Boolean(raw.isMandatory),
    isInMarketTopSkills: Boolean(raw.isInMarketTopSkills)
  }
}

function mapReadinessSnapshot(item: unknown): UserReadinessSnapshotView {
  const raw = isObject(item) ? item : {}
  return {
    score: toNumberValue(raw.score, 0),
    level: toStringValue(raw.level, 'unknown'),
    totalGapSkills: toNumberValue(raw.totalGapSkills, 0),
    missingSkills: toNumberValue(raw.missingSkills, 0),
    needsUpgradeSkills: toNumberValue(raw.needsUpgradeSkills, 0),
    haveSkills: toNumberValue(raw.haveSkills, 0),
    roadmapCompletionPercent: toNumberValue(raw.roadmapCompletionPercent, 0),
    marketAlignmentPercent: toNumberValue(raw.marketAlignmentPercent, 0),
    calculatedAt: toStringValue(raw.calculatedAt, '')
  }
}

export async function loadMarketBaseline(roleCategory: string, limit = 15): Promise<LoadState<MarketBaselineView>> {
  try {
    const res = await getMarketRoleBaseline(roleCategory, limit)
    return { data: mapBaseline(unwrapData(res), roleCategory), loading: false, error: null }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load market baseline' }
  }
}

export async function loadMarketSkillTrends(params: {
  roleCategory?: string
  months?: number
  limit?: number
}): Promise<LoadState<MarketSkillTrendView[]>> {
  try {
    const res = await getMarketSkillTrends(params)
    const data = unwrapData<unknown>(res)
    return {
      data: collection(data).map((item) => mapTrend(item, params.roleCategory ?? 'all')),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load skill trends' }
  }
}

export async function loadUserReadiness(): Promise<LoadState<UserReadinessView>> {
  try {
    const res = await getUserReadiness()
    return { data: mapReadiness(unwrapData(res)), loading: false, error: null }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load readiness' }
  }
}

export async function loadUserSkillProgress(): Promise<LoadState<UserSkillProgressView[]>> {
  try {
    const res = await getUserSkillProgress()
    const data = unwrapData<unknown>(res)
    return { data: collection(data).map(mapSkillProgress), loading: false, error: null }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load skill progress' }
  }
}

export async function loadUserReadinessHistory(limit = 12): Promise<LoadState<UserReadinessSnapshotView[]>> {
  try {
    const res = await getUserReadinessHistory(limit)
    const data = unwrapData<unknown>(res)
    return { data: collection(data).map(mapReadinessSnapshot), loading: false, error: null }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load readiness history' }
  }
}

export type MarketJobListView = MarketJobListItem

export type MarketJobDetailView = MarketJobDetail

export type MarketJobPageView = {
  items: MarketJobListView[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

function mapJobListItem(item: unknown): MarketJobListView {
  const raw = isObject(item) ? item : {}
  return {
    id: toStringValue(raw.id),
    sourceSite: toStringValue(raw.sourceSite, 'unknown'),
    sourceUrl: typeof raw.sourceUrl === 'string' ? raw.sourceUrl : null,
    jobTitle: toStringValue(raw.jobTitle, 'Untitled job'),
    companyName: typeof raw.companyName === 'string' ? raw.companyName : null,
    location: typeof raw.location === 'string' ? raw.location : null,
    salaryText: typeof raw.salaryText === 'string' ? raw.salaryText : null,
    roleCategory: toStringValue(raw.roleCategory, 'unknown'),
    postedAt: typeof raw.postedAt === 'string' ? raw.postedAt : null,
    collectedAt: toStringValue(raw.collectedAt, ''),
    skills: toStringArray(raw.skills),
    rawContentPreview: toStringValue(raw.rawContentPreview ?? raw.preview ?? '', ''),
    originalContentQuality: typeof raw.originalContentQuality === 'string' ? raw.originalContentQuality : null,
    rawContentHash: typeof raw.rawContentHash === 'string' ? raw.rawContentHash : null,
    contentLength: typeof raw.contentLength === 'number' ? raw.contentLength : null
  }
}

function mapJobDetail(data: unknown): MarketJobDetailView | null {
  if (!isObject(data)) return null
  const base = mapJobListItem(data)
  return {
    ...base,
    rawContent: toStringValue(data.rawContent, ''),
    originalContent: toStringValue(data.originalContent ?? data.rawContent, ''),
    originalContentQuality: typeof data.originalContentQuality === 'string' ? data.originalContentQuality : null,
    parsedDescription: typeof data.parsedDescription === 'string' ? data.parsedDescription : null,
    parsedRequirements: typeof data.parsedRequirements === 'string' ? data.parsedRequirements : null,
    parsedResponsibilities: typeof data.parsedResponsibilities === 'string' ? data.parsedResponsibilities : null,
    parsedBenefits: typeof data.parsedBenefits === 'string' ? data.parsedBenefits : null,
    parsedCompanyOverview: typeof data.parsedCompanyOverview === 'string' ? data.parsedCompanyOverview : null,
    parsedSeniority: typeof data.parsedSeniority === 'string' ? data.parsedSeniority : null,
    parsedConfidence: typeof data.parsedConfidence === 'number' ? data.parsedConfidence : null
  }
}

function mapJobPage(data: unknown, fallbackPage: number, fallbackPageSize: number): MarketJobPageView {
  const raw = isObject(data) ? data : {}
  const nestedData = isObject(raw.data) ? raw.data : null
  const pagination = isObject(raw.pagination) ? raw.pagination : null
  const pageSource = nestedData ?? raw
  return {
    items: collection(raw.data ?? pageSource.items).map(mapJobListItem),
    page: toNumberValue(pageSource.page ?? pagination?.page, fallbackPage),
    pageSize: toNumberValue(pageSource.pageSize ?? pagination?.pageSize, fallbackPageSize),
    total: toNumberValue(pageSource.total ?? pagination?.total, 0),
    totalPages: toNumberValue(pageSource.totalPages ?? pagination?.totalPages, 0)
  }
}

export async function loadMarketJobs(params: {
  roleCategory?: string | null
  keyword?: string | null
  page?: number
  pageSize?: number
}): Promise<LoadState<MarketJobPageView>> {
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 10
  try {
    const res = await getMarketJobs(params)
    return {
      data: mapJobPage(res, page, pageSize),
      loading: false,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      loading: false,
      error: (error as Error).message || 'Failed to load market jobs'
    }
  }
}

export async function loadMarketJobDetail(id: string): Promise<LoadState<MarketJobDetailView>> {
  try {
    const res = await getMarketJobDetail(id)
    const data = unwrapData<unknown>(res)
    return {
      data: mapJobDetail(data),
      loading: false,
      error: null
    }
  } catch (error) {
    return {
      data: null,
      loading: false,
      error: (error as Error).message || 'Failed to load market job detail'
    }
  }
}
