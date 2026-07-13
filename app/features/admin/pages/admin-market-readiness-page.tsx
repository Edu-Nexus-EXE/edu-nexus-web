import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useToast } from '~/shared/components'
import { Button } from '~/shared/ui'
import type { MarketCrawlerRequest, MarketJobImportRequest } from '~/shared/lib/market-intelligence-api'

import { AdminMarketJobDetailDrawer } from '../components/market/admin-market-job-detail-drawer'
import { AdminInsightTable } from '../components/market/admin-insight-table'
import {
  crawlAdminMarketJobs,
  importAdminMarketJobs,
  loadAdminCareerReadinessKpi,
  loadAdminMarketCrawlRuns,
  loadAdminMarketJobDetail,
  loadAdminMarketJobs,
  loadAdminMarketSources,
  type AdminCareerReadinessKpiView,
  type AdminMarketCrawlerSourceView,
  type AdminMarketCrawlResultView,
  type AdminMarketJobDetailView,
  type AdminMarketJobListView,
  type AdminMarketOperationResult
} from '../lib/market-readiness'

const DEMO_IMPORT_JSON = JSON.stringify(
  {
    sourceSite: 'manual_demo',
    jobs: [
      {
        sourceUrl: 'https://demo.local/jobs/backend-dotnet-01',
        jobTitle: 'Backend .NET Developer',
        companyName: 'FPT Software Demo',
        location: 'Ho Chi Minh City',
        salaryText: '20-35M VND',
        roleCategory: 'backend',
        rawContent:
          'Backend role requiring .NET, PostgreSQL, Docker, REST API, clean architecture, and cloud deployment experience.',
        postedAt: '2026-07-01T00:00:00Z',
        skills: ['.NET', 'PostgreSQL', 'Docker', 'REST API', 'Clean Architecture']
      },
      {
        sourceUrl: 'https://demo.local/jobs/frontend-react-01',
        jobTitle: 'Frontend React Developer',
        companyName: 'Edu Nexus Demo',
        location: 'Ha Noi',
        salaryText: '18-30M VND',
        roleCategory: 'frontend',
        rawContent: 'Frontend role requiring React, TypeScript, Tailwind CSS, accessibility, and API integration.',
        postedAt: '2026-07-02T00:00:00Z',
        skills: ['React', 'TypeScript', 'Tailwind CSS', 'Accessibility', 'API Integration']
      }
    ]
  },
  null,
  2
)

const adminRoleOptions = ['backend', 'frontend', 'data', 'ai', 'devops', 'mobile', 'qa', 'business-analyst']

const matchesQuery = (value: string, query: string) =>
  value.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())

export function AdminMarketReadinessPage() {
  const { t } = useTranslation('admin')
  const toast = useToast()
  const [kpi, setKpi] = useState<AdminCareerReadinessKpiView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [majorQuery, setMajorQuery] = useState('')
  const [missingSkillQuery, setMissingSkillQuery] = useState('')
  const [targetRoleQuery, setTargetRoleQuery] = useState('')
  const [selectedMajor, setSelectedMajor] = useState('')
  const [importJson, setImportJson] = useState(DEMO_IMPORT_JSON)
  const [crawler, setCrawler] = useState<MarketCrawlerRequest>({
    sourceSite: 'topcv',
    roleCategory: 'backend',
    keyword: 'backend developer',
    location: 'all',
    limit: 5
  })
  const [submittingImport, setSubmittingImport] = useState(false)
  const [submittingCrawler, setSubmittingCrawler] = useState(false)
  const [sources, setSources] = useState<AdminMarketCrawlerSourceView[]>([])
  const [crawlRuns, setCrawlRuns] = useState<AdminMarketCrawlResultView[]>([])
  const [crawlRunQuery, setCrawlRunQuery] = useState('')
  const [lastResult, setLastResult] = useState<AdminMarketOperationResult | AdminMarketCrawlResultView | null>(null)
  const [lastOperation, setLastOperation] = useState<'import' | 'crawl' | null>(null)

  const [adminJobs, setAdminJobs] = useState<AdminMarketJobListView[]>([])
  const [adminJobsLoading, setAdminJobsLoading] = useState(false)
  const [adminJobsError, setAdminJobsError] = useState('')
  const [adminJobsKeyword, setAdminJobsKeyword] = useState('')
  const [adminJobsRoleFilter, setAdminJobsRoleFilter] = useState('')
  const [adminJobsPage, setAdminJobsPage] = useState(1)
  const [adminJobsTotal, setAdminJobsTotal] = useState(0)
  const [adminJobsTotalPages, setAdminJobsTotalPages] = useState(0)
  const adminJobsPageSize = 10

  const [adminSelectedJobId, setAdminSelectedJobId] = useState<string | null>(null)
  const [adminSelectedJob, setAdminSelectedJob] = useState<AdminMarketJobDetailView | null>(null)
  const [adminSelectedJobLoading, setAdminSelectedJobLoading] = useState(false)
  const [adminSelectedJobError, setAdminSelectedJobError] = useState('')
  const [adminCopyState, setAdminCopyState] = useState<'idle' | 'copied' | 'failed'>('idle')

  const filteredCrawlRuns = useMemo(() => {
    const query = crawlRunQuery.trim().toLocaleLowerCase()
    if (!query) return crawlRuns

    return crawlRuns.filter((run) =>
      [run.sourceSite, run.status, run.requestedLocation, run.message, run.runId]
        .filter((value): value is string => Boolean(value))
        .some((value) => value.toLocaleLowerCase().includes(query))
    )
  }, [crawlRunQuery, crawlRuns])

  const refreshKpi = useCallback(() => {
    setLoading(true)
    setError('')
    loadAdminCareerReadinessKpi(selectedMajor || undefined)
      .then(setKpi)
      .catch((e) => {
        setKpi(null)
        setError((e as Error).message || t('marketReadiness.errors.load'))
      })
      .finally(() => setLoading(false))
  }, [selectedMajor, t])

  const refreshCrawlerMeta = useCallback(() => {
    Promise.all([loadAdminMarketSources(), loadAdminMarketCrawlRuns()])
      .then(([nextSources, nextRuns]) => {
        setSources(nextSources)
        setCrawlRuns(nextRuns)
        const currentSourceEnabled = nextSources.some(
          (source) => source.sourceSite === crawler.sourceSite && source.isEnabled
        )
        const firstEnabled = nextSources.find((source) => source.isEnabled)
        if (!currentSourceEnabled && firstEnabled) {
          setCrawler((current) => ({ ...current, sourceSite: firstEnabled.sourceSite }))
        }
      })
      .catch(() => {
        setSources([])
        setCrawlRuns([])
      })
  }, [crawler.sourceSite])

  useEffect(() => {
    queueMicrotask(() => refreshKpi())
  }, [refreshKpi])

  useEffect(() => {
    queueMicrotask(() => refreshCrawlerMeta())
  }, [refreshCrawlerMeta])

  const refreshAdminJobs = useCallback(() => {
    setAdminJobsLoading(true)
    setAdminJobsError('')
    loadAdminMarketJobs({
      roleCategory: adminJobsRoleFilter || null,
      keyword: adminJobsKeyword.trim() || null,
      page: adminJobsPage,
      pageSize: adminJobsPageSize
    })
      .then((result) => {
        setAdminJobs(result.items)
        setAdminJobsTotal(result.total)
        setAdminJobsTotalPages(result.totalPages)
      })
      .catch((err) => {
        setAdminJobs([])
        setAdminJobsTotal(0)
        setAdminJobsTotalPages(0)
        setAdminJobsError((err as Error).message)
      })
      .finally(() => setAdminJobsLoading(false))
  }, [adminJobsRoleFilter, adminJobsKeyword, adminJobsPage])

  useEffect(() => {
    queueMicrotask(() => refreshAdminJobs())
  }, [refreshAdminJobs])

  useEffect(() => {
    if (!adminSelectedJobId) {
      queueMicrotask(() => {
        setAdminSelectedJob(null)
        setAdminSelectedJobError('')
        setAdminCopyState('idle')
      })
      return
    }
    let cancelled = false
    queueMicrotask(() => {
      if (!cancelled) {
        setAdminSelectedJobLoading(true)
        setAdminSelectedJobError('')
        setAdminCopyState('idle')
      }
    })
    loadAdminMarketJobDetail(adminSelectedJobId)
      .then((detail) => {
        if (cancelled) return
        setAdminSelectedJob(detail)
        setAdminSelectedJobError(detail ? '' : t('marketReadiness.jobs.detailMissing'))
      })
      .catch((err) => {
        if (cancelled) return
        setAdminSelectedJob(null)
        setAdminSelectedJobError((err as Error).message)
      })
      .finally(() => {
        if (!cancelled) setAdminSelectedJobLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [adminSelectedJobId, t])

  const handleAdminCopy = async (value: string) => {
    if (typeof navigator === 'undefined' || !navigator.clipboard) {
      window.prompt(t('marketReadiness.jobs.copyFallback'), value)
      setAdminCopyState('failed')
      return
    }
    try {
      await navigator.clipboard.writeText(value)
      setAdminCopyState('copied')
      window.setTimeout(() => setAdminCopyState('idle'), 2000)
    } catch {
      window.prompt(t('marketReadiness.jobs.copyFallback'), value)
      setAdminCopyState('failed')
    }
  }

  const coveragePercent = useMemo(() => {
    if (!kpi?.totalStudents) return 0
    return Math.round((kpi.studentsWithReadinessSnapshot / kpi.totalStudents) * 100)
  }, [kpi])

  const visibleMajors = useMemo(
    () => (kpi?.byMajor ?? []).filter((row) => matchesQuery(row.major, majorQuery)),
    [kpi, majorQuery]
  )
  const visibleMissingSkills = useMemo(
    () => (kpi?.topMissingSkills ?? []).filter((row) => matchesQuery(row.skillName, missingSkillQuery)),
    [kpi, missingSkillQuery]
  )
  const visibleTargetRoles = useMemo(
    () => (kpi?.targetRoles ?? []).filter((row) => matchesQuery(row.roleCategory, targetRoleQuery)),
    [kpi, targetRoleQuery]
  )
  const majorOptions = useMemo(
    () => [
      { value: '', label: t('marketReadiness.filters.allPrograms') },
      ...(kpi?.byMajor ?? []).map((row) => ({ value: row.major, label: humanizeLabel(row.major) }))
    ],
    [kpi, t]
  )

  const lastCrawlResult = lastResult && 'status' in lastResult ? (lastResult as AdminMarketCrawlResultView) : null
  const lastImportResult = lastResult && !('status' in lastResult) ? (lastResult as AdminMarketOperationResult) : null
  const sourceOptions =
    sources.length > 0 ? sources : [{ sourceSite: 'topcv', displayName: 'TopCV', isEnabled: true, isDemoOnly: false }]
  const selectedSource = sourceOptions.find((source) => source.sourceSite === crawler.sourceSite)

  const handleImport = async () => {
    let payload: MarketJobImportRequest
    try {
      payload = JSON.parse(importJson) as MarketJobImportRequest
      if (!payload.sourceSite || !Array.isArray(payload.jobs)) {
        throw new Error(t('marketReadiness.import.invalidJson'))
      }
    } catch (e) {
      toast.error((e as Error).message || t('marketReadiness.import.invalidJson'))
      return
    }

    try {
      setSubmittingImport(true)
      const result = await importAdminMarketJobs(payload)
      setLastResult(result)
      setLastOperation('import')
      toast.success(t('marketReadiness.import.success'))
      refreshKpi()
      refreshAdminJobs()
    } catch (e) {
      toast.error((e as Error).message || t('marketReadiness.import.failed'))
    } finally {
      setSubmittingImport(false)
    }
  }

  const handleCrawler = async () => {
    try {
      setSubmittingCrawler(true)
      const result = await crawlAdminMarketJobs(crawler)
      setLastResult(result)
      setLastOperation('crawl')
      if (result.status === 'succeeded' || result.status === 'partial') {
        toast.success(t('marketReadiness.crawler.success'))
      } else if (result.status === 'blocked') {
        toast.push({ message: t('marketReadiness.crawler.blocked'), variant: 'default', ttlMs: 3500 })
      } else if (result.status === 'unsupported') {
        toast.push({ message: t('marketReadiness.crawler.unsupported'), variant: 'default', ttlMs: 3500 })
      } else {
        toast.push({ message: t('marketReadiness.crawler.noJobs'), variant: 'default', ttlMs: 3500 })
      }
      refreshKpi()
      refreshCrawlerMeta()
      refreshAdminJobs()
    } catch (e) {
      toast.error((e as Error).message || t('marketReadiness.crawler.failed'))
    } finally {
      setSubmittingCrawler(false)
    }
  }

  return (
    <div className='mx-auto w-full max-w-[1600px] space-y-8 p-6 md:p-10'>
      <header className='flex flex-col gap-5 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-xs font-bold uppercase tracking-widest text-primary'>{t('marketReadiness.eyebrow')}</p>
          <h1 className='mt-2 text-4xl font-black tracking-tight text-foreground'>{t('marketReadiness.title')}</h1>
          <p className='mt-2 max-w-3xl text-sm leading-6 text-muted-foreground'>{t('marketReadiness.subtitle')}</p>
        </div>
        <Button type='button' variant='outline' onClick={refreshKpi} disabled={loading}>
          <span className='material-symbols-outlined text-lg'>refresh</span>
          {t('marketReadiness.refresh')}
        </Button>
      </header>

      {error ? (
        <section className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </section>
      ) : null}

      <section className='grid gap-4 md:grid-cols-2 xl:grid-cols-4'>
        <KpiCard
          icon='groups'
          label={t('marketReadiness.kpi.totalStudents')}
          value={loading ? '...' : String(kpi?.totalStudents ?? 0)}
        />
        <KpiCard
          icon='fact_check'
          label={t('marketReadiness.kpi.snapshots')}
          value={loading ? '...' : String(kpi?.studentsWithReadinessSnapshot ?? 0)}
        />
        <KpiCard
          icon='rocket_launch'
          label={t('marketReadiness.kpi.averageScore')}
          value={loading ? '...' : `${kpi?.averageReadinessScore ?? 0}/100`}
        />
        <KpiCard
          icon='donut_large'
          label={t('marketReadiness.kpi.coverage')}
          value={loading ? '...' : `${coveragePercent}%`}
        />
      </section>

      <section className='grid min-w-0 gap-8 xl:grid-cols-3'>
        <AdminInsightTable
          title={t('marketReadiness.byMajor.title')}
          empty={t('marketReadiness.filters.noMatches')}
          searchLabel={t('marketReadiness.filters.searchProgram')}
          searchPlaceholder={t('marketReadiness.filters.searchProgramPlaceholder')}
          query={majorQuery}
          onQueryChange={setMajorQuery}
          headers={[
            t('marketReadiness.byMajor.major'),
            t('marketReadiness.byMajor.students'),
            t('marketReadiness.byMajor.score')
          ]}
          rows={visibleMajors.map((row) => [
            humanizeLabel(row.major),
            String(row.studentCount),
            `${row.averageReadinessScore}/100`
          ])}
        />
        <AdminInsightTable
          title={t('marketReadiness.missingSkills.title')}
          empty={t('marketReadiness.filters.noMatches')}
          searchLabel={t('marketReadiness.filters.searchSkill')}
          searchPlaceholder={t('marketReadiness.filters.searchSkillPlaceholder')}
          query={missingSkillQuery}
          onQueryChange={setMissingSkillQuery}
          filter={{
            label: t('marketReadiness.filters.program'),
            value: selectedMajor,
            options: majorOptions,
            onChange: setSelectedMajor
          }}
          headers={[
            t('marketReadiness.missingSkills.skill'),
            t('marketReadiness.missingSkills.missing'),
            t('marketReadiness.missingSkills.upgrade')
          ]}
          rows={visibleMissingSkills.map((row) => [
            row.skillName,
            String(row.missingCount),
            String(row.needsUpgradeCount)
          ])}
        />
        <AdminInsightTable
          title={t('marketReadiness.targetRoles.title')}
          empty={t('marketReadiness.filters.noMatches')}
          searchLabel={t('marketReadiness.filters.searchRole')}
          searchPlaceholder={t('marketReadiness.filters.searchRolePlaceholder')}
          query={targetRoleQuery}
          onQueryChange={setTargetRoleQuery}
          headers={[
            t('marketReadiness.targetRoles.role'),
            t('marketReadiness.targetRoles.students'),
            t('marketReadiness.targetRoles.marketJobs')
          ]}
          rows={visibleTargetRoles.map((row) => [
            humanizeLabel(row.roleCategory),
            String(row.studentCount),
            String(row.marketJobCount)
          ])}
        />
      </section>

      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.crawlRuns.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketReadiness.crawlRuns.subtitle')}</p>
          </div>
          <div className='flex flex-col gap-2 sm:flex-row sm:items-center'>
            <div className='relative min-w-0 sm:w-80'>
              <span className='material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-muted-foreground'>
                search
              </span>
              <input
                type='search'
                value={crawlRunQuery}
                onChange={(event) => setCrawlRunQuery(event.target.value)}
                aria-label={t('marketReadiness.crawlRuns.searchLabel')}
                placeholder={t('marketReadiness.crawlRuns.searchPlaceholder')}
                className='w-full rounded-xl border border-border bg-muted/20 py-2 pl-10 pr-4 text-sm font-semibold text-foreground outline-none transition focus:ring-2 focus:ring-primary/40'
              />
            </div>
            <Button type='button' variant='outline' onClick={refreshCrawlerMeta}>
              <span className='material-symbols-outlined text-lg'>history</span>
              {t('marketReadiness.crawlRuns.refresh')}
            </Button>
          </div>
        </div>
        {crawlRuns.length > 0 ? (
          <>
            <p className='mb-3 text-sm font-semibold text-muted-foreground'>
              {t('marketReadiness.crawlRuns.resultsCount', { count: filteredCrawlRuns.length })}
            </p>
            {filteredCrawlRuns.length > 0 ? (
              <div className='grid max-h-[420px] gap-3 overflow-y-auto pr-1 md:grid-cols-2 xl:grid-cols-3'>
                {filteredCrawlRuns.map((run) => (
                  <div key={run.runId} className='rounded-xl border border-border bg-muted/20 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-black text-foreground'>{humanizeLabel(run.sourceSite)}</p>
                        <p className='mt-1 text-xs font-semibold text-muted-foreground'>
                          {run.message || run.runId || '-'}
                        </p>
                      </div>
                      <span className={statusBadgeClass(run.status)}>{formatStatus(run.status, t)}</span>
                    </div>
                    <div className='mt-4 grid grid-cols-3 gap-2 text-center'>
                      <RunMetric label={t('marketReadiness.crawlRuns.parsedLabel')} value={String(run.parsedJobs)} />
                      <RunMetric
                        label={t('marketReadiness.crawlRuns.importedLabel')}
                        value={String(run.importedJobs)}
                      />
                      <RunMetric label={t('marketReadiness.crawlRuns.fetchedLabel')} value={String(run.fetchedUrls)} />
                    </div>
                    {run.message ? (
                      <p className='mt-3 line-clamp-2 text-xs leading-5 text-muted-foreground'>{run.message}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className='rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
                {t('marketReadiness.crawlRuns.noMatch')}
              </p>
            )}
          </>
        ) : (
          <p className='rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
            {t('marketReadiness.crawlRuns.empty')}
          </p>
        )}
      </section>

      <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
        <div className='flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between'>
          <div>
            <p className='text-xs font-bold uppercase tracking-widest text-primary'>
              {t('marketReadiness.jobs.eyebrow')}
            </p>
            <h2 className='mt-2 text-xl font-bold text-foreground'>{t('marketReadiness.jobs.title')}</h2>
            <p className='mt-1 max-w-3xl text-sm leading-6 text-muted-foreground'>
              {t('marketReadiness.jobs.subtitle')}
            </p>
          </div>
          <div className='grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto]'>
            <input
              type='search'
              value={adminJobsKeyword}
              onChange={(event) => {
                setAdminJobsPage(1)
                setAdminJobsKeyword(event.target.value)
              }}
              placeholder={t('marketReadiness.jobs.searchPlaceholder')}
              className='rounded-xl border border-border bg-muted/20 px-4 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
            />
            <select
              value={adminJobsRoleFilter}
              onChange={(event) => {
                setAdminJobsPage(1)
                setAdminJobsRoleFilter(event.target.value)
              }}
              className='rounded-xl border border-border bg-muted/20 px-4 py-2 text-sm font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
            >
              <option value=''>{t('marketReadiness.jobs.allRoles')}</option>
              {adminRoleOptions.map((role) => (
                <option key={role} value={role}>
                  {humanizeLabel(role)}
                </option>
              ))}
            </select>
            <Button type='button' variant='outline' onClick={refreshAdminJobs}>
              <span className='material-symbols-outlined text-lg'>refresh</span>
              {t('marketReadiness.jobs.refresh')}
            </Button>
          </div>
        </div>

        {adminJobsError ? (
          <div className='mt-5 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
            {adminJobsError}
          </div>
        ) : null}

        <div className='mt-5 max-h-[560px] overflow-auto'>
          <table className='w-full min-w-[980px] table-fixed border-collapse text-left'>
            <thead className='sticky top-0 z-10'>
              <tr className='border-b border-border bg-card text-xs font-bold uppercase tracking-widest text-muted-foreground shadow-sm'>
                <th className='w-[29%] px-5 py-3'>{t('marketReadiness.jobs.table.title')}</th>
                <th className='w-[22%] px-5 py-3'>{t('marketReadiness.jobs.table.company')}</th>
                <th className='w-[15%] px-5 py-3'>{t('marketReadiness.jobs.table.role')}</th>
                <th className='w-[10%] px-5 py-3'>{t('marketReadiness.jobs.table.length')}</th>
                <th className='w-[14%] px-5 py-3'>{t('marketReadiness.jobs.table.hash')}</th>
                <th className='w-[10%] px-5 py-3 text-right'>{t('marketReadiness.jobs.table.action')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {adminJobsLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index} className='animate-pulse'>
                    {Array.from({ length: 6 }).map((__, cell) => (
                      <td key={cell} className='px-5 py-4'>
                        <div className='h-4 rounded bg-muted' />
                      </td>
                    ))}
                  </tr>
                ))
              ) : adminJobs.length === 0 ? (
                <tr>
                  <td colSpan={6} className='px-5 py-12 text-center text-sm text-muted-foreground'>
                    {t('marketReadiness.jobs.empty')}
                  </td>
                </tr>
              ) : (
                adminJobs.map((job) => (
                  <tr key={job.id} className='align-top hover:bg-muted/20'>
                    <td className='break-words px-5 py-4'>
                      <p className='font-bold leading-6 text-foreground'>{job.jobTitle}</p>
                      <p className='mt-1 text-xs text-muted-foreground'>{job.sourceSite}</p>
                    </td>
                    <td className='break-words px-5 py-4 text-sm leading-6 text-foreground'>
                      {job.companyName ?? '-'}
                    </td>
                    <td className='break-words px-5 py-4 text-sm leading-6 text-foreground'>
                      {humanizeLabel(job.roleCategory)}
                    </td>
                    <td className='px-5 py-4 text-sm text-foreground'>{job.contentLength ?? '-'}</td>
                    <td className='px-5 py-4 font-mono text-xs text-muted-foreground'>
                      {job.rawContentHash ? `${job.rawContentHash.slice(0, 10)}...` : '-'}
                    </td>
                    <td className='px-5 py-4 text-right'>
                      <button
                        type='button'
                        onClick={() => setAdminSelectedJobId(job.id)}
                        className='inline-flex items-center gap-2 rounded-lg border border-primary/30 px-3 py-2 text-xs font-bold text-primary hover:bg-primary/5'
                      >
                        <span className='material-symbols-outlined text-base'>visibility</span>
                        {t('marketReadiness.jobs.view')}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className='mt-4 flex items-center justify-between text-sm text-muted-foreground'>
          <span>
            {t('marketReadiness.jobs.pageLabel', {
              page: adminJobsPage,
              totalPages: adminJobsTotalPages || 1,
              total: adminJobsTotal
            })}
          </span>
          <div className='flex items-center gap-2'>
            <button
              type='button'
              onClick={() => setAdminJobsPage((current) => Math.max(1, current - 1))}
              disabled={adminJobsPage <= 1 || adminJobsLoading}
              className='rounded-lg border border-border px-3 py-1 text-xs font-bold text-foreground disabled:opacity-40'
            >
              {t('marketReadiness.jobs.prev')}
            </button>
            <button
              type='button'
              onClick={() =>
                setAdminJobsPage((current) =>
                  adminJobsTotalPages && current < adminJobsTotalPages ? current + 1 : current
                )
              }
              disabled={!adminJobsTotalPages || adminJobsPage >= adminJobsTotalPages || adminJobsLoading}
              className='rounded-lg border border-border px-3 py-1 text-xs font-bold text-foreground disabled:opacity-40'
            >
              {t('marketReadiness.jobs.next')}
            </button>
          </div>
        </div>
      </section>

      <AdminMarketJobDetailDrawer
        open={Boolean(adminSelectedJobId)}
        loading={adminSelectedJobLoading}
        error={adminSelectedJobError}
        job={adminSelectedJob}
        copyState={adminCopyState}
        onClose={() => setAdminSelectedJobId(null)}
        onCopy={handleAdminCopy}
        labels={{
          close: t('marketReadiness.jobs.close'),
          copied: t('marketReadiness.jobs.copied'),
          copy: t('marketReadiness.jobs.copy'),
          copyFallback: t('marketReadiness.jobs.copyFallback'),
          source: t('marketReadiness.jobs.source'),
          skills: t('marketReadiness.jobs.skills'),
          originalContent: t('marketReadiness.jobs.originalContent'),
          openSource: t('marketReadiness.jobs.openSource'),
          sourceUnavailable: t('marketReadiness.jobs.sourceUnavailable'),
          technical: t('marketReadiness.jobs.technical'),
          hash: t('marketReadiness.jobs.hash'),
          length: t('marketReadiness.jobs.length'),
          quality: t('marketReadiness.jobs.quality')
        }}
      />

      <section className='grid min-w-0 gap-8 xl:grid-cols-[1.2fr_0.8fr]'>
        <div className='min-w-0 space-y-8'>
          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.crawler.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('marketReadiness.crawler.subtitle')}</p>

            <div className='mt-5 space-y-4'>
              <FormField label={t('marketReadiness.crawler.sourceSite')}>
                <select
                  value={crawler.sourceSite}
                  onChange={(event) => setCrawler((current) => ({ ...current, sourceSite: event.target.value }))}
                  className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
                >
                  {sourceOptions.map((source) => (
                    <option key={source.sourceSite} value={source.sourceSite} disabled={!source.isEnabled}>
                      {source.displayName}
                      {source.isDemoOnly ? ` (${t('marketReadiness.crawler.demoOnly')})` : ''}
                      {!source.isEnabled ? ` - ${t('marketReadiness.crawler.disabled')}` : ''}
                    </option>
                  ))}
                </select>
                <div className='flex min-w-0 items-start gap-2 rounded-xl border border-border bg-muted/20 p-3 text-xs text-muted-foreground'>
                  <span className='shrink-0 rounded-full bg-primary/10 px-2 py-0.5 font-black text-primary'>
                    {selectedSource?.isDemoOnly
                      ? t('marketReadiness.crawler.sourceTypeDemo')
                      : t('marketReadiness.crawler.sourceTypeReal')}
                  </span>
                  <span className='min-w-0 leading-5'>
                    {selectedSource?.isDemoOnly
                      ? t('marketReadiness.crawler.demoSourceHint')
                      : t('marketReadiness.crawler.realSourceHint')}
                  </span>
                </div>
              </FormField>
              <FormField label={t('marketReadiness.crawler.role')}>
                <input
                  value={crawler.roleCategory}
                  onChange={(event) => setCrawler((current) => ({ ...current, roleCategory: event.target.value }))}
                  className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </FormField>
              <FormField label={t('marketReadiness.crawler.keyword')}>
                <input
                  value={crawler.keyword ?? ''}
                  onChange={(event) => setCrawler((current) => ({ ...current, keyword: event.target.value }))}
                  className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </FormField>
              <FormField label={t('marketReadiness.crawler.location')}>
                <select
                  value={crawler.location ?? 'all'}
                  onChange={(event) => setCrawler((current) => ({ ...current, location: event.target.value }))}
                  className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
                >
                  {['all', 'ho-chi-minh', 'ha-noi', 'da-nang', 'can-tho', 'hai-phong', 'remote'].map((location) => (
                    <option key={location} value={location}>
                      {t(`marketReadiness.crawler.locations.${location}`)}
                    </option>
                  ))}
                </select>
              </FormField>
              <FormField label={t('marketReadiness.crawler.limit')}>
                <input
                  type='number'
                  min='1'
                  max='20'
                  value={crawler.limit ?? 5}
                  onChange={(event) =>
                    setCrawler((current) => ({ ...current, limit: Number.parseInt(event.target.value, 10) || 5 }))
                  }
                  className='w-full rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
                />
              </FormField>
              <Button
                type='button'
                className='w-full'
                onClick={() => void handleCrawler()}
                disabled={submittingCrawler}
              >
                <span className='material-symbols-outlined text-lg'>
                  {submittingCrawler ? 'progress_activity' : 'travel_explore'}
                </span>
                {submittingCrawler ? t('marketReadiness.crawler.running') : t('marketReadiness.crawler.submit')}
              </Button>
            </div>
          </div>
          <details className='group rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <summary className='flex cursor-pointer list-none items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.import.title')}</h2>
                <p className='mt-1 text-sm text-muted-foreground'>{t('marketReadiness.import.subtitle')}</p>
              </div>
              <span className='material-symbols-outlined shrink-0 text-primary transition-transform group-open:rotate-180'>
                expand_more
              </span>
            </summary>
            <div className='mt-5 space-y-4'>
              <textarea
                value={importJson}
                onChange={(event) => setImportJson(event.target.value)}
                spellCheck={false}
                className='min-h-[260px] w-full resize-y rounded-xl border border-border bg-muted/20 p-4 font-mono text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
              />
              <Button type='button' onClick={() => void handleImport()} disabled={submittingImport}>
                <span className='material-symbols-outlined text-lg'>
                  {submittingImport ? 'progress_activity' : 'upload_file'}
                </span>
                {submittingImport ? t('marketReadiness.import.running') : t('marketReadiness.import.submit')}
              </Button>
            </div>
          </details>
        </div>

        <div className='min-w-0'>
          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.result.title')}</h2>
            {lastResult ? (
              <div className='mt-5 grid grid-cols-2 gap-3'>
                <ResultItem
                  label={t('marketReadiness.result.operation')}
                  value={t(`marketReadiness.result.${lastOperation}`)}
                />
                <ResultItem
                  label={t('marketReadiness.result.sourceMode')}
                  value={lastCrawlResult?.sourceSite ?? lastImportResult?.sourceMode ?? 'unknown'}
                />
                {lastCrawlResult ? (
                  <>
                    <ResultItem
                      label={t('marketReadiness.result.status')}
                      value={formatStatus(lastCrawlResult.status, t)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.parsedJobs')}
                      value={String(lastCrawlResult.parsedJobs)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.fetchedUrls')}
                      value={String(lastCrawlResult.fetchedUrls)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.requestedLocation')}
                      value={t(`marketReadiness.crawler.locations.${lastCrawlResult.requestedLocation ?? 'all'}`, {
                        defaultValue: lastCrawlResult.requestedLocation ?? 'all'
                      })}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.searchPagesChecked')}
                      value={String(lastCrawlResult.searchPagesChecked ?? 0)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.candidateUrlsDiscovered')}
                      value={String(lastCrawlResult.candidateUrlsDiscovered ?? 0)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.detailPagesChecked')}
                      value={String(lastCrawlResult.detailPagesChecked ?? 0)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.wrongRegionPages')}
                      value={String(lastCrawlResult.wrongRegionPages ?? 0)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.rejectedPages')}
                      value={String(lastCrawlResult.rejectedPages ?? 0)}
                    />
                    <ResultItem label={t('marketReadiness.result.runId')} value={lastCrawlResult.runId || '-'} />
                  </>
                ) : null}
                <ResultItem label={t('marketReadiness.result.importedJobs')} value={String(lastResult.importedJobs)} />
                <ResultItem
                  label={t('marketReadiness.result.importedSkills')}
                  value={String(lastResult.importedSkills)}
                />
                <ResultItem label={t('marketReadiness.result.skipped')} value={String(lastResult.skippedDuplicates)} />
                {lastCrawlResult?.message ? (
                  <div className='col-span-2 rounded-xl border border-border bg-muted/20 p-4'>
                    <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                      {t('marketReadiness.result.message')}
                    </p>
                    <p className='mt-1 break-words text-sm font-semibold text-foreground'>{lastCrawlResult.message}</p>
                  </div>
                ) : null}
              </div>
            ) : (
              <p className='mt-3 rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
                {t('marketReadiness.result.empty')}
              </p>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function KpiCard({ icon, label, value }: { icon: string; label: string; value: string }) {
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

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className='block space-y-2 text-sm font-bold text-foreground'>
      <span>{label}</span>
      {children}
    </label>
  )
}

function ResultItem({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-xl border border-border bg-muted/20 p-4'>
      <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>{label}</p>
      <p className='mt-1 break-words text-lg font-black text-foreground'>{value}</p>
    </div>
  )
}

function RunMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className='rounded-lg border border-border bg-card px-3 py-2'>
      <p className='text-base font-black text-foreground'>{value}</p>
      <p className='mt-0.5 text-[11px] font-semibold text-muted-foreground'>{label}</p>
    </div>
  )
}

function humanizeLabel(value: string) {
  return value
    .replaceAll('_', ' ')
    .replaceAll('-', ' ')
    .replaceAll('|', ' / ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function formatStatus(status: string, t: (key: string, options?: { defaultValue?: string }) => string) {
  return t(`marketReadiness.runStatus.${status}`, { defaultValue: humanizeLabel(status) })
}

function statusBadgeClass(status: string) {
  const base = 'shrink-0 rounded-full px-2.5 py-1 text-xs font-black capitalize'
  if (status === 'succeeded') return `${base} bg-success/10 text-success`
  if (status === 'partial' || status === 'no_items') return `${base} bg-warning/10 text-warning`
  if (status === 'blocked' || status === 'failed' || status === 'unsupported') {
    return `${base} bg-destructive/10 text-destructive`
  }
  return `${base} bg-muted text-muted-foreground`
}
