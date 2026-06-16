import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { loadGapAnalysis, loadRecentJds, loadRoadmapOverview, type RoadmapView } from '../../lib/sprint2-api'

type HistoryRecord = {
  id: string
  jobTitle: string
  createdAt?: string
  scorePercent: number
  skillCount: number
  hasGapAnalysis: boolean
  roadmapId?: string
}

function isUsableRoadmap(roadmap: RoadmapView) {
  const status = roadmap.status.toLowerCase()
  return status !== 'archived' && status !== 'failed'
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
            // Cố gắng lấy gap analysis. Nếu JD chưa được chạy gap thì API sẽ trả lỗi
            // (vd 404) — ta vẫn giữ record để user thấy lịch sử JD đã phân tích xong.
            const [analysis, roadmaps] = await Promise.all([
              loadGapAnalysis(jd.id),
              loadRoadmapOverview({ jdId: jd.id })
            ])
            const analysisData = analysis.data
            return {
              id: jd.id,
              jobTitle: jd.jobTitle,
              createdAt: jd.createdAt,
              scorePercent: analysisData?.meta.scorePercent ?? 0,
              skillCount: analysisData?.skills.length ?? 0,
              hasGapAnalysis: Boolean(analysisData && analysisData.skills.length > 0),
              roadmapId: ((roadmaps.data ?? []).find(isUsableRoadmap) ?? (roadmaps.data ?? [])[0])?.id
            }
          })
        )
      })
      .then((records) => {
        if (!cancelled) setItems(records ?? [])
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
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    {t('analysisHistory.table.job')}
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    {t('analysisHistory.table.company')}
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    {t('analysisHistory.table.date')}
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider'>
                    {t('analysisHistory.table.match')}
                  </th>
                  <th className='px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right'>
                    {t('analysisHistory.table.actions')}
                  </th>
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
                        <Link
                          to={`/dashboard/jd/${encodeURIComponent(record.id)}`}
                          className='text-sm font-bold text-foreground transition-colors hover:text-primary hover:underline'
                        >
                          {record.jobTitle}
                        </Link>
                      </div>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>
                        {record.hasGapAnalysis
                          ? t('analysisHistory.table.skillsCount', { count: record.skillCount })
                          : t('analysisHistory.table.noGapAnalysis')}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <span className='text-sm text-muted-foreground'>
                        {record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : '-'}
                      </span>
                    </td>
                    <td className='px-6 py-5'>
                      <div className='flex items-center gap-4'>
                        <div className='flex-1 h-2 w-24 bg-muted rounded-full overflow-hidden'>
                          <div
                            className='h-full rounded-full bg-primary'
                            style={{ width: `${Math.min(100, record.scorePercent)}%` }}
                          />
                        </div>
                        <span className='text-sm font-bold text-primary'>{Math.min(100, record.scorePercent)}%</span>
                      </div>
                    </td>
                    <td className='px-6 py-5 text-right'>
                      <div className='flex flex-wrap justify-end gap-2'>
                        <button
                          type='button'
                          onClick={() =>
                            navigate(`/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(record.id)}`)
                          }
                          className='inline-flex items-center gap-1 rounded-lg border border-border px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary'
                        >
                          <span className='material-symbols-outlined text-sm'>analytics</span>
                          {record.hasGapAnalysis
                            ? t('analysisHistory.table.viewAnalysis')
                            : t('analysisHistory.table.runAnalysis')}
                        </button>
                        {record.hasGapAnalysis ? (
                          <button
                            type='button'
                            onClick={() =>
                              navigate(
                                record.roadmapId
                                  ? `/roadmaps?roadmapId=${encodeURIComponent(record.roadmapId)}`
                                  : `/roadmaps?jdId=${encodeURIComponent(record.id)}`
                              )
                            }
                            className='inline-flex items-center gap-1 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground transition hover:opacity-90'
                          >
                            <span className='material-symbols-outlined text-sm'>route</span>
                            {t('analysisHistory.table.viewRoadmap')}
                          </button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className='px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border'>
            <p className='text-xs text-muted-foreground font-medium'>
              {t('analysisHistory.pagination.loaded', { count: items.length })}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
