import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { loadGapAnalysis, type GapAnalysisSkillView } from '../../lib/sprint2-api'

export function AnalysisHistoryTable() {
  const { t } = useTranslation('dashboard')
  const [items, setItems] = useState<GapAnalysisSkillView[]>([])
  const [loading, setLoading] = useState(true)
  const [baseDate] = useState(() => Date.now())

  useEffect(() => {
    let cancelled = false
    loadGapAnalysis('latest')
      .then((res) => {
        if (cancelled) return
        setItems(res.data ?? [])
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div className='bg-card border border-border rounded-2xl overflow-hidden shadow-sm'>
      {loading ? (
        <div className='p-6 text-sm text-muted-foreground'>{t('analysisHistory.loading')}</div>
      ) : items.length === 0 ? (
        <div className='p-6 text-sm text-muted-foreground'>{t('analysisHistory.empty')}</div>
      ) : (
        <>
          <div className='overflow-x-auto'>
            <table className='w-full text-left border-collapse'>
              <thead>
                <tr className='bg-muted/50'>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('analysisHistory.table.job')}</th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('analysisHistory.table.company')}</th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('analysisHistory.table.date')}</th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>{t('analysisHistory.table.match')}</th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right'>{t('analysisHistory.table.actions')}</th>
                </tr>
              </thead>
              <tbody className='divide-y divide-border'>
                {items.map((record, index) => (
                  <tr key={record.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='size-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary'>
                          <span className='material-symbols-outlined text-lg'>description</span>
                        </div>
                        <span className='font-bold text-foreground text-sm'>{record.name}</span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>JD #{index + 1}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>{new Date(baseDate - index * 86400000 * 4).toLocaleDateString('vi-VN')}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4'>
                        <div className='flex-1 h-2 w-24 bg-muted rounded-full overflow-hidden'>
                          <div className='h-full rounded-full bg-primary' style={{ width: `${Math.min(100, record.priorityScore * 10)}%` }} />
                        </div>
                        <span className='text-sm font-bold text-primary'>{Math.min(100, record.priorityScore * 10)}%</span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <button type='button' className='text-muted-foreground hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ml-auto'>
                        {t('analysisHistory.table.detail')}
                        <span className='material-symbols-outlined text-sm'>open_in_new</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border'>
            <p className='text-xs text-muted-foreground font-medium'>{t('analysisHistory.pagination.info')}</p>
            <div className='flex gap-2'>
              <button type='button' className='p-1 rounded-lg border border-border hover:bg-card disabled:opacity-50' disabled>
                <span className='material-symbols-outlined text-lg'>chevron_left</span>
              </button>
              <button type='button' className='px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-lg'>1</button>
              <button type='button' className='px-3 py-1 text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors'>2</button>
              <button type='button' className='px-3 py-1 text-muted-foreground text-xs font-bold rounded-lg hover:bg-muted transition-colors'>3</button>
              <button type='button' className='p-1 rounded-lg border border-border hover:bg-card'>
                <span className='material-symbols-outlined text-lg'>chevron_right</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
