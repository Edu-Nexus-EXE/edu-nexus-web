import { Link, Navigate, useParams, useSearchParams } from 'react-router'
import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { getAssessmentSessionsSessionIdQuestions } from '~/api/operations/assessment-sessions/assessment-sessions'
import { getAssessmentSessionResult, parseAutoTriggered, type AutoTriggered } from '~/shared/lib/assessment-api'
import { formatOptionLabel, readOptionsForSession, type CachedOptions } from '~/shared/lib/assessment-options-cache'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'
import { Badge } from '~/shared/ui/badge'

type ResponseWithData<T> = { data?: T }

type ResultDto = {
  sessionId?: unknown
  status?: unknown
  scorePercent?: unknown
  score_percent?: unknown
  correctCount?: unknown
  correct_count?: unknown
  totalCount?: unknown
  total_count?: unknown
  totalQuestions?: unknown
  total_questions?: unknown
  skillScores?: unknown
  skill_scores?: unknown
  results?: unknown
  autoTriggered?: unknown
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
  question_id?: unknown
  questionText?: unknown
  question_text?: unknown
  selectedOption?: unknown
  selected_option?: unknown
  userAnswer?: unknown
  user_answer?: unknown
  correctOption?: unknown
  correct_option?: unknown
  answer?: unknown
  isCorrect?: unknown
  is_correct?: unknown
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
  sequenceOrder?: number
}

type Result = {
  sessionId: string
  status: string
  scorePercent: number
  correctCount: number
  totalCount: number
  skillScores: SkillScore[]
  results: QuestionReview[]
  autoTriggered: AutoTriggered | null
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
          : typeof s.scorePercent === 'number'
            ? s.scorePercent
            : undefined

      return {
        skillName: String(s.skillName ?? ''),
        scorePercent,
        correctCount: score,
        totalCount: maxScore
      }
    })
    .filter((s) => Boolean(s.skillName))
}

function parseQuestionReviews(input: unknown): QuestionReview[] {
  if (!Array.isArray(input)) return []
  return (input as QuestionResultDto[])
    .map((r) => ({
      questionId: String(r.questionId ?? r.question_id ?? ''),
      questionText:
        typeof r.questionText === 'string'
          ? r.questionText
          : typeof r.question_text === 'string'
            ? r.question_text
            : undefined,
      selectedOption:
        typeof r.selectedOption === 'string'
          ? r.selectedOption
          : typeof r.selected_option === 'string'
            ? r.selected_option
            : typeof r.userAnswer === 'string'
              ? r.userAnswer
              : typeof r.user_answer === 'string'
                ? r.user_answer
                : undefined,
      correctOption:
        typeof r.correctOption === 'string'
          ? r.correctOption
          : typeof r.correct_option === 'string'
            ? r.correct_option
            : typeof r.answer === 'string'
              ? r.answer
              : undefined,
      isCorrect:
        typeof r.isCorrect === 'boolean' ? r.isCorrect : typeof r.is_correct === 'boolean' ? r.is_correct : undefined,
      explanation: typeof r.explanation === 'string' ? r.explanation : undefined,
      sequenceOrder: undefined
    }))
    .filter((r) => Boolean(r.questionId))
}

type SessionQuestionDto = {
  id?: unknown
  sequenceOrder?: unknown
  sequence_order?: unknown
  questionText?: unknown
  question_text?: unknown
}

type SessionQuestionsDto = {
  questions?: unknown
}

function parseSessionQuestions(
  res: unknown
): Array<{ questionId: string; questionText?: string; sequenceOrder: number }> {
  const dto = ((res as ResponseWithData<SessionQuestionsDto>)?.data ?? {}) as SessionQuestionsDto
  const rows = Array.isArray(dto.questions) ? (dto.questions as SessionQuestionDto[]) : []

  return rows
    .map((row) => ({
      questionId: String(row.id ?? ''),
      questionText:
        typeof row.questionText === 'string'
          ? row.questionText
          : typeof row.question_text === 'string'
            ? row.question_text
            : undefined,
      sequenceOrder: Number(row.sequenceOrder ?? row.sequence_order ?? 0)
    }))
    .filter((row) => Boolean(row.questionId))
}

function parseResult(res: unknown): Result {
  const dto = ((res as ResponseWithData<ResultDto>)?.data ?? {}) as ResultDto
  const parsedResults = parseQuestionReviews(dto.results)
  const totalCount = Number(dto.totalCount ?? dto.total_count ?? dto.totalQuestions ?? dto.total_questions ?? 0)
  const correctCount = Number(dto.correctCount ?? dto.correct_count ?? 0)
  const rawScorePercent = Number(dto.scorePercent ?? dto.score_percent ?? Number.NaN)
  const derivedScorePercent =
    totalCount > 0
      ? (correctCount / totalCount) * 100
      : parsedResults.length > 0
        ? (parsedResults.filter((item) => item.isCorrect === true).length / parsedResults.length) * 100
        : 0

  return {
    sessionId: String(dto.sessionId ?? ''),
    status: String(dto.status ?? ''),
    scorePercent: Number.isFinite(rawScorePercent) && rawScorePercent > 0 ? rawScorePercent : derivedScorePercent,
    correctCount,
    totalCount,
    skillScores: parseSkillScores(dto.skillScores ?? dto.skill_scores),
    results: parsedResults,
    autoTriggered: parseAutoTriggered(dto.autoTriggered)
  }
}

function renderOption(key: string | undefined, questionId: string, optionsByQuestion: CachedOptions | null): string {
  if (!key) return '—'
  if (!optionsByQuestion) return key
  const text = optionsByQuestion[questionId]?.[key as 'A' | 'B' | 'C' | 'D']
  return formatOptionLabel(key, text)
}

export function AssessmentResultsPage() {
  const session = getAuthSession()
  const { t } = useTranslation('assessment')
  const { jdId } = useParams()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('sessionId') ?? ''
  const pathId = searchParams.get('pathId') ?? ''

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })

  const [loading, setLoading] = useState(Boolean(sessionId))
  const [error, setError] = useState('')
  const [result, setResult] = useState<Result | null>(null)
  const [optionsForSession, setOptionsForSession] = useState<CachedOptions | null>(null)

  useEffect(() => {
    if (!sessionId) {
      return
    }

    let cancelled = false

    getAssessmentSessionResult({ sessionId })
      .then(async (res) => {
        if (cancelled) return

        const parsedResult = parseResult(res)

        if (parsedResult.results.length > 0 && parsedResult.results.some((item) => !item.questionText)) {
          try {
            const questionsRes = await getAssessmentSessionsSessionIdQuestions({ sessionId })
            if (cancelled) return

            const questionList = parseSessionQuestions(questionsRes)
            const questionMap = new Map(questionList.map((item) => [item.questionId, item] as const))

            parsedResult.results = parsedResult.results.map((item) => {
              const matched = questionMap.get(item.questionId)
              return matched
                ? {
                    ...item,
                    questionText: item.questionText || matched.questionText,
                    sequenceOrder: matched.sequenceOrder
                  }
                : item
            })
          } catch {
            // Keep result payload as-is if supplementary question lookup fails.
          }
        }

        setResult(parsedResult)
        setError('')

        // Load options cache để render selected/correct option với text đầy đủ.
        // Nếu cache miss (vd user mở trực tiếp tab results) thì fetch lại questions
        // và build cache ngay, tránh hiển thị mỗi "A" không có nghĩa.
        const cached = readOptionsForSession(sessionId)
        if (cached) {
          setOptionsForSession(cached)
        } else {
          try {
            const questionsRes = await getAssessmentSessionsSessionIdQuestions({ sessionId })
            if (cancelled) return
            const dto = ((questionsRes as ResponseWithData<SessionQuestionsDto>)?.data ?? {}) as SessionQuestionsDto
            const rows = Array.isArray(dto.questions) ? (dto.questions as Array<Record<string, unknown>>) : []
            const map: CachedOptions = {}
            for (const row of rows) {
              const qid = String(row.id ?? '')
              if (!qid) continue
              const rawOptions =
                row.options && typeof row.options === 'object' && !Array.isArray(row.options)
                  ? (row.options as Record<string, unknown>)
                  : {}
              map[qid] = {
                A: typeof rawOptions.A === 'string' ? rawOptions.A : '',
                B: typeof rawOptions.B === 'string' ? rawOptions.B : '',
                C: typeof rawOptions.C === 'string' ? rawOptions.C : '',
                D: typeof rawOptions.D === 'string' ? rawOptions.D : ''
              }
            }
            setOptionsForSession(map)
          } catch {
            setOptionsForSession(null)
          }
        }
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
    if (typeof result?.scorePercent === 'number' && result.scorePercent >= 0) return result.scorePercent
    if (!result?.results?.length) return 0
    const correct = result.results.filter((r) => r.isCorrect === true).length
    return (correct / result.results.length) * 100
  }, [result])

  const statusLabel = useMemo(() => {
    switch (result?.status) {
      case 'submitted':
        return t('assessment.results.statusSubmitted')
      case 'in_progress':
        return t('assessment.results.statusInProgress')
      case 'expired':
        return t('assessment.results.statusExpired')
      default:
        return result?.status || '—'
    }
  }, [result?.status, t])

  const badge = useMemo(() => {
    const percent = computedScore
    if (percent >= 80) return { variant: 'success' as const, label: t('assessment.results.badges.excellent') }
    if (percent >= 60) return { variant: 'warning' as const, label: t('assessment.results.badges.good') }
    return { variant: 'destructive' as const, label: t('assessment.results.badges.tryAgain') }
  }, [computedScore, t])

  if (!session) return <Navigate to='/login' replace />

  return (
    <div className='relative w-full max-w-5xl mx-auto px-4 py-12'>
      <div className='absolute top-0 right-0 -z-10 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none opacity-40' />

      <div className='mb-8 flex items-center justify-between gap-4'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-muted-foreground'>
            {t('assessment.results.badge')}
          </p>
          <h1 className='text-3xl md:text-4xl font-bold text-foreground'>{t('assessment.results.title')}</h1>
          <p className='text-sm text-muted-foreground mt-1'>{t('assessment.results.sessionLabel', { sessionId })}</p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </div>

      {error ? (
        <div className='mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm'>
          {error}
        </div>
      ) : null}

      {result?.autoTriggered ? (
        <div className='mb-6 flex flex-col gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <p className='font-semibold text-foreground'>{t('assessment.results.autoTriggered.title')}</p>
            <p className='text-muted-foreground'>{t('assessment.results.autoTriggered.message')}</p>
          </div>
          <Link
            to={
              jdId
                ? `/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(jdId)}`
                : '/dashboard/analytics/gap-analysis'
            }
            className='inline-flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-card px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors shrink-0'
          >
            {t('assessment.results.autoTriggered.link')}
            <span className='material-symbols-outlined text-base'>arrow_forward</span>
          </Link>
        </div>
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
                  <p className='text-2xl font-bold text-foreground mt-1'>{Math.round(computedScore)}%</p>
                </div>
                <div className='rounded-xl border border-border bg-muted/10 p-4'>
                  <p className='text-xs text-muted-foreground'>{t('assessment.results.correct')}</p>
                  <p className='text-2xl font-bold text-foreground mt-1'>
                    {result.correctCount}/{result.totalCount}
                  </p>
                </div>
                <div className='rounded-xl border border-border bg-muted/10 p-4'>
                  <p className='text-xs text-muted-foreground'>{t('assessment.results.status')}</p>
                  <p className='text-base font-semibold text-foreground mt-2'>{statusLabel}</p>
                </div>
              </div>
            )}
          </div>

          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-4'>{t('assessment.results.skillBreakdown')}</h2>

            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.loading')}</p>
            ) : !result ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noData')}</p>
            ) : result.skillScores.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noSkillScores')}</p>
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
                        {typeof s.scorePercent === 'number' ? (
                          <Badge variant='outline'>{Math.round(s.scorePercent)}%</Badge>
                        ) : null}
                      </div>

                      {typeof s.scorePercent === 'number' ? (
                        <div className='mt-3 h-2 w-full rounded-full bg-muted overflow-hidden'>
                          <div
                            className='h-full bg-primary'
                            style={{ width: `${Math.min(100, Math.max(0, s.scorePercent))}%` }}
                          />
                        </div>
                      ) : null}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground mb-2'>{t('assessment.results.review')}</h2>
            <p className='mb-4 text-sm text-muted-foreground'>{t('assessment.results.reviewHint')}</p>

            {loading ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.loading')}</p>
            ) : !result ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noData')}</p>
            ) : result.results.length === 0 ? (
              <p className='text-sm text-muted-foreground'>{t('assessment.results.noReview')}</p>
            ) : (
              <div className='space-y-3'>
                {result.results
                  .slice()
                  .sort(
                    (a, b) =>
                      (a.sequenceOrder ?? Number.MAX_SAFE_INTEGER) - (b.sequenceOrder ?? Number.MAX_SAFE_INTEGER)
                  )
                  .map((r, idx) => {
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
                            <p className='font-semibold text-foreground mt-1 whitespace-pre-wrap'>
                              {renderOption(r.selectedOption, r.questionId, optionsForSession)}
                            </p>
                          </div>
                          <div className='rounded-lg border border-border bg-muted/10 p-3'>
                            <p className='text-xs text-muted-foreground'>{t('assessment.results.correctOption')}</p>
                            <p className='font-semibold text-foreground mt-1 whitespace-pre-wrap'>
                              {renderOption(r.correctOption, r.questionId, optionsForSession)}
                            </p>
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

        <aside className='space-y-6 md:sticky md:top-[5.5rem] md:self-start'>
          <div className='bg-card border border-border rounded-2xl p-6 shadow-sm'>
            <h2 className='text-lg font-semibold text-foreground'>{t('assessment.results.nextActions')}</h2>
            <div className='mt-4 space-y-3 text-sm'>
              <button
                type='button'
                onClick={scrollToTop}
                className='flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/30 transition-colors'
              >
                <span>{t('assessment.results.backToTop')}</span>
                <span className='material-symbols-outlined text-base'>arrow_upward</span>
              </button>
              <Link
                to={
                  jdId
                    ? `/dashboard/analytics/gap-analysis?jdId=${encodeURIComponent(jdId)}`
                    : '/dashboard/analytics/gap-analysis'
                }
                className='flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/30 transition-colors'
              >
                <span>{t('assessment.results.viewRoadmap')}</span>
                <span className='material-symbols-outlined text-base'>arrow_forward</span>
              </Link>
              <Link
                to={
                  jdId
                    ? `/dashboard/jd/${encodeURIComponent(jdId)}/assessment${pathId ? `?pathId=${encodeURIComponent(pathId)}` : ''}`
                    : '/dashboard/analytics/analysis-history'
                }
                className={cn(
                  'flex items-center justify-between rounded-xl border border-border px-4 py-3 hover:bg-muted/30 transition-colors',
                  !jdId && 'pointer-events-none opacity-50'
                )}
              >
                <span>{t('assessment.results.retake')}</span>
                <span className='material-symbols-outlined text-base'>replay</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
