import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { ReadinessHistoryTimeline } from '~/shared/components/readiness-history-timeline'
import { cn } from '~/shared/lib/cn'

import { MarketJobDetailDrawer } from '../components/market/market-job-detail-drawer'
import {
  loadMarketBaseline,
  loadMarketJobDetail,
  loadMarketJobs,
  loadMarketSkillTrends,
  loadUserReadiness,
  loadUserReadinessHistory,
  loadUserSkillProgress,
  MARKET_ROLE_OPTIONS,
  type MarketBaselineView,
  type MarketJobDetailView,
  type MarketJobListView,
  type MarketRoleCategory,
  type MarketSkillTrendView,
  type UserReadinessSnapshotView,
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
  const navigate = useNavigate()
  const [role, setRole] = useState<MarketRoleCategory>('backend')
  const [baseline, setBaseline] = useState<MarketBaselineView | null>(null)
  const [trends, setTrends] = useState<MarketSkillTrendView[]>([])
  const [readiness, setReadiness] = useState<UserReadinessView | null>(null)
  const [history, setHistory] = useState<UserReadinessSnapshotView[]>([])
  const [skillProgress, setSkillProgress] = useState<UserSkillProgressView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [jobs, setJobs] = useState<MarketJobListView[]>([])
  const [jobsLoading, setJobsLoading] = useState(false)
  const [jobsError, setJobsError] = useState('')
  const [jobsKeyword, setJobsKeyword] = useState('')
  const [jobsRoleFilter, setJobsRoleFilter] = useState<string>('backend')
  const [jobsPage, setJobsPage] = useState(1)
  const [jobsTotal, setJobsTotal] = useState(0)
  const [jobsTotalPages, setJobsTotalPages] = useState(0)
  const jobsPageSize = 10

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null)
  const [selectedJob, setSelectedJob] = useState<MarketJobDetailView | null>(null)
  const [selectedJobLoading, setSelectedJobLoading] = useState(false)
  const [selectedJobError, setSelectedJobError] = useState('')
  const [copyState, setCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

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
      loadUserSkillProgress(),
      loadUserReadinessHistory(12)
    ])
      .then(([baselineResult, trendResult, readinessResult, progressResult, historyResult]) => {
        if (cancelled) return
        setBaseline(baselineResult.data)
        setTrends(trendResult.data ?? [])
        setReadiness(readinessResult.data)
        setSkillProgress(progressResult.data ?? [])
        setHistory(historyResult.data ?? [])
        setError(
          baselineResult.error ??
            trendResult.error ??
            readinessResult.error ??
            progressResult.error ??
            historyResult.error ??
            ''
        )
      })
      .catch((e) => {
        if (cancelled) return
        setBaseline(null)
        setTrends([])
        setReadiness(null)
        setSkillProgress([])
        setHistory([])
        setError((e as Error).message)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [role])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setJobsLoading(true)
        setJobsError('')
      }
    })
    loadMarketJobs({
      roleCategory: jobsRoleFilter || null,
      keyword: jobsKeyword.trim() || null,
      page: jobsPage,
      pageSize: jobsPageSize
    })
      .then((result) => {
        if (cancelled) return
        setJobs(result.data?.items ?? [])
        setJobsTotal(result.data?.total ?? 0)
        setJobsTotalPages(result.data?.totalPages ?? 0)
        setJobsError(result.error ?? '')
      })
      .catch((err) => {
        if (cancelled) return
        setJobs([])
        setJobsTotal(0)
        setJobsTotalPages(0)
        setJobsError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setJobsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [jobsRoleFilter, jobsKeyword, jobsPage])

  useEffect(() => {
    if (!selectedJobId) {
      queueMicrotask(() => {
        setSelectedJob(null)
        setSelectedJobError('')
        setCopyState('idle')
      })
      return
    }
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setSelectedJobLoading(true)
        setSelectedJobError('')
        setCopyState('idle')
      }
    })
    loadMarketJobDetail(selectedJobId)
      .then((result) => {
        if (cancelled) return
        setSelectedJob(result.data)
        setSelectedJobError(result.error ?? '')
      })
      .catch((err) => {
        if (cancelled) return
        setSelectedJob(null)
        setSelectedJobError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setSelectedJobLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [selectedJobId])

  const handleCopyRawContent = async (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      window.prompt(t('marketIntelligence.jobs.copyFallback'), value)
      setCopyState('failed')
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setCopyState('copied')
      window.setTimeout(() => setCopyState('idle'), 2000)
    } catch {
      window.prompt(t('marketIntelligence.jobs.copyFallback'), value)
      setCopyState('failed')
    }
  }

  const handleAnalyze = (job: MarketJobDetailView) => {
    if (!job) return
    navigate('/dashboard/jd/new', {
      state: {
        marketJob: {
          id: job.id,
          sourceSite: job.sourceSite,
          sourceUrl: job.sourceUrl ?? '',
          jobTitle: job.jobTitle,
          companyName: job.companyName ?? '',
          location: job.location ?? '',
          salaryText: job.salaryText ?? '',
          roleCategory: job.roleCategory,
          rawContent: job.originalContent || job.rawContent,
          skills: job.skills
        }
      }
    })
  }

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
            onChange={(event) => {
              const nextRole = event.target.value as MarketRoleCategory
              setRole(nextRole)
              setJobsRoleFilter(nextRole)
              setJobsPage(1)
            }}
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

      <section className='mb-8 rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-primary'>
              {t('marketIntelligence.dataset.eyebrow')}
            </p>
            <h2 className='mt-2 text-xl font-bold text-foreground'>{t('marketIntelligence.dataset.title')}</h2>
            <p className='mt-1 max-w-3xl text-sm leading-6 text-muted-foreground'>
              {t('marketIntelligence.dataset.subtitle')}
            </p>
          </div>
          <div className='rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm font-semibold text-foreground'>
            {t(`marketIntelligence.roles.${role}`)}
          </div>
        </div>
        <div className='mt-5 grid gap-4 md:grid-cols-3'>
          <DatasetFact
            icon='work'
            label={t('marketIntelligence.dataset.jobs')}
            value={loading ? '...' : String(baseline?.totalJobs ?? 0)}
          />
          <DatasetFact
            icon='update'
            label={t('marketIntelligence.dataset.updated')}
            value={loading ? '...' : (updatedDate ?? t('marketIntelligence.metrics.noDate'))}
          />
          <DatasetFact
            icon='verified'
            label={t('marketIntelligence.dataset.source')}
            value={t('marketIntelligence.dataset.sourceValue')}
          />
        </div>
        <div className='mt-5 grid gap-3 md:grid-cols-3'>
          {(baseline?.topSkills ?? []).slice(0, 3).map((skill) => (
            <div key={skill.skillName} className='rounded-xl border border-border bg-muted/20 p-4'>
              <p className='text-sm font-black text-foreground'>{skill.skillName}</p>
              <p className='mt-1 text-xs leading-5 text-muted-foreground'>
                {t('marketIntelligence.dataset.skillSignal', {
                  count: skill.jobCount,
                  percent: skill.demandPercent
                })}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className='mb-8'>
        <ReadinessHistoryTimeline
          snapshots={history}
          loading={loading}
          title={t('marketIntelligence.history.title')}
          subtitle={t('marketIntelligence.history.subtitle')}
          emptyText={t('marketIntelligence.history.empty')}
          scoreLabel={t('marketIntelligence.history.score')}
          marketLabel={t('marketIntelligence.history.market')}
          roadmapLabel={t('marketIntelligence.history.roadmap')}
          gapLabel={t('marketIntelligence.history.gap')}
          locale={i18n.language ?? 'vi'}
        />
      </div>

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

      <section className='mb-8 rounded-2xl border border-border bg-card shadow-sm'>
        <div className='flex flex-col gap-4 border-b border-border p-6 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-primary'>
              {t('marketIntelligence.jobs.eyebrow')}
            </p>
            <h2 className='mt-2 text-xl font-bold text-foreground'>{t('marketIntelligence.jobs.title')}</h2>
            <p className='mt-1 max-w-3xl text-sm leading-6 text-muted-foreground'>
              {t('marketIntelligence.jobs.subtitle')}
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-[1fr_1fr_auto]'>
            <input
              type='search'
              value={jobsKeyword}
              onChange={(event) => {
                setJobsPage(1)
                setJobsKeyword(event.target.value)
              }}
              placeholder={t('marketIntelligence.jobs.searchPlaceholder')}
              className='rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
            />
            <select
              value={jobsRoleFilter}
              onChange={(event) => {
                setJobsPage(1)
                setJobsRoleFilter(event.target.value)
              }}
              className='rounded-xl border border-border bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40'
            >
              <option value=''>{t('marketIntelligence.jobs.allRoles')}</option>
              {MARKET_ROLE_OPTIONS.map((item) => (
                <option key={item} value={item}>
                  {t(`marketIntelligence.roles.${item}`)}
                </option>
              ))}
            </select>
            <span className='inline-flex items-center justify-center rounded-xl border border-border bg-muted/20 px-3 text-xs font-bold text-muted-foreground'>
              {t('marketIntelligence.jobs.totalLabel', { total: jobsTotal })}
            </span>
          </div>
        </div>

        {jobsError ? (
          <div className='m-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
            {jobsError}
          </div>
        ) : null}

        <div className='max-h-[520px] overflow-auto'>
          <table className='w-full min-w-[1080px] table-fixed border-collapse text-left'>
            <thead className='sticky top-0 z-10'>
              <tr className='border-b border-border bg-card text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm'>
                <th className='w-[25%] px-6 py-4'>{t('marketIntelligence.jobs.table.title')}</th>
                <th className='w-[18%] px-6 py-4'>{t('marketIntelligence.jobs.table.company')}</th>
                <th className='w-[16%] px-6 py-4'>{t('marketIntelligence.jobs.table.location')}</th>
                <th className='w-[14%] px-6 py-4'>{t('marketIntelligence.jobs.table.role')}</th>
                <th className='w-[18%] px-6 py-4'>{t('marketIntelligence.jobs.table.skills')}</th>
                <th className='w-[9%] px-6 py-4 text-right'>{t('marketIntelligence.jobs.table.action')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {jobsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className='px-6 py-5'>
                        <div className='h-4 rounded bg-muted' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : jobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-6 py-12 text-center text-sm text-muted-foreground'>
                    {t('marketIntelligence.jobs.empty')}
                  </td>
                </tr>
              ) : (
                jobs.map((job) => (
                  <tr key={job.id} className='align-top hover:bg-muted/20'>
                    <td className='break-words px-6 py-5'>
                      <p className='font-bold leading-6 text-foreground'>{job.jobTitle}</p>
                      <p className='mt-1 text-xs text-muted-foreground'>{job.sourceSite}</p>
                    </td>
                    <td className='break-words px-6 py-5 text-sm leading-6 text-foreground'>
                      {job.companyName ?? '-'}
                    </td>
                    <td className='break-words px-6 py-5 text-sm leading-6 text-foreground'>{job.location ?? '-'}</td>
                    <td className='break-words px-6 py-5 text-sm leading-6 text-foreground'>
                      {t(`marketIntelligence.roles.${job.roleCategory}`, { defaultValue: job.roleCategory })}
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex flex-wrap gap-1'>
                        {job.skills.slice(0, 3).map((skill) => (
                          <span
                            key={`${job.id}-${skill}`}
                            className='rounded-full bg-primary/10 px-2 py-1 text-[11px] font-bold text-primary'
                          >
                            {skill}
                          </span>
                        ))}
                        {job.skills.length > 3 ? (
                          <span className='rounded-full bg-muted px-2 py-1 text-[11px] font-bold text-muted-foreground'>
                            +{job.skills.length - 3}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <button
                        type='button'
                        onClick={() => setSelectedJobId(job.id)}
                        className='inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5'
                      >
                        <span className='material-symbols-outlined text-base'>visibility</span>
                        {t('marketIntelligence.jobs.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='flex items-center justify-between border-t border-border px-6 py-4 text-sm text-muted-foreground'>
          <span>{t('marketIntelligence.jobs.pageLabel', { page: jobsPage, totalPages: jobsTotalPages || 1 })}</span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setJobsPage((current) => Math.max(1, current - 1))}
              disabled={jobsPage <= 1 || jobsLoading}
              className='rounded-lg border border-border px-3 py-1 text-xs font-bold text-foreground disabled:opacity-40'
            >
              {t('marketIntelligence.jobs.prev')}
            </button>
            <button
              type='button'
              onClick={() =>
                setJobsPage((current) => (jobsTotalPages && current < jobsTotalPages ? current + 1 : current))
              }
              disabled={!jobsTotalPages || jobsPage >= jobsTotalPages || jobsLoading}
              className='rounded-lg border border-border px-3 py-1 text-xs font-bold text-foreground disabled:opacity-40'
            >
              {t('marketIntelligence.jobs.next')}
            </button>
          </div>
        </div>
      </section>

      <div className='grid gap-8 xl:grid-cols-[1.5fr_1fr]'>
        <section className='rounded-2xl border border-border bg-card shadow-sm'>
          <div className='border-b border-border p-6'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketIntelligence.topSkills.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketIntelligence.topSkills.subtitle')}</p>
          </div>
          <div className='max-h-[620px] overflow-auto'>
            <table className='w-full border-collapse text-left'>
              <thead className='sticky top-0 z-10'>
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
            <div className='mt-5 max-h-[320px] space-y-3 overflow-y-auto pr-1'>
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

      <MarketJobDetailDrawer
        open={Boolean(selectedJobId)}
        loading={selectedJobLoading}
        error={selectedJobError}
        job={selectedJob}
        copyState={copyState}
        onClose={() => setSelectedJobId(null)}
        onCopy={handleCopyRawContent}
        onAnalyze={handleAnalyze}
        labels={{
          close: t('marketIntelligence.jobs.close'),
          copied: t('marketIntelligence.jobs.copied'),
          copy: t('marketIntelligence.jobs.copy'),
          copyFallback: t('marketIntelligence.jobs.copyFallback'),
          analyze: t('marketIntelligence.jobs.analyze'),
          source: t('marketIntelligence.jobs.source'),
          skills: t('marketIntelligence.jobs.skills'),
          originalContent: t('marketIntelligence.jobs.originalContent'),
          openSource: t('marketIntelligence.jobs.openSource'),
          sourceUnavailable: t('marketIntelligence.jobs.sourceUnavailable')
        }}
      />
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

function DatasetFact({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className='flex items-center gap-3 rounded-xl border border-border bg-muted/20 p-4'>
      <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary'>
        <span className='material-symbols-outlined text-xl'>{icon}</span>
      </div>
      <div className='min-w-0'>
        <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label}</p>
        <p className='mt-1 truncate text-sm font-black text-foreground'>{value}</p>
      </div>
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
