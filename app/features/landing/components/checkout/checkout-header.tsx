import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function CheckoutHeader() {
  const { t } = useTranslation('landing')

  return (
    <header className='mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4'>
      <div className='flex flex-col gap-2'>
        <div className='flex items-center gap-2 text-primary font-bold text-2xl'>
          <span className='material-symbols-outlined text-3xl'>school</span>
          <span className='tracking-tight'>Edu-Bridge</span>
        </div>
        <nav className='flex items-center gap-2 text-sm text-muted-foreground'>
          <Link to='/pricing' className='hover:text-primary transition-colors'>
            {t('checkout.header.breadcrumbPricing')}
          </Link>
          <span className='material-symbols-outlined text-xs'>chevron_right</span>
          <span className='text-foreground font-medium'>{t('checkout.header.breadcrumbCheckout')}</span>
        </nav>
      </div>
      <Link
        to='/pricing'
        className='flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm font-medium'
      >
        <span className='material-symbols-outlined text-lg'>arrow_back</span>
        {t('checkout.header.backToPricing')}
      </Link>
    </header>
  )
}
