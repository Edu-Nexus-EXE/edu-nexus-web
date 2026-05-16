import { DashboardLayout } from '../components/layout/dashboard-layout'
import { DashboardRadar } from '../components/overview/dashboard-radar'
import { DashboardReadiness } from '../components/overview/dashboard-readiness'
import { DashboardRoadmapBanner } from '../components/overview/dashboard-roadmap-banner'
import { DashboardSkills } from '../components/overview/dashboard-skills'
import { DashboardStats } from '../components/overview/dashboard-stats'

export function DashboardPage() {
  return (
    <DashboardLayout>
      <div className='p-8 space-y-8 max-w-7xl mx-auto w-full'>
        <DashboardStats />

        {/* Main Insights Grid */}
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-8'>
          <DashboardRadar />
          <DashboardReadiness />
        </div>

        <DashboardSkills />
        <DashboardRoadmapBanner />
      </div>
    </DashboardLayout>
  )
}
