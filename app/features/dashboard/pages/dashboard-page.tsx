import { DashboardJdRecent } from '../components/overview/dashboard-jd-recent'
import { DashboardQuickActions } from '../components/overview/dashboard-quick-actions'
import { DashboardQuotaBanner } from '../components/overview/dashboard-quota-banner'
import { DashboardQuotaOverview } from '../components/overview/dashboard-quota-overview'
import { DashboardRoadmapBanner } from '../components/overview/dashboard-roadmap-banner'

export function DashboardPage() {
  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <DashboardQuotaBanner />

      <DashboardQuickActions />

      <DashboardRoadmapBanner />

      <div className='grid grid-cols-1 xl:grid-cols-2 gap-8 items-start'>
        <DashboardJdRecent />
        <DashboardQuotaOverview />
      </div>
    </div>
  )
}
