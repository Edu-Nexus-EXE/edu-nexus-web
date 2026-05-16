import { useTranslation } from 'react-i18next'

export function AnalysisHistoryInsights() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='mt-8 grid grid-cols-1 md:grid-cols-3 gap-6'>
      {/* Progress */}
      <div className='bg-primary/5 border border-primary/20 rounded-xl p-6'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground'>
            <span className='material-symbols-outlined'>trending_up</span>
          </div>
          <div>
            <p className='text-xs font-bold text-primary uppercase tracking-widest'>{t('analysisHistory.insights.progress')}</p>
            <h3 className='text-xl font-bold text-foreground'>+15% Match</h3>
          </div>
        </div>
        <p className='text-sm text-muted-foreground'>{t('analysisHistory.insights.progressDesc')}</p>
      </div>

      {/* Best Match */}
      <div className='bg-teal-500/5 border border-teal-500/20 rounded-xl p-6'>
        <div className='flex items-center gap-4 mb-4'>
          <div className='size-10 rounded-full bg-teal-500 flex items-center justify-center text-white'>
            <span className='material-symbols-outlined'>verified</span>
          </div>
          <div>
            <p className='text-xs font-bold text-teal-600 uppercase tracking-widest'>{t('analysisHistory.insights.bestMatch')}</p>
            <h3 className='text-xl font-bold text-foreground'>Frontend Dev</h3>
          </div>
        </div>
        <p className='text-sm text-muted-foreground'>{t('analysisHistory.insights.bestMatchDesc')}</p>
      </div>

      {/* AI Advice */}
      <div className='bg-foreground rounded-xl p-6 text-background shadow-xl'>
        <h4 className='font-bold mb-2'>{t('analysisHistory.insights.aiAdvice')}</h4>
        <p className='text-sm text-background/80 mb-4 leading-relaxed'>
          {t('analysisHistory.insights.aiAdviceDesc')}
        </p>
        <button
          type='button'
          className='w-full py-2 bg-background text-foreground rounded-lg text-xs font-bold hover:bg-background/90 transition-colors'
        >
          {t('analysisHistory.insights.viewCourse')}
        </button>
      </div>
    </div>
  )
}
