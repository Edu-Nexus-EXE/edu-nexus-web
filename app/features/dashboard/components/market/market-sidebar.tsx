import { useTranslation } from 'react-i18next'

const FIELD_FILTER_KEYS = [
  'market.filters.fieldOptions.csAi',
  'market.filters.fieldOptions.dataScience',
  'market.filters.fieldOptions.softwareEngineering'
] as const

const LOCATION_FILTER_KEYS = [
  'market.filters.locationOptions.vietnam',
  'market.filters.locationOptions.singapore',
  'market.filters.locationOptions.australia'
] as const

export function MarketSidebar() {
  const { t } = useTranslation('dashboard')

  return (
    <aside className='hidden lg:block w-64 flex-shrink-0'>
      <div className='sticky top-32 space-y-10'>
        <div>
          <h3 className='text-xs font-bold text-foreground uppercase tracking-widest mb-5'>
            {t('market.filters.field')}
          </h3>
          <div className='space-y-3'>
            {FIELD_FILTER_KEYS.map((key, index) => (
              <label key={key} className='flex items-center gap-3 cursor-pointer group'>
                <input
                  type='checkbox'
                  defaultChecked={index === 0}
                  className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
                />
                <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                  {t(key)}
                </span>
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className='text-xs font-bold text-foreground uppercase tracking-widest mb-5'>
            {t('market.filters.location')}
          </h3>
          <div className='space-y-3'>
            {LOCATION_FILTER_KEYS.map((key, index) => (
              <label key={key} className='flex items-center gap-3 cursor-pointer group'>
                <input
                  type='checkbox'
                  defaultChecked={index === 0}
                  className='w-4 h-4 rounded border-border text-primary focus:ring-primary/30 bg-card'
                />
                <span className='text-sm font-medium text-muted-foreground group-hover:text-primary transition-colors'>
                  {t(key)}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}
