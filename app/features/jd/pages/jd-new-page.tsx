import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { useTranslation } from 'react-i18next'

import { postJdSubmissions } from '~/api/operations/jd-submissions/jd-submissions'
import { cn } from '~/shared/lib/cn'

type ResponseWithData<T> = { data?: T }

type JdSubmissionCreatedData = {
  id?: unknown
  jdId?: unknown
}

type JdSubmissionPayload =
  | { sourceType: 'url'; sourceUrl: string; rawContent: null }
  | { sourceType: 'text'; sourceUrl: null; rawContent: string }

function parseCreatedJdId(res: unknown): string {
  const data = (res as ResponseWithData<JdSubmissionCreatedData>)?.data
  return String(data?.id ?? data?.jdId ?? '')
}

export function JdNewPage() {
  const { t } = useTranslation('jd')
  const navigate = useNavigate()

  const [sourceType, setSourceType] = useState<JdSubmissionPayload['sourceType']>('text')
  const [sourceUrl, setSourceUrl] = useState('')
  const [rawContent, setRawContent] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const canSubmit = useMemo(() => {
    if (sourceType === 'url') return Boolean(sourceUrl.trim())
    return Boolean(rawContent.trim())
  }, [rawContent, sourceType, sourceUrl])

  async function handleSubmit() {
    if (!canSubmit || isSubmitting) return

    setError('')
    setIsSubmitting(true)

    try {
      const payload: JdSubmissionPayload =
        sourceType === 'url'
          ? { sourceType: 'url', sourceUrl: sourceUrl.trim(), rawContent: null }
          : { sourceType: 'text', sourceUrl: null, rawContent: rawContent.trim() }

      const res = await postJdSubmissions(payload)
      const jdId = parseCreatedJdId(res)

      if (!jdId) {
        throw new Error(t('jd.new.errors.missingJdId'))
      }

      navigate(`/dashboard/jd/${jdId}`)
    } catch (e) {
      setError((e as Error).message || t('jd.new.errors.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      <div className='text-center mb-16'>
        <span className='inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary rounded-full border border-primary/30 shadow-sm'>
          {t('jd.new.badge')}
        </span>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>{t('jd.new.title')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{t('jd.new.subtitle')}</p>
      </div>

      {error && (
        <div className='mb-6 max-w-3xl mx-auto p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12'>
        {/* Card: JD Input (reused look & feel) */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>description</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('jd.new.jobDescription')}</h2>
              <p className='text-sm text-muted-foreground'>{t('jd.new.jobDescriptionDesc')}</p>
            </div>
          </div>

          <div className='space-y-4 flex-grow'>
            <div className='flex items-center gap-2'>
              <button
                type='button'
                onClick={() => setSourceType('text')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold border transition-all',
                  sourceType === 'text'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/40'
                )}
              >
                {t('jd.new.tabText')}
              </button>
              <button
                type='button'
                onClick={() => setSourceType('url')}
                className={cn(
                  'px-4 py-2 rounded-lg text-xs font-bold border transition-all',
                  sourceType === 'url'
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-muted/20 text-muted-foreground hover:border-primary/40'
                )}
              >
                {t('jd.new.tabUrl')}
              </button>
            </div>

            <div className='relative'>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className='w-full pl-4 pr-28 py-3 rounded-lg border border-border bg-muted/30 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm placeholder:text-muted-foreground/50'
                placeholder={t('jd.new.urlPlaceholder')}
                type='text'
                disabled={sourceType !== 'url'}
              />
              <button
                type='button'
                disabled={sourceType !== 'url' || !sourceUrl.trim()}
                className='absolute right-2 top-2 px-4 py-1.5 bg-gradient-to-r from-primary to-primary/80 disabled:opacity-50 disabled:pointer-events-none text-primary-foreground text-xs font-bold rounded-md hover:brightness-110 transition-all shadow-md shadow-primary/20 cursor-pointer'
              >
                {t('jd.new.readyToSubmit')}
              </button>
            </div>

            <div className='relative group/textarea'>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className='w-full px-4 py-4 rounded-lg border border-border bg-muted/30 text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm resize-none placeholder:text-muted-foreground/50'
                placeholder={t('jd.new.textPlaceholder')}
                rows={8}
                disabled={sourceType !== 'text'}
              />
            </div>
          </div>

          <div className='mt-6 flex items-center gap-2 text-xs text-primary font-medium'>
            <span className='material-symbols-outlined text-sm'>check_circle</span>
            <span>{t('jd.new.ready')}</span>
          </div>
        </div>

        {/* Card: Next step preview */}
        <div className='bg-card p-8 rounded-xl shadow-sm border border-border hover:border-primary/40 transition-colors flex flex-col group'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>route</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('jd.new.next')}</h2>
              <p className='text-sm text-muted-foreground'>{t('jd.new.nextDesc')}</p>
            </div>
          </div>

          <div className='flex-grow space-y-3 text-sm text-muted-foreground'>
            <div className='p-4 rounded-xl border border-border bg-muted/20'>
              <p className='font-semibold text-foreground mb-1'>{t('jd.new.step1Title')}</p>
              <p>{t('jd.new.step1Desc')}</p>
            </div>
            <div className='p-4 rounded-xl border border-border bg-muted/20'>
              <p className='font-semibold text-foreground mb-1'>{t('jd.new.step2Title')}</p>
              <p>{t('jd.new.step2Desc')}</p>
            </div>
          </div>

          <button
            type='button'
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className='w-full mt-6 py-3 bg-primary text-primary-foreground text-sm font-bold rounded-lg shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-all'
          >
            {isSubmitting ? t('jd.new.submitting') : t('jd.new.submit')}
          </button>
        </div>
      </div>
    </div>
  )
}
