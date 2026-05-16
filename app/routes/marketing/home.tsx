import { LandingPage } from '~/features/landing'

import type { Route } from './+types/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Edu-Nexus - Định hướng Nghề nghiệp AI' },
    {
      name: 'description',
      content: 'Edu-Nexus ánh xạ kỹ năng của bạn vào các ngành nghề tương lai bằng AI tiên tiến.'
    }
  ]
}

export default function Home() {
  return <LandingPage />
}
