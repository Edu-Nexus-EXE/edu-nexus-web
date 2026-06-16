import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  type RoadmapView
} from '../lib/sprint2-api'

function resolveSelectedRoadmap(
  roadmaps: RoadmapView[],
  preferredRoadmapId: string | null,
  preferredJdId: string | null
): RoadmapView | null {
  if (preferredRoadmapId) {
    const byId = roadmaps.find((item) => item.id === preferredRoadmapId)
    if (byId) return byId
  }

  if (preferredJdId) {
    const byJdId = roadmaps.filter((item) => item.jdId === preferredJdId)
    return byJdId.find(isUsableRoadmap) ?? byJdId[0] ?? null
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
  return (
    normalized === 'generating' || normalized === 'pending' || normalized === 'processing' || normalized === 'queued'
  )
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
      ? 'border-emerald-400 bg-white dark:border-emerald-400/70 dark:bg-[#111d31] ring-2 ring-emerald-400/40 dark:ring-emerald-400/60'
      : 'border-emerald-200 bg-white dark:border-emerald-500/30 dark:bg-[#0d1929] hover:border-emerald-300 dark:hover:border-emerald-400/50'
  }

  if (status === 'active') {
    return selected
      ? 'border-orange-400 bg-white dark:border-orange-400/70 dark:bg-[#111d31] ring-2 ring-orange-400/40 dark:ring-orange-400/60'
      : 'border-orange-200 bg-white dark:border-orange-500/30 dark:bg-[#0d1929] hover:border-orange-300 dark:hover:border-orange-400/50'
  }

  return selected
    ? 'border-sky-400 bg-white dark:border-sky-400/70 dark:bg-[#111d31] ring-2 ring-sky-400/40 dark:ring-sky-400/60'
    : 'border-slate-200 bg-white dark:border-white/15 dark:bg-[#0d1929] hover:border-sky-300 dark:hover:border-sky-400/50'
}

function getNodeIconClasses(status: RoadmapNodeView['status']) {
  if (status === 'completed') return 'bg-emerald-500 text-white shadow-emerald-500/25'
  if (status === 'active') return 'bg-orange-500 text-white shadow-orange-500/25'
  return 'bg-sky-500 text-white shadow-sky-500/25'
}

function getStatusDotClasses(status: RoadmapNodeView['status']) {
  if (status === 'completed') return 'bg-emerald-500'
  if (status === 'active') return 'bg-orange-500 animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite]'
  return 'bg-slate-400 dark:bg-slate-500'
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
const VI_ROADMAP_TEXT: Record<string, string> = {
  'Full-stack Developer Intern Skill Tree Roadmap': 'Lộ trình kỹ năng thực tập sinh Full-stack',
  'Git Basics': 'Cơ bản về Git',
  'Advanced Git': 'Git nâng cao',
  'REST API': 'REST API',
  TypeScript: 'TypeScript',
  JWT: 'JWT',
  'ASP.NET Core': 'ASP.NET Core',
  'Entity Framework Core': 'Entity Framework Core',
  PostgreSQL: 'PostgreSQL',
  React: 'React',
  'C#': 'C#'
}

const VI_RESOURCE_TYPES: Record<string, string> = {
  article: 'bài viết',
  video: 'video',
  course: 'khóa học',
  document: 'tài liệu',
  docs: 'tài liệu'
}

function translateFixedRoadmapText(value: string | undefined, language: string) {
  if (!value || !language.startsWith('vi')) return value
  return VI_ROADMAP_TEXT[value] ?? value
}

function translateRoadmapDescription(value: string | undefined, language: string) {
  if (!value || !language.startsWith('vi')) return value
  return value
    .replace(
      /^Learn the basics of Git, including version control, branching, and merging\.$/i,
      'Học nền tảng Git, gồm quản lý phiên bản, tạo nhánh và hợp nhất mã.'
    )
    .replace(
      /^Learn version control using Git, including branching, merging, and collaboration workflows\.$/i,
      'Học quản lý phiên bản bằng Git, gồm tạo nhánh, hợp nhất và quy trình cộng tác.'
    )
    .replace(/^Learn (.+?)[.]?$/i, 'Học $1.')
}

function translateResourceType(value: string, language: string) {
  if (!language.startsWith('vi')) return value
  return VI_RESOURCE_TYPES[value.toLowerCase()] ?? value
}

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

type RoadmapTreeProps = {
  tiers: RoadmapNodeView[][]
  activeNodeId: string | null
  language: string
  t: ReturnType<typeof useTranslation>['t']
  onSelect: (nodeId: string) => void
}

function RoadmapTree({ tiers, activeNodeId, language, t, onSelect }: RoadmapTreeProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const nodeRefs = useRef<Map<string, HTMLElement>>(new Map())
  const [edges, setEdges] = useState<
    Array<{ id: string; d: string; status: RoadmapNodeView['status']; selected: boolean }>
  >([])

  // Build flat node list for ref matching
  const flatNodes = useMemo(() => tiers.flat(), [tiers])
  const nodeById = useMemo(() => new Map(flatNodes.map((node) => [node.id, node])), [flatNodes])

  // Recompute edge paths after layout / data change
  useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) return

    function compute() {
      const c = containerRef.current
      if (!c) return
      const cRect = c.getBoundingClientRect()
      const nextEdges: Array<{ id: string; d: string; status: RoadmapNodeView['status']; selected: boolean }> = []
      const seen = new Set<string>()

      for (const node of flatNodes) {
        const target = nodeRefs.current.get(node.id)
        if (!target) continue
        const targetRect = target.getBoundingClientRect()
        const targetX = targetRect.right - cRect.left
        const targetY = targetRect.top + targetRect.height / 2 - cRect.top

        for (const prereqId of node.prerequisiteNodeIds) {
          const edgeKey = `${prereqId}->${node.id}`
          if (seen.has(edgeKey)) continue
          seen.add(edgeKey)
          const source = nodeRefs.current.get(prereqId)
          if (!source) continue
          const sourceRect = source.getBoundingClientRect()
          const sourceX = sourceRect.right - cRect.left
          const sourceY = sourceRect.top + sourceRect.height / 2 - cRect.top

          const midX = sourceX + Math.max(20, (targetX - sourceX) / 2)
          const d = `M ${sourceX} ${sourceY} C ${midX} ${sourceY}, ${midX} ${targetY}, ${targetX - 6} ${targetY}`

          nextEdges.push({
            id: edgeKey,
            d,
            status: node.status,
            selected: node.id === activeNodeId || prereqId === activeNodeId
          })
        }
      }

      setEdges(nextEdges)
    }

    compute()
    const observer = new ResizeObserver(compute)
    observer.observe(container)
    window.addEventListener('resize', compute)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', compute)
    }
  }, [flatNodes, activeNodeId, tiers])

  const setNodeRef = (id: string) => (el: HTMLElement | null) => {
    if (el) nodeRefs.current.set(id, el)
    else nodeRefs.current.delete(id)
  }

  return (
    <div ref={containerRef} className='relative'>
      <svg className='pointer-events-none absolute inset-0 z-0 h-full w-full overflow-visible' aria-hidden>
        <defs>
          <marker
            id='roadmap-arrow-completed'
            viewBox='0 0 10 10'
            refX='7'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-emerald-500' />
          </marker>
          <marker
            id='roadmap-arrow-active'
            viewBox='0 0 10 10'
            refX='7'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-orange-500' />
          </marker>
          <marker
            id='roadmap-arrow-future'
            viewBox='0 0 10 10'
            refX='7'
            refY='5'
            markerWidth='6'
            markerHeight='6'
            orient='auto-start-reverse'
          >
            <path d='M 0 0 L 10 5 L 0 10 z' className='fill-slate-400' />
          </marker>
        </defs>
        {edges.map((edge) => (
          <path
            key={edge.id}
            d={edge.d}
            fill='none'
            strokeWidth='2'
            className={
              edge.status === 'completed'
                ? edge.selected
                  ? 'stroke-emerald-500'
                  : 'stroke-emerald-300 dark:stroke-emerald-600'
                : edge.status === 'active'
                  ? edge.selected
                    ? 'stroke-orange-500'
                    : 'stroke-orange-300 dark:stroke-orange-600'
                  : edge.selected
                    ? 'stroke-sky-400'
                    : 'stroke-slate-300 dark:stroke-slate-600'
            }
            markerEnd={`url(#roadmap-arrow-${edge.status})`}
          />
        ))}
      </svg>
      <div
        className='relative z-10 grid gap-x-10 gap-y-6 px-6 py-8'
        style={{ gridTemplateColumns: `repeat(${tiers.length}, minmax(220px, 1fr))` }}
      >
        {tiers.map((tier, tierIndex) => (
          <div key={tierIndex} className='flex flex-col gap-2'>
            <div className='mb-1 flex items-center justify-between border-b border-slate-200 pb-1.5 dark:border-white/10'>
              <div className='text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500'>
                {t('learningPath.roadmap.tierHeading', { level: tierIndex + 1 })}
              </div>
              <div className='rounded-full bg-slate-100 px-2 py-px text-[9px] font-bold text-slate-400 dark:bg-white/5 dark:text-slate-500'>
                {tier.length}
              </div>
            </div>
            <div className='flex flex-col gap-3'>
              {tier.map((node) => {
                const selected = node.id === activeNodeId
                const prerequisitesMet = node.prerequisiteNodeIds.every((id) => {
                  const p = nodeById.get(id)
                  return p?.status === 'completed'
                })
                const locked = !prerequisitesMet && node.status === 'future'
                return (
                  <button
                    key={node.id}
                    ref={setNodeRef(node.id)}
                    type='button'
                    onClick={() => onSelect(node.id)}
                    className={`group relative flex w-full flex-col items-start gap-2.5 rounded-xl border p-3.5 text-left transition-all hover:-translate-y-0.5 hover:shadow-md ${getNodeStatusClasses(node.status, selected)}`}
                  >
                    <div className='flex w-full items-center justify-between gap-2'>
                      <div
                        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${getNodeIconClasses(node.status)}`}
                      >
                        <span className='material-symbols-outlined text-base'>{node.icon}</span>
                      </div>
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                          node.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300'
                            : node.status === 'active'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300'
                              : 'bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300'
                        }`}
                      >
                        <span className={`h-1 w-1 rounded-full ${getStatusDotClasses(node.status)}`} />
                        {t(getStatusLabelKey(node.status))}
                      </span>
                    </div>
                    <div className='min-w-0 flex-1'>
                      <div className='line-clamp-2 text-sm font-bold text-slate-900 dark:text-white'>
                        {translateFixedRoadmapText(node.title, language)}
                      </div>
                      <div className='mt-1 flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400'>
                        {node.estimatedHours ? (
                          <span className='inline-flex items-center gap-0.5'>
                            <span className='material-symbols-outlined text-[11px]'>schedule</span>
                            {t('learningPath.roadmap.duration', { hours: node.estimatedHours })}
                          </span>
                        ) : null}
                        {locked ? (
                          <span className='inline-flex items-center gap-0.5 text-amber-600 dark:text-amber-300'>
                            <span className='material-symbols-outlined text-[11px]'>lock</span>
                          </span>
                        ) : null}
                      </div>
                    </div>
                    {selected ? (
                      <div className='pointer-events-none absolute inset-0 rounded-xl ring-2 ring-primary ring-offset-2 ring-offset-white dark:ring-offset-[#111d31]' />
                    ) : null}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export function RoadmapPage() {
  const { t, i18n } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const toast = useToast()

  const roadmapIdFromQuery = searchParams.get('roadmapId')
  const jdIdFromQuery = searchParams.get('jdId')

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
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
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const isRoadmapListMode = !roadmapIdFromQuery && !jdIdFromQuery
  const language = i18n.language ?? 'vi'

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

  useEffect(() => {
    if (!isPanelOpen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsPanelOpen(false)
    }
    window.addEventListener('keydown', onKey)
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [isPanelOpen])

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
          node.id === activeNode.id ? { ...node, status: 'completed' as const } : node
        )
        const completed = nextNodes.filter((node) => node.status === 'completed').length
        return {
          ...current,
          progress: Math.round((completed / Math.max(nextNodes.length, 1)) * 100),
          nodes: nextNodes
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
    setArchiveDialogOpen(true)
  }

  const confirmArchive = async () => {
    if (!roadmap) return

    try {
      setUpdating(true)
      setError('')
      await triggerRoadmapArchive(roadmap.id)
      setRoadmap((current) => (current ? { ...current, status: 'archived' } : current))
      setResources([])
      setArchiveDialogOpen(false)
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
          <span className='text-xs font-bold uppercase tracking-widest text-primary'>
            {t('learningPath.roadmap.badge')}
          </span>
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
        <main className='flex-grow transition-all duration-300'>
          <div className='mx-auto max-w-6xl p-6 md:p-8'>
            <div className='mb-8 space-y-5 rounded-[2rem] border border-white/60 bg-white/88 p-6 shadow-2xl shadow-orange-500/10 backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1a2d]/92 dark:shadow-sky-950/30 md:p-8'>
              <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                <div>
                  <div className='mb-4 inline-flex items-center gap-2 rounded-full border border-orange-200/80 bg-orange-50 px-3 py-1 text-xs font-bold uppercase tracking-widest text-orange-700 dark:border-orange-400/30 dark:bg-orange-400/10 dark:text-orange-100'>
                    <span className='material-symbols-outlined text-base'>auto_awesome</span>
                    {t('learningPath.roadmap.badge')}
                  </div>
                  <h1 className='max-w-4xl text-4xl font-black leading-tight tracking-tight text-slate-950 dark:text-white md:text-5xl'>
                    {translateFixedRoadmapText(roadmap?.title, language) || t('learningPath.roadmap.title')}
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
                  {roadmap && !isArchived && !roadmap.isOutdated ? (
                    <div className='flex flex-wrap gap-2'>
                      <button
                        type='button'
                        disabled={updating}
                        onClick={() => void handleArchive()}
                        className='rounded-2xl border border-slate-200 bg-white/70 px-5 py-3 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                      >
                        {t('learningPath.roadmap.archive')}
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>

              <div className='grid gap-3 md:grid-cols-3'>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                    {t('learningPath.roadmap.progressMini')}
                  </div>
                  <div className='mt-2 text-3xl font-black text-slate-950 dark:text-white'>{progress}%</div>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                    {t('learningPath.roadmap.nodesMini')}
                  </div>
                  <div className='mt-2 text-3xl font-black text-slate-950 dark:text-white'>
                    {roadmap?.nodes.length ?? 0}
                  </div>
                </div>
                <div className='rounded-2xl border border-slate-200 bg-white/75 p-4 dark:border-white/10 dark:bg-white/8'>
                  <div className='text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                    {t('learningPath.roadmap.statusMini')}
                  </div>
                  <div className='mt-2 text-base font-black text-slate-950 dark:text-white'>
                    {roadmap
                      ? t(getRoadmapStatusLabelKey(roadmap.status) ?? 'learningPath.roadmap.status.unknown', {
                          value: roadmap.status
                        })
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
                    •{' '}
                    {t('learningPath.roadmap.statusLabel', {
                      status: t(getRoadmapStatusLabelKey(roadmap.status) ?? 'learningPath.roadmap.status.unknown', {
                        value: roadmap.status
                      })
                    })}
                  </span>
                ) : null}
                {polling ? (
                  <span className='font-semibold text-orange-600 dark:text-orange-200'>
                    {t('learningPath.roadmap.generating')}
                  </span>
                ) : null}
              </div>
            </div>

            {roadmap?.isOutdated && !isArchived ? (
              <div className='mb-6 rounded-2xl border border-orange-300/50 bg-gradient-to-br from-orange-50 to-amber-50 p-5 shadow-lg shadow-orange-500/10 dark:border-orange-400/30 dark:from-orange-500/15 dark:to-amber-500/10'>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <div>
                    <div className='flex items-center gap-2 font-black text-slate-950 dark:text-white'>
                      <span className='material-symbols-outlined text-orange-500'>sync_problem</span>
                      {t('learningPath.roadmap.outdatedTitle')}
                    </div>
                    <div className='mt-1 text-sm text-slate-600 dark:text-slate-300'>
                      {t('learningPath.roadmap.outdatedDescription')}
                    </div>
                  </div>
                  <div className='flex flex-wrap gap-2'>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleKeep()}
                      className='rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-sm font-bold text-emerald-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-50 disabled:opacity-50 dark:border-emerald-400/25 dark:bg-white/8 dark:text-emerald-100 dark:hover:bg-emerald-400/10'
                    >
                      {t('learningPath.roadmap.keep')}
                    </button>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleArchive()}
                      className='rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                    >
                      {t('learningPath.roadmap.archive')}
                    </button>
                    <button
                      type='button'
                      disabled={updating}
                      onClick={() => void handleRegenerate()}
                      className='rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-sky-500/20 transition hover:-translate-y-0.5 hover:bg-sky-600 disabled:opacity-50'
                    >
                      {t('learningPath.roadmap.refresh')}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}

            {roadmap && isArchived ? (
              <div className='mb-6 overflow-hidden rounded-3xl border border-amber-300/50 bg-gradient-to-br from-amber-50 via-orange-50 to-white p-5 shadow-xl shadow-amber-500/10 dark:border-amber-400/30 dark:from-amber-500/15 dark:via-orange-500/10 dark:to-white/5'>
                <div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/25'>
                      <span className='material-symbols-outlined'>inventory_2</span>
                    </div>
                    <div>
                      <h2 className='text-lg font-black text-slate-950 dark:text-white'>
                        {t('learningPath.roadmap.archivedTitle')}
                      </h2>
                      <p className='mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                        {t('learningPath.roadmap.archivedDescription')}
                      </p>
                    </div>
                  </div>
                  {roadmap.jdId ? (
                    <button
                      type='button'
                      onClick={() =>
                        navigate(`/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(roadmap.jdId ?? '')}`)
                      }
                      className='inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white shadow-lg transition hover:-translate-y-0.5 dark:bg-white dark:text-slate-950'
                    >
                      <span className='material-symbols-outlined text-lg'>analytics</span>
                      {t('learningPath.roadmap.backToGapAnalysis')}
                    </button>
                  ) : null}
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
                    <h2 className='text-xl font-black text-slate-950 dark:text-white'>
                      {t('learningPath.table.title')}
                    </h2>
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
                            {t(getRoadmapStatusLabelKey(item.status) ?? 'learningPath.roadmap.status.unknown', {
                              value: item.status
                            })}
                          </span>
                          <span className='material-symbols-outlined text-slate-400 transition group-hover:translate-x-1 group-hover:text-sky-500'>
                            arrow_forward
                          </span>
                        </div>
                        <h3 className='line-clamp-2 text-lg font-black text-slate-950 dark:text-white'>
                          {translateFixedRoadmapText(item.title, language)}
                        </h3>
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
              <>
                <section className='overflow-hidden rounded-[1.5rem] border border-slate-200 bg-white/90 shadow-xl shadow-slate-200/60 dark:border-white/10 dark:bg-[#111d31]/92 dark:shadow-black/20'>
                  <div className='flex items-center justify-between gap-4 border-b border-slate-200 px-6 py-3 dark:border-white/10'>
                    <h2 className='text-base font-bold text-foreground'>{t('learningPath.roadmap.treeHeader')}</h2>
                    <div className='flex items-center gap-3'>
                      <span className='text-xs font-semibold text-muted-foreground'>
                        {t('learningPath.roadmap.treeScrollHint')}
                      </span>
                      <span className='shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-white/10 dark:text-slate-200'>
                        {progress}%
                      </span>
                    </div>
                  </div>
                  <div className='relative'>
                    <div
                      className='pointer-events-none absolute inset-y-0 left-0 z-20 w-8 bg-gradient-to-r from-white to-transparent dark:from-[#111d31]'
                      aria-hidden
                    />
                    <div
                      className='pointer-events-none absolute inset-y-0 right-0 z-20 w-8 bg-gradient-to-l from-white to-transparent dark:from-[#111d31]'
                      aria-hidden
                    />
                    <div className='overflow-x-auto overflow-y-hidden' data-testid='roadmap-tree-scroll'>
                      <div className='min-w-fit p-2'>
                        <RoadmapTree
                          tiers={tiers}
                          activeNodeId={activeNode?.id ?? null}
                          language={language}
                          t={t}
                          onSelect={(nodeId) => {
                            setSelectedNodeId(nodeId)
                            setPreviewResource(null)
                            setIsPanelOpen(true)
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </section>
                {isPanelOpen && activeNode ? (
                  <div
                    className='fixed inset-0 z-[80] flex justify-end bg-slate-950/55 backdrop-blur-sm'
                    role='dialog'
                    aria-modal='true'
                    onClick={() => setIsPanelOpen(false)}
                  >
                    <div
                      className='flex h-full w-full max-w-md flex-col overflow-hidden border-l border-white/10 bg-white shadow-2xl shadow-sky-950/40 dark:bg-[#101b2d] sm:max-w-lg'
                      onClick={(event) => event.stopPropagation()}
                    >
                      <div className='flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3 dark:border-white/10'>
                        <div className='min-w-0'>
                          {previewResource ? (
                            <button
                              type='button'
                              onClick={() => setPreviewResource(null)}
                              className='mb-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-sky-600 transition-colors hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300'
                            >
                              <span className='material-symbols-outlined text-base'>arrow_back</span>
                              {t('learningPath.roadmap.backToResources')}
                            </button>
                          ) : (
                            <div className='text-[10px] font-bold uppercase tracking-widest text-muted-foreground'>
                              {t('learningPath.roadmap.detailTitle')}
                            </div>
                          )}
                          <h2
                            className={`font-black text-slate-900 dark:text-white ${previewResource ? 'mt-0.5 text-base' : 'mt-1 text-lg'}`}
                          >
                            {previewResource
                              ? previewResource.title
                              : translateFixedRoadmapText(activeNode.title, language)}
                          </h2>
                        </div>
                        <button
                          type='button'
                          onClick={() => setIsPanelOpen(false)}
                          className='shrink-0 rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-white/10 dark:hover:text-slate-200'
                          aria-label={t('learningPath.roadmap.closePanel')}
                        >
                          <span className='material-symbols-outlined text-base'>close</span>
                        </button>
                      </div>

                      {previewResource ? (
                        <div className='flex flex-1 flex-col overflow-hidden'>
                          <div className='flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-2 dark:border-white/10 dark:bg-white/5'>
                            <span className='text-[10px] font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                              {getResourcePreviewKind(previewResource) === 'video'
                                ? t('learningPath.roadmap.videoPreview')
                                : t('learningPath.roadmap.documentPreview')}
                            </span>
                            {previewResource.url ? (
                              <a
                                href={previewResource.url}
                                target='_blank'
                                rel='noreferrer'
                                className='flex items-center gap-1 text-[10px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300'
                              >
                                <span className='material-symbols-outlined text-sm'>open_in_new</span>
                                {t('learningPath.roadmap.openInNewTab')}
                              </a>
                            ) : null}
                          </div>
                          <div className='flex-1 overflow-hidden bg-slate-100 dark:bg-slate-900'>
                            {getResourcePreviewKind(previewResource) === 'video' ? (
                              <iframe
                                title={previewResource.title}
                                src={getResourcePreviewUrl(previewResource) ?? 'about:blank'}
                                className='h-full w-full bg-slate-950'
                                allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
                                allowFullScreen
                              />
                            ) : (
                              <iframe
                                title={previewResource.title}
                                src={getResourcePreviewUrl(previewResource) ?? 'about:blank'}
                                className='h-full w-full'
                              />
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className='flex-1 overflow-y-auto px-5 py-4'>
                          <div className='flex flex-wrap gap-2 text-xs'>
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
                            {translateRoadmapDescription(activeNode.description, language) ||
                              t('learningPath.roadmap.nodeDescriptionFallback')}
                          </p>

                          <div className='mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/6'>
                            <div className='mb-3 text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                              {t('learningPath.roadmap.prerequisites')}
                            </div>
                            {prerequisites.length === 0 ? (
                              <div className='text-sm text-slate-600 dark:text-slate-300'>
                                {t('learningPath.roadmap.noPrerequisites')}
                              </div>
                            ) : (
                              <div className='flex flex-wrap gap-2'>
                                {prerequisites.map((node) => (
                                  <span
                                    key={node.id}
                                    className='inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 dark:border-white/10 dark:bg-white/8 dark:text-slate-100'
                                  >
                                    {translateFixedRoadmapText(node.title, language)}
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
                              <div className='mb-3 flex items-center justify-between'>
                                <div className='text-xs font-bold uppercase tracking-widest text-muted-foreground'>
                                  {t('learningPath.roadmap.resources')}
                                </div>
                                {resources.length > 0 ? (
                                  <span className='text-xs font-semibold text-muted-foreground'>
                                    {resources.length}
                                  </span>
                                ) : null}
                              </div>
                              {resourceLoading ? (
                                <div className='rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5'>
                                  {t('learningPath.roadmap.resourcesLoading')}
                                </div>
                              ) : resources.length === 0 ? (
                                <div className='rounded-xl border border-dashed border-slate-200 bg-slate-50/60 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5'>
                                  {t('learningPath.roadmap.resourcesEmpty')}
                                </div>
                              ) : (
                                <ul className='divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white dark:divide-white/10 dark:border-white/10 dark:bg-white/5'>
                                  {resources.map((resource) => {
                                    const previewUrl = getResourcePreviewUrl(resource)
                                    const previewKind = getResourcePreviewKind(resource)
                                    const canPreview = Boolean(previewUrl)
                                    const kindLabel =
                                      previewKind === 'video'
                                        ? t('learningPath.roadmap.watchHere')
                                        : t('learningPath.roadmap.readHere')
                                    return (
                                      <li
                                        key={resource.id}
                                        className='flex items-start gap-3 px-4 py-3 transition-colors hover:bg-slate-50/70 dark:hover:bg-white/5'
                                      >
                                        <div
                                          className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${resource.iconBg} ${resource.iconColor}`}
                                        >
                                          <span className='material-symbols-outlined text-lg'>{resource.icon}</span>
                                        </div>
                                        <div className='min-w-0 flex-1'>
                                          <div className='flex flex-wrap items-baseline gap-x-2 gap-y-0.5'>
                                            <div className='truncate text-sm font-semibold text-slate-950 dark:text-white'>
                                              {resource.title}
                                            </div>
                                            {resource.isPrimary ? (
                                              <span className='rounded bg-emerald-500/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-300'>
                                                {t('learningPath.roadmap.primaryResource')}
                                              </span>
                                            ) : null}
                                            {resource.isAffiliate ? (
                                              <span className='rounded bg-primary/10 px-1.5 py-px text-[9px] font-bold uppercase tracking-wider text-primary'>
                                                {resource.affiliateLabel || t('learningPath.roadmap.affiliate')}
                                              </span>
                                            ) : null}
                                          </div>
                                          <div className='mt-0.5 text-[11px] text-muted-foreground'>
                                            {resource.provider ? `${resource.provider} • ` : ''}
                                            {translateResourceType(resource.type, language)}
                                          </div>
                                          {resource.description ? (
                                            <p className='mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground'>
                                              {resource.description}
                                            </p>
                                          ) : null}
                                          <div className='mt-2 flex flex-wrap gap-2'>
                                            <button
                                              type='button'
                                              disabled={!canPreview}
                                              onClick={() => setPreviewResource(resource)}
                                              className='inline-flex items-center gap-1.5 rounded-md bg-sky-500 px-2.5 py-1.5 text-[11px] font-semibold text-white transition hover:bg-sky-600 disabled:cursor-not-allowed disabled:opacity-50'
                                            >
                                              <span className='material-symbols-outlined text-sm'>
                                                {previewKind === 'video' ? 'play_circle' : 'visibility'}
                                              </span>
                                              {kindLabel}
                                            </button>
                                            {resource.url ? (
                                              <a
                                                href={resource.url}
                                                target='_blank'
                                                rel='noreferrer'
                                                className='inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-2.5 py-1.5 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/10'
                                              >
                                                <span className='material-symbols-outlined text-sm'>open_in_new</span>
                                                {t('learningPath.roadmap.openInNewTab')}
                                              </a>
                                            ) : null}
                                          </div>
                                        </div>
                                      </li>
                                    )
                                  })}
                                </ul>
                              )}
                            </div>
                          ) : (
                            <div className='mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-muted-foreground dark:border-white/10 dark:bg-white/5'>
                              {t('learningPath.roadmap.archivedReadOnly')}
                            </div>
                          )}
                        </div>
                      )}

                      <div className='border-t border-slate-200 bg-white px-5 py-3 dark:border-white/10 dark:bg-white/5'>
                        <button
                          type='button'
                          onClick={() => void handleMarkComplete()}
                          disabled={updating || selectedStatus === 'completed' || isArchived || !prerequisitesMet}
                          className='flex w-full items-center justify-center gap-3 rounded-xl bg-primary py-4 font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50'
                        >
                          <span className='material-symbols-outlined'>check_circle</span>
                          {selectedStatus === 'completed'
                            ? t('learningPath.roadmap.completed')
                            : t('learningPath.roadmap.markComplete')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : null}
              </>
            ) : null}
          </div>
        </main>
      </div>
      {archiveDialogOpen && roadmap ? (
        <div className='fixed inset-0 z-[85] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm'>
          <div className='w-full max-w-lg overflow-hidden rounded-3xl border border-white/15 bg-white shadow-2xl shadow-sky-950/40 dark:bg-[#101b2d]'>
            <div className='bg-gradient-to-br from-amber-400/20 via-orange-400/10 to-sky-400/10 p-6'>
              <div className='flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/30'>
                <span className='material-symbols-outlined'>archive</span>
              </div>
              <h2 className='mt-5 text-2xl font-black text-slate-950 dark:text-white'>
                {t('learningPath.roadmap.archiveModalTitle')}
              </h2>
              <p className='mt-2 text-sm leading-6 text-slate-600 dark:text-slate-300'>
                {t('learningPath.roadmap.archiveModalDescription', {
                  title: translateFixedRoadmapText(roadmap.title, language)
                })}
              </p>
              <div className='mt-4 rounded-2xl border border-amber-200/70 bg-white/70 p-4 text-sm text-amber-900 dark:border-amber-400/20 dark:bg-white/8 dark:text-amber-100'>
                {t('learningPath.roadmap.archiveModalNote')}
              </div>
            </div>
            <div className='flex flex-col gap-3 p-6 sm:flex-row sm:justify-end'>
              <button
                type='button'
                disabled={updating}
                onClick={() => setArchiveDialogOpen(false)}
                className='rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-white/10 dark:text-slate-100 dark:hover:bg-white/10'
              >
                {t('learningPath.roadmap.cancel')}
              </button>
              <button
                type='button'
                disabled={updating}
                onClick={() => void confirmArchive()}
                className='rounded-xl bg-amber-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-600 disabled:opacity-50'
              >
                {updating ? t('learningPath.roadmap.archiving') : t('learningPath.roadmap.confirmArchive')}
              </button>
            </div>
          </div>
        </div>
      ) : null}
      {previewResource ? (
        <div className='fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-md'>
          <div className='flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-[1.5rem] border border-white/15 bg-white shadow-2xl shadow-sky-950/40 dark:bg-[#101b2d]'>
            <div className='flex flex-col gap-3 border-b border-slate-200 bg-slate-50 px-5 py-4 dark:border-white/10 dark:bg-white/7 sm:flex-row sm:items-center sm:justify-between'>
              <div className='min-w-0'>
                <p className='truncate text-base font-black text-slate-950 dark:text-white'>{previewResource.title}</p>
                <p className='mt-1 text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400'>
                  {getResourcePreviewKind(previewResource) === 'video'
                    ? t('learningPath.roadmap.videoPreview')
                    : t('learningPath.roadmap.documentPreview')}
                </p>
              </div>
              <div className='flex shrink-0 items-center gap-2'>
                {previewResource.url ? (
                  <a
                    href={previewResource.url}
                    target='_blank'
                    rel='noreferrer'
                    className='inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-white/10 dark:bg-white/8 dark:text-slate-100 dark:hover:bg-white/12'
                  >
                    <span className='material-symbols-outlined text-base'>open_in_new</span>
                    {t('learningPath.roadmap.openInNewTab')}
                  </a>
                ) : null}
                <button
                  type='button'
                  onClick={() => setPreviewResource(null)}
                  className='rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10'
                  aria-label={t('learningPath.roadmap.closePanel')}
                >
                  <span className='material-symbols-outlined'>close</span>
                </button>
              </div>
            </div>
            <iframe
              title={previewResource.title}
              src={getResourcePreviewUrl(previewResource) ?? 'about:blank'}
              className='h-[min(70vh,720px)] min-h-[420px] w-full bg-slate-950'
              allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share'
              allowFullScreen
            />
          </div>
        </div>
      ) : null}
    </div>
  )
}
