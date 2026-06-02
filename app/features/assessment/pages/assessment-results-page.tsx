import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAssessmentSessionsSessionId } from '~/api/operations/assessment-sessions/assessment-sessions'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

type ResponseWithData<T> = { data?: T }

type ResultDto = {
  sessionId?: unknown
  status?: unknown
  scorePercent?: unknown
  correctCount?: unknown
  totalCount?: unknown
  skillScores?: unknown
  results?: unknown
}

type SkillScoreDto = {
  skillName?: unknown
  score?: unknown
  maxScore?: unknown
  scorePercent?: unknown
  correctCount?: unknown
  totalCount?: unknown
  proficiencyLevel?: unknown
}

type QuestionResultDto = {
  questionId?: unknown
  questionText?: unknown
  selectedOption?: unknown
  correctOption?: unknown
  isCorrect?: unknown
  explanation?: unknown
}

type SkillScore = {
  skillName: string
  scorePercent?: number
  correctCount?: number
  totalCount?: number
}

type QuestionReview = {
  questionId: string
  questionText?: string
  selectedOption?: string
  correctOption?: string
  isCorrect?: boolean
  explanation?: string
}

type Result = {
  sessionId: string
  status: string
  scorePercent: number
  correctCount: number
  totalCount: number
  skillScores: SkillScore[]
  results: QuestionReview[]
}

function parseSkillScores(input: unknown): SkillScore[] {
  if (!Array.isArray(input)) return []
  return (input as SkillScoreDto[])
    .map((s) => {
      const score = typeof s.score === 'number' ? s.score : undefined
      const maxScore = typeof s.maxScore === 'number' ? s.maxScore : undefined
      const scorePercent =
        score !== undefined && maxScore !== undefined && maxScore > 0
          ? (score / maxScore) * 100
          : typeof s.scorePercent === 'number' ? s.scorePercent : undefined

      return {
        skillName: String(s.skillName ?? ''),
        scorePercent,
        correctCount: score,
        totalCount: maxScore,
      }
    })
    .filter((s) => Boolean(s.skillName))
}

function parseQuestionReviews(input: unknown): QuestionReview[] {
  if (!Array.isArray(input)) return []
  return (input as QuestionResultDto[])
    .map((r) => ({
      questionId: String(r.questionId ?? ''),
      questionText: typeof r.questionText === 'string' ? r.questionText : undefined,
      selectedOption: typeof r.selectedOption === 'string' ? r.selectedOption : undefined,
      correctOption: typeof r.correctOption === 'string' ? r.correctOption : undefined,
      isCorrect: typeof r.isCorrect === 'boolean' ? r.isCorrect : undefined,
      explanation: typeof r.explanation === 'string' ? r.explanation : undefined,
    }))
    .filter((r) => Boolean(r.questionId))
}

function parseResult(res: unknown): Result {
  const dto = ((res as ResponseWithData<ResultDto>)?.data ?? {}) as ResultDto
  return {
    sessionId: String(dto.sessionId ?? ''),
    status: String(dto.status ?? ''),
    scorePercent: Number(dto.scorePercent ?? 0),
    correctCount: Number(dto.correctCount ?? 0),
    totalCount:
      Number(dto.totalCount ?? 0) || Number((dto as Record<string, unknown>).totalQuestions ?? 0),
    skillScores: parseSkillScores(dto.skillScores),
    results: parseQuestionReviews(dto.results),
  }
}

export function AssessmentResultsPage() {
  const session = getAuthSession()
  const { t } = useTranslation('assessment')

  const { jdId } = useParams()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') ?? ''
  const pathId = searchParams.get('pathId') ?? ''

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)

  useEffect(() => {
    if (!sessionId) return

    let cancelled = false
    setTimeout(() => {
      if (!cancelled) {
        setLoading(true)
        setError('')
      }
    }, 0)

    getAssessmentSessionsSessionId({ sessionId })
      .then((res) => {
        if (cancelled) return
        setResult(parseResult(res))
      })
      .catch((e) => {
        if (cancelled) return
        setError((e as Error).message || t('assessment.results.errors.loadFailed'))
      })
      .finally(() => {
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [sessionId, t])

  const computedScore = useMemo(() => {
    if (typeof result?.scorePercent === 'number' && result.scorePercent > 0) return result.scorePercent
    if (!result?.results?.length) return 0
    const correct = result.results.filter((r) => r.isCorrect === true).length
    return (correct / result.results.length) * 100
  }, [result?.results, result?.scorePercent])

  const badge = useMemo(() => {
    const percent = computedScore
    if (percent >= 80) return { variant: 'success' as const, label: t('assessment.results.badges.excellent') }
    if (percent >= 60) return { variant: 'warning' as const, label: t('assessment.results.badges.good') }
    return { variant: 'destructive' as const, label: t('assessment.results.badges.tryAgain') }
  }, [computedScore, t])
  if (!session.user.isSurveyCompleted) return <Navigate to='/onboarding' replace />

  return (
    <div className='relative w-full max-w-5xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />

      <div className='mb-8 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>{t('assessment.results.badge')}</p>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground'>{t('assessment.results.title')}</h1>
          <p className='text-sm text-muted-foreground mt-1'>{t('assessment.results.sessionLabel', { sessionId })}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      {error ? (
        <div className='mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>{error}</div>
      ) : null}

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        <div className='md:col-span-2 space-y-6'>
          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>{t('assessment.results.summary')}</h2>

            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.loading')}</p>
            ) : !result ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noData')}</p>
            ) : (
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                <div className='rounded-xl border border-border bg-muted/10 p-4'>
                  <p className='text-xs text-muted-foreground'>{t('assessment.results.score')}</p>
                  <p className='text-2xl font-bold text-foreground mt-1'>{Math.round(result.scorePercent)}%</p>
                </div>
                <div className='rounded-xl border border-border bg-muted/10 p-4'>
                  <p className='text-xs text-muted-foreground'>{t('assessment.results.correct')}</p>
                  <p className='text-2xl font-bold text-foreground mt-1'>
                    {result.correctCount}/{result.totalCount}
                  </p>
                </div>
                <div className='rounded-xl border border-border bg-muted/10 p-4'>
                  <p className='text-xs text-muted-foreground'>{t('assessment.results.status')}</p>
                  <p className='text-base font-semibold text-foreground mt-2'>{result.status || '—'}</p>
                </div>
              </div>
            )}
          </div>

          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              {t('assessment.results.skillBreakdown')}
            </h2>

            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.loading')}</p>
            ) : !result ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noData')}</p>
            ) : result.skillScores.length === 0 ? (
              <p className='text-sm text-muted-foreground'>
                {t('assessment.results.noSkillScores')}
              </p>
            ) : (
              <div className='space-y-3'>
                {result.skillScores
                  .slice()
                  .sort((a, b) => (b.scorePercent ?? 0) - (a.scorePercent ?? 0))
                  .map((s) => (
                    <div key={s.skillName} className='rounded-xl border border-border bg-muted/10 p-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <div>
                          <p className='text-sm font-semibold text-foreground'>{s.skillName}</p>
                          {typeof s.correctCount === 'number' && typeof s.totalCount === 'number' ? (
                            <p className='text-xs text-muted-foreground mt-1'>
                              {t('assessment.results.correct')}: {s.correctCount}/{s.totalCount}
                            </p>
                          ) : null}
                        </div>
                        {typeof s.scorePercent === 'number' ? <Badge variant='outline'>{Math.round(s.scorePercent)}%</Badge> : null}
                      </div>

                      {typeof s.scorePercent === 'number' ? (
                        <div className='mt-3 h-2 w-full rounded-full bg-muted overflow-hidden'>
                          <div className='h-full bg-primary' style={{ width: `${Math.min(100, Math.max(0, s.scorePercent))}%` }} />
                        </div>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>
              {t('assessment.results.review')}
            </h2>

            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.loading')}</p>
            ) : !result ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noData')}</p>
            ) : result.results.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noReview')}</p>
            ) : (
              <div className='space-y-3'>
                {result.results.map((r, idx) => {
                  const isCorrect = r.isCorrect
                  return (
                    <div key={r.questionId} className='rounded-xl border border-border bg-background p-4'>
                      <div className='flex items-start justify-between gap-4'>
                        <p className='text-sm font-semibold text-foreground whitespace-pre-wrap'>
                          {idx + 1}. {r.questionText ?? '—'}
                        </p>
                        {typeof isCorrect === 'boolean' ? (
                          <Badge variant={isCorrect ? 'success' : 'destructive'}>
                            {isCorrect ? t('assessment.results.correct') : t('assessment.results.wrong')}
                          </Badge>
                        ) : null}
                      </div>

                      <div className='mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm'>
                        <div className='rounded-lg border border-border bg-muted/10 p-3'>
                          <p className='text-xs text-muted-foreground'>{t('assessment.results.selected')}</p>
                          <p className='font-semibold text-foreground mt-1'>{r.selectedOption ?? '—'}</p>
                        </div>
                        <div className='rounded-lg border border-border bg-muted/10 p-3'>
                          <p className='text-xs text-muted-foreground'>{t('assessment.results.correctOption')}</p>
                          <p className='font-semibold text-foreground mt-1'>{r.correctOption ?? '—'}</p>
                        </div>
                      </div>

                      {r.explanation ? (
                        <div className='mt-3 rounded-lg border border-border bg-muted/5 p-3'>
                          <p className='text-xs text-muted-foreground'>{t('assessment.results.explanation')}</p>
                          <p className='text-sm text-foreground mt-1 whitespace-pre-wrap'>{r.explanation}</p>
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
          <h2 className='text-lg font-semibold text-foreground mb-4'>{t('assessment.results.actions')}</h2>

          <div className='space-y-3'>
            <Link
              to={`/dashboard/jd/${encodeURIComponent(jdId ?? '')}`}
              className='w-full inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-semibold text-foreground hover:bg-muted/20 transition-colors'
            >
              <span className='material-icons text-lg'>arrow_back</span>
              {t('assessment.results.backToJd')}
            </Link>

            <Link
              to={`/dashboard/jd/${encodeURIComponent(jdId ?? '')}/assessment?pathId=${encodeURIComponent(pathId)}`}
              className={cn(
                'w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-bold transition-colors',
                !pathId ? 'pointer-events-none opacity-50 bg-muted text-muted-foreground border border-border' : 'bg-primary text-primary-foreground hover:opacity-90'
              )}
            >
              <span className='material-icons text-lg'>refresh</span>
              {t('assessment.results.retake')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
