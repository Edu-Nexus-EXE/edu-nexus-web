import { useTranslation } from 'react-i18next'

export function CheckoutPaymentMethods() {
  const { t } = useTranslation('landing')

  return (
    <section className='bg-card p-6 md:p-8 rounded-xl border border-border shadow-sm'>
      <h2 className='text-xl font-bold mb-6 flex items-center gap-2 text-foreground'>
        <span className='material-symbols-outlined text-primary'>payments</span>
        {t('checkout.paymentMethods.title')}
      </h2>

      <div className='space-y-4'>
        {/* Credit Card */}
        <label className='group relative flex items-center gap-4 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
          <input
            type='radio'
            name='payment'
            defaultChecked
            className='h-5 w-5 border-2 border-input bg-transparent text-primary focus:ring-primary focus:ring-offset-0 appearance-none rounded-full checked:bg-primary checked:border-primary relative after:content-[""] after:absolute after:inset-[3px] after:rounded-full after:bg-background checked:after:bg-background'
          />
          <div className='flex flex-col grow'>
            <span className='font-semibold text-foreground'>{t('checkout.paymentMethods.creditCard')}</span>
            <span className='text-sm text-muted-foreground'>{t('checkout.paymentMethods.creditCardDesc')}</span>
          </div>
          <div className='flex gap-1'>
            <span className='material-symbols-outlined text-muted-foreground'>credit_card</span>
          </div>
        </label>

        {/* MoMo */}
        <label className='group relative flex items-center gap-4 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
          <input
            type='radio'
            name='payment'
            className='h-5 w-5 border-2 border-input bg-transparent text-primary focus:ring-primary focus:ring-offset-0 appearance-none rounded-full checked:bg-primary checked:border-primary relative after:content-[""] after:absolute after:inset-[3px] after:rounded-full after:bg-background checked:after:bg-background'
          />
          <div className='flex flex-col grow'>
            <span className='font-semibold text-foreground'>{t('checkout.paymentMethods.momo')}</span>
            <span className='text-sm text-muted-foreground'>{t('checkout.paymentMethods.momoDesc')}</span>
          </div>
          <div className='w-8 h-8 rounded-md bg-brand-momo flex items-center justify-center text-brand-momo-foreground font-bold text-[10px]'>MOMO</div>
        </label>

        {/* ZaloPay */}
        <label className='group relative flex items-center gap-4 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
          <input
            type='radio'
            name='payment'
            className='h-5 w-5 border-2 border-input bg-transparent text-primary focus:ring-primary focus:ring-offset-0 appearance-none rounded-full checked:bg-primary checked:border-primary relative after:content-[""] after:absolute after:inset-[3px] after:rounded-full after:bg-background checked:after:bg-background'
          />
          <div className='flex flex-col grow'>
            <span className='font-semibold text-foreground'>{t('checkout.paymentMethods.zalo')}</span>
            <span className='text-sm text-muted-foreground'>{t('checkout.paymentMethods.zaloDesc')}</span>
          </div>
          <div className='w-8 h-8 rounded-md bg-brand-zalo flex items-center justify-center text-brand-zalo-foreground font-bold text-[10px]'>Zalo</div>
        </label>

        {/* Bank Transfer */}
        <label className='group relative flex items-center gap-4 p-4 rounded-lg border-2 border-border cursor-pointer hover:border-primary/50 transition-all has-[:checked]:border-primary has-[:checked]:bg-primary/5'>
          <input
            type='radio'
            name='payment'
            className='h-5 w-5 border-2 border-input bg-transparent text-primary focus:ring-primary focus:ring-offset-0 appearance-none rounded-full checked:bg-primary checked:border-primary relative after:content-[""] after:absolute after:inset-[3px] after:rounded-full after:bg-background checked:after:bg-background'
          />
          <div className='flex flex-col grow'>
            <span className='font-semibold text-foreground'>{t('checkout.paymentMethods.bank')}</span>
            <span className='text-sm text-muted-foreground'>{t('checkout.paymentMethods.bankDesc')}</span>
          </div>
          <span className='material-symbols-outlined text-muted-foreground'>account_balance</span>
        </label>
      </div>
    </section>
  )
}
