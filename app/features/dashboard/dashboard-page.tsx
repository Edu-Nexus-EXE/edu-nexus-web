import { DashboardLayout } from './components/dashboard-layout'
import { DashboardRadar } from './components/dashboard-radar'
import { DashboardReadiness } from './components/dashboard-readiness'
import { DashboardRoadmapBanner } from './components/dashboard-roadmap-banner'
import { DashboardSkills } from './components/dashboard-skills'
import { DashboardStats } from './components/dashboard-stats'

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
