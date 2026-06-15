import { Fragment, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useSearchParams } from 'react-router'

import { useToast } from '~/shared/components'

import {
  loadRoadmapById,
  loadRoadmapOverview,
  loadRoadmapResources,
  triggerRoadmap,
  triggerRoadmapArchive,
  triggerRoadmapKeep,
  triggerRoadmapRegenerate,
  updateRoadmapNodeStatus,
  type RoadmapNodeView,
  type RoadmapResourceView,
  type RoadmapView,
} from '../lib/sprint2-api'

function resolveSelectedRoadmap(
  roadmaps: RoadmapView[],
  preferredRoadmapId: string | null,
  preferredJdId: string | null,
): RoadmapView | null {
  if (preferredRoadmapId) {
    const byId = roadmaps.find((item) => item.id === preferredRoadmapId)
    if (byId) return byId
  }

  if (preferredJdId) {
    const byJdId = roadmaps.filter((item) => item.jdId === preferredJdId)
    return byJdId.find(isUsableRoadmap) ?? null
  }

  return roadmaps.find(isUsableRoadmap) ?? roadmaps[0] ?? null
}

function resolveActiveNode(roadmap: RoadmapView | null, selectedNodeId: string | null) {
  if (!roadmap) return null
  return (
    roadmap.nodes.find((node) => node.id === selectedNodeId) ??
    roadmap.nodes.find((node) => node.status === 'active') ??
    roadmap.nodes.find((node) => node.status === 'future') ??
    roadmap.nodes[0] ??
    null
  )
}

function shouldPollRoadmap(status: string) {
  const normalized = status.toLowerCase()
  return normalized === 'generating' || normalized === 'pending' || normalized === 'processing' || normalized === 'queued'
}

function isUsableRoadmap(roadmap: RoadmapView) {
  const status = roadmap.status.toLowerCase()
  return status !== 'archived' && status !== 'failed'
}

function getCreatedRoadmapId(response: unknown) {
  const data = (response as { data?: unknown })?.data
  if (!data || typeof data !== 'object') return null

  const id = (data as { id?: unknown }).id
  return typeof id === 'string' && id.length > 0 ? id : null
}

function getNodeStatusClasses(status: RoadmapNodeView['status'], selected: boolean) {
  if (status === 'completed') {
    return selected
      ? 'border-emerald-300 bg-gradient-to-br from-emerald-50 via-teal-50 to-sky-50 text-emerald-700 shadow-lg shadow-emerald-500/15 dark:border-emerald-400/60 dark:from-emerald-500/20 dark:via-teal-500/15 dark:to-cyan-500/10 dark:text-emerald-100'
      : 'border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-teal-50/70 text-emerald-700 dark:border-emerald-400/25 dark:from-emerald-500/12 dark:to-teal-500/8 dark:text-emerald-100'
  }

  if (status === 'active') {
    return selected
      ? 'border-orange-300 bg-gradient-to-br from-orange-50 via-amber-50 to-rose-50 text-orange-700 shadow-xl shadow-orange-500/20 dark:border-orange-400/70 dark:from-orange-500/25 dark:via-amber-500/18 dark:to-rose-500/12 dark:text-orange-100'
      : 'border-orange-200 bg-gradient-to-br from-orange-50/80 to-amber-50/70 text-orange-700 dark:border-orange-400/30 dark:from-orange-500/14 dark:to-amber-500/10 dark:text-orange-100'
  }

  return selected
    ? 'border-sky-300 bg-gradient-to-br from-sky-50 via-cyan-50 to-indigo-50 text-sky-700 shadow-lg shadow-sky-500/15 dark:border-sky-400/65 dark:from-sky-500/22 dark:via-cyan-500/14 dark:to-indigo-500/12 dark:text-sky-100'
    : 'border-sky-100 bg-gradient-to-br from-sky-50/70 to-indigo-50/50 text-sky-700 dark:border-sky-400/25 dark:from-sky-500/12 dark:to-indigo-500/8 dark:text-sky-100'
}

function getNodeIconClasses(status: RoadmapNodeView['status']) {
  if (status === 'completed') return 'bg-emerald-500 text-white shadow-emerald-500/25'
  if (status === 'active') return 'bg-orange-500 text-white shadow-orange-500/25'
  return 'bg-sky-500 text-white shadow-sky-500/25'
}

function getStatusDotClasses(status: RoadmapNodeView['status']) {
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'active') return 'bg-orange-500'
  return 'bg-sky-500'
}

function getResourcePreviewUrl(resource: RoadmapResourceView) {
  if (!resource.url) return null

  try {
    const url = new URL(resource.url)
    if (url.hostname.includes('youtube.com')) {
      const videoId = url.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : resource.url
    }
    if (url.hostname.includes('youtu.be')) {
      const videoId = url.pathname.replace('/', '')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : resource.url
    }
  } catch {
    return resource.url
  }

  return resource.url
}

function getResourcePreviewKind(resource: RoadmapResourceView) {
  const haystack = `${resource.type} ${resource.provider ?? ''} ${resource.url ?? ''}`.toLowerCase()
  if (haystack.includes('youtube') || haystack.includes('video') || haystack.includes('youtu.be')) return 'video'
  return 'document'
}

function getStatusLabelKey(status: RoadmapNodeView['status']) {
  switch (status) {
    case 'completed':
      return 'learningPath.roadmap.nodeStatus.completed'
    case 'active':
      return 'learningPath.roadmap.nodeStatus.active'
    default:
      return 'learningPath.roadmap.nodeStatus.future'
  }
}

function getRoadmapStatusLabelKey(status: string) {
  switch (status.toLowerCase()) {
    case 'active':
      return 'learningPath.roadmap.status.active'
    case 'archived':
      return 'learningPath.roadmap.status.archived'
    case 'completed':
      return 'learningPath.roadmap.status.completed'
    case 'failed':
      return 'learningPath.roadmap.status.failed'
    case 'generating':
    case 'pending':
    case 'processing':
    case 'queued':
      return 'learningPath.roadmap.status.generating'
    default:
      return null
  }
}

// Chia node thành các tầng (level) dựa trên prerequisiteNodeIds để vẽ skill tree dọc.
// Node không có tiên quyết = tầng 0; tầng = 1 + max(tầng các tiên quyết). Có guard chống vòng lặp.
// Nếu roadmap không khai báo quan hệ tiên quyết nào → xếp tuần tự mỗi node 1 tầng (chuỗi dọc).
function computeTiers(nodes: RoadmapNodeView[]): RoadmapNodeView[][] {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const hasEdges = nodes.some((node) => node.prerequisiteNodeIds.some((id) => byId.has(id)))

  const ordered = [...nodes].sort((a, b) => a.orderIndex - b.orderIndex)
  if (!hasEdges) return ordered.map((node) => [node])

  const cache = new Map<string, number>()
  const visiting = new Set<string>()
  const levelOf = (id: string): number => {
    if (cache.has(id)) return cache.get(id) as number
    const node = byId.get(id)
    if (!node || visiting.has(id)) return 0
    visiting.add(id)
    const prereqs = node.prerequisiteNodeIds.filter((p) => byId.has(p))
    const level = prereqs.length === 0 ? 0 : 1 + Math.max(...prereqs.map(levelOf))
    visiting.delete(id)
    cache.set(id, level)
    return level
  }

  const maxLevel = ordered.reduce((max, node) => Math.max(max, levelOf(node.id)), 0)
  const tiers: RoadmapNodeView[][] = Array.from({ length: maxLevel + 1 }, () => [])
  for (const node of ordered) tiers[levelOf(node.id)].push(node)
  return tiers.filter((tier) => tier.length > 0)
}

export function RoadmapPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const roadmapIdFromQuery = searchParams.get('roadmapId')
  const jdIdFromQuery = searchParams.get('jdId')

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [roadmap, setRoadmap] = useState<RoadmapView | null>(null)
  const [roadmaps, setRoadmaps] = useState<RoadmapView[]>([])
  const [resources, setResources] = useState<RoadmapResourceView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)
  const [triggering, setTriggering] = useState(false)
  const [polling, setPolling] = useState(false)
  const [roadmapRefreshToken, setRoadmapRefreshToken] = useState(0)
  const [resourceLoading, setResourceLoading] = useState(false)
  const [previewResource, setPreviewResource] = useState<RoadmapResourceView | null>(null)
  const isRoadmapListMode = !roadmapIdFromQuery && !jdIdFromQuery

  useEffect(() => {
    let cancelled = false
    let timer: number | null = null

    async function fetchRoadmap() {
      let target = roadmapIdFromQuery ? await loadRoadmapById(roadmapIdFromQuery) : null

      if (!target?.data) {
        const overview = await loadRoadmapOverview({ jdId: jdIdFromQuery ?? undefined })
        if (cancelled) return
        setRoadmaps(overview.data ?? [])
        if (overview.error) {
          setError(overview.error)
        }

        if (isRoadmapListMode) {
          setRoadmap(null)
          setSelectedNodeId(null)
          setResources([])
          setPolling(false)
          return
        }

        const selected = resolveSelectedRoadmap(overview.data ?? [], roadmapIdFromQuery, jdIdFromQuery)
        if (!selected) {
          setRoadmap(null)
          setSelectedNodeId(null)
          setResources([])
          setPolling(false)
          return
        }
        target = await loadRoadmapById(selected.id)
      }

      if (cancelled) return

      if (target?.error) {
        setError(target.error)
      }

      const nextRoadmap = target?.data ?? null
      setRoadmap(nextRoadmap)

      if (!nextRoadmap) {
        setSelectedNodeId(null)
        setResources([])
        setPolling(false)
        return
      }

      const nextNode = resolveActiveNode(nextRoadmap, selectedNodeId)
      setSelectedNodeId(nextNode?.id ?? null)

      if (shouldPollRoadmap(nextRoadmap.status)) {
        setPolling(true)
        timer = window.setTimeout(() => {
          void fetchRoadmap()
        }, 3000)
      } else {
        setPolling(false)
      }
    }

    queueMicrotask(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    })

    void fetchRoadmap()
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('learningPath.roadmap.loadFailed'))
        setRoadmap(null)
        setSelectedNodeId(null)
        setResources([])
        setPolling(false)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
      if (timer) window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roadmapIdFromQuery, jdIdFromQuery, roadmapRefreshToken, isRoadmapListMode])

  useEffect(() => {
    let cancelled = false

    async function loadResourcesForNode() {
      if (!selectedNodeId || !roadmap || roadmap.status.toLowerCase() === 'archived') {
        if (!cancelled) {
          queueMicrotask(() => {
            setResources([])
            setResourceLoading(false)
          })
        }
        return
      }

      if (!cancelled) {
        queueMicrotask(() => {
          setResourceLoading(true)
        })
      }

      try {
        const res = await loadRoadmapResources(selectedNodeId)
        if (cancelled) return
        if (res.error) setError((current) => current || res.error || '')
        setResources(res.data ?? [])
      } catch (e) {
        if (cancelled) return
        setError((e as Error).message || t('learningPath.roadmap.resourcesLoadFailed'))
        setResources([])
      } finally {
        if (!cancelled) setResourceLoading(false)
      }
    }

    void loadResourcesForNode()

    return () => {
      cancelled = true
    }
  }, [roadmap, selectedNodeId, t])

  const activeNode = resolveActiveNode(roadmap, selectedNodeId)
  const progress = roadmap?.progress ?? 0
  const isArchived = roadmap?.status.toLowerCase() === 'archived'
  const selectedStatus = activeNode?.status ?? 'future'
  const prerequisites = useMemo(() => {
    if (!roadmap || !activeNode) return []
    return roadmap.nodes.filter((node) => activeNode.prerequisiteNodeIds.includes(node.id))
  }, [activeNode, roadmap])
  const prerequisitesMet = prerequisites.every((node) => node.status === 'completed')
  const tiers = useMemo(() => (roadmap ? computeTiers(roadmap.nodes) : []), [roadmap])

  const handleGenerate = async () => {
    if (!jdIdFromQuery) {
      setError(t('learningPath.roadmap.noJdSelected'))
      return
    }

    try {
      setTriggering(true)
      setError('')
      const response = await triggerRoadmap(jdIdFromQuery)
      const roadmapId = getCreatedRoadmapId(response)
      toast.success(t('learningPath.roadmap.generateStarted'))
      setPolling(true)
      if (roadmapId) {
        navigate(`/roadmaps?roadmapId=${encodeURIComponent(roadmapId)}`)
      } else {
        setRoadmapRefreshToken((current) => current + 1)
      }
    } catch (e) {
      setError((e as Error).message || t('learningPath.roadmap.generateFailed'))
    } finally {
      setTriggering(false)
    }
  }

  const handleMarkComplete = async () => {
    if (!activeNode || !roadmap) return
    if (!prerequisitesMet) {
      toast.error(t('learningPath.roadmap.prerequisitesNotMet'))
      return
    }

    try {
      setUpdating(true)
      setError('')
      await updateRoadmapNodeStatus(activeNode.id, 'completed')
      setRoadmap((current) => {
        if (!current) return current
        const nextNodes = current.nodes.map((node) =>
          node.id === activeNode.id ? { ...node, status: 'completed' as const } : node,
        )
        const completed = nextNodes.filter((node) => node.status === 'completed').length
        return {
          ...current,
          progress: Math.round((completed / Math.max(nextNodes.length, 1)) * 100),
          nodes: nextNodes,
        }
      })
      toast.success(t('learningPath.roadmap.markCompleteSuccess'))
    } catch (e) {
      setError((e as Error).message || t('learningPath.roadmap.markCompleteFailed'))
      toast.error((e as Error).message || t('learningPath.roadmap.markCompleteFailed'))
    } finally {
      setUpdating(false)
    }
  }

  const handleArchive = async () => {
    if (!roadmap) return
    try {
      setUpdating(true)
      setError('')
      await triggerRoadmapArchive(roadmap.id)
      setRoadmap((current) => (current ? { ...current, status: 'archived' } : current))
      setResources([])
      toast.success(t('learningPath.roadmap.archiveSuccess'))
    } catch (e) {
      setError((e as Error).message || t('learningPath.roadmap.archiveFailed'))
    } finally {
      setUpdating(false)
    }
  }

  const handleRegenerate = async () => {
    if (!roadmap) return
    try {
      setUpdating(true)
      setError('')
      await triggerRoadmapRegenerate(roadmap.id)
      setRoadmap((current) => (current ? { ...current, status: 'generating' } : current))
      setPolling(true)
      setRoadmapRefreshToken((current) => current + 1)
      toast.success(t('learningPath.roadmap.regenerateStarted'))
    } catch (e) {
      setError((e as Error).message || t('learningPath.roadmap.regenerateFailed'))
    } finally {
      setUpdating(false)
    }
  }

  const handleKeep = async () => {
    if (!roadmap) return
    try {
      setUpdating(true)
      setError('')
      await triggerRoadmapKeep(roadmap.id)
      setRoadmap((current) => (current ? { ...current, isOutdated: false } : current))
      toast.success(t('learningPath.roadmap.keepSuccess'))
    } catch (e) {
      setError((e as Error).message || t('learningPath.roadmap.keepFailed'))
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className='relative min-h-screen overflow-hidden bg-slate-50 text-slate-950 dark:bg-[#08111f]'>
      <div className='pointer-events-none absolute inset-0 -z-10 overflow-hidden'>
        <div className='absolute -top-24 left-16 h-80 w-80 rounded-full bg-orange-400/20 blur-3xl dark:bg-orange-500/18' />
        <div className='absolute top-28 right-8 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl dark:bg-sky-500/16' />
        <div className='absolute bottom-10 left-1/3 h-72 w-72 rounded-full bg-emerald-400/15 blur-3xl dark:bg-emerald-500/12' />
      </div>
      <header className='sticky top-0 z-50 flex h-16 w-full items-center justify-between border-b border-slate-200/70 bg-white/80 px-6 backdrop-blur-md dark:border-white/10 dark:bg-[#0b1628]/88'>
        <button
          onClick={() => navigate(-1)}
          className='flex cursor-pointer items-center gap-1.5 text-sm font-bold text-primary hover:underline'
        >
          <span className='material-symbols-outlined text-base'>arrow_back</span>
          {t('learningPath.roadmap.backBtn')}
        </button>

        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-primary'>route</span>
          <span className='text-xs font-bold uppercase tracking-widest text-primary'>{t('learningPath.roadmap.badge')}</span>
        </div>

        <button
          onClick={() => navigate('/roadmaps')}
          className='rounded-full p-2 text-muted-foreground transition-all hover:bg-muted active:scale-95'
          aria-label={t('learningPath.roadmap.viewAll')}
        >
          <span className='material-symbols-outlined'>list</span>
        </button>
      </header>

      <div className='flex'>
        <main className={`flex-grow transition-all duration-300 ${isPanelOpen && selectedNodeId ? 'lg:mr-[420px]' : ''}`}>
          <div className='mx-auto max-w-6xl p-6 md:p-8'>
            <div className='mb-8 space-y-5 rounded-[2rem] border border-white/60 bg-white/88 p-6 shadow-2xl shadow-orange-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1a2d]/92 dark:shadow-sky-950/30 md:p-8'>
              <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <div>
                  <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-100'>
                    <span className='material-symbols-outlined text-base'>auto_awesome</span>
                    {t('learningPath.roadmap.badge')}
                  </div>
                  <h1 className='max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl'>
                    {roadmap?.title || t('learningPath.roadmap.title')}
                  </h1>
                  <p className='mt-4 max-w-3xl text-sm leading-6 text-slate-600 dark:text-slate-300'>
                    {roadmap ? t('learningPath.roadmap.detailSubtitle') : t('learningPath.roadmap.emptyDescription')}
                  </p>
                </div>

                <div className='flex flex-wrap gap-2'>
                  {jdIdFromQuery && !roadmap ? (
                    <button
                      type='button'
                      disabled={triggering}
                      onClick={() => void handleGenerate()}
                      className='rounded-2xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 disabled:opacity-50 dark:bg-white dark:text-slate-950'
                    >
                      {t('learningPath.roadmap.generate')}
                    </button>
                  ) : null}
                  {roadmap && !isArchived ? (
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleArchive()}
                      className='rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    >
                      {t('learningPath.roadmap.archive')}
                    </button>
                  ) : null}
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-3'>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>{t('learningPath.roadmap.progressMini')}</div>
                  <div className='mt-2 text-3xl font-black text-slate-950 dark:text-white'>{progress}%</div>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>{t('learningPath.roadmap.nodesMini')}</div>
                  <div className='mt-2 text-3xl font-black text-slate-950 dark:text-white'>{roadmap?.nodes.length ?? 0}</div>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>{t('learningPath.roadmap.statusMini')}</div>
                  <div className='mt-2 text-base font-black text-slate-950 dark:text-white'>
                    {roadmap
                      ? t(getRoadmapStatusLabelKey(roadmap.status) ?? 'learningPath.roadmap.status.unknown', { value: roadmap.status })
                      : t('learningPath.roadmap.status.unknown', { value: '-' })}
                  </div>
                </div>
              </div>

              <div className='h-3 w-full overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10'>
                <div
                  className='h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-orange-400 transition-all duration-1000'
                  style={{ width: `${Math.min(100, progress)}%` }}
                />
              </div>
              <div className='flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-300'>
                <span>{t('learningPath.roadmap.progressText', { percent: progress })}</span>
                {roadmap ? (
                  <span>
                    • {t('learningPath.roadmap.statusLabel', {
                      status: t(getRoadmapStatusLabelKey(roadmap.status) ?? 'learningPath.roadmap.status.unknown', { value: roadmap.status }),
                    })}
                  </span>
                ) : null}
                {polling ? <span className='font-semibold text-orange-600 dark:text-orange-200'>{t('learningPath.roadmap.generating')}</span> : null}
              </div>
            </div>

            {roadmap?.isOutdated ? (
              <div className='mb-6 rounded-2xl border border-warning/30 bg-warning/10 p-4'>
                <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <div className='font-semibold text-foreground'>{t('learningPath.roadmap.outdatedTitle')}</div>
                    <div className='text-sm text-muted-foreground'>{t('learningPath.roadmap.outdatedDescription')}</div>
                  </div>
                  <div className='flex gap-2'>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleRegenerate()}
                      className='rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50'
                    >
                      {t('learningPath.roadmap.refresh')}
                    </button>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleKeep()}
                      className='rounded-lg border border-border px-4 py-2 text-sm font-semibold text-foreground disabled:opacity-50'
                    >
                      {t('learningPath.roadmap.keep')}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {error ? (
              <div className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>
                {error}
              </div>
            ) : null}

            {loading ? (
              <div className='mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground'>
                {t('learningPath.roadmap.loading')}
              </div>
            ) : null}

            {!loading && isRoadmapListMode ? (
              <section className='rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#111d31]/92 dark:shadow-black/20'>
                <div className='mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                  <div>
                    <h2 className='text-xl font-black text-slate-950 dark:text-white'>{t('learningPath.table.title')}</h2>
                    <p className='mt-1 text-sm text-slate-600 dark:text-slate-300'>{t('learningPath.table.footer')}</p>
                  </div>
                  <button
                    type='button'
                    onClick={() => navigate('/dashboard/jd/new')}
                    className='inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20'
                  >
                    <span className='material-symbols-outlined text-lg'>add_circle</span>
                    {t('learningPath.newPath')}
                  </button>
                </div>

                {roadmaps.length === 0 ? (
                  <div className='rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-8 text-center text-sm text-slate-600 dark:border-white/10 dark:bg-white/6 dark:text-slate-300'>
                    {t('learningPath.roadmap.emptyDescription')}
                  </div>
                ) : (
                  <div className='grid gap-4 md:grid-cols-2 xl:grid-cols-3'>
                    {roadmaps.map((item) => (
                      <button
                        key={item.id}
                        type='button'
                        onClick={() => navigate(`/roadmaps?roadmapId=${encodeURIComponent(item.id)}`)}
                        className='group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-sky-300 hover:shadow-xl hover:shadow-sky-500/10 dark:border-white/10 dark:from-white/9 dark:to-white/5 dark:hover:border-sky-400/40'
                      >
                        <div className='mb-4 flex items-center justify-between gap-3'>
                          <span className='rounded-full bg-sky-500/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-200'>
                            {t(getRoadmapStatusLabelKey(item.status) ?? 'learningPath.roadmap.status.unknown', { value: item.status })}
                          </span>
                          <span className='material-symbols-outlined text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-500'>
                            arrow_forward
                          </span>
                        </div>
                        <h3 className='line-clamp-2 text-lg font-black text-slate-950 dark:text-white'>{item.title}</h3>
                        <div className='mt-4 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10'>
                          <div
                            className='h-full rounded-full bg-gradient-to-r from-emerald-400 via-sky-400 to-orange-400'
                            style={{ width: `${Math.min(100, item.progress)}%` }}
                          />
                        </div>
                        <p className='mt-3 text-sm font-semibold text-slate-600 dark:text-slate-300'>
                          {t('learningPath.roadmap.progressText', { percent: item.progress })}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </section>
            ) : null}

            {!loading && !roadmap && !isRoadmapListMode ? (
              <div className='rounded-2xl border border-dashed border-border bg-card p-8 text-center'>
                <div className='mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                  <span className='material-symbols-outlined'>route</span>
                </div>
                <h2 className='text-xl font-bold text-foreground'>{t('learningPath.roadmap.emptyTitle')}</h2>
                <p className='mt-2 text-sm text-muted-foreground'>{t('learningPath.roadmap.emptyDescription')}</p>
                {jdIdFromQuery ? (
                  <button
                    type='button'
                    disabled={triggering}
                    onClick={() => void handleGenerate()}
                    className='mt-6 rounded-xl bg-primary px-5 py-3 font-semibold text-primary-foreground disabled:opacity-50'
                  >
                    {t('learningPath.roadmap.generate')}
                  </button>
                ) : null}
              </div>
            ) : null}

            {roadmap ? (
              <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]'>
                <section className='rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#111d31]/92 dark:shadow-black/20'>
                  <div className='mb-4 flex items-center justify-between'>
                    <h2 className='text-lg font-bold text-foreground'>{t('learningPath.roadmap.nodesTitle')}</h2>
                    <button
                      type='button'
                      onClick={() => setIsPanelOpen((current) => !current)}
                      className='rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-white dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    >
                      {isPanelOpen ? t('learningPath.roadmap.hideDetails') : t('learningPath.roadmap.showDetails')}
                    </button>
                  </div>
                  <div className='flex flex-col items-center'>
                    {tiers.map((tier, tierIndex) => (
                      <Fragment key={tierIndex}>
                        {tierIndex > 0 ? (
                          <div className='flex flex-col items-center justify-center py-1 text-sky-400/70' aria-hidden>
                            <span className='h-6 w-px bg-gradient-to-b from-sky-400 to-orange-400' />
                            <span className='material-symbols-outlined -mt-1 text-base leading-none'>arrow_drop_down</span>
                          </div>
                        ) : null}
                        <div className='flex w-full flex-wrap items-stretch justify-center gap-4'>
                          {tier.map((node) => {
                            const selected = node.id === activeNode?.id
                            return (
                              <button
                                key={node.id}
                                type='button'
                                onClick={() => {
                                  setSelectedNodeId(node.id)
                                  setPreviewResource(null)
                                  setIsPanelOpen(true)
                                }}
                                className={`flex w-full max-w-sm flex-1 basis-64 items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/40 ${getNodeStatusClasses(node.status, selected)}`}
                              >
                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl shadow-lg ${getNodeIconClasses(node.status)}`}>
                                  <span className='material-symbols-outlined text-xl'>{node.icon}</span>
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <div className='flex flex-wrap items-center gap-2'>
                                    <span className='text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-300'>
                                      {t('learningPath.roadmap.tierLabel', { level: tierIndex + 1 })}
                                    </span>
                                    <span className='inline-flex items-center gap-1.5 rounded-full bg-white/70 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-700 dark:bg-white/10 dark:text-slate-100'>
                                      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(node.status)}`} />
                                      {t(getStatusLabelKey(node.status))}
                                    </span>
                                  </div>
                                  <div className='mt-2 font-semibold text-slate-950 dark:text-white'>{node.title}</div>
                                  {node.estimatedHours ? (
                                    <p className='mt-1 text-xs text-slate-500 dark:text-slate-300'>
                                      {t('learningPath.roadmap.duration', { hours: node.estimatedHours })}
                                    </p>
                                  ) : null}
                                </div>
                              </button>
                            )
                          })}
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </section>

                {isPanelOpen && activeNode ? (
                  <aside className='rounded-[1.5rem] border border-slate-200 bg-white/90 p-6 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#111d31]/92 dark:shadow-black/20 lg:sticky lg:top-24'>
                    <div className='flex items-start justify-between gap-4'>
                      <div>
                        <div className='text-xs font-bold uppercase tracking-widest text-sky-600 dark:text-sky-300'>{t('learningPath.roadmap.detailTitle')}</div>
                        <h2 className='mt-2 text-2xl font-black text-slate-950 dark:text-white'>{activeNode.title}</h2>
                      </div>
                      <button
                        onClick={() => setIsPanelOpen(false)}
                        className='rounded-full p-2 text-slate-500 transition-colors hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                        aria-label={t('learningPath.roadmap.closePanel')}
                      >
                        <span className='material-symbols-outlined'>close</span>
                      </button>
                    </div>

                    <div className='mt-4 flex flex-wrap gap-2 text-xs'>
                      {activeNode.estimatedHours ? (
                          <span className='rounded-full bg-sky-50 px-3 py-1.5 text-sky-700 dark:bg-sky-400/10 dark:text-sky-100'>
                          {t('learningPath.roadmap.duration', { hours: activeNode.estimatedHours })}
                        </span>
                      ) : null}
                      {typeof activeNode.level === 'number' ? (
                          <span className='rounded-full bg-orange-50 px-3 py-1.5 text-orange-700 dark:bg-orange-400/10 dark:text-orange-100'>
                          {t('learningPath.roadmap.level', { level: activeNode.level })}
                        </span>
                      ) : null}
                      <span className='rounded-full border border-slate-200 px-3 py-1.5 text-slate-600 dark:border-white/10 dark:text-slate-300'>
                        {t(getStatusLabelKey(activeNode.status))}
                      </span>
                    </div>

                    <p className='mt-4 text-sm leading-relaxed text-slate-600 dark:text-slate-300'>
                      {activeNode.description || t('learningPath.roadmap.nodeDescriptionFallback')}
                    </p>

                    <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/6'>
                      <div className='mb-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                        {t('learningPath.roadmap.prerequisites')}
                      </div>
                      {prerequisites.length === 0 ? (
                        <div className='text-sm text-slate-600 dark:text-slate-300'>{t('learningPath.roadmap.noPrerequisites')}</div>
                      ) : (
                        <div className='flex flex-wrap gap-2'>
                          {prerequisites.map((node) => (
                            <span
                              key={node.id}
                              className='inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-100'
                            >
                              {node.title}
                              <span className='material-symbols-outlined text-sm text-success'>
                                {node.status === 'completed' ? 'check_circle' : 'pending'}
                              </span>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {!isArchived ? (
                      <div className='mt-6'>
                        <div className='mb-3 text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                          {t('learningPath.roadmap.resources')}
                        </div>
                        {resourceLoading ? (
                          <div className='rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground'>
                            {t('learningPath.roadmap.resourcesLoading')}
                          </div>
                        ) : resources.length === 0 ? (
                          <div className='rounded-xl border border-dashed border-border bg-muted/10 p-4 text-sm text-muted-foreground'>
                            {t('learningPath.roadmap.resourcesEmpty')}
                          </div>
                        ) : (
                          <div className='space-y-3'>
                            {resources.map((resource) => {
                              const previewUrl = getResourcePreviewUrl(resource)
                              const previewKind = getResourcePreviewKind(resource)

                              return (
                              <article
                                key={resource.id}
                                className='group rounded-2xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-sky-300 hover:shadow-lg hover:shadow-sky-500/10 dark:border-white/10 dark:bg-white/7 dark:hover:border-sky-400/40'
                              >
                                <div className={`rounded-xl p-3 ${resource.iconBg} ${resource.iconColor}`}>
                                  <span className='material-symbols-outlined'>{resource.icon}</span>
                                </div>
                                <div className='min-w-0 flex-1'>
                                  <div className='flex flex-wrap items-center gap-2'>
                                    <div className='font-semibold text-slate-950 group-hover:text-sky-700 dark:text-white dark:group-hover:text-sky-200'>{resource.title}</div>
                                    {resource.isPrimary ? (
                                      <span className='rounded bg-success/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-success'>
                                        {t('learningPath.roadmap.primaryResource')}
                                      </span>
                                    ) : null}
                                    {resource.isAffiliate ? (
                                      <span className='rounded bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary'>
                                        {resource.affiliateLabel || t('learningPath.roadmap.affiliate')}
                                      </span>
                                    ) : null}
                                  </div>
                                  <div className='mt-1 text-xs text-muted-foreground'>
                                    {resource.provider ? `${resource.provider} • ` : ''}
                                    {resource.type}
                                  </div>
                                  {resource.description ? (
                                    <p className='mt-2 text-sm text-muted-foreground'>{resource.description}</p>
                                  ) : null}
                                </div>
                                <div className='mt-4 flex flex-wrap gap-2'>
                                  <button
                                    type='button'
                                    disabled={!previewUrl}
                                    onClick={() => setPreviewResource(resource)}
                                    className='inline-flex items-center gap-2 rounded-xl bg-sky-500 px-3 py-2 text-xs font-bold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
                                  >
                                    <span className='material-symbols-outlined text-base'>
                                      {previewKind === 'video' ? 'play_circle' : 'visibility'}
                                    </span>
                                    {previewKind === 'video' ? t('learningPath.roadmap.watchHere') : t('learningPath.roadmap.readHere')}
                                  </button>
                                  {resource.url ? (
                                    <a
                                      href={resource.url}
                                      target='_blank'
                                      rel='noreferrer'
                                      className='inline-flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/10'
                                    >
                                      <span className='material-symbols-outlined text-base'>open_in_new</span>
                                      {t('learningPath.roadmap.openInNewTab')}
                                    </a>
                                  ) : null}
                                </div>
                              </article>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className='mt-6 rounded-xl border border-border bg-muted/10 p-4 text-sm text-muted-foreground'>
                        {t('learningPath.roadmap.archivedReadOnly')}
                      </div>
                    )}

                    {previewResource ? (
                      <div className='mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-white/7'>
                        <div className='flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-white/10'>
                          <div className='min-w-0'>
                            <p className='truncate text-sm font-bold text-slate-950 dark:text-white'>{previewResource.title}</p>
                            <p className='text-xs text-slate-500 dark:text-slate-400'>
                              {getResourcePreviewKind(previewResource) === 'video'
                                ? t('learningPath.roadmap.videoPreview')
                                : t('learningPath.roadmap.documentPreview')}
                            </p>
                          </div>
                          <button
                            type='button'
                            onClick={() => setPreviewResource(null)}
                            className='rounded-full p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                            aria-label={t('learningPath.roadmap.closePanel')}
                          >
                            <span className='material-symbols-outlined text-base'>close</span>
                          </button>
                        </div>
                        <iframe
                          title={previewResource.title}
                          src={getResourcePreviewUrl(previewResource) ?? 'about:blank'}
                          className='h-72 w-full bg-slate-950'
                          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                          allowFullScreen
                        />
                      </div>
                    ) : null}

                    <button
                      onClick={() => void handleMarkComplete()}
                      disabled={updating || selectedStatus === 'completed' || isArchived || !prerequisitesMet}
                      className='mt-6 flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50'
                    >
                      <span className='material-symbols-outlined'>check_circle</span>
                      {selectedStatus === 'completed' ? t('learningPath.roadmap.completed') : t('learningPath.roadmap.markComplete')}
                    </button>
                  </aside>
                ) : null}
              </div>
            ) : null}
          </div>
        </main>
      </div>
    </div>
  )
}
