import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useNavigate } from 'react-router'

import { loadAllRecentJds, loadGapAnalysis, loadRoadmapOverview, type RoadmapView } from '../../lib/sprint2-api'

type HistoryRecord = {
  id: string
  jobTitle: string
  createdAt?: string
  scorePercent: number
  skillCount: number
  hasGapAnalysis: boolean
  parseStatus: string
  roadmapId?: string
}

const STATUS_FILTERS = ['all', 'pending', 'processing', 'completed', 'failed'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

function isUsableRoadmap(roadmap: RoadmapView) {
  return roadmap.status.toLowerCase() === 'active'
}

function statusTone(status: string) {
  const normalized = status.toLowerCase()
  if (normalized === 'completed') return 'border-success/30 bg-success/10 text-success'
  if (normalized === 'failed') return 'border-destructive/30 bg-destructive/10 text-destructive'
  if (normalized === 'processing') return 'border-warning/30 bg-warning/10 text-warning'
  return 'border-border bg-muted text-muted-foreground'
}

export function AnalysisHistoryTable() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [items, setItems] = useState<HistoryRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')

  useEffect(() => {
    let cancelled = false

    Promise.all([loadAllRecentJds(), loadRoadmapOverview()])
      .then(([res, roadmapRes]) => {
        const jds = res.data ?? []
        const roadmaps = roadmapRes.data ?? []
        return Promise.all(
          jds.map(async (jd) => {
            // Cố gắng lấy gap analysis. Nếu JD chưa được chạy gap thì API sẽ trả lỗi
            // (vd 404) — ta vẫn giữ record để user thấy lịch sử JD đã phân tích xong.
            const analysis = await loadGapAnalysis(jd.id)
            const analysisData = analysis.data
            const activeRoadmap = roadmaps.find(
              (roadmap) => isUsableRoadmap(roadmap) && roadmap.jdId?.toLowerCase() === jd.id.toLowerCase()
            )
            return {
              id: jd.id,
              jobTitle: jd.jobTitle,
              createdAt: jd.createdAt,
              scorePercent: analysisData?.meta.scorePercent ?? 0,
              skillCount: analysisData?.skills.length ?? 0,
              hasGapAnalysis: Boolean(analysisData && analysisData.skills.length > 0),
              parseStatus: jd.parseStatus,
              roadmapId: activeRoadmap?.id
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

  const filteredItems = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return items.filter((item) => {
      const matchesName = !normalizedSearch || item.jobTitle.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || item.parseStatus.toLowerCase() === statusFilter
      return matchesName && matchesStatus
    })
  }, [items, search, statusFilter])

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
          <div className='flex flex-col gap-3 border-b border-border bg-muted/20 p-4 md:flex-row md:items-center md:justify-between'>
            <div className='relative w-full md:max-w-sm'>
              <span className='material-symbols-outlined pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-muted-foreground'>
                search
              </span>
              <input
                type='search'
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('analysisHistory.filters.searchPlaceholder', { defaultValue: 'Tìm theo tên JD...' })}
                className='h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm font-medium text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15'
              />
            </div>
            <div className='flex flex-wrap gap-2'>
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type='button'
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3.5 py-2 text-xs font-bold transition ${
                    statusFilter === status
                      ? 'border-primary bg-primary text-primary-foreground shadow-sm'
                      : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary'
                  }`}
                >
                  {t(`analysisHistory.filters.status.${status}`, {
                    defaultValue:
                      status === 'all'
                        ? 'Tất cả'
                        : status === 'pending'
                          ? 'Đang chờ'
                          : status === 'processing'
                            ? 'Đang xử lý'
                            : status === 'completed'
                              ? 'Hoàn thành'
                              : 'Thất bại'
                  })}
                </button>
              ))}
            </div>
          </div>
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
                    {t('analysisHistory.table.status', { defaultValue: 'Trạng thái' })}
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
                {filteredItems.map((record) => (
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
                      <span
                        className={`inline-flex rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${statusTone(
                          record.parseStatus
                        )}`}
                      >
                        {t(`analysisHistory.filters.status.${record.parseStatus.toLowerCase()}`, {
                          defaultValue: record.parseStatus
                        })}
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
                        {record.hasGapAnalysis && record.roadmapId ? (
                          <button
                            type='button'
                            onClick={() => navigate(`/roadmaps?roadmapId=${encodeURIComponent(record.roadmapId!)}`)}
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
            {filteredItems.length === 0 ? (
              <div className='border-t border-border p-6 text-center text-sm font-medium text-muted-foreground'>
                {t('analysisHistory.filters.noResults', { defaultValue: 'Không có JD nào khớp bộ lọc.' })}
              </div>
            ) : null}
          </div>
          <div className='px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border'>
            <p className='text-xs text-muted-foreground font-medium'>
              {t('analysisHistory.pagination.loaded', { count: filteredItems.length })}
            </p>
          </div>
        </>
      )}
    </div>
  )
}
