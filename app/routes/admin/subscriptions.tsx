import { AdminSubscriptionPage } from '~/features/admin'
import type { Route } from './+types/subscriptions'

export function meta({}: Route.MetaArgs) {
  return [{ title: 'Subscription Config - Edu-Nexus' }]
}

export default function AdminSubscriptions() {
  return <AdminSubscriptionPage />
}
