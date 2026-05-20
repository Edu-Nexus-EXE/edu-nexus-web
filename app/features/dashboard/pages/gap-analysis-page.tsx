import { useState } from 'react'
import { useTranslation, Trans } from 'react-i18next'
import { useNavigate } from 'react-router'

import { DashboardLayout } from '../components/layout/dashboard-layout'

interface SkillItem {
  id: string
  name: string
  icon: string
  status: 'missing' | 'upgrade' | 'have'
  current: string
  required: string
  priorityScore: number
  hasPriority: boolean
  reason: string
  tags: string[]
}

export function GapAnalysisPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  const [expandedSkill, setExpandedSkill] = useState<string | null>('docker')

  const toggleDetails = (id: string) => {
    setExpandedSkill(prev => (prev === id ? null : id))
  }

  // Skills mock data
  const skillsData: SkillItem[] = [
    {
      id: 'docker',
      name: 'Docker',
      icon: 'token',
      status: 'missing',
      current: t('gapAnalysis.none'),
      required: 'Inter',
      priorityScore: 8,
      hasPriority: true,
      reason: t('gapAnalysis.dockerDesc'),
      tags: ['Containerization', 'Microservices']
    },
    {
      id: 'cicd',
      name: 'CI/CD',
      icon: 'alt_route',
      status: 'missing',
      current: t('gapAnalysis.none'),
      required: 'Basic',
      priorityScore: 7,
      hasPriority: true,
      reason: 'Thiếu kỹ năng cấu hình workflow CI/CD. Cần bổ sung để tự động hóa deployment.',
      tags: ['GitHub Actions', 'Jenkins']
    },
    {
      id: 'sql',
      name: 'SQL',
      icon: 'database',
      status: 'upgrade',
      current: 'Basic',
      required: 'Inter',
      priorityScore: 6,
      hasPriority: true,
      reason: 'Cần nâng cấp kiến thức tối ưu hóa query và indexing phức tạp.',
      tags: ['PostgreSQL', 'Query Tuning']
    },
    {
      id: 'java_oop',
      name: 'Java OOP',
      icon: 'code',
      status: 'have',
      current: 'Inter',
      required: 'Inter',
      priorityScore: 0,
      hasPriority: false,
      reason: 'Kiến thức OOP vững vàng, đáp ứng tốt yêu cầu dự án.',
      tags: ['Inheritance', 'Design Patterns']
    }
  ]

  return (
    <DashboardLayout>
      <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
        {/* Background Decorative Blobs */}
        <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
        <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

        {/* Custom gradient styles */}
        <style>{`
          .orange-gradient {
            background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
          }
          .dark .orange-gradient {
            background: linear-gradient(135deg, #38bdf8 0%, #0284c7 100%);
          }
        `}</style>

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
            <h1 className='text-3xl md:text-4xl font-bold text-foreground mb-3 font-display'>
              {t('gapAnalysis.title')}
            </h1>
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
              <div className='orange-gradient text-primary-foreground p-2 rounded-xl shadow-md shrink-0 flex items-center justify-center'>
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
                  {skillsData.map((skill) => {
                    const isExpanded = expandedSkill === skill.id
                    return (
                      <optgroup key={skill.id} className='contents'>
                        <tr
                          onClick={() => toggleDetails(skill.id)}
                          className='hover:bg-muted/30 transition-colors cursor-pointer'
                        >
                          <td className='px-6 py-5 font-bold text-foreground flex items-center gap-3 whitespace-nowrap'>
                            <div className='w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0'>
                              <span className='material-symbols-outlined text-[18px]'>{skill.icon}</span>
                            </div>
                            {skill.name}
                          </td>
                          <td className='px-6 py-5'>
                            {skill.status === 'missing' && (
                              <span className='bg-destructive/10 text-destructive px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-destructive/20'>
                                {t('gapAnalysis.status.missing')}
                              </span>
                            )}
                            {skill.status === 'upgrade' && (
                              <span className='bg-warning/10 text-warning px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-warning/20'>
                                {t('gapAnalysis.status.upgrade')}
                              </span>
                            )}
                            {skill.status === 'have' && (
                              <span className='bg-success/10 text-success px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border border-success/20'>
                                {t('gapAnalysis.status.have')}
                              </span>
                            )}
                          </td>
                          <td className='px-6 py-5 text-sm font-medium text-foreground/80'>{skill.current}</td>
                          <td className='px-6 py-5 text-sm font-bold text-foreground'>{skill.required}</td>
                          <td className='px-6 py-5'>
                            {skill.hasPriority ? (
                              <div className='flex items-center gap-2'>
                                <span className='font-bold text-primary text-sm'>{skill.priorityScore}/10</span>
                                <div className='w-16 h-1.5 bg-muted rounded-full overflow-hidden border border-border shrink-0'>
                                  <div
                                    className='h-full bg-primary rounded-full'
                                    style={{ width: `${skill.priorityScore * 10}%` }}
                                  />
                                </div>
                              </div>
                            ) : (
                              <span className='text-muted-foreground'>—</span>
                            )}
                          </td>
                          <td className='px-6 py-5 text-right'>
                            {skill.status === 'have' ? (
                              <span className='material-symbols-outlined text-success'>check_circle</span>
                            ) : (
                              <span
                                className={`material-symbols-outlined text-muted-foreground/60 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'
                                  }`}
                              >
                                expand_more
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Expandable detailed pane */}
                        {isExpanded && (
                          <tr className='bg-muted/20'>
                            <td className='px-12 py-5 border-l-4 border-primary' colSpan={6}>
                              <div className='flex items-start gap-3'>
                                <span className='material-symbols-outlined text-primary text-lg mt-0.5'>tips_and_updates</span>
                                <div className='space-y-3'>
                                  <div>
                                    <p className='text-xs font-bold uppercase tracking-widest text-muted-foreground mb-1'>
                                      {t('gapAnalysis.reasoning')}
                                    </p>
                                    <p className='text-sm text-foreground/80 italic leading-relaxed'>
                                      "{skill.reason}"
                                    </p>
                                  </div>
                                  <div className='flex flex-wrap gap-2'>
                                    {skill.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className='bg-card border border-border text-muted-foreground px-3 py-1 rounded-full text-xs font-medium'
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </optgroup>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* Row Action Buttons */}
          <div className='flex flex-col sm:flex-row justify-center gap-4 py-4'>
            <button
              onClick={() => navigate('/dashboard/roadmap')}
              className='px-8 py-4 orange-gradient text-primary-foreground rounded-xl font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all cursor-pointer text-base'
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
    </DashboardLayout>
  )
}
