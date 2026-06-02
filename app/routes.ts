import { type RouteConfig, index, layout, route } from '@react-router/dev/routes'

function marketing() {
  return [
    index('routes/marketing/home.tsx'),
    route('pricing', 'routes/marketing/pricing.tsx'),
    route('checkout', 'routes/marketing/checkout.tsx'),
    route('checkout-success', 'routes/marketing/checkout-success.tsx'),
    route('contact', 'routes/marketing/contact.tsx'),
  ]
}

function auth() {
  return [
    route('signup', 'routes/auth/signup.tsx'),
    route('login', 'routes/auth/login.tsx'),
    // Alias: /register → /signup (matches FE spec Sprint 1)
    route('register', 'routes/auth/register-redirect.tsx'),
  ]
}

function onboarding() {
  return [
    route('onboarding', 'routes/onboarding/index.tsx'),

    // Legacy (non-dashboard) routes are intentionally not exposed anymore.
    // Keep JD flow only under /dashboard/*.
  ]
}

function dashboard() {
  return [
    layout('routes/dashboard/layout.tsx', [
      route('dashboard', 'routes/dashboard/index.tsx'),

      // JD
      route('dashboard/jd/new', 'routes/dashboard/jd/new.tsx'),
      route('dashboard/jd/:jdId', 'routes/dashboard/jd/$jdId/index.tsx'),
      route('dashboard/jd/:jdId/assessment', 'routes/dashboard/jd/$jdId/assessment.tsx'),
      route('dashboard/jd/:jdId/assessment/results', 'routes/dashboard/jd/$jdId/assessment-results.tsx'),

      // CV
      route('dashboard/assessment-paths/:pathId/cv', 'routes/dashboard/assessment-paths/$pathId/cv.tsx'),

      // Analytics
      route('dashboard/analytics/gap-analysis', 'routes/dashboard/analytics/gap-analysis.tsx'),
      route('dashboard/analytics/analysis-history', 'routes/dashboard/analytics/analysis-history.tsx'),

      // Learning
      route('dashboard/learning/learning-path', 'routes/dashboard/learning/learning-path.tsx'),
      route('dashboard/learning/roadmap', 'routes/dashboard/learning/roadmap.tsx'),
      route('dashboard/learning/career-track', 'routes/dashboard/learning/career-track.tsx'),

      // Market
      route('dashboard/market', 'routes/dashboard/market/index.tsx'),

      // Credentials
      route('dashboard/credentials/certificates', 'routes/dashboard/credentials/certificates.tsx'),

      // Settings
      route('dashboard/settings', 'routes/dashboard/settings/index.tsx'),

      // Legacy shortcuts
      route('dashboard/legacy/skills/cv', 'routes/dashboard/legacy/skills-cv.tsx'),
      route('dashboard/legacy/skills/test', 'routes/dashboard/legacy/skills-test.tsx'),
    ]),
  ]
}

function admin() {
  return [
    layout('routes/admin/layout.tsx', [
      route('admin', 'routes/admin/index.tsx'),
      route('admin/resources', 'routes/admin/resources.tsx'),
      route('admin/rag-documents', 'routes/admin/rag-documents.tsx'),
      route('admin/revenue', 'routes/admin/revenue.tsx'),
      route('admin/users', 'routes/admin/users.tsx'),
      route('admin/users/:id', 'routes/admin/user-detail.tsx'),
      route('admin/subscriptions', 'routes/admin/subscriptions.tsx'),
      route('admin/jd-logs', 'routes/admin/jd-logs.tsx'),
      route('admin/jd-logs/:id', 'routes/admin/jd-log-detail.tsx'),
    ]),
  ]
}

export default [
  ...marketing(),
  ...auth(),
  ...onboarding(),
  ...dashboard(),
  ...admin(),
  // Alias: /jd/* → /dashboard/jd/* (matches FE spec Sprint 1)
  // Each route needs a unique `id` because they share the same file component.
  route('jd/new', 'routes/jd/jd-redirects.tsx', { id: 'jd-new-redirect' }),
  route('jd/:jdId', 'routes/jd/jd-redirects.tsx', { id: 'jd-detail-redirect' }),
  route('jd/:jdId/assessment', 'routes/jd/jd-redirects.tsx', { id: 'jd-assessment-redirect' }),
  route('jd/:jdId/assessment/results', 'routes/jd/jd-redirects.tsx', { id: 'jd-assessment-results-redirect' }),
] satisfies RouteConfig
