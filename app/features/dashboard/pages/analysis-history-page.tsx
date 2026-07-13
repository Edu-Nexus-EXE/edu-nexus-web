import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { AnalysisHistoryInsights } from '../components/analysis-history/analysis-history-insights'
import { AnalysisHistoryTable } from '../components/analysis-history/analysis-history-table'
import { ReadinessHistoryPanel } from '../components/readiness/readiness-history-panel'

export function AnalysisHistoryPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  return (
    <div className='flex-1 overflow-y-auto p-8'>
      <div className='max-w-6xl mx-auto'>
        {/* Title Section */}
        <div className='flex items-end justify-between mb-8'>
          <div>
            <h2 className='text-3xl font-bold text-foreground tracking-tight'>{t('analysisHistory.title')}</h2>
            <p className='text-muted-foreground mt-2'>{t('analysisHistory.subtitle')}</p>
          </div>
          <button
            type='button'
            onClick={() => navigate('/dashboard/jd/new')}
            className='flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg hover:shadow-primary/20 transition-all'
          >
            <span className='material-symbols-outlined text-lg'>add_circle</span>
            <span>{t('analysisHistory.newAnalysis')}</span>
          </button>
        </div>

        <div className='mb-8'>
          <ReadinessHistoryPanel />
        </div>
        <AnalysisHistoryTable />
        <AnalysisHistoryInsights />
      </div>
    </div>
  )
}
