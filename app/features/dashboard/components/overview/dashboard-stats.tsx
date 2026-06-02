import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { DASHBOARD_TONE_STYLES, type DashboardTone } from '../../lib/dashboard-tone'

type Stat = {
  icon: string
  tone: DashboardTone
  labelKey: string
  value: string
  badge?: string
  badgeTone?: DashboardTone | 'muted'
}

const STATS: Stat[] = [
  { icon: 'verified', tone: 'info', labelKey: 'stats.certificates', value: '--', badge: 'stats.certificatesNew', badgeTone: 'success' },
  { icon: 'schedule', tone: 'primary', labelKey: 'stats.studyHours', value: '--', badge: 'stats.studyHoursMonth', badgeTone: 'muted' },
  { icon: 'rocket_launch', tone: 'success', labelKey: 'stats.readiness', value: '--' },
  { icon: 'stars', tone: 'warning', labelKey: 'stats.classRank', value: '--', badge: 'stats.rank', badgeTone: 'muted' },
]

export function DashboardStats() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {STATS.map((s) => (
        <div key={s.labelKey} className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', DASHBOARD_TONE_STYLES[s.tone].icon)}>
              <span className='material-icons'>{s.icon}</span>
            </div>
            {s.badge && (
              <span
                className={cn(
                  'text-xs font-medium px-2 py-1 rounded-full',
                  s.badgeTone === 'muted'
                    ? 'text-muted-foreground bg-muted'
                    : DASHBOARD_TONE_STYLES[s.badgeTone ?? s.tone].badge
                )}
              >
                {t(s.badge)}
              </span>
            )}
          </div>
          <p className='text-muted-foreground text-sm'>{t(s.labelKey)}</p>
          <p className='text-2xl font-bold text-foreground'>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
