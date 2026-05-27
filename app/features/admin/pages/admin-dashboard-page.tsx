import { AdminAffiliateSection } from '../components/overview/admin-affiliate-section'
import { AdminAiCostSection } from '../components/overview/admin-ai-cost-section'
import { AdminRevenueSection } from '../components/overview/admin-revenue-section'
import { AdminStatCards } from '../components/overview/admin-stat-cards'

export function AdminDashboardPage() {
  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <AdminStatCards />
      <AdminRevenueSection />
      <AdminAiCostSection />
      <AdminAffiliateSection />
    </div>
  )
}
