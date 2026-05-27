import { ContactPage } from '~/features/landing'
import { getMetaTitle } from '~/shared/lib/get-meta-t'

import type { Route } from './+types/contact'

export function meta({}: Route.MetaArgs) {
  return [{ title: getMetaTitle('landing', 'contact.title') }]
}

export default function Contact() {
  return <ContactPage />
}
