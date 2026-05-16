import { LoginPage } from '~/features/auth'

import type { Route } from './+types/login'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Đăng nhập - Edu-Nexus' },
    {
      name: 'description',
      content: 'Đăng nhập vào Edu-Nexus để truy cập bảng điều khiển học tập của bạn.'
    }
  ]
}

export default function Login() {
  return <LoginPage />
}
