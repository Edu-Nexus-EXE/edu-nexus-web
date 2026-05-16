import { CheckoutCardInfo } from './components/checkout-card-info'
import { CheckoutHeader } from './components/checkout-header'
import { CheckoutOrderSummary } from './components/checkout-order-summary'
import { CheckoutPaymentMethods } from './components/checkout-payment-methods'

export function CheckoutPage() {
  return (
    <div className='min-h-screen bg-background'>
      <div className='max-w-[1200px] mx-auto px-4 py-8 md:py-12'>
        <CheckoutHeader />

        <div className='grid grid-cols-1 lg:grid-cols-12 gap-8 items-start'>
          <div className='lg:col-span-7 flex flex-col gap-6'>
            <CheckoutPaymentMethods />
            <CheckoutCardInfo />
          </div>

          <CheckoutOrderSummary />
        </div>
      </div>
    </div>
  )
}
