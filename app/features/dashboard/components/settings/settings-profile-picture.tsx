import { useTranslation } from 'react-i18next'

import type { AuthUser } from '~/shared/lib/auth-session'

export function SettingsProfilePicture({ user }: { user: AuthUser }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <h3 className='text-lg font-bold text-foreground mb-6'>{t('settings.avatar.title')}</h3>
      <div className='flex flex-col md:flex-row items-center gap-8'>
        <div className='relative group'>
          <div className='w-36 h-36 rounded-full overflow-hidden border-4 border-card shadow-xl bg-muted'>
            <img
              src={
                user.avatarUrl ||
                'https://lh3.googleusercontent.com/aida-public/AB6AXuAHV018Vo5tFonRZlkYOB3itMDaVxi2V1_So9xOw4Yu7dVZJGPQnWMEYbaP-vySxEMxEw8CsLwrjp65PlS4ZZ7LB0ol2-rDjOXm4uPo_mGOeMAxl66x3vkyh-vxd1m5F9hkmriyFCEC8VmzVFcrEq7nAU6FLGFF37Ysz5MG3SDVb9n7lNA5VVf_wsXT160YWMcK5zL1Fj3ewEBDwOF39MWLrU7vjnSNkIAEYZmi36LGPa5T8VYoAABqFP2-AUric3gO1XBpsBi05ylq'
              }
              alt='Profile Display'
              className='w-full h-full object-cover'
            />
          </div>
          <button
            type='button'
            className='absolute bottom-1 right-1 p-2.5 bg-primary text-primary-foreground rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center'
          >
            <span className='material-symbols-outlined text-base'>photo_camera</span>
          </button>
        </div>

        <div className='flex-1 text-center md:text-left'>
          <h4 className='text-2xl font-bold text-foreground mb-1'>{user.fullName}</h4>
          <p className='text-muted-foreground mb-6 font-medium'>{user.email}</p>
          <div className='flex flex-wrap justify-center md:justify-start gap-3'>
            <button
              type='button'
              className='px-6 py-2.5 bg-primary text-primary-foreground text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-md shadow-primary/20'
            >
              {t('settings.avatar.change')}
            </button>
            <button
              type='button'
              className='px-6 py-2.5 bg-muted border border-border text-foreground text-sm font-bold rounded-xl hover:bg-muted/80 transition-colors'
            >
              {t('settings.avatar.remove')}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
