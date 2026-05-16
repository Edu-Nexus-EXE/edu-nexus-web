import { SignupPage } from '~/features/auth'

import type { Route } from './+types/signup'

export function meta({}: Route.MetaArgs) {
  return [
    { title: 'Đăng ký - Edu-Nexus' },
    {
      name: 'description',
      content: 'Tạo tài khoản Edu-Nexus để bắt đầu hành trình học tập với AI.'
    }
  ]
}

export default function Signup() {
  return <SignupPage />
}
