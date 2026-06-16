import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

export function CheckoutSuccessPage() {
  const { t } = useTranslation('landing')

  const features = t('checkoutSuccess.features.list', { returnObjects: true }) as { name: string; desc: string }[]

  return (
    <div className='bg-background min-h-screen flex items-center justify-center p-4 antialiased'>
      <main className='max-w-md w-full bg-card rounded-3xl shadow-xl overflow-hidden border border-border'>
        {/* Header Section */}
        <section className='pt-10 pb-6 px-6 text-center'>
          <div className='inline-flex items-center justify-center w-20 h-20 bg-primary/10 rounded-full mb-6'>
            <svg
              className='h-10 w-10 text-primary'
              fill='none'
              stroke='currentColor'
              strokeWidth='3'
              viewBox='0 0 24 24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path d='M5 13l4 4L19 7' strokeLinecap='round' strokeLinejoin='round' />
            </svg>
          </div>
          <h1 className='text-2xl font-bold text-foreground mb-2'>{t('checkoutSuccess.title')}</h1>
          <p className='text-muted-foreground font-medium'>{t('checkoutSuccess.subtitle')}</p>
        </section>

        {/* Transaction Summary */}
        <section className='px-6 pb-6'>
          <div className='bg-muted/30 rounded-2xl p-5 border border-border'>
            <h2 className='text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4'>
              {t('checkoutSuccess.transaction.title')}
            </h2>
            <div className='space-y-3'>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>{t('checkoutSuccess.transaction.orderId')}</span>
                <span className='text-sm font-semibold text-foreground'>EB-99284-SXP</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>{t('checkoutSuccess.transaction.amount')}</span>
                <span className='text-sm font-bold text-primary'>{t('checkoutSuccess.transaction.amountValue')}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>{t('checkoutSuccess.transaction.method')}</span>
                <span className='text-sm font-semibold text-foreground'>
                  {t('checkoutSuccess.transaction.methodValue')}
                </span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-sm text-muted-foreground'>{t('checkoutSuccess.transaction.date')}</span>
                <span className='text-sm font-semibold text-foreground'>
                  {new Date().toLocaleDateString('vi-VN')}{' '}
                  {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Unlocked Features */}
        <section className='px-6 pb-8'>
          <h3 className='text-sm font-bold text-foreground mb-4'>{t('checkoutSuccess.features.title')}</h3>
          <ul className='space-y-3'>
            {Array.isArray(features) &&
              features.map((feature, i) => (
                <li key={i} className='flex items-start space-x-3'>
                  <div className='mt-1 flex-shrink-0'>
                    <svg className='h-4 w-4 text-primary' fill='currentColor' viewBox='0 0 20 20'>
                      <path
                        fillRule='evenodd'
                        d='M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z'
                        clipRule='evenodd'
                      />
                    </svg>
                  </div>
                  <p className='text-sm text-muted-foreground'>
                    <strong className='text-foreground'>{feature.name}</strong>
                    {feature.desc}
                  </p>
                </li>
              ))}
          </ul>
        </section>

        {/* Action Buttons */}
        <footer className='p-6 bg-muted/30 border-t border-border flex flex-col space-y-3'>
          <Link
            to='/dashboard'
            className='flex items-center justify-center w-full py-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-colors duration-200 shadow-lg shadow-primary/20'
          >
            {t('checkoutSuccess.actions.dashboard')}
          </Link>
          <button
            type='button'
            className='w-full py-3 bg-card border-2 border-border hover:border-primary hover:text-primary text-foreground font-semibold rounded-xl transition-all duration-200'
          >
            {t('checkoutSuccess.actions.invoice')}
          </button>
          <p className='text-center text-[10px] text-muted-foreground mt-2'>{t('checkoutSuccess.actions.support')}</p>
        </footer>
      </main>
    </div>
  )
}
