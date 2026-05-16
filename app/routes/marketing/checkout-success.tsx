import { CheckoutSuccessPage } from '~/features/landing'

import type { Route } from './+types/checkout-success'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Thanh toán thành công - Edu-Nexus' },
  ]
}

export default function CheckoutSuccess() {
  return <CheckoutSuccessPage />
}
