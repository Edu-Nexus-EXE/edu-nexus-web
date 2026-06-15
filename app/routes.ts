import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

function marketing() {
  return [
    index('routes/marketing/home.tsx'),
    route('pricing', 'routes/marketing/pricing.tsx'),
    route('checkout', 'routes/marketing/checkout.tsx'),
    route('checkout-success', 'routes/marketing/checkout-success.tsx'),
    route('contact', 'routes/marketing/contact.tsx'),
    route('p/:slug', 'routes/marketing/portfolio-public.tsx'),
  ]
}

function auth() {
  return [
    route('signup', 'routes/auth/signup.tsx'),
    route('login', 'routes/auth/login.tsx'),
    route('register', 'routes/auth/register-redirect.tsx'),
  ]
}

function onboarding() {
  return [route('onboarding', 'routes/onboarding/index.tsx')]
}

function dashboard() {
  return [
    layout('routes/dashboard/layout.tsx', [
      route('dashboard', 'routes/dashboard/index.tsx'),

      route('dashboard/jd/new', 'routes/dashboard/jd/new.tsx'),
      route('dashboard/jd/:jdId', 'routes/dashboard/jd/$jdId/index.tsx'),
      route('dashboard/jd/:jdId/assessment', 'routes/dashboard/jd/$jdId/assessment.tsx'),
      route('dashboard/jd/:jdId/assessment/results', 'routes/dashboard/jd/$jdId/assessment-results.tsx'),

      route('dashboard/assessment-paths/:pathId/cv', 'routes/dashboard/assessment-paths/$pathId/cv.tsx'),

      route('dashboard/analytics/gap-analysis', 'routes/dashboard/analytics/gap-analysis.tsx'),
      route('dashboard/analytics/analysis-history', 'routes/dashboard/analytics/analysis-history.tsx'),

      route('dashboard/learning/learning-path', 'routes/dashboard/learning/learning-path.tsx'),
      route('dashboard/learning/roadmap', 'routes/dashboard/learning/roadmap.tsx'),
      route('dashboard/learning/career-track', 'routes/dashboard/learning/career-track.tsx'),

      route('dashboard/market', 'routes/dashboard/market/index.tsx'),
      route('dashboard/credentials/certificates', 'routes/dashboard/credentials/certificates.tsx'),
      route('dashboard/portfolio', 'routes/dashboard/portfolio/index.tsx'),
      route('dashboard/settings', 'routes/dashboard/settings/index.tsx'),

      route('portfolio', 'routes/dashboard/portfolio/index.tsx', { id: 'portfolio-spec-route' }),
      route('settings', 'routes/dashboard/settings/index.tsx', { id: 'settings-spec-route' }),
      route('roadmaps', 'routes/dashboard/learning/roadmap.tsx', { id: 'roadmaps-spec-route' }),
      route('career-tracks', 'routes/dashboard/learning/career-track.tsx', { id: 'career-tracks-spec-route' }),
      route('career-tracks/:id', 'routes/dashboard/learning/career-track.tsx', { id: 'career-track-detail-spec-route' }),
    ]),
  ]
}

function admin() {
  return [
    layout('routes/admin/layout.tsx', [
      route('admin', 'routes/admin/index.tsx'),
      route('admin/resources', 'routes/admin/resources.tsx'),
      route('admin/rag-documents', 'routes/admin/rag-documents.tsx'),
      route('admin/skills', 'routes/admin/skills.tsx'),
      route('admin/revenue', 'routes/admin/revenue.tsx'),
      route('admin/users', 'routes/admin/users.tsx'),
      route('admin/users/:id', 'routes/admin/user-detail.tsx'),
      route('admin/subscriptions', 'routes/admin/subscriptions.tsx'),
      route('admin/jd-logs', 'routes/admin/jd-logs.tsx'),
      route('admin/jd-logs/:id', 'routes/admin/jd-log-detail.tsx'),

      route('admin/payment-orders', 'routes/admin/revenue.tsx', { id: 'admin-payment-orders-spec-route' }),
      route('admin/subscription-config', 'routes/admin/subscriptions.tsx', { id: 'admin-subscription-config-spec-route' }),
      route('admin/jd-failed', 'routes/admin/jd-logs.tsx', { id: 'admin-jd-failed-spec-route' }),
    ]),
  ]
}

export default [
  ...marketing(),
  ...auth(),
  ...onboarding(),
  ...dashboard(),
  ...admin(),
  route('jd/new', 'routes/jd/jd-redirects.tsx', { id: 'jd-new-redirect' }),
  route('jd/:jdId', 'routes/jd/jd-redirects.tsx', { id: 'jd-detail-redirect' }),
  route('jd/:jdId/assessment', 'routes/jd/jd-redirects.tsx', { id: 'jd-assessment-redirect' }),
  route('jd/:jdId/assessment/results', 'routes/jd/jd-redirects.tsx', { id: 'jd-assessment-results-redirect' }),
] satisfies RouteConfig
