import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { Trans, useTranslation } from 'react-i18next'

import { SkillRow } from '../components/gap-analysis/skill-row'
import { loadGapAnalysis, triggerGapAnalysis } from '../lib/sprint2-api'
import { type GapAnalysisSkill } from '../lib/gap-analysis-data'

export function GapAnalysisPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const jdIdFromQuery = searchParams.get('jdId') ?? 'latest'

  const [expandedSkill, setExpandedSkill] = useState<string | null>(null)
  const [skills, setSkills] = useState<GapAnalysisSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [polling, setPolling] = useState(false)

  const toggleDetails = (id: string) => {
    setExpandedSkill((prev) => (prev === id ? null : id))
  }

  useEffect(() => {
    let cancelled = false

    setTimeout(() => {
      if (!cancelled) { setLoading(true); setError('') }
    }, 0)

    async function run() {
      try {
        const res = await loadGapAnalysis(jdIdFromQuery)
        if (cancelled) return

        if (res.data && res.data.length > 0) {
          setSkills(res.data)
          setExpandedSkill((current) => current ?? res.data?.[0]?.id ?? null)
        } else {
          setSkills([])
          setExpandedSkill(null)
          if (!jdIdFromQuery || jdIdFromQuery === 'latest') {
            setError(t('gapAnalysis.empty'))
          }
        }
      } catch (e) {
        if (cancelled) return
        setError((e as Error).message || t('gapAnalysis.loadFailed'))
        setSkills([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void run()
    return () => { cancelled = true }
  }, [jdIdFromQuery, t])

  const hasData = skills.length > 0
  const summary = useMemo(() => {
    const total = skills.length
    const missing = skills.filter((s) => s.status === 'missing').length
    const upgrade = skills.filter((s) => s.status === 'upgrade').length
    const have = skills.filter((s) => s.status === 'have').length
    return { total, missing, upgrade, have }
  }, [skills])

  const onCreateAnalysis = async () => {
    if (!jdIdFromQuery) return
    try {
      setRefreshing(true)
      setError('')
      setPolling(true)
      await triggerGapAnalysis(jdIdFromQuery)
      const res = await loadGapAnalysis(jdIdFromQuery)
      setSkills(res.data ?? [])
      setExpandedSkill((current) => current ?? res.data?.[0]?.id ?? null)
    } catch (e) {
      setError((e as Error).message || t('gapAnalysis.loadFailed'))
    } finally {
      setRefreshing(false)
      setPolling(false)
    }
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      <header className='mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-6'>
        <div>
          <button
            onClick={() => navigate(-1)}
            className='mb-4 text-xs font-bold text-primary flex items-center gap-1 hover:underline cursor-pointer'
          >
            <span className='material-symbols-outlined text-sm'>arrow_back</span>
            {t('gapAnalysis.back')}
          </button>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground mb-3 font-display'>{t('gapAnalysis.title')}</h1>
          <div className='flex flex-wrap items-center gap-4 text-sm text-muted-foreground'>
            <span className='bg-primary/10 text-primary px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider'>
              {t('gapAnalysis.version', { version: 2 })}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-base'>calendar_month</span>
              {t('gapAnalysis.updated', { date: '15/05/2025' })}
            </span>
            <span className='flex items-center gap-1.5'>
              <span className='material-symbols-outlined text-base'>analytics</span>
              {t('gapAnalysis.source', { percent: 72 })}
            </span>
            {polling ? <span className='text-primary font-semibold'>{t('gapAnalysis.loading')}</span> : null}
          </div>
        </div>
        <div className='flex gap-3 shrink-0'>
          <button
            onClick={() => void onCreateAnalysis()}
            disabled={refreshing || !jdIdFromQuery}
            className='px-5 py-2.5 bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50 font-bold rounded-full transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer text-sm shadow-sm'
          >
            <span className='material-symbols-outlined text-lg'>replay</span>
            {t('gapAnalysis.createRoadmap')}
          </button>
        </div>
      </header>

      <div className='space-y-8'>
        {error ? (
          <section className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
            {error}
          </section>
        ) : null}

        {loading ? (
          <section className='rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground'>
            {t('gapAnalysis.loading')}
          </section>
        ) : null}

        {hasData ? (
          <section className='bg-primary/5 border-l-8 border-primary p-6 rounded-r-2xl shadow-sm border border-border border-y-0 border-r-0'>
            <div className='flex items-start gap-4'>
              <div className='gradient-primary text-primary-foreground p-2 rounded-xl shadow-md shrink-0 flex items-center justify-center'>
                <span className='material-symbols-outlined text-[20px]'>priority_high</span>
              </div>
              <div className='space-y-1.5'>
                <h3 className='text-lg font-bold text-foreground'>{t('gapAnalysis.summaryTitle')}</h3>
                <p className='text-sm text-muted-foreground leading-relaxed'>
                  <Trans
                    t={t}
                    i18nKey='gapAnalysis.summaryDesc'
                    components={{
                      1: <span className='font-bold text-primary' />,
                    }}
                    values={{
                      total: summary.total,
                      missing: summary.missing,
                      upgrade: summary.upgrade,
                      have: summary.have,
                    }}
                  />
                </p>
              </div>
            </div>
          </section>
        ) : null}

        <section className='bg-card rounded-xl border border-border shadow-sm overflow-hidden'>
          <div className='p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <h2 className='text-lg font-bold text-foreground'>{t('gapAnalysis.tableTitle')}</h2>
            <div className='flex flex-wrap items-center gap-4 text-xs font-semibold'>
              <span className='flex items-center gap-1.5'>
                <span className='w-2.5 h-2.5 rounded-full bg-destructive'></span>
                {t('gapAnalysis.status.missing')}
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='w-2.5 h-2.5 rounded-full bg-warning'></span>
                {t('gapAnalysis.status.upgrade')}
              </span>
              <span className='flex items-center gap-1.5'>
                <span className='w-2.5 h-2.5 rounded-full bg-success'></span>
                {t('gapAnalysis.status.have')}
              </span>
            </div>
          </div>

          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-muted/40 text-muted-foreground text-xs font-bold uppercase tracking-wider border-b border-border'>
                  <th className='px-6 py-4'>{t('gapAnalysis.headers.skill')}</th>
                  <th className='px-6 py-4'>{t('gapAnalysis.headers.status')}</th>
                  <th className='px-6 py-4'>{t('gapAnalysis.headers.current')}</th>
                  <th className='px-6 py-4'>{t('gapAnalysis.headers.required')}</th>
                  <th className='px-6 py-4'>{t('gapAnalysis.headers.priority')}</th>
                  <th className='px-6 py-4'></th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {skills.map((skill) => (
                  <SkillRow key={skill.id} skill={skill} isExpanded={expandedSkill === skill.id} onToggle={toggleDetails} />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {!hasData && !loading ? (
          <section className='rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground'>
            {t('gapAnalysis.empty')}
          </section>
        ) : null}

        <div className='flex flex-col sm:flex-row justify-center gap-4 py-4'>
          <button
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className='px-8 py-4 gradient-primary text-primary-foreground rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-base'
          >
            {t('gapAnalysis.createRoadmap')}
          </button>
          <button
            onClick={() => navigate('/dashboard/learning/roadmap')}
            className='px-8 py-4 bg-card border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-base'
          >
            {t('gapAnalysis.viewRoadmap')}
          </button>
        </div>
      </div>
    </div>
  )
}
