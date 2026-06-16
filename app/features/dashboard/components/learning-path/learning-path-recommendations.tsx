import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadDashboardRoadmaps } from '../../lib/sprint2-api'

export function LearningPathRecommendations() {
  const { t } = useTranslation('dashboard')
  const [readyTrackCount, setReadyTrackCount] = useState(0)

  useEffect(() => {
    let cancelled = false
    loadDashboardRoadmaps('active')
      .then((res) => {
        if (cancelled) return
        setReadyTrackCount((res.data ?? []).filter((roadmap) => roadmap.progress >= 60).length)
      })
      .catch(() => {
        if (cancelled) return
        setReadyTrackCount(0)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 mt-12'>
      <div className='lg:col-span-2'>
        <h3 className='font-bold text-xl mb-6 text-foreground'>{t('learningPath.recommendations.title')}</h3>
        <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
          <div className='p-4 bg-gradient-to-br from-primary to-warning rounded-xl text-primary-foreground shadow-lg shadow-primary/20 relative overflow-hidden group'>
            <div className='absolute -right-4 -bottom-4 opacity-10 transform group-hover:scale-110 transition-transform text-primary-foreground'>
              <span className='material-symbols-outlined text-[120px]'>rocket_launch</span>
            </div>
            <span className='inline-block px-2 py-1 bg-primary-foreground/20 rounded text-[10px] font-bold uppercase mb-2'>
              {t('learningPath.recommendations.forYou')}
            </span>
            <h4 className='font-bold text-lg leading-tight'>{t('learningPath.recommendations.microservicesTitle')}</h4>
            <p className='text-primary-foreground/80 text-xs mt-2 mb-4'>
              {t('learningPath.recommendations.microservicesDesc')}
            </p>
            <button
              type='button'
              className='bg-card text-primary px-4 py-2 rounded-lg text-xs font-bold hover:bg-card/90 transition-colors'
            >
              {t('learningPath.recommendations.startNow')}
            </button>
          </div>

          <div className='p-4 bg-card border border-border rounded-xl shadow-sm hover:border-primary/50 transition-all cursor-pointer'>
            <div className='flex justify-between items-start mb-4'>
              <div className='w-10 h-10 rounded-full bg-muted flex items-center justify-center'>
                <span className='material-symbols-outlined text-primary'>quiz</span>
              </div>
              <span className='text-[10px] font-bold text-muted-foreground'>
                {t('learningPath.recommendations.testTime')}
              </span>
            </div>
            <h4 className='font-bold text-foreground'>{t('learningPath.recommendations.testTitle')}</h4>
            <p className='text-muted-foreground text-xs mt-1'>{t('learningPath.recommendations.testDesc')}</p>
            <p className='mt-4 text-xs font-semibold text-primary'>
              {t('learningPath.recommendations.readyCount', { count: readyTrackCount })}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h3 className='font-bold text-xl mb-6 text-foreground'>
          {t('learningPath.recommendations.certificatesTitle')}
        </h3>
        <div className='space-y-4'>
          <div className='flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm'>
            <div className='w-12 h-12 bg-primary/10 rounded flex items-center justify-center text-primary'>
              <span className='material-symbols-outlined text-3xl'>verified</span>
            </div>
            <div>
              <p className='font-bold text-sm text-foreground'>Java Spring Specialist</p>
              <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5'>
                {t('learningPath.recommendations.issued')}
              </p>
            </div>
          </div>
          <div className='flex items-center gap-4 p-4 bg-card border border-border rounded-xl shadow-sm opacity-60'>
            <div className='w-12 h-12 bg-muted rounded flex items-center justify-center text-muted-foreground'>
              <span className='material-symbols-outlined text-3xl'>workspace_premium</span>
            </div>
            <div>
              <p className='font-bold text-sm text-foreground'>Data Analyst Associate</p>
              <p className='text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-0.5'>
                {t('learningPath.recommendations.pending')}
              </p>
            </div>
          </div>
        </div>
        <button
          type='button'
          className='w-full mt-4 py-3 text-sm font-bold text-muted-foreground hover:text-primary transition-colors text-center'
        >
          {t('learningPath.recommendations.viewAllCertificates')}
        </button>
      </div>
    </div>
  )
}
