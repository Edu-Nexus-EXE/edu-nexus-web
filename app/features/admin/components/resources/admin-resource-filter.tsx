import { useTranslation } from 'react-i18next'

export function AdminResourceFilter() {
  const { t } = useTranslation('admin')

  return (
    <section className='bg-card rounded-2xl border border-border p-6 mb-8 shadow-sm'>
      <div className='flex flex-wrap items-center gap-6'>
        {/* Search Input */}
        <div className='flex-grow min-w-[300px] relative'>
          <span className='material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground'>
            search
          </span>
          <input
            className='w-full bg-muted border-border border rounded-xl pl-12 pr-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm'
            placeholder={t('resources.filter.search')}
            type='text'
          />
        </div>
        {/* Type Dropdown */}
        <div className='relative min-w-[180px]'>
          <select className='w-full appearance-none bg-muted border border-border rounded-xl px-4 py-3 focus:ring-2 focus:ring-primary/20 focus:border-primary text-sm pr-10 cursor-pointer'>
            <option value=''>{t('resources.filter.type')}</option>
            <option value='course'>{t('resources.filter.types.course')}</option>
            <option value='document'>{t('resources.filter.types.document')}</option>
            <option value='video'>{t('resources.filter.types.video')}</option>
            <option value='exam'>{t('resources.filter.types.exam')}</option>
          </select>
          <span className='material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground'>
            expand_more
          </span>
        </div>
        {/* Needs Review Toggle */}
        <div className='flex items-center gap-3'>
          <span className='text-sm font-semibold text-foreground'>{t('resources.filter.needsReview')}</span>
          <label className='relative inline-flex items-center cursor-pointer'>
            <input className='sr-only peer' type='checkbox' value='' />
            <div className='w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[""] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary'></div>
          </label>
        </div>
        {/* Reset Filter */}
        <button className='text-muted-foreground text-sm font-bold hover:text-primary transition-colors'>
          {t('resources.filter.clearFilters')}
        </button>
      </div>
    </section>
  )
}
