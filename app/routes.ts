import { type RouteConfig, index, route } from '@react-router/dev/routes'

const marketingRoutes = [
  index('routes/marketing/home.tsx'),
  route('pricing', 'routes/marketing/pricing.tsx'),
  route('checkout', 'routes/marketing/checkout.tsx'),
  route('checkout-success', 'routes/marketing/checkout-success.tsx'),
]

const authRoutes = [
  route('signup', 'routes/auth/signup.tsx'),
  route('login', 'routes/auth/login.tsx'),
]

const dashboardRoutes = [
  route('dashboard', 'routes/dashboard/index.tsx'),
  route('dashboard/skills/cv', 'routes/dashboard/skills-cv.tsx'),
  route('dashboard/analysis-history', 'routes/dashboard/analysis-history.tsx'),
  route('dashboard/learning-path', 'routes/dashboard/learning-path.tsx'),
  route('dashboard/market', 'routes/dashboard/market.tsx'),
  route('dashboard/settings', 'routes/dashboard/settings.tsx'),
  route('dashboard/certificates', 'routes/dashboard/certificates.tsx'),
]

export default [...marketingRoutes, ...authRoutes, ...dashboardRoutes] satisfies RouteConfig
