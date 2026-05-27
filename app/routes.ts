import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

const marketingRoutes = [
  index('routes/marketing/home.tsx'),
  route('pricing', 'routes/marketing/pricing.tsx'),
  route('checkout', 'routes/marketing/checkout.tsx'),
  route('checkout-success', 'routes/marketing/checkout-success.tsx'),
  route('contact', 'routes/marketing/contact.tsx')
]

const authRoutes = [route('signup', 'routes/auth/signup.tsx'), route('login', 'routes/auth/login.tsx')]

const dashboardRoutes = [
  layout('routes/dashboard/layout.tsx', [
    route('dashboard', 'routes/dashboard/index.tsx'),
    route('dashboard/skills/cv', 'routes/dashboard/skills-cv.tsx'),
    route('dashboard/skills/test', 'routes/dashboard/skills-test.tsx'),
    route('dashboard/gap-analysis', 'routes/dashboard/gap-analysis.tsx'),
    route('dashboard/analysis-history', 'routes/dashboard/analysis-history.tsx'),
    route('dashboard/learning-path', 'routes/dashboard/learning-path.tsx'),
    route('dashboard/market', 'routes/dashboard/market.tsx'),
    route('dashboard/settings', 'routes/dashboard/settings.tsx'),
    route('dashboard/certificates', 'routes/dashboard/certificates.tsx')
  ]),
  route('dashboard/roadmap', 'routes/dashboard/roadmap.tsx')
]

const adminRoutes = [
  layout('routes/admin/layout.tsx', [
    route('admin', 'routes/admin/index.tsx'),
    route('admin/resources', 'routes/admin/resources.tsx'),
    route('admin/rag-documents', 'routes/admin/rag-documents.tsx'),
    route('admin/revenue', 'routes/admin/revenue.tsx'),
    route('admin/users', 'routes/admin/users.tsx'),
    route('admin/users/:id', 'routes/admin/user-detail.tsx'),
    route('admin/subscriptions', 'routes/admin/subscriptions.tsx'),
    route('admin/jd-logs', 'routes/admin/jd-logs.tsx'),
    route('admin/jd-logs/:id', 'routes/admin/jd-log-detail.tsx')
  ])
]

export default [...marketingRoutes, ...authRoutes, ...dashboardRoutes, ...adminRoutes] satisfies RouteConfig
