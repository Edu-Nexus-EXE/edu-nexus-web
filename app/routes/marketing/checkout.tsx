import { CheckoutPage } from '~/features/landing'

import type { Route } from './+types/checkout'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Thanh toán - Edu-Nexus' },
    {
      name: 'description',
      content: 'Hoàn tất thanh toán để nâng cấp gói dịch vụ.',
    },
  ]
}

export default function Checkout() {
  return <CheckoutPage />
}
