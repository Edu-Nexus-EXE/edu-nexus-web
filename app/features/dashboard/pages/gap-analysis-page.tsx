import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate } from 'react-router'

import { SkillRow } from '../components/gap-analysis/skill-row'
import { getGapAnalysisSkills } from '../lib/gap-analysis-data'

export function GapAnalysisPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  const [expandedSkill, setExpandedSkill] = useState<string | null>('docker')

  const toggleDetails = (id: string) => {
    setExpandedSkill((prev) => (prev === id ? null : id))
  }

  const skillsData = getGapAnalysisSkills(t)

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      {/* Background Decorative Blobs */}
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      {/* Header / Meta */}
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
          </div>
        </div>
        <div className='flex gap-3 shrink-0'>
          <button className='px-5 py-2.5 bg-card border border-border text-foreground hover:bg-muted font-bold rounded-full transition-all duration-200 active:scale-95 flex items-center gap-2 cursor-pointer text-sm shadow-sm'>
            <span className='material-symbols-outlined text-lg'>download</span>
            {t('gapAnalysis.exportPdf')}
          </button>
        </div>
      </header>

      <div className='space-y-8'>
        {/* Action Plan Summary Box */}
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
                    1: <span className='font-bold text-primary' />
                  }}
                />
              </p>
            </div>
          </div>
        </section>

        {/* Detailed Table Section */}
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
                {skillsData.map((skill) => (
                  <SkillRow
                    key={skill.id}
                    skill={skill}
                    isExpanded={expandedSkill === skill.id}
                    onToggle={toggleDetails}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Row Action Buttons */}
        <div className='flex flex-col sm:flex-row justify-center gap-4 py-4'>
          <button
            onClick={() => navigate('/dashboard/roadmap')}
            className='px-8 py-4 gradient-primary text-primary-foreground rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-base'
          >
            {t('gapAnalysis.createRoadmap')}
          </button>
          <button
            onClick={() => navigate('/dashboard/roadmap')}
            className='px-8 py-4 bg-card border-2 border-primary text-primary hover:bg-primary/5 rounded-xl font-bold transition-all active:scale-95 cursor-pointer text-base'
          >
            {t('gapAnalysis.viewRoadmap')}
          </button>
        </div>
      </div>
    </div>
  )
}
