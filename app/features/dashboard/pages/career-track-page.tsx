import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router'

import type { AddJdToCareerTrackCommand, CreateCareerTrackCommand, UpdateCareerTrackCommand } from '~/api/model'
import { QuotaExceededModal } from '~/shared/components/quota-exceeded-modal'
import { getAuthSession } from '~/shared/lib/auth-session'

import {
  deleteCareerTracksId,
  deleteCareerTracksIdJdsJdId,
  loadCareerTrackById,
  loadCareerTracks,
  loadRecentJds,
  postCareerTracks,
  postCareerTracksIdJds,
  putCareerTracksId,
  type CareerTrackDetailView,
  type CareerTrackView,
  type JdRecentItem
} from '../lib/sprint2-api'

function getResponseId(response: unknown) {
  const data = (response as { data?: unknown })?.data
  if (!data || typeof data !== 'object') return null
  const id = (data as { id?: unknown }).id
  return typeof id === 'string' ? id : null
}

function formatDate(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(date)
}

export function CareerTrackPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const session = getAuthSession()
  const canManage = Boolean(session?.user)
  const routeTrackId = typeof params.id === 'string' ? params.id : null
  const isSpecDetailRoute = location.pathname.startsWith('/career-tracks/') && Boolean(routeTrackId)

  const [tracks, setTracks] = useState<CareerTrackView[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<CareerTrackDetailView | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createName, setCreateName] = useState('')
  const [createDescription, setCreateDescription] = useState('')
  const [editName, setEditName] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [jdInput, setJdInput] = useState('')
  const [availableJds, setAvailableJds] = useState<JdRecentItem[]>([])
  const [jdsLoading, setJdsLoading] = useState(false)

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedId) ?? tracks[0] ?? null,
    [selectedId, tracks]
  )
  const selectableJds = useMemo(() => {
    const usedIds = new Set((detail?.jds ?? []).map((jd) => jd.id))
    return availableJds.filter((jd) => {
      const status = jd.parseStatus.toLowerCase()
      return !usedIds.has(jd.id) && ['completed', 'success', 'succeeded', 'parsed'].includes(status)
    })
  }, [availableJds, detail?.jds])

  async function refreshTracks(nextSelectedId?: string | null) {
    const res = await loadCareerTracks()
    if (res.error) setError(res.error)
    const nextTracks = res.data ?? []
    setTracks(nextTracks)

    const preferredId = nextSelectedId ?? selectedId
    const nextSelected =
      preferredId && nextTracks.some((track) => track.id === preferredId) ? preferredId : (nextTracks[0]?.id ?? null)

    setSelectedId(nextSelected)
    return nextTracks
  }

  useEffect(() => {
    let cancelled = false

    loadCareerTracks()
      .then((res) => {
        if (cancelled) return
        const items = res.data ?? []
        setTracks(items)
        setSelectedId(
          routeTrackId && items.some((track) => track.id === routeTrackId) ? routeTrackId : (items[0]?.id ?? null)
        )
        setError(res.error)
      })
      .catch((err) => {
        if (!cancelled) setError((err as Error).message || t('learningPath.careerTrack.errors.loadFailed'))
      })
      .finally(() => {
        if (!cancelled) setListLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [routeTrackId, t])

  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => setJdsLoading(true))

    loadRecentJds({ pageSize: 50 })
      .then((res) => {
        if (cancelled) return
        setAvailableJds(res.data ?? [])
      })
      .finally(() => {
        if (!cancelled) setJdsLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!routeTrackId || selectedId === routeTrackId) return
    if (tracks.some((track) => track.id === routeTrackId)) {
      queueMicrotask(() => setSelectedId(routeTrackId))
    }
  }, [routeTrackId, selectedId, tracks])

  useEffect(() => {
    if (!selectedTrack) {
      queueMicrotask(() => {
        setDetail(null)
        setEditName('')
        setEditDescription('')
      })
      return
    }

    let cancelled = false
    queueMicrotask(() => setDetailLoading(true))

    loadCareerTrackById(selectedTrack.id)
      .then((res) => {
        if (cancelled) return
        const nextDetail: CareerTrackDetailView = res.data ?? { ...selectedTrack, jds: [] }
        setDetail(nextDetail)
        setEditName(nextDetail.name)
        setEditDescription(nextDetail.description ?? '')
        setError((current) => current || res.error)
      })
      .catch((err) => {
        if (cancelled) return
        setDetail({ ...selectedTrack, jds: [] })
        setEditName(selectedTrack.name)
        setEditDescription(selectedTrack.description ?? '')
        setError((err as Error).message || t('learningPath.careerTrack.errors.loadFailed'))
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedTrack, t])

  async function handleCreate() {
    if (!createName.trim()) {
      setError(t('learningPath.careerTrack.errors.nameRequired'))
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload: CreateCareerTrackCommand = {
        name: createName.trim(),
        description: createDescription.trim() || null
      }
      const response = await postCareerTracks(payload)
      const nextId = getResponseId(response)
      setCreateName('')
      setCreateDescription('')
      await refreshTracks(nextId)
      if (nextId) navigate(`/career-tracks/${encodeURIComponent(nextId)}`)
    } catch (err) {
      setError((err as Error).message || t('learningPath.careerTrack.errors.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate() {
    if (!selectedTrack) return
    if (!editName.trim()) {
      setError(t('learningPath.careerTrack.errors.nameRequired'))
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload: UpdateCareerTrackCommand = {
        id: selectedTrack.id,
        name: editName.trim(),
        description: editDescription.trim() || null
      }
      await putCareerTracksId({ id: selectedTrack.id }, payload)
      await refreshTracks(selectedTrack.id)
    } catch (err) {
      setError((err as Error).message || t('learningPath.careerTrack.errors.updateFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!selectedTrack) return
    if (!window.confirm(t('learningPath.careerTrack.confirmDelete', { name: selectedTrack.name }))) return

    try {
      setBusy(true)
      setError(null)
      await deleteCareerTracksId({ id: selectedTrack.id })
      await refreshTracks(null)
      navigate('/career-tracks')
    } catch (err) {
      setError((err as Error).message || t('learningPath.careerTrack.errors.deleteFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleAddJd() {
    if (!selectedTrack) return
    if (!jdInput.trim()) {
      setError(t('learningPath.careerTrack.errors.jdRequired'))
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload: AddJdToCareerTrackCommand = {
        careerTrackId: selectedTrack.id,
        jdId: jdInput.trim()
      }
      await postCareerTracksIdJds({ id: selectedTrack.id }, payload)
      setJdInput('')
      await refreshTracks(selectedTrack.id)
    } catch (err) {
      setError((err as Error).message || t('learningPath.careerTrack.errors.addJdFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveJd(jdId: string) {
    if (!selectedTrack) return
    if (!window.confirm(t('learningPath.careerTrack.confirmRemoveJd'))) return

    try {
      setBusy(true)
      setError(null)
      await deleteCareerTracksIdJdsJdId({ id: selectedTrack.id, jdId })
      await refreshTracks(selectedTrack.id)
    } catch (err) {
      setError((err as Error).message || t('learningPath.careerTrack.errors.removeJdFailed'))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className='space-y-6 p-8'>
      <QuotaExceededModal />

      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
        <div>
          <h2 className='text-3xl font-extrabold tracking-tight text-foreground'>
            {t('learningPath.careerTrack.title')}
          </h2>
          <p className='mt-1 text-muted-foreground'>{t('learningPath.careerTrack.subtitle')}</p>
        </div>
        {isSpecDetailRoute ? (
          <Link
            to='/career-tracks'
            className='inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/40'
          >
            <span className='material-symbols-outlined text-sm'>arrow_back</span>
            {t('learningPath.careerTrack.backToList')}
          </Link>
        ) : null}
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      <div className='grid grid-cols-1 gap-6 xl:grid-cols-[340px_minmax(0,1fr)]'>
        <aside className='space-y-4'>
          {canManage ? (
            <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
              <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>
                {t('learningPath.careerTrack.createTitle')}
              </h3>
              <div className='mt-4 space-y-3'>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder={t('learningPath.careerTrack.form.namePlaceholder')}
                  className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                />
                <textarea
                  value={createDescription}
                  onChange={(e) => setCreateDescription(e.target.value)}
                  placeholder={t('learningPath.careerTrack.form.descriptionPlaceholder')}
                  className='min-h-24 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                />
                <button
                  type='button'
                  disabled={busy}
                  onClick={() => void handleCreate()}
                  className='w-full rounded-xl bg-primary px-4 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50'
                >
                  {t('learningPath.careerTrack.actions.create')}
                </button>
              </div>
            </section>
          ) : null}

          <section className='rounded-2xl border border-border bg-card p-4 shadow-sm'>
            <div className='flex items-center justify-between'>
              <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>
                {t('learningPath.careerTrack.listTitle')}
              </h3>
              <span className='text-xs text-muted-foreground'>{tracks.length}</span>
            </div>

            <div className='mt-4 space-y-3'>
              {listLoading ? (
                Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className='animate-pulse rounded-xl border border-border p-4'>
                    <div className='h-4 w-2/3 rounded bg-muted' />
                    <div className='mt-3 h-3 w-1/2 rounded bg-muted' />
                  </div>
                ))
              ) : tracks.length === 0 ? (
                <div className='rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm'>
                  <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.empty')}</div>
                  <div className='mt-2 text-muted-foreground'>{t('learningPath.careerTrack.emptyAdminHint')}</div>
                </div>
              ) : (
                tracks.map((track) => (
                  <button
                    key={track.id}
                    type='button'
                    onClick={() => {
                      setSelectedId(track.id)
                      navigate(`/career-tracks/${encodeURIComponent(track.id)}`)
                    }}
                    className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
                      selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
                    }`}
                  >
                    <div className='flex items-start justify-between gap-3'>
                      <div className='min-w-0'>
                        <div className='truncate font-bold text-foreground'>{track.name}</div>
                        <div className='mt-1 text-xs text-muted-foreground'>
                          {t('learningPath.careerTrack.trackMeta', { count: track.jdCount })}
                        </div>
                      </div>
                      <span className='rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary'>
                        {track.progress}%
                      </span>
                    </div>
                    {track.description ? (
                      <div className='mt-2 line-clamp-2 text-xs text-muted-foreground'>{track.description}</div>
                    ) : null}
                  </button>
                ))
              )}
            </div>
          </section>
        </aside>

        <section className='rounded-2xl border border-border bg-card p-6 shadow-sm'>
          {!selectedTrack ? (
            <div className='rounded-xl border border-dashed border-border bg-muted/10 p-8 text-center text-sm'>
              <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.emptySelection')}</div>
              <div className='mt-2 text-muted-foreground'>{t('learningPath.careerTrack.jdListSubtitle')}</div>
            </div>
          ) : (
            <div className='space-y-6'>
              <div className='flex flex-col gap-4 border-b border-border pb-6 lg:flex-row lg:items-start lg:justify-between'>
                <div>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary'>
                      {t('learningPath.careerTrack.detailBadge')}
                    </span>
                    <span className='rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground'>
                      {t('learningPath.careerTrack.quickStats', { count: detail?.jds.length ?? selectedTrack.jdCount })}
                    </span>
                  </div>
                  <h3 className='mt-3 text-2xl font-bold text-foreground'>{detail?.name ?? selectedTrack.name}</h3>
                  <p className='mt-2 text-sm text-muted-foreground'>
                    {detail?.description || selectedTrack.description || t('learningPath.careerTrack.noDescription')}
                  </p>
                  <div className='mt-3 flex flex-wrap gap-3 text-xs text-muted-foreground'>
                    <span>
                      {t('learningPath.careerTrack.createdAt', {
                        date: formatDate(detail?.createdAt ?? selectedTrack.createdAt)
                      })}
                    </span>
                    <span>{t('learningPath.careerTrack.overallProgress', { progress: selectedTrack.progress })}</span>
                  </div>
                </div>
                <Link
                  to={`/career-tracks/${encodeURIComponent(selectedTrack.id)}`}
                  className='inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/40'
                >
                  <span className='material-symbols-outlined text-sm'>open_in_new</span>
                  {t('learningPath.careerTrack.openDetailRoute')}
                </Link>
              </div>

              {canManage ? (
                <div className='rounded-2xl border border-border bg-muted/10 p-4'>
                  <h4 className='font-bold text-foreground'>{t('learningPath.careerTrack.editTitle')}</h4>
                  <div className='mt-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
                    <input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={t('learningPath.careerTrack.form.name')}
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                    />
                    <input
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      placeholder={t('learningPath.careerTrack.form.description')}
                      className='w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                    />
                  </div>
                  <div className='mt-4 flex flex-wrap gap-3'>
                    <button
                      type='button'
                      disabled={busy}
                      onClick={() => void handleUpdate()}
                      className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50'
                    >
                      {t('learningPath.careerTrack.actions.update')}
                    </button>
                    <button
                      type='button'
                      disabled={busy}
                      onClick={() => void handleDelete()}
                      className='rounded-lg border border-destructive/30 px-4 py-2 text-sm font-semibold text-destructive disabled:opacity-50'
                    >
                      {t('learningPath.careerTrack.actions.delete')}
                    </button>
                  </div>
                </div>
              ) : (
                <div className='rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground'>
                  {t('learningPath.careerTrack.permissions')}
                </div>
              )}

              <div className='space-y-4 border-t border-border pt-6'>
                <div className='flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
                  <div>
                    <h4 className='text-lg font-semibold text-foreground'>
                      {t('learningPath.careerTrack.jdListTitle')}
                    </h4>
                    <p className='text-sm text-muted-foreground'>{t('learningPath.careerTrack.jdListSubtitle')}</p>
                  </div>
                  {canManage ? (
                    <div className='flex w-full gap-3 lg:max-w-md'>
                      <select
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                        className='min-w-0 flex-1 rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus:border-primary'
                      >
                        <option value=''>{jdsLoading ? 'Đang tải JD đã phân tích...' : 'Chọn JD đã phân tích'}</option>
                        {selectableJds.map((jd) => (
                          <option key={jd.id} value={jd.id}>
                            {jd.jobTitle} · {formatDate(jd.createdAt)}
                          </option>
                        ))}
                      </select>
                      <button
                        type='button'
                        disabled={busy || !jdInput}
                        onClick={() => void handleAddJd()}
                        className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50'
                      >
                        {t('learningPath.careerTrack.actions.addJd')}
                      </button>
                    </div>
                  ) : null}
                </div>

                {detailLoading ? (
                  <div className='space-y-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className='animate-pulse rounded-xl border border-border p-4'>
                        <div className='h-4 w-1/2 rounded bg-muted' />
                        <div className='mt-3 h-3 w-1/3 rounded bg-muted' />
                      </div>
                    ))}
                  </div>
                ) : (detail?.jds ?? []).length === 0 ? (
                  <div className='rounded-xl border border-dashed border-border bg-muted/10 p-5 text-center text-sm'>
                    <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.emptyJds')}</div>
                    {canManage ? (
                      <div className='mt-2 text-muted-foreground'>
                        {selectableJds.length > 0
                          ? 'Chọn một JD đã phân tích ở phía trên để thêm vào lộ trình.'
                          : 'Chưa có JD parse hoàn tất hoặc tất cả đã nằm trong lộ trình này.'}
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className='grid gap-3'>
                    {(detail?.jds ?? []).map((jd) => (
                      <article key={jd.id} className='rounded-xl border border-border bg-background/70 p-4'>
                        <div className='flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between'>
                          <div className='min-w-0'>
                            <Link
                              to={`/dashboard/jd/${encodeURIComponent(jd.id)}`}
                              className='font-semibold text-foreground transition-colors hover:text-primary hover:underline'
                            >
                              {jd.title}
                            </Link>
                            <div className='mt-1 flex flex-wrap gap-3 text-xs text-muted-foreground'>
                              <span>
                                {t('learningPath.careerTrack.jdRoadmapProgress', { progress: jd.roadmapProgress })}
                              </span>
                              <span>
                                {t('learningPath.careerTrack.roadmapStatus', { status: jd.roadmapStatus ?? 'None' })}
                              </span>
                              <span>{t('learningPath.careerTrack.addedAt', { date: formatDate(jd.addedAt) })}</span>
                            </div>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            <Link
                              to={`/dashboard/jd/${encodeURIComponent(jd.id)}`}
                              className='rounded-lg border border-border px-3 py-2 text-xs font-bold text-foreground hover:bg-muted/40'
                            >
                              {t('learningPath.careerTrack.actions.openJd')}
                            </Link>
                            <Link
                              to={`/roadmaps?jdId=${encodeURIComponent(jd.id)}`}
                              className='rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground hover:opacity-90'
                            >
                              {t('learningPath.careerTrack.actions.openRoadmap')}
                            </Link>
                            {canManage ? (
                              <button
                                type='button'
                                disabled={busy}
                                onClick={() => void handleRemoveJd(jd.id)}
                                className='rounded-lg border border-destructive/30 px-3 py-2 text-xs font-bold text-destructive disabled:opacity-50'
                              >
                                {t('learningPath.careerTrack.actions.removeJd')}
                              </button>
                            ) : null}
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
