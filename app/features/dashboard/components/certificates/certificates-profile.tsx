import { useTranslation } from 'react-i18next'

import type { MockUser } from '~/shared/lib/auth-session'

export function CertificatesProfile({ user }: { user: MockUser }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className='grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12'>
      <div className='lg:col-span-2 bg-card border border-border rounded-xl p-8 flex flex-col md:flex-row gap-8 items-center md:items-start relative overflow-hidden group'>
        <div className='absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -mr-16 -mt-16' />

        <div className='relative'>
          <div className='w-32 h-32 rounded-full border-2 border-primary p-1 shadow-md'>
            <img
              src='https://lh3.googleusercontent.com/aida-public/AB6AXuDwE_aoJoKSENxYGp7mx_DuHUBv635lcE_9SnJKF3U69markYIknKaYfQjhfHcvRWa0bRV_xBpnrwNwmoHF9SqbJsiw3v7OY7as98e0iXPzgFr1_vy2vylxtX15S1qOA5NGZE1rinj3QkxNgAvITjZ2D9oiOkxrBWno2L9fe21HwFFOkfMRIY6at-ySMPGxTL-QCpHXvL-WLWuo0hKaWFkwCPo6MIqrdSLhH-pnxRVpNaZNSUYQvVaph5cFEdXYUTnCYm-jbtz69E1R'
              alt='Student Profile'
              className='w-full h-full rounded-full object-cover'
            />
          </div>
          <div className='absolute bottom-1 right-1 w-6 h-6 bg-primary rounded-full border-4 border-card flex items-center justify-center'>
            <span className='material-symbols-outlined text-[12px] text-primary-foreground font-bold'>check</span>
          </div>
        </div>

        <div className='flex-1 text-center md:text-left'>
          <div className='flex flex-col md:flex-row md:items-center gap-3 mb-2'>
            <h2 className='text-3xl font-bold text-foreground tracking-tight'>{user.name}</h2>
            <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20'>
              {t('certificates.profile.verified')}
            </span>
          </div>
          <p className='text-muted-foreground text-lg mb-6'>
            Full Stack Developer & Cloud Enthusiast • Computer Science Senior
          </p>
          <div className='flex flex-wrap gap-4 justify-center md:justify-start'>
            <a
              href='#'
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>location_on</span>
              San Francisco, CA
            </a>
            <a
              href='#'
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>link</span>
              github.com/alexster
            </a>
            <a
              href='#'
              className='flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors'
            >
              <span className='material-symbols-outlined text-sm'>email</span>
              {user.email}
            </a>
          </div>
        </div>

        <div className='flex flex-col items-center justify-center gap-3 bg-muted/30 p-6 rounded-xl border border-border min-w-[180px]'>
          <span className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>
            {t('certificates.profile.status')}
          </span>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input type='checkbox' defaultChecked className='sr-only peer' />
            <div className="w-14 h-7 bg-muted peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-card after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-card after:border-border after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary shadow-sm" />
          </label>
          <span className='text-sm font-bold text-primary'>{t('certificates.profile.lookingForJob')}</span>
        </div>
      </div>

      <div className='bg-card border border-border rounded-xl p-8 flex flex-col justify-between'>
        <div>
          <h3 className='text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4'>
            {t('certificates.profile.center')}
          </h3>
          <p className='text-muted-foreground text-sm mb-6 leading-relaxed'>{t('certificates.profile.centerDesc')}</p>
        </div>
        <div className='flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10'>
          <span className='material-symbols-outlined text-primary'>security</span>
          <div>
            <p className='text-xs font-bold text-foreground uppercase'>{t('certificates.profile.secured')}</p>
            <p className='text-[10px] text-primary/70 font-mono'>{t('certificates.profile.hash')}</p>
          </div>
        </div>
      </div>
    </section>
  )
}
