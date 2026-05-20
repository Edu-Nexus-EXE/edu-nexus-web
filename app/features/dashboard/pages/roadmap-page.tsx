import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

interface RoadmapNode {
  id: string
  nameKey: string
  subKey?: string
  icon: string
  status: 'completed' | 'active' | 'future'
}

interface ResourceItem {
  titleKey: string
  descKey: string
  icon: string
  iconBg: string
  iconColor: string
  sponsored?: boolean
}

export function RoadmapPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()
  const [selectedNode, setSelectedNode] = useState<string | null>('spring_boot')
  const [isPanelOpen, setIsPanelOpen] = useState(true)
  const activeNodeRef = useRef<HTMLDivElement>(null)

  const nodes: RoadmapNode[] = [
    { id: 'java_core', nameKey: 'roadmap.nodes.javaCore', icon: 'check_circle', status: 'completed' },
    { id: 'sql_db', nameKey: 'roadmap.nodes.sqlDb', icon: 'check_circle', status: 'completed' },
    { id: 'spring_boot', nameKey: 'roadmap.nodes.springBoot', subKey: 'roadmap.nodes.springBootSub', icon: 'bolt', status: 'active' },
    { id: 'microservices', nameKey: 'roadmap.nodes.microservices', icon: 'cloud_done', status: 'future' },
  ]

  const resources: ResourceItem[] = [
    { titleKey: 'roadmap.youtubeTitle', descKey: 'roadmap.youtubeDesc', icon: 'play_circle', iconBg: 'bg-destructive/10', iconColor: 'text-destructive' },
    { titleKey: 'roadmap.docsTitle', descKey: 'roadmap.docsDesc', icon: 'description', iconBg: 'bg-info/10', iconColor: 'text-info' },
    { titleKey: 'roadmap.udemyTitle', descKey: 'roadmap.udemyDesc', icon: 'school', iconBg: 'bg-primary/10', iconColor: 'text-primary', sponsored: true },
  ]

  // Subtle floating animation for the active node
  useEffect(() => {
    const el = activeNodeRef.current
    if (!el) return
    let angle = 0
    let animId: number
    const animate = () => {
      angle += 0.05
      const y = Math.sin(angle) * 5
      el.style.transform = `translateY(${y}px) scale(1.1)`
      animId = requestAnimationFrame(animate)
    }
    animId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animId)
  }, [])

  const handleNodeClick = (id: string) => {
    setSelectedNode(id)
    setIsPanelOpen(true)
  }

  const activeNode = nodes.find(n => n.id === selectedNode)

  return (
    <div className='min-h-screen bg-background'>
      {/* Custom styles */}
      <style>{`
        .roadmap-line-dashed {
          background: repeating-linear-gradient(to bottom, var(--color-primary) 0, var(--color-primary) 8px, transparent 8px, transparent 16px);
        }
        .node-glow {
          box-shadow: 0 0 30px color-mix(in srgb, var(--color-primary) 30%, transparent);
        }
        @keyframes float-bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .badge-bounce {
          animation: float-bounce 2s ease-in-out infinite;
        }
      `}</style>

      {/* Top Header Bar */}
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
        {/* Main Content */}
        <main className={`flex-grow transition-all duration-300 ${isPanelOpen && selectedNode ? 'lg:mr-[420px]' : ''}`}>
          <div className='p-8 max-w-4xl mx-auto'>
            {/* Title & Progress */}
            <div className='mb-16'>
              <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4 leading-tight'>
                {t('roadmap.title')}
              </h1>
              <div className='h-2.5 w-full bg-muted rounded-full overflow-hidden border border-border'>
                <div className='h-full bg-primary rounded-full transition-all duration-1000' style={{ width: '65%' }} />
              </div>
              <p className='mt-3 text-muted-foreground text-sm font-medium'>
                {t('roadmap.progressText', { percent: 65 })}
              </p>
            </div>

            {/* Roadmap Visualization */}
            <div className='relative flex flex-col items-center gap-16 pb-20'>
              {/* Dashed connecting line */}
              <div className='absolute w-1 h-full roadmap-line-dashed left-1/2 -translate-x-1/2 -z-10 opacity-20' />

              {nodes.map((node) => {
                if (node.status === 'completed') {
                  return (
                    <div
                      key={node.id}
                      className='relative flex flex-col items-center cursor-pointer group'
                      onClick={() => handleNodeClick(node.id)}
                    >
                      <div className='w-16 h-16 bg-muted-foreground text-background rounded-full flex items-center justify-center shadow-lg border-4 border-background ring-4 ring-muted-foreground/10 group-hover:scale-105 transition-transform'>
                        <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='font-bold text-foreground'>{t(node.nameKey)}</p>
                        <p className='text-xs text-muted-foreground'>{t('roadmap.completed')}</p>
                      </div>
                    </div>
                  )
                }

                if (node.status === 'active') {
                  return (
                    <div
                      key={node.id}
                      className='relative flex flex-col items-center cursor-pointer'
                      onClick={() => handleNodeClick(node.id)}
                    >
                      {/* "ĐANG HỌC" badge */}
                      <div className='absolute -top-12 px-3 py-1 bg-primary/15 text-primary text-[10px] font-bold rounded-full badge-bounce border border-primary/30'>
                        {t('roadmap.learning')}
                      </div>
                      <div
                        ref={activeNodeRef}
                        className='w-20 h-20 bg-primary text-primary-foreground rounded-full flex items-center justify-center node-glow border-4 border-background ring-8 ring-primary/20'
                      >
                        <span className='material-symbols-outlined text-3xl'>bolt</span>
                      </div>
                      <div className='mt-4 text-center'>
                        <p className='font-bold text-primary text-lg'>{t(node.nameKey)}</p>
                        {node.subKey && (
                          <p className='text-xs text-primary font-medium'>{t(node.subKey)}</p>
                        )}
                      </div>
                      {/* Decorative glow */}
                      <div className='absolute -inset-4 bg-primary/5 blur-2xl -z-20 rounded-full' />
                    </div>
                  )
                }

                // Future node
                return (
                  <div
                    key={node.id}
                    className='relative flex flex-col items-center grayscale opacity-40 cursor-not-allowed'
                  >
                    <div className='w-16 h-16 bg-muted text-muted-foreground rounded-full flex items-center justify-center border-4 border-background'>
                      <span className='material-symbols-outlined'>{node.icon}</span>
                    </div>
                    <div className='mt-4 text-center'>
                      <p className='font-bold text-foreground'>{t(node.nameKey)}</p>
                      <p className='text-xs text-muted-foreground'>{t('roadmap.upcoming')}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </main>

        {/* Right Detail Panel */}
        {isPanelOpen && activeNode && (
          <aside className='hidden lg:flex fixed right-0 top-16 w-[420px] h-[calc(100vh-64px)] bg-card shadow-2xl flex-col border-l border-border z-40'>
            {/* Scrollable Content — header + resources all scroll together */}
            <div className='flex-grow overflow-y-auto pb-28'>
              <div className='p-8 pb-4'>
                <div className='flex justify-between items-start mb-6'>
                  <div className='w-16 h-16 bg-primary/15 rounded-2xl flex items-center justify-center text-primary shadow-lg shadow-primary/10 border border-primary/20'>
                    <span className='material-symbols-outlined text-4xl' style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span>
                  </div>
                  <button
                    onClick={() => setIsPanelOpen(false)}
                    className='p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground cursor-pointer'
                    aria-label={t('roadmap.closePanel')}
                  >
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
                <p className='text-muted-foreground text-sm leading-relaxed mb-6'>
                  {t('roadmap.description')}
                </p>

                {/* Prerequisites */}
                <div className='mb-8 p-4 bg-muted/30 rounded-xl border border-border'>
                  <p className='text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <span className='material-symbols-outlined text-sm'>assignment_turned_in</span>
                    {t('roadmap.prerequisites')}
                  </p>
                  <div className='flex flex-wrap gap-2'>
                    <span className='flex items-center gap-1.5 px-3 py-1.5 bg-card text-foreground border border-success/20 rounded-full text-xs font-medium shadow-sm'>
                      Java OOP
                      <span className='material-symbols-outlined text-success text-sm' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Resources Section */}
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
                      <div
                        key={res.titleKey}
                        className='group p-4 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer'
                      >
                        <div className='flex items-start gap-4'>
                          <div className={`p-3 ${res.iconBg} ${res.iconColor} rounded-xl`}>
                            <span className='material-symbols-outlined'>{res.icon}</span>
                          </div>
                          <div className='flex-grow'>
                            <div className='flex items-center gap-2 mb-0.5'>
                              <p className='font-bold text-sm text-foreground group-hover:text-primary transition-colors'>
                                {t(res.titleKey)}
                              </p>
                              {res.sponsored && (
                                <span className='px-1.5 py-0.5 bg-primary/10 text-primary text-[8px] font-extrabold rounded'>
                                  {t('roadmap.sponsored')}
                                </span>
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

            {/* Footer Action */}
            <div className='absolute bottom-0 left-0 w-full p-6 bg-card/80 backdrop-blur-md border-t border-border'>
              <button className='w-full py-4 bg-primary text-primary-foreground font-bold rounded-xl shadow-xl shadow-primary/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 cursor-pointer'>
                <span className='material-symbols-outlined' style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                {t('roadmap.markComplete')}
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* Mobile Bottom Nav */}
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
