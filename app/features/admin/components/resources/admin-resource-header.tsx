import { useTranslation } from 'react-i18next'

export function AdminResourceHeader() {
  const { t } = useTranslation('admin')

  return (
    <header className='flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4'>
      <div>
        <nav className='flex items-center gap-2 text-muted-foreground mb-2 text-xs font-semibold uppercase tracking-wider'>
          <span>Admin</span>
          <span className='material-symbols-outlined text-[12px]'>chevron_right</span>
          <span>{t('resources.breadcrumb')}</span>
        </nav>
        <h1 className='font-display-lg text-4xl font-bold text-foreground'>{t('resources.title')}</h1>
      </div>
      <button className='bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all active:scale-95'>
        <span className='material-symbols-outlined'>add</span>
        <span>{t('resources.addResource')}</span>
      </button>
    </header>
  )
}
