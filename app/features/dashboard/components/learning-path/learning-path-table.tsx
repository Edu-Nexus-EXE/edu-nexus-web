import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { DASHBOARD_TONE_STYLES, type DashboardTone } from '../../lib/dashboard-tone'

type PathRecord = {
  id: string
  name: string
  desc: string
  date: string
  progress: number
  status: 'completed' | 'learning'
  icon: string
  tone: DashboardTone
}

const PATH_DATA: PathRecord[] = [
  { id: '1', name: 'Java Backend Developer', desc: 'Chuyên sâu Spring Boot & Microservices', date: '12/01/2023', progress: 100, status: 'completed', icon: 'code', tone: 'warning' },
  { id: '2', name: 'AI Research & ML', desc: 'Python, PyTorch & Deep Learning', date: '05/03/2023', progress: 100, status: 'completed', icon: 'neurology', tone: 'info' },
  { id: '3', name: 'Data Science Fundamentals', desc: 'SQL, Statistics & Visualization', date: '10/05/2023', progress: 45, status: 'learning', icon: 'database', tone: 'accent' },
  { id: '4', name: 'UI/UX Design Masterclass', desc: 'Figma, Design Systems & Handoff', date: '15/06/2023', progress: 12, status: 'learning', icon: 'palette', tone: 'success' },
]

export function LearningPathTable() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h3 className='font-bold text-lg text-foreground'>{t('learningPath.table.title')}</h3>
        <div className='flex gap-2 overflow-x-auto'>
          <button type='button' className='px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium whitespace-nowrap'>{t('learningPath.table.all')}</button>
          <button type='button' className='px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground font-medium whitespace-nowrap'>{t('learningPath.table.learning')}</button>
          <button type='button' className='px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground font-medium whitespace-nowrap'>{t('learningPath.table.completed')}</button>
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-muted/50'>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.name')}</th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.startDate')}</th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.progress')}</th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.status')}</th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right'>{t('learningPath.table.actions')}</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {PATH_DATA.map((record) => (
              <tr key={record.id} className='hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', DASHBOARD_TONE_STYLES[record.tone].icon)}>
                      <span className='material-symbols-outlined text-lg'>{record.icon}</span>
                    </div>
                    <div>
                      <p className='font-bold text-foreground'>{record.name}</p>
                      <p className='text-xs text-muted-foreground'>{record.desc}</p>
                    </div>
                  </div>
                </td>
                <td className='px-6 py-5 text-sm text-muted-foreground font-medium'>{record.date}</td>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                      <div className='h-full bg-primary rounded-full' style={{ width: `${record.progress}%` }} />
                    </div>
                    <span className='text-sm font-bold text-primary'>{record.progress}%</span>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  {record.status === 'completed' ? (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success'>
                      <span className='w-1.5 h-1.5 rounded-full bg-success mr-1.5' />
                      {t('learningPath.table.completed')}
                    </span>
                  ) : (
                    <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/10 text-warning'>
                      <span className='w-1.5 h-1.5 rounded-full bg-warning mr-1.5' />
                      {t('learningPath.table.learning')}
                    </span>
                  )}
                </td>
                <td className='px-6 py-5 text-right'>
                  {record.status === 'completed' ? (
                    <button type='button' className='text-sm font-bold text-primary hover:underline underline-offset-4'>
                      {t('learningPath.table.viewMap')}
                    </button>
                  ) : (
                    <button type='button' className='px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20'>
                      {t('learningPath.table.continue')}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className='px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between'>
        <span className='text-xs font-medium text-muted-foreground'>Hiển thị 4 trong số 12 lộ trình</span>
        <div className='flex gap-1'>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:bg-card transition-colors'>
            <span className='material-symbols-outlined text-sm'>chevron_left</span>
          </button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-primary-foreground text-xs font-bold'>1</button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:border-primary hover:text-primary hover:bg-card text-xs font-bold transition-colors'>2</button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:border-primary hover:text-primary hover:bg-card text-xs font-bold transition-colors'>3</button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:bg-card transition-colors'>
            <span className='material-symbols-outlined text-sm'>chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
