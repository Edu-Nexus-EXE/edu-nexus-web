import { HttpResponse, http } from 'msw'

function ok<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
}

type JdSourceType = 'text' | 'url'
type AssessmentPathType = 'assessment' | 'cv'
type SubmittedAnswer = {
  selectedOption?: string
}
type JdSubmissionBody = {
  sourceType?: string
  sourceUrl?: string | null
  rawContent?: string | null
}
type AssessmentPathBody = {
  pathType?: string
}
type SessionReuseBody = {
  reuseSessionId?: string
}
type SubmitSessionBody = {
  answers?: SubmittedAnswer[]
}

type SeedJd = {
  id: string
  parseStatus: 'processing' | 'completed' | 'failed'
  sourceType: JdSourceType
  sourceUrl: string | null
  rawContent: string | null
  jobTitle: string
  jobRoleCategory: string
  seniorityLevel: string
  hardSkills: string[]
  softSkills: string[]
  assessmentPath?: {
    id: string
    pathType: AssessmentPathType
  }
  __pollCount: number
}

type Question = {
  id: string
  questionText: string
  options: Record<string, string>
}

type Session = {
  sessionId: string
  pathId: string
  status: 'in_progress' | 'submitted'
  questionsReadyAfter: number
  __pollCount: number
  questions: Question[]
  submittedAnswers: SubmittedAnswer[]
}

type CvState = {
  id?: string
  status: 'not_uploaded' | 'uploaded' | 'processing' | 'completed' | 'failed'
  fileName?: string
  __pollCount: number
}

const db = {
  jd: new Map<string, SeedJd>(),
  session: new Map<string, Session>(),
  cv: new Map<string, CvState>(),
  pathToJd: new Map<string, string>()
}

let seq = 1
function id(prefix: string) {
  seq += 1
  return `${prefix}-${seq}`
}

function seedJd(overrides?: Partial<SeedJd>): SeedJd {
  return {
    id: overrides?.id ?? id('jd'),
    parseStatus: overrides?.parseStatus ?? 'completed',
    sourceType: overrides?.sourceType ?? 'text',
    sourceUrl: overrides?.sourceUrl ?? null,
    rawContent: overrides?.rawContent ?? 'Senior Java Developer JD content...',
    jobTitle: overrides?.jobTitle ?? 'Senior Java Developer',
    jobRoleCategory: overrides?.jobRoleCategory ?? 'Backend',
    seniorityLevel: overrides?.seniorityLevel ?? 'Senior',
    hardSkills: overrides?.hardSkills ?? ['Java', 'Spring Boot', 'SQL'],
    softSkills: overrides?.softSkills ?? ['Communication', 'Problem Solving'],
    assessmentPath: overrides?.assessmentPath,
    __pollCount: overrides?.__pollCount ?? 0
  }
}

function ensureJd(jdId: string): SeedJd {
  const existing = db.jd.get(jdId)
  if (existing) return existing
  const created = seedJd({ id: jdId, parseStatus: 'completed' })
  db.jd.set(jdId, created)
  return created
}

function ensureCv(pathId: string): CvState {
  const existing = db.cv.get(pathId)
  if (existing) return existing
  const created: CvState = {
    status: 'not_uploaded',
    fileName: undefined,
    __pollCount: 0
  }
  db.cv.set(pathId, created)
  return created
}

function seedQuestions(): Question[] {
  return [
    {
      id: id('q'),
      questionText: 'What is the main benefit of using interfaces in Java?',
      options: {
        A: 'They allow multiple inheritance of implementation',
        B: 'They define contracts that classes can implement',
        C: 'They replace abstract classes entirely',
        D: 'They improve JVM startup speed'
      }
    },
    {
      id: id('q'),
      questionText: 'Which Spring Boot module is commonly used to expose REST APIs?',
      options: {
        A: 'spring-boot-starter-batch',
        B: 'spring-boot-starter-data-jpa',
        C: 'spring-boot-starter-web',
        D: 'spring-boot-starter-test'
      }
    },
    {
      id: id('q'),
      questionText: 'Why are database migrations useful in backend systems?',
      options: {
        A: 'They replace version control',
        B: 'They automate UI testing',
        C: 'They keep schema changes reproducible across environments',
        D: 'They compile Java source code'
      }
    },
    {
      id: id('q'),
      questionText: 'Which task is typically part of a CI pipeline?',
      options: {
        A: 'Run unit tests',
        B: 'Design Figma screens',
        C: 'Build Docker image',
        D: 'Run database migrations'
      }
    }
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
    submittedAnswers: []
  }
  db.session.set(sessionId, created)
  return created
}

export const jdHandlers = [
  http.post('*/jd-submissions', async ({ request }) => {
    const body = (await request.json().catch(() => null)) as JdSubmissionBody | null

    const jdId = id('jd')
    const jd = seedJd({
      id: jdId,
      parseStatus: 'processing',
      sourceType: body?.sourceType === 'url' ? 'url' : 'text',
      sourceUrl: body?.sourceUrl ?? null,
      rawContent: body?.rawContent ?? null,
      __pollCount: 0
    })

    db.jd.set(jdId, jd)
    return ok({ id: jdId })
  }),

  http.get('*/jd-submissions/:id', ({ params }) => {
    const jdId = String(params.id ?? '')
    const jd = ensureJd(jdId)

    jd.__pollCount += 1
    if (jd.parseStatus === 'processing' && jd.__pollCount >= 2) {
      jd.parseStatus = 'completed'
    }

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
      createdAt: new Date().toISOString()
    })
  }),

  http.get('*/jd-submissions', ({ request }) => {
    const url = new URL(request.url)
    const page = Number(url.searchParams.get('page') ?? 1)
    const pageSize = Number(url.searchParams.get('pageSize') ?? 10)

    const all = Array.from(db.jd.values()).slice()
    const start = (page - 1) * pageSize
    const items = all.slice(start, start + pageSize)

    return ok({
      items: items.map((jd) => ({
        id: jd.id,
        parseStatus: jd.parseStatus,
        jobTitle: jd.jobTitle,
        createdAt: new Date().toISOString()
      })),
      page,
      pageSize,
      total: all.length
    })
  }),

  http.post('*/jd-submissions/:jdId/assessment-path', async ({ params, request }) => {
    const jdId = String(params.jdId ?? '')
    const jd = ensureJd(jdId)
    const body = (await request.json().catch(() => null)) as AssessmentPathBody | null
    const pathType = body?.pathType === 'cv' ? 'cv' : 'assessment'

    const pathId = id('path')
    jd.assessmentPath = { id: pathId, pathType }
    db.pathToJd.set(pathId, jdId)

    return ok({ pathId })
  }),

  http.get('*/jd-submissions/:jdId/reusable-sessions', ({ params }) => {
    const jdId = String(params.jdId ?? '')
    const jd = ensureJd(jdId)

    // Tính pathId thuộc về JD này (nếu chưa chọn path thì rỗng, không có session cũ).
    const pathId = jd.assessmentPath?.id
    if (!pathId) return ok([])

    // Chỉ trả về các session đã từng chạy cho ĐÚNG pathId của JD hiện tại.
    // Mỗi session thuộc về 1 pathId cụ thể; không được trộn session của JD khác
    // vào danh sách reuse — tránh user tưởng nhầm là bộ câu hỏi của JD mới.
    const sessions = Array.from(db.session.values()).filter((s) => s.pathId === pathId)
    const data = sessions.map((s) => ({
      sessionId: s.sessionId,
      jdId, // gắn jdId để FE có thể filter defense-in-depth
      scorePercent:
        s.questions.length > 0 && s.submittedAnswers.length > 0
          ? Math.round(
              (s.submittedAnswers.filter((a, i) => a.selectedOption && s.questions[i]).length / s.questions.length) *
                100
            )
          : 0,
      fromJdTitle: jd.jobTitle
    }))

    return ok(data)
  }),

  http.post('*/assessment-paths/:pathId/sessions', async ({ params, request }) => {
    const pathId = String(params.pathId ?? '')
    const reuse = (await request.json().catch(() => null)) as SessionReuseBody | null

    const sessionId = reuse?.reuseSessionId ? String(reuse.reuseSessionId) : id('sess')
    ensureSession(sessionId, pathId)

    return ok({ sessionId })
  }),

  http.get('*/assessment-sessions/:sessionId/questions', ({ params }) => {
    const sessionId = String(params.sessionId ?? '')

    const existing = db.session.get(sessionId)
    const pathId = existing?.pathId ?? id('path')
    const sess = ensureSession(sessionId, pathId)

    sess.__pollCount += 1
    const ready = sess.__pollCount >= sess.questionsReadyAfter

    return ok({
      sessionId: sess.sessionId,
      status: sess.status,
      questions: ready ? sess.questions : []
    })
  }),

  http.post('*/assessment-sessions/:sessionId/submit', async ({ params, request }) => {
    const sessionId = String(params.sessionId ?? '')
    const body = (await request.json().catch(() => null)) as SubmitSessionBody | null

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
        { skillName: 'Spring Boot', score: 2, maxScore: 3, proficiencyLevel: 'intermediate' }
      ],
      results: sess.questions.map((q, i) => ({
        questionId: q.id,
        questionText: q.questionText,
        selectedOption: sess.submittedAnswers[i]?.selectedOption ?? '',
        correctOption: 'B',
        isCorrect: i === 0,
        explanation:
          i === 0
            ? 'Correct! Interfaces support default methods since Java 8.'
            : 'Incorrect. Spring Boot Actuator exposes metrics and health endpoints.'
      }))
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

    const skillScores =
      sess.status === 'submitted'
        ? [
            { skillName: 'Java OOP', score: 3, maxScore: 4, proficiencyLevel: 'intermediate' },
            { skillName: 'Spring Boot', score: 2, maxScore: 3, proficiencyLevel: 'intermediate' }
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
            explanation:
              i === 0
                ? 'Correct! Interfaces support default methods since Java 8.'
                : 'Incorrect. Spring Boot Actuator exposes metrics and health endpoints.'
          }))
        : []

    return ok({
      sessionId: sess.sessionId,
      status: sess.status,
      totalQuestions: totalCount,
      correctCount,
      scorePercent,
      skillScores,
      results
    })
  }),

  http.get('*/assessment-paths/:pathId/cv', ({ params }) => {
    const pathId = String(params.pathId ?? '')
    const cv = ensureCv(pathId)

    cv.__pollCount += 1
    if (cv.status === 'processing' && cv.__pollCount >= 2) {
      cv.status = 'completed'
    }

    const statusMap: Record<string, string> = {
      not_uploaded: 'pending',
      uploaded: 'pending',
      processing: 'processing',
      completed: 'completed',
      failed: 'failed'
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
              {
                skillName: 'TypeScript',
                proficiencyLevel: 'Intermediate',
                yearsExp: 2,
                evidence: 'Type-safe codebase experience'
              }
            ]
          : [],
      totalExperienceYears: cv.status === 'completed' ? 3 : undefined,
      parsedAt: cv.status === 'completed' ? new Date().toISOString() : undefined
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
          parseStatus: 'pending'
        }
      },
      { status: 202 }
    )
  })
]
