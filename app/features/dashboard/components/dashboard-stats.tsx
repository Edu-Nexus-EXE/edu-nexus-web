import { useTranslation } from 'react-i18next'

type Stat = { icon: string; iconBg: string; iconColor: string; labelKey: string; value: string; badge?: string; badgeStyle?: string }

const STATS: Stat[] = [
  { icon: 'verified', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', labelKey: 'stats.certificates', value: '12', badge: 'stats.certificatesNew', badgeStyle: 'text-emerald-500 bg-emerald-500/10' },
  { icon: 'schedule', iconBg: 'bg-primary/10', iconColor: 'text-primary', labelKey: 'stats.studyHours', value: '48.5h', badge: 'stats.studyHoursMonth', badgeStyle: 'text-muted-foreground' },
  { icon: 'rocket_launch', iconBg: 'bg-teal-500/10', iconColor: 'text-teal-500', labelKey: 'stats.readiness', value: '75%', badge: undefined, badgeStyle: 'text-emerald-500 bg-emerald-500/10' },
  { icon: 'stars', iconBg: 'bg-amber-500/10', iconColor: 'text-amber-500', labelKey: 'stats.classRank', value: '#04', badge: 'stats.rank', badgeStyle: 'text-muted-foreground' },
]

export function DashboardStats() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {STATS.map((s) => (
        <div key={s.labelKey} className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className={`w-10 h-10 rounded-lg ${s.iconBg} flex items-center justify-center ${s.iconColor}`}>
              <span className='material-icons'>{s.icon}</span>
            </div>
            {s.badge && (
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${s.badgeStyle}`}>
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
