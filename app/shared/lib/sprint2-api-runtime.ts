import {
  getJdSubmissionsJdIdGapAnalysis,
  postJdSubmissionsJdIdGapAnalysis
} from '~/api/operations/gap-analysis/gap-analysis'
import {
  getRoadmapNodesNodeIdResources,
  getRoadmapsId,
  getUsersMeRoadmaps,
  patchRoadmapNodesNodeIdStatus,
  patchRoadmapsIdArchive,
  patchRoadmapsIdKeep,
  postJdSubmissionsJdIdRoadmaps,
  postRoadmapsIdRegenerate
} from '~/api/operations/roadmaps/roadmaps'
import { getCareerTracks, getCareerTracksId } from '~/api/operations/career-tracks/career-tracks'
import type { GetJdSubmissionsJdIdGapAnalysisParams, GetUsersMeRoadmapsParams } from '~/api/model'

export function postGapAnalysisRuntime({ jdId }: { jdId: string }) {
  return postJdSubmissionsJdIdGapAnalysis({ jdId })
}

export function getGapAnalysisRuntime({ jdId, all }: { jdId: string; all?: boolean }) {
  const params: GetJdSubmissionsJdIdGapAnalysisParams | undefined = all === undefined ? undefined : { all }
  return getJdSubmissionsJdIdGapAnalysis({ jdId }, params)
}

export function postRoadmapRuntime({ jdId }: { jdId: string }) {
  return postJdSubmissionsJdIdRoadmaps({ jdId })
}

export function getUserRoadmapsRuntime(filters?: { status?: string; jdId?: string }) {
  const params: GetUsersMeRoadmapsParams | undefined = filters?.status ? { status: filters.status } : undefined
  return getUsersMeRoadmaps(params)
}

export function getRoadmapRuntime({ id }: { id: string }) {
  return getRoadmapsId({ id })
}

export function patchRoadmapNodeStatusRuntime({ nodeId, status }: { nodeId: string; status: string }) {
  return patchRoadmapNodesNodeIdStatus({ nodeId }, { nodeId, status })
}

export function patchRoadmapArchiveRuntime({ id }: { id: string }) {
  return patchRoadmapsIdArchive({ id })
}

export function postRoadmapRegenerateRuntime({ id }: { id: string }) {
  return postRoadmapsIdRegenerate({ id })
}

export function patchRoadmapKeepRuntime({ id }: { id: string }) {
  return patchRoadmapsIdKeep({ id })
}

export function getRoadmapNodeResourcesRuntime({ nodeId }: { nodeId: string }) {
  return getRoadmapNodesNodeIdResources({ nodeId })
}

export function getCareerTracksRuntime() {
  return getCareerTracks()
}

export function getCareerTrackRuntime({ id }: { id: string }) {
  return getCareerTracksId({ id })
}
