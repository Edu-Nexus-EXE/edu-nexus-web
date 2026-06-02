import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'

import { QuotaExceededModal } from '~/shared/components/quota-exceeded-modal'

import {
  loadCareerTracks,
  loadCareerTrackById,
  postCareerTracks,
  putCareerTracksId,
  deleteCareerTracksId,
  postCareerTracksIdJds,
  deleteCareerTracksIdJdsJdId,
  type CareerTrackView,
} from '../lib/sprint2-api'
import type { CreateCareerTrackCommand, UpdateCareerTrackCommand } from '~/api/model'
import {
  MOCK_CAREER_TRACK,
  MOCK_CAREER_TRACKS,
} from '../lib/sprint2-mock-data'

type CareerTrackDetail = CareerTrackView & {
  jds: { id: string; title: string }[]
}

function normalizeTrack(data: unknown, fallbackId: string): CareerTrackDetail | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>
  const jds = Array.isArray(d.jds)
    ? (d.jds as { id?: unknown; title?: unknown }[])
        .filter((j) => j?.id && j?.title)
        .map((j) => ({ id: String(j.id), title: String(j.title) }))
    : []
  return {
    id: String(d.id ?? fallbackId),
    name: String(d.name ?? 'Career Track'),
    description: typeof d.description === 'string' ? d.description : undefined,
    jdCount: typeof d.jdCount === 'number' ? d.jdCount : jds.length,
    progress: typeof d.progress === 'number' ? d.progress : undefined,
    jds,
  }
}

export function CareerTrackPage() {
  const { t } = useTranslation('dashboard')
  const [tracks, setTracks] = useState<CareerTrackView[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [detail, setDetail] = useState<CareerTrackDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [jdInput, setJdInput] = useState('')

  const selectedTrack = useMemo(() => tracks.find((track) => track.id === selectedId) ?? tracks[0] ?? null, [tracks, selectedId])

  useEffect(() => {
    let cancelled = false
    loadCareerTracks()
      .then((res) => {
        if (cancelled) return
        setTracks(res.data ?? [])
        const first = res.data?.[0]
        setTimeout(() => {
          if (!cancelled) setSelectedId(first?.id ?? null)
        }, 0)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!selectedTrack) return
    let cancelled = false

    setTimeout(() => {
      if (!cancelled) setLoading(true)
    }, 0)

    loadCareerTrackById(selectedTrack.id)
      .then((res) => {
        if (cancelled) return
        if (res.data) {
          setDetail({ ...res.data, jds: (res.data as unknown as { jds?: { id: string; title: string }[] }).jds ?? [] })
        } else {
          setDetail({ ...selectedTrack, jds: [] })
        }
      })
      .catch(() => {
        if (!cancelled) setDetail({ ...selectedTrack, jds: [] })
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [selectedTrack])

  async function refresh() {
    const res = await loadCareerTracks()
    setTracks(res.data ?? [])
  }

  async function handleCreate() {
    try {
      setBusy(true)
      setError(null)
      const payload: CreateCareerTrackCommand = { name: name.trim() || null, description: description.trim() || null }
      await postCareerTracks(payload)
      await refresh()
      setName('')
      setDescription('')
    } catch (err) {
      if (err instanceof QuotaExceededError) throw err
      setError((err as Error).message || 'Failed to create career track')
    } finally {
      setBusy(false)
    }
  }

  async function handleUpdate() {
    if (!selectedTrack) return
    try {
      setBusy(true)
      setError(null)
      const payload: UpdateCareerTrackCommand = { id: selectedTrack.id, name: name.trim() || selectedTrack.name, description: description.trim() || selectedTrack.description || null }
      await putCareerTracksId({ id: selectedTrack.id }, payload)
      await refresh()
    } catch (err) {
      if (err instanceof QuotaExceededError) throw err
      setError((err as Error).message || 'Failed to update career track')
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!selectedTrack) return
    try {
      setBusy(true)
      await deleteCareerTracksId({ id: selectedTrack.id })
      await refresh()
      setSelectedId(null)
    } finally {
      setBusy(false)
    }
  }

  async function handleAddJd() {
    if (!selectedTrack || !jdInput.trim()) return
    try {
      setBusy(true)
      await postCareerTracksIdJds({ id: selectedTrack.id }, { jdId: jdInput.trim() } as never)
      setJdInput('')
      await refresh()
    } finally {
      setBusy(false)
    }
  }

  async function handleRemoveJd(jdId: string) {
    if (!selectedTrack) return
    setBusy(true)
    await deleteCareerTracksIdJdsJdId({ id: selectedTrack.id, jdId })
    setBusy(false)
    await refresh()
  }

  return (
    <div className='p-8 space-y-6'>
      <QuotaExceededModal />
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div>
          <h2 className='text-3xl font-extrabold text-foreground tracking-tight'>{t('careerTrack.title')}</h2>
          <p className='text-muted-foreground mt-1'>{t('careerTrack.subtitle')}</p>
        </div>
        <Link to='/dashboard/analytics/gap-analysis' className='inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold'>
          <span className='material-symbols-outlined text-sm'>add</span>
          {t('careerTrack.newFromAnalysis')}
        </Link>
      </div>

      {error ? <div className='rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>{error}</div> : null}

      <div className='grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6'>
        <aside className='bg-card border border-border rounded-2xl p-4 space-y-3'>
          {loading ? <div className='text-sm text-muted-foreground'>{t('careerTrack.loading')}</div> : tracks.map((track) => (
            <button key={track.id} type='button' onClick={() => setSelectedId(track.id)} className={`w-full text-left rounded-xl border px-4 py-3 transition-colors ${selectedTrack?.id === track.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'}`}>
              <div className='font-bold text-foreground'>{track.name}</div>
              <div className='text-xs text-muted-foreground'>{track.jdCount} JDs</div>
            </button>
          ))}
        </aside>

        <section className='bg-card border border-border rounded-2xl p-6 space-y-5'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <label className='space-y-2 text-sm'>
              <span className='font-semibold text-foreground'>{t('careerTrack.form.name')}</span>
              <input value={name} onChange={(e) => setName(e.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            </label>
            <label className='space-y-2 text-sm'>
              <span className='font-semibold text-foreground'>{t('careerTrack.form.description')}</span>
              <input value={description} onChange={(e) => setDescription(e.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            </label>
          </div>
          <div className='flex flex-wrap gap-3'>
            <button type='button' disabled={busy} onClick={handleCreate} className='px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50'>{t('careerTrack.actions.create')}</button>
            <button type='button' disabled={busy || !selectedTrack} onClick={handleUpdate} className='px-4 py-2 rounded-lg border border-border font-semibold disabled:opacity-50'>{t('careerTrack.actions.update')}</button>
            <button type='button' disabled={busy || !selectedTrack} onClick={handleDelete} className='px-4 py-2 rounded-lg border border-destructive/30 text-destructive font-semibold disabled:opacity-50'>{t('careerTrack.actions.delete')}</button>
          </div>

          <div className='border-t border-border pt-5'>
            <div className='flex gap-3'>
              <input value={jdInput} onChange={(e) => setJdInput(e.target.value)} placeholder='JD ID' className='flex-1 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
              <button type='button' disabled={busy || !selectedTrack} onClick={handleAddJd} className='px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold disabled:opacity-50'>{t('careerTrack.actions.addJd')}</button>
            </div>
            <div className='mt-4 space-y-2'>
              {(detail?.jds ?? []).map((jd) => (
                <div key={jd.id} className='flex items-center justify-between rounded-xl border border-border px-4 py-3'>
                  <span className='text-sm font-medium'>{jd.title}</span>
                  <button type='button' onClick={() => handleRemoveJd(jd.id)} className='text-sm text-destructive font-semibold'>{t('careerTrack.actions.removeJd')}</button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
