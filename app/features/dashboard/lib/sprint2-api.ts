import {
  deleteCareerTracksId,
  deleteCareerTracksIdJdsJdId,
  postCareerTracks,
  postCareerTracksIdJds,
  putCareerTracksId
} from '~/api/operations/career-tracks/career-tracks'
import { getJdSubmissions } from '~/api/operations/jd-submissions/jd-submissions'
import { getUsersMe } from '~/api/operations/users/users'
import { getSubscriptionMe } from '~/api/operations/subscription/subscription'
import type { AuthUser } from '~/shared/lib/auth-session'
import {
  getCareerTrackRuntime,
  getCareerTracksRuntime,
  getGapAnalysisRuntime,
  getRoadmapNodeResourcesRuntime,
  getRoadmapRuntime,
  getUserRoadmapsRuntime,
  patchRoadmapArchiveRuntime,
  patchRoadmapKeepRuntime,
  patchRoadmapNodeStatusRuntime,
  postGapAnalysisRuntime,
  postRoadmapRegenerateRuntime,
  postRoadmapRuntime
} from '~/shared/lib/sprint2-api-runtime'

export type LoadState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export type SubscriptionState = {
  tierCode: string
  displayName: string
  status: string
  expiresAt: string | null
} | null

export type DashboardStatsState = {
  certificates: string
  studyHours: string
  readiness: string
  classRank: string
}

export type JdRecentItem = {
  id: string
  jobTitle: string
  parseStatus: string
  createdAt?: string
}

export type GapAnalysisSkillStatus = 'missing' | 'upgrade' | 'have'

export type GapAnalysisSkillView = {
  id: string
  name: string
  icon: string
  status: GapAnalysisSkillStatus
  current: string
  required: string
  priorityScore: number
  hasPriority: boolean
  reason: string
  tags: string[]
}

export type GapAnalysisMetaView = {
  version: number
  completedAt: string | null
  scorePercent: number | null
  status: string
  jdId: string | null
  gapAnalysisId: string | null
}

export type RoadmapNodeView = {
  id: string
  title: string
  description?: string
  icon: string
  status: 'completed' | 'active' | 'future'
  orderIndex: number
  estimatedHours?: number
  level?: number
  prerequisiteNodeIds: string[]
}

export type RoadmapResourceView = {
  id: string
  title: string
  description: string
  url?: string
  type: string
  provider?: string
  isAffiliate: boolean
  isPrimary: boolean
  affiliateLabel?: string
  icon: string
  iconBg: string
  iconColor: string
}

export type RoadmapView = {
  id: string
  jdId?: string
  title: string
  progress: number
  status: string
  isOutdated: boolean
  nodes: RoadmapNodeView[]
  resources: RoadmapResourceView[]
}

export type CareerTrackView = {
  id: string
  name: string
  description?: string
  jdCount: number
  progress: number
  createdAt?: string
}

export type CareerTrackJdView = {
  id: string
  title: string
  roadmapStatus?: string
  roadmapProgress: number
  addedAt?: string
}

export type CareerTrackDetailView = CareerTrackView & {
  jds: CareerTrackJdView[]
}

function unwrapData<T>(response: unknown): T | null {
  const data = (response as { data?: unknown })?.data
  return (data ?? null) as T | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function toOptionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map((item) => toStringValue(item)).filter(Boolean) : []
}

function toAuthUser(data: Record<string, unknown>): AuthUser {
  const subscription = isObject(data.subscription)
    ? {
        tierCode: toStringValue(data.subscription.tierCode, 'free'),
        displayName: toStringValue(data.subscription.displayName, 'Free'),
        status: toStringValue(data.subscription.status, 'inactive'),
        expiresAt: typeof data.subscription.expiresAt === 'string' ? data.subscription.expiresAt : null
      }
    : null

  return {
    id: toStringValue(data.id, 'user-1'),
    email: toStringValue(data.email, 'user@example.com'),
    fullName: toStringValue(data.fullName || data.name, 'Demo User'),
    role: toStringValue(data.role, 'user') as AuthUser['role'],
    isSurveyCompleted: Boolean(data.isSurveyCompleted ?? true),
    portfolioUrlSlug: typeof data.portfolioUrlSlug === 'string' ? data.portfolioUrlSlug : undefined,
    subscription
  }
}

function getCollection(value: unknown): unknown[] {
  if (Array.isArray(value)) return value
  if (isObject(value) && Array.isArray(value.items)) return value.items
  if (isObject(value) && Array.isArray(value.results)) return value.results
  if (isObject(value) && Array.isArray(value.data)) return value.data
  return []
}

function normalizeGapStatus(value: unknown): GapAnalysisSkillStatus {
  const raw = toStringValue(value)
    .toLowerCase()
    .replace(/[_\s-]/g, '')
  if (raw === 'missing') return 'missing'
  if (raw === 'needsupgrade' || raw === 'upgrade' || raw === 'partial') return 'upgrade'
  return 'have'
}

function mapGapSkill(item: unknown, index: number): GapAnalysisSkillView {
  const raw = isObject(item) ? item : {}
  const status = normalizeGapStatus(raw.gapStatus ?? raw.status)
  const priorityScoreRaw = toNumberValue(raw.priorityScore ?? raw.urgencyScore ?? raw.urgency, 0)
  const tags = [
    typeof raw.isMandatoryInJd === 'boolean' && raw.isMandatoryInJd ? 'Mandatory in JD' : '',
    toStringValue(raw.currentLevel),
    toStringValue(raw.targetLevel),
    toStringValue(raw.category)
  ].filter(Boolean)

  return {
    id: toStringValue(raw.id, `gap-${index}`),
    name: toStringValue(raw.skillName ?? raw.skillNameRaw ?? raw.name, 'Unknown skill'),
    icon: status === 'missing' ? 'warning' : status === 'upgrade' ? 'trending_up' : 'check_circle',
    status,
    current: toStringValue(raw.currentLevel, status === 'missing' ? 'Not evidenced' : 'Unknown'),
    required: toStringValue(raw.targetLevel, 'Unknown'),
    priorityScore: priorityScoreRaw,
    hasPriority: priorityScoreRaw > 0,
    reason: toStringValue(raw.reasoning ?? raw.reason ?? raw.explanation, ''),
    tags
  }
}

function parseGapSkills(root: Record<string, unknown>): GapAnalysisSkillView[] {
  const directSkills = getCollection(root.skills)
  if (directSkills.length > 0) return directSkills.map(mapGapSkill)

  const grouped = [
    ...getCollection(root.missingSkills),
    ...getCollection(root.skillsToImprove),
    ...getCollection(root.existingSkills)
  ]

  return grouped.map(mapGapSkill)
}

function normalizeRoadmapNodeStatus(value: unknown): RoadmapNodeView['status'] {
  const raw = toStringValue(value).toLowerCase()
  if (raw === 'completed' || raw === 'done') return 'completed'
  if (raw === 'active' || raw === 'current' || raw === 'inprogress' || raw === 'in_progress') return 'active'
  return 'future'
}

function mapRoadmapNode(item: unknown, index: number): RoadmapNodeView {
  const raw = isObject(item) ? item : {}
  return {
    id: toStringValue(raw.id, `node-${index}`),
    title: toStringValue(raw.title ?? raw.name ?? raw.skillName, 'Roadmap node'),
    description: toStringValue(raw.description, '') || undefined,
    icon: toStringValue(raw.icon, 'task_alt'),
    status: normalizeRoadmapNodeStatus(raw.status),
    orderIndex: toNumberValue(raw.sequenceOrder ?? raw.orderIndex ?? raw.order, index),
    estimatedHours: toOptionalNumber(raw.estimatedHours ?? raw.durationHours),
    level: toOptionalNumber(raw.level),
    prerequisiteNodeIds: toStringArray(raw.prerequisiteNodeIds ?? raw.prerequisites)
  }
}

function mapRoadmapResource(item: unknown, index: number): RoadmapResourceView {
  const raw = isObject(item) ? item : {}
  const resourceType = toStringValue(raw.type, 'article').toLowerCase()
  const provider = toStringValue(raw.provider)
  const affiliateLabel = toStringValue(raw.affiliateLabel ?? raw.affiliateTag)
  const isAffiliate = Boolean(raw.isAffiliate ?? raw.sponsored ?? affiliateLabel)
  const isPrimary = Boolean(raw.isPrimary)

  let icon = 'description'
  let iconBg = 'bg-muted/10'
  let iconColor = 'text-foreground'

  if (resourceType.includes('video') || provider.toLowerCase().includes('youtube')) {
    icon = 'play_circle'
    iconBg = 'bg-destructive/10'
    iconColor = 'text-destructive'
  } else if (resourceType.includes('course') || provider.toLowerCase().includes('udemy')) {
    icon = 'school'
    iconBg = 'bg-primary/10'
    iconColor = 'text-primary'
  } else if (resourceType.includes('doc')) {
    icon = 'description'
    iconBg = 'bg-info/10'
    iconColor = 'text-info'
  }

  return {
    id: toStringValue(raw.id, `resource-${index}`),
    title: toStringValue(raw.title, 'Learning resource'),
    description: toStringValue(raw.description, ''),
    url: toStringValue(raw.url) || undefined,
    type: resourceType,
    provider: provider || undefined,
    isAffiliate,
    isPrimary,
    affiliateLabel: affiliateLabel || undefined,
    icon,
    iconBg,
    iconColor
  }
}

function mapRoadmapSummary(item: unknown, index: number): RoadmapView {
  const raw = isObject(item) ? item : {}
  return {
    id: toStringValue(raw.id, `roadmap-${index}`),
    jdId: toStringValue(raw.jdId) || undefined,
    title: toStringValue(raw.title ?? raw.name, 'Roadmap'),
    progress: toNumberValue(raw.progressPercent ?? raw.progress, 0),
    status: toStringValue(raw.status, 'active'),
    isOutdated: Boolean(raw.isOutdated),
    nodes: getCollection(raw.nodes)
      .map(mapRoadmapNode)
      .sort((a, b) => a.orderIndex - b.orderIndex),
    resources: []
  }
}

function mapCareerTrack(item: unknown, index: number): CareerTrackView {
  const raw = isObject(item) ? item : {}
  return {
    id: toStringValue(raw.id, `track-${index}`),
    name: toStringValue(raw.name, 'Career Track'),
    description: toStringValue(raw.description) || undefined,
    jdCount: toNumberValue(raw.jdCount ?? raw.jobDescriptionCount ?? raw.jobsCount, 0),
    progress: toNumberValue(raw.overallProgress ?? raw.progress ?? raw.progressPercent, 0),
    createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : undefined
  }
}

function mapCareerTrackJd(item: unknown, index: number): CareerTrackJdView {
  const raw = isObject(item) ? item : {}
  const id = toStringValue(raw.jdId ?? raw.id, `jd-${index}`)
  return {
    id,
    title: toStringValue(raw.jobTitle ?? raw.title, 'JD'),
    roadmapStatus: toStringValue(raw.roadmapStatus) || undefined,
    roadmapProgress: toNumberValue(raw.roadmapProgress ?? raw.progress ?? raw.progressPercent, 0),
    addedAt: typeof raw.addedAt === 'string' ? raw.addedAt : undefined
  }
}

function mapCareerTrackDetail(item: unknown, index: number): CareerTrackDetailView {
  const summary = mapCareerTrack(item, index)
  const raw = isObject(item) ? item : {}
  const jds = getCollection(raw.jds).map(mapCareerTrackJd)

  return {
    ...summary,
    jdCount: toNumberValue(raw.jdCount, jds.length || summary.jdCount),
    jds
  }
}

export async function loadCurrentUser(): Promise<AuthUser | null> {
  const res = await loadDashboardUser()
  return res.data
}

export async function loadDashboardUser(): Promise<LoadState<AuthUser>> {
  try {
    const res = await getUsersMe()
    const data = unwrapData<unknown>(res)
    if (!isObject(data)) return { data: null, loading: false, error: 'User not found' }

    return {
      data: toAuthUser(data),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load user' }
  }
}

export type QuotaUsageItem = {
  key: string
  used: number
  limit: number
  nearLimit: boolean
  unlimited: boolean
}

const QUOTA_KEYS = [
  'jd',
  'gapAnalysis',
  'assessment',
  'roadmapActive',
  'careerTrack',
  'portfolioCertificate',
  'portfolioProject'
] as const

export async function loadQuotaUsage(): Promise<LoadState<QuotaUsageItem[]>> {
  try {
    const res = await getSubscriptionMe()
    const data = unwrapData<unknown>(res)
    const usage = isObject(data) && isObject(data.usage) ? data.usage : {}

    const items = QUOTA_KEYS.map((key) => {
      const raw = isObject(usage[key]) ? usage[key] : {}
      const used = toNumberValue(raw.used, 0)
      const limit = toNumberValue(raw.limit, 0)
      const unlimited = limit < 0
      const nearLimit =
        typeof raw.nearLimit === 'boolean' ? raw.nearLimit : !unlimited && limit > 0 && used >= limit * (2 / 3)
      return { key, used, limit, nearLimit, unlimited }
    })

    return { data: items, loading: false, error: null }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load quota usage' }
  }
}

export async function loadDashboardStats(): Promise<LoadState<DashboardStatsState>> {
  try {
    return {
      data: {
        certificates: '12',
        studyHours: '146h',
        readiness: '82%',
        classRank: '#8'
      },
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load stats' }
  }
}

export async function loadSubscriptionState(): Promise<LoadState<SubscriptionState>> {
  try {
    const user = await getUsersMe()
    const data = unwrapData<unknown>(user)
    if (!isObject(data)) return { data: null, loading: false, error: null }
    const subscription = isObject(data.subscription) ? data.subscription : null

    return {
      data: subscription
        ? {
            tierCode: toStringValue(subscription.tierCode, 'free'),
            displayName: toStringValue(subscription.displayName, 'Free'),
            status: toStringValue(subscription.status, 'inactive'),
            expiresAt: typeof subscription.expiresAt === 'string' ? subscription.expiresAt : null
          }
        : null,
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load subscription' }
  }
}

export async function loadRecentJds(options?: { pageSize?: number }): Promise<LoadState<JdRecentItem[]>> {
  try {
    const res = await getJdSubmissions({ page: 1, pageSize: options?.pageSize ?? 10 })
    const rows = getCollection((res as { data?: unknown })?.data)

    return {
      data: rows
        .map((item) => (isObject(item) ? item : {}))
        .map((item, index) => ({
          id: toStringValue(item.id, `jd-${index}`),
          jobTitle: toStringValue(item.jobTitle, 'Untitled JD'),
          parseStatus: toStringValue(item.parseStatus, 'pending'),
          createdAt: typeof item.createdAt === 'string' ? item.createdAt : undefined
        }))
        .filter((item) => Boolean(item.id)),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load JDs' }
  }
}

export async function triggerGapAnalysis(jdId: string) {
  return postGapAnalysisRuntime({ jdId })
}

export async function loadGapAnalysis(
  jdId: string,
  options?: { all?: boolean }
): Promise<LoadState<{ meta: GapAnalysisMetaView; skills: GapAnalysisSkillView[] }>> {
  try {
    const res = await getGapAnalysisRuntime({ jdId, all: options?.all })
    const data = unwrapData<unknown>(res)
    const root = isObject(data) ? data : {}
    const skills = parseGapSkills(root)

    return {
      data: {
        meta: {
          version: toNumberValue(root.version, 1),
          completedAt: typeof root.completedAt === 'string' ? root.completedAt : null,
          scorePercent: typeof root.scorePercent === 'number' ? root.scorePercent : null,
          status: toStringValue(root.status, skills.length > 0 ? 'completed' : 'pending'),
          jdId: toStringValue(root.jdId) || jdId,
          gapAnalysisId: toStringValue(root.id) || null
        },
        skills
      },
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load gap analysis' }
  }
}

export async function loadDashboardRoadmaps(status?: string): Promise<LoadState<RoadmapView[]>> {
  return loadRoadmapOverview({ status })
}

export async function loadRoadmapOverview(filters?: {
  status?: string
  jdId?: string
}): Promise<LoadState<RoadmapView[]>> {
  try {
    const res = await getUserRoadmapsRuntime(filters)
    const data = unwrapData<unknown>(res)
    const items = getCollection(data)

    return {
      data: items.map(mapRoadmapSummary),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load roadmaps' }
  }
}

export async function loadRoadmapById(id: string): Promise<LoadState<RoadmapView>> {
  try {
    const res = await getRoadmapRuntime({ id })
    const data = unwrapData<unknown>(res)
    const raw = isObject(data) ? data : {}
    const nodes = getCollection(raw.nodes)
      .map(mapRoadmapNode)
      .sort((a, b) => a.orderIndex - b.orderIndex)

    return {
      data: {
        id: toStringValue(raw.id, id),
        jdId: toStringValue(raw.jdId) || undefined,
        title: toStringValue(raw.title ?? raw.name, 'Roadmap'),
        progress: toNumberValue(raw.progressPercent ?? raw.progress, 0),
        status: toStringValue(raw.status, 'active'),
        isOutdated: Boolean(raw.isOutdated),
        nodes,
        resources: []
      },
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load roadmap' }
  }
}

export async function triggerRoadmap(jdId: string) {
  return postRoadmapRuntime({ jdId })
}

export async function triggerRoadmapRegenerate(id: string) {
  return postRoadmapRegenerateRuntime({ id })
}

export async function triggerRoadmapArchive(id: string) {
  return patchRoadmapArchiveRuntime({ id })
}

export async function triggerRoadmapKeep(id: string) {
  return patchRoadmapKeepRuntime({ id })
}

export async function updateRoadmapNodeStatus(nodeId: string, status: 'completed' | 'active' | 'future') {
  return patchRoadmapNodeStatusRuntime({ nodeId, status })
}

export async function loadRoadmapResources(nodeId: string): Promise<LoadState<RoadmapResourceView[]>> {
  try {
    const res = await getRoadmapNodeResourcesRuntime({ nodeId })
    const data = unwrapData<unknown>(res)
    const items = getCollection(data)

    return {
      data: items.map(mapRoadmapResource),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load resources' }
  }
}

export async function loadCareerTracks(): Promise<LoadState<CareerTrackView[]>> {
  try {
    const res = await getCareerTracksRuntime()
    const data = unwrapData<unknown>(res)
    const items = getCollection(data)

    return {
      data: items.map(mapCareerTrack),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load career tracks' }
  }
}

export async function loadCareerTrackById(id: string): Promise<LoadState<CareerTrackDetailView>> {
  try {
    const res = await getCareerTrackRuntime({ id })
    const data = unwrapData<unknown>(res)
    if (!isObject(data)) return { data: null, loading: false, error: 'Career track not found' }
    return {
      data: mapCareerTrackDetail(data, 0),
      loading: false,
      error: null
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load career track' }
  }
}

export { deleteCareerTracksId, deleteCareerTracksIdJdsJdId, postCareerTracks, postCareerTracksIdJds, putCareerTracksId }
