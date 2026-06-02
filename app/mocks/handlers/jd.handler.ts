import { http, HttpResponse } from 'msw'

// NOTE: these are dev mocks only.
// They are intentionally kept small + stateful so polling UIs work.

type ParseStatus = 'pending' | 'processing' | 'completed' | 'failed'

type Jd = {
  id: string
  parseStatus: ParseStatus
  sourceType: 'url' | 'text'
  sourceUrl: string | null
  rawContent: string | null
  jobTitle: string
  jobRoleCategory: string
  seniorityLevel: string
  hardSkills: { id: string; skillNameRaw: string; isMandatory: boolean }[]
  softSkills: { id: string; skillNameRaw: string; isMandatory: boolean }[]
  assessmentPath: { id: string; pathType: 'cv' | 'assessment' } | null
  __pollCount: number
}

type Cv = {
  id: string
  pathId: string
  status: 'not_uploaded' | 'uploaded' | 'processing' | 'completed' | 'failed'
  fileName: string | null
  __pollCount: number
}

type Session = {
  sessionId: string
  pathId: string
  status: 'in_progress' | 'submitted' | 'expired'
  questionsReadyAfter: number
  __pollCount: number
  questions: {
    id: string
    sequenceOrder: number
    part: number
    questionText: string
    options: { A: string; B: string; C: string; D: string }
  }[]
  submittedAnswers: { questionId: string; selectedOption: 'A' | 'B' | 'C' | 'D' }[]
}

const db = {
  jd: new Map<string, Jd>(),
  pathToJd: new Map<string, string>(),
  cv: new Map<string, Cv>(),
  session: new Map<string, Session>(),
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

function ok(data: unknown, init?: { status?: number }) {
  return HttpResponse.json({ data }, { status: init?.status ?? 200 })
}

function seedJd(partial?: Partial<Jd>): Jd {
  const jdId = partial?.id ?? id('jd')
  const jobRoleCategory = partial?.jobRoleCategory ?? 'backend_java'
  return {
    id: jdId,
    parseStatus: partial?.parseStatus ?? 'processing',
    sourceType: partial?.sourceType ?? 'text',
    sourceUrl: partial?.sourceUrl ?? null,
    rawContent: partial?.rawContent ?? 'Sample JD',
    jobTitle: partial?.jobTitle ?? 'Backend Java Developer',
    jobRoleCategory,
    seniorityLevel: partial?.seniorityLevel ?? 'junior',
    hardSkills:
      partial?.hardSkills ??
      [
        { id: id('hs'), skillNameRaw: 'Java', isMandatory: true },
        { id: id('hs'), skillNameRaw: 'Spring Boot', isMandatory: true },
        { id: id('hs'), skillNameRaw: 'Docker', isMandatory: false },
      ],
    softSkills:
      partial?.softSkills ??
      [
        { id: id('ss'), skillNameRaw: 'Communication', isMandatory: true },
        { id: id('ss'), skillNameRaw: 'Teamwork', isMandatory: false },
      ],
    assessmentPath: partial?.assessmentPath ?? null,
    __pollCount: partial?.__pollCount ?? 0,
  }
}

function ensureJd(jdId: string): Jd {
  const existing = db.jd.get(jdId)
  if (existing) return existing
  const created = seedJd({ id: jdId })
  db.jd.set(jdId, created)
  return created
}

function ensureCv(pathId: string): Cv {
  const existing = db.cv.get(pathId)
  if (existing) return existing
  const created: Cv = { id: id('cv'), pathId, status: 'not_uploaded', fileName: null, __pollCount: 0 }
  db.cv.set(pathId, created)
  return created
}

function seedQuestions(): Session['questions'] {
  return [
    {
      id: id('q'),
      sequenceOrder: 1,
      part: 1,
      questionText: 'Trong Java, interface khác abstract class ở điểm nào?',
      options: {
        A: 'Interface có thể có constructor',
        B: 'Interface có thể có default methods (Java 8+)',
        C: 'Abstract class không thể có field',
        D: 'Không có sự khác biệt',
      },
    },
    {
      id: id('q'),
      sequenceOrder: 2,
      part: 2,
      questionText: 'Spring Boot actuator dùng để làm gì?',
      options: {
        A: 'Expose metrics/health endpoints',
        B: 'Tạo UI component',
        C: 'Build Docker image',
        D: 'Run database migrations',
      },
    },
  ]
}

function ensureSession(sessionId: string, pathId: string): Session {
  const existing = db.session.get(sessionId)
  if (existing) return existing
  const created: Session = {
    sessionId,
    pathId,
    status: 'in_progress',
    questionsReadyAfter: 2,
    __pollCount: 0,
    questions: seedQuestions(),
    submittedAnswers: [],
  }
  db.session.set(sessionId, created)
  return created
}

export const jdHandlers = [
  // JD submission
  http.post('*/jd-submissions', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as any

    const jdId = id('jd')
    const jd = seedJd({
      id: jdId,
      parseStatus: 'processing',
      sourceType: body?.sourceType === 'url' ? 'url' : 'text',
      sourceUrl: body?.sourceUrl ?? null,
      rawContent: body?.rawContent ?? null,
      __pollCount: 0,
    })

    db.jd.set(jdId, jd)

    // FE expects res.data.id or res.data.jdId
    return ok({ id: jdId })
  }),

  http.get('*/jd-submissions/:id', ({ params }) => {
    const jdId = String(params.id ?? '')
    const jd = ensureJd(jdId)

    // Simulate parse status transitions for polling UI
    jd.__pollCount += 1
    if (jd.parseStatus === 'processing' && jd.__pollCount >= 2) {
      jd.parseStatus = 'completed'
    }

    // Return ONLY API spec fields (no extra mock-only fields like `title`, `assessmentPathId`)
    return ok({
      id: jd.id,
      parseStatus: jd.parseStatus,
      sourceType: jd.sourceType,
      sourceUrl: jd.sourceUrl,
      rawContent: jd.rawContent,
      jobTitle: jd.jobTitle,
      jobRoleCategory: jd.jobRoleCategory,
      seniorityLevel: jd.seniorityLevel,
      hardSkills: jd.hardSkills,
      softSkills: jd.softSkills,
      assessmentPath: jd.assessmentPath,
      createdAt: new Date().toISOString(),
    })
  }),

  // GET /jd-submissions (list) — Sprint 1 Dashboard
  http.get('*/jd-submissions', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    const all = Array.from(db.jd.values())
      .slice()
      .sort((a, b) => 0)
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)

    return ok({
      items: items.map((jd) => ({
        id: jd.id,
        parseStatus: jd.parseStatus,
        jobTitle: jd.jobTitle,
        createdAt: new Date().toISOString(),
      })),
      page,
      pageSize,
      total: all.length,
    })
  }),

  // create assessment path
  http.post('*/jd-submissions/:jdId/assessment-path', async ({ params, request }) => {
    const jdId = String(params.jdId ?? '')
    const jd = ensureJd(jdId)
    const body = (await request.json().catch(() => null)) as any
    const pathType: string = typeof body?.pathType === 'string' ? body.pathType : 'assessment'

    const pathId = id('path')
    jd.assessmentPath = { id: pathId, pathType: pathType === 'cv' ? 'cv' : 'assessment' }
    db.pathToJd.set(pathId, jdId)

    return ok({ pathId })
  }),

  // reusable sessions
  http.get('*/jd-submissions/:jdId/reusable-sessions', ({ params }) => {
    const jdId = String(params.jdId ?? '')
    ensureJd(jdId)

    return ok([
      { sessionId: id('sess'), scorePercent: 72, fromJdTitle: 'Backend Java Developer' },
      { sessionId: id('sess'), scorePercent: 88, fromJdTitle: 'Java Spring Developer' },
    ])
  }),

  // create session from path
  http.post('*/assessment-paths/:pathId/sessions', async ({ params, request }) => {
    const pathId = String(params.pathId ?? '')
    const reuse = (await request.json().catch(() => null)) as any

    const sessionId = reuse?.reuseSessionId ? String(reuse.reuseSessionId) : id('sess')
    ensureSession(sessionId, pathId)

    return ok({ sessionId })
  }),

  http.get('*/assessment-sessions/:sessionId/questions', ({ params }) => {
    const sessionId = String(params.sessionId ?? '')

    // Find pathId if exists, else seed one
    const existing = db.session.get(sessionId)
    const pathId = existing?.pathId ?? id('path')
    const sess = ensureSession(sessionId, pathId)

    sess.__pollCount += 1
    const ready = sess.__pollCount >= sess.questionsReadyAfter

    return ok({
      sessionId: sess.sessionId,
      status: sess.status,
      questions: ready ? sess.questions : [],
    })
  }),

  http.post('*/assessment-sessions/:sessionId/submit', async ({ params, request }) => {
    const sessionId = String(params.sessionId ?? '')
    const body = (await request.json().catch(() => null)) as any

    const sess = ensureSession(sessionId, id('path'))
    sess.status = 'submitted'
    sess.submittedAnswers = Array.isArray(body?.answers) ? body.answers : []

    const totalCount = sess.questions.length
    const correctCount = Math.max(0, Math.floor(totalCount * 0.7))
    const scorePercent = totalCount ? (correctCount / totalCount) * 100 : 0

    return ok({
      sessionId: sess.sessionId,
      status: sess.status,
      totalQuestions: totalCount,
      correctCount,
      scorePercent,
      skillScores: [
        { skillName: 'Java OOP', score: 3, maxScore: 4, proficiencyLevel: 'intermediate' },
        { skillName: 'Spring Boot', score: 2, maxScore: 3, proficiencyLevel: 'intermediate' },
      ],
      results: sess.questions.map((q, i) => ({
        questionId: q.id,
        questionText: q.questionText,
        selectedOption: sess.submittedAnswers[i]?.selectedOption ?? '',
        correctOption: 'B',
        isCorrect: i === 0,
        explanation: i === 0
          ? 'Correct! Interfaces support default methods since Java 8.'
          : 'Incorrect. Spring Boot Actuator exposes metrics and health endpoints.',
      })),
    })
  }),

  http.get('*/assessment-sessions/:sessionId', ({ params }) => {
    const sessionId = String(params.sessionId ?? '')
    const sess = db.session.get(sessionId)

    if (!sess) {
      return HttpResponse.json({ data: null }, { status: 404 })
    }

    const totalCount = sess.questions.length
    const correctCount = Math.max(0, Math.min(totalCount, Math.floor(totalCount * 0.7)))
    const scorePercent = totalCount ? (correctCount / totalCount) * 100 : 0

    // skillScores field names match API spec: { skillName, score, maxScore, proficiencyLevel }
    const skillScores =
      sess.status === 'submitted'
        ? [
            { skillName: 'Java OOP', score: 3, maxScore: 4, proficiencyLevel: 'intermediate' },
            { skillName: 'Spring Boot', score: 2, maxScore: 3, proficiencyLevel: 'intermediate' },
          ]
        : []

    const results =
      sess.status === 'submitted'
        ? sess.questions.map((q, i) => ({
            questionId: q.id,
            questionText: q.questionText,
            selectedOption: sess.submittedAnswers[i]?.selectedOption ?? '',
            correctOption: 'B',
            isCorrect: i === 0,
            explanation: i === 0
              ? 'Correct! Interfaces support default methods since Java 8.'
              : 'Incorrect. Spring Boot Actuator exposes metrics and health endpoints.',
          }))
        : []

    return ok({
      sessionId: sess.sessionId,
      status: sess.status,
      totalQuestions: totalCount,
      correctCount,
      scorePercent,
      skillScores,
      results,
    })
  }),

  // CV endpoints
  http.get('*/assessment-paths/:pathId/cv', ({ params }) => {
    const pathId = String(params.pathId ?? '')
    const cv = ensureCv(pathId)

    cv.__pollCount += 1
    if (cv.status === 'processing' && cv.__pollCount >= 2) {
      cv.status = 'completed'
    }

    // Map CV internal status to API spec parseStatus
    const statusMap: Record<string, string> = {
      not_uploaded: 'pending',
      uploaded: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed',
    }
    const parseStatus = statusMap[cv.status] ?? 'pending'

    return ok({
      id: cv.id ?? pathId,
      fileName: cv.fileName,
      parseStatus,
      parsedSkills:
        cv.status === 'completed'
          ? [
              { skillName: 'React', proficiencyLevel: 'Advanced', yearsExp: 3, evidence: '3 years building SPAs' },
              { skillName: 'TypeScript', proficiencyLevel: 'Intermediate', yearsExp: 2, evidence: 'Type-safe codebase experience' },
            ]
          : [],
      totalExperienceYears: cv.status === 'completed' ? 3 : undefined,
      parsedAt: cv.status === 'completed' ? new Date().toISOString() : undefined,
    })
  }),

  http.post('*/assessment-paths/:pathId/cv', async ({ params }) => {
    const pathId = String(params.pathId ?? '')
    const cv = ensureCv(pathId)

    cv.id = id('cv')
    cv.status = 'processing'
    cv.fileName = 'CV-Upload.pdf'
    cv.__pollCount = 0

    return HttpResponse.json(
      {
        data: {
          id: cv.id,
          fileName: cv.fileName,
          fileSize: 245000,
          parseStatus: 'pending',
        },
      },
      { status: 202 },
    )
  }),
]
