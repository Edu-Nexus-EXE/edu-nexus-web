import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { AddCertificateRequest, AddProjectRequest, ToggleVisibilityRequest, UpdatePortfolioRequest } from '~/api/model'
import {
  deletePortfolioCertificatesId,
  deletePortfolioProjectsId,
  getPortfolio,
  patchPortfolioCertificatesIdVisibility,
  patchPortfolioProjectsIdVisibility,
  postPortfolioCertificates,
  postPortfolioProjects,
  putPortfolio,
  putPortfolioCertificatesId,
  putPortfolioProjectsId,
} from '~/api/operations/portfolios/portfolios'
import { getJdSubmissions } from '~/api/operations/jd-submissions/jd-submissions'
import { QuotaExceededError } from '~/api/mutator/custom-fetch'
import { getAuthSession } from '~/shared/lib/auth-session'
import { cn } from '~/shared/lib/cn'

import {
  createDefaultPortfolio,
  parsePortfolio,
  slugify,
  splitCommaTags,
  type PortfolioCertificate,
  type PortfolioDocument,
  type PortfolioProject,
  type PortfolioSkillSource,
} from '../lib/portfolio-data'

type ResponseWithData<T> = { data?: T }

type JdFetchSkillCandidate = {
  hardSkills?: unknown
  skillGaps?: unknown
  completedSkills?: unknown
}

function normalizeSkillKey(value: string) {
  return value.trim().toLowerCase()
}

function mergeSkillSources(...sources: Array<Partial<Record<string, PortfolioSkillSource>> | undefined>) {
  const merged: Partial<Record<string, PortfolioSkillSource>> = {}
  sources.forEach((source) => {
    Object.entries(source ?? {}).forEach(([key, value]) => {
      if (!value) return
      merged[normalizeSkillKey(key)] = value
    })
  })
  return merged
}

function getSkillSourceLabel(source: PortfolioSkillSource | undefined) {
  switch (source) {
    case 'backend':
      return 'backend'
    case 'jd-inferred':
      return 'jd-inferred'
    case 'manual':
      return 'manual'
    default:
      return 'manual'
  }
}

function mergeSkillsWithPriority(
  sources: Array<{ skills: string[]; source: PortfolioSkillSource }>
): { skills: string[]; skillSources: Partial<Record<string, PortfolioSkillSource>> } {
  const ordered: string[] = []
  const seen = new Set<string>()
  const skillSources: Partial<Record<string, PortfolioSkillSource>> = {}

  sources.forEach(({ skills, source }) => {
    skills.forEach((skill) => {
      const trimmed = skill.trim()
      if (!trimmed) return
      const key = normalizeSkillKey(trimmed)
      if (!seen.has(key)) {
        seen.add(key)
        ordered.push(trimmed)
      }
      if (!skillSources[key]) {
        skillSources[key] = source
      }
    })
  })

  return { skills: ordered, skillSources }
}

function parseJdRows(response: unknown): string[] {
  const data = (response as ResponseWithData<unknown>)?.data
  const items = Array.isArray(data)
    ? data
    : Array.isArray((data as { items?: unknown[] } | null)?.items)
      ? (data as { items: unknown[] }).items
      : []

  const skills = new Set<string>()
  items.forEach((item) => {
    const raw = (item ?? {}) as JdFetchSkillCandidate & Record<string, unknown>

    const hardSkills = Array.isArray(raw.hardSkills) ? raw.hardSkills : []
    hardSkills.forEach((skill) => {
      if (typeof skill === 'string' && skill.trim()) skills.add(skill.trim())
    })

    const completedSkills = Array.isArray(raw.completedSkills) ? raw.completedSkills : []
    completedSkills.forEach((skill) => {
      if (typeof skill === 'string' && skill.trim()) skills.add(skill.trim())
      if (skill && typeof skill === 'object' && typeof (skill as Record<string, unknown>).name === 'string') {
        skills.add(String((skill as Record<string, unknown>).name).trim())
      }
    })

    const skillGaps = Array.isArray(raw.skillGaps) ? raw.skillGaps : []
    skillGaps.forEach((gap) => {
      if (gap && typeof gap === 'object') {
        const record = gap as Record<string, unknown>
        const status = typeof record.status === 'string' ? record.status.toLowerCase() : ''
        const name = typeof record.name === 'string' ? record.name.trim() : ''
        if (name && (status === 'have' || status === 'upgrade')) skills.add(name)
      }
    })
  })

  return Array.from(skills)
}

export function PortfolioEditorPage() {
  const { t } = useTranslation('portfolio')
  const user = useMemo(() => getAuthSession()?.user ?? null, [])
  const fallbackSlug = useMemo(
    () => slugify(user?.portfolioUrlSlug || user?.fullName || 'portfolio') || 'portfolio',
    [user?.fullName, user?.portfolioUrlSlug]
  )

  const [portfolioState, setPortfolioState] = useState<PortfolioDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [loadingAutoPopulate, setLoadingAutoPopulate] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newSkillInput, setNewSkillInput] = useState('')
  const [certificateDraft, setCertificateDraft] = useState<PortfolioCertificate>({
    id: '',
    name: '',
    issuer: '',
    issueDate: '',
    expiryDate: '',
    credentialUrl: '',
    fileUrl: '',
    isVisible: true,
  })
  const [projectDraft, setProjectDraft] = useState<PortfolioProject>({
    id: '',
    title: '',
    description: '',
    techStack: [],
    demoUrl: '',
    repoUrl: '',
    role: '',
    startDate: '',
    completedDate: '',
    imageUrl: '',
    isVisible: true,
  })
  const [projectTechInput, setProjectTechInput] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadPortfolio() {
      if (!user) {
        if (!cancelled) {
          setPortfolioState(null)
          setLoading(false)
        }
        return
      }

      try {
        const res = await getPortfolio()
        if (cancelled) return
        setPortfolioState(parsePortfolio(res, user.fullName ?? 'User', fallbackSlug))
        setError('')
      } catch {
        if (cancelled) return
        setPortfolioState(createDefaultPortfolio(user.fullName ?? 'User', fallbackSlug))
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadPortfolio()

    return () => {
      cancelled = true
    }
  }, [fallbackSlug, user])

  const publicUrl = portfolioState?.overview.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/p/${portfolioState.overview.slug}`
    : ''
  const formattedUpdatedAt = portfolioState?.updatedAt
    ? new Date(portfolioState.updatedAt).toLocaleString('vi-VN')
    : ''

  async function refreshPortfolio() {
    if (!user) return
    const res = await getPortfolio()
    setPortfolioState(parsePortfolio(res, user.fullName ?? 'User', fallbackSlug))
  }

  async function handleCopyPublicUrl() {
    if (!publicUrl || typeof navigator === 'undefined' || !navigator.clipboard) return
    try {
      await navigator.clipboard.writeText(publicUrl)
      setSuccess(t('editor.preview.copySuccess'))
      setError('')
    } catch (e) {
      setError((e as Error).message || t('editor.preview.copyError'))
      setSuccess('')
    }
  }

  async function saveOverview(next: PortfolioDocument) {
    const payload: UpdatePortfolioRequest = {
      headline: next.overview.headline || null,
      bio: next.overview.bio || null,
      showCompletedSkills: next.showCompletedSkills,
      showCertificates: next.showCertificates,
      showProjects: next.showProjects,
      isPublic: next.isPublic,
    }

    setSaving(true)
    setError('')
    try {
      await putPortfolio(payload)
      await refreshPortfolio()
      setSuccess(t('editor.autoPopulate.success'))
    } catch (e) {
      if (e instanceof QuotaExceededError) throw e
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  function patchLocal(next: PortfolioDocument) {
    setPortfolioState({ ...next, updatedAt: new Date().toISOString() })
  }

  function updateOverviewField(key: 'fullName' | 'headline' | 'bio' | 'slug', value: string) {
    if (!portfolioState) return
    patchLocal({
      ...portfolioState,
      overview: {
        ...portfolioState.overview,
        [key]: key === 'slug' ? slugify(value) : value,
      },
    })
  }

  function addSkill() {
    if (!portfolioState) return
    const tags = splitCommaTags(newSkillInput)
    if (tags.length === 0) return

    const seen = new Set(portfolioState.overview.skills.map((skill) => normalizeSkillKey(skill)))
    const merged = [...portfolioState.overview.skills]
    const nextSkillSources = mergeSkillSources(portfolioState.overview.skillSources)
    tags.forEach((tag) => {
      const key = normalizeSkillKey(tag)
      if (!seen.has(key)) {
        seen.add(key)
        merged.push(tag)
      }
      nextSkillSources[key] = 'manual'
    })

    patchLocal({
      ...portfolioState,
      overview: {
        ...portfolioState.overview,
        skills: merged,
        skillSources: nextSkillSources,
      },
    })
    setNewSkillInput('')
  }

  function removeSkill(skill: string) {
    if (!portfolioState) return
    const nextSkillSources = { ...portfolioState.overview.skillSources }
    delete nextSkillSources[normalizeSkillKey(skill)]
    patchLocal({
      ...portfolioState,
      overview: {
        ...portfolioState.overview,
        skills: portfolioState.overview.skills.filter((item) => item !== skill),
        skillSources: nextSkillSources,
      },
    })
  }

  async function handleAutoPopulate() {
    if (!portfolioState || !user) return

    setError('')
    setSuccess('')
    setLoadingAutoPopulate(true)
    try {
      const canonicalResponse = await getPortfolio()
      const canonicalPortfolio = parsePortfolio(canonicalResponse, user.fullName ?? 'User', fallbackSlug)
      const res = await getJdSubmissions({ page: 1, pageSize: 10 })
      const inferredSkills = parseJdRows(res)
      const mergedSkillState = mergeSkillsWithPriority([
        { skills: canonicalPortfolio.overview.skills, source: 'backend' },
        { skills: portfolioState.overview.skills, source: 'manual' },
        { skills: inferredSkills, source: 'jd-inferred' },
      ])
      const mergedSkillSources = mergeSkillSources(
        canonicalPortfolio.overview.skillSources,
        portfolioState.overview.skillSources,
        mergedSkillState.skillSources
      )

      const next: PortfolioDocument = {
        ...canonicalPortfolio,
        overview: {
          ...canonicalPortfolio.overview,
          fullName: user.fullName ?? canonicalPortfolio.overview.fullName ?? 'User',
          headline: canonicalPortfolio.overview.headline || portfolioState.overview.headline || t('editor.autoPopulate.defaultHeadline'),
          bio:
            canonicalPortfolio.overview.bio ||
            portfolioState.overview.bio ||
            t('editor.autoPopulate.defaultBio', {
              name: user.fullName ?? 'User',
              email: user.email ?? '',
            }),
          slug: canonicalPortfolio.overview.slug || portfolioState.overview.slug || fallbackSlug,
          skills: mergedSkillState.skills,
          skillSources: mergedSkillSources,
        },
      }
      patchLocal(next)
      await saveOverview(next)
      setSuccess(t('editor.autoPopulate.success'))
    } catch (e) {
      if (e instanceof QuotaExceededError) throw e
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setLoadingAutoPopulate(false)
    }
  }

  async function addCertificate() {
    if (!portfolioState) return
    if (!certificateDraft.name.trim() || !certificateDraft.issuer.trim() || !certificateDraft.issueDate.trim()) {
      setError(t('editor.certificates.validation'))
      return
    }

    const payload: AddCertificateRequest = {
      name: certificateDraft.name.trim(),
      issuer: certificateDraft.issuer.trim(),
      issuedDate: certificateDraft.issueDate.trim(),
      expiresDate: certificateDraft.expiryDate.trim() || null,
      credentialUrl: certificateDraft.credentialUrl.trim() || null,
      fileUrl: certificateDraft.fileUrl.trim() || null,
      isVisible: certificateDraft.isVisible,
    }

    setSaving(true)
    setError('')
    try {
      await postPortfolioCertificates(payload)
      await refreshPortfolio()
      setCertificateDraft({ id: '', name: '', issuer: '', issueDate: '', expiryDate: '', credentialUrl: '', fileUrl: '', isVisible: true })
      setSuccess(t('editor.certificates.added'))
    } catch (e) {
      if (e instanceof QuotaExceededError) throw e
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function updateCertificate(certificate: PortfolioCertificate) {
    const payload: AddCertificateRequest = {
      name: certificate.name,
      issuer: certificate.issuer,
      issuedDate: certificate.issueDate || null,
      expiresDate: certificate.expiryDate || null,
      credentialUrl: certificate.credentialUrl || null,
      fileUrl: certificate.fileUrl || null,
      isVisible: certificate.isVisible,
    }

    setSaving(true)
    setError('')
    try {
      await putPortfolioCertificatesId({ id: certificate.id }, payload)
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteCertificate(id: string) {
    setSaving(true)
    setError('')
    try {
      await deletePortfolioCertificatesId({ id })
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleCertificateVisibility(certificate: PortfolioCertificate) {
    const payload: ToggleVisibilityRequest = { isVisible: !certificate.isVisible }

    setSaving(true)
    setError('')
    try {
      await patchPortfolioCertificatesIdVisibility({ id: certificate.id }, payload)
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function addProject() {
    if (!portfolioState) return
    if (!projectDraft.title.trim() || !projectDraft.description.trim() || !projectDraft.startDate.trim()) {
      setError(t('editor.projects.validation'))
      return
    }

    const payload: AddProjectRequest = {
      title: projectDraft.title.trim(),
      description: projectDraft.description.trim(),
      repoUrl: projectDraft.repoUrl.trim() || null,
      liveUrl: projectDraft.demoUrl.trim() || null,
      imageUrl: projectDraft.imageUrl.trim() || null,
      techStack: splitCommaTags(projectTechInput),
      role: projectDraft.role.trim() || null,
      startedDate: projectDraft.startDate.trim(),
      completedDate: projectDraft.completedDate.trim() || null,
      isVisible: projectDraft.isVisible,
    }

    setSaving(true)
    setError('')
    try {
      await postPortfolioProjects(payload)
      await refreshPortfolio()
      setProjectDraft({ id: '', title: '', description: '', techStack: [], demoUrl: '', repoUrl: '', role: '', startDate: '', completedDate: '', imageUrl: '', isVisible: true })
      setProjectTechInput('')
      setSuccess(t('editor.projects.added'))
    } catch (e) {
      if (e instanceof QuotaExceededError) throw e
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function deleteProject(id: string) {
    setSaving(true)
    setError('')
    try {
      await deletePortfolioProjectsId({ id })
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function toggleProjectVisibility(project: PortfolioProject) {
    const payload: ToggleVisibilityRequest = { isVisible: !project.isVisible }

    setSaving(true)
    setError('')
    try {
      await patchPortfolioProjectsIdVisibility({ id: project.id }, payload)
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  async function updateProject(project: PortfolioProject) {
    const payload: AddProjectRequest = {
      title: project.title,
      description: project.description,
      repoUrl: project.repoUrl || null,
      liveUrl: project.demoUrl || null,
      imageUrl: project.imageUrl || null,
      techStack: project.techStack,
      role: project.role || null,
      startedDate: project.startDate || null,
      completedDate: project.completedDate || null,
      isVisible: project.isVisible,
    }

    setSaving(true)
    setError('')
    try {
      await putPortfolioProjectsId({ id: project.id }, payload)
      await refreshPortfolio()
    } catch (e) {
      setError((e as Error).message || t('editor.autoPopulate.error'))
    } finally {
      setSaving(false)
    }
  }

  if (!user || loading || !portfolioState) {
    return (
      <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-6 animate-pulse'>
        <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
          <div className='space-y-2'>
            <div className='h-4 w-28 rounded bg-muted' />
            <div className='h-9 w-72 rounded bg-muted' />
            <div className='h-4 w-full max-w-2xl rounded bg-muted' />
          </div>
          <div className='flex flex-col sm:flex-row gap-3 w-full md:w-auto'>
            <div className='h-11 w-full sm:w-48 rounded-xl bg-muted' />
            <div className='h-11 w-full sm:w-44 rounded-xl bg-muted' />
          </div>
        </div>
        <section className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5'>
            <div className='space-y-2'>
              <div className='h-6 w-40 rounded bg-muted' />
              <div className='h-4 w-72 rounded bg-muted' />
            </div>
            <div className='grid gap-4 md:grid-cols-2'>
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className='space-y-2'>
                  <div className='h-4 w-24 rounded bg-muted' />
                  <div className='h-12 rounded-xl bg-muted' />
                </div>
              ))}
            </div>
            <div className='h-32 rounded-xl bg-muted' />
          </div>
          <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-3'>
            <div className='h-6 w-32 rounded bg-muted' />
            <div className='h-4 w-full rounded bg-muted' />
            <div className='h-24 rounded-2xl bg-muted' />
          </div>
        </section>
      </div>
    )
  }

  const portfolio = portfolioState
  const visibleCertificateCount = portfolio.certificates.filter((item) => item.isVisible).length
  const visibleProjectCount = portfolio.projects.filter((item) => item.isVisible).length
  const skillSourceCounts = portfolio.overview.skills.reduce(
    (acc, skill) => {
      const source = getSkillSourceLabel(portfolio.overview.skillSources?.[normalizeSkillKey(skill)])
      acc[source] += 1
      return acc
    },
    { backend: 0, 'jd-inferred': 0, manual: 0 }
  )

  return (
    <div className='max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 sm:py-10 space-y-8'>
      <div className='flex flex-col gap-4 md:flex-row md:items-end md:justify-between'>
        <div>
          <p className='text-xs font-semibold tracking-widest uppercase text-primary'>{t('editor.badge')}</p>
          <h1 className='text-3xl font-black text-foreground tracking-tight mt-2'>{t('editor.title')}</h1>
          <p className='text-muted-foreground mt-2 max-w-2xl'>{t('editor.subtitle')}</p>
        </div>
        <div className='flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={() => void handleAutoPopulate()}
            disabled={loadingAutoPopulate || saving}
            className='px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-bold shadow-md shadow-primary/20 hover:opacity-90 disabled:opacity-50 transition-all'
          >
            {loadingAutoPopulate ? t('editor.autoPopulate.loading') : t('editor.autoPopulate.cta')}
          </button>
          <a
            href={publicUrl}
            className={cn(
              'px-5 py-2.5 rounded-xl border border-border text-sm font-bold transition-colors',
              publicUrl ? 'text-foreground hover:bg-muted' : 'pointer-events-none opacity-50 text-muted-foreground'
            )}
          >
            {t('editor.viewPublic')}
          </a>
        </div>
      </div>

      {error ? <div className='rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive'>{error}</div> : null}
      {success ? <div className='rounded-xl border border-primary/20 bg-primary/10 px-4 py-3 text-sm text-primary'>{success}</div> : null}

      <section className='grid gap-6 lg:grid-cols-[1.3fr_0.7fr]'>
        <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('editor.overview.title')}</h2>
            <p className='text-sm text-muted-foreground mt-1'>{t('editor.overview.subtitle')}</p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <label className='space-y-2 text-sm font-medium text-foreground'>
              <span>{t('editor.overview.fullName')}</span>
              <input value={portfolio.overview.fullName} onChange={(e) => updateOverviewField('fullName', e.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            </label>
            <label className='space-y-2 text-sm font-medium text-foreground'>
              <span>{t('editor.overview.slug')}</span>
              <input value={portfolio.overview.slug} onChange={(e) => updateOverviewField('slug', e.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            </label>
          </div>

          <label className='space-y-2 text-sm font-medium text-foreground block'>
            <span>{t('editor.overview.headline')}</span>
            <input value={portfolio.overview.headline} onChange={(e) => updateOverviewField('headline', e.target.value)} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
          </label>

          <label className='space-y-2 text-sm font-medium text-foreground block'>
            <span>{t('editor.overview.bio')}</span>
            <textarea value={portfolio.overview.bio} onChange={(e) => updateOverviewField('bio', e.target.value)} rows={5} className='w-full rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none' />
          </label>

          <div className='grid gap-3 md:grid-cols-2'>
            <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
              <input type='checkbox' checked={portfolio.isPublic} onChange={(e) => patchLocal({ ...portfolio, isPublic: e.target.checked })} />
              {t('editor.overview.visibility.publicPortfolio')}
            </label>
            <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
              <input type='checkbox' checked={portfolio.showCompletedSkills} onChange={(e) => patchLocal({ ...portfolio, showCompletedSkills: e.target.checked })} />
              {t('editor.overview.visibility.completedSkills')}
            </label>
            <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
              <input type='checkbox' checked={portfolio.showCertificates} onChange={(e) => patchLocal({ ...portfolio, showCertificates: e.target.checked })} />
              {t('editor.overview.visibility.certificates')}
            </label>
            <label className='flex items-center gap-3 rounded-xl border border-border bg-muted/10 px-4 py-3 text-sm font-medium text-foreground'>
              <input type='checkbox' checked={portfolio.showProjects} onChange={(e) => patchLocal({ ...portfolio, showProjects: e.target.checked })} />
              {t('editor.overview.visibility.projects')}
            </label>
          </div>

          <div className='rounded-2xl border border-border bg-muted/20 p-4'>
            <h3 className='text-sm font-bold text-foreground'>{t('editor.overview.sourceSummaryTitle')}</h3>
            <p className='mt-1 text-sm text-muted-foreground'>{t('editor.overview.sourceSummarySubtitle')}</p>
            <div className='mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3'>
              <div className='rounded-xl border border-border bg-background px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.overview.sourceCanonical')}</p>
                <p className='mt-2 text-lg font-bold text-foreground'>{skillSourceCounts.backend}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{t('editor.overview.sourceCanonicalCount')}</p>
              </div>
              <div className='rounded-xl border border-border bg-background px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.overview.sourceJd')}</p>
                <p className='mt-2 text-lg font-bold text-foreground'>{skillSourceCounts['jd-inferred']}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{t('editor.overview.sourceJdCount')}</p>
              </div>
              <div className='rounded-xl border border-border bg-background px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.overview.sourceProfile')}</p>
                <p className='mt-2 text-lg font-bold text-foreground'>{skillSourceCounts.manual}</p>
                <p className='mt-1 text-xs text-muted-foreground'>{t('editor.overview.sourceManualCount')}</p>
              </div>
              <div className='rounded-xl border border-dashed border-border bg-background px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.overview.sourceExternalPending')}</p>
                <p className='mt-2 text-sm font-semibold text-muted-foreground'>{t('editor.overview.pending')}</p>
              </div>
              <div className='rounded-xl border border-dashed border-border bg-background px-4 py-3'>
                <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.overview.sourceRoadmapPending')}</p>
                <p className='mt-2 text-sm font-semibold text-muted-foreground'>{t('editor.overview.pending')}</p>
              </div>
            </div>
            <p className='mt-3 text-xs text-muted-foreground'>{t('editor.overview.sourceDisclosure')}</p>
          </div>

          <div className='flex justify-end'>
            <button type='button' disabled={saving} onClick={() => void saveOverview(portfolio)} className='rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90 disabled:opacity-50'>
              {saving ? t('editor.autoPopulate.loading') : t('editor.actions.save')}
            </button>
          </div>

          <div className='space-y-3'>
            <div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
              <p className='text-sm font-medium text-foreground'>{t('editor.overview.skills')}</p>
              <div className='flex flex-col sm:flex-row gap-2 w-full md:w-auto'>
                <input value={newSkillInput} onChange={(e) => setNewSkillInput(e.target.value)} placeholder={t('editor.overview.skillPlaceholder')} className='w-full sm:w-52 rounded-xl border border-border bg-background px-4 py-2.5 text-sm outline-none focus:border-primary' />
                <button type='button' onClick={addSkill} className='rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground'>
                  {t('editor.overview.addSkill')}
                </button>
              </div>
            </div>
            <div className='flex flex-wrap gap-2'>
              {portfolio.overview.skills.length === 0 ? (
                <div className='rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground'>
                  {t('editor.overview.emptySkills')}
                </div>
              ) : (
                portfolio.overview.skills.map((skill) => {
                  const skillSource = getSkillSourceLabel(portfolio.overview.skillSources?.[normalizeSkillKey(skill)])
                  return (
                    <button key={skill} type='button' onClick={() => removeSkill(skill)} className='inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary'>
                      <span>{skill}</span>
                      <span className='rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground'>
                        {t(`editor.overview.skillSource.${skillSource}` as const)}
                      </span>
                    </button>
                  )
                })
              )}
            </div>
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('editor.preview.title')}</h2>
            <p className='mt-1 text-sm text-muted-foreground'>{t('editor.preview.subtitle')}</p>
          </div>
          <div className='rounded-2xl border border-border bg-muted/20 p-5'>
            <p className='text-sm font-semibold text-foreground'>{portfolio.overview.fullName}</p>
            <p className='mt-2 text-sm text-muted-foreground'>
              {portfolio.overview.headline || t('editor.preview.headlineFallback')}
            </p>
            <p className='mt-3 text-sm text-muted-foreground'>
              {portfolio.overview.bio || t('editor.preview.bioFallback')}
            </p>
          </div>
          <div className='grid gap-3 sm:grid-cols-2'>
            <div className='rounded-2xl border border-border bg-muted/20 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-foreground'>{t('editor.overview.skills')}</p>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', portfolio.showCompletedSkills ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {portfolio.showCompletedSkills ? t('editor.preview.visibilityVisible') : t('editor.preview.visibilityHidden')}
                </span>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {portfolio.showCompletedSkills
                  ? t('editor.preview.skillsVisibleCount', { count: portfolio.overview.skills.length })
                  : t('editor.preview.skillsHiddenHint')}
              </p>
            </div>
            <div className='rounded-2xl border border-border bg-muted/20 p-4'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-foreground'>{t('editor.certificates.title')}</p>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', portfolio.showCertificates ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {portfolio.showCertificates ? t('editor.preview.visibilityVisible') : t('editor.preview.visibilityHidden')}
                </span>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {portfolio.showCertificates
                  ? t('editor.preview.certificatesVisibleCount', { count: visibleCertificateCount })
                  : t('editor.preview.certificatesHiddenHint')}
              </p>
            </div>
            <div className='rounded-2xl border border-border bg-muted/20 p-4 sm:col-span-2'>
              <div className='flex items-center justify-between gap-3'>
                <p className='text-sm font-semibold text-foreground'>{t('editor.projects.title')}</p>
                <span className={cn('rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider', portfolio.showProjects ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground')}>
                  {portfolio.showProjects ? t('editor.preview.visibilityVisible') : t('editor.preview.visibilityHidden')}
                </span>
              </div>
              <p className='mt-2 text-sm text-muted-foreground'>
                {portfolio.showProjects
                  ? t('editor.preview.projectsVisibleCount', { count: visibleProjectCount })
                  : t('editor.preview.projectsHiddenHint')}
              </p>
            </div>
          </div>
          <div>
            <p className='text-xs font-semibold uppercase tracking-wider text-muted-foreground'>{t('editor.preview.publicUrl')}</p>
            <div className='mt-2 flex items-start gap-2'>
              <p className='min-w-0 flex-1 break-all text-sm text-foreground'>{publicUrl || '—'}</p>
              <button
                type='button'
                disabled={!publicUrl}
                onClick={() => void handleCopyPublicUrl()}
                className='rounded-lg border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted/40 disabled:opacity-50'
              >
                {t('editor.preview.copyUrl')}
              </button>
            </div>
          </div>
          <p className='text-xs text-muted-foreground'>{t('editor.preview.disclosure')}</p>
          <p className='text-xs text-muted-foreground'>
            {formattedUpdatedAt ? t('editor.preview.updatedAt', { date: formattedUpdatedAt }) : ''}
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-2'>
        <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('editor.certificates.title')}</h2>
            <p className='text-sm text-muted-foreground mt-1'>{t('editor.certificates.subtitle')}</p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <input value={certificateDraft.name} onChange={(e) => setCertificateDraft((prev) => ({ ...prev, name: e.target.value }))} placeholder={t('editor.certificates.fields.name')} className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={certificateDraft.issuer} onChange={(e) => setCertificateDraft((prev) => ({ ...prev, issuer: e.target.value }))} placeholder={t('editor.certificates.fields.issuer')} className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={certificateDraft.issueDate} onChange={(e) => setCertificateDraft((prev) => ({ ...prev, issueDate: e.target.value }))} type='date' className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={certificateDraft.expiryDate} onChange={(e) => setCertificateDraft((prev) => ({ ...prev, expiryDate: e.target.value }))} type='date' className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={certificateDraft.credentialUrl} onChange={(e) => setCertificateDraft((prev) => ({ ...prev, credentialUrl: e.target.value }))} placeholder={t('editor.certificates.fields.credentialUrl')} className='md:col-span-2 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
          </div>

          <button type='button' onClick={() => void addCertificate()} className='rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground'>
            {t('editor.certificates.add')}
          </button>

          <div className='space-y-3'>
            {portfolio.certificates.length === 0 ? (
              <div className='rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground'>{t('editor.certificates.empty')}</div>
            ) : (
              portfolio.certificates.map((certificate) => (
                <div key={certificate.id} className='rounded-xl border border-border p-4 flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-semibold text-foreground'>{certificate.name}</p>
                    <p className='text-sm text-muted-foreground'>{certificate.issuer}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button type='button' onClick={() => void toggleCertificateVisibility(certificate)} className='text-xs font-semibold text-primary'>
                      {certificate.isVisible ? t('editor.actions.hide') : t('editor.actions.show')}
                    </button>
                    <button type='button' onClick={() => void updateCertificate(certificate)} className='text-xs font-semibold text-foreground'>
                      {t('editor.actions.saveItem')}
                    </button>
                    <button type='button' onClick={() => void deleteCertificate(certificate.id)} className='text-sm font-semibold text-destructive'>
                      {t('editor.actions.delete')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className='rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5'>
          <div>
            <h2 className='text-xl font-bold text-foreground'>{t('editor.projects.title')}</h2>
            <p className='text-sm text-muted-foreground mt-1'>{t('editor.projects.subtitle')}</p>
          </div>

          <div className='grid gap-4 md:grid-cols-2'>
            <input value={projectDraft.title} onChange={(e) => setProjectDraft((prev) => ({ ...prev, title: e.target.value }))} placeholder={t('editor.projects.fields.title')} className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={projectDraft.startDate} onChange={(e) => setProjectDraft((prev) => ({ ...prev, startDate: e.target.value }))} type='date' className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <textarea value={projectDraft.description} onChange={(e) => setProjectDraft((prev) => ({ ...prev, description: e.target.value }))} placeholder={t('editor.projects.fields.description')} rows={4} className='md:col-span-2 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary resize-none' />
            <input value={projectTechInput} onChange={(e) => setProjectTechInput(e.target.value)} placeholder={t('editor.projects.fields.techStack')} className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={projectDraft.demoUrl} onChange={(e) => setProjectDraft((prev) => ({ ...prev, demoUrl: e.target.value }))} placeholder={t('editor.projects.fields.demoUrl')} className='rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
            <input value={projectDraft.repoUrl} onChange={(e) => setProjectDraft((prev) => ({ ...prev, repoUrl: e.target.value }))} placeholder={t('editor.projects.fields.repoUrl')} className='md:col-span-2 rounded-xl border border-border bg-background px-4 py-3 outline-none focus:border-primary' />
          </div>

          <button type='button' onClick={() => void addProject()} className='rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground'>
            {t('editor.projects.add')}
          </button>

          <div className='space-y-3'>
            {portfolio.projects.length === 0 ? (
              <div className='rounded-xl border border-dashed border-border px-4 py-5 text-sm text-muted-foreground'>{t('editor.projects.empty')}</div>
            ) : (
              portfolio.projects.map((project) => (
                <div key={project.id} className='rounded-xl border border-border p-4 flex items-start justify-between gap-4'>
                  <div>
                    <p className='font-semibold text-foreground'>{project.title}</p>
                    <p className='text-sm text-muted-foreground'>{project.description}</p>
                  </div>
                  <div className='flex items-center gap-2'>
                    <button type='button' onClick={() => void toggleProjectVisibility(project)} className='text-xs font-semibold text-primary'>
                      {project.isVisible ? t('editor.actions.hide') : t('editor.actions.show')}
                    </button>
                    <button type='button' onClick={() => void updateProject(project)} className='text-xs font-semibold text-foreground'>
                      {t('editor.actions.saveItem')}
                    </button>
                    <button type='button' onClick={() => void deleteProject(project.id)} className='text-sm font-semibold text-destructive'>
                      {t('editor.actions.delete')}
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  )
}
