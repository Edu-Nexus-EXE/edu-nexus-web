import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AuthUser } from '~/shared/lib/auth-session'

type SettingsProfilePictureProps = {
  user: AuthUser
}

export function SettingsProfilePicture({ user }: SettingsProfilePictureProps) {
  const { t } = useTranslation('settings')
  const preview = user.avatarUrl || 'https://placehold.co/240x240?text=Avatar'
  const [errored, setErrored] = useState(false)

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <h3 className='text-lg font-bold text-foreground mb-6'>{t('avatar.title')}</h3>
      <div className='flex flex-col md:flex-row items-center gap-8'>
        <div className='relative group'>
          <div className='w-36 h-36 rounded-full overflow-hidden border-4 border-card shadow-xl bg-muted'>
            {errored ? (
              <div className='w-full h-full flex items-center justify-center text-muted-foreground text-sm'>
                {t('avatar.previewFallback')}
              </div>
            ) : (
              <img
                src={preview}
                alt={t('avatar.title')}
                className='w-full h-full object-cover'
                onError={() => setErrored(true)}
                onLoad={() => setErrored(false)}
              />
            )}
          </div>
        </div>

        <div className='flex-1 w-full text-center md:text-left'>
          <h4 className='text-2xl font-bold text-foreground mb-1'>{user.fullName}</h4>
          <p className='text-muted-foreground mb-6 font-medium'>{user.email}</p>
          <div className='rounded-xl border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground text-left'>
            {t('personal.note')}
          </div>
        </div>
      </div>
    </section>
  )
}
