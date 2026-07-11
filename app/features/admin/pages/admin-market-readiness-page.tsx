import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useToast } from '~/shared/components'
import { Button } from '~/shared/ui'
import type { MarketCrawlerRequest, MarketJobImportRequest } from '~/shared/lib/market-intelligence-api'

import {
  crawlAdminMarketJobs,
  importAdminMarketJobs,
  loadAdminCareerReadinessKpi,
  loadAdminMarketCrawlRuns,
  loadAdminMarketSources,
  type AdminCareerReadinessKpiView,
  type AdminMarketCrawlerSourceView,
  type AdminMarketCrawlResultView,
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

export function AdminMarketReadinessPage() {
  const { t } = useTranslation('admin')
  const toast = useToast()
  const [kpi, setKpi] = useState<AdminCareerReadinessKpiView | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [importJson, setImportJson] = useState(DEMO_IMPORT_JSON)
  const [crawler, setCrawler] = useState<MarketCrawlerRequest>({
    sourceSite: 'topcv',
    roleCategory: 'backend',
    keyword: 'backend developer',
    limit: 5
  })
  const [submittingImport, setSubmittingImport] = useState(false)
  const [submittingCrawler, setSubmittingCrawler] = useState(false)
  const [sources, setSources] = useState<AdminMarketCrawlerSourceView[]>([])
  const [crawlRuns, setCrawlRuns] = useState<AdminMarketCrawlResultView[]>([])
  const [lastResult, setLastResult] = useState<AdminMarketOperationResult | AdminMarketCrawlResultView | null>(null)
  const [lastOperation, setLastOperation] = useState<'import' | 'crawl' | null>(null)

  const refreshKpi = useCallback(() => {
    setLoading(true)
    setError('')
    loadAdminCareerReadinessKpi()
      .then(setKpi)
      .catch((e) => {
        setKpi(null)
        setError((e as Error).message || t('marketReadiness.errors.load'))
      })
      .finally(() => setLoading(false))
  }, [t])

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

  const coveragePercent = useMemo(() => {
    if (!kpi?.totalStudents) return 0
    return Math.round((kpi.studentsWithReadinessSnapshot / kpi.totalStudents) * 100)
  }, [kpi])

  const lastCrawlResult = lastResult && 'status' in lastResult ? (lastResult as AdminMarketCrawlResultView) : null
  const lastImportResult = lastResult && !('status' in lastResult) ? (lastResult as AdminMarketOperationResult) : null

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
          empty={t('marketReadiness.empty')}
          headers={[
            t('marketReadiness.byMajor.major'),
            t('marketReadiness.byMajor.students'),
            t('marketReadiness.byMajor.score')
          ]}
          rows={(kpi?.byMajor ?? []).map((row) => [
            row.major,
            String(row.studentCount),
            `${row.averageReadinessScore}/100`
          ])}
        />
        <AdminInsightTable
          title={t('marketReadiness.missingSkills.title')}
          empty={t('marketReadiness.empty')}
          headers={[
            t('marketReadiness.missingSkills.skill'),
            t('marketReadiness.missingSkills.missing'),
            t('marketReadiness.missingSkills.upgrade')
          ]}
          rows={(kpi?.topMissingSkills ?? []).map((row) => [
            row.skillName,
            String(row.missingCount),
            String(row.needsUpgradeCount)
          ])}
        />
        <AdminInsightTable
          title={t('marketReadiness.targetRoles.title')}
          empty={t('marketReadiness.empty')}
          headers={[
            t('marketReadiness.targetRoles.role'),
            t('marketReadiness.targetRoles.students'),
            t('marketReadiness.targetRoles.marketJobs')
          ]}
          rows={(kpi?.targetRoles ?? []).map((row) => [
            row.roleCategory,
            String(row.studentCount),
            String(row.marketJobCount)
          ])}
        />
      </section>

      <section className='grid min-w-0 gap-8 xl:grid-cols-[1.2fr_0.8fr]'>
        <div className='min-w-0 rounded-2xl border border-border bg-card p-6 shadow-sm'>
          <div className='mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between'>
            <div>
              <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.import.title')}</h2>
              <p className='mt-1 text-sm text-muted-foreground'>{t('marketReadiness.import.subtitle')}</p>
            </div>
            <Button type='button' onClick={() => void handleImport()} disabled={submittingImport}>
              <span className='material-symbols-outlined text-lg'>
                {submittingImport ? 'progress_activity' : 'upload_file'}
              </span>
              {submittingImport ? t('marketReadiness.import.running') : t('marketReadiness.import.submit')}
            </Button>
          </div>
          <textarea
            value={importJson}
            onChange={(event) => setImportJson(event.target.value)}
            spellCheck={false}
            className='min-h-[360px] w-full resize-y rounded-xl border border-border bg-muted/20 p-4 font-mono text-sm leading-6 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40'
          />
        </div>

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
                  {(sources.length > 0
                    ? sources
                    : [{ sourceSite: 'topcv', displayName: 'TopCV', isEnabled: true, isDemoOnly: false }]
                  ).map((source) => (
                    <option key={source.sourceSite} value={source.sourceSite} disabled={!source.isEnabled}>
                      {source.displayName}
                      {source.isDemoOnly ? ` (${t('marketReadiness.crawler.demoOnly')})` : ''}
                      {!source.isEnabled ? ` - ${t('marketReadiness.crawler.disabled')}` : ''}
                    </option>
                  ))}
                </select>
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
                      value={formatStatus(lastCrawlResult.status)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.parsedJobs')}
                      value={String(lastCrawlResult.parsedJobs)}
                    />
                    <ResultItem
                      label={t('marketReadiness.result.fetchedUrls')}
                      value={String(lastCrawlResult.fetchedUrls)}
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

          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
            <div className='mb-4 flex items-center justify-between gap-3'>
              <h2 className='text-xl font-bold text-foreground'>{t('marketReadiness.crawlRuns.title')}</h2>
              <Button type='button' variant='outline' onClick={refreshCrawlerMeta}>
                <span className='material-symbols-outlined text-lg'>history</span>
                {t('marketReadiness.crawlRuns.refresh')}
              </Button>
            </div>
            {crawlRuns.length > 0 ? (
              <div className='space-y-3'>
                {crawlRuns.slice(0, 5).map((run) => (
                  <div key={run.runId} className='rounded-xl border border-border bg-muted/20 p-4'>
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <p className='truncate text-sm font-black text-foreground'>{run.sourceSite}</p>
                        <p className='mt-1 line-clamp-2 text-xs text-muted-foreground'>{run.message || run.runId}</p>
                      </div>
                      <span className={statusBadgeClass(run.status)}>{formatStatus(run.status)}</span>
                    </div>
                    <div className='mt-3 grid grid-cols-3 gap-2 text-xs font-semibold text-muted-foreground'>
                      <span>{t('marketReadiness.crawlRuns.parsed', { count: run.parsedJobs })}</span>
                      <span>{t('marketReadiness.crawlRuns.imported', { count: run.importedJobs })}</span>
                      <span>{t('marketReadiness.crawlRuns.fetched', { count: run.fetchedUrls })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className='rounded-xl border border-dashed border-border bg-muted/20 p-5 text-sm text-muted-foreground'>
                {t('marketReadiness.crawlRuns.empty')}
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

function AdminInsightTable({
  title,
  headers,
  rows,
  empty
}: {
  title: string
  headers: string[]
  rows: string[][]
  empty: string
}) {
  return (
    <div className='min-w-0 rounded-2xl border border-border bg-card shadow-sm'>
      <div className='border-b border-border p-5'>
        <h2 className='text-lg font-bold text-foreground'>{title}</h2>
      </div>
      <div className='overflow-x-auto'>
        <table className='w-full text-left text-sm'>
          <thead>
            <tr className='border-b border-border bg-muted/40 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
              {headers.map((header) => (
                <th key={header} className='px-5 py-3'>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {rows.length > 0 ? (
              rows.map((row) => (
                <tr key={row.join('|')} className='hover:bg-muted/20'>
                  {row.map((cell, index) => (
                    <td key={`${cell}-${index}`} className='px-5 py-4 font-semibold text-foreground'>
                      {cell}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className='px-5 py-6 text-center text-sm text-muted-foreground'>
                  {empty}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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

function formatStatus(status: string) {
  return status.replaceAll('_', ' ')
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
