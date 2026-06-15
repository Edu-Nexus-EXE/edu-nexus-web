import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadCareerTracks, type CareerTrackView } from '../../lib/sprint2-api'

export function LearningPathTable() {
  const { t } = useTranslation('dashboard')
  const [tracks, setTracks] = useState<CareerTrackView[]>([])
  const [loading, setLoading] = useState(true)
  const [baseDate] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false

    loadCareerTracks()
      .then((res) => {
        if (cancelled) return
        setTracks(res.data ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='bg-card rounded-xl border border-border shadow-sm overflow-hidden'>
      <div className='p-6 border-b border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <h3 className='font-bold text-lg text-foreground'>{t('learningPath.table.title')}</h3>
        <div className='flex gap-2 overflow-x-auto'>
          <button type='button' className='px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg font-medium whitespace-nowrap'>{t('learningPath.table.all')}</button>
          <button type='button' className='px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground font-medium whitespace-nowrap'>{t('learningPath.table.learning')}</button>
          <button type='button' className='px-3 py-1.5 text-sm hover:bg-muted rounded-lg text-muted-foreground font-medium whitespace-nowrap'>{t('learningPath.table.completed')}</button>
        </div>
      </div>

      {loading ? (
        <div className='p-6 text-sm text-muted-foreground'>{t('learningPath.loading')}</div>
      ) : tracks.length === 0 ? (
        <div className='p-6'>
          <div className='rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>school</span>
            </div>
            <p className='text-sm font-semibold text-foreground'>{t('learningPath.empty')}</p>
            <p className='mt-2 text-sm text-muted-foreground'>{t('learningPath.loading')}</p>
          </div>
        </div>
      ) : (
        <div className='overflow-x-auto'>
          <table className='w-full text-left border-collapse'>
            <thead>
              <tr className='bg-muted/50'>
                <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.name')}</th>
                <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.startDate')}</th>
                <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.progress')}</th>
                <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('learningPath.table.status')}</th>
                <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right'>{t('learningPath.table.actions')}</th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {tracks.map((track, index) => {
                const progress = track.progress ?? Math.min(100, track.jdCount * 20)
                const isCompleted = progress >= 100
                const startDate = new Date(baseDate - index * 86400000 * 12).toLocaleDateString('vi-VN')
                return (
                  <tr key={track.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary'>
                          <span className='material-symbols-outlined text-lg'>school</span>
                        </div>
                        <div>
                          <p className='font-bold text-foreground'>{track.name}</p>
                          <p className='text-xs text-muted-foreground'>{track.description ?? t('learningPath.table.descFallback')}</p>
                        </div>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-sm text-muted-foreground font-medium'>{startDate}</td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden'>
                          <div className='h-full bg-primary rounded-full' style={{ width: `${progress}%` }} />
                        </div>
                        <span className='text-sm font-bold text-primary'>{progress}%</span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${isCompleted ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isCompleted ? 'bg-success' : 'bg-warning'}`} />
                        {isCompleted ? t('learningPath.table.completed') : t('learningPath.table.learning')}
                      </span>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      {isCompleted ? (
                        <button type='button' className='text-sm font-bold text-primary hover:underline underline-offset-4'>
                          {t('learningPath.table.viewMap')}
                        </button>
                      ) : (
                        <button type='button' className='px-4 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90 transition-all shadow-md shadow-primary/20'>
                          {t('learningPath.table.continue')}
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      <div className='px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-between'>
        <span className='text-xs font-medium text-muted-foreground'>{t('learningPath.table.footer', { count: tracks.length })}</span>
        <div className='flex gap-1'>
          <button type='button' aria-label='Previous page' className='w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:bg-card transition-colors'>
            <span className='material-symbols-outlined text-sm'>chevron_left</span>
          </button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-primary bg-primary text-primary-foreground text-xs font-bold'>1</button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:border-primary hover:text-primary hover:bg-card text-xs font-bold transition-colors'>2</button>
          <button type='button' className='w-8 h-8 flex items-center justify-center rounded border border-border text-foreground hover:border-primary hover:text-primary hover:bg-card text-xs font-bold transition-colors'>3</button>
          <button type='button' aria-label='Next page' className='w-8 h-8 flex items-center justify-center rounded border border-border text-muted-foreground hover:text-primary hover:bg-card transition-colors'>
            <span className='material-symbols-outlined text-sm'>chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
