import { deleteAdminRagDocumentsId, postAdminRagDocuments } from '~/api/operations/admin-rag-documents/admin-rag-documents'
import { getAdminDashboardStats } from '~/api/operations/admin-payments/admin-payments'
import { getAdminJdSubmissions, postAdminJdSubmissionsIdReParse } from '~/api/operations/admin-jds/admin-jds'
import { getAdminPaymentOrders } from '~/api/operations/admin-payments/admin-payments'
import { getAdminRagDocuments } from '~/api/operations/admin-rag-documents/admin-rag-documents'
import { getAdminResourcesPendingReview, patchAdminResourcesIdReview, postAdminResourcesIdReject } from '~/api/operations/admin-resources/admin-resources'
import { getAdminSkillsPendingReview, patchAdminSkillsIdActive, postAdminSkillsIdApprove, putAdminSkillsId } from '~/api/operations/admin-skills/admin-skills'
import { getAdminUsers, getAdminUsersId, patchAdminUsersIdBan, postAdminUsersIdActivateSubscription, postAdminUsersIdRevokeSubscription } from '~/api/operations/admin-users/admin-users'

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
  return toNumberValue(data.total, fallback)
}

export type AdminListResult<T> = {
  items: T[]
  total: number
  page: number
  pageSize: number
}

export type AdminDashboardStatsView = {
  totalUsers: number
  revenue: number
  aiCost: number
  activeSubscriptions: number
  affiliateClicks: number
  affiliateConversions: number
  affiliateRevenue: number
}

export type AdminUserRowView = {
  id: string
  name: string
  email: string
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

export type AdminSkillRowView = AdminReviewRowView & {
  major?: string
  description?: string
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
    const root = isObject(data) ? data : {}
    const subscriptionRevenue = isObject(root.subscriptionRevenue) ? root.subscriptionRevenue : null
    const affiliateStats = isObject(root.affiliateStats) ? root.affiliateStats : null
    const usersByTier = isObject(root.usersByTier) ? root.usersByTier : {}
    const studentCount = toNumberValue(usersByTier.student, 0)
    return {
      totalUsers: toNumberValue(root.totalUsers, 0),
      revenue: toNumberValue(root.totalRevenue ?? subscriptionRevenue?.allTime, 0),
      aiCost: toNumberValue(root.totalAiCost ?? root.aiCostEstimate, 0),
      activeSubscriptions: studentCount,
      affiliateClicks: toNumberValue(affiliateStats?.totalClicks, 0),
      affiliateConversions: toNumberValue(affiliateStats?.totalConversions, 0),
      affiliateRevenue: toNumberValue(affiliateStats?.estimatedRevenue, 0),
    }
  } catch {
    return { totalUsers: 0, revenue: 0, aiCost: 0, activeSubscriptions: 0, affiliateClicks: 0, affiliateConversions: 0, affiliateRevenue: 0 }
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
      pageSize,
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        const subscription = isObject(raw.subscription) ? raw.subscription : null
        return {
          id: toStringValue(raw.id, `user-${index + 1}`),
          name: toStringValue(raw.fullName || raw.name, 'User'),
          email: toStringValue(raw.email, `user${index + 1}@example.com`),
          plan: toStringValue(subscription?.displayName, 'Free'),
          jdCount: toNumberValue(raw.jdCount, 0),
          createdAt: toStringValue(raw.createdAt, new Date().toISOString()),
          status: toStringValue(raw.status || raw.accountStatus, 'active'),
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize,
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
          url: typeof raw.url === 'string' ? raw.url : undefined,
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize,
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function approveAdminResource(id: string) {
  return patchAdminResourcesIdReview({ id }, { needsAdminReview: false })
}

export async function rejectAdminResource(id: string) {
  return postAdminResourcesIdReject({ id })
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
      pageSize,
    })
    const data = unwrapData<unknown>(res)
    const items = parseItems(data)
    return {
      items: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `skill-${index + 1}`),
          title: toStringValue(raw.name, 'Skill'),
          subtitle: toStringValue(raw.category, 'Unknown category'),
          type: 'skill',
          status: toStringValue(raw.status, 'pending'),
          major: toStringValue(raw.major, ''),
          description: toStringValue(raw.description, ''),
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize,
    }
  } catch {
    return { items: [], total: 0, page, pageSize }
  }
}

export async function approveAdminSkill(id: string, payload?: Partial<AdminSkillRowView>) {
  return postAdminSkillsIdApprove({ id }, {
    name: payload?.title ?? null,
    category: payload?.subtitle ?? null,
    major: payload?.major ?? null,
    description: payload?.description ?? null,
  })
}

export async function updateAdminSkill(id: string, payload: {
  name?: string | null
  slug?: string | null
  category?: string | null
  major?: string | null
  description?: string | null
}) {
  return putAdminSkillsId({ id }, payload)
}

export async function rejectAdminSkill(id: string) {
  return patchAdminSkillsIdActive({ id }, { isActive: false })
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
      const percent = typeof limit === 'number' && limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : toNumberValue(entry.percent, 0)
      return {
        current,
        max: String(limit),
        percent,
      }
    }

    return {
      id: toStringValue(raw.id, id),
      name: toStringValue(raw.fullName || raw.name, 'User'),
      email: toStringValue(raw.email, 'user@example.com'),
      avatarUrl: toStringValue(raw.avatarUrl, 'https://placehold.co/160x160?text=User'),
      createdDate: toStringValue(raw.createdAt, new Date().toISOString()),
      lastLogin: toStringValue(raw.lastLoginAt || raw.lastLogin, '—'),
      isBanned: Boolean(raw.isBanned ?? (toStringValue(raw.status || raw.accountStatus).toLowerCase() === 'banned')),
      plan: toStringValue(subscription?.displayName || subscription?.tierName || raw.plan, 'Free'),
      subscriptionStatus: toStringValue(subscription?.status, 'active'),
      startDate: toStringValue(subscription?.startDate || subscription?.startedAt, '—'),
      endDate: toStringValue(subscription?.expiresAt || subscription?.endDate, '—'),
      autoRenew: Boolean(subscription?.autoRenew),
      usage: {
        jds: mapUsageEntry(usage?.jds),
        roadmaps: mapUsageEntry(usage?.roadmaps),
        assessments: mapUsageEntry(usage?.assessments),
      },
      payments: paymentHistory.map((item, index) => {
        const payment = isObject(item) ? item : {}
        return {
          date: toStringValue(payment.createdAt || payment.date, new Date().toISOString()),
          amount: typeof payment.amount === 'number' ? `${payment.amount.toLocaleString('vi-VN')} VND` : toStringValue(payment.amount, '0 VND'),
          provider: toStringValue(payment.provider || payment.method, 'Trực tuyến'),
          code: toStringValue(payment.code || payment.transactionId, `payment-${index + 1}`),
          status: toStringValue(payment.status, 'success'),
        }
      }),
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
    const res = await getAdminPaymentOrders({ page: 1, pageSize: 10 })
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
        createdAt: toStringValue(raw.createdAt, new Date().toISOString()),
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
          status: toStringValue(raw.parseStatus || raw.status, 'failed'),
        }
      }),
      total: parseTotal(data, items.length),
      page,
      pageSize,
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
        chunks: toNumberValue(raw.chunkCount, 0),
        status: toStringValue(raw.status, 'pending'),
        uploadedAt: toStringValue(raw.createdAt, new Date().toISOString()),
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
