/**
 * Temporary local auth session for demo flows until the backend auth API is ready.
 */

export type MockUser = {
  email: string
  name: string
  id: string
  plan: string
  avatarUrl: string
  role: 'user' | 'admin'
}

const MOCK_CREDENTIALS = {
  email: 'demo@edunexus.com',
  password: 'demo123'
}

const MOCK_ADMIN_CREDENTIALS = {
  email: 'admin@edunexus.com',
  password: 'admin'
}

const MOCK_USER: MockUser = {
  email: MOCK_CREDENTIALS.email,
  name: 'Minh Quân',
  id: '882941',
  plan: 'Premium Student',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcC_04h_SCW7Bi_92EMTUpR4fdrGlOL2auro-8jopndr9C_D6Y4Iji9A4mx4Xcm9EUhq6SVZFpu3L5ib3o2bo3Sa93dc_Ay36GlX_mKIdy3QpKm9M51X0HVO3-7ouXrE6zb9TEb6v-bDi7msNgtPiCovIUKZLvLT0fMlctfcJz7ekB6PxKF3We-vjebAXft6inkPzy_kptKpxYYV1rUNovSTpEiwfDuqX6jkFlTUbD4bN6ZYlost2rDV4V0fNatveoDA88x1ETq2OM',
  role: 'user'
}

const MOCK_ADMIN: MockUser = {
  email: MOCK_ADMIN_CREDENTIALS.email,
  name: 'Admin Manager',
  id: 'admin_1',
  plan: 'System Controller',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDPRGXULQKHmAiiNBm-xsyPUS1_8jSLbsyqB0e4SOhBrMRmEuuYnoXJNejgU1vA_Sc3nFJxigl7WWDiMGFpCE7VbKP33jdI67kA0YrsU52RCpSxF84zcYOvkSv9Q0xWqCQgg_DueiEBnk_AUof4iAlBXxnd-AnRUxdQ9qn70KlxsxT6xxdKiTR0ziYRj5hiUtfvhPvGn1_Li3ElZgC2bWP0exj46Wf6DcKyTLomVah3CPkM4F6VUyVRwIpqCvNZgpqafdw8Out-8nIq',
  role: 'admin'
}

const STORAGE_KEY = 'edu_nexus_mock_user'

export function mockLogin(email: string, password: string): MockUser | null {
  if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER))
    }
    return MOCK_USER
  }

  if (email === MOCK_ADMIN_CREDENTIALS.email && password === MOCK_ADMIN_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_ADMIN))
    }
    return MOCK_ADMIN
  }

  return null
}

export function getMockUser(): MockUser | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? (JSON.parse(stored) as MockUser) : null
  } catch {
    return null
  }
}

export function mockLogout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(STORAGE_KEY)
  }
}
