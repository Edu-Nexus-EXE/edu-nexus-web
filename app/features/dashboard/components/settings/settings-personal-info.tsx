import { useTranslation } from 'react-i18next'

import type { AuthUser } from '~/shared/lib/auth-session'

const TIER_LABELS: Record<string, { vi: string; en: string }> = {
  free:    { vi: 'Miễn phí',  en: 'Free'    },
  starter: { vi: 'Starter',    en: 'Starter'  },
  basic:   { vi: 'Cơ bản',    en: 'Basic'    },
  pro:     { vi: 'Pro',       en: 'Pro'      },
  premium: { vi: 'Cao cấp',   en: 'Premium'  },
}

function getTierLabel(tierCode: string | undefined, lang: string): string {
  if (!tierCode) return '—'
  const key = tierCode.toLowerCase()
  const entry = TIER_LABELS[key]
  return entry ? (lang === 'vi' ? entry.vi : entry.en) : tierCode
}

export function SettingsPersonalInfo({ user }: { user: AuthUser }) {
  const { t, i18n } = useTranslation('dashboard')
  const lang = i18n.language ?? 'vi'
  const tierLabel = getTierLabel(user.subscription?.tierCode, lang)

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <h3 className='text-lg font-bold text-foreground'>{t('settings.personal.title')}</h3>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.fullname')}</label>
          <input
            type='text'
            value={user.fullName}
            readOnly
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.email')}</label>
          <input
            type='email'
            value={user.email}
            readOnly
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.role')}</label>
          <input
            type='text'
            value={user.role}
            readOnly
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed'
          />
        </div>

        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.portfolio')}</label>
          <input
            type='text'
            value={user.portfolioUrlSlug ?? ''}
            readOnly
            placeholder='—'
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-foreground outline-none cursor-not-allowed placeholder:text-muted-foreground'
          />
        </div>

        <div className='space-y-2 md:col-span-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.subscription')}</label>
          <div className='flex items-center gap-3 px-4 py-3 rounded-xl border border-border bg-muted/30'>
            <span className='material-icons text-primary text-xl'>workspace_premium</span>
            <span className='text-sm font-semibold text-foreground'>{tierLabel}</span>
          </div>
        </div>
      </div>

      <div className='mt-10 text-xs text-muted-foreground'>
        {t('settings.personal.note')}
      </div>
    </section>
  )
}
