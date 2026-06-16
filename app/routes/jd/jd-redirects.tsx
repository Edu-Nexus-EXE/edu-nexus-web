import { useEffect } from 'react'
import { Navigate, useParams } from 'react-router'

export function JdNewRedirect() {
  useEffect(() => {
    /* component never renders — redirect only */
  }, [])
  return <Navigate to='/dashboard/jd/new' replace />
}

export function JdDetailRedirect() {
  const { jdId } = useParams<{ jdId: string }>()
  return <Navigate to={`/dashboard/jd/${encodeURIComponent(jdId ?? '')}`} replace />
}

export function JdAssessmentRedirect() {
  const { jdId } = useParams<{ jdId: string }>()
  return <Navigate to={`/dashboard/jd/${encodeURIComponent(jdId ?? '')}/assessment`} replace />
}

export function JdAssessmentResultsRedirect() {
  const { jdId } = useParams<{ jdId: string }>()
  return <Navigate to={`/dashboard/jd/${encodeURIComponent(jdId ?? '')}/assessment/results`} replace />
}
