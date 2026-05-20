import { ContactPage } from '~/features/landing'

import type { Route } from './+types/contact'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Liên hệ - Edu-Nexus' },
  ]
}

export default function Contact() {
  return <ContactPage />
}
