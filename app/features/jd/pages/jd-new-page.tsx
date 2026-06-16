import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'

import { useTranslation } from 'react-i18next'

import { getSubscriptionMe } from '~/api/operations/subscription/subscription'
import { postJdSubmissions } from '~/api/operations/jd-submissions/jd-submissions'
import { QuotaExceededError } from '~/api/mutator/custom-fetch'
import { QuotaExceededModal } from '~/shared/components/quota-exceeded-modal'
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

  useEffect(() => {
    getSubscriptionMe()
      .then((res) => {
        const data = (res as { data?: { usage?: { jd?: { used?: number; limit?: number } } } })?.data
        const jdUsage = data?.usage?.jd
        // Convention: limit < 0 means unlimited. Skip the quota check
        // entirely so we never surface a false-positive "hết hạn mức" modal.
        if (
          jdUsage &&
          typeof jdUsage.used === 'number' &&
          typeof jdUsage.limit === 'number' &&
          jdUsage.limit >= 0 &&
          jdUsage.used >= jdUsage.limit
        ) {
          throw new QuotaExceededError(t('jd.new.quotaExceeded', { used: jdUsage.used, limit: jdUsage.limit }), {
            status: 403,
            quotaType: 'jd',
            current: jdUsage.used,
            limit: jdUsage.limit
          })
        }
      })
      .catch((e) => {
        if (e instanceof QuotaExceededError) throw e
      })
  }, [t])

  const canSubmit = useMemo(() => {
    if (sourceType === 'url') return Boolean(sourceUrl.trim())
    return Boolean(rawContent.trim())
  }, [rawContent, sourceType, sourceUrl])

  const contentLength = rawContent.trim().length
  const urlFilled = Boolean(sourceUrl.trim())
  const textFilled = Boolean(rawContent.trim())
  const activeInputReady = sourceType === 'url' ? urlFilled : textFilled

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
      if (e instanceof QuotaExceededError) throw e
      setError((e as Error).message || t('jd.new.errors.failed'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <QuotaExceededModal />
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      <div className='text-center mb-12'>
        <span className='inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary rounded-full border border-primary/30 shadow-sm'>
          {t('jd.new.badge')}
        </span>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>{t('jd.new.title')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{t('jd.new.subtitle')}</p>
      </div>

      <div className='mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3'>
        <div className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>upload_file</span>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                {t('jd.new.flow.stats.input')}
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {sourceType === 'url' ? t('jd.new.flow.stats.urlMode') : t('jd.new.flow.stats.textMode')}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className='material-symbols-outlined'>data_object</span>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                {t('jd.new.flow.stats.payload')}
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {sourceType === 'url'
                  ? urlFilled
                    ? t('jd.new.flow.stats.readyToSendUrl')
                    : t('jd.new.flow.stats.waitingForUrl')
                  : t('jd.new.flow.stats.charactersDetected', { count: contentLength })}
              </p>
            </div>
          </div>
        </div>
        <div className='rounded-2xl border border-border bg-card/80 p-4 shadow-sm'>
          <div className='flex items-center gap-3'>
            <div className='flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
              <span className={cn('material-symbols-outlined', isSubmitting && 'animate-spin')}>
                {isSubmitting ? 'progress_activity' : 'auto_awesome'}
              </span>
            </div>
            <div>
              <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>
                {t('jd.new.flow.stats.aiParsing')}
              </p>
              <p className='text-sm font-semibold text-foreground'>
                {isSubmitting ? t('jd.new.flow.stats.submittingToBackend') : t('jd.new.flow.stats.detailAutoUpdate')}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className='mb-8 rounded-3xl border border-border bg-card/80 p-5 shadow-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                activeInputReady
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              1
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.new.step1Title')}</p>
              <p className='text-xs text-muted-foreground mt-1'>{t('jd.new.flow.timeline.step1Hint')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                canSubmit
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              2
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.new.flow.timeline.step2Title')}</p>
              <p className='text-xs text-muted-foreground mt-1'>{t('jd.new.flow.timeline.step2Hint')}</p>
            </div>
          </div>
          <div className='flex items-start gap-3'>
            <div
              className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border text-sm font-bold',
                isSubmitting
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-muted text-muted-foreground'
              )}
            >
              3
            </div>
            <div>
              <p className='text-sm font-semibold text-foreground'>{t('jd.new.step2Title')}</p>
              <p className='text-xs text-muted-foreground mt-1'>{t('jd.new.flow.timeline.step3Hint')}</p>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className='mb-6 max-w-3xl mx-auto p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      )}

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.35fr)_380px]'>
        <div className='bg-card p-8 rounded-3xl shadow-sm border border-border transition-colors flex flex-col'>
          <div className='flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-start md:justify-between'>
            <div className='flex items-center gap-3'>
              <div className='w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
                <span className='material-symbols-outlined'>description</span>
              </div>
              <div>
                <h2 className='text-xl font-semibold text-foreground'>{t('jd.new.jobDescription')}</h2>
                <p className='text-sm text-muted-foreground'>{t('jd.new.jobDescriptionDesc')}</p>
              </div>
            </div>

            <div className='inline-flex rounded-2xl border border-border bg-muted/20 p-1'>
              <button
                type='button'
                onClick={() => setSourceType('text')}
                className={cn(
                  'inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all',
                  sourceType === 'text'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('jd.new.tabText')}
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                    sourceType === 'text'
                      ? 'bg-primary-foreground/20 text-primary-foreground'
                      : 'bg-primary/10 text-primary'
                  )}
                >
                  {t('jd.new.recommendedBadge')}
                </span>
              </button>
              <button
                type='button'
                onClick={() => setSourceType('url')}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold transition-all',
                  sourceType === 'url'
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {t('jd.new.tabUrl')}
              </button>
            </div>
          </div>

          <div className='mt-6 space-y-5 flex-grow'>
            <div
              className={cn(
                'rounded-2xl border p-4 transition-all',
                sourceType === 'url' ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10 opacity-70'
              )}
            >
              <div className='mb-3 flex items-center gap-2'>
                <span className='material-symbols-outlined text-primary text-lg'>link</span>
                <p className='text-sm font-semibold text-foreground'>{t('jd.new.tabUrl')}</p>
              </div>
              <input
                value={sourceUrl}
                onChange={(e) => setSourceUrl(e.target.value)}
                className='w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm placeholder:text-muted-foreground/50'
                placeholder={t('jd.new.urlPlaceholder')}
                type='text'
                disabled={sourceType !== 'url' || isSubmitting}
              />
              <p className='mt-2 text-xs text-muted-foreground'>
                {t('jd.new.urlNote', { tabText: t('jd.new.tabText') })}
              </p>
            </div>

            <div
              className={cn(
                'rounded-2xl border p-4 transition-all',
                sourceType === 'text' ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/10 opacity-70'
              )}
            >
              <div className='mb-3 flex items-center justify-between gap-3'>
                <div className='flex items-center gap-2'>
                  <span className='material-symbols-outlined text-primary text-lg'>notes</span>
                  <p className='text-sm font-semibold text-foreground'>{t('jd.new.tabText')}</p>
                </div>
                <span className='text-xs text-muted-foreground'>{contentLength}/50000</span>
              </div>
              <textarea
                value={rawContent}
                onChange={(e) => setRawContent(e.target.value)}
                className='w-full min-h-[280px] px-4 py-4 rounded-xl border border-border bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none text-sm resize-none placeholder:text-muted-foreground/50'
                placeholder={t('jd.new.textPlaceholder')}
                rows={10}
                disabled={sourceType !== 'text' || isSubmitting}
              />
            </div>
          </div>
        </div>

        <div className='space-y-6'>
          <div className='bg-card p-6 rounded-3xl shadow-sm border border-border'>
            <div className='flex items-center gap-3'>
              <div className='w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
                <span className={cn('material-symbols-outlined text-lg', isSubmitting && 'animate-spin')}>
                  {isSubmitting ? 'progress_activity' : 'rocket_launch'}
                </span>
              </div>
              <div>
                <h2 className='text-lg font-semibold text-foreground'>{t('jd.new.next')}</h2>
                <p className='text-sm text-muted-foreground'>{t('jd.new.nextDesc')}</p>
              </div>
            </div>

            <div className='mt-5 space-y-3'>
              <div className='rounded-2xl border border-border bg-muted/10 p-4'>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold'>
                    1
                  </div>
                  <div>
                    <p className='font-semibold text-foreground'>{t('jd.new.step1Title')}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('jd.new.step1Desc')}</p>
                  </div>
                </div>
              </div>
              <div className='rounded-2xl border border-border bg-muted/10 p-4'>
                <div className='flex items-start gap-3'>
                  <div className='mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold'>
                    2
                  </div>
                  <div>
                    <p className='font-semibold text-foreground'>{t('jd.new.step2Title')}</p>
                    <p className='mt-1 text-sm text-muted-foreground'>{t('jd.new.step2Desc')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className='mt-5 rounded-2xl border border-primary/20 bg-primary/5 p-4'>
              <p className='text-xs font-semibold uppercase tracking-widest text-primary'>
                {t('jd.new.flow.submissionStatus')}
              </p>
              <p className='mt-2 text-sm font-semibold text-foreground'>
                {canSubmit
                  ? t('jd.new.ready')
                  : sourceType === 'url'
                    ? t('jd.new.flow.continueWithUrl')
                    : t('jd.new.flow.continueWithText')}
              </p>
              <p className='mt-1 text-sm text-muted-foreground'>
                {sourceType === 'url' ? t('jd.new.flow.urlHelp') : t('jd.new.flow.textHelp')}
              </p>
            </div>

            <button
              type='button'
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className='w-full mt-6 py-3.5 bg-primary text-primary-foreground text-sm font-bold rounded-2xl shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none transition-all'
            >
              {isSubmitting ? t('jd.new.submitting') : t('jd.new.submit')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
