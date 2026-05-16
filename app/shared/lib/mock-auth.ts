/**
 * Mock authentication utility for demo purposes.
 * Replace with real API calls when backend is ready.
 */

export type MockUser = {
  email: string
  name: string
  id: string
  plan: string
  avatarUrl: string
}

const MOCK_CREDENTIALS = {
  email: 'demo@edunexus.com',
  password: 'demo123',
}

const MOCK_USER: MockUser = {
  email: MOCK_CREDENTIALS.email,
  name: 'Minh Quân',
  id: '882941',
  plan: 'Premium Student',
  avatarUrl:
    'https://lh3.googleusercontent.com/aida-public/AB6AXuDcC_04h_SCW7Bi_92EMTUpR4fdrGlOL2auro-8jopndr9C_D6Y4Iji9A4mx4Xcm9EUhq6SVZFpu3L5ib3o2bo3Sa93dc_Ay36GlX_mKIdy3QpKm9M51X0HVO3-7ouXrE6zb9TEb6v-bDi7msNgtPiCovIUKZLvLT0fMlctfcJz7ekB6PxKF3We-vjebAXft6inkPzy_kptKpxYYV1rUNovSTpEiwfDuqX6jkFlTUbD4bN6ZYlost2rDV4V0fNatveoDA88x1ETq2OM',
}

const STORAGE_KEY = 'edu_nexus_mock_user'

export function mockLogin(email: string, password: string): MockUser | null {
  if (email === MOCK_CREDENTIALS.email && password === MOCK_CREDENTIALS.password) {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(MOCK_USER))
    }
    return MOCK_USER
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
