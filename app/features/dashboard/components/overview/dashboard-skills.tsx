import { useTranslation } from 'react-i18next'

import { cn } from '~/shared/lib/cn'

import { DASHBOARD_TONE_STYLES, type DashboardTone } from '../../lib/dashboard-tone'

type Skill = {
  nameKey: string
  descKey: string
  icon: string
  badge: string
  badgeTone: DashboardTone | 'muted'
  cardTone: DashboardTone
}

const SKILLS: Skill[] = [
  { nameKey: 'skills.s1Name', descKey: 'skills.s1Desc', icon: 'psychology', badge: '+24%', badgeTone: 'success', cardTone: 'primary' },
  { nameKey: 'skills.s2Name', descKey: 'skills.s2Desc', icon: 'database', badge: '+18%', badgeTone: 'success', cardTone: 'success' },
  { nameKey: 'skills.s3Name', descKey: 'skills.s3Desc', icon: 'code', badge: 'skills.s3Badge', badgeTone: 'muted', cardTone: 'primary' },
  { nameKey: 'skills.s4Name', descKey: 'skills.s4Desc', icon: 'cloud_queue', badge: '+12%', badgeTone: 'success', cardTone: 'primary' },
  { nameKey: 'skills.s5Name', descKey: 'skills.s5Desc', icon: 'security', badge: '+31%', badgeTone: 'success', cardTone: 'success' },
]

export function DashboardSkills() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='bg-card rounded-2xl border border-border p-8 shadow-sm'>
      <div className='flex items-center justify-between mb-6'>
        <div>
          <h2 className='text-xl font-bold text-foreground'>{t('skills.title')}</h2>
          <p className='text-sm text-muted-foreground'>{t('skills.subtitle')}</p>
        </div>
        <div className='flex gap-2'>
          <button type='button' className='p-2 border border-border rounded-lg hover:bg-muted'>
            <span className='material-icons text-sm'>chevron_left</span>
          </button>
          <button type='button' className='p-2 border border-border rounded-lg hover:bg-muted'>
            <span className='material-icons text-sm'>chevron_right</span>
          </button>
        </div>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {SKILLS.map((s) => {
          const badgeText = s.badge.startsWith('skills.') ? t(s.badge) : s.badge
          return (
            <div
              key={s.nameKey}
              className={cn('p-4 rounded-xl border transition-all cursor-pointer', DASHBOARD_TONE_STYLES[s.cardTone].card)}
            >
              <div className='flex justify-between items-start mb-2'>
                <span className={cn('p-2 bg-card rounded-lg shadow-sm', DASHBOARD_TONE_STYLES[s.cardTone].text)}>
                  <span className='material-icons text-xl'>{s.icon}</span>
                </span>
                <span
                  className={cn(
                    'text-[10px] font-bold px-1.5 py-0.5 rounded uppercase',
                    s.badgeTone === 'muted'
                      ? 'text-muted-foreground bg-muted'
                      : DASHBOARD_TONE_STYLES[s.badgeTone].badge
                  )}
                >
                  {badgeText}
                </span>
              </div>
              <h3 className='font-bold text-sm mb-1 text-foreground'>{t(s.nameKey)}</h3>
              <p className='text-[11px] text-muted-foreground'>{t(s.descKey)}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
