import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation, useNavigate, useParams } from 'react-router'

import type { AddJdToCareerTrackCommand, CreateCareerTrackCommand, UpdateCareerTrackCommand } from '~/api/model'
import { QuotaExceededError } from '~/api/mutator/custom-fetch'
import { QuotaExceededModal } from '~/shared/components/quota-exceeded-modal'
import { getAuthSession } from '~/shared/lib/auth-session'

import {
  deleteCareerTracksId,
  deleteCareerTracksIdJdsJdId,
  loadCareerTrackById,
  loadCareerTracks,
  postCareerTracks,
  postCareerTracksIdJds,
  putCareerTracksId,
  type CareerTrackView,
} from '../lib/sprint2-api'

type CareerTrackJdView = {
  id: string
  title: string
  roadmapStatus?: string
  roadmapProgress?: number
}

type CareerTrackDetail = CareerTrackView & {
  jds: CareerTrackJdView[]
}

function normalizeTrack(data: unknown, fallback: CareerTrackView): CareerTrackDetail {
  if (!data || typeof data !== 'object') {
    return { ...fallback, jds: [] }
  }

  const raw = data as Record<string, unknown>
  const jdItems = Array.isArray(raw.jds)
    ? raw.jds
        .filter((item) => item && typeof item === 'object')
        .map((item, index) => {
          const jd = item as Record<string, unknown>
          const jdId = typeof jd.jdId === 'string' ? jd.jdId : typeof jd.id === 'string' ? jd.id : `jd-${index}`
          const title = typeof jd.jobTitle === 'string' ? jd.jobTitle : typeof jd.title === 'string' ? jd.title : 'JD'
          return {
            id: jdId,
            title,
            roadmapStatus: typeof jd.roadmapStatus === 'string' ? jd.roadmapStatus : undefined,
            roadmapProgress: typeof jd.roadmapProgress === 'number' ? jd.roadmapProgress : undefined,
          }
        })
    : []

  return {
    id: typeof raw.id === 'string' ? raw.id : fallback.id,
    name: typeof raw.name === 'string' ? raw.name : fallback.name,
    description: typeof raw.description === 'string' ? raw.description : fallback.description,
    jdCount: typeof raw.jdCount === 'number' ? raw.jdCount : jdItems.length || fallback.jdCount,
    progress: typeof raw.progress === 'number' ? raw.progress : fallback.progress,
    jds: jdItems,
  }
}

export function CareerTrackPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const session = getAuthSession()
  // Career Track là tài nguyên của chính user (FR4.5) — mọi user đăng nhập đều tự tạo/sửa/xoá track của mình.
  const canManage = Boolean(session?.user)
  const routeTrackId = typeof params.id === 'string' ? params.id : null
  const isSpecListRoute = location.pathname === '/career-tracks'
  const isSpecDetailRoute = location.pathname.startsWith('/career-tracks/') && Boolean(routeTrackId)

  const [tracks, setTracks] = useState<CareerTrackView[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<CareerTrackDetail | null>(null)
  const [listLoading, setListLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [jdInput, setJdInput] = useState('')

  const selectedTrack = useMemo(
    () => tracks.find((track) => track.id === selectedId) ?? tracks[0] ?? null,
    [selectedId, tracks]
  )
  const detailPanel = selectedTrack ? detail : null
  const selectedTrackName = selectedTrack?.name ?? ''
  const selectedTrackDescription = selectedTrack?.description ?? ''

  async function refreshTracks(nextSelectedId?: string | null) {
    const res = await loadCareerTracks()
    const nextTracks = res.data ?? []
    setTracks(nextTracks)

    const preferredId = nextSelectedId ?? selectedId
    const nextSelected = preferredId && nextTracks.some((track) => track.id === preferredId)
      ? preferredId
      : nextTracks[0]?.id ?? null

    setSelectedId(nextSelected)
  }

  useEffect(() => {
    let cancelled = false

    loadCareerTracks()
      .then((res) => {
        if (cancelled) return
        const items = res.data ?? []
        setTracks(items)
        const initialSelectedId = routeTrackId && items.some((track) => track.id === routeTrackId) ? routeTrackId : items[0]?.id ?? null
        setSelectedId(initialSelectedId)
        setError(null)
        setListLoading(false)
      })
      .catch((err) => {
        if (cancelled) return
        setError((err as Error).message || t('learningPath.careerTrack.errors.loadFailed'))
        setListLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [routeTrackId, t])

  useEffect(() => {
    if (!routeTrackId) return
    if (selectedId === routeTrackId) return
    if (tracks.some((track) => track.id === routeTrackId)) {
      queueMicrotask(() => setSelectedId(routeTrackId))
    }
  }, [routeTrackId, selectedId, tracks])
  useEffect(() => {
    if (!selectedTrack) {
      queueMicrotask(() => {
        setDetail(null)
        setName('')
        setDescription('')
      })
      return
    }

    const timer = window.setTimeout(() => {
      setName(selectedTrack.name)
      setDescription(selectedTrack.description ?? '')
      setDetailLoading(true)
    }, 0)

    let cancelled = false

    loadCareerTrackById(selectedTrack.id)
      .then((res) => {
        if (cancelled) return
        setDetail(normalizeTrack(res.data, selectedTrack))
        setDetailLoading(false)
      })
      .catch(() => {
        if (cancelled) return
        setDetail({ ...selectedTrack, jds: [] })
        setDetailLoading(false)
      })

    return () => {
      cancelled = true
      window.clearTimeout(timer)
    }
  }, [selectedTrack])

  async function handleCreate() {
    if (!name.trim()) {
      setError(t('learningPath.careerTrack.errors.nameRequired'))
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload: CreateCareerTrackCommand = {
        name: name.trim() || null,
        description: description.trim() || null,
      }
      await postCareerTracks(payload)
      setName('')
      setDescription('')
      await refreshTracks()
    } catch (err) {
      if (err instanceof QuotaExceededError) throw err
      setError((err as Error).message || t('learningPath.careerTrack.errors.createFailed'))
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate() {
    if (!selectedTrack) return
    if (!name.trim()) {
      setError(t('learningPath.careerTrack.errors.nameRequired'))
      return
    }

    try {
      setBusy(true)
      setError(null)
      const payload: UpdateCareerTrackCommand = {
        id: selectedTrack.id,
        name: name.trim() || selectedTrack.name,
        description: description.trim() || selectedTrack.description || null,
      }
      await putCareerTracksId({ id: selectedTrack.id }, payload)
      await refreshTracks(selectedTrack.id)
    } catch (err) {
      if (err instanceof QuotaExceededError) throw err
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
      const payload: AddJdToCareerTrackCommand = { careerTrackId: selectedTrack.id, jdId: jdInput.trim() }
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
    <div className='p-8 space-y-6'>
      <QuotaExceededModal />

      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-extrabold text-foreground tracking-tight'>{t('learningPath.careerTrack.title')}</h2>
          <p className='text-muted-foreground mt-1'>{t('learningPath.careerTrack.subtitle')}</p>
        </div>
        <Link to='/dashboard/analytics/gap-analysis' className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background'>
          <span className='material-symbols-outlined text-sm'>add</span>
          {t('learningPath.careerTrack.newFromAnalysis')}
        </Link>
      </div>

      {error ? (
        <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
          {error}
        </div>
      ) : null}

      <div className='grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6'>
        <aside className='bg-card border border-border rounded-2xl p-4 space-y-3'>
          <div className='flex items-center justify-between'>
            <h3 className='text-sm font-bold uppercase tracking-widest text-muted-foreground'>
              {t('learningPath.careerTrack.listTitle')}
            </h3>
            <span className='text-xs text-muted-foreground'>{tracks.length}</span>
          </div>

          {listLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className='rounded-xl border border-border p-4 animate-pulse'>
                  <div className='h-4 w-2/3 bg-muted rounded' />
                  <div className='h-3 w-1/3 bg-muted rounded mt-3' />
                  <div className='h-3 w-full bg-muted rounded mt-3' />
                </div>
              ))}
            </div>
          ) : tracks.length === 0 ? (
            <div className='rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <span className='material-symbols-outlined'>route</span>
              </div>
              <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.empty')}</div>
              {canManage ? <div className='mt-2 text-muted-foreground'>{t('learningPath.careerTrack.emptyAdminHint')}</div> : null}
              <div className='mt-4'>
                <Link to='/dashboard/analytics/gap-analysis' className='inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'>
                  <span className='material-symbols-outlined text-sm'>add</span>
                  {t('learningPath.careerTrack.newFromAnalysis')}
                </Link>
              </div>
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
                className={`w-full text-left rounded-xl border px-4 py-3 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card ${selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}
              >
                <div className='font-bold text-foreground'>{track.name}</div>
                <div className='text-xs text-muted-foreground'>{t('learningPath.careerTrack.trackMeta', { count: track.jdCount })}</div>
                {track.description ? (
                  <div className='text-xs text-muted-foreground mt-1 line-clamp-2'>{track.description}</div>
                ) : null}
              </button>
            ))
          )}
        </aside>

        <section className='bg-card border border-border rounded-2xl p-6 space-y-5'>
          {!selectedTrack ? (
            <div className='rounded-xl border border-dashed border-border bg-muted/10 p-6 text-sm text-center'>
              <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                <span className='material-symbols-outlined'>ads_click</span>
              </div>
              <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.emptySelection')}</div>
              <div className='mt-2 text-muted-foreground'>{t('learningPath.careerTrack.jdListSubtitle')}</div>
            </div>
          ) : (
            <>
              <div className='flex flex-col gap-3 border-b border-border pb-5 md:flex-row md:items-start md:justify-between'>
                <div className='space-y-3'>
                  <div className='flex flex-wrap items-center gap-2'>
                    <span className='rounded-full bg-primary/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary'>
                      {canManage ? t('learningPath.careerTrack.manageBadge') : t('learningPath.careerTrack.detailBadge')}
                    </span>
                    <span className='rounded-full border border-border bg-muted/20 px-3 py-1 text-xs font-medium text-muted-foreground'>
                      {t('learningPath.careerTrack.quickStats', { count: detailPanel?.jds.length ?? selectedTrack.jdCount })}
                    </span>
                  </div>
                  <h3 className='text-2xl font-bold text-foreground'>{selectedTrackName}</h3>
                  <p className='text-sm text-muted-foreground'>
                    {selectedTrackDescription || t('learningPath.careerTrack.noDescription')}
                  </p>
                  <p className='text-xs text-muted-foreground'>{t('learningPath.careerTrack.selectionHint')}</p>
                </div>
                <div className='flex flex-wrap gap-2'>
                  {isSpecDetailRoute ? (
                    <Link
                      to='/career-tracks'
                      className='inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                    >
                      <span className='material-symbols-outlined text-sm'>arrow_back</span>
                      {t('learningPath.careerTrack.backToList')}
                    </Link>
                  ) : null}
                  <Link
                    to={`/career-tracks/${encodeURIComponent(selectedTrack.id)}`}
                    className='inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'
                  >
                    <span className='material-symbols-outlined text-sm'>open_in_new</span>
                    {isSpecDetailRoute ? t('learningPath.careerTrack.openStandalone') : t('learningPath.careerTrack.openDetailRoute')}
                  </Link>
                  {isSpecListRoute ? (
                    <span className='inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-xs font-semibold text-primary'>
                      {t('learningPath.careerTrack.selectionHint')}
                    </span>
                  ) : null}
                </div>
              </div>

              {canManage ? (
                <>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <label className='space-y-2 text-sm'>
                      <span className='font-semibold text-foreground'>{t('learningPath.careerTrack.form.name')}</span>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder={t('learningPath.careerTrack.form.namePlaceholder')}
                        className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30'
                      />
                    </label>
                    <label className='space-y-2 text-sm'>
                      <span className='font-semibold text-foreground'>{t('learningPath.careerTrack.form.description')}</span>
                      <input
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder={t('learningPath.careerTrack.form.descriptionPlaceholder')}
                        className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary focus-visible:ring-2 focus-visible:ring-primary/30'
                      />
                    </label>
                  </div>
                  <div className='flex flex-wrap gap-3'>
                    <button type='button' disabled={busy} onClick={handleCreate} className='px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'>
                      {t('learningPath.careerTrack.actions.create')}
                    </button>
                    <button type='button' disabled={busy || !selectedTrack} onClick={handleUpdate} className='px-4 py-2 rounded-lg border border-border font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'>
                      {t('learningPath.careerTrack.actions.update')}
                    </button>
                    <button type='button' disabled={busy || !selectedTrack} onClick={handleDelete} className='px-4 py-2 rounded-lg border border-destructive/30 text-destructive font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'>
                      {t('learningPath.careerTrack.actions.delete')}
                    </button>
                  </div>
                </>
              ) : (
                <div className='rounded-xl border border-border bg-muted/20 p-4 text-sm text-muted-foreground'>
                  {t('learningPath.careerTrack.permissions')}
                </div>
              )}

              <div className='border-t border-border pt-5 space-y-4'>
                <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
                  <div>
                    <h4 className='text-lg font-semibold text-foreground'>{t('learningPath.careerTrack.jdListTitle')}</h4>
                    <p className='text-sm text-muted-foreground'>{t('learningPath.careerTrack.jdListSubtitle')}</p>
                  </div>
                  {canManage ? (
                    <div className='flex gap-3 w-full md:max-w-md'>
                      <input
                        value={jdInput}
                        onChange={(e) => setJdInput(e.target.value)}
                        placeholder={t('learningPath.careerTrack.form.jdPlaceholder')}
                        className='flex-1 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary'
                      />
                      <button type='button' disabled={busy || !selectedTrack} onClick={handleAddJd} className='px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card'>
                        {t('learningPath.careerTrack.actions.addJd')}
                      </button>
                    </div>
                  ) : null}
                </div>

                {detailLoading ? (
                  <div className='space-y-3'>
                    {Array.from({ length: 3 }).map((_, index) => (
                      <div key={index} className='rounded-xl border border-border p-4 animate-pulse'>
                        <div className='h-4 w-1/2 bg-muted rounded' />
                        <div className='h-3 w-1/3 bg-muted rounded mt-3' />
                      </div>
                    ))}
                  </div>
                ) : (detailPanel?.jds ?? []).length === 0 ? (
                  <div className='rounded-xl border border-dashed border-border bg-muted/10 p-5 text-sm text-center'>
                    <div className='mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      <span className='material-symbols-outlined'>work_history</span>
                    </div>
                    <div className='font-semibold text-foreground'>{t('learningPath.careerTrack.emptyJds')}</div>
                    {canManage ? <div className='mt-2 text-muted-foreground'>{t('learningPath.careerTrack.form.jdPlaceholder')}</div> : null}
                  </div>
                ) : (
                  <div className='space-y-2'>
                    {(detailPanel?.jds ?? []).map((jd) => (
                      <div key={jd.id} className='flex flex-col md:flex-row md:items-center md:justify-between gap-3 rounded-xl border border-border px-4 py-3'>
                        <div>
                          <div className='text-sm font-medium text-foreground'>{jd.title}</div>
                          <div className='text-xs text-muted-foreground'>
                            {typeof jd.roadmapProgress === 'number'
                              ? t('learningPath.careerTrack.jdRoadmapProgress', { progress: jd.roadmapProgress })
                              : t('learningPath.careerTrack.jdNoRoadmap')}
                          </div>
                        </div>
                        {canManage ? (
                          <button type='button' onClick={() => void handleRemoveJd(jd.id)} className='text-sm text-destructive font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-card rounded-md'>
                            {t('learningPath.careerTrack.actions.removeJd')}
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
