import { DashboardRadar } from '../components/overview/dashboard-radar'
import { DashboardReadiness } from '../components/overview/dashboard-readiness'
import { DashboardRoadmapBanner } from '../components/overview/dashboard-roadmap-banner'
import { DashboardSkills } from '../components/overview/dashboard-skills'
import { DashboardStats } from '../components/overview/dashboard-stats'
import { DashboardJdRecent } from '../components/overview/dashboard-jd-recent'
import { DashboardQuotaBanner } from '../components/overview/dashboard-quota-banner'

export function DashboardPage() {
  return (
    <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
      <DashboardQuotaBanner />

      <DashboardStats />

      <DashboardJdRecent />

      {/* Main Insights Grid */}
      <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
        <DashboardRadar />
        <DashboardReadiness />
      </div>

      <DashboardSkills />
      <DashboardRoadmapBanner />
    </div>
  )
}
