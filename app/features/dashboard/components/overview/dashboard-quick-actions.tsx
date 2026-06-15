import { Link } from 'react-router'
import { useTranslation } from 'react-i18next'

type QuickAction = {
  key: string
  to: string
  icon: string
  accent: string
}

const ACTIONS: QuickAction[] = [
  { key: 'submitJd', to: '/dashboard/jd/new', icon: 'note_add', accent: 'from-primary/15 to-primary/5 text-primary' },
  { key: 'roadmap', to: '/roadmaps', icon: 'route', accent: 'from-info/15 to-info/5 text-info' },
  { key: 'careerTrack', to: '/career-tracks', icon: 'workspaces', accent: 'from-success/15 to-success/5 text-success' },
  { key: 'portfolio', to: '/dashboard/portfolio', icon: 'badge', accent: 'from-warning/15 to-warning/5 text-warning' },
]

export function DashboardQuickActions() {
  const { t } = useTranslation('dashboard')

  return (
    <section>
      <h2 className='sr-only'>{t('quickActions.title')}</h2>
      <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
        {ACTIONS.map((action) => (
          <Link
            key={action.key}
            to={action.to}
            className='group rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:border-primary/30 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'
          >
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br ${action.accent}`}>
              <span className='material-icons'>{action.icon}</span>
            </div>
            <p className='mt-4 text-sm font-bold text-foreground'>{t(`quickActions.${action.key}.title`)}</p>
            <p className='mt-1 text-xs text-muted-foreground'>{t(`quickActions.${action.key}.desc`)}</p>
            <span className='mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary opacity-0 transition-opacity group-hover:opacity-100'>
              {t('quickActions.go')}
              <span className='material-icons text-sm'>arrow_forward</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
