import { useTranslation } from 'react-i18next'

type Skill = { nameKey: string; descKey: string; icon: string; badge: string; badgeStyle: string; cardBg: string; iconColor: string }

const SKILLS: Skill[] = [
  { nameKey: 'skills.s1Name', descKey: 'skills.s1Desc', icon: 'psychology', badge: '+24%', badgeStyle: 'text-emerald-500 bg-emerald-500/10', cardBg: 'bg-primary/5 border-primary/10 hover:border-primary/30', iconColor: 'text-primary' },
  { nameKey: 'skills.s2Name', descKey: 'skills.s2Desc', icon: 'database', badge: '+18%', badgeStyle: 'text-emerald-500 bg-emerald-500/10', cardBg: 'bg-teal-500/5 border-teal-500/10 hover:border-teal-500/30', iconColor: 'text-teal-500' },
  { nameKey: 'skills.s3Name', descKey: 'skills.s3Desc', icon: 'code', badge: 'skills.s3Badge', badgeStyle: 'text-muted-foreground bg-muted', cardBg: 'bg-primary/5 border-primary/10 hover:border-primary/30', iconColor: 'text-primary' },
  { nameKey: 'skills.s4Name', descKey: 'skills.s4Desc', icon: 'cloud_queue', badge: '+12%', badgeStyle: 'text-emerald-500 bg-emerald-500/10', cardBg: 'bg-primary/5 border-primary/10 hover:border-primary/30', iconColor: 'text-primary' },
  { nameKey: 'skills.s5Name', descKey: 'skills.s5Desc', icon: 'security', badge: '+31%', badgeStyle: 'text-emerald-500 bg-emerald-500/10', cardBg: 'bg-teal-500/5 border-teal-500/10 hover:border-teal-500/30', iconColor: 'text-teal-500' },
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
            <div key={s.nameKey} className={`p-4 rounded-xl border transition-all cursor-pointer ${s.cardBg}`}>
              <div className='flex justify-between items-start mb-2'>
                <span className={`p-2 bg-card rounded-lg shadow-sm ${s.iconColor}`}>
                  <span className='material-icons text-xl'>{s.icon}</span>
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${s.badgeStyle}`}>
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
