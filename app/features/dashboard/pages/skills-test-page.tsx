import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

export function SkillsTestPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  // Form states
  const [url, setUrl] = useState('')
  const [jdText, setJdText] = useState('')
  const [selectedTest, setSelectedTest] = useState<'t1' | 't2' | 't3'>('t1')
  const [isFetchingJd, setIsFetchingJd] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [testActive, setTestActive] = useState(false)

  // Simulation handlers
  const handleFetchJd = () => {
    if (!url) return
    setIsFetchingJd(true)
    setTimeout(() => {
      setIsFetchingJd(false)
      setJdText(
        `Job Description for Senior Java Developer:\n- Intermediate knowledge of Docker & Containerization\n- Building and maintaining automated CI/CD pipelines\n- High-performance SQL query tuning & schema design\n- Robust understanding of Java OOP design principles`
      )
    }, 1200)
  }

  const handleStartTest = () => {
    setTestActive(true)
    setTimeout(() => {
      setTestActive(false)
      alert(t('skillsTest.test.startBtn') + ' successful! Redirecting to quiz engine...')
    }, 1000)
  }

  const handleAnalyzeGap = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      navigate('/dashboard/gap-analysis')
    }, 1500)
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      {/* Background Decorative Blobs */}
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      {/* Header Title Section */}
      <div className='text-center mb-16'>
        <span className='inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary rounded-full border border-primary/30 shadow-sm'>
          {t('skillsTest.badge')}
        </span>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>{t('skillsTest.title')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{t('skillsTest.subtitle')}</p>
      </div>

      {/* Forms & Selection Panel */}
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
        {/* Card 1: Job Description Input */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>description</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('skillsTest.jd.title')}</h2>
              <p className='text-sm text-muted-foreground'>{t('skillsTest.jd.subtitle')}</p>
            </div>
          </div>

          <div className='space-y-4 flex-grow'>
            <div className='relative'>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className='w-full pl-4 pr-24 py-3 rounded-lg border border-border bg-muted/30 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm placeholder:text-muted-foreground/50'
                placeholder={t('skillsTest.jd.urlPlaceholder')}
                type='text'
              />
              <button
                onClick={handleFetchJd}
                disabled={isFetchingJd || !url}
                className='absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 disabled:opacity-50 disabled:pointer-events-none text-primary-foreground text-xs font-bold rounded-md hover:brightness-110 transition-all shadow-md shadow-primary/20 cursor-pointer'
              >
                {isFetchingJd ? '...' : t('skillsTest.jd.fetchBtn')}
              </button>
            </div>

            <div className='relative group/textarea'>
              <textarea
                value={jdText}
                onChange={(e) => setJdText(e.target.value)}
                className='w-full px-4 py-4 rounded-lg border border-border bg-muted/30 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm resize-none placeholder:text-muted-foreground/50'
                placeholder={t('skillsTest.jd.textareaPlaceholder')}
                rows={8}
              />
            </div>
          </div>

          <div className='mt-6 flex items-center gap-2 text-xs text-primary font-medium'>
            <span className='material-symbols-outlined text-sm'>check_circle</span>
            <span>{t('skillsTest.jd.ready')}</span>
          </div>
        </div>

        {/* Card 2: Assessment Selector */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>quiz</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('skillsTest.test.title')}</h2>
              <p className='text-sm text-muted-foreground'>{t('skillsTest.test.subtitle')}</p>
            </div>
          </div>

          <div className='space-y-3 mb-6 flex-grow'>
            {/* Test Item 1 */}
            <div
              onClick={() => setSelectedTest('t1')}
              className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all hover:shadow-sm ${
                selectedTest === 't1'
                  ? 'border-primary bg-primary/5 shadow-md shadow-primary/5'
                  : 'border-border hover:border-primary/50 hover:bg-muted/40'
              }`}
            >
              <div className='flex items-center gap-3'>
                <div
                  className={`p-2 rounded-lg ${selectedTest === 't1' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}
                >
                  <span className='material-symbols-outlined text-[20px]'>analytics</span>
                </div>
                <div className='text-sm font-semibold text-foreground'>{t('skillsTest.test.t1Name')}</div>
              </div>
              <span
                className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                  selectedTest === 't1' ? 'text-primary bg-primary/10' : 'text-muted-foreground bg-muted'
                }`}
              >
                {t('skillsTest.test.t1Time')}
              </span>
            </div>
          </div>

          <button
            onClick={handleStartTest}
            disabled={testActive}
            className='w-full py-3 bg-card text-primary text-sm font-bold rounded-lg shadow-sm border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98]'
          >
            <span className='material-symbols-outlined text-sm'>play_circle</span>
            {testActive ? '...' : t('skillsTest.test.startBtn')}
          </button>
        </div>
      </div>

      {/* Global CTA Section */}
      <div className='flex flex-col items-center pb-10'>
        <button
          onClick={handleAnalyzeGap}
          disabled={isAnalyzing || !jdText}
          className='ai-glow group relative px-12 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-primary/30 disabled:opacity-50 disabled:pointer-events-none cursor-pointer'
        >
          <span className='material-symbols-outlined font-bold group-hover:rotate-12 transition-transform'>
            auto_awesome
          </span>
          {isAnalyzing ? '...' : t('skillsTest.analyzeBtn')}
        </button>
        <p className='mt-4 text-sm text-muted-foreground flex items-center gap-2'>
          <span className='material-symbols-outlined text-sm'>lock</span>
          {t('skillsTest.secure')}
        </p>
      </div>
    </div>
  )
}
