import { useTranslation } from 'react-i18next'

export function LearningPathStats() {
  const { t } = useTranslation('dashboard')

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
      <div className='bg-card p-5 rounded-xl border border-border shadow-sm'>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.stats.total')}</p>
        <div className='flex items-end justify-between mt-2'>
          <span className='text-3xl font-bold text-foreground'>12</span>
          <span className='text-primary bg-primary/10 px-2 py-1 rounded text-xs font-semibold'>
            {t('learningPath.stats.totalSub')}
          </span>
        </div>
      </div>
      
      <div className='bg-card p-5 rounded-xl border border-border shadow-sm'>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.stats.completed')}</p>
        <div className='flex items-end justify-between mt-2'>
          <span className='text-3xl font-bold text-foreground'>8</span>
          <span className='text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded text-xs font-semibold'>
            66.7%
          </span>
        </div>
      </div>

      <div className='bg-card p-5 rounded-xl border border-border shadow-sm'>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.stats.certificates')}</p>
        <div className='flex items-end justify-between mt-2'>
          <span className='text-3xl font-bold text-foreground'>5</span>
          <span className='material-symbols-outlined text-primary'>verified</span>
        </div>
      </div>

      <div className='bg-card p-5 rounded-xl border border-border shadow-sm'>
        <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.stats.hours')}</p>
        <div className='flex items-end justify-between mt-2'>
          <span className='text-3xl font-bold text-foreground'>248h</span>
          <span className='text-muted-foreground text-xs'>
            {t('learningPath.stats.hoursSub')}
          </span>
        </div>
      </div>
    </div>
  )
}
