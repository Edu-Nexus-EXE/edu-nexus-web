import { useTranslation } from 'react-i18next'

import type { MockUser } from '~/shared/lib/auth-session'

export function SettingsPersonalInfo({ user }: { user: MockUser }) {
  const { t } = useTranslation('dashboard')

  return (
    <section className='bg-card p-8 rounded-2xl border border-border shadow-sm'>
      <div className='flex items-center justify-between mb-8'>
        <h3 className='text-lg font-bold text-foreground'>{t('settings.personal.title')}</h3>
        <button
          type='button'
          className='text-primary text-sm font-bold hover:opacity-80 flex items-center gap-1 transition-colors'
        >
          <span className='material-symbols-outlined text-sm'>edit</span>
          {t('settings.personal.edit')}
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.fullname')}</label>
          <input
            type='text'
            defaultValue={user.name}
            className='w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-foreground'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.studentId')}</label>
          <input
            type='text'
            defaultValue='SV20210045'
            disabled
            className='w-full px-4 py-3 rounded-xl border border-border bg-muted text-muted-foreground cursor-not-allowed outline-none'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.university')}</label>
          <input
            type='text'
            defaultValue='Đại học Công nghệ TP.HCM'
            className='w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-foreground'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.major')}</label>
          <select className='w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-foreground'>
            <option>Kỹ thuật Phần mềm</option>
            <option>An toàn thông tin</option>
            <option>Trí tuệ nhân tạo</option>
            <option>Khoa học dữ liệu</option>
          </select>
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.email')}</label>
          <input
            type='email'
            defaultValue={user.email}
            className='w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-foreground'
          />
        </div>
        <div className='space-y-2'>
          <label className='text-sm font-bold text-muted-foreground'>{t('settings.personal.phone')}</label>
          <input
            type='tel'
            defaultValue='090 123 4567'
            className='w-full px-4 py-3 rounded-xl border border-border bg-card focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all outline-none text-foreground'
          />
        </div>
      </div>

      <div className='mt-10 flex justify-end'>
        <button
          type='button'
          className='px-8 py-3 bg-primary text-primary-foreground font-bold rounded-xl hover:opacity-90 hover:shadow-lg hover:shadow-primary/20 transition-all'
        >
          {t('settings.personal.save')}
        </button>
      </div>
    </section>
  )
}
