import { CheckoutSuccessPage } from '~/features/landing'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/checkout-success'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('landing', 'checkoutSuccess.title') }]
}

export default function CheckoutSuccess() {
  return <CheckoutSuccessPage />
}
