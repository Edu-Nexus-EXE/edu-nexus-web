import { useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { loadDashboardRoadmaps } from '../../lib/sprint2-api'
import { useEffect, useState } from 'react'

const ROADMAP_IMAGE =
  'https://lh3.googleusercontent.com/aida-public/AB6AXuAfIvCHVutQr2OMK0BW5H8lgGyqh3NvzHZz-uHMKZwvODoXvh00mgA00vim7NQoeG-w1Aw2P-jF8bGF4yUtJ8VQW_ncQIb0PGWDbgu6q86JwvUXOLyHppNEi6KDFedc6aNFJWfQzkApJ33LTccWilHo1fCNY_C82eg8AvQeBrtJP6bwmtt77yqeK2uXhwgPa51oE11KqWH-WLWEk1qsd_jDNX_lHg2rsb7OdJVQ7Zx5BzG3OTp8fACeK4rQxIEJ8Lh5qN_5r24fou6Z'

export function DashboardRoadmapBanner() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [hasRoadmap, setHasRoadmap] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadDashboardRoadmaps('active')
      .then((res) => {
        if (cancelled) return
        setHasRoadmap((res.data?.length ?? 0) > 0)
      })
      .catch(() => {
        if (cancelled) return
        setHasRoadmap(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='bg-card rounded-2xl border border-border p-8 shadow-sm relative overflow-hidden'>
      <div className='absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-20 -mt-20 blur-3xl' />

      <div className='relative z-10 flex flex-col md:flex-row items-center justify-between gap-8'>
        <div className='max-w-xl'>
          <h2 className='text-xl font-bold mb-4 text-foreground'>{t('roadmap.title')}</h2>
          <p className='text-muted-foreground mb-6'>
            {hasRoadmap ? t('roadmap.description') : t('roadmap.emptyDescription')}
          </p>
          <div className='flex items-center gap-4'>
            <button
              type='button'
              onClick={() => navigate('/roadmaps')}
              className='px-6 py-3 bg-primary text-primary-foreground rounded-xl font-bold shadow-lg shadow-primary/30 hover:shadow-primary/50 transition-all'
            >
              {t('roadmap.explore')}
            </button>
            <button
              type='button'
              onClick={() => navigate('/dashboard/learning/learning-path')}
              className='px-6 py-3 border border-primary/20 text-primary rounded-xl font-bold hover:bg-primary/5 transition-all'
            >
              {t('roadmap.progress')}
            </button>
          </div>
        </div>

        <div className='w-full md:w-auto'>
          <div className='relative w-full max-w-[300px] aspect-square rounded-2xl overflow-hidden shadow-2xl rotate-3 group hover:rotate-0 transition-transform duration-500 border-4 border-card'>
            <img className='w-full h-full object-cover' src={ROADMAP_IMAGE} alt='Learning roadmap' />
            <div className='absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6'>
              <p className='text-primary-foreground font-bold text-lg'>{t('roadmap.journeyTitle')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
