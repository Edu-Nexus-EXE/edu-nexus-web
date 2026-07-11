import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadCurrentUser, loadDashboardRoadmaps } from '../../lib/sprint2-api'
import { loadUserReadiness } from '../../lib/market-intelligence'

export function DashboardStats() {
  const { t } = useTranslation('dashboard')
  const [studyHours, setStudyHours] = useState('--')
  const [readiness, setReadiness] = useState('--')
  const [classRank, setClassRank] = useState('--')
  const [certificates, setCertificates] = useState('--')

  useEffect(() => {
    let cancelled = false

    Promise.all([loadCurrentUser(), loadDashboardRoadmaps('active'), loadUserReadiness()])
      .then(([user, roadmaps, readinessResult]) => {
        if (cancelled) return

        const tier = user?.subscription?.tierCode?.toLowerCase() ?? 'free'
        setCertificates(String(user?.portfolioUrlSlug ? 1 : 0))
        setStudyHours(tier === 'premium' ? '20+' : tier === 'pro' ? '10-20' : '5-10')
        setReadiness(
          String(readinessResult.data?.score ?? Math.min(100, Math.max(50, roadmaps.data?.[0]?.progress ?? 65)))
        )
        setClassRank(tier === 'premium' ? 'A' : tier === 'pro' ? 'B' : 'C')
      })
      .catch(() => {
        if (cancelled) return
        setCertificates('--')
        setStudyHours('--')
        setReadiness('--')
        setClassRank('--')
      })

    return () => {
      cancelled = true
    }
  }, [])

  const stats = [
    {
      icon: 'verified',
      labelKey: 'stats.certificates',
      value: certificates,
      badge: 'stats.certificatesNew',
      badgeTone: 'success' as const,
      tone: 'info' as const
    },
    {
      icon: 'schedule',
      labelKey: 'stats.studyHours',
      value: studyHours,
      badge: 'stats.studyHoursMonth',
      badgeTone: 'muted' as const,
      tone: 'primary' as const
    },
    { icon: 'rocket_launch', labelKey: 'stats.readiness', value: readiness, tone: 'success' as const },
    {
      icon: 'stars',
      labelKey: 'stats.classRank',
      value: classRank,
      badge: 'stats.rank',
      badgeTone: 'muted' as const,
      tone: 'warning' as const
    }
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
      {stats.map((s) => (
        <div key={s.labelKey} className='bg-card p-6 rounded-2xl border border-border shadow-sm'>
          <div className='flex items-center justify-between mb-4'>
            <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-muted/50'>
              <span className='material-icons'>{s.icon}</span>
            </div>
            {s.badge ? (
              <span className='text-xs font-medium px-2 py-1 rounded-full text-muted-foreground bg-muted'>
                {t(s.badge)}
              </span>
            ) : null}
          </div>
          <p className='text-muted-foreground text-sm'>{t(s.labelKey)}</p>
          <p className='text-2xl font-bold text-foreground'>{s.value}</p>
        </div>
      ))}
    </div>
  )
}
