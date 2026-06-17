import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadAllRecentJds } from '../../lib/sprint2-api'

export function AnalysisHistoryInsights() {
  const { t } = useTranslation('dashboard')
  const [count, setCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadAllRecentJds().then((res) => {
      if (!cancelled) {
        setCount((res.data ?? []).length)
      }
    })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8'>
      <div className='lg:col-span-2 bg-card rounded-2xl border border-border p-6 shadow-sm'>
        <h3 className='font-bold text-lg text-foreground mb-4'>{t('analysisHistory.insights.title')}</h3>
        <p className='text-sm text-muted-foreground'>{t('analysisHistory.insights.summary', { count })}</p>
      </div>
      <div className='bg-card rounded-2xl border border-border p-6 shadow-sm'>
        <h3 className='font-bold text-lg text-foreground mb-4'>{t('analysisHistory.insights.quickStats')}</h3>
        <div className='space-y-3 text-sm'>
          <div className='flex items-center justify-between'>
            <span>{t('analysisHistory.insights.total')}</span>
            <span className='font-bold'>{count}</span>
          </div>
          <div className='flex items-center justify-between'>
            <span>{t('analysisHistory.insights.avg')}</span>
            <span className='font-bold'>72%</span>
          </div>
        </div>
      </div>
    </div>
  )
}
