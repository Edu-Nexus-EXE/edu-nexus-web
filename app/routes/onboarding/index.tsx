import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { Navigate, useNavigate } from 'react-router'
import { useTranslation } from 'react-i18next'

import { getOnboarding, postOnboarding, putOnboarding } from '~/api/operations/onboarding/onboarding'
import type { SubmitOnboardingRequest } from '~/api/model'
import { cn } from '~/shared/lib/cn'
import { getAuthSession, setAuthSession } from '~/shared/lib/auth-session'

type QuestionKey = keyof SubmitOnboardingRequest

type Question = {
  key: QuestionKey
  labelKey: string
  optionKeys: string[]
}

const QUESTIONS: Question[] = [
  {
    key: 'academicYear',
    labelKey: 'onboarding.questions.academicYear.label',
    optionKeys: [
      'onboarding.questions.academicYear.options.year1',
      'onboarding.questions.academicYear.options.year2',
      'onboarding.questions.academicYear.options.year3',
      'onboarding.questions.academicYear.options.year4',
    ],
  },
  {
    key: 'major',
    labelKey: 'onboarding.questions.major.label',
    optionKeys: [
      'onboarding.questions.major.options.it',
      'onboarding.questions.major.options.marketing',
      'onboarding.questions.major.options.business',
      'onboarding.questions.major.options.other',
    ],
  },
  {
    key: 'primaryGoal',
    labelKey: 'onboarding.questions.primaryGoal.label',
    optionKeys: [
      'onboarding.questions.primaryGoal.options.explore',
      'onboarding.questions.primaryGoal.options.roadmap',
      'onboarding.questions.primaryGoal.options.improveSkill',
      'onboarding.questions.primaryGoal.options.buildPortfolio',
    ],
  },
  {
    key: 'weeklyStudyHours',
    labelKey: 'onboarding.questions.weeklyStudyHours.label',
    optionKeys: [
      'onboarding.questions.weeklyStudyHours.options.lt5',
      'onboarding.questions.weeklyStudyHours.options.5to10',
      'onboarding.questions.weeklyStudyHours.options.10to20',
      'onboarding.questions.weeklyStudyHours.options.gt20',
    ],
  },
  {
    key: 'proficiencyLevel',
    labelKey: 'onboarding.questions.proficiencyLevel.label',
    optionKeys: [
      'onboarding.questions.proficiencyLevel.options.beginner',
      'onboarding.questions.proficiencyLevel.options.basic',
      'onboarding.questions.proficiencyLevel.options.project',
      'onboarding.questions.proficiencyLevel.options.intern',
    ],
  },
  {
    key: 'learningPriority',
    labelKey: 'onboarding.questions.learningPriority.label',
    optionKeys: [
      'onboarding.questions.learningPriority.options.hardSkill',
      'onboarding.questions.learningPriority.options.softSkill',
      'onboarding.questions.learningPriority.options.certificate',
      'onboarding.questions.learningPriority.options.portfolioProject',
    ],
  },
  {
    key: 'learningBudget',
    labelKey: 'onboarding.questions.learningBudget.label',
    optionKeys: [
      'onboarding.questions.learningBudget.options.free',
      'onboarding.questions.learningBudget.options.lt500k',
      'onboarding.questions.learningBudget.options.500kto2m',
      'onboarding.questions.learningBudget.options.gt2m',
    ],
  },
  {
    key: 'preferredChannel',
    labelKey: 'onboarding.questions.preferredChannel.label',
    optionKeys: [
      'onboarding.questions.preferredChannel.options.video',
      'onboarding.questions.preferredChannel.options.docs',
      'onboarding.questions.preferredChannel.options.projects',
      'onboarding.questions.preferredChannel.options.mentor',
    ],
  },
]

type ResponseWithData<T> = { data?: T }

type OnboardingResponseData = {
  completed?: unknown
  responses?: unknown
}

function parseOnboardingData(res: unknown): { completed: boolean; responses: SubmitOnboardingRequest | null } | null {
  const data = (res as ResponseWithData<OnboardingResponseData>)?.data
  if (!data) return null

  if (typeof data?.completed === 'boolean') {
    return {
      completed: Boolean(data.completed),
      responses: (data.responses ?? null) as SubmitOnboardingRequest | null,
    }
  }

  return null
}

export default function OnboardingRoute() {
  const { t } = useTranslation('onboarding')
  const navigate = useNavigate()
  const session = getAuthSession()

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string>('')

  const [hasExisting, setHasExisting] = useState(false)
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<SubmitOnboardingRequest>({})

  const current = useMemo(() => QUESTIONS[Math.min(step, QUESTIONS.length - 1)], [step])
  const currentLabel = t(current.labelKey)
  const currentOptions = current.optionKeys.map((k) => t(k))

  useEffect(() => {
    if (!session) return
    if (session.user.isSurveyCompleted) return

    const controller = new AbortController()

    setError('')
    setLoading(true)

    getOnboarding({ signal: controller.signal } as never)
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
      })
      .catch(() => {
        // If onboarding not found or any error, user can still submit.
      })
      .finally(() => {
        setLoading(false)
      })

    return () => {
      controller.abort()
    }
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
        setError(t('onboarding.errors.completeAll'))
        return
      }
    }

    setSubmitting(true)
    setError('')

    try {
      if (hasExisting) await putOnboarding(answers)
      else await postOnboarding(answers)

      setAuthSession({ ...session, user: { ...session.user, isSurveyCompleted: true }, tokens: session.tokens })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError((err as Error).message || t('onboarding.errors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className='min-h-screen bg-background text-foreground flex items-center justify-center'>
        <div className='text-center'>
          <div className='w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto' />
          <p className='mt-4 text-sm text-muted-foreground'>{t('onboarding.loading')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className='min-h-screen bg-background text-foreground px-4 py-10'>
      <div className='max-w-3xl mx-auto'>
        <div className='text-center mb-8'>
          <h1 className='text-3xl md:text-4xl font-extrabold tracking-tight'>{t('onboarding.title')}</h1>
          <p className='text-muted-foreground mt-2'>{t('onboarding.subtitle')}</p>
        </div>

        <div className='bg-card border border-border rounded-2xl shadow-sm overflow-hidden'>
          <div className='px-6 pt-6'>
            <div className='flex items-center justify-between text-sm'>
              <span className='font-semibold text-foreground'>
                {t('onboarding.step')} {step + 1}/{total}
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
              <p className='text-xs font-semibold text-primary uppercase tracking-wider mb-2'>
                {t('onboarding.questionBadge')}
              </p>
              <h2 className='text-xl md:text-2xl font-bold text-foreground'>{currentLabel}</h2>
            </div>

            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
              {currentOptions.map((opt, idx) => {
                const checked = currentValue === opt
                return (
                  <button
                    key={idx}
                    type='button'
                    onClick={() => setAnswer(current.key, opt)}
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
                      <span className={cn('text-sm font-medium', checked ? 'text-foreground' : 'text-muted-foreground')}>{opt}</span>
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
                {t('onboarding.prev')}
              </button>

              {step < total - 1 ? (
                <button
                  type='button'
                  onClick={handleNext}
                  disabled={!canNext || submitting}
                  className='px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {t('onboarding.next')}
                </button>
              ) : (
                <button
                  type='submit'
                  disabled={submitting}
                  className='px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none'
                >
                  {submitting ? t('onboarding.submitting') : t('onboarding.finish')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
