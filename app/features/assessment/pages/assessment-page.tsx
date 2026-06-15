import { Navigate, useNavigate, useParams, useSearchParams } from 'react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getJdSubmissionsId } from '~/api/operations/jd-submissions/jd-submissions'
import {
  getAssessmentSessionsSessionIdQuestions,
  postAssessmentPathsPathIdSessions,
  postAssessmentSessionsSessionIdSubmit,
} from '~/api/operations/assessment-sessions/assessment-sessions'
import type { StartAssessmentSessionRequest, SubmitAssessmentSessionRequest } from '~/api/model'
import { useToast } from '~/shared/components'
import { getReusableSessions, parseAutoTriggered } from '~/shared/lib/assessment-api'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

type SessionStatus = 'in_progress' | 'submitted' | 'expired'

type Question = {
  id: string
  sequenceOrder: number
  part: number
  questionText: string
  options: Record<'A' | 'B' | 'C' | 'D', string>
}

type SessionQuestions = {
  sessionId: string
  status: SessionStatus
  questions: Question[]
}

type ResponseWithData<T> = { data?: T }

type ReusableSession = {
  sessionId: string
  scorePercent: number
  fromJdTitle?: string | null
}

type ReusableSessionDto = {
  sessionId?: unknown
  scorePercent?: unknown
  fromJdTitle?: unknown
}

type QuestionDto = {
  id?: unknown
  sequenceOrder?: unknown
  sequence_order?: unknown
  part?: unknown
  questionText?: unknown
  question_text?: unknown
  options?: unknown
}

type SessionQuestionsDto = {
  sessionId?: unknown
  id?: unknown
  status?: unknown
  questions?: unknown
}

type AssessmentPathDto = {
  id?: unknown
  pathType?: unknown
}

type JdDto = {
  assessmentPath?: unknown
}

function parseReusable(res: unknown): ReusableSession[] {
  const rows = ((res as ResponseWithData<unknown>)?.data ?? []) as unknown
  if (!Array.isArray(rows)) return []

  return rows
    .map((r) => r as ReusableSessionDto)
    .map((r) => ({
      sessionId: String(r.sessionId ?? ''),
      scorePercent: Number(r.scorePercent ?? 0),
      fromJdTitle: typeof r.fromJdTitle === 'string' ? r.fromJdTitle : null,
    }))
    .filter((r) => Boolean(r.sessionId))
}

function parseQuestions(res: unknown): SessionQuestions {
  const data = ((res as ResponseWithData<SessionQuestionsDto>)?.data ?? {}) as SessionQuestionsDto

  const sessionId = String(data.sessionId ?? data.id ?? '')
  const status = (String(data.status ?? 'in_progress') as SessionStatus) || 'in_progress'

  const questionsRaw = Array.isArray(data.questions) ? (data.questions as QuestionDto[]) : []

  const questions: Question[] = questionsRaw
    .map((q) => {
      const optionsRaw = (q.options ?? {}) as Record<string, unknown>
      const normalizedOptions =
        optionsRaw && typeof optionsRaw === 'object' && !Array.isArray(optionsRaw)
          ? optionsRaw
          : {}

      return {
        id: String(q.id ?? ''),
        sequenceOrder: Number(q.sequenceOrder ?? q.sequence_order ?? 0),
        part: Number(q.part ?? 1),
        questionText: String(q.questionText ?? q.question_text ?? ''),
        options: {
          A: String(normalizedOptions.A ?? normalizedOptions.a ?? ''),
          B: String(normalizedOptions.B ?? normalizedOptions.b ?? ''),
          C: String(normalizedOptions.C ?? normalizedOptions.c ?? ''),
          D: String(normalizedOptions.D ?? normalizedOptions.d ?? ''),
        },
      }
    })
    .filter((q) => Boolean(q.id))

  return { sessionId, status, questions }
}

function extractSessionIdFromStartResponse(res: unknown): string {
  const response = (res ?? {}) as {
    data?: Record<string, unknown> | null
    headers?: Headers | null
  }

  const data = response.data ?? {}
  const fromBody = String(
    (data as Record<string, unknown>)?.sessionId ??
      (data as Record<string, unknown>)?.id ??
      (data as Record<string, unknown>)?.assessmentSessionId ??
      ''
  )

  if (fromBody) return fromBody

  const location = response.headers?.get('Location') ?? response.headers?.get('location') ?? ''
  if (!location) return ''

  const match = location.match(/assessment-sessions\/([^/?#]+)/i)
  return match?.[1] ? decodeURIComponent(match[1]) : ''
}

function badgeFor(
  t: (key: string, options?: Record<string, unknown>) => string,
  status: SessionStatus
): { variant: Parameters<typeof Badge>[0]['variant']; label: string } {
  switch (status) {
    case 'submitted':
      return { variant: 'success', label: t('assessment.page.status.submitted') }
    case 'expired':
      return { variant: 'destructive', label: t('assessment.page.status.expired') }
    default:
      return { variant: 'warning', label: t('assessment.page.status.inProgress') }
  }
}

function parseAssessmentPathId(res: unknown): string {
  const dto = ((res as ResponseWithData<JdDto>)?.data ?? {}) as JdDto

  const pathFromObj = (dto.assessmentPath ?? {}) as AssessmentPathDto
  return String(pathFromObj.id ?? '')
}

export function AssessmentPage() {
  const session = getAuthSession()
  const { t } = useTranslation('assessment')
  const navigate = useNavigate()
  const toast = useToast()

  const { jdId: jdIdParam } = useParams()
  const jdId = jdIdParam ?? ''
  const [searchParams] = useSearchParams()

  const pathIdFromQuery = searchParams.get('pathId') ?? ''
  const [pathId, setPathId] = useState<string>(pathIdFromQuery)

  const [starting, setStarting] = useState(false)
  const [pollingQuestions, setPollingQuestions] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [reusable, setReusable] = useState<ReusableSession[]>([])
  const [reuseSessionId, setReuseSessionId] = useState<string | null>(null)

  const [sessionId, setSessionId] = useState<string>('')
  const [data, setData] = useState<SessionQuestions | null>(null)
  const [showQuestionsUI, setShowQuestionsUI] = useState(false)
  const [answers, setAnswers] = useState<Record<string, 'A' | 'B' | 'C' | 'D'>>({})

  const [initialLoading, setInitialLoading] = useState(false)
  const [initialError, setInitialError] = useState('')

  const questionsEndRef = useRef<HTMLDivElement>(null)
  const total = data?.questions?.length ?? 0
  const answered = useMemo(() => {
    const questions = data?.questions
    if (!questions?.length) return 0
    return questions.reduce<number>((acc, q) => acc + (answers[q.id] ? 1 : 0), 0)
  }, [answers, data?.questions])

  const badge = useMemo(() => badgeFor(t, data?.status ?? 'in_progress'), [t, data?.status])

  function scrollToQuestions() {
    questionsEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  useEffect(() => {
    if (!jdId) return
    if (pathIdFromQuery) return

    let cancelled = false

    getJdSubmissionsId({ id: jdId })
      .then((res) => {
        if (cancelled) return
        const inferredPathId = parseAssessmentPathId(res)
        if (inferredPathId) setPathId(inferredPathId)
      })
      .catch(() => {
        if (cancelled) return
      })

    return () => {
      cancelled = true
    }
  }, [jdId, pathIdFromQuery])

  useEffect(() => {
    if (!jdId || !pathId) return

    const controller = new AbortController()

    setTimeout(() => {
      setInitialLoading(true)
      setInitialError('')
    }, 0)

    getReusableSessions({ jdId }, { signal: controller.signal })
      .then((res) => setReusable(parseReusable(res)))
      .catch(() => {
        setReusable([])
        setInitialError('')
      })
      .finally(() => setInitialLoading(false))

    return () => controller.abort()
  }, [jdId, pathId])

  if (!session) return <Navigate to='/login' replace />

  async function startSession() {
    if (!pathId || starting || Boolean(data?.questions?.length)) return

    setStarting(true)
    setPollingQuestions(false)
    setError('')

    try {
      const payload: StartAssessmentSessionRequest = reuseSessionId ? { reuseSessionId } : {}
      const res = await postAssessmentPathsPathIdSessions({ pathId }, payload)
      const newSessionId = extractSessionIdFromStartResponse(res)
      if (!newSessionId) throw new Error(t('assessment.page.errors.missingSessionId'))

      setShowQuestionsUI(true)
      setSessionId(newSessionId)
      setPollingQuestions(true)

      for (let i = 0; i < 60; i++) {
        const qRes = await getAssessmentSessionsSessionIdQuestions({ sessionId: newSessionId })
        const parsed = parseQuestions(qRes)
        setData(parsed)
        if (parsed.questions.length > 0) {
          setPollingQuestions(false)
          setTimeout(scrollToQuestions, 100)
          return
        }
        await new Promise((r) => setTimeout(r, 1000))
      }

      throw new Error(t('assessment.page.errors.timeout'))
    } catch (e) {
      setError((e as Error).message || t('assessment.page.errors.startFailed'))
    } finally {
      setStarting(false)
      setPollingQuestions(false)
    }
  }

  function selectAnswer(questionId: string, opt: 'A' | 'B' | 'C' | 'D') {
    setAnswers((prev) => ({ ...prev, [questionId]: opt }))
  }

  async function submit() {
    if (!sessionId || !data || submitting) return

    const questions = data.questions
    if (questions.some((q) => !answers[q.id])) {
      setError(t('assessment.page.errors.missingAnswers'))
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const payload: SubmitAssessmentSessionRequest = {
        answers: questions.map((q) => ({ questionId: q.id, selectedOption: answers[q.id] })),
      }

      const res = await postAssessmentSessionsSessionIdSubmit({ sessionId }, payload)
      const autoTriggered = parseAutoTriggered((res as { data?: { autoTriggered?: unknown } })?.data?.autoTriggered)
      if (autoTriggered) {
        toast.success(t('assessment.page.autoTriggeredMessage'), t('assessment.page.autoTriggeredTitle'))
      }

      navigate(
        `/dashboard/jd/${encodeURIComponent(jdId)}/assessment/results?sessionId=${encodeURIComponent(sessionId)}&pathId=${encodeURIComponent(pathId)}`
      )
    } catch (e) {
      setError((e as Error).message || t('assessment.page.errors.submitFailed'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className='relative w-full max-w-6xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />
      <div className='absolute bottom-0 left-0 -z-10 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px] pointer-events-none opacity-40' />

      <div className='text-center mb-12'>
        <span className='inline-block px-4 py-1.5 mb-4 text-xs font-semibold tracking-widest uppercase bg-primary/10 text-primary rounded-full border border-primary/30 shadow-sm'>
          {t('assessment.page.badge')}
        </span>
        <h1 className='text-4xl md:text-5xl font-bold text-foreground mb-3'>{t('assessment.page.title')}</h1>
        <p className='text-muted-foreground max-w-2xl mx-auto text-lg'>{t('assessment.page.jdLabel', { jdId })}</p>
        {data ? (
          <div className='mt-4 flex items-center justify-center gap-2'>
            <Badge variant={badge.variant}>{badge.label}</Badge>
          </div>
        ) : null}
      </div>

      {!pathId ? (
        <div className='mb-6 max-w-4xl mx-auto p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {t('assessment.page.errors.missingPathId')}
        </div>
      ) : null}

      {initialError ? (
        <div className='mb-6 max-w-4xl mx-auto p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {initialError}
        </div>
      ) : null}

      {error ? (
        <div className='mb-6 max-w-4xl mx-auto p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      ) : null}

      <div className='grid grid-cols-1 gap-8'>
        <div className='bg-card p-8 rounded-2xl shadow-sm border border-border hover:border-primary/40 transition-colors max-w-4xl mx-auto w-full'>
          <div className='flex items-center gap-3 mb-6'>
            <div className='w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary border border-primary/20 shrink-0'>
              <span className='material-symbols-outlined'>history</span>
            </div>
            <div>
              <h2 className='text-xl font-semibold text-foreground'>{t('assessment.page.reuseTitle')}</h2>
              <p className='text-sm text-muted-foreground'>{t('assessment.page.reuseDesc')}</p>
              <p className='mt-2 text-xs text-muted-foreground'>{t('assessment.page.reuseActionHint')}</p>
            </div>
          </div>

          {initialLoading ? (
            <p className='text-sm text-muted-foreground'>{t('assessment.page.loading')}</p>
          ) : reusable.length === 0 ? (
            <p className='text-sm text-muted-foreground'>{t('assessment.page.noReusable')}</p>
          ) : (
            <div className='space-y-2'>
              <button
                type='button'
                onClick={() => setReuseSessionId(null)}
                className={cn(
                  'w-full text-left p-4 rounded-xl border transition-all',
                  reuseSessionId === null ? 'border-primary bg-primary/10' : 'border-border bg-muted/20 hover:border-primary/40'
                )}
              >
                <p className='text-sm font-semibold text-foreground'>{t('assessment.page.noReuse')}</p>
                <p className='text-xs text-muted-foreground'>{t('assessment.page.noReuseDesc')}</p>
              </button>

              {reusable.map((s) => (
                <button
                  key={s.sessionId}
                  type='button'
                  onClick={() => setReuseSessionId(s.sessionId)}
                  className={cn(
                    'w-full text-left p-4 rounded-xl border transition-all',
                    reuseSessionId === s.sessionId ? 'border-primary bg-primary/10' : 'border-border bg-muted/20 hover:border-primary/40'
                  )}
                >
                  <div className='flex items-center justify-between gap-4'>
                    <p className='text-sm font-semibold text-foreground'>{s.fromJdTitle || t('assessment.page.noReuse')}</p>
                    <Badge variant='outline'>{Math.round(s.scorePercent)}%</Badge>
                  </div>
                  <p className='text-xs text-muted-foreground mt-1'>{t('assessment.page.sessionLabel', { sessionId: s.sessionId })}</p>
                </button>
              ))}
            </div>
          )}

          <button
            type='button'
            onClick={startSession}
            disabled={!pathId || starting || pollingQuestions || Boolean(data?.questions?.length)}
            className={cn(
              'w-full mt-6 py-3 text-sm font-bold rounded-lg shadow-md transition-all disabled:opacity-50 disabled:pointer-events-none',
              data?.questions?.length
                ? 'bg-muted text-muted-foreground border border-border shadow-none'
                : 'bg-primary text-primary-foreground shadow-primary/20 hover:opacity-90'
            )}
          >
            {data?.questions?.length
              ? t('assessment.page.started')
              : starting
                ? t('assessment.page.starting')
                : pollingQuestions
                  ? t('assessment.page.pollingQuestions')
                  : reuseSessionId
                    ? t('assessment.page.reuseSessionCta')
                    : t('assessment.page.newSessionCta')}
          </button>
        </div>

        {showQuestionsUI ? (
          <div className='bg-card p-8 rounded-2xl shadow-sm border border-border hover:border-primary/40 transition-colors'>
            <div className='sticky top-[5.5rem] z-20 -mx-3 mb-6 rounded-2xl border border-border bg-background/95 px-3 py-3 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-background/85 sm:-mx-4 sm:px-4'>
              <div className='flex flex-col gap-4'>
                <div className='flex flex-col gap-4 rounded-2xl border border-border bg-muted/10 p-5 md:flex-row md:items-start md:justify-between'>
                  <div className='flex items-start gap-4'>
                    <div className='flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary'>
                      <span className='material-icons text-lg'>quiz</span>
                    </div>
                    <div>
                      <p className='text-sm font-semibold text-foreground'>{t('assessment.page.questionsTitle')}</p>
                      <p className='mt-1 text-sm text-muted-foreground'>{t('assessment.page.questionsDesc')}</p>
                      <p className='mt-2 text-xs text-muted-foreground'>
                        {data?.questions?.length
                          ? t('assessment.page.questionReady')
                          : pollingQuestions
                            ? t('assessment.page.pollingQuestions')
                            : t('assessment.page.instructionsStart')}
                      </p>
                    </div>
                  </div>

                  <div className='flex items-center gap-2'>
                    {data ? <Badge variant={badge.variant}>{badge.label}</Badge> : null}
                  </div>
                </div>

                <div className='rounded-2xl border border-border bg-card/95 p-4'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between'>
                    <div>
                      <p className='text-xs font-semibold uppercase tracking-widest text-muted-foreground'>{t('assessment.page.progressHint')}</p>
                      <p className='mt-1 text-base font-semibold text-foreground'>{t('assessment.page.progress', { answered, total })}</p>
                      <p className='mt-1 text-sm text-muted-foreground'>
                        {data?.questions?.length ? t('assessment.page.instructions') : t('assessment.page.questionsHint')}
                      </p>
                    </div>
                    <div className='w-full sm:max-w-[240px]'>
                      <div className='mb-2 flex items-center justify-between text-xs text-muted-foreground'>
                        <span>{Math.round(total > 0 ? (answered / total) * 100 : 0)}%</span>
                        <span>
                          {answered}/{total}
                        </span>
                      </div>
                      <div className='h-2 w-full overflow-hidden rounded-full bg-muted'>
                        <div
                          className='h-full rounded-full bg-primary transition-all'
                          style={{ width: `${total > 0 ? (answered / total) * 100 : 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {!data?.questions?.length ? (
              <div className='rounded-xl border border-border bg-muted/20 p-6'>
                <p className='text-sm text-muted-foreground'>
                  {pollingQuestions ? t('assessment.page.pollingQuestions') : t('assessment.page.noQuestionsYet')}
                </p>
              </div>
            ) : (
              <div className='space-y-6' ref={questionsEndRef}>
                {data.questions
                  .slice()
                  .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                  .map((q) => {
                    const selected = answers[q.id]
                    return (
                      <div key={q.id} className='rounded-2xl border border-border bg-background p-5 shadow-sm'>
                        <div className='flex items-start justify-between gap-4'>
                          <div>
                            <div className='text-xs text-muted-foreground'>
                              {t('assessment.page.questionMeta', { no: q.sequenceOrder || 0, part: q.part || 1 })}
                            </div>
                            <h3 className='mt-1 text-base font-semibold text-foreground whitespace-pre-wrap'>{q.questionText}</h3>
                          </div>
                          <div className='shrink-0'>
                            {selected ? <Badge variant='outline'>{selected}</Badge> : <Badge variant='info'>?</Badge>}
                          </div>
                        </div>

                        <div className='mt-5 rounded-2xl border border-border bg-muted/10 p-4'>
                          <div className='mb-3 flex items-center gap-2'>
                            <span className='material-icons text-base text-primary'>radio_button_checked</span>
                            <p className='text-sm font-semibold text-foreground'>{t('assessment.page.answerChoices')}</p>
                          </div>
                          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                            {(['A', 'B', 'C', 'D'] as const).map((opt) => {
                              const isSelected = selected === opt
                              const label = (q.options?.[opt] ?? '').trim() || t('assessment.page.emptyOption')
                              return (
                                <button
                                  key={opt}
                                  type='button'
                                  onClick={() => selectAnswer(q.id, opt)}
                                  className={cn(
                                    'w-full rounded-2xl border p-4 text-left transition-all focus:outline-none focus:ring-2 focus:ring-primary/30',
                                    isSelected
                                      ? 'border-primary bg-primary/10 shadow-sm'
                                      : 'border-border bg-card hover:border-primary/40 hover:bg-muted/20'
                                  )}
                                >
                                  <div className='flex items-start gap-3'>
                                    <span
                                      className={cn(
                                        'mt-0.5 inline-flex h-8 w-8 items-center justify-center rounded-xl border text-xs font-bold',
                                        isSelected
                                          ? 'border-primary bg-primary text-primary-foreground'
                                          : 'border-border bg-background text-foreground'
                                      )}
                                    >
                                      {opt}
                                    </span>
                                    <span className='flex-1 text-sm leading-6 text-foreground whitespace-pre-wrap'>{label}</span>
                                  </div>
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  })}

                <div className='pt-2 flex flex-col gap-3'>
                  {answered !== total ? (
                    <p className='text-xs text-muted-foreground text-center'>{t('assessment.page.answerAllHint')}</p>
                  ) : null}

                  <button
                    type='button'
                    onClick={submit}
                    disabled={!data?.questions?.length || answered !== total || submitting}
                    className={cn(
                      'w-full py-3 text-sm font-bold rounded-lg transition-all',
                      answered !== total || submitting
                        ? 'bg-muted text-muted-foreground border border-border opacity-60 pointer-events-none'
                        : 'bg-primary text-primary-foreground hover:opacity-90'
                    )}
                  >
                    {submitting ? t('assessment.page.submitting') : t('assessment.page.submit')}
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {data?.questions?.length ? (
        <div className='flex justify-center'>
          <button
            type='button'
            onClick={scrollToQuestions}
            className='inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-muted-foreground text-sm font-medium hover:text-foreground hover:bg-muted/20 transition-colors shadow-sm'
          >
            <span className='material-icons text-lg'>keyboard_arrow_up</span>
            {t('assessment.page.backToTop')}
          </button>
        </div>
      ) : null}
    </div>
  )
}
