import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { cn } from '~/shared/lib/cn'

import {
  loadMarketBaseline,
  loadMarketSkillTrends,
  loadUserReadiness,
  loadUserSkillProgress,
  MARKET_ROLE_OPTIONS,
  type MarketBaselineView,
  type MarketRoleCategory,
  type MarketSkillTrendView,
  type UserReadinessView,
  type UserSkillProgressView
} from '../lib/market-intelligence'

function statusTone(status: string) {
  const normalized = status.toLowerCase().replace(/[_\s-]/g, '')
  if (normalized === 'missing') return 'bg-destructive/10 text-destructive border-destructive/20'
  if (normalized === 'needsupgrade' || normalized === 'upgrade' || normalized === 'partial') {
    return 'bg-warning/10 text-warning border-warning/20'
  }
  if (normalized === 'have' || normalized === 'completed') return 'bg-success/10 text-success border-success/20'
  return 'bg-muted text-muted-foreground border-border'
}

function formatDate(value: string | null, locale: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat(locale.startsWith('vi') ? 'vi-VN' : 'en-US', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(date)
}

export function MarketPage() {
  const { t, i18n } = useTranslation('dashboard')
  const [role, setRole] = useState<MarketRoleCategory>('backend')
  const [baseline, setBaseline] = useState<MarketBaselineView | null>(null)
  const [trends, setTrends] = useState<MarketSkillTrendView[]>([])
  const [readiness, setReadiness] = useState<UserReadinessView | null>(null)
  const [skillProgress, setSkillProgress] = useState<UserSkillProgressView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    })

    Promise.all([
      loadMarketBaseline(role, 15),
      loadMarketSkillTrends({ roleCategory: role, months: 6, limit: 20 }),
      loadUserReadiness(),
      loadUserSkillProgress()
    ])
      .then(([baselineResult, trendResult, readinessResult, progressResult]) => {
        if (cancelled) return
        setBaseline(baselineResult.data)
        setTrends(trendResult.data ?? [])
        setReadiness(readinessResult.data)
        setSkillProgress(progressResult.data ?? [])
        setError(baselineResult.error ?? trendResult.error ?? readinessResult.error ?? progressResult.error ?? '')
      })
      .catch((e) => {
        if (cancelled) return
        setBaseline(null)
        setTrends([])
        setReadiness(null)
        setSkillProgress([])
        setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role])

  const progressBySkill = useMemo(() => {
    return new Map(skillProgress.map((item) => [item.skillName.toLowerCase(), item]))
  }, [skillProgress])

  const trendRows = useMemo(() => {
    const bySkill = new Map<string, MarketSkillTrendView[]>()
    trends.forEach((item) => {
      const key = item.skillName
      bySkill.set(key, [...(bySkill.get(key) ?? []), item])
    })
    return Array.from(bySkill.entries())
      .map(([skillName, rows]) => ({
        skillName,
        rows: rows.sort((a, b) => a.periodStart.localeCompare(b.periodStart)),
        latest: rows[rows.length - 1]
      }))
      .sort((a, b) => (b.latest?.demandPercent ?? 0) - (a.latest?.demandPercent ?? 0))
      .slice(0, 8)
  }, [trends])

  const updatedDate = formatDate(baseline?.lastUpdatedAt ?? null, i18n.language ?? 'vi')
  const hasMarketData = (baseline?.totalJobs ?? 0) > 0 || (baseline?.topSkills.length ?? 0) > 0

  return (
    <div className='mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8'>
      <header className='mb-8 flex flex-col gap-5 border-b border-border pb-6 lg:flex-row lg:items-end lg:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-primary'>{t('marketIntelligence.eyebrow')}</p>
          <h1 className='mt-2 text-3xl font-black tracking-tight text-foreground'>{t('marketIntelligence.title')}</h1>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-muted-foreground'>{t('marketIntelligence.subtitle')}</p>
        </div>

        <label className='flex flex-col gap-2 text-sm font-semibold text-foreground'>
          {t('marketIntelligence.roleLabel')}
          <select
            value={role}
            onChange={(event) => setRole(event.target.value as MarketRoleCategory)}
            className='min-w-64 rounded-xl border border-border bg-card px-4 py-3 text-sm font-bold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
          >
            {MARKET_ROLE_OPTIONS.map((item) => (
              <option key={item} value={item}>
                {t(`marketIntelligence.roles.${item}`)}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error ? (
        <section className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </section>
      ) : null}

      <section className='mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <MarketMetric
          icon='work_history'
          label={t('marketIntelligence.metrics.marketJobs')}
          value={loading ? '...' : String(baseline?.totalJobs ?? 0)}
        />
        <MarketMetric
          icon='rocket_launch'
          label={t('marketIntelligence.metrics.readinessScore')}
          value={loading ? '...' : `${readiness?.score ?? 0}/100`}
        />
        <MarketMetric
          icon='query_stats'
          label={t('marketIntelligence.metrics.marketAlignment')}
          value={loading ? '...' : `${readiness?.marketAlignmentPercent ?? 0}%`}
        />
        <MarketMetric
          icon='calendar_month'
          label={t('marketIntelligence.metrics.lastUpdated')}
          value={loading ? '...' : (updatedDate ?? t('marketIntelligence.metrics.noDate'))}
        />
      </section>

      {!loading && !hasMarketData ? (
        <section className='mb-8 rounded-2xl border border-dashed border-border bg-card p-8 text-center'>
          <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
            <span className='material-symbols-outlined'>database</span>
          </div>
          <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.empty.title')}</h2>
          <p className='mx-auto mt-2 max-w-2xl text-sm text-muted-foreground'>
            {t('marketIntelligence.empty.description')}
          </p>
          <Link
            to='/admin/market-readiness'
            className='mt-5 inline-flex items-center justify-center gap-2 rounded-xl border border-primary/20 px-5 py-3 text-sm font-bold text-primary hover:bg-primary/5'
          >
            {t('marketIntelligence.empty.adminCta')}
            <span className='material-symbols-outlined text-base'>arrow_forward</span>
          </Link>
        </section>
      ) : null}

      <div className='grid gap-8 xl:grid-cols-[1.5fr_1fr]'>
        <section className='rounded-2xl border border-border bg-card shadow-sm'>
          <div className='border-b border-border p-6'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.topSkills.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketIntelligence.topSkills.subtitle')}</p>
          </div>
          <div className='overflow-x-auto'>
            <table className='w-full border-collapse text-left'>
              <thead>
                <tr className='border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                  <th className='px-6 py-4'>{t('marketIntelligence.topSkills.skill')}</th>
                  <th className='px-6 py-4'>{t('marketIntelligence.topSkills.demand')}</th>
                  <th className='px-6 py-4'>{t('marketIntelligence.topSkills.status')}</th>
                  <th className='px-6 py-4'>{t('marketIntelligence.topSkills.flags')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {loading
                  ? Array.from({ length: 6 }).map((_, index) => (
                      <tr key={index} className='animate-pulse'>
                        <td className='px-6 py-5'>
                          <div className='h-4 w-36 rounded bg-muted' />
                        </td>
                        <td className='px-6 py-5'>
                          <div className='h-4 w-28 rounded bg-muted' />
                        </td>
                        <td className='px-6 py-5'>
                          <div className='h-7 w-24 rounded-full bg-muted' />
                        </td>
                        <td className='px-6 py-5'>
                          <div className='h-7 w-32 rounded-full bg-muted' />
                        </td>
                      </tr>
                    ))
                  : (baseline?.topSkills ?? []).map((skill) => {
                      const progress = progressBySkill.get(skill.skillName.toLowerCase())
                      return (
                        <tr key={skill.skillName} className='hover:bg-muted/20'>
                          <td className='px-6 py-5'>
                            <p className='font-bold text-foreground'>{skill.skillName}</p>
                            <p className='mt-1 text-xs text-muted-foreground'>
                              {t('marketIntelligence.topSkills.jobCount', { count: skill.jobCount })}
                            </p>
                          </td>
                          <td className='px-6 py-5'>
                            <div className='flex min-w-36 items-center gap-3'>
                              <div className='h-2 flex-1 overflow-hidden rounded-full bg-muted'>
                                <div
                                  className='h-full rounded-full bg-primary'
                                  style={{ width: `${Math.min(100, Math.max(0, skill.demandPercent))}%` }}
                                />
                              </div>
                              <span className='w-12 text-right text-sm font-bold text-foreground'>
                                {skill.demandPercent}%
                              </span>
                            </div>
                          </td>
                          <td className='px-6 py-5'>
                            <span
                              className={cn(
                                'inline-flex rounded-full border px-3 py-1 text-xs font-bold',
                                statusTone(progress?.currentStatus ?? 'unknown')
                              )}
                            >
                              {t(`marketIntelligence.status.${progress?.currentStatus ?? 'unknown'}`, {
                                defaultValue: progress?.currentStatus ?? t('marketIntelligence.status.unknown')
                              })}
                            </span>
                          </td>
                          <td className='px-6 py-5'>
                            <div className='flex flex-wrap gap-2'>
                              {progress?.isMandatory ? (
                                <span className='rounded-full bg-warning/10 px-3 py-1 text-xs font-bold text-warning'>
                                  {t('marketIntelligence.flags.mandatory')}
                                </span>
                              ) : null}
                              {progress?.isInMarketTopSkills ? (
                                <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary'>
                                  {t('marketIntelligence.flags.marketTop')}
                                </span>
                              ) : null}
                              {!progress?.isMandatory && !progress?.isInMarketTopSkills ? (
                                <span className='text-xs text-muted-foreground'>-</span>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
              </tbody>
            </table>
          </div>
        </section>

        <aside className='space-y-8'>
          <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.priority.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketIntelligence.priority.subtitle')}</p>
            <div className='mt-5 space-y-3'>
              {(readiness?.prioritySkills.length
                ? readiness.prioritySkills.slice(0, 6)
                : [t('marketIntelligence.priority.empty')]
              ).map((skill) => (
                <div key={skill} className='flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-3'>
                  <span className='material-symbols-outlined text-primary'>target</span>
                  <span className='text-sm font-semibold text-foreground'>{skill}</span>
                </div>
              ))}
            </div>
            <div className='mt-5 grid grid-cols-3 gap-3 text-center'>
              <GapCount label={t('marketIntelligence.priority.missing')} value={readiness?.missingSkills ?? 0} />
              <GapCount label={t('marketIntelligence.priority.upgrade')} value={readiness?.needsUpgradeSkills ?? 0} />
              <GapCount label={t('marketIntelligence.priority.have')} value={readiness?.haveSkills ?? 0} />
            </div>
            <Link
              to='/dashboard/analytics/analysis-history'
              className='mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-primary-foreground hover:opacity-90'
            >
              {t('marketIntelligence.priority.cta')}
              <span className='material-symbols-outlined text-base'>arrow_forward</span>
            </Link>
          </section>

          <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.trends.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketIntelligence.trends.subtitle')}</p>
            <div className='mt-5 space-y-4'>
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className='h-12 rounded-xl bg-muted animate-pulse' />
                ))
              ) : trendRows.length > 0 ? (
                trendRows.map((trend) => {
                  const latest = trend.latest
                  return (
                    <div key={trend.skillName} className='space-y-2'>
                      <div className='flex items-center justify-between gap-3 text-sm'>
                        <span className='font-bold text-foreground'>{trend.skillName}</span>
                        <span className='text-muted-foreground'>{latest?.demandPercent ?? 0}%</span>
                      </div>
                      <div className='flex h-8 items-end gap-1'>
                        {trend.rows.map((row) => (
                          <div
                            key={`${row.skillName}-${row.periodStart}`}
                            className='min-w-5 flex-1 rounded-t-md bg-primary/70'
                            title={`${row.skillName}: ${row.demandPercent}%`}
                            style={{ height: `${Math.max(10, Math.min(100, row.demandPercent))}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  )
                })
              ) : (
                <div className='rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
                  {t('marketIntelligence.trends.empty')}
                </div>
              )}
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}

function MarketMetric({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className='rounded-2xl border border-border bg-card p-5 shadow-sm'>
      <div className='mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary'>
        <span className='material-symbols-outlined text-xl'>{icon}</span>
      </div>
      <p className='text-sm font-semibold text-muted-foreground'>{label}</p>
      <p className='mt-1 text-2xl font-black text-foreground'>{value}</p>
    </div>
  )
}

function GapCount({ label, value }: { label: string; value: number }) {
  return (
    <div className='rounded-xl border border-border bg-muted/20 p-3'>
      <p className='text-xl font-black text-foreground'>{value}</p>
      <p className='mt-1 text-[11px] font-semibold text-muted-foreground'>{label}</p>
    </div>
  )
}
