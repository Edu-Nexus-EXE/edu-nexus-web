import { CheckoutPage } from '~/features/landing'
import { getMetaTitle, getMetaTranslation } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/checkout'

export function meta({}: Route.MetaArgs) {
  return [
    { title: getMetaTitle('landing', 'checkout.header.breadcrumbCheckout') },
    {
      name: 'description',
      content: getMetaTranslation('landing', 'checkout.summary.title')
    }
  ]
}

export default function Checkout() {
  return <CheckoutPage />
}
