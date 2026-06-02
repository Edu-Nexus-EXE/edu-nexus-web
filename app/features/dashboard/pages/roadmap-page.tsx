import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { useTranslation } from 'react-i18next'

import {
  loadRoadmapById,
  loadRoadmapResources,
  updateRoadmapNodeStatus,
  type RoadmapResourceView,
  type RoadmapView,
} from '../lib/sprint2-api'

function resolveActiveNode(roadmap: RoadmapView | null, selectedNodeId: string | null) {
  if (!roadmap) return null
  return roadmap.nodes.find((node) => node.id === selectedNodeId)
    ?? roadmap.nodes.find((node) => node.status === 'active')
    ?? roadmap.nodes[0]
    ?? null
}

export function RoadmapPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const roadmapIdFromQuery = searchParams.get('roadmapId') ?? 'latest'

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const [roadmap, setRoadmap] = useState<RoadmapView | null>(null)
  const [resources, setResources] = useState<RoadmapResourceView[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    let cancelled = false

    setTimeout(() => {
      if (!cancelled) { setLoading(true); setError('') }
    }, 0)

    loadRoadmapById(roadmapIdFromQuery)
      .then((res) => {
        if (cancelled) return
        if (res.data) {
          setRoadmap(res.data)
          const firstNode = resolveActiveNode(res.data, null)
          setSelectedNodeId(firstNode?.id ?? null)
          // Load resources for the first node
          if (firstNode?.id) {
            return loadRoadmapResources(firstNode.id)
              .then((rRes) => { if (!cancelled) setResources(rRes.data ?? []) })
          }
        } else {
          setRoadmap(null)
          setResources([])
          setSelectedNodeId(null)
        }
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('roadmap.loadFailed'))
        setRoadmap(null)
        setResources([])
        setSelectedNodeId(null)
      })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [roadmapIdFromQuery, t])

  // Load resources when selected node changes
  useEffect(() => {
    if (!selectedNodeId) return
    let cancelled = false
    loadRoadmapResources(selectedNodeId)
      .then((res) => { if (!cancelled) setResources(res.data ?? []) })
    return () => { cancelled = true }
  }, [selectedNodeId])

  const activeNode = resolveActiveNode(roadmap, selectedNodeId)
  const progress = roadmap?.progress ?? 0
  const selectedStatus = activeNode?.status ?? 'future'

  const handleMarkComplete = async () => {
    if (!activeNode) return
    setUpdating(true)
    try {
      await updateRoadmapNodeStatus(activeNode.id, 'completed')
      setRoadmap((current) => {
        if (!current) return current
        return {
          ...current,
          nodes: current.nodes.map((node) =>
            node.id === activeNode.id ? { ...node, status: 'completed' as const } : node
          ),
        }
      })
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className='min-h-screen bg-background'>
      <header className='sticky top-0 w-full flex justify-between items-center px-6 h-16 bg-background/80 backdrop-blur-md z-50 border-b border-border'>
        <div className='flex items-center gap-4'>
          <button
            onClick={() => navigate(-1)}
            className='flex items-center gap-1.5 text-sm font-bold text-primary hover:underline cursor-pointer'
          >
            <span className='material-symbols-outlined text-base'>arrow_back</span>
            {t('roadmap.backBtn')}
          </button>
        </div>
        <div className='flex items-center gap-2'>
          <span className='material-symbols-outlined text-primary'>terminal</span>
          <span className='text-xs font-bold uppercase tracking-widest text-primary'>{t('roadmap.badge')}</span>
        </div>
        <div className='flex items-center gap-3'>
          <button className='p-2 rounded-full hover:bg-muted transition-all active:scale-95 cursor-pointer' aria-label='Notifications'>
            <span className='material-symbols-outlined text-muted-foreground'>notifications</span>
          </button>
          <button className='p-2 rounded-full hover:bg-muted transition-all active:scale-95 cursor-pointer' aria-label='Account'>
            <span className='material-symbols-outlined text-muted-foreground'>account_circle</span>
          </button>
        </div>
      </header>

      <div className='flex'>
        <main className={`flex-grow transition-all duration-300 ${isPanelOpen && selectedNodeId ? 'lg:mr-[420px]' : ''}`}>
          <div className='p-8 max-w-4xl mx-auto'>
            <div className='mb-10'>
              <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight'>{t('roadmap.title')}</h1>
              <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                <div className='h-full bg-primary rounded-full transition-all duration-1000' style={{ width: `${Math.min(100, progress)}%` }} />
              </div>
              <p className='mt-3 text-muted-foreground text-sm font-medium'>{t('roadmap.progressText', { percent: progress })}</p>
            </div>

            {error ? <div className='mb-6 rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive'>{error}</div> : null}
            {loading ? <div className='mb-6 rounded-xl border border-border bg-card p-4 text-sm text-muted-foreground'>{t('roadmap.loading')}</div> : null}

            <div className='relative flex flex-col items-center gap-16 pb-20'>
              <div className='absolute w-1 h-full roadmap-line-dashed left-1/2 -translate-x-1/2 -z-10 opacity-20' />

              {(roadmap?.nodes ?? []).map((node) => {
                if (node.status === 'completed') {
                  return (
                    <button
                      key={node.id}
                      type='button'
                      className='relative flex flex-col items-center cursor-pointer group'
                      onClick={() => {
                        setSelectedNodeId(node.id)
                        setIsPanelOpen(true)
                      }}
                    >
                      <div className='w-16 h-16 bg-muted-foreground text-background rounded-full flex items-center justify-center shadow-lg border-4 border-background ring-4 ring-muted-foreground/10 group-hover:scale-105 transition-transform'>
                        <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='font-bold text-foreground'>{t(node.nameKey)}</p>
                        <p className='text-xs text-muted-foreground'>{t('roadmap.completed')}</p>
                      </div>
                    </button>
                  )
                }

                if (node.status === 'active') {
                  return (
                    <button
                      key={node.id}
                      type='button'
                      className='relative flex flex-col items-center cursor-pointer'
                      onClick={() => {
                        setSelectedNodeId(node.id)
                        setIsPanelOpen(true)
                      }}
                    >
                      <div className='absolute -top-12 px-3 py-1 bg-primary/15 text-primary text-[10px] font-bold rounded-full badge-bounce border border-primary/30'>
                        {t('roadmap.learning')}
                      </div>
                      <div className='w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center node-glow border-4 border-background ring-8 ring-primary/20'>
                        <span className='material-symbols-outlined text-3xl'>bolt</span>
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='font-bold text-primary text-lg'>{t(node.nameKey)}</p>
                        {node.subKey && <p className='text-xs text-primary font-medium'>{t(node.subKey)}</p>}
                      </div>
                      <div className='absolute -inset-4 bg-primary/5 blur-2xl -z-20 rounded-full' />
                    </button>
                  )
                }

                return (
                  <button
                    key={node.id}
                    type='button'
                    className='relative flex flex-col items-center grayscale opacity-40 cursor-pointer'
                    onClick={() => {
                      setSelectedNodeId(node.id)
                      setIsPanelOpen(true)
                    }}
                  >
                    <div className='w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center border-4 border-background'>
                      <span className='material-symbols-outlined'>{node.icon}</span>
                    </div>
                    <div className='mt-4 text-center'>
                      <p className='font-bold text-foreground'>{t(node.nameKey)}</p>
                      <p className='text-xs text-muted-foreground'>{t('roadmap.upcoming')}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </main>

        {isPanelOpen && activeNode && (
          <aside className='hidden lg:flex fixed right-0 top-16 w-[420px] h-[calc(100vh-64px)] bg-card shadow-2xl flex-col border-l border-border z-40'>
            <div className='flex-grow overflow-y-auto pb-28'>
              <div className='p-8 pb-4'>
                <div className='flex justify-between items-start mb-6'>
                  <div className='w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 border border-primary/20'>
                    <span className='material-symbols-outlined text-4xl' style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                  <button onClick={() => setIsPanelOpen(false)} className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer' aria-label={t('roadmap.closePanel')}>
                    <span className='material-symbols-outlined'>close</span>
                  </button>
                </div>
                <div className='flex items-center gap-3 mb-2'>
                  <h2 className='text-2xl font-bold text-foreground'>{t(activeNode.nameKey)}</h2>
                  <span className='px-2 py-0.5 bg-success/10 text-success text-[10px] font-bold rounded uppercase border border-success/20'>
                    {t('roadmap.popular')}
                  </span>
                </div>
                <div className='flex items-center gap-4 mb-6'>
                  <span className='flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted px-3 py-1.5 rounded-full'>
                    <span className='material-symbols-outlined text-sm'>schedule</span>
                    {t('roadmap.duration', { hours: 20 })}
                  </span>
                  <span className='flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/10 px-3 py-1.5 rounded-full'>
                    <span className='material-symbols-outlined text-sm'>trending_up</span>
                    {t('roadmap.level', { level: 2 })}
                  </span>
                </div>
                <p className='text-muted-foreground text-sm leading-relaxed mb-6'>{t('roadmap.description')}</p>

                <div className='mb-8 p-4 bg-muted/30 rounded-xl border border-border'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <span className='material-symbols-outlined text-sm'>assignment_turned_in</span>
                    {t('roadmap.prerequisites')}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <span className='flex items-center gap-1.5 px-3 py-1.5 bg-card text-foreground border border-success/20 rounded-full text-xs font-medium shadow-sm'>
                      {t(activeNode.nameKey)}
                      <span className='material-symbols-outlined text-success text-sm' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </span>
                  </div>
                </div>
              </div>

              <div className='px-8 space-y-8'>
                <section>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='font-bold text-foreground flex items-center gap-2'>
                      <span className='material-symbols-outlined text-primary text-xl'>menu_book</span>
                      {t('roadmap.resources')}
                    </h3>
                  </div>
                  <div className='space-y-4'>
                    {resources.map((res) => (
                      <div key={res.titleKey} className='group p-4 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer'>
                        <div className='flex items-start gap-4'>
                          <div className={`p-3 ${res.iconBg} ${res.iconColor} rounded-xl`}>
                            <span className='material-symbols-outlined'>{res.icon}</span>
                          </div>
                          <div className='flex-grow'>
                            <div className='flex items-center gap-2 mb-0.5'>
                              <p className='font-bold text-sm text-foreground group-hover:text-primary transition-colors'>{t(res.titleKey)}</p>
                              {res.sponsored && (
                                <span className='px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-extrabold rounded'>{t('roadmap.sponsored')}</span>
                              )}
                            </div>
                            <p className='text-xs text-muted-foreground mt-1'>{t(res.descKey)}</p>
                          </div>
                          <span className='material-symbols-outlined text-muted-foreground text-sm group-hover:translate-x-1 transition-transform'>
                            arrow_forward_ios
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>

            <div className='absolute bottom-0 left-0 w-full p-6 bg-card/80 backdrop-blur-md border-t border-border'>
              <button
                onClick={() => void handleMarkComplete()}
                disabled={updating || selectedStatus === 'completed'}
                className='w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50'
              >
                <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {t('roadmap.markComplete')}
              </button>
            </div>
          </aside>
        )}
      </div>

      <nav className='md:hidden fixed bottom-0 w-full bg-card flex justify-around items-center py-3 z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] border-t border-border'>
        <button className='flex flex-col items-center gap-1 text-muted-foreground cursor-pointer'>
          <span className='material-symbols-outlined'>dashboard</span>
          <span className='text-[10px] font-bold'>{t('sidebar.overview')}</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-primary cursor-pointer'>
          <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>map</span>
          <span className='text-[10px] font-bold'>{t('sidebar.learningPath')}</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-muted-foreground cursor-pointer'>
          <span className='material-symbols-outlined'>school</span>
          <span className='text-[10px] font-bold'>{t('sidebar.certificates')}</span>
        </button>
        <button className='flex flex-col items-center gap-1 text-muted-foreground cursor-pointer'>
          <span className='material-symbols-outlined'>group</span>
          <span className='text-[10px] font-bold'>{t('sidebar.jobs')}</span>
        </button>
      </nav>
    </div>
  )
}
