import { HttpResponse, delay, http } from 'msw'

function ok<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
}

function notFound(message: string) {
  return HttpResponse.json({ error: { code: 'market_job_not_found', message } }, { status: 404 })
}

function filterMockJobs(params: URLSearchParams) {
  const roleCategory = params.get('roleCategory')
  const keyword = params.get('keyword')
  return mockJobs.filter((job) => {
    if (roleCategory && job.roleCategory !== roleCategory) return false
    if (keyword) {
      const haystack = [job.jobTitle, job.companyName ?? '', job.location ?? '', job.rawContent].join(' ').toLowerCase()
      if (!haystack.includes(keyword.toLowerCase())) return false
    }
    return true
  })
}

function paginateMockJobs(items: typeof mockJobs, pageRaw: string | null, pageSizeRaw: string | null) {
  const page = Math.max(1, Number.parseInt(pageRaw ?? '1', 10) || 1)
  const pageSize = Math.max(1, Math.min(30, Number.parseInt(pageSizeRaw ?? '10', 10) || 10))
  const total = items.length
  const totalPages = total === 0 ? 0 : Math.ceil(total / pageSize)
  const start = (page - 1) * pageSize
  return { items: items.slice(start, start + pageSize), page, pageSize, total, totalPages }
}

const baseline = {
  roleCategory: 'backend',
  totalJobs: 42,
  lastUpdatedAt: new Date().toISOString(),
  topSkills: [
    { skillName: 'PostgreSQL', jobCount: 21, demandPercent: 50 },
    { skillName: 'Docker', jobCount: 18, demandPercent: 43 },
    { skillName: 'REST API', jobCount: 17, demandPercent: 40 },
    { skillName: '.NET', jobCount: 14, demandPercent: 33 },
    { skillName: 'Clean Architecture', jobCount: 10, demandPercent: 24 }
  ]
}

const readiness = {
  score: 76,
  level: 'improving',
  totalGapSkills: 4,
  missingSkills: 1,
  needsUpgradeSkills: 3,
  haveSkills: 8,
  roadmapCompletionPercent: 58,
  marketAlignmentPercent: 71,
  prioritySkills: ['Docker', 'PostgreSQL', 'Clean Architecture'],
  calculatedAt: new Date().toISOString()
}

const readinessHistory = [
  {
    score: 42,
    level: 'developing',
    totalGapSkills: 10,
    missingSkills: 4,
    needsUpgradeSkills: 3,
    haveSkills: 3,
    roadmapCompletionPercent: 10,
    marketAlignmentPercent: 25,
    calculatedAt: '2026-05-01T00:00:00Z'
  },
  {
    score: 55,
    level: 'developing',
    totalGapSkills: 10,
    missingSkills: 3,
    needsUpgradeSkills: 2,
    haveSkills: 5,
    roadmapCompletionPercent: 30,
    marketAlignmentPercent: 45,
    calculatedAt: '2026-06-01T00:00:00Z'
  },
  {
    score: 68,
    level: 'ready',
    totalGapSkills: 10,
    missingSkills: 2,
    needsUpgradeSkills: 1,
    haveSkills: 7,
    roadmapCompletionPercent: 55,
    marketAlignmentPercent: 65,
    calculatedAt: '2026-07-01T00:00:00Z'
  }
]

const crawlRuns = [
  {
    runId: '11111111-1111-1111-1111-111111111111',
    sourceSite: 'topcv',
    status: 'blocked',
    message: 'TopCV returned 403 for search page.',
    fetchedUrls: 1,
    parsedJobs: 0,
    importedJobs: 0,
    importedSkills: 0,
    skippedDuplicates: 0,
    startedAt: new Date().toISOString(),
    finishedAt: new Date().toISOString()
  }
]

const mockJobs = [
  {
    id: 'aaaa1111-aaaa-1111-aaaa-111111111111',
    sourceSite: 'demo-fixture',
    sourceUrl: 'https://demo.local/market/backend-dotnet-01',
    jobTitle: 'Senior Backend .NET Developer',
    companyName: 'Edu Nexus Demo Co.',
    location: 'Ho Chi Minh City',
    salaryText: '20-35M VND',
    roleCategory: 'backend',
    postedAt: '2026-07-01T00:00:00Z',
    collectedAt: '2026-07-04T00:00:00Z',
    skills: ['.NET', 'PostgreSQL', 'Docker', 'REST API'],
    rawContent: [
      'Senior Backend .NET Developer',
      'We are looking for a backend engineer to build REST APIs for learning analytics and career readiness workflows.',
      'Responsibilities',
      '- Design and maintain ASP.NET Core APIs',
      '- Work with PostgreSQL, Docker, and cloud deployment pipelines',
      '- Collaborate with frontend and product teams to improve student-facing features',
      'Requirements',
      '- 3+ years of backend development experience',
      '- Strong knowledge of .NET, SQL, REST API, and clean architecture',
      '- Comfortable reading logs, writing tests, and improving production reliability',
      'Benefits',
      '- Hybrid working model',
      '- Learning budget and mentoring from senior engineers'
    ].join('\n\n'),
    originalContentQuality: 'detail_page',
    rawContentHash: 'abc123def456'
  },
  {
    id: 'bbbb2222-bbbb-2222-bbbb-222222222222',
    sourceSite: 'demo-fixture',
    sourceUrl: 'https://demo.local/market/frontend-react-01',
    jobTitle: 'Frontend React Engineer',
    companyName: 'Edu Nexus Demo Co.',
    location: 'Ha Noi',
    salaryText: '18-28M VND',
    roleCategory: 'frontend',
    postedAt: '2026-07-02T00:00:00Z',
    collectedAt: '2026-07-05T00:00:00Z',
    skills: ['React', 'TypeScript', 'Tailwind CSS'],
    rawContent: [
      'Frontend React Engineer',
      'Join our product team to build dashboards for students, admins, and career mentors.',
      'What you will do',
      '- Build accessible React screens with TypeScript',
      '- Integrate APIs for job analysis, career roadmap, and market readiness',
      '- Polish responsive UI states for real users',
      'What we expect',
      '- Solid React and TypeScript experience',
      '- Good understanding of component design, forms, and data fetching',
      '- Familiarity with Tailwind CSS and product-oriented UX'
    ].join('\n\n'),
    originalContentQuality: 'detail_page',
    rawContentHash: 'def456abc789'
  }
]

export const marketIntelligenceHandlers = [
  http.get('*/market/roles/:roleCategory/baseline', async ({ params }) => {
    await delay(250)
    return ok({ ...baseline, roleCategory: String(params.roleCategory ?? 'backend') })
  }),

  http.get('*/market/skills/trends', async ({ request }) => {
    await delay(250)
    const roleCategory = new URL(request.url).searchParams.get('roleCategory') ?? 'backend'
    return ok(
      ['PostgreSQL', 'Docker', 'REST API', '.NET'].flatMap((skillName, index) =>
        Array.from({ length: 4 }, (_, monthIndex) => ({
          roleCategory,
          skillName,
          periodStart: `2026-0${monthIndex + 3}-01T00:00:00Z`,
          jobCount: 8 + index * 2 + monthIndex,
          demandPercent: 18 + index * 5 + monthIndex * 4
        }))
      )
    )
  }),

  http.get('*/users/me/readiness', async () => {
    await delay(200)
    return ok(readiness)
  }),

  http.get('*/users/me/readiness/history', async () => {
    await delay(200)
    return ok(readinessHistory)
  }),

  http.get('*/users/me/skill-progress', async () => {
    await delay(200)
    return ok([
      { skillName: 'PostgreSQL', currentStatus: 'have', urgencyScore: 4, isMandatory: true, isInMarketTopSkills: true },
      {
        skillName: 'Docker',
        currentStatus: 'needs_upgrade',
        urgencyScore: 8,
        isMandatory: true,
        isInMarketTopSkills: true
      },
      { skillName: 'REST API', currentStatus: 'have', urgencyScore: 3, isMandatory: false, isInMarketTopSkills: true },
      {
        skillName: 'Clean Architecture',
        currentStatus: 'missing',
        urgencyScore: 9,
        isMandatory: false,
        isInMarketTopSkills: true
      }
    ])
  }),

  http.get('*/admin/dashboard/career-readiness', async () => {
    await delay(250)
    return ok({
      totalStudents: 128,
      studentsWithReadinessSnapshot: 74,
      averageReadinessScore: 68,
      byMajor: [
        { major: 'Software Engineering', studentCount: 64, averageReadinessScore: 72 },
        { major: 'Information Systems', studentCount: 38, averageReadinessScore: 65 }
      ],
      topMissingSkills: [
        { skillName: 'Docker', missingCount: 22, needsUpgradeCount: 31 },
        { skillName: 'PostgreSQL', missingCount: 18, needsUpgradeCount: 27 }
      ],
      targetRoles: [
        { roleCategory: 'backend', studentCount: 46, marketJobCount: 42 },
        { roleCategory: 'frontend', studentCount: 32, marketJobCount: 37 }
      ]
    })
  }),

  http.get('*/admin/users/:userId/readiness/history', async () => {
    await delay(200)
    return ok(readinessHistory)
  }),

  http.post('*/admin/market/import', async () => {
    await delay(350)
    return ok({ importedJobs: 2, importedSkills: 10, skippedDuplicates: 0, sourceMode: 'manual_demo' })
  }),

  http.post('*/admin/market/crawl', async ({ request }) => {
    await delay(350)
    const body = (await request.json().catch(() => ({}))) as { sourceSite?: string }
    const isDemoSource = body.sourceSite === 'demo-fixture' || body.sourceSite?.endsWith('-demo')
    const isRealSource = ['topcv', 'vietnamworks', 'itviec', 'careerviet'].includes(body.sourceSite ?? '')
    const run = {
      runId: crypto.randomUUID(),
      sourceSite: body.sourceSite ?? 'topcv',
      status: isDemoSource ? 'succeeded' : isRealSource ? 'blocked' : 'unsupported',
      message: isDemoSource
        ? `Loaded 3 deterministic ${body.sourceSite} market jobs.`
        : isRealSource
          ? `${body.sourceSite} returned 403 for search page.`
          : 'Market crawler source is not enabled or not supported.',
      fetchedUrls: isDemoSource ? 3 : 1,
      parsedJobs: isDemoSource ? 3 : 0,
      importedJobs: isDemoSource ? 3 : 0,
      importedSkills: isDemoSource ? 12 : 0,
      skippedDuplicates: 0,
      startedAt: new Date().toISOString(),
      finishedAt: new Date().toISOString()
    }
    crawlRuns.unshift(run)
    return ok(run)
  }),

  http.get('*/admin/market/sources', async () => {
    await delay(150)
    return ok([
      { sourceSite: 'topcv', displayName: 'TopCV', isEnabled: true, isDemoOnly: false },
      { sourceSite: 'vietnamworks', displayName: 'VietnamWorks', isEnabled: true, isDemoOnly: false },
      { sourceSite: 'itviec', displayName: 'ITviec', isEnabled: true, isDemoOnly: false },
      { sourceSite: 'careerviet', displayName: 'CareerViet (CareerBuilder VN)', isEnabled: true, isDemoOnly: false },
      { sourceSite: 'demo-fixture', displayName: 'Demo Fixture', isEnabled: true, isDemoOnly: true },
      { sourceSite: 'vietnamworks-demo', displayName: 'VietnamWorks Demo', isEnabled: true, isDemoOnly: true },
      { sourceSite: 'itviec-demo', displayName: 'ITviec Demo', isEnabled: true, isDemoOnly: true },
      { sourceSite: 'careerviet-demo', displayName: 'CareerViet Demo', isEnabled: true, isDemoOnly: true }
    ])
  }),

  http.get('*/admin/market/scheduler', async () => {
    await delay(150)
    return ok({
      enabled: true,
      cron: '0 */6 * * *',
      timeZoneId: 'SE Asia Standard Time',
      sources: ['itviec', 'vietnamworks'],
      roleCategories: ['backend', 'frontend', 'data', 'devops'],
      keywordTemplate: '{role} developer',
      limitPerSource: 5,
      useDemoSources: false,
      maxRunsPerExecution: 8
    })
  }),

  http.get('*/admin/market/crawl-runs', async () => {
    await delay(150)
    return ok(crawlRuns.slice(0, 10))
  }),

  http.get('*/admin/market/crawl-runs/:runId', async ({ params }) => {
    await delay(150)
    const run = crawlRuns.find((item) => item.runId === params.runId) ?? crawlRuns[0]
    return ok({
      run,
      items: [
        {
          sourceUrl: 'https://demo.edunexus.local/market/backend-senior-dotnet',
          itemStatus: run.status,
          httpStatus: run.status === 'blocked' ? 403 : 200,
          jobTitle: run.importedJobs > 0 ? 'Senior Backend .NET Developer' : null,
          rawContentHash: null,
          message: run.message
        }
      ]
    })
  }),

  http.get('*/market/jobs', async ({ request }) => {
    await delay(150)
    const params = new URL(request.url).searchParams
    const filtered = filterMockJobs(params)
    const { items, page, pageSize, total, totalPages } = paginateMockJobs(
      filtered,
      params.get('page'),
      params.get('pageSize')
    )
    return ok({
      items: items.map((job) => ({
        id: job.id,
        sourceSite: job.sourceSite,
        sourceUrl: job.sourceUrl,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        salaryText: job.salaryText,
        roleCategory: job.roleCategory,
        postedAt: job.postedAt,
        collectedAt: job.collectedAt,
        skills: job.skills,
        rawContentPreview: job.rawContent.slice(0, 280),
        originalContentQuality: job.originalContentQuality,
        rawContentHash: null,
        contentLength: null
      })),
      page,
      pageSize,
      total,
      totalPages
    })
  }),

  http.get('*/market/jobs/:id', async ({ params }) => {
    await delay(120)
    const job = mockJobs.find((item) => item.id === params.id)
    if (!job) {
      return notFound(`Market job '${String(params.id)}' was not found.`)
    }
    return ok({
      id: job.id,
      sourceSite: job.sourceSite,
      sourceUrl: job.sourceUrl,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      salaryText: job.salaryText,
      roleCategory: job.roleCategory,
      postedAt: job.postedAt,
      collectedAt: job.collectedAt,
      skills: job.skills,
      rawContent: job.rawContent,
      originalContent: job.rawContent,
      originalContentQuality: job.originalContentQuality,
      rawContentPreview: job.rawContent.slice(0, 280),
      rawContentHash: null,
      contentLength: null
    })
  }),

  http.get('*/admin/market/jobs', async ({ request }) => {
    await delay(150)
    const params = new URL(request.url).searchParams
    const filtered = filterMockJobs(params)
    const { items, page, pageSize, total, totalPages } = paginateMockJobs(
      filtered,
      params.get('page'),
      params.get('pageSize')
    )
    return ok({
      items: items.map((job) => ({
        id: job.id,
        sourceSite: job.sourceSite,
        sourceUrl: job.sourceUrl,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        location: job.location,
        salaryText: job.salaryText,
        roleCategory: job.roleCategory,
        postedAt: job.postedAt,
        collectedAt: job.collectedAt,
        skills: job.skills,
        rawContentPreview: job.rawContent.slice(0, 280),
        originalContentQuality: job.originalContentQuality,
        rawContentHash: job.rawContentHash,
        contentLength: job.rawContent.length
      })),
      page,
      pageSize,
      total,
      totalPages
    })
  }),

  http.get('*/admin/market/jobs/:id', async ({ params }) => {
    await delay(120)
    const job = mockJobs.find((item) => item.id === params.id)
    if (!job) {
      return notFound(`Market job '${String(params.id)}' was not found.`)
    }
    return ok({
      id: job.id,
      sourceSite: job.sourceSite,
      sourceUrl: job.sourceUrl,
      jobTitle: job.jobTitle,
      companyName: job.companyName,
      location: job.location,
      salaryText: job.salaryText,
      roleCategory: job.roleCategory,
      postedAt: job.postedAt,
      collectedAt: job.collectedAt,
      skills: job.skills,
      rawContent: job.rawContent,
      originalContent: job.rawContent,
      originalContentQuality: job.originalContentQuality,
      rawContentPreview: job.rawContent.slice(0, 280),
      rawContentHash: job.rawContentHash,
      contentLength: job.rawContent.length
    })
  })
]
