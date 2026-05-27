import { AdminSubscriptionPage } from '~/features/admin'
import { getMetaTitle } from '~/shared/lib/get-meta-t'
import type { Route } from './+types/subscriptions'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('admin', 'subscriptions.title') }]
}

export default function AdminSubscriptions() {
  return <AdminSubscriptionPage />
}
