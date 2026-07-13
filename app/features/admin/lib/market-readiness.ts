import {
  getAdminCareerReadinessKpi,
  getAdminMarketCrawlRunDetail,
  getAdminMarketCrawlRuns,
  getAdminMarketScheduler,
  getAdminMarketSources,
  getAdminUserReadinessHistory,
  postAdminMarketCrawl,
  postAdminMarketImport,
  type MarketCrawlItemEvidence,
  type MarketCrawlResult,
  type MarketCrawlerSource,
  type MarketCrawlerRequest,
  type MarketSchedulerSettings,
  type MarketJobImportRequest
} from '~/shared/lib/market-intelligence-api'

import {
  loadAdminMarketJobDetail as loadAdminMarketJobDetailData,
  loadAdminMarketJobs as loadAdminMarketJobsData,
  type AdminMarketJobDetailView,
  type AdminMarketJobListView
} from './admin-data'

export type { AdminMarketJobDetailView, AdminMarketJobListView }

export const loadAdminMarketJobs = loadAdminMarketJobsData
export const loadAdminMarketJobDetail = loadAdminMarketJobDetailData

import type { AdminListResult } from './admin-data'

export type AdminReadinessMajorView = {
  major: string
  studentCount: number
  averageReadinessScore: number
}

export type AdminMissingSkillView = {
  skillName: string
  missingCount: number
  needsUpgradeCount: number
}

export type AdminTargetRoleView = {
  roleCategory: string
  studentCount: number
  marketJobCount: number
}

export type AdminCareerReadinessKpiView = {
  totalStudents: number
  studentsWithReadinessSnapshot: number
  averageReadinessScore: number
  byMajor: AdminReadinessMajorView[]
  topMissingSkills: AdminMissingSkillView[]
  targetRoles: AdminTargetRoleView[]
}

export type AdminMarketOperationResult = {
  importedJobs: number
  importedSkills: number
  skippedDuplicates: number
  sourceMode: string
}

export type AdminMarketCrawlResultView = MarketCrawlResult

export type AdminMarketCrawlerSourceView = MarketCrawlerSource

export type AdminMarketCrawlRunDetailView = {
  run: MarketCrawlResult
  items: MarketCrawlItemEvidence[]
}

export type AdminReadinessSnapshotView = {
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

export type AdminMarketSchedulerSettingsView = MarketSchedulerSettings

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

function mapKpi(data: unknown): AdminCareerReadinessKpiView {
  const raw = isObject(data) ? data : {}
  return {
    totalStudents: toNumberValue(raw.totalStudents, 0),
    studentsWithReadinessSnapshot: toNumberValue(raw.studentsWithReadinessSnapshot, 0),
    averageReadinessScore: toNumberValue(raw.averageReadinessScore, 0),
    byMajor: collection(raw.byMajor).map((item) => {
      const entry = isObject(item) ? item : {}
      return {
        major: toStringValue(entry.major, 'Unknown'),
        studentCount: toNumberValue(entry.studentCount, 0),
        averageReadinessScore: toNumberValue(entry.averageReadinessScore, 0)
      }
    }),
    topMissingSkills: collection(raw.topMissingSkills).map((item) => {
      const entry = isObject(item) ? item : {}
      return {
        skillName: toStringValue(entry.skillName, 'Unknown skill'),
        missingCount: toNumberValue(entry.missingCount, 0),
        needsUpgradeCount: toNumberValue(entry.needsUpgradeCount, 0)
      }
    }),
    targetRoles: collection(raw.targetRoles).map((item) => {
      const entry = isObject(item) ? item : {}
      return {
        roleCategory: toStringValue(entry.roleCategory, 'unknown'),
        studentCount: toNumberValue(entry.studentCount, 0),
        marketJobCount: toNumberValue(entry.marketJobCount, 0)
      }
    })
  }
}

function mapOperationResult(data: unknown): AdminMarketOperationResult {
  const raw = isObject(data) ? data : {}
  return {
    importedJobs: toNumberValue(raw.importedJobs, 0),
    importedSkills: toNumberValue(raw.importedSkills, 0),
    skippedDuplicates: toNumberValue(raw.skippedDuplicates, 0),
    sourceMode: toStringValue(raw.sourceMode, 'unknown')
  }
}

function mapCrawlResult(data: unknown): AdminMarketCrawlResultView {
  const raw = isObject(data) ? data : {}
  return {
    runId: toStringValue(raw.runId, ''),
    sourceSite: toStringValue(raw.sourceSite, 'unknown'),
    status: toStringValue(raw.status, 'failed'),
    message: toStringValue(raw.message, ''),
    fetchedUrls: toNumberValue(raw.fetchedUrls, 0),
    parsedJobs: toNumberValue(raw.parsedJobs, 0),
    importedJobs: toNumberValue(raw.importedJobs, 0),
    importedSkills: toNumberValue(raw.importedSkills, 0),
    skippedDuplicates: toNumberValue(raw.skippedDuplicates, 0),
    startedAt: toStringValue(raw.startedAt, ''),
    finishedAt: toStringValue(raw.finishedAt, ''),
    requestedLocation: toStringValue(raw.requestedLocation, '') || null,
    searchPagesChecked: toNumberValue(raw.searchPagesChecked, 0),
    candidateUrlsDiscovered: toNumberValue(raw.candidateUrlsDiscovered, 0),
    detailPagesChecked: toNumberValue(raw.detailPagesChecked, 0),
    wrongRegionPages: toNumberValue(raw.wrongRegionPages, 0),
    rejectedPages: toNumberValue(raw.rejectedPages, 0)
  }
}

function mapSource(data: unknown): AdminMarketCrawlerSourceView {
  const raw = isObject(data) ? data : {}
  return {
    sourceSite: toStringValue(raw.sourceSite, 'unknown'),
    displayName: toStringValue(raw.displayName, 'Unknown'),
    isEnabled: raw.isEnabled === true,
    isDemoOnly: raw.isDemoOnly === true
  }
}

function mapCrawlItem(data: unknown): MarketCrawlItemEvidence {
  const raw = isObject(data) ? data : {}
  return {
    sourceUrl: toStringValue(raw.sourceUrl, ''),
    itemStatus: toStringValue(raw.itemStatus, 'unknown'),
    httpStatus: typeof raw.httpStatus === 'number' ? raw.httpStatus : null,
    jobTitle: toStringValue(raw.jobTitle, ''),
    rawContentHash: toStringValue(raw.rawContentHash, ''),
    message: toStringValue(raw.message, '')
  }
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toStringValue(item)).filter(Boolean) : []
}

function mapReadinessSnapshot(data: unknown): AdminReadinessSnapshotView {
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
    calculatedAt: toStringValue(raw.calculatedAt, '')
  }
}

function mapSchedulerSettings(data: unknown): AdminMarketSchedulerSettingsView {
  const raw = isObject(data) ? data : {}
  return {
    enabled: raw.enabled === true,
    cron: toStringValue(raw.cron, '0 */6 * * *'),
    timeZoneId: toStringValue(raw.timeZoneId, 'SE Asia Standard Time'),
    sources: toStringArray(raw.sources),
    roleCategories: toStringArray(raw.roleCategories),
    keywordTemplate: toStringValue(raw.keywordTemplate, '{role} developer'),
    limitPerSource: toNumberValue(raw.limitPerSource, 5),
    useDemoSources: raw.useDemoSources === true,
    maxRunsPerExecution: toNumberValue(raw.maxRunsPerExecution, 8)
  }
}

export async function loadAdminCareerReadinessKpi(): Promise<AdminCareerReadinessKpiView> {
  const res = await getAdminCareerReadinessKpi()
  return mapKpi(unwrapData(res))
}

export async function importAdminMarketJobs(payload: MarketJobImportRequest): Promise<AdminMarketOperationResult> {
  const res = await postAdminMarketImport(payload)
  return mapOperationResult(unwrapData(res))
}

export async function crawlAdminMarketJobs(payload: MarketCrawlerRequest): Promise<AdminMarketCrawlResultView> {
  const res = await postAdminMarketCrawl(payload)
  return mapCrawlResult(unwrapData(res))
}

export async function loadAdminMarketSources(): Promise<AdminMarketCrawlerSourceView[]> {
  const res = await getAdminMarketSources()
  return collection(unwrapData(res)).map(mapSource)
}

export async function loadAdminMarketCrawlRuns(sourceSite?: string): Promise<AdminMarketCrawlResultView[]> {
  const res = await getAdminMarketCrawlRuns({ sourceSite, limit: 10 })
  return collection(unwrapData(res)).map(mapCrawlResult)
}

export async function loadAdminMarketCrawlRunDetail(runId: string): Promise<AdminMarketCrawlRunDetailView | null> {
  const res = await getAdminMarketCrawlRunDetail(runId)
  const raw = unwrapData(res)
  if (!isObject(raw)) return null
  return {
    run: mapCrawlResult(raw.run),
    items: collection(raw.items).map(mapCrawlItem)
  }
}

export async function loadAdminUserReadinessHistory(userId: string, limit = 12): Promise<AdminReadinessSnapshotView[]> {
  const res = await getAdminUserReadinessHistory(userId, limit)
  return collection(unwrapData(res)).map(mapReadinessSnapshot)
}

export async function loadAdminMarketScheduler(): Promise<AdminMarketSchedulerSettingsView> {
  const res = await getAdminMarketScheduler()
  return mapSchedulerSettings(unwrapData(res))
}

export function makeListResult<T>(items: T[]): AdminListResult<T> {
  return { items, total: items.length, page: 1, pageSize: Math.max(items.length, 1) }
}
