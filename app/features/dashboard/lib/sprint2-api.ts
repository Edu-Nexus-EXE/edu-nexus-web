import { useEffect, useMemo, useState } from 'react'

import { getRoadmapsId, getRoadmapNodesNodeIdResources, getUsersMeRoadmaps, patchRoadmapNodesNodeIdStatus, patchRoadmapsIdKeep, postRoadmapsIdRegenerate } from '~/api/operations/roadmaps/roadmaps'
import { getJdSubmissionsJdIdGapAnalysis, postJdSubmissionsJdIdGapAnalysis } from '~/api/operations/gap-analysis/gap-analysis'
import { getCareerTracks, getCareerTracksId, postCareerTracks, putCareerTracksId, deleteCareerTracksId, postCareerTracksIdJds, deleteCareerTracksIdJdsJdId } from '~/api/operations/career-tracks/career-tracks'
import { getUsersMe } from '~/api/operations/users/users'
import type { AuthUser } from '~/shared/lib/auth-session'

export type LoadState<T> = {
  data: T | null
  loading: boolean
  error: string | null
}

export type SubscriptionState = {
  tierCode: string
  displayName: string
  status: string
  expiresAt: string | null
} | null

export type DashboardStatsState = {
  certificates: string
  studyHours: string
  readiness: string
  classRank: string
}

export type JdRecentItem = {
  id: string
  jobTitle: string
  parseStatus: string
  createdAt?: string
}

export type GapAnalysisSkillStatus = 'missing' | 'upgrade' | 'have'

export type GapAnalysisSkillView = {
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

export type RoadmapNodeView = {
  id: string
  nameKey: string
  subKey?: string
  icon: string
  status: 'completed' | 'active' | 'future'
}

export type RoadmapResourceView = {
  titleKey: string
  descKey: string
  icon: string
  iconBg: string
  iconColor: string
  sponsored?: boolean
}

export type RoadmapView = {
  id: string
  title: string
  progress: number
  isOutdated: boolean
  nodes: RoadmapNodeView[]
  resources: RoadmapResourceView[]
  activeNodeId?: string | null
}

export type CareerTrackView = {
  id: string
  name: string
  description?: string
  jdCount: number
  progress?: number
}

function unwrapData<T>(response: unknown): T | null {
  const data = (response as { data?: unknown })?.data
  return (data ?? null) as T | null
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object'
}

export function toStringValue(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

export function toNumberValue(value: unknown, fallback = 0): number {
  return typeof value === 'number' ? value : fallback
}

export async function loadCurrentUser(): Promise<AuthUser | null> {
  const res = await getUsersMe()
  const data = unwrapData<unknown>(res)
  if (!isObject(data)) return null
  return {
    id: toStringValue(data.id),
    email: toStringValue(data.email),
    fullName: toStringValue(data.fullName),
    role: toStringValue(data.role) === 'admin' ? 'admin' : 'user',
    isSurveyCompleted: Boolean(data.isSurveyCompleted),
    avatarUrl: typeof data.avatarUrl === 'string' ? data.avatarUrl : undefined,
    portfolioUrlSlug: typeof data.portfolioUrlSlug === 'string' ? data.portfolioUrlSlug : undefined,
    subscription: isObject(data.subscription)
      ? {
          tierCode: toStringValue(data.subscription.tierCode, 'free'),
          displayName: toStringValue(data.subscription.displayName, 'Free'),
          status: toStringValue(data.subscription.status, 'active'),
          expiresAt: typeof data.subscription.expiresAt === 'string' ? data.subscription.expiresAt : null,
        }
      : null,
  }
}

export async function loadDashboardRoadmaps(status = 'active'): Promise<LoadState<RoadmapView[]>> {
  try {
    const res = await getUsersMeRoadmaps({ status })
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? ((data as { items: unknown[] }).items)
        : []

    return {
      data: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        const nodes = Array.isArray(raw.nodes)
          ? raw.nodes.map((node, nodeIndex) => {
              const n = isObject(node) ? node : {}
              return {
                id: toStringValue(n.id, `node-${index}-${nodeIndex}`),
                nameKey: toStringValue(n.nameKey, 'roadmap.nodes.javaCore'),
                subKey: typeof n.subKey === 'string' ? n.subKey : undefined,
                icon: toStringValue(n.icon, 'bolt'),
                status: ['completed', 'active', 'future'].includes(toStringValue(n.status))
                  ? (toStringValue(n.status) as RoadmapNodeView['status'])
                  : 'future',
              }
            })
          : []

        const resources = Array.isArray(raw.resources)
          ? raw.resources.map((resource) => {
              const r = isObject(resource) ? resource : {}
              return {
                titleKey: toStringValue(r.titleKey, 'roadmap.docsTitle'),
                descKey: toStringValue(r.descKey, 'roadmap.docsDesc'),
                icon: toStringValue(r.icon, 'description'),
                iconBg: toStringValue(r.iconBg, 'bg-muted/10'),
                iconColor: toStringValue(r.iconColor, 'text-foreground'),
                sponsored: Boolean(r.sponsored),
              }
            })
          : []

        return {
          id: toStringValue(raw.id, `roadmap-${index}`),
          title: toStringValue(raw.title, 'Roadmap'),
          progress: toNumberValue(raw.progress, 0),
          isOutdated: Boolean(raw.isOutdated),
          nodes,
          resources,
          activeNodeId: typeof raw.activeNodeId === 'string' ? raw.activeNodeId : null,
        }
      }),
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load roadmaps' }
  }
}

export async function loadRoadmapById(id: string): Promise<LoadState<RoadmapView>> {
  try {
    const res = await getRoadmapsId({ id })
    const data = unwrapData<unknown>(res)
    if (!isObject(data)) return { data: null, loading: false, error: 'Roadmap not found' }

    return {
      data: {
        id: toStringValue(data.id, id),
        title: toStringValue(data.title, 'Roadmap'),
        progress: toNumberValue(data.progress, 0),
        isOutdated: Boolean(data.isOutdated),
        nodes: Array.isArray(data.nodes)
          ? data.nodes.map((node, nodeIndex) => {
              const n = isObject(node) ? node : {}
              return {
                id: toStringValue(n.id, `node-${nodeIndex}`),
                nameKey: toStringValue(n.nameKey, 'roadmap.nodes.javaCore'),
                subKey: typeof n.subKey === 'string' ? n.subKey : undefined,
                icon: toStringValue(n.icon, 'bolt'),
                status: ['completed', 'active', 'future'].includes(toStringValue(n.status))
                  ? (toStringValue(n.status) as RoadmapNodeView['status'])
                  : 'future',
              }
            })
          : [],
        resources: Array.isArray(data.resources)
          ? data.resources.map((resource) => {
              const r = isObject(resource) ? resource : {}
              return {
                titleKey: toStringValue(r.titleKey, 'roadmap.docsTitle'),
                descKey: toStringValue(r.descKey, 'roadmap.docsDesc'),
                icon: toStringValue(r.icon, 'description'),
                iconBg: toStringValue(r.iconBg, 'bg-muted/10'),
                iconColor: toStringValue(r.iconColor, 'text-foreground'),
                sponsored: Boolean(r.sponsored),
              }
            })
          : [],
        activeNodeId: typeof data.activeNodeId === 'string' ? data.activeNodeId : null,
      },
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load roadmap' }
  }
}

export async function loadGapAnalysis(jdId: string): Promise<LoadState<GapAnalysisSkillView[]>> {
  try {
    const res = await getJdSubmissionsJdIdGapAnalysis({ jdId })
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? ((data as { items: unknown[] }).items)
        : []

    return {
      data: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `skill-${index}`),
          name: toStringValue(raw.name, 'Skill'),
          icon: toStringValue(raw.icon, 'token'),
          status: ['missing', 'upgrade', 'have'].includes(toStringValue(raw.status))
            ? (toStringValue(raw.status) as GapAnalysisSkillView['status'])
            : 'missing',
          current: toStringValue(raw.current, '—'),
          required: toStringValue(raw.required, '—'),
          priorityScore: toNumberValue(raw.priorityScore, 0),
          hasPriority: Boolean(raw.hasPriority),
          reason: toStringValue(raw.reason, ''),
          tags: Array.isArray(raw.tags) ? raw.tags.filter((tag): tag is string => typeof tag === 'string') : [],
        }
      }),
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load gap analysis' }
  }
}

export async function triggerGapAnalysis(jdId: string) {
  return postJdSubmissionsJdIdGapAnalysis({ jdId })
}

export async function triggerRoadmapRegenerate(id: string) {
  return postRoadmapsIdRegenerate({ id })
}

export async function triggerRoadmapKeep(id: string) {
  return patchRoadmapsIdKeep({ id })
}

export async function updateRoadmapNodeStatus(nodeId: string, status: 'completed' | 'active' | 'future') {
  return patchRoadmapNodesNodeIdStatus({ nodeId }, { status })
}

export async function loadRoadmapResources(nodeId: string): Promise<LoadState<RoadmapResourceView[]>> {
  try {
    const res = await getRoadmapNodesNodeIdResources({ nodeId })
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? ((data as { items: unknown[] }).items)
        : []

    return {
      data: items.map((item) => {
        const raw = isObject(item) ? item : {}
        return {
          titleKey: toStringValue(raw.titleKey, 'roadmap.docsTitle'),
          descKey: toStringValue(raw.descKey, 'roadmap.docsDesc'),
          icon: toStringValue(raw.icon, 'description'),
          iconBg: toStringValue(raw.iconBg, 'bg-muted/10'),
          iconColor: toStringValue(raw.iconColor, 'text-foreground'),
          sponsored: Boolean(raw.sponsored),
        }
      }),
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load resources' }
  }
}

export async function loadCareerTracks(): Promise<LoadState<CareerTrackView[]>> {
  try {
    const res = await getCareerTracks()
    const data = unwrapData<unknown>(res)
    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as { items?: unknown[] } | null)?.items)
        ? ((data as { items: unknown[] }).items)
        : []

    return {
      data: items.map((item, index) => {
        const raw = isObject(item) ? item : {}
        return {
          id: toStringValue(raw.id, `track-${index}`),
          name: toStringValue(raw.name, 'Career Track'),
          description: typeof raw.description === 'string' ? raw.description : undefined,
          jdCount: toNumberValue(raw.jdCount, 0),
          progress: typeof raw.progress === 'number' ? raw.progress : undefined,
        }
      }),
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load career tracks' }
  }
}

export async function loadCareerTrackById(id: string): Promise<LoadState<CareerTrackView>> {
  try {
    const res = await getCareerTracksId({ id })
    const data = unwrapData<unknown>(res)
    if (!isObject(data)) return { data: null, loading: false, error: 'Career track not found' }
    return {
      data: {
        id: toStringValue(data.id, id),
        name: toStringValue(data.name, 'Career Track'),
        description: typeof data.description === 'string' ? data.description : undefined,
        jdCount: toNumberValue(data.jdCount, 0),
        progress: typeof data.progress === 'number' ? data.progress : undefined,
      },
      loading: false,
      error: null,
    }
  } catch (error) {
    return { data: null, loading: false, error: (error as Error).message || 'Failed to load career track' }
  }
}

export {
  getUsersMeRoadmaps,
  getRoadmapsId,
  patchRoadmapNodesNodeIdStatus,
  postRoadmapsIdRegenerate,
  patchRoadmapsIdKeep,
  getRoadmapNodesNodeIdResources,
  getJdSubmissionsJdIdGapAnalysis,
  postJdSubmissionsJdIdGapAnalysis,
  getCareerTracks,
  getCareerTracksId,
  postCareerTracks,
  putCareerTracksId,
  deleteCareerTracksId,
  postCareerTracksIdJds,
  deleteCareerTracksIdJdsJdId,
}
