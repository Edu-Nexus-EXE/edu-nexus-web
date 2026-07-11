import {
  deleteAdminRagDocumentsId,
  postAdminRagDocuments
} from '~/api/operations/admin-rag-documents/admin-rag-documents'
import { getAdminDashboardStats } from '~/api/operations/admin-payments/admin-payments'
import { getAdminJdSubmissions, postAdminJdSubmissionsIdReParse } from '~/api/operations/admin-jds/admin-jds'
import { getAdminPaymentOrders } from '~/api/operations/admin-payments/admin-payments'
import { getAdminRagDocuments } from '~/api/operations/admin-rag-documents/admin-rag-documents'
import type { AdminResourceUpsertRequest, CreateSkillRequest, UpdateSkillRequest } from '~/api/model'
import {
  deleteAdminResourcesId,
  getAdminResources,
  getAdminResourcesPendingReview,
  patchAdminResourcesIdReview,
  postAdminResources,
  postAdminResourcesIdReject,
  putAdminResourcesId
} from '~/api/operations/admin-resources/admin-resources'
import {
  deleteAdminSkillsIdPrerequisitesPrereqId,
  getAdminSkills,
  getAdminSkillsPendingReview,
  patchAdminSkillsIdActive,
  postAdminSkills,
  postAdminSkillsIdApprove,
  postAdminSkillsIdPrerequisites,
  postAdminSkillsOldIdMergeToNewId,
  putAdminSkillsId
} from '~/api/operations/admin-skills/admin-skills'
import {
  getAdminUsers,
  getAdminUsersId,
  patchAdminUsersIdBan,
  postAdminUsersIdActivateSubscription,
  postAdminUsersIdRevokeSubscription
} from '~/api/operations/admin-users/admin-users'

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
  return typeof value === 'number' ? value : fallback
}

function parseItems(data: unknown): unknown[] {
  if (Array.isArray(data)) return data
  // Handle BE's double-wrap: {data: [...], pagination: {...}}
  if (isObject(data)) {
    const d = data as { data?: unknown }
    if (Array.isArray(d.data)) return d.data
    if (Array.isArray((data as { items?: unknown[] })?.items)) return (data as { items: unknown[] }).items
  }
  return []
}

function parseTotal(data: unknown, fallback: number): number {
  if (!isObject(data)) return fallback
  const pagination = isObject(data.pagination) ? data.pagination : null
  return toNumberValue(
    data.total ??
      data.totalItems ??
      data.total_items ??
      pagination?.totalItems ??
      pagination?.total_items ??
      pagination?.total,
    fallback
  )
}

export type AdminListResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type AdminDashboardStatsView = {
  totalUsers: number
  usersByTier: Record<string, number>
  totalJdSubmitted: number
  revenue: number
  monthlyRevenue: number
  revenueByProvider: Record<string, number>
  aiCost: number
  monthlyAiCost: number
  aiCostByPipeline: Record<string, number>
  activeSubscriptions: number
  affiliateClicks: number
  affiliateConversions: number
  affiliateRevenue: number
}

export type AdminUserRowView = {
  id: string
  name: string
  email: string
  role: string
  plan: string
  jdCount: number
  createdAt: string
  status: string
}

export type AdminReviewRowView = {
  id: string
  title: string
  subtitle: string
  type: string
  status: string
  url?: string
}

export type AdminResourceRowView = AdminReviewRowView & {
  provider: string
  description?: string
  isFree: boolean
  accessType: string
  affiliateLabel?: string
  affiliateCommissionRate?: number
  language: string
  durationMinutes?: number
  needsAdminReview: boolean
  isActive: boolean
  createdAt?: string
  skillMappings: Array<{
    skillId: string
    isPrimary: boolean
    sequenceOrder: number | null
  }>
}

export type AdminSkillRowView = AdminReviewRowView & {
  major?: string
  description?: string
  slug?: string
  difficultyLevel?: number
  isActive?: boolean
  createdAt?: string
  roadmapUsage?: number
  jdUsage?: number
  resourceCount?: number
  prerequisites?: Array<{ id: string; name: string }>
}

export type AdminUserDetailView = {
  id: string
  name: string
  email: string
  avatarUrl: string
  createdDate: string
  lastLogin: string
  isBanned: boolean
  plan: string
  subscriptionStatus: string
  startDate: string
  endDate: string
  autoRenew: boolean
  usage: {
    jds: { current: number; max: string; percent: number }
    roadmaps: { current: number; max: string; percent: number }
    assessments: { current: number; max: string; percent: number }
  }
  payments: Array<{
    date: string
    amount: string
    provider: string
    code: string
    status: string
  }>
}

export type AdminPaymentOrderView = {
  id: string
  user: string
  amount: number
  provider: string
  status: string
  createdAt: string
}

export type AdminJdFailedView = {
  id: string
  title: string
  submittedBy: string
  errorReason: string
  submittedAt: string
  status: string
}

export type AdminRagDocumentView = {
  id: string
  title: string
  sourceType: string
  chunks: number
  status: string
  uploadedAt: string
}

export const ADMIN_RAG_UPDATED_EVENT = 'admin-rag-updated'

export function emitAdminRagUpdated() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(ADMIN_RAG_UPDATED_EVENT))
  }
}

export async function loadAdminDashboardStats(): Promise<AdminDashboardStatsView> {
  try {
    const res = await getAdminDashboardStats()
    const data = unwrapData<unknown>(res)

    // Manually calculate revenue to fix backend bug (includes cancelled/pending orders)
    const ordersRes = await getAdminPaymentOrders({ page: 1, pageSize: 1000 }).catch(() => null)
    let calculatedRevenue = 0
    let calculatedMonthly = 0
    const calculatedProvider: Record<string, number> = {}

    if (ordersRes) {
      const ordersData = unwrapData<unknown>(ordersRes)
      const items = parseItems(ordersData)
      const now = new Date()
      items.forEach((item) => {
        const raw = isObject(item) ? item : {}
        const status = toStringValue(raw.status, '').toLowerCase()
        if (status === 'completed') {
          const amount = toNumberValue(raw.amount, 0)
          calculatedRevenue += amount
          const createdAt = new Date(toStringValue(raw.createdAt, ''))
          if (
            !Number.isNaN(createdAt.getTime()) &&
            createdAt.getMonth() === now.getMonth() &&
            createdAt.getFullYear() === now.getFullYear()
          ) {
            calculatedMonthly += amount
          }
          const provider = toStringValue(raw.provider, 'Trực tuyến')
          calculatedProvider[provider] = (calculatedProvider[provider] || 0) + amount
        }
      })
    }

    const root = isObject(data) ? data : {}
    const subscriptionRevenue = isObject(root.subscriptionRevenue) ? root.subscriptionRevenue : null
    const affiliateStats = isObject(root.affiliateStats) ? root.affiliateStats : null
    const usersByTier = isObject(root.usersByTier) ? root.usersByTier : {}
    const totalAiCost = isObject(root.totalAiCost) ? root.totalAiCost : null
    const byProvider = isObject(subscriptionRevenue?.byProvider) ? subscriptionRevenue.byProvider : {}
    const byPipeline = isObject(totalAiCost?.byPipeline) ? totalAiCost.byPipeline : {}
    const studentCount = toNumberValue(usersByTier.student, 0)
    return {
      totalUsers: toNumberValue(root.totalUsers, 0),
      usersByTier: Object.fromEntries(
        Object.entries(usersByTier).map(([key, value]) => [key, toNumberValue(value, 0)])
      ),
      totalJdSubmitted: toNumberValue(root.totalJdSubmitted, 0),
      revenue: ordersRes ? calculatedRevenue : toNumberValue(root.totalRevenue ?? subscriptionRevenue?.allTime, 0),
      monthlyRevenue: ordersRes ? calculatedMonthly : toNumberValue(subscriptionRevenue?.currentMonth, 0),
      revenueByProvider: ordersRes
        ? calculatedProvider
        : Object.fromEntries(Object.entries(byProvider).map(([key, value]) => [key, toNumberValue(value, 0)])),
      aiCost: toNumberValue(totalAiCost?.allTime ?? root.totalAiCost ?? root.aiCostEstimate, 0),
      monthlyAiCost: toNumberValue(totalAiCost?.currentMonth, 0),
      aiCostByPipeline: Object.fromEntries(
        Object.entries(byPipeline).map(([key, value]) => [key, toNumberValue(value, 0)])
      ),
      activeSubscriptions: studentCount,
      affiliateClicks: toNumberValue(affiliateStats?.totalClicks, 0),
      affiliateConversions: toNumberValue(affiliateStats?.totalConversions, 0),
      affiliateRevenue: toNumberValue(affiliateStats?.estimatedRevenue, 0)
    }
  } catch {
    return {
      totalUsers: 0,
      usersByTier: {},
      totalJdSubmitted: 0,
      revenue: 0,
      monthlyRevenue: 0,
      revenueByProvider: {},
      aiCost: 0,
      monthlyAiCost: 0,
      aiCostByPipeline: {},
      activeSubscriptions: 0,
      affiliateClicks: 0,
      affiliateConversions: 0,
      affiliateRevenue: 0
    }
  }
}

export async function loadAdminUsersList(params?: {
  search?: string
  tier?: string
  isBanned?: boolean
  page?: number
  pageSize?: number
}): Promise<AdminListResult<AdminUserRowView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminUsers({
      search: params?.search,
      tier: params?.tier,
      isBanned: params?.isBanned,
      page,
      pageSize
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        const subscription = isObject(raw.subscription) ? raw.subscription : null
        const tierCode = toStringValue(
          raw.tierCode ?? raw.tier_code ?? subscription?.tierCode ?? subscription?.tier_code,
          ''
        )
        const tierDisplayName = toStringValue(
          raw.tierDisplayName ??
            raw.subscriptionTierDisplayName ??
            raw.subscriptionDisplayName ??
            raw.displayName ??
            subscription?.displayName ??
            subscription?.display_name,
          ''
        )
        const plan = tierDisplayName || (tierCode ? tierCode.charAt(0).toUpperCase() + tierCode.slice(1) : 'Free')
        return {
          id: toStringValue(raw.id, `user-${index + 1}`),
          name: toStringValue(raw.fullName || raw.name, 'User'),
          email: toStringValue(raw.email, `user${index + 1}@example.com`),
          role: toStringValue(raw.role, 'user'),
          plan,
          jdCount: toNumberValue(raw.jdCount, 0),
          createdAt: toStringValue(raw.createdAt, new Date().toISOString()),
          status:
            (raw.isBanned ?? raw.is_banned)
              ? 'banned'
              : toStringValue(raw.status || raw.accountStatus || raw.subscriptionStatus, 'active')
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function loadAdminResourcesQueue(params?: {
  page?: number
  pageSize?: number
}): Promise<AdminListResult<AdminReviewRowView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminResourcesPendingReview({ page, pageSize })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `resource-${index + 1}`),
          title: toStringValue(raw.title, 'Resource'),
          subtitle: toStringValue(raw.skillTag || raw.provider, 'Unknown provider'),
          type: toStringValue(raw.type, 'document'),
          status: toStringValue(raw.status, 'pending'),
          url: typeof raw.url === 'string' ? raw.url : undefined
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

function mapAdminResource(item: unknown, index: number): AdminResourceRowView {
  const raw = isObject(item) ? item : {}
  const skillMappingsRaw = Array.isArray(raw.skillMappings)
    ? raw.skillMappings
    : Array.isArray(raw.skills)
      ? raw.skills
      : Array.isArray(raw.skillResources)
        ? raw.skillResources
        : []
  const provider = toStringValue(raw.provider, 'Unknown provider')
  const needsAdminReview = Boolean(raw.needsAdminReview ?? raw.needs_admin_review)
  const isActive = raw.isActive ?? raw.is_active

  return {
    id: toStringValue(raw.id, `resource-${index + 1}`),
    title: toStringValue(raw.title, 'Resource'),
    subtitle: provider,
    type: toStringValue(raw.type, 'document'),
    status: needsAdminReview ? 'pending' : (isActive ?? true) ? 'approved' : 'inactive',
    url: typeof raw.url === 'string' ? raw.url : undefined,
    provider,
    description: toStringValue(raw.description, ''),
    isFree: Boolean(raw.isFree ?? raw.is_free ?? raw.accessType === 'free'),
    accessType: toStringValue(raw.accessType ?? raw.access_type, 'free'),
    affiliateLabel:
      typeof raw.affiliateLabel === 'string'
        ? raw.affiliateLabel
        : typeof raw.affiliate_label === 'string'
          ? raw.affiliate_label
          : undefined,
    affiliateCommissionRate:
      typeof raw.affiliateCommissionRate === 'number'
        ? raw.affiliateCommissionRate
        : typeof raw.affiliate_commission_rate === 'number'
          ? raw.affiliate_commission_rate
          : undefined,
    language: toStringValue(raw.language, 'vi'),
    durationMinutes:
      typeof raw.durationMinutes === 'number'
        ? raw.durationMinutes
        : typeof raw.duration_minutes === 'number'
          ? raw.duration_minutes
          : undefined,
    needsAdminReview,
    isActive: Boolean(isActive ?? true),
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : undefined,
    skillMappings: skillMappingsRaw
      .map((entry, entryIndex) => {
        const skill = isObject(entry) ? entry : {}
        const skillId = toStringValue(skill.skillId ?? skill.id, '')
        return {
          skillId,
          isPrimary: Boolean(skill.isPrimary ?? entryIndex === 0),
          sequenceOrder:
            typeof skill.sequenceOrder === 'number'
              ? skill.sequenceOrder
              : typeof skill.sequence_order === 'number'
                ? skill.sequence_order
                : entryIndex + 1
        }
      })
      .filter((entry) => Boolean(entry.skillId))
  }
}

export async function loadAdminResourcesList(params?: {
  page?: number
  pageSize?: number
  search?: string
  type?: string
  needsReview?: boolean
  isActive?: boolean
}): Promise<AdminListResult<AdminResourceRowView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminResources({
      page,
      pageSize,
      search: params?.search,
      type: params?.type,
      needsReview: params?.needsReview,
      isActive: params?.isActive
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map(mapAdminResource),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function createAdminResource(payload: AdminResourceUpsertRequest) {
  return postAdminResources(payload)
}

export async function updateAdminResource(id: string, payload: AdminResourceUpsertRequest) {
  return putAdminResourcesId({ id }, payload)
}

export async function deleteAdminResource(id: string) {
  return deleteAdminResourcesId({ id })
}

export async function approveAdminResource(id: string) {
  return patchAdminResourcesIdReview({ id }, { needsAdminReview: false })
}

export async function rejectAdminResource(id: string) {
  return postAdminResourcesIdReject({ id })
}

export async function disableAdminResource(row: AdminResourceRowView) {
  const payload: AdminResourceUpsertRequest = {
    title: row.title,
    type: row.type,
    provider: row.provider,
    url: row.url ?? '',
    description: row.description ?? null,
    isFree: row.isFree,
    accessType: row.accessType,
    affiliateLabel: row.affiliateLabel ?? null,
    affiliateCommissionRate: row.affiliateCommissionRate ?? null,
    language: row.language,
    durationMinutes: row.durationMinutes ?? null,
    needsAdminReview: false,
    isActive: false,
    skillMappings: row.skillMappings.map((item) => ({
      skillId: item.skillId,
      isPrimary: item.isPrimary,
      sequenceOrder: item.sequenceOrder ?? 1
    }))
  }
  return putAdminResourcesId({ id: row.id }, payload)
}

export async function restoreAdminResource(row: AdminResourceRowView) {
  const payload: AdminResourceUpsertRequest = {
    title: row.title,
    type: row.type,
    provider: row.provider,
    url: row.url ?? '',
    description: row.description ?? null,
    isFree: row.isFree,
    accessType: row.accessType,
    affiliateLabel: row.affiliateLabel ?? null,
    affiliateCommissionRate: row.affiliateCommissionRate ?? null,
    language: row.language,
    durationMinutes: row.durationMinutes ?? null,
    needsAdminReview: row.needsAdminReview,
    isActive: true,
    skillMappings: row.skillMappings.map((item) => ({
      skillId: item.skillId,
      isPrimary: item.isPrimary,
      sequenceOrder: item.sequenceOrder ?? 1
    }))
  }
  return putAdminResourcesId({ id: row.id }, payload)
}

export async function loadAdminSkillsQueue(params?: {
  search?: string
  major?: string
  page?: number
  pageSize?: number
}): Promise<AdminListResult<AdminSkillRowView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminSkillsPendingReview({
      search: params?.search,
      major: params?.major,
      page,
      pageSize
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => ({ ...mapAdminSkill(item, index), status: 'pending' })),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

function mapAdminSkill(item: unknown, index: number): AdminSkillRowView {
  const raw = isObject(item) ? item : {}
  const prerequisitesRaw = Array.isArray(raw.prerequisites)
    ? raw.prerequisites
    : Array.isArray(raw.prerequisiteSkills)
      ? raw.prerequisiteSkills
      : []
  const description = toStringValue(raw.description, '')
  const isActive = Boolean(raw.isActive ?? raw.is_active ?? true)
  const pending = description.startsWith('[AI-GENERATED]')

  return {
    id: toStringValue(raw.id, `skill-${index + 1}`),
    title: toStringValue(raw.name, 'Skill'),
    subtitle: toStringValue(raw.category, 'Unknown category'),
    type: 'skill',
    status: pending ? 'pending' : isActive ? 'active' : 'inactive',
    major: toStringValue(raw.major, ''),
    description,
    slug: toStringValue(raw.slug, ''),
    difficultyLevel: toNumberValue(raw.difficultyLevel ?? raw.difficulty_level, 1),
    isActive,
    createdAt:
      typeof raw.createdAt === 'string'
        ? raw.createdAt
        : typeof raw.created_at === 'string'
          ? raw.created_at
          : undefined,
    roadmapUsage: toNumberValue(raw.roadmapUsage ?? raw.roadmap_usage, 0),
    jdUsage: toNumberValue(raw.jdUsage ?? raw.jd_usage, 0),
    resourceCount: toNumberValue(raw.resourceCount ?? raw.resource_count, 0),
    prerequisites: prerequisitesRaw
      .map((entry, entryIndex) => {
        const skill = isObject(entry) ? entry : {}
        const id = toStringValue(skill.id ?? skill.skillId ?? skill.prerequisiteSkillId, '')
        return { id, name: toStringValue(skill.name ?? skill.skillName, `Skill ${entryIndex + 1}`) }
      })
      .filter((entry) => Boolean(entry.id))
  }
}

export async function loadAdminSkillsList(params?: {
  search?: string
  major?: string
  category?: string
  isActive?: boolean
  page?: number
  pageSize?: number
}): Promise<AdminListResult<AdminSkillRowView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminSkills({
      search: params?.search,
      major: params?.major,
      category: params?.category,
      isActive: params?.isActive,
      page,
      pageSize
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map(mapAdminSkill),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function createAdminSkill(payload: CreateSkillRequest) {
  return postAdminSkills(payload)
}

export async function approveAdminSkill(id: string, payload?: Partial<AdminSkillRowView>) {
  return postAdminSkillsIdApprove(
    { id },
    {
      name: payload?.title ?? null,
      category: payload?.subtitle ?? null,
      major: payload?.major ?? null,
      difficultyLevel: payload?.difficultyLevel ?? null,
      description: payload?.description?.replace(/^\[AI-GENERATED\]\s*/i, '') ?? null
    }
  )
}

export async function updateAdminSkill(id: string, payload: UpdateSkillRequest) {
  return putAdminSkillsId({ id }, payload)
}

export async function setAdminSkillActive(id: string, isActive: boolean) {
  return patchAdminSkillsIdActive({ id }, { isActive })
}

export async function rejectAdminSkill(id: string) {
  return setAdminSkillActive(id, false)
}

export async function addAdminSkillPrerequisite(id: string, prerequisiteSkillId: string) {
  return postAdminSkillsIdPrerequisites({ id }, { prerequisiteSkillId })
}

export async function deleteAdminSkillPrerequisite(id: string, prereqId: string) {
  return deleteAdminSkillsIdPrerequisitesPrereqId({ id, prereqId })
}

export async function mergeAdminSkill(oldId: string, newId: string, reason?: string) {
  return postAdminSkillsOldIdMergeToNewId({ oldId, newId }, { reason: reason || null })
}

export async function loadAdminUserDetail(id: string): Promise<AdminUserDetailView | null> {
  try {
    const res = await getAdminUsersId({ id })
    const data = unwrapData<unknown>(res)
    const raw = isObject(data) ? data : null
    if (!raw) return null

    const subscription = isObject(raw.subscription) ? raw.subscription : null
    const usage = isObject(raw.usage) ? raw.usage : null
    const paymentHistory = Array.isArray(raw.paymentHistory) ? raw.paymentHistory : []

    function mapUsageEntry(value: unknown) {
      const entry = isObject(value) ? value : {}
      const current = toNumberValue(entry.current, 0)
      const limitRaw = entry.limit
      const limit = typeof limitRaw === 'number' ? limitRaw : typeof limitRaw === 'string' ? limitRaw : 'unlimited'
      const percent =
        typeof limit === 'number' && limit > 0
          ? Math.min(100, Math.round((current / limit) * 100))
          : toNumberValue(entry.percent, 0)
      return {
        current,
        max: String(limit),
        percent
      }
    }

    return {
      id: toStringValue(raw.id, id),
      name: toStringValue(raw.fullName || raw.name, 'User'),
      email: toStringValue(raw.email, 'user@example.com'),
      avatarUrl: toStringValue(raw.avatarUrl, 'https://placehold.co/160x160?text=User'),
      createdDate: toStringValue(raw.createdAt, new Date().toISOString()),
      lastLogin: toStringValue(raw.lastLoginAt || raw.lastLogin, '—'),
      isBanned: Boolean(raw.isBanned ?? toStringValue(raw.status || raw.accountStatus).toLowerCase() === 'banned'),
      plan: toStringValue(subscription?.displayName || subscription?.tierName || raw.plan, 'Free'),
      subscriptionStatus: toStringValue(subscription?.status, 'active'),
      startDate: toStringValue(subscription?.startDate || subscription?.startedAt, '—'),
      endDate: toStringValue(subscription?.expiresAt || subscription?.endDate, '—'),
      autoRenew: Boolean(subscription?.autoRenew),
      usage: {
        jds: mapUsageEntry(usage?.jds),
        roadmaps: mapUsageEntry(usage?.roadmaps),
        assessments: mapUsageEntry(usage?.assessments)
      },
      payments: paymentHistory.map((item, index) => {
        const payment = isObject(item) ? item : {}
        return {
          date: toStringValue(payment.createdAt || payment.date, new Date().toISOString()),
          amount:
            typeof payment.amount === 'number'
              ? `${payment.amount.toLocaleString('vi-VN')} VND`
              : toStringValue(payment.amount, '0 VND'),
          provider: toStringValue(payment.provider || payment.method, 'Trực tuyến'),
          code: toStringValue(payment.code || payment.transactionId, `payment-${index + 1}`),
          status: toStringValue(payment.status, 'success')
        }
      })
    }
  } catch {
    return null
  }
}

export async function setAdminUserBan(id: string, isBanned: boolean) {
  return patchAdminUsersIdBan({ id }, { isBanned })
}

export async function activateAdminUserSubscription(id: string, durationMonths = 1) {
  return postAdminUsersIdActivateSubscription({ id }, { durationMonths })
}

export async function revokeAdminUserSubscription(id: string) {
  return postAdminUsersIdRevokeSubscription({ id })
}

export async function loadAdminPaymentOrders(): Promise<AdminPaymentOrderView[]> {
  try {
    const res = await getAdminPaymentOrders({ page: 1, pageSize: 1000 })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return items.map((item, index) => {
      const raw = isObject(item) ? item : {}
      return {
        id: toStringValue(raw.id, `order-${index + 1}`),
        user: toStringValue(raw.userEmail || raw.user, 'Unknown user'),
        amount: toNumberValue(raw.amount, 0),
        provider: toStringValue(raw.provider, 'Trực tuyến'),
        status: toStringValue(raw.status, 'pending'),
        createdAt: toStringValue(raw.createdAt, new Date().toISOString())
      }
    })
  } catch {
    return []
  }
}

export async function loadAdminJdFailed(params?: {
  parseStatus?: string
  page?: number
  pageSize?: number
}): Promise<AdminListResult<AdminJdFailedView>> {
  const page = params?.page ?? 1
  const pageSize = params?.pageSize ?? 10
  try {
    const res = await getAdminJdSubmissions({ page, pageSize, parseStatus: params?.parseStatus ?? 'failed' })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `jd-${index + 1}`),
          title: toStringValue(raw.jobTitle || raw.title, 'Untitled JD'),
          submittedBy: toStringValue(raw.submittedBy || raw.userEmail, 'Unknown user'),
          errorReason: toStringValue(raw.errorReason || raw.lastError, 'Unknown error'),
          submittedAt: toStringValue(raw.createdAt, new Date().toISOString()),
          status: toStringValue(raw.parseStatus || raw.status, 'failed')
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function retryAdminJd(id: string) {
  return postAdminJdSubmissionsIdReParse({ id })
}

export async function loadAdminRagDocumentsList(): Promise<AdminRagDocumentView[]> {
  try {
    const res = await getAdminRagDocuments({ page: 1, pageSize: 10 })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return items.map((item, index) => {
      const raw = isObject(item) ? item : {}
      return {
        id: toStringValue(raw.id, `doc-${index + 1}`),
        title: toStringValue(raw.title, 'Untitled document'),
        sourceType: toStringValue(raw.sourceType, 'other'),
        chunks: toNumberValue(raw.chunksCount ?? raw.chunkCount, 0),
        status: toStringValue(raw.embeddingStatus ?? raw.status, 'pending'),
        uploadedAt: toStringValue(raw.createdAt, new Date().toISOString())
      }
    })
  } catch {
    return []
  }
}

export async function uploadAdminRagDocument(input: {
  file: File
  title: string
  sourceType: string
  relatedSkillIds: string[]
}) {
  const res = await postAdminRagDocuments(input)
  emitAdminRagUpdated()
  return res
}

export async function deleteAdminRagDocument(id: string) {
  const res = await deleteAdminRagDocumentsId({ id })
  emitAdminRagUpdated()
  return res
}
