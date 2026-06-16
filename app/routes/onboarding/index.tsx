import type { FormEvent } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, Navigate, useNavigate } from 'react-router'

import { getOnboarding, postOnboarding, putOnboarding } from '~/api/operations/onboarding/onboarding'
import type { SubmitOnboardingRequest } from '~/api/model'
import { getAuthSession, setAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'

const QUESTIONS = [
  {
    key: 'academicYear',
    labelKey: 'questions.academicYear.label',
    options: [
      { value: 'Năm 1', labelKey: 'questions.academicYear.options.year1' },
      { value: 'Năm 2', labelKey: 'questions.academicYear.options.year2' },
      { value: 'Năm 3', labelKey: 'questions.academicYear.options.year3' },
      { value: 'Năm 4', labelKey: 'questions.academicYear.options.year4' }
    ]
  },
  {
    key: 'major',
    labelKey: 'questions.major.label',
    options: [
      { value: 'IT', labelKey: 'questions.major.options.it' },
      { value: 'Marketing', labelKey: 'questions.major.options.marketing' },
      { value: 'Business', labelKey: 'questions.major.options.business' },
      { value: 'Khác', labelKey: 'questions.major.options.other' }
    ]
  },
  {
    key: 'primaryGoal',
    labelKey: 'questions.primaryGoal.label',
    options: [
      { value: 'Khám phá hướng đi', labelKey: 'questions.primaryGoal.options.explore' },
      { value: 'Đã có target, cần lộ trình', labelKey: 'questions.primaryGoal.options.roadmap' },
      { value: 'Improve 1 kỹ năng cụ thể', labelKey: 'questions.primaryGoal.options.improveSkill' },
      { value: 'Build portfolio để xin việc', labelKey: 'questions.primaryGoal.options.buildPortfolio' }
    ]
  },
  {
    key: 'weeklyStudyHours',
    labelKey: 'questions.weeklyStudyHours.label',
    options: [
      { value: '< 5h', labelKey: 'questions.weeklyStudyHours.options.lt5' },
      { value: '5-10h', labelKey: 'questions.weeklyStudyHours.options.5to10' },
      { value: '10-20h', labelKey: 'questions.weeklyStudyHours.options.10to20' },
      { value: '> 20h', labelKey: 'questions.weeklyStudyHours.options.gt20' }
    ]
  },
  {
    key: 'proficiencyLevel',
    labelKey: 'questions.proficiencyLevel.label',
    options: [
      { value: 'Beginner', labelKey: 'questions.proficiencyLevel.options.beginner' },
      { value: 'Đã học cơ bản', labelKey: 'questions.proficiencyLevel.options.basic' },
      { value: 'Có kinh nghiệm dự án', labelKey: 'questions.proficiencyLevel.options.project' },
      { value: 'Đã đi thực tập', labelKey: 'questions.proficiencyLevel.options.intern' }
    ]
  },
  {
    key: 'learningPriority',
    labelKey: 'questions.learningPriority.label',
    options: [
      { value: 'Hard skill', labelKey: 'questions.learningPriority.options.hardSkill' },
      { value: 'Soft skill', labelKey: 'questions.learningPriority.options.softSkill' },
      { value: 'Certificate', labelKey: 'questions.learningPriority.options.certificate' },
      { value: 'Portfolio project', labelKey: 'questions.learningPriority.options.portfolioProject' }
    ]
  },
  {
    key: 'learningBudget',
    labelKey: 'questions.learningBudget.label',
    options: [
      { value: 'free', labelKey: 'questions.learningBudget.options.free' },
      { value: '< 500k', labelKey: 'questions.learningBudget.options.lt500k' },
      { value: '500k-2tr', labelKey: 'questions.learningBudget.options.500kto2m' },
      { value: '> 2tr', labelKey: 'questions.learningBudget.options.gt2m' }
    ]
  },
  {
    key: 'preferredChannel',
    labelKey: 'questions.preferredChannel.label',
    options: [
      { value: 'Video', labelKey: 'questions.preferredChannel.options.video' },
      { value: 'Đọc tài liệu', labelKey: 'questions.preferredChannel.options.docs' },
      { value: 'Làm project thực tế', labelKey: 'questions.preferredChannel.options.projects' },
      { value: 'Học có mentor', labelKey: 'questions.preferredChannel.options.mentor' }
    ]
  }
] as const

type QuestionKey = (typeof QUESTIONS)[number]['key']

type ParsedOnboarding = {
  completed: boolean
  responses?: SubmitOnboardingRequest
}

function parseOnboardingData(res: unknown): ParsedOnboarding | null {
  const data = (res as { data?: unknown })?.data
  if (!data || typeof data !== 'object') return null
  const raw = data as Record<string, unknown>
  return {
    completed: Boolean(raw.completed),
    responses:
      raw.responses && typeof raw.responses === 'object' ? (raw.responses as SubmitOnboardingRequest) : undefined
  }
}

function parseApiError(error: unknown, fallback: string) {
  const message = (error as Error)?.message
  if (!message) return fallback

  try {
    const parsed = JSON.parse(message) as {
      title?: string
      errors?: Record<string, string[]>
      error?: { code?: string; message?: string }
    }

    if (parsed.error?.message || parsed.error?.code) {
      return parsed.error.message || parsed.error.code || fallback
    }

    const firstValidationMessage = Object.values(parsed.errors ?? {})
      .flat()
      .find((value) => typeof value === 'string' && value.trim().length > 0)

    if (firstValidationMessage) return firstValidationMessage
    if (parsed.title) return parsed.title
  } catch {
    return message || fallback
  }

  return message || fallback
}

export default function OnboardingRoute() {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()
  const session = getAuthSession()

  const [loading, setLoading] = useState(Boolean(session && !session.user.isSurveyCompleted))
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [hasExisting, setHasExisting] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SubmitOnboardingRequest>({})

  const current = useMemo(() => QUESTIONS[Math.min(step, QUESTIONS.length - 1)], [step])
  const currentLabel = t(current.labelKey)
  const currentOptions = current.options.map((option) => ({
    value: option.value,
    label: t(option.labelKey)
  }))

  useEffect(() => {
    if (!session || session.user.isSurveyCompleted) {
      return
    }

    const controller = new AbortController()

    getOnboarding({ signal: controller.signal })
      .then((res) => {
        const parsed = parseOnboardingData(res)
        if (!parsed) return

        if (parsed.completed) {
          setAuthSession({ ...session, user: { ...session.user, isSurveyCompleted: true } })
          navigate('/dashboard', { replace: true })
          return
        }

        if (parsed.responses) {
          setHasExisting(true)
          setAnswers(parsed.responses)
        }

        setError('')
      })
      .catch((err) => {
        setError(parseApiError(err, t('errors.loadFailed')))
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, session])

  if (!session) return <Navigate to='/login' replace />
  if (session.user.isSurveyCompleted) return <Navigate to='/dashboard' replace />

  const total = QUESTIONS.length
  const progress = Math.round(((step + 1) / total) * 100)

  const currentValue = (answers[current.key] ?? '') as string
  const canNext = Boolean(currentValue)

  function setAnswer(key: QuestionKey, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }))
  }

  function handlePrev() {
    setStep((s) => Math.max(0, s - 1))
  }

  function handleNext() {
    if (!canNext) return
    setStep((s) => Math.min(total - 1, s + 1))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (submitting) return
    if (!session) return

    for (const q of QUESTIONS) {
      if (!answers[q.key]) {
        setError(t('errors.completeAll'))
        return
      }
    }

    const payload = QUESTIONS.reduce<SubmitOnboardingRequest>((acc, question) => {
      acc[question.key] = answers[question.key] ?? ''
      return acc
    }, {})

    setSubmitting(true)
    setError('')

    try {
      if (hasExisting) await putOnboarding(payload)
      else await postOnboarding(payload)

      setAuthSession({ ...session, user: { ...session.user, isSurveyCompleted: true }, tokens: session.tokens })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      console.error('Onboarding submit failed', { payload, err })
      setError(parseApiError(err, t('errors.submitFailed')))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
          <p className='mt-4 text-sm text-muted-foreground'>{t('loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background text-foreground px-4 py-10'>
      <div className='max-w-3xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>{t('title')}</h1>
          <p className='text-muted-foreground mt-2'>{t('subtitle')}</p>
          <div className='mt-4'>
            <Link
              to='/dashboard'
              className='inline-flex items-center justify-center rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground hover:bg-muted/40 hover:text-foreground'
            >
              {t('backToDashboard')}
            </Link>
          </div>
        </div>

        <div className='bg-card border border-border rounded-2xl shadow-sm overflow-hidden'>
          <div className='px-6 pt-6'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-semibold text-foreground'>
                {t('step')} {step + 1}/{total}
              </span>
              <span className='text-muted-foreground'>{progress}%</span>
            </div>
            <div className='mt-3 h-2 w-full bg-muted rounded-full overflow-hidden'>
              <div className='h-full bg-primary transition-all' style={{ width: `${progress}%` }} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className='p-6 md:p-8'>
            {error && (
              <div className='mb-5 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
                {error}
              </div>
            )}

            <div className='mb-6'>
              <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>{t('questionBadge')}</p>
              <h2 className='text-xl md:text-2xl font-bold text-foreground'>{currentLabel}</h2>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {currentOptions.map((opt) => {
                const checked = currentValue === opt.value
                return (
                  <button
                    key={opt.value}
                    type='button'
                    onClick={() => setAnswer(current.key, opt.value)}
                    className={cn(
                      'text-left p-4 rounded-xl border transition-all',
                      checked
                        ? 'border-primary bg-primary/10 shadow-sm'
                        : 'border-border bg-background hover:bg-muted/30 hover:border-primary/40'
                    )}
                  >
                    <div className='flex items-start gap-3'>
                      <span
                        className={cn(
                          'mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center shrink-0',
                          checked ? 'border-primary' : 'border-border'
                        )}
                      >
                        {checked && <span className='w-2.5 h-2.5 rounded-full bg-primary' />}
                      </span>
                      <span
                        className={cn('text-sm font-medium', checked ? 'text-foreground' : 'text-muted-foreground')}
                      >
                        {opt.label}
                      </span>
                    </div>
                  </button>
                )
              })}
            </div>

            <div className='mt-8 flex items-center justify-between gap-3'>
              <button
                type='button'
                onClick={handlePrev}
                disabled={step === 0 || submitting}
                className='px-5 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 disabled:opacity-50 disabled:pointer-events-none'
              >
                {t('prev')}
              </button>

              {step < total - 1 ? (
                <button
                  type='button'
                  onClick={handleNext}
                  disabled={!canNext || submitting}
                  className='px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {t('next')}
                </button>
              ) : (
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {submitting ? t('submitting') : t('finish')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
