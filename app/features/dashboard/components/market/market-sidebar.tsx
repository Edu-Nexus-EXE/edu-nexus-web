import { useTranslation } from 'react-i18next'

export function MarketSidebar() {
  const { t } = useTranslation('dashboard')

  return (
    <aside className='hidden lg:block w-64 flex-shrink-0'>
      <div className='sticky top-32 space-y-10'>
        {/* Field */}
        <div>
          <h3 className='text-xs font-bold text-foreground uppercase tracking-widest mb-5'>
            {t('market.filters.field')}
          </h3>
          <div className='space-y-3'>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                defaultChecked
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Khoa học máy tính & AI
              </span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Khoa học dữ liệu
              </span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Kỹ thuật phần mềm
              </span>
            </label>
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className='text-xs font-bold text-foreground uppercase tracking-widest mb-5'>
            {t('market.filters.location')}
          </h3>
          <div className='space-y-3'>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                defaultChecked
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Việt Nam
              </span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Singapore
              </span>
            </label>
            <label className='flex items-center gap-3 cursor-pointer group'>
              <input
                type='checkbox'
                className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
              />
              <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                Australia
              </span>
            </label>
          </div>
        </div>
      </div>
    </aside>
  )
}
