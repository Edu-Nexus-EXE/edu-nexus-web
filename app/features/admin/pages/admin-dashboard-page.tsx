import { AdminAffiliateSection } from '../components/overview/admin-affiliate-section'
import { AdminAiCostSection } from '../components/overview/admin-ai-cost-section'
import { AdminFooter } from '../components/layout/admin-footer'
import { AdminHeader } from '../components/layout/admin-header'
import { AdminRevenueSection } from '../components/overview/admin-revenue-section'
import { AdminSidebar } from '../components/layout/admin-sidebar'
import { AdminStatCards } from '../components/overview/admin-stat-cards'

export function AdminDashboardPage() {
  return (
    <div className='bg-muted text-foreground min-h-screen flex font-body'>
      <AdminSidebar />
      <main className='flex-1 flex flex-col min-w-0'>
        <AdminHeader />
        <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
          <AdminStatCards />
          <AdminRevenueSection />
          <AdminAiCostSection />
          <AdminAffiliateSection />
        </div>
        <AdminFooter />
      </main>
    </div>
  )
}
