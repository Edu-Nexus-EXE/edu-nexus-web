import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("pricing", "routes/pricing.tsx"),
  route("checkout", "routes/checkout.tsx"),
  route("checkout-success", "routes/checkout-success.tsx"),
  route("signup", "routes/signup.tsx"),
  route("login", "routes/login.tsx"),
  route("dashboard", "routes/dashboard.tsx"),
  route("dashboard/skills/cv", "routes/dashboard-skills-cv.tsx"),
  route("dashboard/analysis-history", "routes/dashboard-analysis-history.tsx"),
  route("dashboard/learning-path", "routes/dashboard-learning-path.tsx"),
  route("dashboard/market", "routes/dashboard-market.tsx"),
  route("dashboard/settings", "routes/dashboard-settings.tsx"),
  route("dashboard/certificates", "routes/dashboard-certificates.tsx"),
] satisfies RouteConfig;
