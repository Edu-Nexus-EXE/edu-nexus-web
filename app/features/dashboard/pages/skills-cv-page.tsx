import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'

export function SkillsCvPage() {
  const { t } = useTranslation('dashboard')
  const navigate = useNavigate()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const handleAnalyzeGap = () => {
    setIsAnalyzing(true)
    setTimeout(() => {
      setIsAnalyzing(false)
      navigate('/dashboard/analytics/gap-analysis')
    }, 1500)
  }

  function acceptCvFile(f: File | null) {
    if (!f) return

    const isPdf = f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf')
    if (!isPdf) return

    if (f.size > 5 * 1024 * 1024) return

    setCvFile(f)
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      {/* Background Decorative Blobs */}
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-success/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      <div className='text-center mb-16'>
        <span className='inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary rounded-full border border-primary/30 shadow-sm'>
          {t('skillsCv.badge')}
        </span>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>{t('skillsCv.title')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{t('skillsCv.subtitle')}</p>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
        {/* JD Section */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>description</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('skillsCv.jd.title')}</h2>
              <p className='text-sm text-muted-foreground'>{t('skillsCv.jd.subtitle')}</p>
            </div>
          </div>

          <div className='space-y-4 flex-grow'>
            <div className='relative'>
              <input
                type='text'
                placeholder={t('skillsCv.jd.urlPlaceholder')}
                className='w-full px-4 pr-24 py-3 rounded-lg border border-border bg-muted/50 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm placeholder:text-muted-foreground/50'
              />
              <button
                type='button'
                className='absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-md hover:brightness-110 transition-all shadow-md shadow-primary/20 cursor-pointer'
              >
                {t('skillsCv.jd.fetchBtn')}
              </button>
            </div>
            <div className='relative group/textarea'>
              <textarea
                rows={8}
                placeholder={t('skillsCv.jd.textareaPlaceholder')}
                className='w-full px-4 py-4 rounded-lg border border-border bg-muted/50 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm resize-none placeholder:text-muted-foreground/50'
              />
            </div>
          </div>

          <div className='mt-6 flex items-center gap-2 text-xs text-primary font-medium'>
            <span className='material-symbols-outlined text-sm'>check_circle</span>
            <span>{t('skillsCv.jd.ready')}</span>
          </div>
        </div>

        {/* CV Section */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>upload_file</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('skillsCv.cv.title')}</h2>
              <p className='text-sm text-muted-foreground'>{t('skillsCv.cv.subtitle')}</p>
            </div>
          </div>

          <label className='flex-grow flex flex-col items-center justify-center p-8 bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group/drop rounded-xl border-2 border-dashed border-primary/30'>
            <input type='file' accept='application/pdf' className='hidden' onChange={(e) => acceptCvFile(e.target.files?.[0] ?? null)} />

            <div className='mb-4 transform group-hover/drop:-translate-y-1 transition-transform'>
              <span className='material-symbols-outlined text-5xl text-primary drop-shadow-sm'>cloud_upload</span>
            </div>
            <p className='text-sm font-medium mb-1 text-foreground'>{t('skillsCv.cv.dropzone')}</p>
            <p className='text-xs text-muted-foreground mb-4'>{t('skillsCv.cv.limit')}</p>
            <div className='px-6 py-2 bg-card text-primary text-sm font-semibold rounded-lg shadow-sm border border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-transparent transition-all cursor-pointer'>
              {t('skillsCv.cv.browseBtn')}
            </div>
          </label>

          {cvFile && (
            <div className='mt-6 bg-muted/30 p-3 rounded-lg border border-border'>
              <div className='flex items-center justify-between mb-2'>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-primary text-lg'>picture_as_pdf</span>
                  <span className='text-xs font-medium text-foreground'>{cvFile.name}</span>
                </div>
                <button type='button' className='text-xs font-bold text-muted-foreground hover:text-foreground' onClick={() => setCvFile(null)}>
                  Remove
                </button>
              </div>
              <div className='w-full bg-muted h-1.5 rounded-full overflow-hidden'>
                <div className='bg-gradient-to-r from-primary to-primary/60 h-full w-full shadow-lg shadow-primary/20' />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className='flex flex-col items-center pb-10'>
        <button
          type='button'
          onClick={handleAnalyzeGap}
          disabled={isAnalyzing}
          className='ai-glow group relative px-12 py-4 bg-primary text-primary-foreground font-bold text-lg rounded-xl hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 shadow-xl shadow-primary/30 cursor-pointer disabled:opacity-50 disabled:pointer-events-none'
        >
          <span className='material-symbols-outlined font-bold group-hover:rotate-12 transition-transform'>auto_awesome</span>
          {isAnalyzing ? '...' : t('skillsCv.analyzeBtn')}
        </button>
        <p className='mt-4 text-sm text-muted-foreground flex items-center gap-2'>
          <span className='material-symbols-outlined text-sm'>lock</span>
          {t('skillsCv.secure')}
        </p>
      </div>
    </div>
  )
}
