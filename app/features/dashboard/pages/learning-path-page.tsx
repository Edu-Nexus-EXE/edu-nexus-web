import { useTranslation } from 'react-i18next'

import { DashboardLayout } from '../components/layout/dashboard-layout'
import { LearningPathRecommendations } from '../components/learning-path/learning-path-recommendations'
import { LearningPathStats } from '../components/learning-path/learning-path-stats'
import { LearningPathTable } from '../components/learning-path/learning-path-table'

export function LearningPathPage() {
  const { t } = useTranslation('dashboard')

  return (
    <DashboardLayout>
      <div className='p-8'>
        <div className='mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4'>
          <div>
            <h2 className='text-3xl font-extrabold text-foreground tracking-tight'>{t('learningPath.title')}</h2>
            <p className='text-muted-foreground mt-1'>{t('learningPath.subtitle')}</p>
          </div>
          <button type='button' className='flex items-center justify-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm'>
            <span className='material-symbols-outlined text-sm'>add</span>
            {t('learningPath.newPath')}
          </button>
        </div>

        <LearningPathStats />
        <LearningPathTable />
        <LearningPathRecommendations />
      </div>
    </DashboardLayout>
  )
}
