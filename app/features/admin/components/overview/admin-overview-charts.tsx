import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { Link } from 'react-router'

import {
  loadAdminDashboardStats,
  loadAdminPaymentOrders,
  loadAdminJdFailed,
  loadAdminSkillsQueue,
  loadAdminResourcesQueue,
  type AdminDashboardStatsView,
  type AdminPaymentOrderView,
  type AdminJdFailedView
} from '../../lib/admin-data'

const emptyStats: AdminDashboardStatsView = {
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(value)
}

function shortCurrency(value: number) {
  if (value >= 1_000_000) return `${Math.round(value / 100_000) / 10}M`
  if (value >= 1_000) return `${Math.round(value / 1_000)}K`
  return String(value)
}

function normalizedEntries(record: Record<string, number>) {
  return Object.entries(record)
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .map(([key, value]) => ({ key, value }))
    .sort((a, b) => b.value - a.value)
}

function recentMonths(orders: AdminPaymentOrderView[], monthCount = 6) {
  const now = new Date()
  const months = Array.from({ length: monthCount }).map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (monthCount - 1 - index), 1)
    return {
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: `T${date.getMonth() + 1}`,
      value: 0
    }
  })
  const byKey = new Map(months.map((month) => [month.key, month]))

  for (const order of orders) {
    const status = order.status.toLowerCase()
    if (status !== 'completed' && status !== 'paid' && status !== 'success') continue
    const date = new Date(order.createdAt)
    if (Number.isNaN(date.getTime())) continue
    const key = `${date.getFullYear()}-${date.getMonth()}`
    const bucket = byKey.get(key)
    if (bucket) bucket.value += order.amount
  }

  return months
}

function linePath(values: number[], width: number, height: number) {
  const max = Math.max(...values, 1)
  return values
    .map((value, index) => {
      const x = values.length <= 1 ? 0 : (index / (values.length - 1)) * width
      const y = height - (value / max) * height
      return `${index === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(' ')
}

function areaPath(values: number[], width: number, height: number) {
  const path = linePath(values, width, height)
  return `${path} L ${width} ${height} L 0 ${height} Z`
}

export function AdminOverviewCharts() {
  const { i18n } = useTranslation('admin')
  const isVi = (i18n.language ?? 'vi').startsWith('vi')
  const label = (vi: string, en: string) => (isVi ? vi : en)
  const [stats, setStats] = useState<AdminDashboardStatsView>(emptyStats)
  const [orders, setOrders] = useState<AdminPaymentOrderView[]>([])
  const [jdFailed, setJdFailed] = useState<AdminJdFailedView[]>([])
  const [jdFailedTotal, setJdFailedTotal] = useState(0)
  const [skillsPending, setSkillsPending] = useState(0)
  const [resourcesPending, setResourcesPending] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      loadAdminDashboardStats(),
      loadAdminPaymentOrders(),
      loadAdminJdFailed({ parseStatus: 'failed', pageSize: 3 }),
      loadAdminSkillsQueue({ pageSize: 1 }),
      loadAdminResourcesQueue({ pageSize: 1 })
    ])
      .then(([nextStats, nextOrders, jdResult, skillsResult, resourcesResult]) => {
        if (cancelled) return
        setStats(nextStats)
        setOrders(nextOrders)
        setJdFailed(jdResult.items)
        setJdFailedTotal(jdResult.total)
        setSkillsPending(skillsResult.total)
        setResourcesPending(resourcesResult.total)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const tierItems = useMemo(() => {
    const fromApi = normalizedEntries(stats.usersByTier)
    if (fromApi.length) return fromApi
    return [
      { key: 'free', value: Math.max(0, stats.totalUsers - stats.activeSubscriptions) },
      { key: 'student', value: stats.activeSubscriptions }
    ].filter((item) => item.value > 0)
  }, [stats.activeSubscriptions, stats.totalUsers, stats.usersByTier])
  const monthlyTrend = useMemo(() => recentMonths(orders), [orders])
  const totalTier = tierItems.reduce((sum, item) => sum + item.value, 0)
  const trendValues = monthlyTrend.map((item) => item.value)
  const hasRevenueTrend = trendValues.some((value) => value > 0)
  const maxTrend = Math.max(...trendValues, 1)
  const studentPercent =
    totalTier > 0
      ? Math.round(((tierItems.find((item) => item.key.toLowerCase() === 'student')?.value ?? 0) / totalTier) * 100)
      : 0
  const jdSuccessRate =
    stats.totalJdSubmitted > 0
      ? Math.round(((stats.totalJdSubmitted - jdFailedTotal) / stats.totalJdSubmitted) * 100)
      : 0

  if (loading) {
    return (
      <section className='grid grid-cols-1 gap-6 xl:grid-cols-12'>
        <div className='h-96 animate-pulse rounded-2xl border border-border bg-card xl:col-span-7' />
        <div className='h-96 animate-pulse rounded-2xl border border-border bg-card xl:col-span-5' />
      </section>
    )
  }

  return (
    <section className='grid grid-cols-1 gap-6 xl:grid-cols-12'>
      <article className='rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-7'>
        <div className='flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-primary'>{label('Doanh thu', 'Revenue')}</p>
            <h2 className='mt-1 text-2xl font-black text-foreground'>
              {label('Xu hướng doanh thu 6 tháng', '6-month revenue trend')}
            </h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {label('Dựa trên các đơn thanh toán đã hoàn tất.', 'Based on completed payment orders.')}
            </p>
          </div>
          <div className='rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 text-right'>
            <p className='text-xs font-bold uppercase tracking-wider text-muted-foreground'>
              {label('Tổng doanh thu', 'Total revenue')}
            </p>
            <p className='text-xl font-black text-foreground'>{formatCurrency(stats.revenue)}</p>
          </div>
        </div>

        {hasRevenueTrend ? (
          <div className='mt-8'>
            <svg
              viewBox='0 0 640 240'
              className='h-64 w-full overflow-visible'
              role='img'
              aria-label={label('Biểu đồ doanh thu 6 tháng', '6-month revenue chart')}
            >
              <defs>
                <linearGradient id='admin-revenue-area' x1='0' x2='0' y1='0' y2='1'>
                  <stop offset='0%' stopColor='var(--color-primary)' stopOpacity='0.28' />
                  <stop offset='100%' stopColor='var(--color-primary)' stopOpacity='0.02' />
                </linearGradient>
              </defs>
              {[0, 1, 2, 3].map((line) => (
                <line
                  key={line}
                  x1='0'
                  x2='640'
                  y1={line * 60}
                  y2={line * 60}
                  stroke='var(--color-border)'
                  strokeDasharray='4 8'
                />
              ))}
              <path d={areaPath(trendValues, 640, 210)} transform='translate(0 15)' fill='url(#admin-revenue-area)' />
              <path
                d={linePath(trendValues, 640, 210)}
                transform='translate(0 15)'
                fill='none'
                stroke='var(--color-primary)'
                strokeWidth='5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
              {monthlyTrend.map((point, index) => {
                const x = monthlyTrend.length <= 1 ? 0 : (index / (monthlyTrend.length - 1)) * 640
                const y = 225 - (point.value / maxTrend) * 210
                return (
                  <g key={point.key}>
                    <circle
                      cx={x}
                      cy={y}
                      r='6'
                      fill='var(--color-card)'
                      stroke='var(--color-primary)'
                      strokeWidth='4'
                    />
                    <text x={x} y='238' textAnchor='middle' className='fill-muted-foreground text-[11px] font-bold'>
                      {point.label}
                    </text>
                    {point.value > 0 ? (
                      <text
                        x={x}
                        y={Math.max(14, y - 14)}
                        textAnchor='middle'
                        className='fill-foreground text-[11px] font-bold'
                      >
                        {shortCurrency(point.value)}
                      </text>
                    ) : null}
                  </g>
                )
              })}
            </svg>
          </div>
        ) : (
          <div className='mt-8 flex h-64 items-center justify-center rounded-2xl border border-dashed border-border bg-muted/20 text-sm font-semibold text-muted-foreground'>
            {label('Chưa có đơn thanh toán hoàn tất để vẽ xu hướng.', 'No completed payment orders yet.')}
          </div>
        )}
      </article>

      <article className='rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-5'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-primary'>
              {label('Gói người dùng', 'User tiers')}
            </p>
            <h2 className='mt-1 text-2xl font-black text-foreground'>{label('Phân bổ gói', 'Tier mix')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>
              {stats.totalUsers} {label('người dùng', 'users')} · Student {studentPercent}%
            </p>
          </div>
          <span className='material-symbols-outlined text-primary'>donut_large</span>
        </div>

        <div className='mt-8 grid gap-6 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-center'>
          <div
            className='mx-auto grid h-44 w-44 place-items-center rounded-full border border-border shadow-inner'
            style={{
              background:
                totalTier > 0
                  ? `conic-gradient(var(--color-primary) 0 ${studentPercent}%, color-mix(in srgb, var(--color-primary) 22%, var(--color-muted)) ${studentPercent}% 100%)`
                  : 'var(--color-muted)'
            }}
          >
            <div className='grid h-24 w-24 place-items-center rounded-full bg-card text-center shadow-sm'>
              <div>
                <p className='text-3xl font-black text-foreground'>{stats.activeSubscriptions}</p>
                <p className='text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>Student</p>
              </div>
            </div>
          </div>

          <div className='space-y-3'>
            {tierItems.length === 0 ? (
              <div className='rounded-2xl border border-dashed border-border bg-muted/20 p-5 text-center text-sm font-semibold text-muted-foreground'>
                {label('Chưa có dữ liệu gói.', 'No tier data yet.')}
              </div>
            ) : (
              tierItems.map((item) => {
                const percent = totalTier > 0 ? Math.round((item.value / totalTier) * 100) : 0
                return (
                  <div key={item.key} className='rounded-2xl border border-border bg-muted/20 p-4'>
                    <div className='mb-2 flex items-center justify-between gap-3'>
                      <span className='font-bold capitalize text-foreground'>{item.key}</span>
                      <span className='font-black text-primary'>{item.value}</span>
                    </div>
                    <div className='h-2 overflow-hidden rounded-full bg-muted'>
                      <div className='h-full rounded-full bg-primary' style={{ width: `${Math.max(4, percent)}%` }} />
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </article>

      <article className='rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-7'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-warning'>
              {label('Phân tích JD', 'JD Analytics')}
            </p>
            <h2 className='mt-1 text-2xl font-black text-foreground'>
              {label('Trạng thái phân tích', 'Parse Status')}
            </h2>
          </div>
          <span className='material-symbols-outlined text-warning'>analytics</span>
        </div>

        <div className='mt-8'>
          <div className='flex items-center justify-between text-sm font-bold text-foreground mb-2'>
            <span>{label('Tỉ lệ thành công', 'Success Rate')}</span>
            <span>{jdSuccessRate}%</span>
          </div>
          <div className='h-3 overflow-hidden rounded-full bg-destructive/20'>
            <div className='h-full rounded-full bg-success' style={{ width: `${jdSuccessRate}%` }} />
          </div>
          <div className='mt-4 flex gap-6 text-sm'>
            <div>
              <span className='text-muted-foreground'>{label('Tổng JD:', 'Total JDs:')}</span>
              <span className='ml-2 font-bold text-foreground'>{stats.totalJdSubmitted}</span>
            </div>
            <div>
              <span className='text-muted-foreground'>{label('Lỗi phân tích:', 'Parse Errors:')}</span>
              <span className='ml-2 font-bold text-destructive'>{jdFailedTotal}</span>
            </div>
          </div>
        </div>

        {jdFailed.length > 0 && (
          <div className='mt-8 border-t border-border pt-6'>
            <h3 className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4'>
              {label('Lỗi gần đây', 'Recent Errors')}
            </h3>
            <div className='space-y-3'>
              {jdFailed.slice(0, 3).map((jd) => (
                <div
                  key={jd.id}
                  className='flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3'
                >
                  <div className='min-w-0 flex-1 pr-4'>
                    <p className='truncate text-sm font-bold text-foreground'>{jd.title}</p>
                    <p className='truncate text-xs text-muted-foreground mt-0.5'>{jd.errorReason}</p>
                  </div>
                  <Link to='/admin/jd-logs' className='shrink-0 text-primary text-xs font-semibold hover:underline'>
                    {label('Chi tiết', 'Details')}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </article>

      <article className='rounded-2xl border border-border bg-card p-6 shadow-sm xl:col-span-5'>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-info'>{label('Xét duyệt', 'Approvals')}</p>
            <h2 className='mt-1 text-2xl font-black text-foreground'>
              {label('Yêu cầu chờ xử lý', 'Pending Requests')}
            </h2>
          </div>
          <span className='material-symbols-outlined text-info'>pending_actions</span>
        </div>

        <div className='mt-8 space-y-4'>
          <div className='flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary'>
                <span className='material-symbols-outlined text-lg'>psychology</span>
              </div>
              <div>
                <p className='text-sm font-bold text-foreground'>{label('Kỹ năng', 'Skills')}</p>
                <p className='text-xs text-muted-foreground'>{label('Đang chờ duyệt', 'Pending review')}</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-2xl font-black text-foreground'>{skillsPending}</span>
              <Link
                to='/admin/skills-queue'
                className='rounded-full bg-muted p-2 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors flex items-center justify-center'
              >
                <span className='material-symbols-outlined text-sm'>arrow_forward</span>
              </Link>
            </div>
          </div>

          <div className='flex items-center justify-between rounded-2xl border border-border bg-card p-5 shadow-sm'>
            <div className='flex items-center gap-4'>
              <div className='flex h-10 w-10 items-center justify-center rounded-full bg-info/10 text-info'>
                <span className='material-symbols-outlined text-lg'>menu_book</span>
              </div>
              <div>
                <p className='text-sm font-bold text-foreground'>{label('Tài liệu', 'Resources')}</p>
                <p className='text-xs text-muted-foreground'>{label('Đang chờ duyệt', 'Pending review')}</p>
              </div>
            </div>
            <div className='flex items-center gap-4'>
              <span className='text-2xl font-black text-foreground'>{resourcesPending}</span>
              <Link
                to='/admin/resources?tab=queue'
                className='rounded-full bg-muted p-2 text-muted-foreground hover:bg-info/10 hover:text-info transition-colors flex items-center justify-center'
              >
                <span className='material-symbols-outlined text-sm'>arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </section>
  )
}
