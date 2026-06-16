export type GapAnalysisSkillStatus = 'missing' | 'upgrade' | 'have'

export interface GapAnalysisSkill {
  id: string
  name: string
  icon: string
  status: GapAnalysisSkillStatus
  current: string
  required: string
  priorityScore: number
  hasPriority: boolean
  reason: string
  tags: string[]
}

/**
 * Fallback mock data used when API returns no data.
 * The actual UI data flows through loadGapAnalysis() in sprint2-api.ts.
 */
export function getGapAnalysisSkills(
  t: (key: string, options?: Record<string, unknown>) => string
): GapAnalysisSkill[] {
  return [
    {
      id: 'docker',
      name: 'Docker',
      icon: 'token',
      status: 'missing',
      current: t('learningPath.gapAnalysis.none', { ns: 'dashboard' }),
      required: 'Inter',
      priorityScore: 8,
      hasPriority: true,
      reason: t('learningPath.gapAnalysis.dockerDesc', { ns: 'dashboard' }),
      tags: ['Containerization', 'Microservices']
    },
    {
      id: 'cicd',
      name: 'CI/CD',
      icon: 'alt_route',
      status: 'missing',
      current: t('learningPath.gapAnalysis.none', { ns: 'dashboard' }),
      required: 'Basic',
      priorityScore: 7,
      hasPriority: true,
      reason: t('learningPath.gapAnalysis.cicdDesc', { ns: 'dashboard' }),
      tags: ['GitHub Actions', 'Jenkins']
    },
    {
      id: 'sql',
      name: 'SQL',
      icon: 'database',
      status: 'upgrade',
      current: 'Basic',
      required: 'Inter',
      priorityScore: 6,
      hasPriority: true,
      reason: t('learningPath.gapAnalysis.sqlDesc', { ns: 'dashboard' }),
      tags: ['PostgreSQL', 'Query Tuning']
    },
    {
      id: 'java_oop',
      name: 'Java OOP',
      icon: 'code',
      status: 'have',
      current: 'Inter',
      required: 'Inter',
      priorityScore: 0,
      hasPriority: false,
      reason: t('learningPath.gapAnalysis.javaOopDesc', { ns: 'dashboard' }),
      tags: ['Inheritance', 'Design Patterns']
    }
  ]
}
