import { useTranslation } from 'react-i18next'
import { useEffect, useState } from 'react'

import type { CreateOrderRequest } from '~/api/model'
import { customFetch } from '~/api/mutator/custom-fetch'
import { getAdminSubscriptionTiers } from '~/api/operations/admin-subscription-tiers/admin-subscription-tiers'
import {
  getSubscriptionMe,
  getSubscriptionTiers,
  postSubscriptionOrders
} from '~/api/operations/subscription/subscription'

export function unwrapData<T>(response: unknown): T | null {
  const data = (response as { data?: unknown })?.data
  return (data ?? null) as T | null
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export type PricingTierView = {
  code: string
  name: string
  priceMonthly: number
  jdQuota: number
  gapAnalysisQuota: number
  assessmentQuota: number
  roadmapQuota: number
  careerTrackQuota: number
  portfolioProjectQuota: number
  portfolioCertificateQuota: number
  fullGapHistory: boolean
  active: boolean
}

export type SubscriptionQuotaUsage = {
  used: number
  limit: number
  nearLimit: boolean
}

export type SubscriptionView = {
  tierCode: string
  displayName: string
  status: string
  expiresAt: string | null
  quotas: Partial<
    Record<
      | 'jd'
      | 'gapAnalysis'
      | 'assessment'
      | 'roadmapActive'
      | 'careerTrack'
      | 'portfolioCertificate'
      | 'portfolioProject',
      SubscriptionQuotaUsage
    >
  >
}

export type SubscriptionOrderView = {
  id: string
  amount: number
  status: string
  paymentMethod: string
  createdAt: string
  paymentUrl: string | null
  currency: string | null
  provider: string | null
}

export type DashboardQuotaSummary = {
  tierCode: string
  tierLabel: string
  quotaText: string
  status: string
  expiresAt: string | null
  usageRatio: number | null
  nearLimit: boolean
  upgradeRequired: boolean
}

function defaultTiers(): PricingTierView[] {
  return [
    {
      code: 'free',
      name: 'Free',
      priceMonthly: 0,
      jdQuota: 3,
      gapAnalysisQuota: 3,
      assessmentQuota: 3,
      roadmapQuota: 3,
      careerTrackQuota: 1,
      portfolioProjectQuota: 3,
      portfolioCertificateQuota: 3,
      fullGapHistory: false,
      active: true
    },
    {
      code: 'student',
      name: 'Student',
      priceMonthly: 49000,
      jdQuota: -1,
      gapAnalysisQuota: -1,
      assessmentQuota: -1,
      roadmapQuota: -1,
      careerTrackQuota: -1,
      portfolioProjectQuota: -1,
      portfolioCertificateQuota: -1,
      fullGapHistory: true,
      active: true
    }
  ]
}

// BE trả quota LỒNG trong `quotas` object với key: jd, gapAnalysis, assessment,
// roadmapActive, careerTrack, portfolioCertificate, portfolioProject, fullGapHistory.
// (-1 = unlimited). Đọc nested trước, fallback sang flat key cho an toàn.
export function parseTier(item: unknown, fallback: PricingTierView): PricingTierView {
  const raw = isObject(item) ? item : {}
  const q = isObject(raw.quotas) ? raw.quotas : raw
  const num = (nested: unknown, flat: unknown, fb: number) => {
    const value = nested ?? flat
    return typeof value === 'number' ? value : fb
  }
  return {
    code: toStringValue(raw.tierCode || raw.code, fallback.code).toLowerCase(),
    name: toStringValue(raw.displayName || raw.name, fallback.name),
    priceMonthly: toNumberValue(raw.priceMonthly ?? raw.monthlyPrice, fallback.priceMonthly),
    jdQuota: num(q.jd, raw.jdQuota, fallback.jdQuota),
    gapAnalysisQuota: num(q.gapAnalysis, raw.gapAnalysisQuota, fallback.gapAnalysisQuota),
    assessmentQuota: num(q.assessment, raw.assessmentQuota, fallback.assessmentQuota),
    roadmapQuota: num(q.roadmapActive, raw.roadmapActiveQuota ?? raw.roadmapQuota, fallback.roadmapQuota),
    careerTrackQuota: num(q.careerTrack, raw.careerTrackQuota, fallback.careerTrackQuota),
    portfolioProjectQuota: num(q.portfolioProject, raw.portfolioProjectQuota, fallback.portfolioProjectQuota),
    portfolioCertificateQuota: num(
      q.portfolioCertificate,
      raw.portfolioCertificateQuota,
      fallback.portfolioCertificateQuota
    ),
    fullGapHistory: toBooleanValue(q.fullGapHistory ?? raw.fullGapHistory, fallback.fullGapHistory),
    active: toBooleanValue(raw.isActive ?? raw.active, fallback.active)
  }
}

function pickFallback(item: unknown, fallbacks: PricingTierView[]): PricingTierView {
  const code = isObject(item) ? toStringValue(item.tierCode || item.code, '').toLowerCase() : ''
  return fallbacks.find((tier) => tier.code === code) ?? fallbacks[0]
}

export async function loadSubscriptionTiers(): Promise<PricingTierView[]> {
  try {
    const res = await getSubscriptionTiers()
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? (data as { items: unknown[] }).items
        : []

    const fallbacks = defaultTiers()
    if (items.length === 0) return fallbacks

    return items.map((item) => parseTier(item, pickFallback(item, fallbacks)))
  } catch {
    return defaultTiers()
  }
}

export async function loadAdminSubscriptionTiers(): Promise<PricingTierView[]> {
  try {
    const res = await getAdminSubscriptionTiers()
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? (data as { items: unknown[] }).items
        : []

    const fallbacks = defaultTiers()
    if (items.length === 0) return fallbacks

    return items.map((item) => parseTier(item, pickFallback(item, fallbacks)))
  } catch {
    return defaultTiers()
  }
}

export async function loadCurrentSubscription(): Promise<SubscriptionView | null> {
  try {
    const res = await getSubscriptionMe()
    const data = unwrapData<unknown>(res)
    if (!isObject(data)) return null

    const root = isObject(data.subscription) ? data.subscription : data
    const tierRoot = isObject(root.tier) ? root.tier : root
    const quotasRoot = isObject(root.usage)
      ? root.usage
      : isObject(data.quotas)
        ? data.quotas
        : isObject(root.quotas)
          ? root.quotas
          : null
    const parseQuota = (value: unknown): SubscriptionQuotaUsage | undefined => {
      if (!isObject(value)) return undefined
      const used = toNumberValue(value.used, 0)
      const limit = toNumberValue(value.limit, 0)
      const nearLimit =
        typeof value.nearLimit === 'boolean' ? value.nearLimit : limit > 0 ? used >= limit * (2 / 3) : false
      return { used, limit, nearLimit }
    }

    return {
      tierCode: toStringValue(tierRoot.tierCode, 'free').toLowerCase(),
      displayName: toStringValue(tierRoot.displayName, 'Free'),
      status: toStringValue(root.status, 'active'),
      expiresAt: typeof root.expiresAt === 'string' ? root.expiresAt : null,
      quotas: {
        jd: parseQuota(quotasRoot?.jd),
        gapAnalysis: parseQuota(quotasRoot?.gapAnalysis),
        assessment: parseQuota(quotasRoot?.assessment),
        roadmapActive: parseQuota(quotasRoot?.roadmapActive),
        careerTrack: parseQuota(quotasRoot?.careerTrack),
        portfolioCertificate: parseQuota(quotasRoot?.portfolioCertificate),
        portfolioProject: parseQuota(quotasRoot?.portfolioProject)
      }
    }
  } catch {
    return null
  }
}

export function parseOrders(root: Record<string, unknown>): SubscriptionOrderView[] {
  const sources = [root.orders, root.paymentOrders, root.recentOrders]
  const items = sources.find(Array.isArray) as unknown[] | undefined
  if (!items) return []

  return items.map((item, index) => {
    const raw = isObject(item) ? item : {}
    return {
      id: toStringValue(raw.id || raw.orderId, `order-${index + 1}`),
      amount: toNumberValue(raw.amount ?? raw.totalAmount, 0),
      status: toStringValue(raw.status, 'pending'),
      paymentMethod: toStringValue(raw.paymentMethod ?? raw.paymentProvider ?? raw.provider, 'Online'),
      createdAt: toStringValue(raw.createdAt ?? raw.createdOn, new Date().toISOString()),
      paymentUrl:
        typeof raw.paymentUrl === 'string'
          ? raw.paymentUrl
          : typeof raw.checkoutUrl === 'string'
            ? raw.checkoutUrl
            : null,
      currency: typeof raw.currency === 'string' ? raw.currency : null,
      provider: toStringValue(raw.paymentProvider ?? raw.provider, '') || null
    }
  })
}

export async function loadSubscriptionOrders(): Promise<SubscriptionOrderView[]> {
  try {
    const res = await customFetch<{ data?: unknown }>(`/subscription/orders`, { method: 'GET' })
    const data = unwrapData<unknown>(res)
    const root = isObject(data) ? data : null

    if (root) return parseOrders(root)
    if (Array.isArray(data)) return parseOrders({ orders: data })

    return []
  } catch {
    return []
  }
}

export async function createSubscriptionOrder(payload: CreateOrderRequest): Promise<{
  orderId: string | null
  amount: number | null
  currency: string | null
  transferContent: string | null
  bankAccount: string | null
  bankCode: string | null
  accountName: string | null
  qrImageUrl: string | null
  status: string | null
}> {
  const res = await postSubscriptionOrders(payload)
  const data = unwrapData<unknown>(res)
  const root = isObject(data) ? data : null
  return {
    orderId: typeof root?.orderId === 'string' ? root.orderId : typeof root?.id === 'string' ? root.id : null,
    amount: typeof root?.amount === 'number' ? root.amount : null,
    currency: typeof root?.currency === 'string' ? root.currency : null,
    transferContent: typeof root?.transferContent === 'string' ? root.transferContent : null,
    bankAccount: typeof root?.bankAccount === 'string' ? root.bankAccount : null,
    bankCode: typeof root?.bankCode === 'string' ? root.bankCode : null,
    accountName: typeof root?.accountName === 'string' ? root.accountName : null,
    qrImageUrl: typeof root?.qrImageUrl === 'string' ? root.qrImageUrl : null,
    status: typeof root?.status === 'string' ? root.status : null
  }
}

export function buildQuotaSummary(
  subscription: SubscriptionView | null,
  tiers: PricingTierView[],
  t: ReturnType<typeof useTranslation>['t']
): DashboardQuotaSummary {
  const tierCode = subscription?.tierCode?.toLowerCase() || 'free'
  const matchedTier =
    tiers.find((tier) => tier.code === tierCode) ??
    defaultTiers().find((tier) => tier.code === tierCode) ??
    defaultTiers()[0]

  const prioritizedQuota =
    subscription?.quotas.jd ??
    subscription?.quotas.assessment ??
    subscription?.quotas.roadmapActive ??
    subscription?.quotas.portfolioCertificate ??
    subscription?.quotas.portfolioProject ??
    null

  const usageRatio =
    prioritizedQuota && prioritizedQuota.limit > 0
      ? prioritizedQuota.used / prioritizedQuota.limit
      : matchedTier.jdQuota < 0
        ? null
        : 0
  const nearLimit = prioritizedQuota ? prioritizedQuota.nearLimit : usageRatio !== null && usageRatio >= 0.8
  const upgradeRequired = tierCode === 'free'
  const quotaCount =
    prioritizedQuota && prioritizedQuota.limit > 0
      ? `${prioritizedQuota.used}/${prioritizedQuota.limit}`
      : matchedTier.jdQuota < 0
        ? t('quota.unlimited', { ns: 'dashboard' })
        : matchedTier.jdQuota

  return {
    tierCode,
    tierLabel: subscription?.displayName || matchedTier.name,
    quotaText: t('quota.dynamic.jdQuota', {
      ns: 'dashboard',
      count: quotaCount
    }),
    status: subscription?.status || 'active',
    expiresAt: subscription?.expiresAt ?? null,
    usageRatio,
    nearLimit,
    upgradeRequired
  }
}

export function useQuotaSummary() {
  const { t } = useTranslation(['dashboard'])
  const [summary, setSummary] = useState<DashboardQuotaSummary | null>(null)

  useEffect(() => {
    let cancelled = false

    Promise.all([loadCurrentSubscription(), loadSubscriptionTiers()]).then(([subscription, tiers]) => {
      if (cancelled) return
      setSummary(buildQuotaSummary(subscription, tiers, t))
    })

    return () => {
      cancelled = true
    }
  }, [t])

  return summary
}
