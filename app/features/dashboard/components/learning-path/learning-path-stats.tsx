import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadCareerTracks, type CareerTrackView } from '../../lib/sprint2-api'

export function LearningPathStats() {
  const { t } = useTranslation('dashboard')
  const [tracks, setTracks] = useState<CareerTrackView[]>([])
  const [loading, setLoading] = useState(true)

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

  const total = tracks.length
  const completed = tracks.filter((track) => (track.progress ?? 0) >= 100).length
  const certificates = tracks.reduce((sum, track) => sum + Math.max(0, Math.floor((track.jdCount || 0) / 2)), 0)
  const hours = tracks.reduce((sum, track) => sum + (track.progress ?? 0) * 2, 0)

  const cards = [
    { key: 'total', label: t('learningPath.stats.total'), value: loading ? '--' : String(total), badge: t('learningPath.stats.totalSub') },
    { key: 'completed', label: t('learningPath.stats.completed'), value: loading ? '--' : String(completed), badge: loading || total === 0 ? '--' : `${((completed / Math.max(total, 1)) * 100).toFixed(1)}%` },
    { key: 'certificates', label: t('learningPath.stats.certificates'), value: loading ? '--' : String(certificates), badge: 'verified' },
    { key: 'hours', label: t('learningPath.stats.hours'), value: loading ? '--' : `${hours}h`, badge: t('learningPath.stats.hoursSub') },
  ]

  return (
    <div className='grid grid-cols-1 md:grid-cols-4 gap-6 mb-8'>
      {cards.map((card) => (
        <div key={card.key} className='bg-card p-5 rounded-xl border border-border shadow-sm'>
          <p className='text-xs font-bold text-muted-foreground uppercase tracking-wider'>{card.label}</p>
          <div className='flex items-end justify-between mt-2'>
            <span className='text-3xl font-bold text-foreground'>{card.value}</span>
            {card.badge === 'verified' ? (
              <span className='material-symbols-outlined text-primary'>verified</span>
            ) : (
              <span className='text-primary bg-primary/10 px-2 py-1 rounded text-xs font-semibold'>{card.badge}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
