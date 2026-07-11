import { HttpResponse, delay, http } from 'msw'

function ok<T>(data: T, init?: ResponseInit) {
  return HttpResponse.json({ data }, init)
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
  })
]
