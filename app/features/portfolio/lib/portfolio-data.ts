export type PortfolioSkillSource = 'backend' | 'jd-inferred' | 'manual'

export type PortfolioOverview = {
  fullName: string
  headline: string
  bio: string
  slug: string
  skills: string[]
  skillSources?: Partial<Record<string, PortfolioSkillSource>>
}

export type PortfolioCertificate = {
  id: string
  name: string
  issuer: string
  issueDate: string
  expiryDate: string
  credentialUrl: string
  fileUrl: string
  isVisible: boolean
}

export type PortfolioProject = {
  id: string
  title: string
  description: string
  techStack: string[]
  demoUrl: string
  repoUrl: string
  role: string
  startDate: string
  completedDate: string
  imageUrl: string
  isVisible: boolean
}

export type PortfolioDocument = {
  overview: PortfolioOverview
  certificates: PortfolioCertificate[]
  projects: PortfolioProject[]
  updatedAt: string
  isPublic: boolean
  showCompletedSkills: boolean
  showCertificates: boolean
  showProjects: boolean
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function toBooleanValue(value: unknown, fallback = false): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function toStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
    : []
}

export function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function splitCommaTags(value: string) {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
}

export function createDefaultPortfolio(fullName: string, slug: string): PortfolioDocument {
  return {
    overview: {
      fullName,
      headline: '',
      bio: '',
      slug: slugify(slug) || 'portfolio',
      skills: [],
      skillSources: {}
    },
    certificates: [],
    projects: [],
    updatedAt: new Date().toISOString(),
    isPublic: false,
    showCompletedSkills: true,
    showCertificates: true,
    showProjects: true
  }
}

export function parsePortfolio(response: unknown, fallbackFullName: string, fallbackSlug: string): PortfolioDocument {
  const data = (response as { data?: unknown })?.data
  const root = isObject(data) ? data : {}

  const certificates = Array.isArray(root.certificates)
    ? root.certificates.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `certificate-${index + 1}`),
          name: toStringValue(raw.name),
          issuer: toStringValue(raw.issuer),
          issueDate: toStringValue(raw.issuedDate || raw.issueDate),
          expiryDate: toStringValue(raw.expiresDate || raw.expiryDate),
          credentialUrl: toStringValue(raw.credentialUrl),
          fileUrl: toStringValue(raw.fileUrl),
          isVisible: toBooleanValue(raw.isVisible, true)
        }
      })
    : []

  const projects = Array.isArray(root.projects)
    ? root.projects.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `project-${index + 1}`),
          title: toStringValue(raw.title),
          description: toStringValue(raw.description),
          techStack: toStringArray(raw.techStack),
          demoUrl: toStringValue(raw.liveUrl || raw.demoUrl),
          repoUrl: toStringValue(raw.repoUrl),
          role: toStringValue(raw.role),
          startDate: toStringValue(raw.startedDate || raw.startDate),
          completedDate: toStringValue(raw.completedDate),
          imageUrl: toStringValue(raw.imageUrl),
          isVisible: toBooleanValue(raw.isVisible, true)
        }
      })
    : []

  const completedSkills = Array.isArray(root.completedSkills)
    ? root.completedSkills
    : Array.isArray(root.skills)
      ? root.skills
      : []
  const parsedSkills = completedSkills
    .map((item) => {
      if (typeof item === 'string') return item.trim()
      if (isObject(item)) return toStringValue(item.name || item.skillName).trim()
      return ''
    })
    .filter(Boolean)
  const skillSources = Object.fromEntries(parsedSkills.map((skill) => [skill, 'backend' as const]))

  return {
    overview: {
      fullName: toStringValue(root.fullName, fallbackFullName),
      headline: toStringValue(root.headline),
      bio: toStringValue(root.bio),
      slug: slugify(toStringValue(root.slug || root.portfolioUrlSlug, fallbackSlug)) || 'portfolio',
      skills: parsedSkills,
      skillSources
    },
    certificates,
    projects,
    updatedAt: toStringValue(root.updatedAt, new Date().toISOString()),
    isPublic: toBooleanValue(root.isPublic, false),
    showCompletedSkills: toBooleanValue(root.showCompletedSkills, true),
    showCertificates: toBooleanValue(root.showCertificates, true),
    showProjects: toBooleanValue(root.showProjects, true)
  }
}

export function parsePublicPortfolio(response: unknown, slug: string): PortfolioDocument {
  return parsePortfolio(response, 'Edu Nexus Learner', slug)
}
