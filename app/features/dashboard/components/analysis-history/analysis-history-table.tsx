import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

import { loadGapAnalysis, loadRecentJds } from '../../lib/sprint2-api'

type HistoryRecord = {
  id: string
  jobTitle: string
  createdAt?: string
  scorePercent: number
  skillCount: number
}

export function AnalysisHistoryTable() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    loadRecentJds()
      .then((res) => {
        const jds = (res.data ?? []).filter((jd) => jd.parseStatus.toLowerCase() === 'completed')
        return Promise.all(
          jds.map(async (jd) => {
            const analysis = await loadGapAnalysis(jd.id)
            return {
              id: jd.id,
              jobTitle: jd.jobTitle,
              createdAt: jd.createdAt,
              scorePercent: analysis.data?.meta.scorePercent ?? 0,
              skillCount: analysis.data?.skills.length ?? 0,
            }
          }),
        )
      })
      .then((records) => {
        if (!cancelled) setItems((records ?? []).filter((record) => record.skillCount > 0))
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
        <div className='p-6'>
          <div className='rounded-2xl border border-dashed border-border bg-muted/10 px-6 py-10 text-center'>
            <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>insights</span>
            </div>
            <p className='text-sm font-semibold text-foreground'>{t('analysisHistory.empty')}</p>
            <p className='mt-2 text-sm text-muted-foreground'>{t('analysisHistory.loading')}</p>
          </div>
        </div>
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
                {items.map((record) => (
                  <tr key={record.id} className='hover:bg-muted/30 transition-colors'>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-3'>
                        <div className='size-8 rounded-lg flex items-center justify-center bg-primary/10 text-primary'>
                          <span className='material-symbols-outlined text-lg'>description</span>
                        </div>
                        <span className='font-bold text-foreground text-sm'>{record.jobTitle}</span>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>{t('analysisHistory.table.skillsCount', { count: record.skillCount })}</span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4'>
                        <div className='flex-1 h-2 w-24 bg-muted rounded-full overflow-hidden'>
                          <div className='h-full rounded-full bg-primary' style={{ width: `${Math.min(100, record.scorePercent)}%` }} />
                        </div>
                        <span className='text-sm font-bold text-primary'>{Math.min(100, record.scorePercent)}%</span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <button
                        type='button'
                        onClick={() => navigate(`/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(record.id)}`)}
                        className='text-muted-foreground hover:text-primary transition-colors text-sm font-bold flex items-center gap-1 ml-auto'
                      >
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
            <p className='text-xs text-muted-foreground font-medium'>{t('analysisHistory.pagination.loaded', { count: items.length })}</p>
          </div>
        </>
      )}
    </div>
  )
}
