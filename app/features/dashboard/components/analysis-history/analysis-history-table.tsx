import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { DASHBOARD_TONE_STYLES, type DashboardTone } from '../../lib/dashboard-tone'

type AnalysisRecord = {
  id: string
  jobTitle: string
  company: string
  date: string
  matchPercent: number
  icon: string
  tone: DashboardTone
  matchTone: DashboardTone
}

const HISTORY_DATA: AnalysisRecord[] = [
  { id: '1', jobTitle: 'Kỹ sư Phần mềm', company: 'FPT Software', date: '15/10/2023', matchPercent: 85, icon: 'code', tone: 'info', matchTone: 'primary' },
  { id: '2', jobTitle: 'Data Analyst', company: 'Shopee Vietnam', date: '02/10/2023', matchPercent: 72, icon: 'data_usage', tone: 'warning', matchTone: 'primary' },
  { id: '3', jobTitle: 'Frontend Developer', company: 'VNG Corporation', date: '20/09/2023', matchPercent: 90, icon: 'web', tone: 'success', matchTone: 'primary' },
  { id: '4', jobTitle: 'Product Management Intern', company: 'Grab', date: '05/09/2023', matchPercent: 45, icon: 'inventory_2', tone: 'accent', matchTone: 'destructive' },
  { id: '5', jobTitle: 'DevOps Engineer', company: 'VNPT IT', date: '12/08/2023', matchPercent: 65, icon: 'cloud', tone: 'info', matchTone: 'primary' },
]

export function AnalysisHistoryTable() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
      <div className='overflow-x-auto'>
        <table className='w-full text-left border-collapse'>
          <thead>
            <tr className='bg-muted/50'>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('analysisHistory.table.job')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('analysisHistory.table.company')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('analysisHistory.table.date')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                {t('analysisHistory.table.match')}
              </th>
              <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right'>
                {t('analysisHistory.table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className='divide-y divide-border'>
            {HISTORY_DATA.map((record) => (
              <tr key={record.id} className='hover:bg-muted/30 transition-colors'>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-3'>
                    <div className={cn('size-8 rounded-lg flex items-center justify-center', DASHBOARD_TONE_STYLES[record.tone].icon)}>
                      <span className='material-symbols-outlined text-lg'>{record.icon}</span>
                    </div>
                    <span className='font-bold text-foreground text-sm'>{record.jobTitle}</span>
                  </div>
                </td>
                <td className='px-6 py-5'>
                  <span className='text-sm text-muted-foreground'>{record.company}</span>
                </td>
                <td className='px-6 py-5'>
                  <span className='text-sm text-muted-foreground'>{record.date}</span>
                </td>
                <td className='px-6 py-5'>
                  <div className='flex items-center gap-4'>
                    <div className='flex-1 h-2 w-24 bg-muted rounded-full overflow-hidden'>
                      <div
                        className={cn('h-full rounded-full', DASHBOARD_TONE_STYLES[record.matchTone].dot)}
                        style={{ width: `${record.matchPercent}%` }}
                      />
                    </div>
                    <span
                      className={cn(
                        'text-sm font-bold',
                        record.matchPercent >= 50
                          ? DASHBOARD_TONE_STYLES.primary.text
                          : DASHBOARD_TONE_STYLES.destructive.text
                      )}
                    >
                      {record.matchPercent}%
                    </span>
                  </div>
                </td>
                <td className='px-6 py-5 text-right'>
                  <button
                    type='button'
                    className='text-muted-foreground hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ml-auto'
                  >
                    {t('analysisHistory.table.detail')}
                    <span className='material-symbols-outlined text-sm'>open_in_new</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className='px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border'>
        <p className='text-xs text-muted-foreground font-medium'>{t('analysisHistory.pagination.info')}</p>
        <div className='flex gap-2'>
          <button type='button' className='p-1 rounded-lg border border-border hover:bg-card disabled:opacity-50' disabled>
            <span className='material-symbols-outlined text-lg'>chevron_left</span>
          </button>
          <button type='button' className='px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg'>
            1
          </button>
          <button type='button' className='px-3 py-1 text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors'>
            2
          </button>
          <button type='button' className='px-3 py-1 text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors'>
            3
          </button>
          <button type='button' className='p-1 rounded-lg border border-border hover:bg-card'>
            <span className='material-symbols-outlined text-lg'>chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
