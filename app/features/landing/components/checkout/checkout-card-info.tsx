import { useTranslation } from 'react-i18next'

export function CheckoutCardInfo() {
  const { t } = useTranslation('landing')

  return (
    <section className='bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm'>
      <h2 className='text-xl font-bold mb-6 text-foreground'>{t('checkout.cardInfo.title')}</h2>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        <div className='md:col-span-2'>
          <label className='block text-sm font-medium mb-1.5 text-foreground'>
            {t('checkout.cardInfo.cardNumber')}
          </label>
          <input
            type='text'
            placeholder='0000 0000 0000 0000'
            className='w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground'
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1.5 text-foreground'>{t('checkout.cardInfo.expiry')}</label>
          <input
            type='text'
            placeholder='MM/YY'
            className='w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground'
          />
        </div>
        <div>
          <label className='block text-sm font-medium mb-1.5 text-foreground'>{t('checkout.cardInfo.cvc')}</label>
          <input
            type='text'
            placeholder='123'
            className='w-full px-4 py-2.5 rounded-lg border border-input bg-background focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-foreground'
          />
        </div>
      </div>
    </section>
  )
}
