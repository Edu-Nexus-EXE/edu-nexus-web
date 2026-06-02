import { useTranslation } from 'react-i18next'

import { getAuthSession } from '~/shared/lib/auth-session'
import { LanguageSwitcher } from '~/shared/components/language-switcher'

export function AdminHeader() {
  const { t } = useTranslation('admin')
  const user = getAuthSession()?.user

  return (
    <header className='h-20 border-b border-border px-8 flex items-center justify-between sticky top-0 bg-card/80 backdrop-blur-md z-40'>
      <div>
        <h1 className='text-2xl font-bold text-foreground'>{t('header.title')}</h1>
        <p className='text-sm text-muted-foreground'>{t('header.subtitle')}</p>
      </div>
      <div className='flex items-center gap-4'>
        <div className='relative hidden sm:block'>
          <span className='material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-lg'>
            search
          </span>
          <input
            className='bg-muted border-none rounded-full py-2 pl-10 pr-4 text-sm w-64 focus:ring-2 focus:ring-primary/50 transition-all'
            placeholder={t('header.searchPlaceholder')}
            type='text'
          />
        </div>
        <button className='w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors'>
          <span className='material-symbols-outlined text-xl'>notifications</span>
        </button>
        <LanguageSwitcher />

        <div className='flex items-center gap-3 pl-4 border-l border-border'>
          <div className='text-right hidden sm:block'>
            <p className='text-sm font-semibold text-foreground'>{user?.fullName || t('header.defaultUser')}</p>
            <p className='text-xs text-muted-foreground'>{user?.role || t('header.defaultPlan')}</p>
          </div>
          <img
            alt='Admin Avatar'
            className='w-10 h-10 rounded-full object-cover ring-2 ring-primary/20'
            src={
              user?.avatarUrl ||
              'https://lh3.googleusercontent.com/aida-public/AB6AXuDPRGXULQKHmAiiNBm-xsyPUS1_8jSLbsyqB0e4SOhBrMRmEuuYnoXJNejgU1vA_Sc3nFJxigl7WWDiMGFpCE7VbKP33jdI67kA0YrsU52RCpSxF84zcYOvkSv9Q0xWqCQgg_DueiEBnk_AUof4iAlBXxnd-AnRUxdQ9qn70KlxsxT6xxdKiTR0ziYRj5hiUtfvhPvGn1_Li3ElZgC2bWP0exj46Wf6DcKyTLomVah3CPkM4F6VUyVRwIpqCvNZgpqafdw8Out-8nIq'
            }
          />
        </div>
      </div>
    </header>
  )
}
