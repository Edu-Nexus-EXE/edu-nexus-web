import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function CheckoutOrderSummary() {
  const { t } = useTranslation('landing')

  return (
    <aside className='lg:col-span-5 flex flex-col gap-6'>
      <div className='bg-card p-6 md:p-8 rounded-xl border border-border shadow-lg sticky top-8'>
        <h2 className='text-xl font-bold mb-6 pb-4 border-b border-border text-foreground'>{t('checkout.summary.title')}</h2>

        <div className='mb-6 p-4 rounded-lg bg-primary/5 border border-primary/10'>
          <div className='flex justify-between items-start mb-2'>
            <div>
              <h3 className='font-bold text-foreground text-lg'>{t('checkout.summary.planName')}</h3>
              <p className='text-sm text-muted-foreground'>{t('checkout.summary.planDesc')}</p>
            </div>
            <span className='text-primary font-bold'>{t('checkout.summary.price')}</span>
          </div>
          <ul className='text-xs space-y-2 mt-4 text-muted-foreground'>
            {(t('checkout.summary.features', { returnObjects: true }) as string[]).map((feature, i) => (
              <li key={i} className='flex items-center gap-2'>
                <span className='material-symbols-outlined text-sm text-success'>check_circle</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <div className='space-y-3 mb-8'>
          <div className='flex justify-between text-muted-foreground'>
            <span>{t('checkout.summary.subtotal')}</span>
            <span>{t('checkout.summary.price')}</span>
          </div>
          <div className='flex justify-between text-muted-foreground'>
            <span>{t('checkout.summary.discount')}</span>
            <span className='text-success'>{t('checkout.summary.discountValue')}</span>
          </div>
          <div className='pt-3 border-t border-border flex justify-between items-center'>
            <span className='text-lg font-bold text-foreground'>{t('checkout.summary.total')}</span>
            <span className='text-2xl font-bold text-primary'>{t('checkout.summary.price')}</span>
          </div>
        </div>

        <Link
          to='/checkout-success'
          className='w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 rounded-xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2 mb-6'
        >
          <span className='material-symbols-outlined'>lock</span>
          {t('checkout.summary.checkoutBtn')}
        </Link>

        <div className='flex flex-col items-center gap-4'>
          <div className='flex items-center gap-4 opacity-60 grayscale hover:grayscale-0 transition-all'>
            <div className='w-10 h-6 bg-muted rounded flex items-center justify-center text-[8px] font-bold border border-border text-foreground'>VISA</div>
            <div className='w-10 h-6 bg-muted rounded flex items-center justify-center text-[8px] font-bold border border-border text-foreground'>MASTER</div>
            <div className='w-10 h-6 bg-muted rounded flex items-center justify-center text-[8px] font-bold border border-border text-foreground'>STRIPE</div>
          </div>
          <div className='flex items-center gap-2 text-xs text-muted-foreground'>
            <span className='material-symbols-outlined text-sm'>verified_user</span>
            {t('checkout.summary.securePayment')}
          </div>
        </div>
      </div>

      <div className='p-4 rounded-xl border border-dashed border-border flex items-start gap-4'>
        <span className='material-symbols-outlined text-primary'>info</span>
        <p className='text-xs text-muted-foreground leading-relaxed'>
          {t('checkout.summary.terms1')}
          <Link to='#' className='text-primary hover:underline'>
            {t('checkout.summary.termsLink1')}
          </Link>
          {t('checkout.summary.terms2')}
          <Link to='#' className='text-primary hover:underline'>
            {t('checkout.summary.termsLink2')}
          </Link>
          {t('checkout.summary.terms3')}
        </p>
      </div>
    </aside>
  )
}
