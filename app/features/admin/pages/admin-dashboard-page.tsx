import { AdminAffiliateSection } from '../components/overview/admin-affiliate-section'
import { AdminOverviewCharts } from '../components/overview/admin-overview-charts'
import { AdminRevenueSection } from '../components/overview/admin-revenue-section'
import { AdminStatCards } from '../components/overview/admin-stat-cards'

export function AdminDashboardPage() {
  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <AdminStatCards />
      <AdminOverviewCharts />
      <AdminRevenueSection />
      <AdminAffiliateSection />
    </div>
  )
}
